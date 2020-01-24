'use strict';

const events = require('events');
const SocketUnifiedAdapter = require('././socket-unifiedadapter');

class SocketServerUnifiedAdapter extends events.EventEmitter
{
    /**
     * @param {import('net').Server} server 
     */
    constructor(server)
    {
        super();

        // Bind
        this._onConnection = this._onConnection.bind(this);

        this._server = server;

        this._server.on('connection', this._onConnection);
    }

    _onConnection(socket)
    {
        const socketUnifiedAdapter = new SocketUnifiedAdapter(socket);

        this.emit('connection', socketUnifiedAdapter);
    }
}

module.exports = SocketServerUnifiedAdapter;