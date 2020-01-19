'use strict';

const url = require('url');
const querystring = require('querystring');
const events = require('events');
const WebSocketUnifiedAdapter = require('./websocket-unifiedadapter');

/**
 * @typedef {import('net').Socket} Socket
 * @typedef {import('http').ServerResponse} ServerResponse
 * @typedef {import('http').IncomingMessage} IncomingMessage
 * @typedef {import('ws').Server} WebSocketServer
 * @typedef {import('./abstract-webroom')} AbstractWebRoom
 * @typedef {import('./abstract-webroom').UnifiedSocket} UnifiedSocket
 */

/**
 * @typedef {{
 *     roomId: number,
 *     roomType: string,
 *     roomInstance: AbstractWebRoom
 * }} WebRoomVO
 */

/**
 * @typedef {{
 *     id: number,
 *     details: any
 * }} RoomInfo
 */

/**
 * @typedef {{
 *     module: typeof import('./abstract-webroom')
 * }} ModuleContainer
 */

/**
 * @typedef {{
 *     type: string,
 *     moduleContainer: ModuleContainer
 * }} WebRoomType
 */

class WebRoomServer extends events.EventEmitter
{
    /**
     * @param {{
     *     http?: {
     *         httpServer: events.EventEmitter,
     *         wsServer: WebSocketServer
     *     }
     *     unifiedServerList?: events.EventEmitter[],
     *     roomTypeList: WebRoomType[]
     * }} options
     */
    constructor(options)
    {
        super();

        if (!options.http && !options.unifiedServerList)
        {
            throw new Error('One of the "http" or "unifiedServerList" options must be specified');
        }

        // Bind
        this._handleHttpRequest = this._handleHttpRequest.bind(this);
        this._handleHttpUpgrade = this._handleHttpUpgrade.bind(this);
        this._handleUnifiedConnection = this._handleUnifiedConnection.bind(this);
        this.joinRoom = this.joinRoom.bind(this);
        this.createAndJoinRoom = this.createAndJoinRoom.bind(this);

        /** @type WebRoomVO[] */
        this._roomList = [];

        /** @type WebRoomType[] */
        this._roomTypeList = options.roomTypeList;
        
        if (options.http)
        {
            this._httpServer = options.http.httpServer;
            this._wsServer = options.http.wsServer;

            this._initHttpServer(this._httpServer);
        }

        if (options.unifiedServerList)
        {
            this._unifiedServerList = options.unifiedServerList;

            for (let i = 0; i < this._unifiedServerList.length; ++i)
            {
                this._initUnifiedServer(this._unifiedServerList[i]);
            }
        }  
    }

    /**
     * @param {events.EventEmitter} httpServer 
     */
    _initHttpServer(httpServer)
    {
        httpServer.on('request', this._handleHttpRequest);
        httpServer.on('upgrade', this._handleHttpUpgrade);
    }

    /**
     * @param {events.EventEmitter} unifiedServer 
     */
    _initUnifiedServer(unifiedServer)
    {
        unifiedServer.on('connection', this._handleUnifiedConnection);
    }

    /**
     * Handling http requests
     * 
     * @param {IncomingMessage} request 
     * @param {ServerResponse} response
     */
    _handleHttpRequest(request, response)
    {
        const urlObj = url.parse(request.url);

        switch(urlObj.pathname)
        {
            case '/get_room_list':
                const query = querystring.decode(urlObj.query);
                const roomType = Array.isArray(query.room_type) ? query.room_type[0] : query.room_type.toString();

                if (roomType && this.isValidRoomType(roomType))
                {
                    var roomList = this.getRoomList(roomType);
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
     * Handling incoming unified socket connections
     * 
     * @param {UnifiedSocket} unifiedSocket 
     */
    _handleUnifiedConnection(unifiedSocket)
    {

    }

    /**
     * Handling incoming websocket connections
     * 
     * @param {IncomingMessage} request 
     * @param {Socket} socket 
     * @param {Buffer} head
     */
    _handleHttpUpgrade(request, socket, head)
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
                    this._wsServer.handleUpgrade(request, socket, head, (webSocket) => {
                        const unifiedSocket = new WebSocketUnifiedAdapter(webSocket);
                        this.createAndJoinRoom(roomTypeVO, unifiedSocket);
                    });
                }
                break;

            case '/join_room':
                const webRoomVO = query.room_id != null && this._getWebRoomVO(query.room_id);
                
                if (webRoomVO) 
                {
                    this._wsServer.handleUpgrade(request, socket, head, (webSocket) => {
                        const unifiedSocket = new WebSocketUnifiedAdapter(webSocket);
                        this.joinRoom(webRoomVO, unifiedSocket);
                    });
                }
                break;
        }

        if(socket.bytesWritten == 0)
        {
            this.emit('upgrade', request, socket, head);

            if(socket.bytesWritten == 0) socket.destroy();
        }
    }

    /**
     * @param {WebRoomType} roomTypeVO 
     * @param {UnifiedSocket} socket 
     */
    createAndJoinRoom(roomTypeVO, socket)
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

        this.joinRoom(webRoomVO, socket);
    }

    /**
     * @param {WebRoomVO} webRoomVO 
     * @param {UnifiedSocket} socket 
     */
    joinRoom(webRoomVO, socket)
    {
        webRoomVO.roomInstance.join(socket);
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

    /**
     * @param {string} roomType 
     */
    isValidRoomType(roomType)
    {
        return this._getRoomTypeVO(roomType) != undefined;
    }

    /**
     * @param {string} roomType
     * @returns {RoomInfo[]}
     */
    getRoomList(roomType)
    {
        return this._roomList
            .filter(webRoomVO => webRoomVO.roomType == roomType && !webRoomVO.roomInstance.isHidden)
            .map(webRoomVO => {
                return {id: webRoomVO.roomId, details: webRoomVO.roomInstance.details}
            });
    }
}

module.exports = WebRoomServer;