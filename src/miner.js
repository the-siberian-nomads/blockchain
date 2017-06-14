let promise = require('promise')
let block = require('./block')
let net = require('net')
//pool of transactions

function miner(port){
  net.createServer((sock) => {

    sock.on('data',function(data){
        sock.write(data);
    })


    sock.on('close', function(data) {
        console.log("closed")
    })
  })
  return {
    port: port;
  }
}

function getMessage(miner){
  if()
}
