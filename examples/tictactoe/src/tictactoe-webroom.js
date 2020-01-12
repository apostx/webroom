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

        socket.once('close', this._onSocketClose.bind(this, socket));

        if (this._userList.length == this.USER_LIMIT) this._startGame();
    }

    _onSocketClose(socket)
    {
        const isGameStarted = this._userList.length == this.USER_LIMIT;

        const socketIndex = this._userList.indexOf(socket);
        this._userList.splice(socketIndex, 1);

        if (isGameStarted) this.destroy();
    }

    _startGame()
    {
        this._currentUserIndex = Math.floor(Math.random() * this.USER_LIMIT);

        const player1 = this._userList[this._currentUserIndex];
        const player2 = this._userList[(this._currentUserIndex + 1) % this.USER_LIMIT];

        this._logic.init(player1, player2);

        this._nextTurn();
    }

    _nextTurn()
    {
        for (let i = 0; i < this.USER_LIMIT; ++i)
        {
            const socket = this._userList[i];
            const isCurrentPlayerTurn = i == this._currentUserIndex;

            if (isCurrentPlayerTurn) socket.once('message', this._onMarkMessage.bind(this));

            socket.send(JSON.stringify({
                header: 'nextTurn',
                data: {
                    isYours: isCurrentPlayerTurn
                }
            }));
        }
    }

    _validateTableIndex(index)
    {
        return Number.isInteger(index) && 0 <= index && index < this._logic.size; 
    }

    _parseMarkMessage(message)
    {
        const messageObj = JSON.parse(message);

        if (messageObj.header != 'mark') throw new Error('Invalid header');
        if (!messageObj.data) throw new Error('Missing data object');
        if (!this._validateTableIndex(messageObj.data.colIndex)) throw new Error('Invalid colIndex');
        if (!this._validateTableIndex(messageObj.data.rowIndex)) throw new Error('Invalid rowIndex');

        return messageObj;
    }

    _onMarkMessage(message)
    {
        let messageObj = null;
        let status = null;
        try
        {
            messageObj = this._parseMarkMessage(message);
            status = this._logic.mark(messageObj.data.colIndex, messageObj.data.rowIndex);
        }
        catch(error)
        {
            console.log(error);
            this.destroy();
            return;
        }

        for (let i = 0; i < this._userList.length; ++i)
        {
            const socket = this._userList[i];

            socket.send(JSON.stringify({
                header: 'mark',
                data: {
                    isYou: i == this._currentUserIndex,
                    colIndex: messageObj.data.colIndex,
                    rowIndex: messageObj.data.rowIndex,
                    status: status
                }
            }));
        }

        if(status == TicTacToeLogic.Status.IN_PROGRESS)
        {
            this._currentUserIndex = (this._currentUserIndex + 1) % this.USER_LIMIT;
            this._nextTurn();
        }
        else
        {
            this.destroy();
        }
    }

    destroy()
    {
        for (let i = 0; i < this._userList.length; ++i) this._userList[i].close();
        super.destroy();
    }
}

module.exports = TicTacToeWebRoom;