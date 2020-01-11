'use strict';

const WebRoom = require('../..');
const WebSocket = require('ws');

class EchoWebRoom extends WebRoom.AbstractWebRoom
{
    constructor()
    {
        super();

        /** @type WebSocket[] */
        this._userList = [];
    }

    /**
     * @param {WebSocket} socket 
     */
    join(socket)
    {
        this._userList.push(socket);

        socket.on('message', this._onMessage.bind(this));
    }

    _onMessage(message)
    {
        for (var i = 0; i < this._userList.length; ++i)
        {
            this._userList[i].send(message);
        }
    }
}

module.exports = EchoWebRoom;