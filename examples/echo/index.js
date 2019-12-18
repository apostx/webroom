'use strict';

const http = require('http');
const WebSocket = require('ws');
const WebRoom = require('../..');

const PORT = 8081;

function buildServerEnvironment(port)
{
    const httpServer = http.createServer();
    const wsServer = new WebSocket.Server({noServer: true});
    const resolvedId = require.resolve('./echo-webroom');

    // static way
    //const moduleContainer = {module: require(resolvedId)};

    // dynamic way
    const moduleContainer = WebRoom.ModuleUpdater.require(resolvedId);

    const webRoomServer = new WebRoom.Server(httpServer, wsServer, [{
        type: "echo",
        moduleContainer: moduleContainer
    }]);

    httpServer.listen(PORT);    
}

function manageRoom(port, command, querry , msgLogPrefix, callback)
{
    const wsClient = new WebSocket("ws://127.0.0.1:" + port + "/" + command + "?" + querry);

    wsClient.on("open", () => callback(wsClient));
    wsClient.on("message", message => console.log(msgLogPrefix + message));
}

function sendHelloWorld(port)
{
    console.log("Master connecting...");

    manageRoom(port, "create_room", "room_type=echo", "Received by Master: ", wsMasterClient => {
        console.log("...Master connected");
        console.log("Slave connecting...");

        manageRoom(port, "join_room", "room_id=0", "Received by Slave: ", wsSlaveClient => {
            console.log("...Slave connected");
            console.log("\"HelloWorld\" sent...");

            wsMasterClient.send("HellowWorld! (Sent by Master)");
            wsSlaveClient.send("HellowWorld! (Sent by Slave)");
        })
    });
}

buildServerEnvironment(PORT);

sendHelloWorld(PORT);

console.log("Servers started");
