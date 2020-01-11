'use strict';

(function()
{
    const root = document.getElementById('root')

    const ticTacToeConnection = new TicTacToeConnection();
    const ticTacToeUI = new TicTacToeUI(root, 3, 'Online Tic-Tac-Toe');

    ticTacToeUI.on('mark', function(fieldInfo)
    {
        const x = fieldInfo.colIndex;
        const y = fieldInfo.rowIndex;

        const isWin = ticTacToeConnection.mark(x, y);
        ticTacToeUI.setField(x, y);
        
        window.requestAnimationFrame(window.requestAnimationFrame.bind(window, function()
        {
            ticTacToeUI.updateStatus(isWin);
        }));
    });

    function init()
    {
        ticTacToeConnection.startGame();
        ticTacToeUI.init();
    }

    ticTacToeUI.on('restart', init);

    init();
})();