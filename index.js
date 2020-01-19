'use strict';

const WebRoom = {};

WebRoom.StaticWebServer = require('./lib/static-webserver');
WebRoom.ModuleUpdater = require('./lib/module-updater');
WebRoom.AbstractWebRoom = require('./lib/abstract-webroom');
WebRoom.Server = require('./lib/webroom-server');
WebRoom.WebSocketUnifiedAdapter = require('./lib/websocket-unifiedadapter');

module.exports = WebRoom;