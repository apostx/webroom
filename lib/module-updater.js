'use strict';

const events = require('events');
const fs = require('fs');

class ModuleUpdater extends events.EventEmitter
{
    constructor(resolvedId)
    {
        super();

        this._resolvedId = resolvedId;
        this._module = require(resolvedId);

        fs.watchFile(resolvedId, this.update.bind(this));
    }

    get module()
    {
        return this._module;
    }

    update()
    {
        delete require.cache[this._resolvedId];

        this._module = require(this._resolvedId);

        this.emit('changed', this._module);
    }

    static require(resolvedId)
    {
        return new ModuleUpdater(resolvedId);
    }
}

module.exports = ModuleUpdater;