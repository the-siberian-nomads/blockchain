//block structure
const sha = require('sha256')

function addTransaction(hash, transaction){
  hash.data.push(transaction);
  return hash;
}

function computeHash(block, nonce){
  return sha.x2(nonce + block.data + block.hash);
}

function block(hash){
  return {
    data: [],
    hash: hash
  }
}

function printBlock(block){
  console.log("previous hash : " + block.hash);
  console.log("data : " + block.data);
}

module.exports = {
  block : block,
  computeHash : computeHash,
  addTransaction : addTransaction,
  printBlock : printBlock
}
