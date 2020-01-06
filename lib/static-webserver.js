'use strict';

const url = require('url');
const path = require("path");
const fs = require("fs");
const events = require('events');
const http = require("http");

/**
 * @typedef {{
 *   filePath: string,
 *   requestUrl: string
 * }} RouteVO
 **/

/**
 * @typedef {{
 *   extension: string,
 *   mimeType: string
 * }} ExtensionVO
 **/

/**
 * @typedef {{
 *   content: *,
 *   mimeType: string
 * }} FileVO
 **/

class StaticWebServer extends events.EventEmitter
{
    /**
     * @param {http.Server} httpServer
     * @param {RouteVO[]} routeList 
     * @param {ExtensionVO[]} [extensionList] 
     */
    constructor(httpServer, routeList, extensionList)
    {
        super();

        this._httpServer = httpServer;
        this._routeList = routeList;
        this._extensionList = extensionList;

        httpServer.on('request', this._handleRequest.bind(this));
    }

    /**
     * Handling http requests
     * 
     * @param {http.IncomingMessage} request 
     * @param {http.ServerResponse} response
     */
    _handleRequest(request, response)
    {
        const urlVO = url.parse(request.url);

        const fileVO = this.resolve(urlVO.pathname);

        if (fileVO)
        {
            const headers = fileVO.mimeType && {"Content-Type": fileVO.mimeType};

            response.writeHead(200, headers);
            response.end(fileVO.content);
        }
        else
        {
            this.emit('request', request, response);

            if (!response.finished)
            {
                response.statusCode = 404;
                response.end();
            }
        }
    }

    /**
     * @param {string} requestUrl 
     */
    resolve(requestUrl)
    {
        let fileVO = null;

        const validRouteVO = this._routeList.find(this._validateLocation.bind(this, requestUrl));

        if (validRouteVO)
        {
            const relPath = path.relative(path.normalize(validRouteVO.requestUrl), path.normalize(requestUrl));
            const filePath = path.join(validRouteVO.filePath, relPath);

            const pathVO = path.parse(filePath);

            const fileContent = this._getFile(filePath);

            if (fileContent)
            {
                const extensionVO = this._extensionList && this._extensionList.find(extensionVO => extensionVO.extension == pathVO.ext);

                fileVO = {
                    content: fileContent,
                    mimeType: extensionVO && extensionVO.mimeType
                };
            }
        }

        return fileVO;
    }

    /**
     * @param {string} requestUrl 
     * @param {RouteVO} routeVO 
     */
    _validateLocation(requestUrl, routeVO)
    {
        return !path.relative(routeVO.requestUrl, requestUrl).startsWith("..");
    }

    /**
     * @param {string} filePath 
     */
    _getFile(filePath)
    {
        let fileData = null;

        try {
            const fileStat = fs.statSync(filePath);

            if (fileStat.isFile()) fileData = fs.readFileSync(filePath);
        } catch(error) {
            console.log(error);
        }

        return fileData;
    }
}

module.exports = StaticWebServer;