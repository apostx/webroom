'use strict';

class TicTacToeLogic
{
    static get Status()
    {
        return Status;
    }

    static get SIZE()
    {
        return 3;
    }
  
    get size()
    {
        return TicTacToeLogic.SIZE;
    }

    get currentPlayer()
    {
        return this._currentPlayer;
    }

    constructor()
    {
        this._player1 = null;
        this._player2 = null;
        this._currentPlayer = null;
        this._markedFieldNum = 0;
        this._table = new Table(this.size);
        this._status = Status.IN_PROGRESS;
    }

    /**
     * @param {*} player1 
     * @param {*} player2 
     */
    init(player1, player2)
    {
        this._player1 = this._currentPlayer = player1;
        this._player2 = player2;
        this._status = Status.IN_PROGRESS;
        this._markedFieldNum = 0;
        this._table.clear();
    }

    /**
     * @param {number} colIndex 
     * @param {number} rowIndex 
     */
    _validateMark(colIndex, rowIndex)
    {
        if (this._status != Status.IN_PROGRESS)
        {
            throw 'Invalid mark: game is already ended (run the init before the next mark)';
        }

        if (this._table.getField(colIndex, rowIndex) != undefined)
        {
            throw 'Invalid mark: field is already used';
        }

        if (colIndex < 0 || colIndex >= this.size)
        {
            throw 'Invalid mark: colIndex is out of table';
        }

        if (rowIndex < 0 || rowIndex >= this.size)
        {
            throw 'Invalid mark: rowIndex is out of table';
        }
    }

    /**
     * @param {number} colIndex 
     * @param {number} rowIndex 
     */
    mark(colIndex, rowIndex)
    {
        this._validateMark(colIndex, rowIndex);

        this._table.setField(colIndex, rowIndex, this._currentPlayer);
        ++this._markedFieldNum;

        const isWin = this._isWin(colIndex, rowIndex);
        const isFull = this._markedFieldNum >= this.size * this.size;

        if (isWin)
        {
            this._status = Status.WIN;
        }
        else if (isFull)
        {
            this._status = Status.DRAW;
        }
        else
        {
            this._currentPlayer = this._currentPlayer != this._player1 ? this._player1 : this._player2;
        }

        return this._status;
    }

    _isWin(colIndex, rowIndex)
    {
        return this.size <= Math.max(
            this._calculateLineLength(colIndex, rowIndex, 1, 1),
            this._calculateLineLength(colIndex, rowIndex, 1, 0),
            this._calculateLineLength(colIndex, rowIndex, 1, -1),
            this._calculateLineLength(colIndex, rowIndex, 0, -1),
        );
    }

    _calculateLineLength(colIndex, rowIndex, colStep, rowStep)
    {
        return this._calculateDirectionLength(colIndex, rowIndex, colStep, rowStep) + this._calculateDirectionLength(colIndex, rowIndex, -colStep, -rowStep) + 1;
    }

    _calculateDirectionLength(colIndex, rowIndex, colStep, rowStep)
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

class Status
{
    static get IN_PROGRESS() {return 'in_progress';}
    static get WIN() {return 'win';}
    static get DRAW() {return 'draw';}
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