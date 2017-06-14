var assert = require('assert');
var keypairs = require('./keypairs');
var Block = require('../src/block')
var Transaction = require('../src/transaction');

describe('block.js', () => {
    var sender = keypairs.sender;
    var owner = keypairs.owner;

    var coins;
    function initCoins() {
        coins = [];

        coins.push(Transaction.create(
            sender.public,
            sender.private,
            [],
            [{ owner_public_key: sender.public, value: 1.0 }],
            Transaction.TYPES.NEW_COIN
        ));

        coins.push(Transaction.create(
            sender.public,
            sender.private,
            [coins[0].signature],
            [{ owner_public_key: owner.public, value: 1.0 }],
            Transaction.TYPES.STANDARD
        ));

        coins.push(Transaction.create(
            owner.public,
            owner.private,
            [coins[1].signature],
            [
                { owner_public_key: owner.public, value: 0.5 },
                { owner_public_key: sender.public, value: 0.5 }
            ],
            Transaction.TYPES.STANDARD
        ));

        coins.push(Transaction.create(
            owner.public,
            owner.private,
            [],
            [{ owner_public_key: owner.public, value: 1.0 }],
            Transaction.TYPES.NEW_COIN
        ));
    }

    var chain;
    function initChain() {
        chain = [];

        chain.push(Block.create('FIRST'));
        Block.addTransaction(chain[0], coins[0])

        chain.push(Block.createFrom(chain[0]));
        Block.addTransaction(chain[1], coins[1]);

        chain.push(Block.createFrom(chain[1]));
        Block.addTransaction(chain[2], coins[2]);
        Block.addTransaction(chain[2], coins[3]);
    }

    beforeEach(() => {
        initCoins();
        initChain();
    });

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

    describe('#getVerificationMetadata()', () => {
        it('returns valid metadata for good empty blockchain', () => {
            let b1 = Block.create('HASH');
            let b2 = Block.createFrom(b1);
            let b3 = Block.createFrom(b2);

            assert.ok(Block.getVerificationMetadata([b1, b2, b3]).valid);
        });

        it('returns valid metadata for good nonempty blockchain', () => {
            assert.ok(Block.getVerificationMetadata(chain).valid);
        });
    });
});
