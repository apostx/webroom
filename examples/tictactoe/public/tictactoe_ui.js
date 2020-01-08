class TicTacToeUI
{
    constructor(root, ticTacToeLogic)
    {
        const table = this._table = document.createElement("div");
        table.className = "tictactoe-table";
        
        const l = ticTacToeLogic.length * ticTacToeLogic.length;
        
        this._cellList = [];
        this._cellList.length = l;
        
        this._ticTacToeLogic = ticTacToeLogic;
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
            
            var isWin = this._ticTacToeLogic.mark(i % 3, Math.floor(i / 3));
            
            if (isWin)
            {
                var cb = this._onWin.bind(this, this._ticTacToeLogic.currentPlayer.toUpperCase());
                
                window.requestAnimationFrame(window.requestAnimationFrame.bind(window, cb));
            }
        }
    }
  
    _onWin(winner)
    {
        alert("\"" + winner + "\" player won!");
        
        this.init();
        this._ticTacToeLogic.init("o", "x");
    }
  
    init()
    {
        const cells = document.getElementsByClassName('tictactoe-cell');
        
        for(let i = 0; i < cells.length; i++)
        {
            cells[i].innerHTML = "";
        }
        
        this._playerIndex = 0;
    }
}