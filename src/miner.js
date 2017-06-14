const Promise = require('promise')
const block = require('./block')
const net = require('net')
const utils = require('./util')
const transactions = require('./transaction')

//pool of transactions
var pool = [];
var blockchain = [];
var transactionsMap = {};
var keypair = transactions.generateKeyPair();

function miner(port) {
  net.createServer((sock) => {
    sock.on('data',function(data){
        sock.write(data);
        switch(data.type){
          case "transaction" : pool.add(data); break;
          case "blockFinished" : let newChain = data.chain;
                                if(newChain.length > data.chain){
                                  if(block.getVerificationMetadata(newChain).valid){
                                    newChain[blockchain.length].map(i => (pool.add(i)));
                                    blockchain = newChain;
                                  }
                                }
                                break;
          case "startmining" : mainloop();
        }
    })

    sock.on('close', function(data) {
        console.log("closed")
    })
  })
}

function addTransactionsToBlock(){
    var promisesThing = pool.map((transaction) => addTransaction(transaction))
    pool = []
    return utils.waitForAll(promisesThing);
}

function addTransaction(transaction){
  return utils.unblock().then(() => {
    if(transactions.verify(transaction,transactionsMap,blockchain[blockchain.length-1])){
      transactions.addToMap(transaction,transactionsMap);
      block.addTransaction(blockchain[blockchain.length-1],transaction);
    }
  })
}

function createGenesisBlock(){
  blockchain = [ block.create("genesis") ];
  transactionsMap = {};
}

function checkIfGenesis(){
  return new Promise(function(resolve, reject) {
    if(blockchain.length == 0){
      createGenesisBlock();
    }
    resolve();
  });
}

// Add a new block onto the end of the current chain and push a new coin into it.
function pushNewBlock() {
    blockchain.push( block.createFrom(blockchain[blockchain.length - 1]) );
    pool.push(transactions.create(
        keypair.public,
        keypair.private,
        [],
        [{ owner_public_key: keypair.public, value: 1.0 }],
        transactions.TYPES.NEW_COIN
    ));
}

function computeHash(){
  return new Promise(function(resolve, reject) {
    blockchain[blockchain.length-1].nonce++;
    if(block.computeHash(blockchain[blockchain.length-1]).startsWith("000")){
      //broadcast

      pushNewBlock();

      console.log("Current state of chain:");
      console.log(blockchain);
      console.log("Is chain valid: " + block.getVerificationMetadata(blockchain).valid);
      console.log();
    }
    resolve()
  });

}

function mainloop(){
  // console.log(blockchain);
  //add as many transactions to block as it can from the pool
  return new Promise
    .resolve()
    .then(checkIfGenesis)
    .then(addTransactionsToBlock)
    .then(computeHash)
    .then(utils.unblock)
    .then(mainloop)
    .catch((error) => console.error(error))
}

function getMessage(miner){
}

module.exports = {
  mainloop : mainloop
}
