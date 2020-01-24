'use strict';

const url = require('url');
const querystring = require('querystring');
const events = require('events');

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
        this._handleUnifiedMessage = this._handleUnifiedMessage.bind(this);
        this._subscribeNextUnifiedSocketData = this._subscribeNextUnifiedSocketData.bind(this);
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
        //TODO Remove all of the listeners when it is not used anymore
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
                const roomTypeVO = query.room_type != null && this._getRoomTypeVO(query.room_type);
                
                if (roomTypeVO) 
                {
                    this._wsServer.handleUpgrade(request, socket, head, (webSocket) => {
                        this.createAndJoinRoom(roomTypeVO, webSocket);
                        //TODO if join is not successfull then go back to the lobby
                    });
                }
                break;

            case '/join_room':
                const webRoomVO = query.room_id != null && this._getWebRoomVO(query.room_id);
                
                if (webRoomVO) 
                {
                    this._wsServer.handleUpgrade(request, socket, head, (webSocket) => {
                        this.joinRoom(webRoomVO, webSocket);
                        //TODO if join is not successfull then go back to the lobby
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
        unifiedServer.on('connection', this._subscribeNextUnifiedSocketData);
    }

    /**
     * Handling incoming unified socket connections
     * 
     * @param {UnifiedSocket} socket 
     */
    _subscribeNextUnifiedSocketData(socket)
    {
        socket.once('message', (message) => this._handleUnifiedMessage(socket, message));
    }

    /**
     * Handling incoming unified socket data
     * 
     * @param {UnifiedSocket} socket 
     * @param {string} data 
     */
    _handleUnifiedMessage(socket, data)
    {
        var messageObj = JSON.parse(data);

        //TODO check the struct of messages: {header:string, data:*}

        let answerObj = null;
        let isJoined = null;

        switch(messageObj.header)
        {
            case 'get_room_list':
                const roomListType = messageObj.data.roomType;

                if (roomListType && this.isValidRoomType(roomListType))
                {
                    const roomList = this.getRoomList(roomListType);

                    answerObj = {
                        header: 'room_list',
                        data: {
                            roomList: roomList
                        }
                    };
                }

                this._subscribeNextUnifiedSocketData(socket);

                break;

            case 'create_room':
                const roomType = messageObj.data.roomType;

                //TODO Should check this kind of cases...maybe should use undefined instead of null
                const roomTypeVO = roomType != null && this._getRoomTypeVO(roomType);
                
                if (roomTypeVO)
                {
                    isJoined = this.createAndJoinRoom(roomTypeVO, socket);
                }
                break;

            case 'join_room':
                const roomId = messageObj.data.roomId;
                const webRoomVO = roomId != null && this._getWebRoomVO(roomId);
                
                if (webRoomVO) 
                {
                    isJoined = this.joinRoom(webRoomVO, socket);
                }
                break;
        }

        if (isJoined != null)
        {
            answerObj = {
                header: 'join_room',
                data: {
                    isJoined: isJoined
                }
            };

            if (!isJoined) this._subscribeNextUnifiedSocketData(socket);
        }

        if (answerObj) socket.send(JSON.stringify(answerObj));
        else socket.close();
    }

    /**
     * @param {WebRoomType} roomTypeVO
     * @param {UnifiedSocket} socket
     * @returns {boolean}
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

        roomInstance.once('leave', this._subscribeNextUnifiedSocketData);
        roomInstance.once('destroy', this._destroyRoom.bind(this, webRoomVO));

        const isJoined = this.joinRoom(webRoomVO, socket);
        
        if (isJoined) this._roomList.push(webRoomVO);

        return isJoined;
    }

    /**
     * @param {WebRoomVO} webRoomVO
     * @param {UnifiedSocket} socket
     * @returns {boolean}
     */
    joinRoom(webRoomVO, socket)
    {
        return webRoomVO.roomInstance.join(socket);
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