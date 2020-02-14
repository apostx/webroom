'use strict';

const WebRoom = {};

WebRoom.AbstractWebRoom = require('./lib/abstract-webroom');
WebRoom.Server = require('./lib/webroom-server');
WebRoom.SocketUnifiedAdapter = require('./lib/socket-unifiedadapter');
WebRoom.SocketServerUnifiedAdapter = require('./lib/socketserver-unifiedadapter');

module.exports = WebRoom;