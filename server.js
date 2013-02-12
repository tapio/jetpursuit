var PORT = parseInt(process.env.PORT, 10) || 11001;

var WebSocketServer = require('ws').Server;
var server = new WebSocketServer({ port: PORT });

server.on('connection', function(ws) {
	ws.on('message', function(message) {
		console.log('received: %s', message);
	});
	ws.send('something');
});

console.log("Server running @ ws://localhost:" + PORT);
