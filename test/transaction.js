var Transaction = require('../src/transaction');
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

    var wrongFields = {
        this: 0, is: 0, not: 0, a: 0, coin: 0
    }

    before(() => {
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

/**getInputValue: getInputValue,
getOutputValue: getOutputValue,
hasCorrectFields: hasCorrectFields,
hasValidSignature: hasValidSignature,
hasDuplicateOutputs: hasDuplicateOutputs,
hasExistingInputs: hasExistingInputs,
hasOwnedInputs: hasOwnedInputs,**/

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
    })
});
