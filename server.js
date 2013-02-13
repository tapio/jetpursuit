var PORT = parseInt(process.env.PORT, 10) || 11001;
var VERBOSITY = parseInt(process.env.VERBOSE, 10) || 1;
var WebSocketServer = require('ws').Server;

var games = {};

function Player(socket, id, game) {
	this.socket = socket;
	this.id = id;
	this.game = game;
	this.pos = [ 0, 0, 0 ];
	this.ang = 0;
	this.spd = 0;
}

Player.prototype.serialize = function() {
	return { id: this.id, pos: this.pos, ang: this.ang, spd: this.spd };
};

Player.prototype.join = function(game) {
	if (!this.id) return; // Id is required
	this.leave(); // Leave if already in game
	if (!games[game]) games[game] = {}; // Create game if not present
	games[game][this.id] = this; // Join
	this.game = games[game]; // Cache reference
};

Player.prototype.leave = function() {
	if (!this.game) return; // Nothing to do if not in game
	this.game[this.id] = undefined; // Leave the game
	this.game = undefined; // Remove cached game reference
};

Player.prototype.getGameState = function() {
	if (!this.game) return [];
	var ret = [];
	for (var i in this.game) {
		if (i !== this.id && this.game[i])
			ret.push(this.game[i].serialize());
	}
	return { type: "state", data: ret };
};

Player.prototype.broadcast = function(data) {
	if (!this.game) return;
	for (var i in this.game) {
		if (i !== this.id && this.game[i])
			this.game[i].socket.send(JSON.stringify(data));
	}
};


var server = new WebSocketServer({ port: PORT });
server.on('connection', function(ws) {
	var pl = new Player(ws);

	ws.on('message', function(msg) {
		if (VERBOSITY > 1) console.log("Received: " + msg);
		msg = JSON.parse(msg);
		switch (msg.type) {
			// Update
			case "upd":
				pl.pos = msg.pos;
				pl.ang = msg.ang;
				pl.spd = msg.spd;
				pl.broadcast({ type: "state", data: [ pl.serialize() ] });
				break;
			// Update
			case "ping":
				ws.send('{"type":"pong"}');
				break;
			// Join game
			case "join":
				if (VERBOSITY > 0) console.log(pl.id + " joins game " + msg.game);
				pl.join(msg.game);
				pl.broadcast({ type: "state", data: [ pl.serialize() ] }); // Inform others
				ws.send(JSON.stringify(pl.getGameState())); // Inform newcomer about others
				break;
			// Introduction
			case "hello":
				if (VERBOSITY > 1) console.log("Hello from " + msg.id);
				pl.id = msg.id;
				ws.send(JSON.stringify({ type: "hello"}));
				break;
			// Unknown
			default:
				if (VERBOSITY > 0) console.log("Unknown message: " + msg);
				break;
		}
	});

	ws.on('close', function(msg) {
		if (VERBOSITY > 0) console.log("Disconnected " + (pl.id || "unknown"));
		if (pl.id) pl.broadcast({ type: "leave", id: pl.id });
		pl.leave();
	});
});

console.log("Server running @ ws://localhost:" + PORT);
