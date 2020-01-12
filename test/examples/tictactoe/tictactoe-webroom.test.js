var assert = require('assert');
var events = require('events');

describe('TicTacToeWebRoom', function()
{
    describe('#join()', function()
    {
        it('first player joins', function()
        {
        
        });

        it('second player joins', function()
        {
        
        });
    });

    describe('#_onMarkMessage()', function()
    {
        it('first player marks and no win', function()
        {
        
        });

        it('second player marks and no win', function()
        {
        
        });

        it('second player marks and win', function()
        {
        
        });

        it('second player marks and win', function()
        {
        
        });
    });
});

class MockSocket
{
    on(event, listener) {}
    send(data) {}
    close() {}
}