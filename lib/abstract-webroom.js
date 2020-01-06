'use strict';

const events = require('events');
const http = require("http");
const WebSocket = require("ws");

class AbstractWebRoom extends events.EventEmitter
{
    get details()
    {
        return null;
    }

    get isHidden()
    {
        return false;
    }

    constructor()
    {
        super();
    }

    /**
     * @param {http.IncomingMessage} request
     */
    validateRequest(request)
    {
        return true;
    }

    /**
     * @param {WebSocket} socket 
     */
    join(socket) {}

    destroy()
    {
        this.emit("destroy");
    }
}

module.exports = AbstractWebRoom;