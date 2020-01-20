'use strict';

const net = require('net');
const http = require('http');
const WebSocket = require('ws');
const WebRoom = require('../..');
const TicTacToeWebRoom = require('./src/tictactoe-webroom');
const UglyUnifiedWebSocketServer = require('./src/ugly_unified_websocketserver');

const HTTP_PORT = 8081;
const TCP_PORT = 511;

const httpServer = http.createServer();
const wsServer = new WebSocket.Server({noServer: true});

const uglyUnifiedWebSocketServer = new UglyUnifiedWebSocketServer(wsServer);
const unifiedTcpSocketServer = new net.Server();

const webRoomServer = new WebRoom.Server({
    http: {
        httpServer: httpServer,
        wsServer: wsServer
    },
    unifiedServerList: [
        uglyUnifiedWebSocketServer,
        unifiedTcpSocketServer
    ],
    roomTypeList: [{
        type: 'tictactoe',
        moduleContainer: {module: TicTacToeWebRoom}
    }]
});

uglyUnifiedWebSocketServer.setHttpServer(webRoomServer);

const staticWebServer = new WebRoom.StaticWebServer(
    webRoomServer,
    [
        {filePath: 'examples\\tictactoe\\src\\tictactoe-logic.js\\', requestUrl: '/common/tictactoe_logic.js'},
        {filePath: 'examples\\tictactoe\\public\\online\\index.html', requestUrl: '/'},
        {filePath: 'examples\\tictactoe\\public\\online\\index.html', requestUrl: '/online/'},
        {filePath: 'examples\\tictactoe\\public\\online_v2\\index.html', requestUrl: '/online_v2/'},
        {filePath: 'examples\\tictactoe\\public\\offline\\index.html', requestUrl: '/offline/'},
        {filePath: 'examples\\tictactoe\\public\\common\\', requestUrl: '/common/'},
        {filePath: 'examples\\tictactoe\\public\\online\\', requestUrl: '/online/'},
        {filePath: 'examples\\tictactoe\\public\\online_v2\\', requestUrl: '/online_v2/'},
        {filePath: 'examples\\tictactoe\\public\\offline\\', requestUrl: '/offline/'}
    ],
    [
        {extension: '.html', mimeType: 'text/html'},
        {extension: '.css', mimeType: 'text/css'},
        {extension: '.js', mimeType: 'application/javascript'}
    ]
);

httpServer.listen(HTTP_PORT);
unifiedTcpSocketServer.listen(TCP_PORT);