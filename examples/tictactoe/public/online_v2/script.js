'use strict';

(function()
{
    const root = document.getElementById('root')

    const ticTacToeConnection = new TicTacToeConnection();
    const ticTacToeUI = new TicTacToeUI(root, 3, 'Online Tic-Tac-Toe');

    let isGameRunning = false;

    ticTacToeUI.on('mark', function(fieldInfo)
    {
        ticTacToeConnection.sendMark(fieldInfo.colIndex, fieldInfo.rowIndex);
        ticTacToeUI.setTableLocked(true);
    });

    ticTacToeConnection.on('message', function(messageObj)
    {
        isGameRunning = true;

        switch(messageObj.header)
        {
            case 'room_list':
                const roomList = messageObj.data.roomList;
                if (roomList.length > 0)
                {
                    ticTacToeConnection.joinRoom(roomList[0].id);
                }
                else
                {
                    ticTacToeConnection.createAndJoinRoom();
                }
                break;

            case 'join_room':
                const isJoined = messageObj.data.isJoined;
                
                if (!isJoined)
                {
                    ticTacToeConnection.getRoomList();
                }
                break;

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
    });

    ticTacToeConnection.on('close', function()
    {
        if (isGameRunning)
        {
            ticTacToeUI.updateStatusInfo('Game ended by network issue...');
            ticTacToeUI.setTableLocked(true);
        }
    });

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