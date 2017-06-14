const Transaction = require('./transaction');
const sha = require('sha256')

// Creates a block from a hash of a previous block and data.
function create(hash, data, nonce){
    return {
        hash: hash,
        data: data || [],
        nonce: nonce || 0
    };
}

// Create a block following on from another.
function createFrom(block, data, nonce) {
    return create(computeHash(block), data, nonce);
}

function toString(block) {
    return block.hash + " : " + block.data.length + " transactions : " + block.nonce;
}

// Push a transaction to the block's transaction chain.
// No verification is done on the transaction.
function addTransaction(block, transaction){
    block.data.push(transaction);
}

// Returns string of data to be hashed for block.
function hashData(block) {
    return JSON.stringify({
        hash: block.hash,
        data: block.data,
        nonce: block.nonce
    });
}

function computeHash(block){
  return sha.x2(hashData(block));
}

// Verify that a chain of blocks is correctly hashed and get metadata for
// optimised future transaction verification.
function getVerificationMetadata(blocks) {
    for (var i = 1; i < blocks.length; i++) {
        if (blocks[i].hash != computeHash(blocks[i-1]))
            return { valid: false };
    }

    // Check the transaction history is correct.
    var transaction_metadata = Transaction.getVerificationMetadata(blocks);
    if (!transaction_metadata.valid)
        return { valid: false };

    // Returns the transaction map along with the validation.
    return transaction_metadata;
}

module.exports = {
    toString : toString,
    create: create,
    createFrom: createFrom,
    computeHash: computeHash,
    addTransaction: addTransaction,
    getVerificationMetadata: getVerificationMetadata
}
