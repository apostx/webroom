'use strict';

(function()
{
    const root = document.getElementById('root')

    const ticTacToeConnection = new TicTacToeConnection();
    const ticTacToeUI = new TicTacToeUI(root, 3, 'Online Tic-Tac-Toe');

    let gameStatus = null;

    ticTacToeUI.on('mark', function(fieldInfo)
    {
        ticTacToeConnection.sendMark(fieldInfo.colIndex, fieldInfo.rowIndex);
        ticTacToeUI.setTableLocked(true);
    });

    ticTacToeConnection.on('message', function(messageObj)
    {
        switch(messageObj.header)
        {
            case 'nextTurn':
                const isYourTurn = messageObj.data.isYours;
                ticTacToeUI.updateStatusInfo(
                    isYourTurn
                    ? 'Your Turn!'
                    : 'Opponent\'s turn...'
                );
                ticTacToeUI.setTableLocked(!isYourTurn);
                break;

            case 'mark':
                ticTacToeUI.setField(messageObj.data.colIndex, messageObj.data.rowIndex);

                const isYou = messageObj.data.isYou;
                let statusInfo = null;
                gameStatus = messageObj.data.status;
                switch(gameStatus)
                {
                    case 'win':
                        statusInfo = `${messageObj.data.isYou ? 'You' : 'Your Opponent'} Won!`;
                        break;

                    case 'draw':
                        statusInfo = 'Draw!';
                        break;

                    default:
                        statusInfo = 'Waiting for server...';
                        break;
                }
                ticTacToeUI.updateStatusInfo(statusInfo);
                break;
        }
    });

    ticTacToeConnection.on('close', function()
    {
        if (gameStatus == 'in_progress' || gameStatus == null)
        {
            ticTacToeUI.updateStatusInfo('Game ended by network issues...');
            ticTacToeUI.setTableLocked(true);
            gameStatus = null;
        }
    });

    function init()
    {
        ticTacToeConnection.init();
        ticTacToeUI.init();

        ticTacToeUI.updateStatusInfo('Looking for opponent...');
        ticTacToeUI.setTableLocked(true);
    }

    ticTacToeUI.on('restart', init);

    init();
})();