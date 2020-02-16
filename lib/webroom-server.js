'use strict';

const url = require('url');
const querystring = require('querystring');
const events = require('events');
const UnifiedSocketEventTarget = require('../lib/unifiedsocket-eventtarget');

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

        //Http Bind
        this._handleHttpRequest = this._handleHttpRequest.bind(this);
        this._handleHttpUpgrade = this._handleHttpUpgrade.bind(this);
        
        //WebRoom bind
        this._handleLeaveRoom = this._handleLeaveRoom.bind(this);
        this._handleDestroyRoom = this._handleDestroyRoom.bind(this);

        //Socket bind
        this._initUnifiedSocket = this._initUnifiedSocket.bind(this);

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
        
        switch(urlObj.pathname)
        {
            case '/create_room':
                const roomTypeVO = query.room_type && this._getRoomTypeVO(query.room_type);
                
                if (roomTypeVO) 
                {
                    this._wsServer.handleUpgrade(request, socket, head, (webSocket) => {
                        const socketEventTarget = new UnifiedSocketEventTarget(webSocket);
                        this._registerSocketEventHandlers(socketEventTarget);
                        this.createAndJoinRoom(roomTypeVO, socketEventTarget);
                    });
                }
                break;

            case '/join_room':
                const webRoomVO = query.room_id != undefined && this._getWebRoomVO(query.room_id);
                
                if (webRoomVO) 
                {
                    this._wsServer.handleUpgrade(request, socket, head, (webSocket) => {
                        const socketEventTarget = new UnifiedSocketEventTarget(webSocket);
                        this._registerSocketEventHandlers(socketEventTarget);
                        this.joinRoom(webRoomVO, socketEventTarget);
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
     * @param {events.EventEmitter} unifiedServer 
     */
    _initUnifiedServer(unifiedServer)
    {
        unifiedServer.on('connection', this._initUnifiedSocket);
    }

    /**
     * @param {UnifiedSocket} unifiedSocket 
     */
    _initUnifiedSocket(unifiedSocket)
    {
        const socketEventTarget = new UnifiedSocketEventTarget(unifiedSocket);
        this._registerSocketEventHandlers(socketEventTarget);
    }

    /**
     * @param {UnifiedSocketEventTarget} socketEventTarget 
     */
    _registerSocketEventHandlers(socketEventTarget)
    {
        const onUnifiedSocketConnectionEnd = socketEventTarget.unlink.bind(socketEventTarget);

        socketEventTarget.onMessage = this._onUnifiedSocketMessage.bind(this, socketEventTarget);
        socketEventTarget.onError = onUnifiedSocketConnectionEnd;
        socketEventTarget.onClose = onUnifiedSocketConnectionEnd;
    }

    /**
     * Handling incoming unified socket message
     * 
     * @param {UnifiedSocketEventTarget} socketEventTarget 
     * @param {string} data 
     */
    _onUnifiedSocketMessage(socketEventTarget, data)
    {
        const socket = socketEventTarget.target;
        let isError = false;
        var messageObj = null;
        
        try {
            messageObj = JSON.parse(data);
        }
        catch(error)
        {
            isError = true;
        }

        if (!isError) switch(messageObj.header)
        {
            case 'get_room_list':
                const roomListType = messageObj.data.roomType;

                if (roomListType && this.isValidRoomType(roomListType))
                {
                    const roomList = this.getRoomList(roomListType);

                    socket.send(JSON.stringify(
                    {
                        header: 'room_list',
                        data: {
                            roomList: roomList
                        }
                    }));
                }
                else
                {
                    isError = true;
                }
                break;

            case 'create_room':
                const roomType = messageObj.data.roomType;
                const roomTypeVO = roomType && this._getRoomTypeVO(roomType);
                
                if (roomTypeVO)
                {
                    this.createAndJoinRoom(roomTypeVO, socketEventTarget);
                }
                else
                {
                    isError = true;
                }
                break;

            case 'join_room':
                const roomId = messageObj.data.roomId;
                const webRoomVO = roomId != undefined && this._getWebRoomVO(roomId);
                
                if (webRoomVO) 
                {
                    this.joinRoom(webRoomVO, socketEventTarget);
                }
                else
                {
                    isError = true;
                }
                break;
            
            default:
                isError = true;
        }

        if (isError)
        {
            socket.close();
        }
    }

    /**
     * @param {WebRoomType} roomTypeVO
     * @param {UnifiedSocketEventTarget} socketEventTarget
     */
    createAndJoinRoom(roomTypeVO, socketEventTarget)
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

        roomInstance.once('leave', this._handleLeaveRoom);
        roomInstance.once('destroy', this._handleDestroyRoom);

        this._roomList.push(webRoomVO);

        this.joinRoom(webRoomVO, socketEventTarget);
    }

    /**
     * @param {WebRoomVO} webRoomVO
     * @param {UnifiedSocketEventTarget} socketEventTarget
     */
    joinRoom(webRoomVO, socketEventTarget)
    {
        const socket = socketEventTarget.target;
        const canJoin = webRoomVO.roomInstance.canJoin(socket);
        
        socket.send(JSON.stringify({
            header: 'join_room',
            data: {
                isJoined: canJoin
            }
        }));

        if (canJoin)
        {
            // unlink + join = given full control of socket connection to the room
            socketEventTarget.unlink();
            webRoomVO.roomInstance.join(socket);
        }
    }

    /**
     * @param {UnifiedSocket} socket 
     */
    _handleLeaveRoom(socket)
    {
        socket.send(JSON.stringify({
            header: 'leave_room'
        }));

        this._initUnifiedSocket(socket);
    }

    /**
     * 
     * @param {AbstractWebRoom} roomInstance 
     */
    _handleDestroyRoom(roomInstance)
    {
        roomInstance.off('leave', this._handleLeaveRoom);

        const roomIndex = this._roomList.findIndex((webRoomVO) => webRoomVO.roomInstance == roomInstance);

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