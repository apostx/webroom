'use strict';

const url = require('url');
const net = require('net');
const http = require('http');
const StaticWebServer = require('static-webserver');
const WebSocket = require('ws');
const WebRoom = require('../..');
const TicTacToeWebRoom = require('./server/tictactoe-webroom');

const HTTP_PORT = 8081;
const TCP_PORT = 511;

const httpServer = http.createServer();
const wsServer = new WebSocket.Server({noServer: true});
const socketServer = new net.Server();
const unifiedSocketServer = new WebRoom.SocketServerUnifiedAdapter(socketServer);

const webRoomServer = new WebRoom.Server({
    http: {
        httpServer: httpServer,
        wsServer: wsServer
    },
    unifiedServerList: [
        wsServer,
        unifiedSocketServer
    ],
    roomTypeList: [{
        type: 'tictactoe',
        moduleContainer: {module: TicTacToeWebRoom}
    }]
});

webRoomServer.on('upgrade', (request, socket, head) => {
    const urlObj = url.parse(request.url);
    if (urlObj.pathname == '/')
    {
        wsServer.handleUpgrade(request, socket, head, (webSocket) => {
            wsServer.emit('connection', webSocket);
        });
    }
});


const ticTacToePath = 'examples\\tictactoe';
const webPath = `${ticTacToePath}\\clients\\web`;

const staticWebServer = new StaticWebServer(
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
socketServer.listen(TCP_PORT);