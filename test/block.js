var assert = require('assert');
let block = require('../src/block')

describe('block.js', () => {
    describe('#block()', () => {
        it("adds previous hash to block", () => {
            let b = block.block("hash is added");
            assert.equal(b.hash,"hash is added");
        });
    });

    describe('#addTransaction()', () => {
        it("adds new transaction", () => {
            let b = block.block("hash is added");
            block.addTransaction(b, "first transaction");

            assert.deepEqual(b.data, ["first transaction"]);
        });

        it("computes hash with nonce", () => {
            let b = block.block("hash is added");
            block.addTransaction(b, "first transaction");

            assert.equal(block.computeHash("hello",b).length, 64);
        });
    });
});
