
JET.ParticleMaterial = function(params) {
	THREE.ShaderMaterial.call(this, params);

	this.attributes = {};
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
		"uniform float size;",
		"uniform float scale;",
		THREE.ShaderChunk[ "color_pars_vertex" ],
		"varying float vAlpha;",
		"void main() {",
			THREE.ShaderChunk[ "color_vertex" ],
			"vAlpha = normal.x;",
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

JET.TextureLib = {
	smoke: THREE.ImageUtils.loadTexture("assets/smoke.png")
}

JET.GradientLib = {
	trail: new JET.ColorGradient(0xcccccc, 0xffaa88),
	explosion: new JET.ColorGradient(0x777777, 0xffff00)
};
JET.GradientLib.trail.add(0.8, 0xbbbbbb);
JET.GradientLib.explosion.add(0.5, 0xbb2200);


JET.Particle = function(index) {
	this.position = new THREE.Vector3();
	this.color = new THREE.Color();
	this.alpha = 1.0;
	this.velocity = new THREE.Vector3();
	this.lifeTime = 0;
};


JET.Emitter = function(params) {
	this.maxParticles = params.maxParticles;
	this.spawner = params.spawner;
	this.onBorn = params.onBorn;
	this.onUpdate = params.onUpdate;
	this.geometry = new THREE.BufferGeometry();
	this.geometry.dynamic = true;
	this.geometry.attributes = {
		position: {
			itemSize: 3,
			array: new Float32Array(this.maxParticles * 3),
			numItems: this.maxParticles * 3
		},
		color: {
			itemSize: 3,
			array: new Float32Array(this.maxParticles * 3),
			numItems: this.maxParticles * 3
		},
		normal: {
			itemSize: 3,
			array: new Float32Array(this.maxParticles * 3),
			numItems: this.maxParticles * 3
		}
	}
	this.particles = new Array(this.maxParticles);
	for (var i = 0; i < this.maxParticles; ++i) {
		this.particles[i] = new JET.Particle();
	}
	this.particleSystem = new THREE.ParticleSystem(this.geometry, params.material);
	this.particleSystem.sortParticles = params.sortParticles || true;
	if (params.parent) params.parent.add(this.particleSystem);
};

JET.Emitter.prototype.update = function(dt) {
	var spawnAmount = this.spawner(dt);
	for (var i = 0; i < this.maxParticles; ++i) {
		var particle = this.particles[i];
		particle.lifeTime -= dt;
		if (particle.lifeTime <= 0 && spawnAmount > 0) {
			this.onBorn(particle);
			--spawnAmount;
		} else if (particle.lifeTime > 0)
			this.onUpdate(particle, dt);
		else particle.alpha = 0;

		var positions = this.geometry.attributes.position.array;
		var colors = this.geometry.attributes.color.array;
		var customs = this.geometry.attributes.normal.array;
		var i3 = i * 3;
		positions[i3  ] = particle.position.x;
		positions[i3+1] = particle.position.y;
		positions[i3+2] = particle.position.z;
		colors[i3  ] = particle.color.r;
		colors[i3+1] = particle.color.g;
		colors[i3+2] = particle.color.b;
		customs[i3] = particle.alpha;
	}
	this.geometry.verticesNeedUpdate = true;
	this.geometry.colorsNeedUpdate = true;
	this.geometry.normalsNeedUpdate = true;
}


// Create a simple jet trail emitter
JET.createTrail = function(parent) {
	var v = new THREE.Vector3();
	var toCreate = 0;
	var maxLife = 2;
	var emitter = new JET.Emitter({
		parent: scene,
		maxParticles: 300,
		material: new JET.ParticleMaterial({
			color: 0xffffff,
			size: 15,
			map: JET.TextureLib.smoke,
			sizeAttenuation: true,
			vertexColors: true,
			depthTest: false,
			depthWrite: true,
			transparent: true,
			opacity: 0.75,
			alphaTest: 0.1
		}),
		spawner: function(dt) {
			toCreate += 150 * dt;
			var amount = toCreate|0;
			toCreate -= amount;
			return amount;
		},
		onBorn: function(particle) {
			particle.lifeTime = maxLife;
			var speed = -40 + Math.random() * 20 + parent.speed * 0.7;
			var dx = Math.cos(parent.angle);
			var dy = Math.sin(parent.angle);
			particle.velocity.x = dx * speed + Math.random()*2;
			particle.velocity.y = dy * speed + Math.random()*2;
			particle.position.copy(parent.position);
			var r = 7 + Math.random() * 5;
			particle.position.x -= dx * r;
			particle.position.y -= dy * r;
			particle.position.z -= 2;
			JET.GradientLib.trail.getTo(1.0, particle.color);
		},
		onUpdate: function(particle, dt) {
			v.copy(particle.velocity).multiplyScalar(dt);
			particle.position.add(v);
			particle.velocity.multiplyScalar(1.0 - 0.5 * dt); // Some drag
			var normalizedLife = particle.lifeTime / maxLife;
			JET.GradientLib.trail.getTo(normalizedLife, particle.color);
			particle.alpha = normalizedLife;
		}
	});
	return emitter;
};

// Spawn a one-shot explosion
JET.createExplosion = function(pos) {
	var maxLife = 1.5;
	var time = Date.now();
	var emitter = new JET.Emitter({
		parent: scene,
		maxParticles: 10,
		material: new JET.ParticleMaterial({
			color: 0xffffff,
			size: 100,
			map: JET.TextureLib.smoke,
			sizeAttenuation: true,
			vertexColors: true,
			depthTest: false,
			depthWrite: true,
			transparent: true,
			opacity: 0.75,
			alphaTest: 0.1
		}),
		spawner: function(dt) {
			if (Date.now() > time + maxLife * 1000) {
				emitter.done = true;
				return;
			}
			return 100;
		},
		onBorn: function(particle) {
			particle.lifeTime = 0.5 * (maxLife * Math.random() + maxLife);
			particle.position.copy(pos);
			particle.position.z += 5;
			JET.GradientLib.explosion.getTo(1.0, particle.color);
		},
		onUpdate: function(particle, dt) {
			var normalizedLife = particle.lifeTime / maxLife;
			JET.GradientLib.explosion.getTo(normalizedLife, particle.color);
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
