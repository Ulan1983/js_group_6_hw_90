const express = require('express');
const cors = require('cors');
const expressWs = require('express-ws');
const {nanoid} = require('nanoid');

const app = express();
const port = 8000;

expressWs(app);

app.use(express.json());
app.use(cors());

const connections = {};

const datas = [];

app.ws('/canvas', function (ws, req) {
	const id = nanoid();
	console.log(`Client connected id: ${id}`);

	connections[id] = ws;

	console.log('Total clients connected: ' + Object.keys(connections).length);

	ws.send(JSON.stringify({
		type: 'LAST_DATAS',
		datas: datas
	}));

	ws.on('message', (data) => {
		console.log(`Incoming message from ${id}: `, data);

		const parsed = JSON.parse(data);

		switch (parsed.type) {
			case 'CREATE_DATA':
				Object.keys(connections).forEach(connId => {
					const connection = connections[connId];
					const newData = {
						type: 'NEW_DATA',
						data: parsed.data
					};

					connection.send(JSON.stringify({
						...newData
					}));

					datas.push(newData);
				});
				break;
			default:
				console.log('NO TYPE: ' + parsed.type);
		}
	});

	ws.on('close', (data) => {
		console.log(`client id: ${id} disconnected!`);

		delete connections[id];
	});
});

app.listen(port, () => {
	console.log(`Server started on ${port} port!`);
});