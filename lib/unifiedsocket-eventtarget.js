'use strict';

/**
 * @typedef {import('events').EventEmitter} EventEmitter
 * @typedef {import('./abstract-webroom').UnifiedSocket} UnifiedSocket
 * @typedef {(target: EventEmitter, ...args: any[]) => void} Callback
 */

class UnifiedSocketEventTarget
{
    get onMessage()
    {
        return this._onMessage;
    }

    /**
     * @param {Callback} value 
     */
    set onMessage(value)
    {
        //value = value.bind(this.target, this),
        this._initListener('message', this._onMessage, value);
        this._onMessage = value;
    }

    get onClose()
    {
        return this._onClose;
    }

    /**
     * @param {Callback} value 
     */
    set onClose(value)
    {
        //value = value.bind(this.target, this),
        this._initListener('close', this._onClose, value);
        this._onClose = value;
    }

    get onError()
    {
        return this._onError;
    }

    /**
     * @param {Callback} value 
     */
    set onError(value)
    {
        //value = value.bind(this.target, this),
        this._initListener('error', this._onError, value);
        this._onError = value;
    }

    /**
     * @param {UnifiedSocket} unifiedSocket 
     */
    constructor(unifiedSocket)
    {
        this.target = unifiedSocket;
        this._onMessage = null;
        this._onClose = null;
        this._onError = null;
    }

    /**
     * @param {string} event 
     * @param {Callback} oldCallback 
     * @param {Callback} newCallback 
     */
    _initListener(event, oldCallback, newCallback)
    {
        if (oldCallback)
        {
            this.target.off(event, oldCallback);
        }

        if (newCallback)
        {
            this.target.on(event, newCallback);
        }
    }

    unlink()
    {
        this.onMessage = null;
        this.onClose = null;
        this.onError = null;
    }
}

module.exports = UnifiedSocketEventTarget;