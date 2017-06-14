var assert = require('assert');
let block = require('../src/block')

describe('block', () => {
    describe('#test1()', () => {
        it("adds previous hash to block", () => {
            let b = block.block("hash is added");
            assert.equal(b.hash,"hash is added");
        });
    });
});

describe('block', () => {
    describe('#test2()', () => {
        it("adds new transaction", () => {
            let b = block.block("hash is added");
            b = block.addTransaction(b, "first transaction");
            assert.equal(b.data,"first transaction");
        });
    });
});

describe('block', () => {
    describe('#test3()', () => {
        it("computes hash with nonce", () => {
            let b = block.block("hash is added");
            b = block.addTransaction(b, "first transaction");
            assert.equal(block.computeHash("hello",b).length,64);
        });
    });
});
