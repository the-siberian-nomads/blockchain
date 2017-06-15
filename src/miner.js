const Transaction = require('./transaction');
const Message = require('./message');
const Promise = require('promise');
const Block = require('./block');
const Util = require('./util');
const net = require('net');

function Miner(port, miner_public_key, miner_private_key, owner_public_key) {
    this.transaction_pool = [];
    this.transaction_map = {};
    this.blockchain = [];
    this.port = port;
    this.activelyMining = false;

    this.miner_public_key = miner_public_key;
    this.miner_private_key = miner_private_key;
    this.owner_public_key = owner_public_key;

    this.flushTransactionPool = flushTransactionPool.bind(this);
    this.addTransaction = addTransaction.bind(this);
    this.createGenesisBlock = createGenesisBlock.bind(this);
    this.createGenesisIfNeeded = createGenesisIfNeeded.bind(this);
    this.createNewCoin = createNewCoin.bind(this);
    this.latestBlock = latestBlock.bind(this);
    this.pushNewBlock = pushNewBlock.bind(this);
    this.computeHash = computeHash.bind(this);
    this.start = start.bind(this);
    this.main = main.bind(this);

    this.server = net.createServer((socket) => {
        socket.on('data', Message.handler(this, socket));
        socket.on('close', () => console.log("Connection closed."));
    });
}

// Start up the miner's main loop and TCP server.
function start() {
    this.server.listen(this.port, '127.0.0.1');

    this.main();
}

// Add all valid transactions to blockchain, clear the transaction pool.
function flushTransactionPool() {
    var transaction_promises = this.transaction_pool.map(this.addTransaction);

    this.transaction_pool = [];
    return Util.waitForAll(transaction_promises);
}

function addTransaction(transaction) {
    return Util
        .unblock()
        .then(() => {
            if (Transaction.verify(transaction, this.transaction_map, this.latestBlock())) {
                // TODO this should be moved to Block.addTransaction.
                Transaction.addToMap(transaction, this.transaction_map);

                Block.addTransaction(this.latestBlock(), transaction);
            }
        });
}

// Create the genesis block and reset state.
function createGenesisBlock() {
    this.blockchain = [ Block.create("genesis") ];
    this.transaction_map = {};
}

// We only need to create a genesis block if there is nothing in the blockchain.
function createGenesisIfNeeded() {
    return new Promise((resolve, reject) => {
        if (this.blockchain.length == 0)
            this.createGenesisBlock();

        return resolve();
    });
}

// Create a new coin transaction for new blocks.
function createNewCoin() {
    return Transaction.create(
        this.miner_public_key,
        this.miner_private_key,
        [],
        [{ owner_public_key: this.miner_public_key, value: 1.0 }],
        Transaction.TYPES.NEW_COIN
    );
}

// Get latest block in the blockchain, assuming it's of non-zero length.
function latestBlock() {
    return this.blockchain[ this.blockchain.length - 1 ];
}

// Add a new block onto the end of the current chain and push a new coin into it.
function pushNewBlock() {
    this.blockchain.push( Block.createFrom(this.latestBlock()) );

    this.transaction_pool.push( this.createNewCoin() );
}

// Run hash computation as part of the traditional bitcoin mining operation.
function computeHash() {
    // If we aren't mining we delay to keep CPU usage down.
    if (!this.activelyMining)
        return Util.delay(100);

    return new Promise((resolve, reject) => {
        this.latestBlock().nonce++;

        if (Block.computeHash(this.latestBlock()).startsWith("000")) {
            // TODO broadcast the new block.

            this.pushNewBlock();

            console.log("Current state of chain:");
            console.log('  ' + this.blockchain.map(Block.toString).join('\n  '));
            console.log("Is chain valid: " + Block.getVerificationMetadata(this.blockchain).valid);
            console.log();
        }

        return resolve()
    });

}

// Main miner loop - constantly running.
function main() {
    return Util
        .unblock()
        .then(this.createGenesisIfNeeded)
        .then(this.flushTransactionPool)
        .then(this.computeHash)
        .then(this.main)
        .catch((error) => console.error(error))
}

module.exports = Miner;
