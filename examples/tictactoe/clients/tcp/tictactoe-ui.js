'use strict';

const os = require('os');
const readline = require('readline');
const events = require('events');

class TicTacToeUI extends events.EventEmitter
{
    /**
     * @param {number} size 
     */
    constructor(size)
    {
        super();

        // Bind
        this._onCommand = this._onCommand.bind(this);
        
        const l = size * size;
        
        this._infoText = null;

        this._cellList = [];
        this._cellList.length = l;
        this._playerIndex = 0;
        this._isTableLocked = false;

        this._size = size;

        this._consoleReader = null;
    }

    /**
     * @param {number} colIndex 
     * @param {number} rowIndex 
     */
    setField(colIndex, rowIndex)
    {
        const cellIndex = rowIndex * this._size + colIndex;
        this._cellList[cellIndex] = this._playerIndex == 0 ? 'O' : 'X';;
        this._playerIndex = (this._playerIndex + 1) % 2;
    }

    /**
     * @param {boolean} locked 
     */
    setTableLocked(locked)
    {
        this._isTableLocked = locked;
    }

    /**
     * @param {string} [infoText]
     */
    updateStatusInfo(infoText)
    {
        if(infoText) this._infoText = infoText;

        console.clear();
        const table = this._getTable();
        const statusInfo = this._getStatusInfo(this._infoText);
        const possibleCommands = this._getPossibleCommands();

        process.stdout.write(`${table}${statusInfo}${possibleCommands}Command: `);
    }

    /**
     * @param {string} infoText 
     */
    _getStatusInfo(infoText)
    {
        const verticalOffset = os.EOL;

        return `${verticalOffset}${infoText}${os.EOL}`;
    }

    _getPossibleCommands()
    {
        const verticalOffset = os.EOL;
        const markCommand = this._isTableLocked ? '' : ', mark {column index} {row index}}'

        return `${verticalOffset}Supported commands: exit, restart${markCommand}${os.EOL}`;
    }

    _getTable()
    {
        const verticalOffset = os.EOL.repeat(2);
        const horizontalOffset = ' '.repeat(3);

        let tableString = `${verticalOffset}${horizontalOffset}TABLE${os.EOL}`;

        let colIndex;
        let rowIndex;
        let lineText;
        let cell;

        lineText = `${horizontalOffset}  `;
        for (colIndex = 0; colIndex < this._size; ++colIndex)
        {
            lineText = `${lineText}${colIndex}`;
        }

        tableString = `${tableString}${lineText}${os.EOL}`;

        for (rowIndex = 0; rowIndex < this._size; ++rowIndex)
        {
            lineText = `${horizontalOffset}${rowIndex} `;

            for (colIndex = 0; colIndex < this._size; ++colIndex)
            {
                cell = this._cellList[rowIndex * this._size + colIndex] || ' ';
                lineText = `${lineText}${cell}`;
            }

            tableString = `${tableString}${lineText}${os.EOL}`;
        }

        return tableString;
    }
  
    init()
    {
        for(let i = 0; i < this._cellList.length; i++)
        {
            this._cellList[i] = null;
        }
        
        this._playerIndex = 0;
        this._isTableLocked = false;

        if (!this._consoleReader)
        {
            this._consoleReader = readline.createInterface(process.stdin);
            this._consoleReader.on('line', this._onCommand);
        }
    }

    /**
     * @param {string} command 
     */
    _onCommand(command)
    {
        this.updateStatusInfo();

        switch(command)
        {
            case 'exit':
                console.clear();
                this.emit('exit');
                break;
            
            case 'restart':
                this.emit('restart');
                break;

            default:
                if (!this._isTableLocked && /^mark( [0-2]){2}$/g.test(command))
                {
                    const args = command.split(' ');
                    const colIndex = parseInt(args[1]);
                    const rowIndex = parseInt(args[2]);

                    const cellIndex = rowIndex * this._size + colIndex;

                    if (this._cellList[cellIndex] == null) this.emit('mark', {
                        colIndex: colIndex,
                        rowIndex: rowIndex
                    });
                }
        }
    }
}

module.exports = TicTacToeUI;