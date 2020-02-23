'use strict';

(function()
{
    const SIZE = 3;

    const root = document.getElementById('root')

    const ticTacToeData = new TicTacToeData();
    const ticTacToeUI = new TicTacToeUI(root, SIZE, 'Offline Tic-Tac-Toe');

    ticTacToeUI.on('mark', function(fieldInfo)
    {
        const x = fieldInfo.colIndex;
        const y = fieldInfo.rowIndex;

        const markInfo = TicTacToeRuleset.mark(x, y, ticTacToeData);

        ticTacToeData.update(x, y, markInfo.currentPlayer, markInfo.status);
        ticTacToeUI.setField(x, y);

        let statusInfo = null;
        switch (ticTacToeData.status)
        {
            case ticTacToeData.Status.WIN:
                statusInfo = `${ticTacToeData.currentPlayer} won!`;
                break;

            case ticTacToeData.Status.DRAW:
                statusInfo = `Draw!`;
                break;

            default:
                statusInfo = `${ticTacToeData.currentPlayer}'s turn`;
        }

        ticTacToeUI.updateStatusInfo(statusInfo);
        ticTacToeUI.setTableLocked(ticTacToeData.status != ticTacToeData.Status.IN_PROGRESS);
    });

    function init()
    {
        ticTacToeData.reset(SIZE, '&#11093;', '&#10060;');
        ticTacToeUI.init();
        ticTacToeUI.updateStatusInfo(`${ticTacToeData.currentPlayer} starts`);
    }

    ticTacToeUI.on('restart', init);

    init();
})();