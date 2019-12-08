'use strict';

const http = require('http');
const WebSocket = require('ws');
const WebRoom = require('../..');

const PORT = 8081;

function buildServerEnvironment(port)
{
    const httpServer = http.createServer();
    const wsServer = new WebSocket.Server({noServer: true});
    const webRoomServer = new WebRoom.Server(httpServer, wsServer, [{
        type: "echo",
        module: EchoWebRoom
    }]);

    httpServer.listen(PORT);    
}

class EchoWebRoom extends WebRoom.AbstractWebRoom
{
    constructor()
    {
        super();

        this._userList = [];
    }

    join(socket)
    {
        this._userList.push(socket);

        socket.on("message", this._onMessage.bind(this));
    }

    _onMessage(message)
    {
        for (var i = 0; i < this._userList.length; ++i)
        {
            this._userList[i].send(message);
        }
    }
}

buildServerEnvironment(PORT);