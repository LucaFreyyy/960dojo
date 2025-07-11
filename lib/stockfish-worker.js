self.importScripts('/stockfish.js');

self.onmessage = function (e) {
    self.postMessage = postMessage;
    onmessage = function (event) {
        postMessage(event.data);
    };
    postMessage('uci');
    postMessage(e.data);
};
