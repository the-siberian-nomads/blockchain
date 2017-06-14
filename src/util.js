var Promise = require('promise');

// Creates a promise wrapper around setTimeout(..., 0) for
// breaking out of JS main thread.
function unblock() {
    return new Promise((resolve, reject) => {
        setTimeout(resolve, 0);
    });
}

module.exports = {
    unblock: unblock
}
