'use strict';

const WebRoom = require('../..');
const WebSocket = require("ws");

class TicTacToeWebRoom extends WebRoom.AbstractWebRoom
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

        socket.on("message", this._onMessage.bind(this));

        /**
         * TODO
         * listening the disconnected socket
         * -before the game - should check the room is empty and destroy the room if it is
         * -during the game - giving the point for the player
         */
    }

    _onMessage(message)
    {
        /*for (var i = 0; i < this._userList.length; ++i)
        {
            this._userList[i].send(message);
        }*/
    }
}

module.exports = TicTacToeWebRoom;