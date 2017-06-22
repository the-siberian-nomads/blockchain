const Transaction = require('transactionblockchain');
const Block = require('blockblockchain');
var Util       = require('./src/util');
var Miner      = require('./src/miner');
var Promise    = require('promise');
var keypairs   = require('./test/keypairs');

var owner = keypairs.owner;
var sender = keypairs.sender;

var minerOneIP = '10.0.0.12';
var minerTwoIP = '10.0.0.12';
var miner1 = new Miner(1337, minerOneIP, sender.public, sender.private, sender.public, Util.createLog('miner1.log'));
var miner2 = new Miner(1338, minerTwoIP, owner.public, owner.private, owner.public, Util.createLog('miner2.log'));

miner1.start(() => {
    miner2.start(() => {
        miner1.node_list = [{ address: minerOneIP, port: 1338 }];
        miner2.node_list = [{ address: minerTwoIP, port: 1337 }];

        miner1.actively_mining = true;
        miner2.actively_mining = true;
    });
});
