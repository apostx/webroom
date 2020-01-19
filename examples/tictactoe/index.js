'use strict';

const http = require('http');
const WebSocket = require('ws');
const WebRoom = require('../..');
const TicTacToeWebRoom = require('./src/tictactoe-webroom');

const PORT = 8081;

const httpServer = http.createServer();
const wsServer = new WebSocket.Server({noServer: true});

const webRoomServer = new WebRoom.Server({
    http: {
        httpServer: httpServer,
        wsServer: wsServer
    }, 
    roomTypeList: [{
        type: 'tictactoe',
        moduleContainer: {module: TicTacToeWebRoom}
    }]
});

const staticWebServer = new WebRoom.StaticWebServer(
    webRoomServer,
    [
        {filePath: 'examples\\tictactoe\\src\\tictactoe-logic.js\\', requestUrl: '/tictactoe_logic.js'},
        {filePath: 'examples\\tictactoe\\public\\index.html', requestUrl: '/'},
        {filePath: 'examples\\tictactoe\\public\\offline\\index.html', requestUrl: '/offline/'},
        {filePath: 'examples\\tictactoe\\public\\', requestUrl: '/'}
    ],
    [
        {extension: '.html', mimeType: 'text/html'},
        {extension: '.css', mimeType: 'text/css'},
        {extension: '.js', mimeType: 'application/javascript'}
    ]
);

httpServer.listen(PORT);