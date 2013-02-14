
JET.ParticleMaterials = {
	trail: new THREE.ParticleBasicMaterial({
		color: 0xffffff,
		size: 5,
		map: THREE.ImageUtils.loadTexture("assets/smoke.png"),
		sizeAttenuation: true,
		vertexColors: true,
		depthWrite: true,
		transparent: true,
		opacity: 0.75,
		alphaTest: 0.1
	}),
	explosion: new THREE.ParticleBasicMaterial({
		color: 0xffffff,
		size: 40,
		map: THREE.ImageUtils.loadTexture("assets/smoke.png"),
		sizeAttenuation: true,
		vertexColors: true,
		depthWrite: true,
		transparent: true,
		opacity: 0.5,
		alphaTest: 0.1
	})
};

JET.GradientLib = {
	trail: new JET.ColorGradient(0xcccccc, 0xffaa88),
	explosion: new JET.ColorGradient(0x777777, 0xffff00)
};
JET.GradientLib.trail.add(0.8, 0xbbbbbb);
JET.GradientLib.explosion.add(0.5, 0xbb2200);


JET.Particle = function(index) {
	this.index = index || 0;
	this.velocity = new THREE.Vector3();
	this.lifeTime = 0;
};


JET.Emitter = function(params) {
	this.maxParticles = params.maxParticles;
	this.spawner = params.spawner;
	this.onBorn = params.onBorn;
	this.onUpdate = params.onUpdate;
	this.geometry = new THREE.Geometry();
	this.particles = new Array(this.maxParticles);
	this.geometry.vertices = new Array(this.maxParticles);
	this.geometry.colors = new Array(this.maxParticles);
	for (var i = 0; i < this.maxParticles; ++i) {
		this.geometry.vertices[i] = new THREE.Vector3();
		this.geometry.colors[i] = new THREE.Color();
		this.particles[i] = new JET.Particle(i);
	}
	this.particleSystem = new THREE.ParticleSystem(this.geometry, params.material);
	this.particleSystem.sortParticles = params.sortParticles || true;
	if (params.parent) params.parent.add(this.particleSystem);
};

JET.Emitter.prototype.update = function(dt) {
	var spawnAmount = this.spawner(dt);
	for (var i = 0; i < this.maxParticles; ++i) {
		var particle = this.particles[i];
		var position = this.geometry.vertices[i];
		var color = this.geometry.colors[i];
		particle.lifeTime -= dt;
		if (particle.lifeTime <= 0 && spawnAmount > 0) {
			this.onBorn(particle, position, color);
			--spawnAmount;
		} else if (particle.lifeTime > 0)
			this.onUpdate(particle, position, color, dt);
	}
	this.geometry.verticesNeedUpdate = true;
	this.geometry.colorsNeedUpdate = true;
}


// Create a simple jet trail emitter
JET.createTrail = function(parent) {
	var v = new THREE.Vector3();
	var toCreate = 0;
	var maxLife = 2;
	var emitter = new JET.Emitter({
		parent: scene,
		maxParticles: 400,
		material: JET.ParticleMaterials.trail,
		spawner: function(dt) {
			toCreate += 200 * dt;
			var amount = toCreate|0;
			toCreate -= amount;
			return amount;
		},
		onBorn: function(particle, position, color) {
			particle.lifeTime = maxLife;
			var speed = -40 + Math.random() * 20 + parent.speed * 0.7;
			var dx = Math.cos(parent.angle);
			var dy = Math.sin(parent.angle);
			particle.velocity.x = dx * speed + Math.random()*2;
			particle.velocity.y = dy * speed + Math.random()*2;
			position.copy(parent.position);
			var r = 5 + Math.random() * 5;
			position.x -= dx * r;
			position.y -= dy * r;
			position.z -= 2;
			JET.GradientLib.trail.getTo(1.0, color);
		},
		onUpdate: function(particle, position, color, dt) {
			v.copy(particle.velocity).multiplyScalar(dt);
			position.add(v);
			particle.velocity.multiplyScalar(1.0 - 0.5 * dt); // Some drag
			JET.GradientLib.trail.getTo(particle.lifeTime / maxLife, color);
		}
	});
	return emitter;
};

// Spawn a one-shot explosion
JET.createExplosion = function(pos) {
	var maxLife = 1;
	var time = Date.now();
	var emitter = new JET.Emitter({
		parent: scene,
		maxParticles: 5,
		material: JET.ParticleMaterials.explosion,
		spawner: function(dt) {
			if (Date.now() > time + maxLife * 1000) {
				emitter.done = true;
				return;
			}
			return 100;
		},
		onBorn: function(particle, position, color) {
			particle.lifeTime = 0.5 * (maxLife * Math.random() + maxLife);
			position.copy(pos);
			position.z += 5;
			JET.GradientLib.explosion.getTo(1.0, color);
		},
		onUpdate: function(particle, position, color, dt) {
			JET.GradientLib.explosion.getTo(particle.lifeTime / maxLife, color);
		}
	});
	return emitter;
};


// Particle system initializer for simple particle flames
// TODO: Remove
JET.createParticleSystem = function(nParticles, material) {
	var i, geometry = new THREE.Geometry();
	// Init vertices & colors
	geometry.vertices = new Array(nParticles);
	geometry.colors = new Array(nParticles);
	for (i = 0; i < nParticles; ++i) {
		geometry.vertices[i] = new THREE.Vector3();
		geometry.colors[i] = new THREE.Color();
	}
	// Init particle system
	var particleSystem = new THREE.ParticleSystem(geometry, material);
	particleSystem.sortParticles = true;
	return particleSystem;
};
