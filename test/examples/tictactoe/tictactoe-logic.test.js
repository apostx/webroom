const assert = require('assert');
const TicTacToeLogic = require('../../../examples/tictactoe/shared/tictactoe-logic');

describe('TicTacToeLogic [Unit Testing]', function()
{
    describe('#mark()', function()
    {
        const player1 = 'O';
        const player2 = 'X';

        function generateInProgressLogic(fieldList, markedFieldNum, currentPlayer)
        {
            const logic = new TicTacToeLogic();
            logic.init(player1, player2);
            logic._status = TicTacToeLogic.Status.IN_PROGRESS;
            logic._table._fieldList = fieldList;
            logic._markedFieldNum = markedFieldNum;
            logic._currentPlayer = currentPlayer;

            return logic;
        }

        function generateLogicForError()
        {
            return generateInProgressLogic([player1, null, null, null, null, null, null, null, null], 1, player2);
        }

        it('first player marks and no win', function()
        {
            const logic = generateInProgressLogic([null, null, null, null, null, null, null, null, null], 0, player1);

            logic.mark(0, 0);

            assert.deepEqual(logic._table._fieldList, [player1, null, null, null, null, null, null, null, null]);
            assert.equal(logic._markedFieldNum, 1);
            assert.equal(logic._currentPlayer, player2);
            assert.equal(logic._status, TicTacToeLogic.Status.IN_PROGRESS);
        });

        it('second player marks and no win', function()
        {
            const logic = generateInProgressLogic([player1, null, null, null, null, null, null, null, null], 1, player2);

            logic.mark(2, 2);

            assert.deepEqual(logic._table._fieldList, [player1, null, null, null, null, null, null, null, player2]);
            assert.equal(logic._markedFieldNum, 2);
            assert.equal(logic._currentPlayer, player1);
            assert.equal(logic._status, TicTacToeLogic.Status.IN_PROGRESS);
        });

        it('first player marks and win', function()
        {
            const logic = generateInProgressLogic([player1, player2, null, player1, player2, null, null, null, null], 4, player1);

            logic.mark(0, 2);

            assert.deepEqual(logic._table._fieldList, [player1, player2, null, player1, player2, null, player1, null, null]);
            assert.equal(logic._markedFieldNum, 5);
            assert.equal(logic._currentPlayer, player1);
            assert.equal(logic._status, TicTacToeLogic.Status.WIN);
        });

        it('second player marks and win', function()
        {
            const logic = generateInProgressLogic([player1, player2, null, player1, player2, null, null, null, player1], 5, player2);

            logic.mark(1, 2);

            assert.deepEqual(logic._table._fieldList, [player1, player2, null, player1, player2, null, null, player2, player1]);
            assert.equal(logic._markedFieldNum, 6);
            assert.equal(logic._currentPlayer, player2);
            assert.equal(logic._status, TicTacToeLogic.Status.WIN);
        });

        it('first player marks and draw', function()
        {
            const logic = generateInProgressLogic([player1, player1, player2, player2, player2, player1, player1, player2, null], 8, player1);

            logic.mark(2, 2);

            assert.deepEqual(logic._table._fieldList, [player1, player1, player2, player2, player2, player1, player1, player2, player1]);
            assert.equal(logic._markedFieldNum, 9);
            assert.equal(logic._currentPlayer, player1);
            assert.equal(logic._status, TicTacToeLogic.Status.DRAW);
        });

        it('error handling: second player marks with too low colIndex', function()
        {
            const logic = generateLogicForError();
            let isError = false;

            try
            {
                logic.mark(-1, 0);
            }
            catch(e)
            {
                isError = true;
            }
            finally
            {
                assert.equal(isError, true);
            }
        });

        it('error handling: second player marks with too high colIndex', function()
        {
            const logic = generateLogicForError();
            let isError = false;

            try
            {
                logic.mark(3, 0);
            }
            catch(e)
            {
                isError = true;
            }
            finally
            {
                assert.equal(isError, true);
            }
        });

        it('error handling: second player marks with too low rowIndex', function()
        {
            const logic = generateLogicForError();
            let isError = false;

            try
            {
                logic.mark(0, -1);
            }
            catch(e)
            {
                isError = true;
            }
            finally
            {
                assert.equal(isError, true);
            }
        });

        it('error handling: second player marks with too high rolIndex', function()
        {
            const logic = generateLogicForError();
            let isError = false;

            try
            {
                logic.mark(0, 3);
            }
            catch(e)
            {
                isError = true;
            }
            finally
            {
                assert.equal(isError, true);
            }
        });

        it('error handling: second player marks a used field', function()
        {
            const logic = generateLogicForError();
            let isError = false;

            try
            {
                logic.mark(0, 0);
            }
            catch(e)
            {
                isError = true;
            }
            finally
            {
                assert.equal(isError, true);
            }
        });
    });
});