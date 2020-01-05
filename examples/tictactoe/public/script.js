class TicTacToeView
{
  constructor(root, ticTacToeGame)
  {
    const table = this._table = document.createElement("div");
    table.className = "tictactoe-table";
    
    const l = ticTacToeGame.length * ticTacToeGame.length;
    
    this._cellList = [];
    this._cellList.length = l;
    
    this._ticTacToeGame = ticTacToeGame;
    this._playerIndex = 0;
    
    for(let i = 0; i < l; i++)
    {
      const cell = this._cellList[i] = document.createElement("div");
      
      cell.className = "tictactoe-cell";
      cell.onclick = this._onClick.bind(this, i);
      
      table.appendChild(cell);
    }
    
    root.appendChild(table);
  }
  
  _onClick(i, e)
  {
    const cell = e.currentTarget;
    
    if (cell.innerHTML == "")
    {
      const className = this._playerIndex == 0 ? "o" : "x";
      this._playerIndex = (this._playerIndex + 1) % 2;
      cell.innerHTML = "<div class=\"" + className + "\"></div>";
      
      var isWin = this._ticTacToeGame.mark(i % 3, Math.floor(i / 3));
      
      if (isWin)
      {
        var cb = this._onWin.bind(this, this._ticTacToeGame.currentPlayer.toUpperCase());
        
        window.requestAnimationFrame(window.requestAnimationFrame.bind(window, cb));
      }
    }
  }
  
  _onWin(winner)
  {
    alert("\"" + winner + "\" player won!");
    
    this.init();
    this._ticTacToeGame.init("o", "x");
  }
  
  init()
  {
    const cells = document.getElementsByClassName('cell');
    
    for(let i = 0; i < cells.length; i++)
    {
      cells[i].innerHTML = "";
    }
    
    this._playerIndex = 0;
  }
}

class TicTacToeGame
{
    static get LENGTH() {
        return 3;
    }
  
    get length()
    {
      return this.constructor.LENGTH;
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
            throw "Invalid mark: dirty table (run the init before the next mark)";
        }

        if (this._table.getField(colIndex, rowIndex) != undefined)
        {
            throw "Invalid mark: field is already used";
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
        return this.constructor.LENGTH <= Math.max(
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

const root = document.getElementById('root')

const ticTacToeGame = new TicTacToeGame();
const ticTacToeView = new TicTacToeView(root, ticTacToeGame);

ticTacToeView.init();
ticTacToeGame.init("o", "x");