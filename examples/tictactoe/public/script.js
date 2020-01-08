(function()
{
    const root = document.getElementById('root')

    const ticTacToeLogic = new TicTacToeOnlineLogic();
    const ticTacToeUI = new TicTacToeUI(root, ticTacToeLogic);

    ticTacToeUI.init();
    ticTacToeLogic.init("o", "x");
})();

