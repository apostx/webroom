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

        this._getGameServerUrl(this._connectToGameServer.bind(this));
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

    _onMessage(event)
    {
        var messageObj = JSON.parse(event.data);
        this.emit('message', messageObj);
    }

    _onClose(event)
    {
        this.emit('close');
    }

    _connectToGameServer(url)
    {
        this._webSocket = new WebSocket(`ws://${location.host}/${url}`);
        this._webSocket.onmessage = this._onMessage.bind(this);
        this._webSocket.onclose = this._onClose.bind(this);
    }

    _getGameServerUrl(cb)
    {
        let xhr = new XMLHttpRequest();
        xhr.open('get', 'get_room_list?room_type=tictactoe');
        xhr.responseType = 'json';

        xhr.onload = function()
        {
            let serverList = xhr.response;

            cb(
                serverList.length
                ? `join_room?room_id=${serverList[0].id}`
                : 'create_room?room_type=tictactoe'
            );
        };

        xhr.send();
    }
}