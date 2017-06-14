const Promise = require('promise')
const block = require('./block')
const net = require('net')
const utils = require('./util')
const transactions = require('./transaction')
//pool of transactions
pool = [];
blockchain = [];
transactionsMap = {};

function miner(port){
  net.createServer((sock) => {

    sock.on('data',function(data){
        sock.write(data);
        switch(data.type){
          case "transaction" : pool.add(data); break;
          case "blockFinished" : //recieve entire chain
                                 //check valid (length and transactions/hash)
                                 //add all transactions in current block back into transaction
                                 //set current block
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
  return unblock().then(() => {
    if(transactions.verify(transaction,transactionsMap,blockchain[blockchain.length-1])){
      transactions.addToMap(transaction,transactionsMap);
      blocks.addTransaction(blockchain[blockchain.length-1],transaction);
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

function computeHash(){
  return new Promise(function(resolve, reject) {
    blockchain[blockchain.length-1].nonce++;
    if(block.computeHash(blockchain[blockchain.length-1]).startsWith("000")){
      //broadcast
      blockchain.push(block.createFrom(blockchain[blockchain.length -1]))
      //add new block
      console.log(blockchain);
      console.log(block.getVerificationMetadata(blockchain).valid);
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
