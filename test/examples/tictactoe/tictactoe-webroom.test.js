const WebSocket = require('ws');
const WebRoom = require('../../../');
const TicTacToeWebRoom = require('../../../examples/tictactoe/server/tictactoe-webroom');

const HTTP_PORT = 8080;

/**
 * @typedef {import('../../../lib/abstract-webroom').UnifiedSocket} UnifiedSocket
 */

describe('TicTacToeWebRoom [Integration Testing]', function()
{
    /**
     * @param {UnifiedSocket} socket 
     * @param {string} event 
     */
    function waitForEvent(socket, event)
    {
        return new Promise((resolve) => {
            socket.once(event, resolve);
        })
    }

    /**
     * @param {UnifiedSocket} socket 
     * @param {object} message 
     */
    function sendMessage(socket, message)
    {
        socket.send(JSON.stringify(message));
    }

    /**
     * @param {UnifiedSocket} socket
     * @param {string} header
     * @param {(data: object, resolve: (value?: any) => void, reject: (reason?: any) => void) => void} [callback] synchronous callback to avoid late calls of Promise::then
     */
    function waitForMessage(socket, header, callback)
    {
        return new Promise((resolve, reject) => {
            socket.once('message', (message) => {
                const messageObj = JSON.parse(message);
                if (messageObj.header === header)
                {
                    if (callback)
                    {
                        callback(messageObj.data, resolve, reject);
                    }
                    else
                    {
                        resolve(messageObj.data);
                    }
                }
                else
                {
                    reject(`Wrong message header: ${messageObj.header} [expected: ${header}]`);
                }
            });
        })
    }

    describe('HTTP/WebSocket', () => {
        it.skip('Complete game process test (with win)');
    });

    describe('Unified WebSocket', () => {

        let webSocketServer = null;
        let sockets = null;

        beforeEach(() => {
            webSocketServer = new WebSocket.Server({port: HTTP_PORT});
            
            const webRoom = new TicTacToeWebRoom();
            const webRoomServer = new WebRoom.Server({
                unifiedServerList: [webSocketServer],
                roomTypeList: [{
                    type: 'tictactoe',
                    moduleContainer: {module: TicTacToeWebRoom}
                }]
            });

            sockets = [
                new WebSocket(`ws://localhost:${HTTP_PORT}`),
                new WebSocket(`ws://localhost:${HTTP_PORT}`),
            ];
        });

        afterEach(() => {
            const server = webSocketServer;

            webSocketServer = null;
            sockets = null;

            return server.close();
        });

        it('Complete game process test (with win)', () => {
            let markObj = null;
            let socketIndex = null;

            /**
             * @param {*} expectedStatus 
             * @param {*} responseData 
             */
            function checkMarkResponse(expectedStatus, responseData)
            {
                return responseData.status == expectedStatus
                && responseData.colIndex == markObj.colIndex
                && responseData.rowIndex == markObj.rowIndex;
            }

            /**
             * @param {UnifiedSocket} socket 
             * @param {*} turnData 
             * @param {*} markObj 
             * @param {(data: any, resolve: (value?: any) => void, reject: (reason?: any) => void) => void} [callback]
             */
            function markIfPossibleAnsWaitForResponse(socket, turnData, markObj, callback)
            {
                return Promise.resolve(turnData)
                    .then((data) => {
                        if (data.isYours)
                        {
                            const newSocketIndex = sockets.indexOf(socket);
                            if (socketIndex === newSocketIndex)
                            {
                                return Promise.reject(`Wrong new socket index: ${newSocketIndex} [original: ${socketIndex}]`);
                            }
                            socketIndex = newSocketIndex;
                            sendMessage(socket, {header: 'mark', data: markObj});
                        }
                        return waitForMessage(socket, 'mark', callback);
                    });
            }

            /**
             * @param {UnifiedSocket} socket 
             * @param {*} turnData 
             * @param {*} markObj 
             * @param {string} expectedStatus 
             */
            function markIfPossibleAndWaitForNextTurn(socket, turnData, markObj, expectedStatus)
            {
                return Promise.resolve(turnData)
                    .then((data) => {
                        return markIfPossibleAnsWaitForResponse(socket, turnData, markObj, (data, resolve, reject) => {
                            if (checkMarkResponse(expectedStatus, data))
                            {
                                waitForMessage(socket, 'nextTurn').then(resolve);
                            }
                            else
                            {
                                reject(`Wrong mark message: ${JSON.stringify(data)}`);
                            }
                        });
                    });
            }
            
            return Promise.all([
                    waitForEvent(sockets[0], 'open'),
                    waitForEvent(sockets[1], 'open')
                ])
                .then(() => {
                    sendMessage(sockets[0], {header: 'create_room', data: {roomType: 'tictactoe'}});
                    sendMessage(sockets[1], {header: 'get_room_list', data: {roomType: 'tictactoe'}});
                    return waitForMessage(sockets[1], 'room_list');
                })
                .then((data) => {
                    sendMessage(sockets[1], {header: 'join_room', data: {roomId: data.roomList[0].id}});
                    return Promise.all([
                        waitForMessage(sockets[0], 'nextTurn'),
                        waitForMessage(sockets[1], 'nextTurn')
                    ]);
                })
                .then((data) => {
                    markObj = {colIndex: 0, rowIndex: 0};
                    return Promise.all([
                        markIfPossibleAndWaitForNextTurn(sockets[0], data[0], markObj, 'in_progress'),
                        markIfPossibleAndWaitForNextTurn(sockets[1], data[1], markObj, 'in_progress')
                    ]);
                })
                .then((data) => {
                    markObj = {colIndex: 1, rowIndex: 0};
                    return Promise.all([
                        markIfPossibleAndWaitForNextTurn(sockets[0], data[0], markObj, 'in_progress'),
                        markIfPossibleAndWaitForNextTurn(sockets[1], data[1], markObj, 'in_progress')
                    ]);
                })
                .then((data) => {
                    markObj = {colIndex: 0, rowIndex: 1};
                    return Promise.all([
                        markIfPossibleAndWaitForNextTurn(sockets[0], data[0], markObj, 'in_progress'),
                        markIfPossibleAndWaitForNextTurn(sockets[1], data[1], markObj, 'in_progress')
                    ]);
                })
                .then((data) => {
                    markObj = {colIndex: 1, rowIndex: 1};
                    return Promise.all([
                        markIfPossibleAndWaitForNextTurn(sockets[0], data[0], markObj, 'in_progress'),
                        markIfPossibleAndWaitForNextTurn(sockets[1], data[1], markObj, 'in_progress')
                    ]);
                })
                .then((data) => {
                    markObj = {colIndex: 0, rowIndex: 2};
                    return Promise.all([
                        markIfPossibleAnsWaitForResponse(sockets[0], data[0], markObj),
                        markIfPossibleAnsWaitForResponse(sockets[1], data[1], markObj)
                    ]);
                })
                .then((data) => {
                    let promise = null;
                    if(
                        checkMarkResponse('win', data[0])
                        && checkMarkResponse('win', data[1])
                    )
                    {
                        Promise.all([
                            waitForEvent(sockets[0], 'close'),
                            waitForEvent(sockets[1], 'close')
                        ])
                    }
                    else
                    {
                        promise = Promise.reject(`Wrong mark response(s): ${JSON.stringify(data)}`);
                    }
                    return promise;
                });
        });
    });

    describe('Unified Socket', () => {
        it.skip('Complete game process test (with win)');
    });
});