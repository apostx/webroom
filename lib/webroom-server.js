'use strict';

const url = require('url');
const ws = require('ws');
const http = require('http');
const querystring = require('querystring');
const net = require('net');
const events = require('events');
const AbstractWebRoom = require('./abstract-webroom');

/**
 * @typedef {{
 *   roomId: number,
 *   roomType: string,
 *   roomInstance: AbstractWebRoom
 * }} WebRoomVO
 */

/**
 * @typedef {{
 *   id: number,
 *   details: any
 * }} RoomInfo
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

class WebRoomServer extends events.EventEmitter
{
    /**
     * @param {http.Server} httpServer
     * @param {ws.Server} wsServer
     * @param {WebRoomType[]} roomTypeList
     */
    constructor(httpServer, wsServer, roomTypeList)
    {
        super();

        /** @type WebRoomVO[] */
        this._roomList = [];

        /** @type WebRoomType[] */
        this._roomTypeList = roomTypeList;
        
        this._httpServer = httpServer;
        this._wsServer = wsServer;

        httpServer.on('request', this._handleRequest.bind(this));
        httpServer.on('upgrade', this._handleUpgrade.bind(this));
    }

    /**
     * Handling http requests
     * 
     * @param {http.IncomingMessage} request 
     * @param {http.ServerResponse} response
     */
    _handleRequest(request, response)
    {
        const urlObj = url.parse(request.url);

        switch(urlObj.pathname)
        {
            case '/get_room_list':
                const query = querystring.decode(urlObj.query);

                if (query.room_type != null && this._isValidRoomType(query.room_type))
                {
                    var roomList = this._getRoomList(query.room_type.toString());
                    var message = JSON.stringify(roomList);

                    response.writeHead(200, {'Content-Type': 'application/json' });
                    response.end(message);

                    break;
                }
        }

        if(!response.finished)
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
     * Handling incoming websocket connections
     * 
     * @param {http.IncomingMessage} request 
     * @param {net.Socket} socket 
     * @param {Buffer} head
     */
    _handleUpgrade(request, socket, head)
    {
        const urlObj = url.parse(request.url);
        const query = querystring.decode(urlObj.query);

        var isUpgraded = false;
        
        switch(urlObj.pathname)
        {
            case '/create_room':
                const roomTypeVO = query.room_type != null && this._getRoomTypeVO(query.room_type);
                
                if (roomTypeVO) 
                {
                    this._wsServer.handleUpgrade(request, socket, head, this._createAndJoinRoom.bind(this, roomTypeVO));
                }
                break;

            case '/join_room':
                const webRoomVO = query.room_id != null && this._getWebRoomVO(query.room_id);
                
                if (webRoomVO) 
                {
                    this._wsServer.handleUpgrade(request, socket, head, this._joinRoom.bind(this, webRoomVO));
                }
                break;
        }

        if(socket.bytesWritten == 0)
        {
            this.emit('upgrade', request, socket, head);

            if(socket.bytesWritten == 0) socket.destroy();
        }
    }

    _createAndJoinRoom(roomTypeVO, webSocket)
    {
        var nextId = this._roomList.indexOf(null);
        if (nextId == -1) nextId = this._roomList.length;

        /** @type AbstractWebRoom */
        const roomInstance = new roomTypeVO.moduleContainer.module();

        /** @type WebRoomVO */
        const webRoomVO = {
            roomId: nextId,
            roomType: roomTypeVO.type,
            roomInstance: roomInstance
        };

        this._roomList.push(webRoomVO);

        roomInstance.once('destroy', this._destroyRoom.bind(this, webRoomVO));

        this._joinRoom(webRoomVO, webSocket);
    }

    _joinRoom(webRoomVO, webSocket)
    {
        webRoomVO.roomInstance.join(webSocket);
    }

    _destroyRoom(webRoomVO)
    {
        const roomIndex = this._roomList.indexOf(webRoomVO);

        if (roomIndex != -1) this._roomList.splice(roomIndex, 1);
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

    /**
     * @param {string} roomType
     * @returns {RoomInfo[]}
     */
    _getRoomList(roomType)
    {
        return this._roomList
            .filter(webRoomVO => webRoomVO.roomType == roomType && !webRoomVO.roomInstance.isHidden)
            .map(webRoomVO => {
                return {id: webRoomVO.roomId, details: webRoomVO.roomInstance.details}
            });
    }
}

module.exports = WebRoomServer;