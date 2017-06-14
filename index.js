var Transation = require('./src/transaction');
var Block      = require('./src/block');
var Util       = require('./src/util');
var Miner      = require('./src/miner');
var Promise    = require('promise');
var keypairs   = require('./test/keypairs');

var owner = keypairs.owner;
var sender = keypairs.sender;
var miner = new Miner(1337, sender.public, sender.private, owner.public);

miner.start();
