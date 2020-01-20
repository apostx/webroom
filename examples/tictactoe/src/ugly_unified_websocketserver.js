'use strict';

const url = require('url');
const querystring = require('querystring');
const events = require('events');
const WebRoom = require('../../..');

/**
 * @typedef {import('net').Socket} Socket
 * @typedef {import('http').IncomingMessage} IncomingMessage
 */

class UglyUnifiedWebSocketServer extends events.EventEmitter
{
    constructor(wsServer)
    {
        super();

        // Bind
        this._handleUpgrade = this._handleUpgrade.bind(this);
        this._handleUpgradeEnd = this._handleUpgradeEnd.bind(this);

        this._wsServer = wsServer;
    }

    /**
     * @param {events.EventEmitter} httpServer 
     */
    setHttpServer(httpServer)
    {
        this._httpServer = httpServer;
        this._httpServer.on('upgrade', this._handleUpgrade);
    }

    /**
     * Handling incoming websocket connections
     * 
     * @param {IncomingMessage} request 
     * @param {Socket} socket 
     * @param {Buffer} head
     */
    _handleUpgrade(request, socket, head)
    {
        const urlObj = url.parse(request.url);
        const query = querystring.decode(urlObj.query);

        if (urlObj.pathname == '/') this._wsServer.handleUpgrade(request, socket, head, this._handleUpgradeEnd);
    }

    _handleUpgradeEnd(webSocket)
    {
        const unifiedSocket = new WebRoom.WebSocketUnifiedAdapter(webSocket);
        this.emit('connection', unifiedSocket);
    }
}

module.exports = UglyUnifiedWebSocketServer;