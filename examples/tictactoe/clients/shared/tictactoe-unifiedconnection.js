'use strict';

/**
 * @typedef {import('../../../../lib/webroom-server').UnifiedSocket} UnifiedSocket
 */

/**
 * @typedef {{
 *     header: string,
 *     data: *
 * }} Message
 */

class TicTacToeUnifiedConnection
{
    /**
     * @param {() => UnifiedSocket} createUnifiedSocket 
     */
    constructor(createUnifiedSocket)
    {
        this._createUnifiedSocket = createUnifiedSocket;

        /** @type {(Message) => void} */
        this.onmessage = null;

        /** @type {(Error) => void} */
        this.onerror = null;

        /** @type {() => void} */
        this.onclose = null;

        /** @type UnifiedSocket*/
        this._socket = null;

        // Bind
        this._requestRoomList = this._requestRoomList.bind(this);
        this._onMessage = this._onMessage.bind(this);
        this._onError = this._onError.bind(this);
        this._onClose = this._onClose.bind(this);
    }

    init()
    {
        if (this._socket)
        {
            this._socket.off('open', this._requestRoomList);
            this._socket.off('message', this._onMessage);
            this._socket.off('error', this._onError);
            this._socket.off('close', this._onClose);

            this._socket.close();
            
            this._socket = null;
        }

        this._socket = this._createUnifiedSocket();
        
        this._socket.on('open', this._requestRoomList);
        this._socket.on('message', this._onMessage);
        this._socket.on('error', this._onError);
        this._socket.on('close', this._onClose)
    }

    _requestRoomList()
    {
        this._socket.send(JSON.stringify({
            header: 'get_room_list',
            data: {
                roomType: 'tictactoe'
            }
        }));
    }

    sendMark(colIndex, rowIndex)
    {
        this._socket.send(JSON.stringify({
            header: 'mark',
            data: {
                colIndex: colIndex,
                rowIndex: rowIndex
            }
        }));
    }

    _joinRoom(roomId)
    {
        this._socket.send(JSON.stringify({
            header: 'join_room',
            data: {
                roomId: roomId
            }
        }));
    }

    _createAndJoinRoom()
    {
        this._socket.send(JSON.stringify({
            header: 'create_room',
            data: {
                roomType: 'tictactoe'
            }
        }));
    }

    _onMessage(event)
    {
        /** @type Message */
        var messageObj = JSON.parse(event);

        if (messageObj.header == 'room_list')
        {
            const roomList = messageObj.data.roomList;
            if (roomList.length > 0)
            {
                this._joinRoom(roomList[0].id);
            }
            else
            {
                this._createAndJoinRoom();
            }
        }
        else
        {
            this.onmessage && this.onmessage(messageObj);
        }
    }

    /**
     * @param {Error} error 
     */
    _onError(error)
    {
        this.onerror && this.onerror(error);
    }

    _onClose()
    {
        this.onclose && this.onclose();
    }
}

if (typeof module === 'object' && module.exports) module.exports = TicTacToeUnifiedConnection;