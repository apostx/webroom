'use strict';

class TicTacToeConnection extends EventEmitter
{
    constructor()
    {
        super();
    }

    startGame()
    {
        this._getGameServerUrl(function(url)
        {
            const socket = new WebSocket(`ws://${location.host}/${url}`);
        });
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