
JET.listener = new THREE.Object3D();

JET.Sound = function(samples, minPlayers) {
	if (typeof samples === "string") samples = [ samples ];
	minPlayers = minPlayers || 1;

	this.sampleIndex = 0;
	this.samples = [];

	while (this.samples.length < minPlayers)
		for (var i = 0; i < samples.length; ++i)
			this.samples.push(new Audio("assets/sounds/" + samples[i]));

	this.play = function(volume) {
		if (!JET.CONFIG.sounds) return;
		try { // Firefox fails at GitHub MIME types
			var sample = this.samples[this.sampleIndex];
			if (!sample.paused) return;
			if (window.chrome) sample.load(); // Chrome requires reload
			else sample.currentTime = 0;
			if (volume !== undefined)
				sample.volume = volume;
			sample.play();
			this.sampleIndex = (this.sampleIndex + 1) % this.samples.length;
		} catch(e) {}
	};

	this.playSpatial = function(position, radius) {
		// Hack: Should have an update method instead of using a global reference
		// Doppler would probably be nice too
		var distance = JET.listener.position.distanceTo(position);
		if (distance < radius)
			this.play(1 - distance / radius);
	}
};

JET.SoundLibrary = {
	cannon: new JET.Sound("cannon.ogg", 15),
	missile: new JET.Sound("missile.ogg", 10),
	explosion: new JET.Sound("explosion.ogg", 10)
};
