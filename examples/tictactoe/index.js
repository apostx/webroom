
'use strict';

const http = require("http");
const WebRoom = require('../..');

const httpServer = http.createServer();

const staticWebServer = new WebRoom.StaticWebServer(
    httpServer,
    [
        {filePath: "examples\\tictactoe\\public\\", requestUrl: "/"}
    ]
);

httpServer.listen(8081);