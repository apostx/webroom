'use strict';

const events = require('events');

class SocketUnifiedAdapter extends events.EventEmitter
{
    /**
     * @param {import('net').Socket} socket 
     */
    constructor(socket)
    {
        super();

        // Bind
        this._onClose = this._onClose.bind(this);
        this._onReady = this._onReady.bind(this);
        this._parseData = this._parseData.bind(this);
        this._onError = this._onError.bind(this);

        this._socket = socket;
        this._incomingBuffer = '';

        this._socket.on('close', this._onClose);
        this._socket.on('ready', this._onReady);
        this._socket.on('data', this._parseData);
        this._socket.on('error', this._onError);
    }

    close()
    {
        this._socket.end();
    }

    /**
     * @param {string} message 
     */
    send(message)
    {
        const messageLength = String.fromCharCode(message.length);
        this._socket.write(`${messageLength}${message}`);
    }

    _onClose()
    {
        this.emit('close');
    }

    _onReady()
    {
        this.emit('open');
    }

    /**
     * @param {string} data 
     */
    _parseData(data)
    {
        this._incomingBuffer += data;
        
        let message = null;
        let messageLength = this._incomingBuffer.charCodeAt(0);

        while(messageLength < this._incomingBuffer.length)
        {
            message = this._incomingBuffer.substr(1, messageLength);
            this._incomingBuffer = this._incomingBuffer.substr(messageLength + 1);

            this.emit('message', message);

            messageLength = this._incomingBuffer.charCodeAt(0);
        }
    }

    /**
     * @param {Error} error 
     */
    _onError(error)
    {
        this.emit('error', error);
    }
}

module.exports = SocketUnifiedAdapter;