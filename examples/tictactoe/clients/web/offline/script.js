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

        const status = ticTacToeLogic.mark(x, y);
        ticTacToeUI.setField(x, y);

        let statusInfo = null;
        switch (status)
        {
            case TicTacToeLogic.Status.WIN:
                statusInfo = `${ticTacToeLogic.currentPlayer} won!`;
                break;

            case TicTacToeLogic.Status.DRAW:
                statusInfo = `Draw!`;
                break;

            default:
                statusInfo = `${ticTacToeLogic.currentPlayer}'s turn`;
        }

        ticTacToeUI.updateStatusInfo(statusInfo);
        ticTacToeUI.setTableLocked(status != TicTacToeLogic.Status.IN_PROGRESS);
    });

    function init()
    {
        ticTacToeLogic.init('&#11093;', '&#10060;');
        ticTacToeUI.init();
        ticTacToeUI.updateStatusInfo(`${ticTacToeLogic.currentPlayer} starts`);
    }

    ticTacToeUI.on('restart', init);

    init();
})();