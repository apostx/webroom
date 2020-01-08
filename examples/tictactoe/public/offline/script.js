(function()
{
    const root = document.getElementById('root')

    const ticTacToeLogic = new TicTacToeOfflineLogic();
    const ticTacToeUI = new TicTacToeUI(root, ticTacToeLogic);

    ticTacToeUI.init();
    ticTacToeLogic.init("o", "x");
})();