'use strict';

class TicTacToeConnection extends EventEmitter
{
    constructor()
    {
        super();
        this._webSocket = null;
    }

    init()
    {
        if (this._webSocket)
        {
            this._webSocket.onmessage = null;
            this._webSocket.onclose = null;
            this._webSocket.close();
            this._webSocket = null;
        }

        this._webSocket = new WebSocket(`ws://${location.host}/`);
        this._webSocket.onopen = this.getRoomList.bind(this);
        this._webSocket.onmessage = this._onMessage.bind(this);
        this._webSocket.onclose = this._onClose.bind(this);
    }

    sendMark(colIndex, rowIndex)
    {
        this._webSocket.send(JSON.stringify({
            header: 'mark',
            data: {
                colIndex: colIndex,
                rowIndex: rowIndex
            }
        }));
    }

    joinRoom(roomId)
    {
        this._webSocket.send(JSON.stringify({
            header: 'join_room',
            data: {
                roomId: roomId
            }
        }));
    }

    createAndJoinRoom()
    {
        this._webSocket.send(JSON.stringify({
            header: 'create_room',
            data: {
                roomType: 'tictactoe'
            }
        }));
    }

    getRoomList()
    {
        this._webSocket.send(JSON.stringify({
            header: 'get_room_list',
            data: {
                roomType: 'tictactoe'
            }
        }));
    }

    _onMessage(event)
    {
        var messageObj = JSON.parse(event.data);
        this.emit('message', messageObj);
    }

    _onClose(event)
    {
        this.emit('close');
    }
}