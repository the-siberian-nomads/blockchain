const Transaction = require('./transaction')
const Block = require('./block')

const TYPES = {
    BROADCAST_TRANSACTION: "BROADCAST_TRANSACTION",
    BROADCAST_BLOCKCHAIN: "BROADCAST_BLOCKCHAIN",
    BROADCAST_NODES: "BROADCAST_NODES",
    REQUEST_NODES: "REQUEST_NODES",
    START_MINING: "START_MINING",
    STOP_MINING: "STOP_MINING"
}

const handlers = {
    [TYPES.BROADCAST_TRANSACTION]: handleBroadcastTransaction,
    [TYPES.BROADCAST_BLOCKCHAIN]: handleBroadcastBlockchain,
    [TYPES.BROADCAST_NODES]: handleBroadcastNodes,
    [TYPES.REQUEST_NODES]: handleRequestNodes,
    [TYPES.START_MINING]: handleStartMining,
    [TYPES.STOP_MINING]: handleStopMining
}


function messageHandler(message, miner, socket) {
    if (!message.type)
        return console.error("Message received without type attribute - ignoring.");

    if (!handlers[message.type])
        return console.error("Message received with unknown type attribute " + message.type + " - ignoring.");

    return handlers[message.type](message, miner, socket);
}

function handleBroadcastTransaction(message, miner) {
    miner.addTransactionToPool(message.data);
}

function handleBroadcastBlockchain(message, miner) {
    miner.receiveNewBlockchain(message.data);
}

function handleBroadcastNodes(message,miner){
    miner.addNodes(message.data);
}

function handleStartMining(message, miner) {
    // TODO need to run auth here with digital signature
    miner.actively_mining = true;
}

function handleStopMining(message, miner) {
    // TODO need to run auth here with digital signature
    miner.actively_mining = false;
}

function handleRequestNodes(message, miner, socket){
    socket.write(
        JSON.stringify({
            type: TYPES.REQUEST_NODES,
            data: miner.node_list
        })
    );
}

function exportBlocks(miner, socket, callback) {
    socket.write(
        JSON.stringify({
            type: TYPES.BROADCAST_BLOCKCHAIN,
            data: miner.blockchain
        }),
        'utf8',
        callback
    );
}

module.exports = {
    handler: messageHandler,
    exportBlocks: exportBlocks
}
