
JET.Client = function(object, scene, host) {
	this.obj = object;
	this.gaming = false;
	this.connected = false;
	host = host || "ws://" + window.location.hostname + ":10666";
	addMessage("Attempting connection to " + host + "...");
	this.socket = new WebSocket(host);
	var client = this;
	var pingInterval = null;
	var pingTime = performance.now();
	var v = new THREE.Vector3();

	this.send = function(msg) {
		this.socket.send(JSON.stringify(msg));
	};

	this.socket.onopen = function() {
		addMessage("Connection established!");
		client.send({ type: "hello", id: client.obj.id });
		this.connected = true;
		pingInterval = window.setInterval(function() {
			pingTime = performance.now();
			client.send({ type: "ping" });
		}, 2000);
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
						peer = new JET.Plane({
							id: state.id,
							local: false,
							template: DATA.aircrafts[(Math.random() * DATA.aircrafts.length)|0]
						});
						peer.position.set(state.pos[0], state.pos[1], state.pos[2]);
						game.add(peer);
					}
					// Set player state with interpolation
					v.set(state.pos[0], state.pos[1], state.pos[2]);
					peer.position.lerp(v, 0.2);
					peer.angle = state.ang;
					peer.speed = state.spd;
				}
				break;
			case "pong":
				object.ping = performance.now() - pingTime;
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
		this.connected = false;
		if (pingInterval) window.clearInterval(pingInterval);
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
		ang: this.obj.angle,
		spd: this.obj.speed
	};
	this.send(packet);
};

