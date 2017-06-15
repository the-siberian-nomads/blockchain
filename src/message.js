const Transaction = require('./transaction')
const Block = require('./block')

const TYPES = {
    BROADCAST_TRANSACTION: "BROADCAST_TRANSACTION",
    BROADCAST_BLOCK: "BROADCAST_BLOCK",
    BROADCAST_NODES: "BROADCAST_NODES",
    REQUEST_NODES: "REQUEST_NODES",
    START_MINING: "START_MINING",
    STOP_MINING: "STOP_MINING"
}

const handlers = {
    [TYPES.BROADCAST_TRANSACTION]: handleBroadcastTransaction,
    [TYPES.BROADCAST_BLOCK]: handleBroadcastBlock,
    [TYPES.BROADCAST_NODES]: handleBroadcastNodes,
    [TYPES.REQUEST_NODES]: handleRequestNodes,
    [TYPES.START_MINING]: handleStartMining,
    [TYPES.STOP_MINING]: handleStopMining
}


function messageHandler(miner, socket) {
    return (message) => {
        message = JSON.parse(message.toString('utf8'));

        if (!message.type)
            return console.error("Message received without type attribute - ignoring.");

        if (!handlers[message.type])
            return console.error("Message received with unknown type attribute " + message.type + " - ignoring.");

        return handlers[message.type](message, miner, socket);
    }
}

function handleBroadcastTransaction(message, miner) {
    console.log("Got broadcast transaction.");
}

function handleBroadcastBlock(message, miner) {
    console.log("Got broadcast block.");
}

function handleBroadcastNodes(message,miner){
    miner.addNodes(message.data);
}

function handleStartMining(message, miner) {
    // TODO need to run auth here with digital signature
    miner.activelyMining = true;
}

function handleStopMining(message, miner) {
    // TODO need to run auth here with digital signature
    miner.activelyMining = false;
}

function handleRequestNodes(message, miner, socket){
    socket.write(
        JSON.stringify({
            type: TYPES.REQUEST_NODES,
            data: miner.node_list
        })
    );
}

module.exports = {
    handler: messageHandler
}
