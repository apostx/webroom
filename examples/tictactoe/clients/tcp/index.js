'use strict';

const net = require('net');
const TicTacToeUnifiedConnection = require('../shared/tictactoe-unifiedconnection');
const TicTacToeUI = require('./tictactoe-ui');
const WebRoom = require('../../../../');

const ticTacToeConnection = new TicTacToeUnifiedConnection(() => {
    const socket = new net.Socket();
    const unifiedSocket = new WebRoom.SocketUnifiedAdapter(socket);
    
    socket.connect(511);
    
    return unifiedSocket;
});

const ticTacToeUI = new TicTacToeUI(3);

    let isGameRunning = false;

    ticTacToeUI.on('mark', function(fieldInfo)
    {
        ticTacToeConnection.sendMark(fieldInfo.colIndex, fieldInfo.rowIndex);
        ticTacToeUI.setTableLocked(true);
        ticTacToeUI.updateStatusInfo();
    });

    ticTacToeConnection.onmessage = function(messageObj)
    {
        isGameRunning = true;

        switch(messageObj.header)
        {
            case 'nextTurn':
                const isYourTurn = messageObj.data.isYours;
                
                ticTacToeUI.setTableLocked(!isYourTurn);
                ticTacToeUI.updateStatusInfo(
                    isYourTurn
                    ? 'Your Turn!'
                    : 'Opponent\'s turn...'
                );
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
            ticTacToeUI.setTableLocked(true);
            ticTacToeUI.updateStatusInfo('Game ended by network issue...');
        }
    };

    function init()
    {
        isGameRunning = false;

        ticTacToeConnection.init();
        ticTacToeUI.init();

        ticTacToeUI.setTableLocked(true);
        ticTacToeUI.updateStatusInfo('Looking for opponent...');
    }

    function exit()
    {
        process.exit();
    }

    ticTacToeUI.on('restart', init);
    ticTacToeUI.on('exit', exit);

    init();