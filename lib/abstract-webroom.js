'use strict';

const events = require('events');
const http = require('http');

/**
 * @typedef {events.EventEmitter & {
 *     send: (message: string) => void,
 *     close: () => void
 * }} UnifiedSocket
 * 
 * @fires UnifiedSocket#close
 * @fires UnifiedSocket#open
 * @fires UnifiedSocket#message
 * @fires UnifiedSocket#error
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
    canJoin(socket)
    {
        return true;
    }

    /**
     * @param {UnifiedSocket} socket 
     */
    join(socket){}

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