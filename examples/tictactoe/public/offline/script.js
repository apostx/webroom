'use strict';

(function()
{
    const root = document.getElementById('root')

    const ticTacToeLogic = new TicTacToeLogic();
    const ticTacToeUI = new TicTacToeUI(root, 3, 'Offline Tic-Tac-Toe');

    ticTacToeUI.on('mark', function(fieldInfo)
    {
        const x = fieldInfo.colIndex;
        const y = fieldInfo.rowIndex;

        const isWin = ticTacToeLogic.mark(x, y);
        ticTacToeUI.setField(x, y);

        ticTacToeUI.updateStatusInfo(
            isWin
            ? `${ticTacToeLogic.currentPlayer} won!`
            : `${ticTacToeLogic.currentPlayer}'s turn`
        );

        ticTacToeUI.setTableLocked(isWin);
    });

    function init()
    {
        ticTacToeLogic.init('O', 'X');
        ticTacToeUI.init();
        ticTacToeUI.updateStatusInfo(`${ticTacToeLogic.currentPlayer} starts`);
    }

    ticTacToeUI.on('restart', init);

    init();
})();