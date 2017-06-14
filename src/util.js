var Promise = require('promise');

// Creates a promise wrapper around setTimeout(..., 0) for
// breaking out of JS main thread.
function unblock() {
    return new Promise((resolve, reject) => {
        setTimeout(resolve, 0);
    });
}

// Creates a new promise that waits for a number of other promises to all resolve.
// If any error it rejects on the first error it receives.
function waitForAll(promises) {
    return new Promise((resolve, reject) => {
        var haveRejected = false;
        var successes = 0;

        promises.forEach((promise) => {
            promise
                .then(() => {
                    successes++;

                    if (successes == promises.length)
                        resolve();
                 })
                .catch((error) => {
                    if (!haveRejected) {
                        haveRejected = true;
                        reject(error);
                    }
                 });
        });
    });
}

module.exports = {
    unblock: unblock,
    waitForAll: waitForAll
}
