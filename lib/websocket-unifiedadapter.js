'use strict';

const events = require('events');

/**
 * @typedef {import('ws')} WebSocket
 */

class WebSocketUnifiedAdapter extends events.EventEmitter
{
    /**
     * @param {WebSocket} webSocket 
     */
    constructor(webSocket)
    {
        super();

        // Bind
        this._onMessage = this._onMessage.bind(this);

        this._webSocket = webSocket;

        this._webSocket.on('message', this._onMessage);
        this._webSocket.on('close', this._onClose);
    }

    /**
     * @param {string} message
     */
    _onMessage(message)
    {
        this.emit('data', message);
    }

    _onClose()
    {
        this.emit('end');
    }

    /**
     * @param {string} data
     */
    write(data)
    {
        this._webSocket.send(data);
    }

    end()
    {
        this._webSocket.close();
    }
}

module.exports = WebSocketUnifiedAdapter;