
JET.ParticleMaterial = function(params) {
	THREE.ShaderMaterial.call(this, params);

	this.attributes = {
		alpha: { type: 'f', value: [] }
	};
	params.color = params.color || 0xffffff;
	this.uniforms = {
		"psColor" : { type: "c", value: new THREE.Color(params.color) },
		"opacity" : { type: "f", value: params.opacity || 1.0 },
		"size" : { type: "f", value: params.size || 1.0 },
		"scale" : { type: "f", value: params.scale || 1.0 },
		"map" : { type: "t", value: params.map || null }
	};
	this.map = params.map;
	this.color = new THREE.Color(params.color);
	//this.sizeAttenuation = params.sizeAttenuation;
	//this.size = params.size;
	this.vertexColors = params.vertexColors;
	this.setValues(params);

	this.vertexShader = [
		"attribute float alpha;",
		"uniform float size;",
		"uniform float scale;",
		THREE.ShaderChunk[ "color_pars_vertex" ],
		"varying float vAlpha;",
		"void main() {",
			THREE.ShaderChunk[ "color_vertex" ],
			"vAlpha = alpha;",
			"vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );",
			"#ifdef USE_SIZEATTENUATION",
				"gl_PointSize = size * ( scale / length( mvPosition.xyz ) );",
			"#else",
				"gl_PointSize = size;",
			"#endif",
			"gl_Position = projectionMatrix * mvPosition;",
			THREE.ShaderChunk[ "worldpos_vertex" ],
		"}"
	].join("\n"),

	this.fragmentShader = [
		"uniform vec3 psColor;",
		"uniform float opacity;",
		THREE.ShaderChunk[ "color_pars_fragment" ],
		THREE.ShaderChunk[ "map_particle_pars_fragment" ],
		"varying float vAlpha;",
		"void main() {",
			"gl_FragColor = vec4( psColor, opacity * vAlpha );",
			THREE.ShaderChunk[ "map_particle_fragment" ],
			THREE.ShaderChunk[ "alphatest_fragment" ],
			THREE.ShaderChunk[ "color_fragment" ],
		"}"
	].join("\n")
}
JET.ParticleMaterial.prototype = Object.create(THREE.ShaderMaterial.prototype);

JET.GradientLib = {
	trail: new JET.ColorGradient(0xcccccc, 0xffaa88),
	explosion: new JET.ColorGradient(0x777777, 0xffff00)
};
JET.GradientLib.trail.add(0.8, 0xbbbbbb);
JET.GradientLib.explosion.add(0.5, 0xbb2200);


JET.Particle = function(index) {
	this.index = index || 0;
	this.alpha = 1.0;
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
	this.geometry.alphas = params.material.attributes.alpha.value = new Array(this.maxParticles);
	for (var i = 0; i < this.maxParticles; ++i) {
		this.geometry.vertices[i] = new THREE.Vector3();
		this.geometry.colors[i] = new THREE.Color();
		this.geometry.alphas[i] = 1.0;
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
		else particle.alpha = 0;
		this.geometry.alphas[i] = particle.alpha;
	}
	this.geometry.verticesNeedUpdate = true;
	this.geometry.colorsNeedUpdate = true;
	this.particleSystem.material.attributes.alpha.needsUpdate = true;
}


// Create a simple jet trail emitter
JET.createTrail = function(parent) {
	var v = new THREE.Vector3();
	var toCreate = 0;
	var maxLife = 2;
	var emitter = new JET.Emitter({
		parent: scene,
		maxParticles: 400,
		material: new JET.ParticleMaterial({
			color: 0xffffff,
			size: 15,
			map: THREE.ImageUtils.loadTexture("assets/smoke.png"),
			sizeAttenuation: true,
			vertexColors: true,
			depthWrite: true,
			transparent: true,
			opacity: 0.75,
			alphaTest: 0.1
		}),
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
			var normalizedLife = particle.lifeTime / maxLife;
			JET.GradientLib.trail.getTo(normalizedLife, color);
			particle.alpha = normalizedLife;
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
		material: new JET.ParticleMaterial({
			color: 0xffffff,
			size: 100,
			map: THREE.ImageUtils.loadTexture("assets/smoke.png"),
			sizeAttenuation: true,
			vertexColors: true,
			depthWrite: true,
			transparent: true,
			opacity: 0.5,
			alphaTest: 0.1
		}),
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
			var normalizedLife = particle.lifeTime / maxLife;
			JET.GradientLib.explosion.getTo(normalizedLife, color);
			particle.alpha = normalizedLife;
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
