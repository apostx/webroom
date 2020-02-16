'use strict';

const WebRoom = require('../../..');
const TicTacToeLogic = require('../shared/tictactoe-logic');

/**
 * @typedef {import('http').IncomingMessage} IncomingMessage
 * @typedef {import('../../../lib/abstract-webroom').UnifiedSocket} UnifiedSocket
 * @typedef {import('../../../lib/unifiedsocket-eventtarget')} UnifiedSocketEventTarget
 */

class TicTacToeWebRoom extends WebRoom.AbstractWebRoom
{
    get USER_LIMIT()
    {
        return 2;
    }

    get isHidden()
    {
        return this._playerList.length >= this.USER_LIMIT;
    }

    constructor()
    {
        super();

        //Bind
        this._onMarkMessage = this._onMarkMessage.bind(this);

        /** @type WebRoom.UnifiedSocketEventTarget[] */
        this._playerList = [];
        this._currentUserIndex = 0;

        this._logic = new TicTacToeLogic();
    }

    /**
     * @param {UnifiedSocket} socket
     * @returns {boolean}
     */
    canJoin(socket)
    {
        return !this.isHidden;
    }

    /**
     * @param {UnifiedSocket} socket
     */
    join(socket)
    {
        const socketEventTarget = new WebRoom.UnifiedSocketEventTarget(socket);

        this._playerList.push(socketEventTarget);

        const onConnectionEnd = this._onConnectionEnd.bind(this, socketEventTarget);

        socketEventTarget.onClose = onConnectionEnd;
        socketEventTarget.onError = onConnectionEnd;

        if (this._playerList.length == this.USER_LIMIT) this._startGame();
    }

    /**
     * @param {WebRoom.UnifiedSocketEventTarget} socketEventTarget 
     */
    _onConnectionEnd(socketEventTarget)
    {
        const isGameStarted = this._playerList.length == this.USER_LIMIT;

        const socketIndex = this._playerList.indexOf(socketEventTarget);
        this._playerList.splice(socketIndex, 1);

        if (isGameStarted) this.destroy();
    }

    _startGame()
    {
        this._currentUserIndex = Math.floor(Math.random() * this.USER_LIMIT);

        const player1 = this._playerList[this._currentUserIndex];
        const player2 = this._playerList[(this._currentUserIndex + 1) % this.USER_LIMIT];

        this._logic.init(player1, player2);

        this._nextTurn();
    }

    _nextTurn()
    {
        for (let i = 0; i < this.USER_LIMIT; ++i)
        {
            const socketEventTarget = this._playerList[i];
            const socket = socketEventTarget.target;
            const isCurrentPlayerTurn = i == this._currentUserIndex;

            socketEventTarget.onMessage = isCurrentPlayerTurn ? this._onMarkMessage : null;

            socket.send(JSON.stringify({
                header: 'nextTurn',
                data: {
                    isYours: isCurrentPlayerTurn
                }
            }));
        }
    }

    _parseMarkMessage(message)
    {
        const messageObj = JSON.parse(message);

        if (messageObj.header != 'mark') throw new Error('Invalid header');
        if (!messageObj.data) throw new Error('Missing data object');
        if (!Number.isInteger(messageObj.data.colIndex)) throw new Error('Invalid colIndex type');
        if (!Number.isInteger(messageObj.data.rowIndex)) throw new Error('Invalid rowIndex type');

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

        for (let i = 0; i < this._playerList.length; ++i)
        {
            const socketEventTarget = this._playerList[i];
            const socket = socketEventTarget.target;

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
        for (let i = 0; i < this._playerList.length; ++i)
        {
            const socketEventTarget = this._playerList[i];
            const socket = socketEventTarget.target;
            socketEventTarget.unlink();
            socket.close();
        }
        super.destroy();
    }
}

module.exports = TicTacToeWebRoom;