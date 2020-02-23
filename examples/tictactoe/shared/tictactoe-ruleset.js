'use strict';

/**
 * @typedef {import('./tictactoe-data')} TicTacToeData
 * @typedef {{
 *     currentPlayer: any,
 *     status: string
 * }} MarkInfo
 */

class TicTacToeRuleset
{
    /**
     * @param {number} colIndex 
     * @param {number} rowIndex 
     * @param {TicTacToeData} data 
     * 
     * @returns {MarkInfo}
     */
    static mark(colIndex, rowIndex, data)
    {
        TicTacToeRuleset._validateMark(colIndex, rowIndex, data);

        const isWin = TicTacToeRuleset._isWin(colIndex, rowIndex, data);
        const isFull = (data.markedFieldNum + 1) >= data.size * data.size;

        let currentPlayer = data.currentPlayer;
        let status = data.status;
        if (isWin)
        {
            status = data.Status.WIN;
        }
        else if (isFull)
        {
            status = data.Status.DRAW;
        }
        else
        {
            currentPlayer = currentPlayer != data.player1 ? data.player1 : data.player2;
        }

        return {
            currentPlayer: currentPlayer,
            status: status
        };
    }

    /**
     * @param {number} colIndex 
     * @param {number} rowIndex
     * @param {TicTacToeData} data 
     */
    static _validateMark(colIndex, rowIndex, data)
    {
        if (data.status != data.Status.IN_PROGRESS)
        {
            throw 'Invalid mark: game is already ended (run the init before the next mark)';
        }

        const field = data.table[rowIndex * data.size + colIndex];

        if (field != undefined)
        {
            throw 'Invalid mark: field is already used';
        }

        if (colIndex < 0 || colIndex >= data.size)
        {
            throw 'Invalid mark: colIndex is out of table';
        }

        if (rowIndex < 0 || rowIndex >= data.size)
        {
            throw 'Invalid mark: rowIndex is out of table';
        }
    }

    /**
     * 
     * @param {*} colIndex 
     * @param {*} rowIndex 
     * @param {TicTacToeData} data 
     */
    static _isWin(colIndex, rowIndex, data)
    {
        return data.size <= Math.max(
            TicTacToeRuleset._calculateLineLength(colIndex, rowIndex, 1, 1, data),
            TicTacToeRuleset._calculateLineLength(colIndex, rowIndex, 1, 0, data),
            TicTacToeRuleset._calculateLineLength(colIndex, rowIndex, 1, -1, data),
            TicTacToeRuleset._calculateLineLength(colIndex, rowIndex, 0, -1, data),
        );
    }

    /**
     * @param {number} colIndex 
     * @param {number} rowIndex 
     * @param {number} colStep 
     * @param {number} rowStep
     * @param {TicTacToeData} data 
     */
    static _calculateLineLength(colIndex, rowIndex, colStep, rowStep, data)
    {
        return TicTacToeRuleset._calculateDirectionLength(colIndex, rowIndex, colStep, rowStep, data) + TicTacToeRuleset._calculateDirectionLength(colIndex, rowIndex, -colStep, -rowStep, data) + 1;
    }

    /**
     * @param {number} colIndex 
     * @param {number} rowIndex 
     * @param {number} colStep 
     * @param {number} rowStep 
     * @param {TicTacToeData} data 
     */
    static _calculateDirectionLength(colIndex, rowIndex, colStep, rowStep, data)
    {
        let l = 0;
        let i = colIndex + colStep;
        let j = rowIndex + rowStep;

        while(
            i >= 0
            && j >= 0
            && i < data.size
            && j < data.size
            && data.table[j * data.size + i] == data.currentPlayer
        )
        {
            ++l;
            i += colStep;
            j += rowStep;
        }

        return l;
    }
}

if (typeof module === 'object' && module.exports) module.exports = TicTacToeRuleset;