'use strict';

const http = require('http');
const WebRoom = require('../../..');
const WebSocket = require('ws');
const TicTacToeLogic = require('./tictactoe-logic');

class TicTacToeWebRoom extends WebRoom.AbstractWebRoom
{
    get USER_LIMIT()
    {
        return 2;
    }

    get isHidden()
    {
        return this._userList.length >= this.USER_LIMIT;
    }

    constructor()
    {
        super();

        /** @type WebSocket[] */
        this._userList = [];
        this._currentUserIndex = 0;

        this._logic = new TicTacToeLogic();
    }

    /**
     * @param {http.IncomingMessage} request
     */
    validateRequest(request)
    {
        return !this.isHidden;
    }

    /**
     * @param {WebSocket} socket 
     */
    join(socket)
    {
        /**
         * TODO
         * listening the disconnected socket
         * -before the game - should check the room is empty and destroy the room if it is
         * -during the game - giving the point for the player
         */
        this._userList.push(socket);

        if (this._userList.length == this.USER_LIMIT) this._startGame();
    }

    _startGame()
    {
        this._currentUserIndex = Math.floor(Math.random() * this.USER_LIMIT);
        this._nextTurn();
    }

    _nextTurn()
    {
        for (let i = 0; i < this.USER_LIMIT; ++i)
        {
            const socket = this._userList[i];

            socket.once('message', this._onMessage.bind(this));

            socket.send(JSON.stringify({
                header: 'your_turn',
                data: i == this._currentUserIndex
            }));
        }
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