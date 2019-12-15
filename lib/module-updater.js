'use strict';

const events = require('events');
const fs = require("fs");

class ModuleUpdater extends events.EventEmitter
{
    constructor(id)
    {
        super();

        this._id = id;
        this._module = require(id);

        fs.watchFile(require.resolve(id), this.update.bind(this));
    }

    get module()
    {
        return this._module;
    }

    update()
    {
        delete require.cache[require.resolve(this._id)];

        this._module = require(this._id);

        this.emit("changed", this._module);
    }

    static require(id)
    {
        return new ModuleUpdater(id);
    }
}

module.exports = ModuleUpdater;