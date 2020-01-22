'use strict';

const net = require('net');
const http = require('http');
const WebSocket = require('ws');
const WebRoom = require('../..');
const TicTacToeWebRoom = require('./server/tictactoe-webroom');
const UglyUnifiedWebSocketServer = require('./server/ugly_unified_websocketserver');

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

const ticTacToePath = 'examples\\tictactoe';
const webPath = `${ticTacToePath}\\clients\\web`;

const staticWebServer = new WebRoom.StaticWebServer(
    webRoomServer,
    [
        {filePath: `${ticTacToePath}\\shared\\tictactoe-logic.js\\`, requestUrl: '/shared/tictactoe_logic.js'},
        {filePath: `${ticTacToePath}\\clients\\shared\\tictactoe-unifiedconnection.js\\`, requestUrl: '/shared/tictactoe_unifiedconnection.js'},
        {filePath: `${webPath}\\online\\index.html`, requestUrl: '/'},
        {filePath: `${webPath}\\online\\index.html`, requestUrl: '/online/'},
        {filePath: `${webPath}\\online_v2\\index.html`, requestUrl: '/online_v2/'},
        {filePath: `${webPath}\\offline\\index.html`, requestUrl: '/offline/'},
        {filePath: `${webPath}\\shared\\`, requestUrl: '/shared/'},
        {filePath: `${webPath}\\online\\`, requestUrl: '/online/'},
        {filePath: `${webPath}\\online_v2\\`, requestUrl: '/online_v2/'},
        {filePath: `${webPath}\\offline\\`, requestUrl: '/offline/'}
    ],
    [
        {extension: '.html', mimeType: 'text/html'},
        {extension: '.css', mimeType: 'text/css'},
        {extension: '.js', mimeType: 'application/javascript'}
    ]
);

httpServer.listen(HTTP_PORT);
unifiedTcpSocketServer.listen(TCP_PORT);