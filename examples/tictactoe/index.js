
'use strict';

const http = require("http");
const WebRoom = require('../..');

const httpServer = http.createServer();

const staticWebServer = new WebRoom.StaticWebServer(
    httpServer,
    [
        {filePath: "examples\\tictactoe\\public\\index.html", requestUrl: "/"},
        {filePath: "examples\\tictactoe\\public\\offline\\index.html", requestUrl: "/offline/"},
        {filePath: "examples\\tictactoe\\public\\", requestUrl: "/"}
    ],
    [
        {extension: ".html", mimeType: "text/html"},
        {extension: ".css", mimeType: "text/css"},
        {extension: ".js", mimeType: "application/javascript"}
    ]
);

httpServer.listen(8081);