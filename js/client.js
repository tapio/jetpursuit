
function Client(object, host) {
	this.obj = object;
	host = host || "ws://" + window.location.hostname + ":11001";
	console.log("Attempting connection to " + host + "...");
	this.socket = new WebSocket(host);

	this.socket.onopen = function() {
		console.log("Connection established!");
		this.send('hello');
	};

	this.socket.onmessage = function(msg) {
		console.log('received: %s', msg.data);
	};

	this.socket.onclose = function() {
		console.log("Connection terminated");
	};

}

Client.prototype.join = function() {
	peers = {};
	this.socket.send("join");
};

Client.prototype.update = function(dt) {
	//this.socket.send("update");
};

