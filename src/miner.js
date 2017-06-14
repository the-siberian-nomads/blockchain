let promise = require('promise')
let block = require('./block')
//pool of transactions
//pool = []
let listofOtherMiners = [];
let zeros = 3
let mine = true
let pool = [];
//chain stored here

function miner(ip, port){
    return {ip: ip,
            port: port};
}

function miner(ip,port,nodes){
    thisMiner = miner(ip,port);
    nodes.map((i) => {
      listofOtherMiners.push(i);
      connectToOtherMiner(thisMiner,i);
        })
    listofOtherMiners.push(otherMiner);
}

//get the current state of the block chain and try and get a list of all nodes
function connectToOtherMiner(currentMiner, toConnect){
  //conect to other miner
  //get list of more miners
  //get current state of blockchains
}
function addBlocktoChain(chain, block){
  //final check to make sure it is legit
  if(chain.data[chain.data.length-1].nextHash != block.hash || !block.hash.startsWith("000") || block.nextHash.startsWith("000")){
      console.log("we have a failure");
      console.log(block.hash);
      console.log("previous block hash "  + chain.data[chain.data.length-1].nextHash)
      console.log("block hash " + block.hash)
      console.log("next hash is " +  block.nextHash)
      return false
  }

  chain.data.push(block);
  return true;
}

function waitForMessage(message,block){
  //either add to pool or add to block and start again
  if(message.type === "blockMined"){
      mine = false;
      //set intersection
  }
  if(message.type === "transaction"){
    block.push(message.value);
    return block;
  }
}

function buildBlock(){
  //builds the block object here with all transactions currently in pool
}

function mine(block,nonce){
  while(mine){

  }
  //computes hash
}
