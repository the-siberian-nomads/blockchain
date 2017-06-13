//block structure
require('sha256')

function block(hash){
  data = []
  hash = null;

  function addTransaction(transaction){
    data.push(transaction);
  }

  function computeHash(nonce){
    return sha256({nonce,data,hash});
  }


}
