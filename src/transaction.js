var deepcopy = require('deepcopy');
var NodeRSA = require('node-rsa');
var assert = require('assert');

var TYPES = {
    STANDARD: 'STANDARD',
    NEW_COIN: 'NEW_COIN'
}

function generateKeyPair() {
    var key = new NodeRSA();
    key.generateKeyPair();

    return {
        public: key.exportKey('public'),
        private: key.exportKey('private')
    }
}

// Utility for verifying signatures in transactions.
function unencryptedSignature(transaction) {
    var signature_data = {
        sender_public_key: transaction.sender_public_key,
        inputs: transaction.inputs,
        outputs: transaction.outputs,
        type: transaction.type
    }

    return JSON.stringify(signature_data);
}

function create(sender_public_key, sender_private_key, inputs, outputs, type) {
    var transaction = {
        sender_public_key: sender_public_key,
        inputs: inputs,
        outputs: outputs,
        type: type
    }

    var key = new NodeRSA(sender_private_key);
    transaction.signature = key.sign(unencryptedSignature(transaction), 'base64', 'utf8');

    return transaction;
}

function clone(transaction) {
    return deepcopy(transaction);
}

function equal(t1, t2) {
    if (t1.type != t2.type) return false;
    if (t1.signature != t2.signature) return false;
    if (t1.sender_public_key != t2.sender_public_key) return false;

    if (t1.inputs.length != t2.inputs.length) return false;
    for (var i = 0; i < t1.inputs.length; i++)
        if (t1.inputs[i] != t2.inputs[i]) return false;

    if (t2.outputs.length != t2.outputs.length) return false;
    for (var i = 0; i < t2.outputs.length; i++) {
        if (t1.outputs[i].owner_public_key != t2.outputs[i].owner_public_key) return false;
        if (t1.outputs[i].value != t2.outputs[i].value) return false;
    }

    return true;
}

function getOutputValue(transaction) {
    var total = 0.0;
    transaction.outputs.forEach((output) => {
        total += output.value;
    });

    return total;
}

function getInputValue(transaction, transaction_map) {
    var total = 0.0;
    transaction.inputs.forEach((input) => {
        transaction_map[input].outputs.forEach((output) => {
            if (output.owner_public_key === transaction.sender_public_key)
                total += output.value;
        });
    });

    return total;
}

// Is the transaction formatted correctly as an object?
function hasCorrectFields(transaction) {
    var required_fields = ['sender_public_key', 'inputs', 'outputs', 'type', 'signature'];

    return required_fields.filter((field) => !transaction[field]).length === 0;
}

// Has the transaction been signed by the correct person?
function hasValidSignature(transaction) {
    var key = new NodeRSA(transaction.sender_public_key);

    return key.verify(unencryptedSignature(transaction), transaction.signature, 'utf8', 'base64');
}

// Does the transaction have multiple outputs for a given public key?
function hasDuplicateOutputs(transaction) {
    var user_output_map = {};
    var duplicate_outputs = false;

    transaction.outputs.forEach((output) => {
        if (user_output_map[output.owner_public_key])
            duplicate_outputs = true;

        user_output_map[output.owner_public_key] = true;
    });

    return duplicate_outputs;
}

// Does every input transaction exist?
function hasExistingInputs(transaction, transaction_map) {
    var inputs_exist = true;
    transaction.inputs.forEach((input) => {
        if (!transaction_map[input])
            inputs_exist = false;
    });

    return inputs_exist;
}

// Is every input transaction owned by the sender and unused?
function hasOwnedInputs(transaction, transaction_map) {
    var inputs_owned = true;
    transaction.inputs.forEach((input) => {
        var owns_output = false;
        transaction_map[input].outputs.forEach((output) => {
            if (!output.used && output.owner_public_key === transaction.sender_public_key)
                owns_output = true;
        });

        if (!owns_output)
            inputs_owned = false;
    });

    return inputs_owned;
}

// Is the given new coin transaction the only one in it's contained block?
function isFirstNewCoin(transaction, block_context) {
    var new_coin_count = 0;
    for (var i = 0; i < block_context.data.length; i++) {
        if (block_context.data[i].type == TYPES.NEW_COIN) {
            if (!equal(block_context.data[i], transaction))
                return false;

            new_coin_count++;
        }
    }

    // There should be either exactly one or no new coin transactions in the chain yet.
    return new_coin_count < 2;
}

// Given a map of transaction signatures to transactions, verify the given transaction is valid.
// The transaction MUST be present in the block_context already, or slightly strange results may
// occur when verifying new coin transactions.
function verify(transaction, transaction_map, block_context) {
    // Every transaction has to pass these checks universally.
    // TODO validate fields format
    if (!hasCorrectFields(transaction)) return false;
    if (!hasValidSignature(transaction)) return false;
    if (hasDuplicateOutputs(transaction)) return false;
    if (!hasExistingInputs(transaction, transaction_map)) return false;
    if (!hasOwnedInputs(transaction, transaction_map)) return false;

    switch(transaction.type) {
        case TYPES.STANDARD:
            if (getInputValue(transaction, transaction_map) != getOutputValue(transaction, transaction_map))
                return false;

            break;

        case TYPES.NEW_COIN:
            if (!block_context) return false;
            if (!isFirstNewCoin(transaction, block_context)) return false;

            break;
    }

    return true;
}

// Add the given transaction to the transaction map, assuming it's valid.
function addToMap(transaction, transaction_map) {
    transaction_map[transaction.signature] = clone(transaction);

    // Mark the output coins as unused.
    transaction_map[transaction.signature].outputs.forEach((output) => {
        output.used = false;
    });

    // Mark all the input coins as used.
    transaction.inputs.forEach((input) => {
        transaction_map[input].outputs.forEach((output) => {
            if (output.owner_public_key === transaction.sender_public_key)
                output.used = true;
        });
    });
}

// Given a blockchain of transactions, verifies each and construct transaction map.
function getVerificationMetadata(chain) {
    var transaction_map = {};

    for (var i = 0; i < chain.length; i++) {
        for (var j = 0; j < chain[i].data.length; j++) {
            var transaction = chain[i].data[j];

            if (!verify(transaction, transaction_map, chain[i]))
                return { valid: false };

            addToMap(transaction, transaction_map);
        }
    }

    return {
        valid: true,
        transaction_map: transaction_map
    }
}

module.exports = {
    generateKeyPair: generateKeyPair,
    create: create,
    clone: clone,
    equal: equal,
    verify: verify,
    addToMap: addToMap,

    getInputValue: getInputValue,
    getOutputValue: getOutputValue,
    hasCorrectFields: hasCorrectFields,
    hasValidSignature: hasValidSignature,
    hasDuplicateOutputs: hasDuplicateOutputs,
    hasExistingInputs: hasExistingInputs,
    hasOwnedInputs: hasOwnedInputs,
    isFirstNewCoin: isFirstNewCoin,

    getVerificationMetadata: getVerificationMetadata,
    TYPES: TYPES
}
