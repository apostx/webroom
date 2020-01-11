'use strict';

class TicTacToeLogic
{
    static get LENGTH()
    {
        return 3;
    }
  
    get length()
    {
        return TicTacToeLogic.LENGTH;
    }

    get currentPlayer()
    {
        return this._currentPlayer;
    }

    constructor(player1, player2)
    {
        this._player1 = null;
        this._player2 = null;
        this._currentPlayer = null;
        this._isEnded = true;
        this._table = new Table(this.length);
    }

    init(player1, player2)
    {
        this._player1 = this._currentPlayer = player1;
        this._player2 = player2;
        this._isEnded = false;
        this._table.clear();
    }

    mark(colIndex, rowIndex)
    {
        if (this._isEnded)
        {
            throw 'Invalid mark: dirty table (run the init before the next mark)';
        }

        if (this._table.getField(colIndex, rowIndex) != undefined)
        {
            throw 'Invalid mark: field is already used';
        }

        this._table.setField(colIndex, rowIndex, this._currentPlayer);

        this._isEnded = this._isWin(colIndex, rowIndex);

        if (!this._isEnded)
        {
            this._currentPlayer = this._currentPlayer != this._player1 ? this._player1 : this._player2;
        }

        return this._isEnded;
    }

    _isWin(colIndex, rowIndex)
    {
        return TicTacToeLogic.LENGTH <= Math.max(
            this.calculateLineLength(colIndex, rowIndex, 1, 1),
            this.calculateLineLength(colIndex, rowIndex, 1, 0),
            this.calculateLineLength(colIndex, rowIndex, 1, -1),
            this.calculateLineLength(colIndex, rowIndex, 0, -1),
        );
    }

    calculateLineLength(colIndex, rowIndex, colStep, rowStep)
    {
        return this.calculateDirectionLength(colIndex, rowIndex, colStep, rowStep) + this.calculateDirectionLength(colIndex, rowIndex, -colStep, -rowStep) + 1;
    }

    calculateDirectionLength(colIndex, rowIndex, colStep, rowStep)
    {
        let l = 0;
        let i = colIndex + colStep;
        let j = rowIndex + rowStep;

        while(
            i >= 0
            && j >= 0
            && i < this._table.size
            && j < this._table.size
            && this._table.getField(i, j) == this.currentPlayer
        )
        {
            ++l;
            i += colStep;
            j += rowStep;
        }

        return l;
    }
}

class Table
{
    constructor(size)
    {
        this._size = size;
        this._fieldList = [];
        this._fieldList.length = size * size;
    }

    get size()
    {
        return this._size;
    }

    setField(colIndex, rowIndex, value)
    {
        this._fieldList[this._getIndex(colIndex, rowIndex)] = value;
    }

    getField(colIndex, rowIndex)
    {
        return this._fieldList[this._getIndex(colIndex, rowIndex)];
    }

    _getIndex(colIndex, rowIndex)
    {
        return rowIndex * this._size + colIndex;
    }

    clear()
    {
        for (let i = 0; i < this._fieldList.length; ++i)
        {
            this._fieldList[i] = undefined;
        }
    }
}

if (typeof module === 'object' && module.exports) module.exports = TicTacToeLogic;