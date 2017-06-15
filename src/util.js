var Promise = require('promise');
var fs = require('fs');

// Creates a promise that delays for some given time.
function delay(milliseconds) {
    return new Promise((resolve, reject) => {
        setTimeout(resolve, milliseconds);
    });
}

// Creates a promise wrapper around setTimeout(..., 0) for
// breaking out of JS main thread.
function unblock() {
    return delay(0);
}

// Creates a new promise that waits for a number of other promises to all resolve.
// If any error it rejects on the first error it receives.
function waitForAll(promises) {
    return new Promise((resolve, reject) => {
        if (promises.length == 0)
            return resolve();

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

// Logger that logs strings to a given file path with timestamps.
function createLog(path, mode) {
    var mode = mode || 'w';
    var file = fs.openSync(path, mode);

    return {
        log: (message) => {
            fs.writeSync(file, '[' + (new Date().toString()) + '] ' + (message || '') + '\n');
        }
    };
}

module.exports = {
    delay: delay,
    unblock: unblock,
    waitForAll: waitForAll,
    createLog: createLog
}
