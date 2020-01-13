const assert = require('assert');
const WebSocket = require('ws');
const TicTacToeLogic = require('../../../examples/tictactoe/src/tictactoe-logic');
const TicTacToeWebRoom = require('../../../examples/tictactoe/src/tictactoe-webroom');

describe('TicTacToeWebRoom [Integration Testing]', function()
{
    it.skip('First player joined and left', function()
    {

    });

    it.skip('The game started but a player left', function()
    {

    });

    describe('The game started but a player sent wrong data', function()
    {
        it.skip('Column index is not a number', function()
        {

        });

        it.skip('Row index is not a number', function()
        {
            
        });

        it.skip('Indexes are out of table', function()
        {
            
        });

        it.skip('Field is already marked', function()
        {
            
        });
    });

    describe('The game started and finished', function()
    {
        it.skip('First Player Wins', function()
        {

        });

        it.skip('Second Player Wins', function()
        {

        });

        it.skip('Draw', function()
        {

        });
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