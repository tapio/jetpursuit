
JET.Sound = function(samples, minPlayers) {
	if (typeof samples === "string") samples = [ samples ];
	minPlayers = minPlayers || 1;

	this.sampleIndex = 0;
	this.samples = [];

	while (this.samples.length < minPlayers)
		for (var i = 0; i < samples.length; ++i)
			this.samples.push(new Audio("assets/sounds/" + samples[i]));

	this.play = function(volume) {
		try { // Firefox fails at GitHub MIME types
			var sample = this.samples[this.sampleIndex];
			if (window.chrome) sample.load(); // Chrome requires reload
			else sample.currentTime = 0;
			if (volume !== undefined)
				sample.volume = volume;
			sample.play();
			this.sampleIndex = (this.sampleIndex + 1) % this.samples.length;
		} catch(e) {}
	};
};

JET.SoundLibrary = {
	cannon: new JET.Sound("cannon.ogg", 20),
	missile: new JET.Sound("missile.ogg", 10),
	explosion: new JET.Sound("explosion.ogg", 10)
};