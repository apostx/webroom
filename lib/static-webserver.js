'use strict';

const url = require('url');
const path = require('path');
const fs = require('fs');
const events = require('events');

/**
 * @typedef {import('http').ServerResponse} ServerResponse
 * @typedef {import('http').IncomingMessage} IncomingMessage
 */

/**
 * @typedef {{
 *   filePath: string,
 *   requestUrl: string
 * }} RouteVO
 */

/**
 * @typedef {{
 *   extension: string,
 *   mimeType: string
 * }} ExtensionVO
 */

/**
 * @typedef {{
 *   content: *,
 *   mimeType: string
 * }} FileVO
 */

class StaticWebServer extends events.EventEmitter
{
    /**
     * @param {events.EventEmitter} httpServer
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
     * @param {IncomingMessage} request 
     * @param {ServerResponse} response
     */
    _handleRequest(request, response)
    {
        const urlVO = url.parse(request.url);

        const fileVO = this.resolve(urlVO.pathname);

        if (fileVO)
        {
            const headers = fileVO.mimeType && {'Content-Type': fileVO.mimeType};

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
        for (let i = 0; i < this._routeList.length; ++i)
        {
            const routeVO = this._routeList[i];
            const isValidRoute = this._validateLocation(requestUrl, routeVO);

            if (isValidRoute)
            {
                const relPath = path.relative(path.normalize(routeVO.requestUrl), path.normalize(requestUrl));
                const filePath = path.join(routeVO.filePath, relPath);
                const isValidFile = this._validateFile(filePath);
                
                if (isValidFile)
                {
                    let fileVO = this._getFileVO(filePath);
                    
                    return fileVO;
                }
            }
        }

        return null;
    }

    /**
     * @param {string} requestUrl 
     * @param {RouteVO} routeVO 
     */
    _validateLocation(requestUrl, routeVO)
    {
        return !path.relative(routeVO.requestUrl, requestUrl).startsWith('..');
    }

    /**
     * @param {string} filePath 
     */
    _validateFile(filePath)
    {
        let isValid = false;

        try {
            const fileStat = fs.statSync(filePath);

            isValid = fileStat.isFile();
        } finally {
            return isValid;
        }
    }

    /**
     * @param {string} filePath 
     */
    _getFileVO(filePath)
    {
        const pathVO = path.parse(filePath);
        const fileContent = fs.readFileSync(filePath);
        const extensionVO = this._extensionList && this._extensionList.find(extensionVO => extensionVO.extension == pathVO.ext);

        return {
            content: fileContent,
            mimeType: extensionVO && extensionVO.mimeType
        };
    }
}

module.exports = StaticWebServer;