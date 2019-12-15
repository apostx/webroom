'use strict';

const path = require('path');
const http = require('http');
const WebSocket = require('ws');
const WebRoom = require('../..');

const PORT = 8081;

function buildServerEnvironment(port)
{
    const httpServer = http.createServer();
    const wsServer = new WebSocket.Server({noServer: true});

    const modulePath = path.resolve('./examples/echo/echo-webroom');

    // static way
    //const moduleContainer = {module: require(modulePath)};

    // dynamic way
    const moduleContainer = WebRoom.ModuleUpdater.require(modulePath);

    const webRoomServer = new WebRoom.Server(httpServer, wsServer, [{
        type: "echo",
        moduleContainer: moduleContainer
    }]);

    httpServer.listen(PORT);    
}



buildServerEnvironment(PORT);
console.log("Servers started...");