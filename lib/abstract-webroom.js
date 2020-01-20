'use strict';

const events = require('events');
const http = require('http');

/**
 * @typedef {events.EventEmitter & {
 *     write: (data: string) => void,
 *     end: () => void
 * }} UnifiedSocket
 */

class AbstractWebRoom extends events.EventEmitter
{
    get details()
    {
        return null;
    }

    get isHidden()
    {
        return false;
    }

    constructor()
    {
        super();
    }

    /**
     * @param {UnifiedSocket} socket 
     * @returns {boolean}
     */
    join(socket)
    {
        return true;
    }

    /**
     * @param {UnifiedSocket} socket 
     */
    leave(socket)
    {
        this.emit('leave', socket);
    }

    destroy()
    {
        this.emit('destroy');
    }
}

module.exports = AbstractWebRoom;