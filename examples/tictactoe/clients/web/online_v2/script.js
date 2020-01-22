'use strict';

(function()
{
    const root = document.getElementById('root')

    const ticTacToeConnection = new TicTacToeUnifiedConnection(() => {
        const webSocket = new WebSocket(`ws://${location.host}/`);
        return new WebSocketUnifiedAdapter(webSocket);
    });

    const ticTacToeUI = new TicTacToeUI(root, 3, 'Online Tic-Tac-Toe');

    let isGameRunning = false;

    ticTacToeUI.on('mark', function(fieldInfo)
    {
        ticTacToeConnection.sendMark(fieldInfo.colIndex, fieldInfo.rowIndex);
        ticTacToeUI.setTableLocked(true);
    });

    ticTacToeConnection.onmessage = function(messageObj)
    {
        isGameRunning = true;

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

                let statusInfo = null;

                switch(messageObj.data.status)
                {
                    case 'win':
                        isGameRunning = false;
                        statusInfo = `${messageObj.data.isYou ? 'You' : 'Your Opponent'} Won!`;
                        break;

                    case 'draw':
                        isGameRunning = false;
                        statusInfo = 'Draw!';
                        break;

                    default:
                        statusInfo = 'Waiting for server...';
                        break;
                }
                ticTacToeUI.updateStatusInfo(statusInfo);
                break;
        }
    };

    ticTacToeConnection.onclose = function()
    {
        if (isGameRunning)
        {
            ticTacToeUI.updateStatusInfo('Game ended by network issue...');
            ticTacToeUI.setTableLocked(true);
        }
    };

    function init()
    {
        isGameRunning = false;

        ticTacToeConnection.init();
        ticTacToeUI.init();

        ticTacToeUI.updateStatusInfo('Looking for opponent...');
        ticTacToeUI.setTableLocked(true);
    }

    ticTacToeUI.on('restart', init);

    init();
})();