const net = require('net');
const fs = require('fs');
const path = require('path');
const port = 8124;
const client = new net.Socket();

let targ = 0;

client.setEncoding('utf8');

client.on('data', (data) => {
    console.log(`> ${data}`);
    if (data === 'DEC') client.destroy();
    else if (data === 'ACK') {
        targ++;
        if (targ === 1) client.write('COPY work\\f1.txt work\\f2.txt');
        else if (targ === 2) client.write('ENCODE work\\f2.txt work\\f3.txt 111');
        else if (targ === 3) client.write('DECODE work\\f3.txt work\\f4.txt 111');
        else client.destroy();
    } else console.log(`!!! UNKNOWN COMMAND: ${data}`);
});

client.on('close', function () {
    console.log('Connection closed');
});

client.connect(port, () => { client.write('REMOTE'); });