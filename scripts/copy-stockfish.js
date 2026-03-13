const https = require('https');
const fs = require('fs');
const path = require('path');

const dest = path.join(__dirname, '../public/stockfish-18.js');

const file = fs.createWriteStream(dest);
https.get('https://raw.githubusercontent.com/nmrugg/stockfish.js/master/stockfish.js', res => {
    res.pipe(file);
    file.on('finish', () => {
        file.close();
        console.log('Stockfish downloaded to public/');
    });
}).on('error', err => {
    fs.unlink(dest, () => {});
    console.error('Download failed:', err.message);
});