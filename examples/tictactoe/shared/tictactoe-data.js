'use strict';

class TicTacToeData
{
    get Status()
    {
        return Status;
    }

    get size()
    {
        return this._size;
    }

    get player1()
    {
        return this._player1;
    }

    get player2()
    {
        return this._player2;
    }

    get currentPlayer()
    {
        return this._currentPlayer;
    }

    get markedFieldNum()
    {
        return this._markedFieldNum;
    }

    get table()
    {
        return this._table;
    }

    get status()
    {
        return this._status;
    }

    constructor()
    {
        this._size = null;
        this._player1 = null;
        this._player2 = null;
        this._currentPlayer = null;
        this._markedFieldNum = null;
        this._table = [];
        this._status = null;
    }

    /**
     * @param {number} size 
     * @param {*} player1 
     * @param {*} player2
     */
    reset(size, player1, player2)
    {
        this._player1 = this._currentPlayer = player1;
        this._player2 = player2;
        this._size = size;
        this._status = Status.IN_PROGRESS;
        this._markedFieldNum = 0;
        this._table.length = 0;
        this._table.length = size * size;

        Promise.resolve(this);
    }

    /**
     * @param {number} markedColIndex 
     * @param {number} markedRowIndex
     * @param {*} nextPlayer 
     * @param {string} status 
     */
    update(markedColIndex, markedRowIndex, nextPlayer, status)
    {
        const index = markedRowIndex * this._size + markedColIndex;

        this._table[index] = this._currentPlayer;
        ++this._markedFieldNum;

        this._status = status;
        this._currentPlayer = nextPlayer;

        Promise.resolve(this);
    }
}

class Status
{
    static get IN_PROGRESS() {return 'in_progress';}
    static get WIN() {return 'win';}
    static get DRAW() {return 'draw';}
}

if (typeof module === 'object' && module.exports) module.exports = TicTacToeData;