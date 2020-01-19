'use strict';

const WebRoom = require('../..');

/**
 * @typedef {import('../../lib/abstract-webroom').UnifiedSocket} UnifiedSocket
 */

class EchoWebRoom extends WebRoom.AbstractWebRoom
{
    constructor()
    {
        super();

        /** @type UnifiedSocket[] */
        this._userList = [];
    }

    /**
     * @param {UnifiedSocket} socket 
     */
    join(socket)
    {
        this._userList.push(socket);

        socket.on('message', this._onMessage.bind(this));
    }

    _onMessage(message)
    {
        for (var i = 0; i < this._userList.length; ++i)
        {
            this._userList[i].write(message);
        }
    }
}

module.exports = EchoWebRoom;