var Transaction = require('../src/transaction');
var Block = require('../src/block');
var keypairs = require('./keypairs');
var assert = require('assert');

describe('transaction.js', () => {
    var sender = keypairs.sender;
    var owner = keypairs.owner;

    var goodNewCoin;
    function initGoodNewCoin() {
        goodNewCoin = Transaction.create(
            sender.public,
            sender.private,
            [],
            [{ owner_public_key: sender.public, value: 1.0 }],
            Transaction.TYPES.NEW_COIN
        );
    }

    var goodStandard;
    function initGoodStandard() {
        goodStandard = Transaction.create(
            sender.public,
            sender.private,
            [goodNewCoin.signature],
            [
                { owner_public_key: owner.public, value: 0.5},
                { owner_public_key: sender.public, value: 0.5}
            ],
            Transaction.TYPES.STANDARD
        );
    }

    beforeEach(() => {
        initGoodNewCoin();
        initGoodStandard();

        transactionMap = {};
    });

    describe('#clone()', () => {
        it('should clone a transaction successfully', () => {
            var transaction = Transaction.clone(goodNewCoin);
            assert.deepEqual(transaction, goodNewCoin);

            transaction.signature = '';
            assert.notDeepEqual(transaction, goodNewCoin);
        });
    });

    describe('#equal()', () => {
        it('should return true for equal transactions', () => {
            var transaction = Transaction.clone(goodStandard);
            assert.ok(Transaction.equal(transaction, goodStandard));
        });

        it('should return false for inequal transactions', () => {
            var transaction = Transaction.clone(goodStandard);
            transaction.type = Transaction.TYPES.NEW_COIN;

            assert.ok(!Transaction.equal(transaction, goodStandard));
        });
    });

    describe('#getInputValue()', () => {
        it('should get the correct input value', () => {
            Transaction.addToMap(goodNewCoin, transactionMap);
            Transaction.addToMap(goodStandard, transactionMap);

            assert.equal(1.0, Transaction.getInputValue(goodStandard, transactionMap));
            assert.equal(0.0, Transaction.getInputValue(goodNewCoin, transactionMap));
        });
    });

    describe('#getOutputValue()', () => {
        it('should get the correct output value', () => {
            assert.equal(1.0, Transaction.getOutputValue(goodStandard));
            assert.equal(1.0, Transaction.getOutputValue(goodNewCoin));
        });
    });

    describe('#hasCorrectFields()', () => {
        it('should return true for good coins', () => {
            assert.ok(Transaction.hasCorrectFields(goodStandard));
            assert.ok(Transaction.hasCorrectFields(goodNewCoin));
        });

        it('should return false for bad coins', () => {
            var wrongFields = { this: 0, is: 0, not: 0, a: 0, coin: 0 };

            assert.ok(!Transaction.hasCorrectFields(wrongFields));
        });
    });

    describe('#hasValidSignature()', () => {
        it('should return true for good coins', () => {
            assert.ok(Transaction.hasValidSignature(goodStandard));
            assert.ok(Transaction.hasValidSignature(goodNewCoin));
        });

        it ('should return false for bad coins', () => {
            var badSignature = Transaction.clone(goodStandard);
            badSignature.signature = goodNewCoin.signature;

            assert.ok(!Transaction.hasValidSignature(badSignature));
        });
    });

    describe('#hasDuplicateOutputs()', () => {
        it('should return false for good coins', () => {
            assert.ok(!Transaction.hasDuplicateOutputs(goodStandard));
            assert.ok(!Transaction.hasDuplicateOutputs(goodNewCoin));
        });

        it('should return true for bad coins', () => {
            var duplicateOutputs = Transaction.clone(goodStandard);
            duplicateOutputs.outputs.forEach(output => output.owner_public_key = goodStandard.sender_public_key);

            assert.ok(Transaction.hasDuplicateOutputs(duplicateOutputs));
        });
    });

    describe('#hasExistingInputs()', () => {
        it('should return true for good coins', () => {
            Transaction.addToMap(goodNewCoin, transactionMap);
            Transaction.addToMap(goodStandard, transactionMap);

            assert.ok(Transaction.hasExistingInputs(goodStandard, transactionMap));
            assert.ok(Transaction.hasExistingInputs(goodNewCoin, transactionMap));
        });

        it('should return false for good coins', () => {
            Transaction.addToMap(goodNewCoin, transactionMap);
            Transaction.addToMap(goodStandard, transactionMap);

            var nonExistingInputs = Transaction.clone(goodStandard);
            nonExistingInputs.inputs[0] = 'NONEXISTING';

            assert.ok(!Transaction.hasExistingInputs(nonExistingInputs, transactionMap));
        });
    });

    describe('#hasOwnedInputs()', () => {
        it('should return true for good coins', () => {
            Transaction.addToMap(goodNewCoin, transactionMap);

            assert.ok(Transaction.hasOwnedInputs(goodStandard, transactionMap));
            assert.ok(Transaction.hasOwnedInputs(goodNewCoin, transactionMap));
        });

        it('should return false for bad coins', () => {
            Transaction.addToMap(goodNewCoin, transactionMap);

            var nonOwnedInputs = Transaction.clone(goodStandard);
            nonOwnedInputs.sender_public_key = 'NOTOWNED';

            assert.ok(!Transaction.hasOwnedInputs(nonOwnedInputs, transactionMap));
        });
    });

    describe('#isFirstNewCoin()', () => {
        it('should return true for no new coins yet', () => {
            var block = Block.create('HASH');

            assert.ok(Transaction.isFirstNewCoin(goodNewCoin, block));
        });

        it('should return true for only new coin', () => {
            var block = Block.create('HASH');
            Block.addTransaction(block, goodNewCoin);

            assert.ok(Transaction.isFirstNewCoin(goodNewCoin, block));
        });

        it('should return false for multiple new coins', () => {
            var block = Block.create('HASH');
            Block.addTransaction(block, goodNewCoin)
            Block.addTransaction(block, goodNewCoin)

            assert.ok(!Transaction.isFirstNewCoin(goodNewCoin, block));
        });

        it('should return false for a different new coin', () => {
            var block = Block.create('HASH');
            var transaction = Transaction.clone(goodNewCoin);
            transaction.sender_public_key = 'DIFFERENT';
            Block.addTransaction(block, transaction);

            assert.ok(!Transaction.isFirstNewCoin(goodNewCoin, block));
        });
    });

    describe('#verify()', () => {
        it('should return true for good coins', () => {
            var block = Block.create('HASH');

            assert.ok(Transaction.verify(goodNewCoin, transactionMap, block));
            assert.ok(!Transaction.verify(goodStandard, transactionMap));

            Transaction.addToMap(goodNewCoin, transactionMap);
            assert.ok(Transaction.verify(goodStandard, transactionMap));
        });
    });
});
