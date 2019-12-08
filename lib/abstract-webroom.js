'use strict';

const events = require('events');

class AbstractWebRoom extends events.EventEmitter
{
    constructor()
    {
        super();
    }

    join(socket) {}

    destroy()
    {
        this.emit("destroy");
    }
}

module.exports = AbstractWebRoom;