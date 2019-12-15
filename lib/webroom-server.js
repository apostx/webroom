'use strict';

const url = require('url');
const ws = require('ws');
const http = require("http");
const querystring = require('querystring');
const net = require("net");

/**
 * @typedef {{
 *   roomId: number,
 *   roomType: string,
 *   roomInstance: AbstractWebRoom
 * }} WebRoomVO
 */

 /**
 * @typedef {{
    *   module: function
    * }} ModuleContainer
    */

 /**
 * @typedef {{
 *   type: string,
 *   moduleContainer: ModuleContainer
 * }} WebRoomType
 */

class WebRoomServer
{
    /**
     * @param {http.Server} httpServer
     * @param {ws.Server} wsServer
     * @param {WebRoomType[]} roomTypeList
     */
    constructor(httpServer, wsServer, roomTypeList)
    {
        /** @type WebRoomVO[] */
        this._roomList = [];

        /** @type WebRoomType[] */
        this._roomTypeList = roomTypeList;
        
        this._httpServer = httpServer;
        this._wsServer = wsServer;

        httpServer.on('request', this._onRequest.bind(this));
        httpServer.on('upgrade', this._onUpgrade.bind(this));
    }

    /**
     * Handling http requests
     * 
     * @param {http.IncomingMessage} request 
     * @param {http.ServerResponse} response 
     */
    _onRequest(request, response)
    {
        const urlObj = url.parse(request.url);

        switch(urlObj.pathname)
        {
            case "/get_room_list":
                const query = querystring.decode(urlObj.query);

                if (query.room_type != null && this._isValidRoomType(query.room_type))
                {
                    var roomList = this._getRoomList(query.room_type);
                    var message = JSON.stringify(roomList);

                    response.writeHead(200, {"Content-Type": "application/json" });
                    response.end(message);
                    break;
                }

            default:
                response.statusCode = 404;
                response.end();
                break;
        }
    }

    /**
     * Handling incoming websocket connections
     * 
     * @param {http.IncomingMessage} request 
     * @param {net.Socket} socket 
     * @param {Buffer} head 
     */
    _onUpgrade(request, socket, head)
    {
        const urlObj = url.parse(request.url);
        const query = querystring.decode(urlObj.query);
        
        switch(urlObj.pathname)
        {
            case "/create_room":
                const roomTypeVO = query.room_type != null && this._getRoomTypeVO(query.room_type);
                
                if (roomTypeVO) this._wsServer.handleUpgrade(request, socket, head, (webSocket) => {
                    this._createAndJoinRoom(roomTypeVO, webSocket);
                });
                else socket.destroy();
                break;

            case "/join_room":
                const webRoomVO = query.room_id != null && this._getWebRoomVO(query.room_id);

                if (webRoomVO) this._wsServer.handleUpgrade(request, socket, head, (webSocket) => {
                    this._joinRoom(webRoomVO, webSocket);
                });
                else socket.destroy();
                break;

            default:
                socket.destroy();
                break;
        }
    }

    _createAndJoinRoom(roomTypeVO, webSocket)
    {
        var nextId = this._roomList.indexOf(null);
        if (nextId == -1) nextId = this._roomList.length;

        /** @type WebRoomVO */
        const webRoomVO = {
            roomId: nextId,
            roomType: roomTypeVO.type,
            roomInstance: new roomTypeVO.moduleContainer.module()
        };

        this._roomList.push(webRoomVO);
        this._joinRoom(webRoomVO, webSocket);
    }

    _joinRoom(webRoomVO, webSocket)
    {
        webRoomVO.roomInstance.join(webSocket);
    }

    _getWebRoomVO(roomId)
    {
        return this._roomList.find(webRoomVO => webRoomVO.roomId == roomId);
    }

    _getRoomTypeVO(roomType)
    {
        return this._roomTypeList.find(roomTypeVO => roomTypeVO.type == roomType);
    }

    _isValidRoomType(roomType)
    {
        return this._getRoomTypeVO(roomType) != undefined;
    }

    _getRoomList(roomType)
    {
        return this._roomList
            .filter(webRoomVO => webRoomVO.roomType == roomType)
            .map(webRoomVO => webRoomVO.roomId);
    }
}

module.exports = WebRoomServer;