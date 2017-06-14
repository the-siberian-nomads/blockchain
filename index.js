var Transation = require('./src/transaction');
var Block      = require('./src/block');
var Util       = require('./src/util');
var Promise    = require('promise');

console.log("Nothing to see here.");

Util.waitForAll([
    new Promise.resolve().then(() => console.log("1")),
    new Promise.resolve().then(() => console.log("2"))
]).then(() => console.log("Done!"));
