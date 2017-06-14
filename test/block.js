var assert = require('assert');
let Block = require('../src/block')

describe('block.js', () => {
    describe('#create()', () => {
        it('adds correct hash to block', () => {
            let b = Block.create('HASH');

            assert.equal(b.hash,"HASH");
        });
    });

    describe('#createFrom()', () => {
        it('adds correct hash to block', () => {
            let b = Block.create('HASH');
            let b2 = Block.createFrom(b);

            assert.equal(Block.computeHash(b), b2.hash);
        });
    });

    describe('#addTransaction()', () => {
        it("adds new transaction", () => {
            let b = Block.create("hash is added");
            Block.addTransaction(b, "first transaction");

            assert.deepEqual(b.data, ["first transaction"]);
        });

        it("computes hash with nonce", () => {
            let b = Block.create("hash is added");
            Block.addTransaction(b, "first transaction");

            assert.equal(Block.computeHash("hello",b).length, 64);
        });
    });
});

describe('#getVerificationMetadata()', () => {
    it('returns valid metadata for good blockchain', () => {
        let b1 = Block.create('HASH');
        let b2 = Block.createFrom(b1);
        let b3 = Block.createFrom(b2);

        assert.ok(Block.getVerificationMetadata([b1, b2, b3]).valid);
    });
});
