'use strict';

class TicTacToeUI extends EventEmitter
{
    constructor(root, size, title)
    {
        super();

        const table = this._table = document.createElement('div');
        table.className = 'tictactoe-table';
        
        const l = size * size;
        
        this._cellList = [];
        this._cellList.length = l;
        this._playerIndex = 0;
        this._isTableLocked = false;

        this._size = size;
        
        for(let i = 0; i < l; i++)
        {
            const cell = this._cellList[i] = document.createElement('div');
            
            cell.className = 'tictactoe-cell';
            cell.onclick = this._onClick.bind(this, i);
            
            table.appendChild(cell);
        }

        const header = document.createElement('div');
        header.className = 'header';
        header.innerHTML = title;

        this._infoBar = document.createElement('div');
        this._infoBar.className = 'infobar';
        
        const restartBtn = document.createElement('button');
        restartBtn.className = 'restart_btn';
        restartBtn.innerHTML = '&#11118;';
        restartBtn.onclick = this.emit.bind(this, 'restart');
        
        root.appendChild(header);
            
        root.appendChild(table);
        root.appendChild(this._infoBar);
        root.appendChild(restartBtn);
    }
  
    _onClick(i, e)
    {
        const cell = e.currentTarget;
        
        if (cell.innerHTML == '' && !this._isTableLocked) this.emit('mark', {
            colIndex: i % this._size,
            rowIndex: Math.floor(i / this._size)
        });
    }

    setField(colIndex, rowIndex)
    {
        const cellIndex = rowIndex * this._size + colIndex;
        const cell = this._cellList[cellIndex];
        const className = this._playerIndex == 0 ? 'o' : 'x';
        this._playerIndex = (this._playerIndex + 1) % 2;
        cell.innerHTML = '<div class="' + className + '"></div>';
    }

    setTableLocked(locked)
    {
        this._isTableLocked = locked;
    }

    updateStatusInfo(infoText)
    {
        this._infoBar.innerHTML = infoText;
    }
  
    init()
    {
        const cells = document.getElementsByClassName('tictactoe-cell');
        
        for(let i = 0; i < cells.length; i++)
        {
            cells[i].innerHTML = "";
        }
        
        this._playerIndex = 0;
        this._isTableLocked = false;
    }
}