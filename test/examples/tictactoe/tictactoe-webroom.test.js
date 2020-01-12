const assert = require('assert');
const WebSocket = require('ws');
const TicTacToeLogic = require('../../../examples/tictactoe/src/tictactoe-logic');
const TicTacToeWebRoom = require('../../../examples/tictactoe/src/tictactoe-webroom');

describe('TicTacToeWebRoom', function()
{
    describe('#join()', function()
    {
        function validateNextTurnMessage(msg)
        {
            assert.equal(typeof msg, 'object');
            assert.equal(msg.header, 'nextTurn');
            assert.equal(typeof msg.data, 'object');
            assert.equal(typeof msg.data.isYours, 'boolean');
        }

        it('first player joins', function()
        {
            const webRoom = new TicTacToeWebRoom();
            const player1 = new MockSocket(
                (eventName, listener) => assert.ok(true),
                (data) => assert.fail(),
                () => assert.fail()
            );
            
            webRoom.join(player1);

            assert.equal(webRoom._userList.length, 1);
        });

        it('second player joins', function()
        {
            const webRoom = new TicTacToeWebRoom();

            let player1Data = null;
            let player2Data = null;

            const player1 = new MockSocket(
                (eventName, listener) => assert.ok(true),
                (data) => {
                    if (player1Data) assert.fail();
                    else player1Data = JSON.parse(data);
                },
                () => assert.fail()
            );
            const player2 = new MockSocket(
                (eventName, listener) => assert.ok(true),
                (data) => {
                    if (player2Data) assert.fail();
                    else player2Data = JSON.parse(data);
                },
                () => assert.fail()
            );
            
            webRoom.join(player1);
            webRoom.join(player2);

            assert.equal(webRoom._userList.length, 2);

            validateNextTurnMessage(player1Data);
            validateNextTurnMessage(player2Data);

            assert.equal(player1Data.data.isYours && player2Data.data.isYours, false);
            assert.equal(player1Data.data.isYours || player2Data.data.isYours, true);
        });
    });

    describe('#_onSocketClose()', function()
    {
        it('first player leaves while waiting for new opponent', function()
        {
            const webRoom = new TicTacToeWebRoom();
            const player1 = new MockSocket(
                (eventName, listener) => assert.ok(true),
                (data) => assert.fail(),
                () => assert.fail()
            );

            webRoom._userList = [player1];

            webRoom._onSocketClose(player1);

            assert.equal(webRoom._userList.length, 0);
        });

        it('first player leaves while playing', function()
        {
            const webRoom = new TicTacToeWebRoom();
            const player1 = new MockSocket(
                (eventName, listener) => assert.ok(true),
                (data) => assert.fail(),
                () => assert.fail()
            );
            const player2 = new MockSocket(
                (eventName, listener) => assert.ok(true),
                (data) => assert.fail(),
                () => assert.ok(true)
            );

            webRoom._userList = [player1, player2];

            webRoom._onSocketClose(player1);
        });
    });

    describe('#_onMarkMessage()', function()
    {
        function validateMarkMessage(msg)
        {
            assert.equal(typeof msg, 'object');
            assert.equal(msg.header, 'mark');
            assert.equal(typeof msg.data, 'object');
            assert.equal(typeof msg.data.isYou, 'boolean');
            assert.equal(Number.isInteger(msg.data.colIndex), true);
            assert.equal(Number.isInteger(msg.data.rowIndex), true);
            assert.equal(typeof msg.data.status, 'string');
        }

        it('first player marks and no end');

        it('second player marks and end');
    });
});

class MockSocket extends WebSocket
{
    constructor(onceCallback, sendCallback, closeCallback)
    {
        super(null);

        this._onceCallback = onceCallback;
        this._sendCallback = sendCallback;
        this._closeCallback = closeCallback;
    }

    once(eventName, listener)
    {
        this._onceCallback && this._onceCallback(eventName, listener);
        return this;
    }
    
    send(data)
    {
        this._sendCallback && this._sendCallback(data);
    }
    
    close()
    {
        this._closeCallback && this._closeCallback();
    }
}