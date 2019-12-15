'use strict';

const WebRoom = require('../..');

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

module.exports = EchoWebRoom;