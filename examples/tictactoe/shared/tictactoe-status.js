class TicTacToeStatus
{
    static get IN_PROGRESS() {return 'in_progress';}
    static get WIN() {return 'win';}
    static get DRAW() {return 'draw';}
}

if (typeof module === 'object' && module.exports) module.exports = TicTacToeStatus;