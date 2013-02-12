
function Client(object, scene, host) {
	this.obj = object;
	this.gaming = false;
	this.peers = {};
	host = host || "ws://" + window.location.hostname + ":11001";
	console.log("Attempting connection to " + host + "...");
	this.socket = new WebSocket(host);
	var client = this;

	this.send = function(msg) {
		this.socket.send(JSON.stringify(msg));
	};

	this.socket.onopen = function() {
		console.log("Connection established!");
		client.send({ type: "hello", id: client.obj.id });
	};

	this.socket.onmessage = function(event) {
		//console.log("Received: " + event.data);
		var msg = JSON.parse(event.data);
		switch (msg.type) {
			// Update
			case "state":
				client.gaming = true;
				for (var i = 0; i < msg.data.length; ++i) {
					var state = msg.data[i];
					var peer = client.peers[state.id];
					if (!peer) { // New player?
						console.log(state.id + " joins");
						client.peers[state.id] = peer = new Plane();
						scene.add(peer);
					}
					// Set player state
					peer.position.set(state.pos[0], state.pos[1], state.pos[2]);
					peer.rotation.z = state.ang;
					peer.speed = state.spd;
				}
				break;
			// Someone left
			case "leave":
				if (client.peers[msg.id]) {
					scene.remove(client.peers[msg.id]);
					client.peers[msg.id] = undefined;
				}
				console.log(msg.id + " left");
				client.peers[msg.id] = undefined;
				break;
			// Introduction ok, join a game
			case "hello":
				client.send({ type: "join", game: "global" });
				break;
			// Unknown
			default:
				console.log("Unknown message: " + msg);
				break;
		}
	};

	this.socket.onclose = function() {
		console.log("Connection terminated");
	};

}

Client.prototype.update = function(dt) {
	if (!this.gaming) return;

	// Send my data
	var packet = {
		type: "upd",
		pos: [
			this.obj.position.x,
			this.obj.position.y,
			this.obj.position.z
		],
		ang: this.obj.rotation.z,
		spd: this.obj.speed
	};
	this.send(packet);

	// Manage other players
	for (var i in this.peers) {
		if (!this.peers[i]) continue;
		this.peers[i].update(dt);
	}
};

