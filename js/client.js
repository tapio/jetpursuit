
JET.Client = function(object, scene, host) {
	this.obj = object;
	this.gaming = false;
	host = host || "ws://" + window.location.hostname + ":11001";
	addMessage("Attempting connection to " + host + "...");
	this.socket = new WebSocket(host);
	var client = this;

	this.send = function(msg) {
		this.socket.send(JSON.stringify(msg));
	};

	this.socket.onopen = function() {
		addMessage("Connection established!");
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
					var peer = game.findById(state.id);
					if (!peer) { // New player?
						addMessage("Player " + state.id + " joined.");
						peer = new JET.Plane({ id: state.id, local: false });
						game.add(peer);
					}
					// Set player state
					peer.position.set(state.pos[0], state.pos[1], state.pos[2]);
					peer.rotation.z = state.ang;
					peer.speed = state.spd;
				}
				break;
			// Someone left
			case "leave":
				game.removeById(msg.id);
				addMessage("Player " + msg.id + " left.", "warn");
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
		addMessage("Connection terminated!", "error");
	};

};

JET.Client.prototype.update = function(dt) {
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
};

