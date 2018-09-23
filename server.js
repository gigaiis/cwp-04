// server.js
const net = require('net');
const fs = require('fs');
const path = require('path');
const port = 8124;
let seed = 0;
let targ = 0;
let ARRQ = require('./qa.json');
let FILES = [];
let CLIENTS = [];
let connections = 0;
const log = fs.createWriteStream('client_id.txt');

const DEFAULT_DIR = process.env.DEFAULT_DIR;
const MAX_CONNECTIONS = parseInt(process.env.M_CONN);

const server = net.createServer((client) => {
	client.id = Date.now() + seed++;
	client.setEncoding('utf8');

	if (++connections >= MAX_CONNECTIONS + 1) { 
		console.log(`[${formatDate()}]: For client #${client.id} no free slots!\n`);
		log.write(`[${formatDate()}]: For client #${client.id} no free slots!\n`);
		connections--;
		client.destroy();
		return;
	}

	console.log(`[${formatDate()}]: Client #${client.id} connected\n`);
	log.write(`[${formatDate()}]: Client #${client.id} connected\n`);

	client.on('data', (data) => {
		if ((data === 'FILES') || (data === 'QA')) {
			if (data === 'FILES') {
				FILES[client.id] = [];
                fs.mkdir(DEFAULT_DIR + path.sep + client.id, () => {});
			}
			CLIENTS[client.id] = data;
			client.write('ACK');
		}	
        else if (client.id === undefined) {
            client.write('DEC');
            client.destroy();
        }

        if ((CLIENTS[client.id] === 'QA') && (data !== 'QA')) {     	
		    let answr = 'Bad answer';
		    if (Math.floor(Math.random() * 2) === 1) {
		    	let QID = -1;
	        	for (let i = 0; i < ARRQ.length; i++)
			        if (ARRQ[i].q === data) {
			        	QID = i;
			        	break;
			        }
		    	answr = ARRQ[QID].g;
		    }
        	log.write(`[${formatDate()}][#${client.id}] > Data: ${data}; Answer: ${answr}\n`);
	        client.write(answr);	
	    } else if (CLIENTS[client.id] === 'FILES' && data !== 'FILES') {
            FILES[client.id].push(data);
            if (++targ === 2) {
                let buf = Buffer.from(FILES[client.id][0], 'hex');
                let filePath = DEFAULT_DIR + path.sep + client.id + path.sep + FILES[client.id][1];
                console.log(`CHECK: ${filePath}`);
                let fr = fs.createWriteStream(filePath);
                fr.write(buf);
                targ = 0;
                FILES[client.id] = [];
                fr.close();
                client.write('NEXT');
            }
        }
	});

	client.on('end', () => {
		connections--;
		console.log(`[${formatDate()}]: Client #${client.id} disconnected\n`);
		log.write(`[${formatDate()}]: Client #${client.id} disconnected\n`);
	});
});

server.listen(port, () => {
	console.log(`Server listening on localhost:${port}`);
});

function formatDate() {
	return new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
}