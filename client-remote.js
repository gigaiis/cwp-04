const net = require('net');
const fs = require('fs');
const path = require('path');
const port = 8124;
const targ = 0;
const client = new net.Socket();

client.setEncoding('utf8');

client.on('data', (data) => {
    console.log(`> ${data}`);
    if (data === 'DEC') client.destroy();
    else if (data === 'ACK') {
        
    } else console.log(`!!! UNKNOWN COMMAND: ${data}`);
});

client.on('close', function () {
    console.log('Connection closed');
});

client.connect(port, () => { client.write('REMOTE'); });