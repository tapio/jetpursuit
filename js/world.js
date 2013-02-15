
JET.World = function(scene) {
	var v = new THREE.Vector3();

	// Lights
	var ambient = new THREE.AmbientLight(0x444444);
	scene.add(ambient);
	var sun = new THREE.DirectionalLight(0xffffff, 0.6);
	sun.position.set(1.0, 1.0, 2.0);
	scene.add(sun);

	// Sea
	var w = 10000, h = 5000;
	var seaTex = THREE.ImageUtils.loadTexture("assets/water.jpg");
	seaTex.wrapS = seaTex.wrapT = THREE.RepeatWrapping;
	seaTex.repeat.set(4, 2);
	var seaMat = new THREE.MeshPhongMaterial({
		specular: 0xffffff,
		shininess: 100,
		map: seaTex,
		bumpMap: seaTex,
		bumpScale: 5.0,
	});
	var seaGeo = new THREE.PlaneGeometry(w, h);
	var sea = new THREE.Mesh(seaGeo, seaMat);
	scene.add(sea);

	// Clouds
	var cloudsInCluster = 4;
	var numClouds = 250 * cloudsInCluster;
	var cloudDist = 1500;
	var cloudTex = THREE.ImageUtils.loadTexture("assets/cloud1.png");
	var cloudMat = new JET.CloudMaterial({
		size: 256,
		scale: 320,
		map: cloudTex,
		depthTest: true,
		depthWrite: false,
		transparent: true,
		opacity: 0.8,
		sizeAttenuation: true
	});
	var cloudGeo = new THREE.BufferGeometry();
	cloudGeo.dynamic = true;
	cloudGeo.attributes = {
		position: {
			itemSize: 3,
			array: new Float32Array(numClouds * 3),
			numItems: numClouds * 3
		}
	};
	var vertex = new THREE.Vector3();
	var cloudPositions = cloudGeo.attributes.position.array;
	for (var i = 0, l = numClouds * 3; i < l; i += 3 * cloudsInCluster) {
		vertex.x = Math.random() * 2 * cloudDist - cloudDist;
		vertex.y = Math.random() * 2 * cloudDist - cloudDist;
		vertex.z = 500 + i/l * 1000;
		for (var j = 0; j < cloudsInCluster; ++j) {
			vertex.add(v.set(THREE.Math.randFloatSpread(100), THREE.Math.randFloatSpread(100), 0));
			cloudPositions[3*j+i  ] = vertex.x;
			cloudPositions[3*j+i+1] = vertex.y;
			cloudPositions[3*j+i+2] = vertex.z;
		}
	}
	var clouds = new THREE.ParticleSystem(cloudGeo, cloudMat);
	clouds.renderDepth = 1000;
	scene.add(clouds);

	this.update = function(position) {
		// Infinite ocean
		sea.position.x = position.x;
		sea.position.y = position.y;
		seaTex.offset.set(position.x / w * seaTex.repeat.x, position.y / h * seaTex.repeat.y);

		// Infinite clouds
		for (var i = 0, l = numClouds * 3; i < l; i += 3) {
			v.set(cloudPositions[i] - position.x, cloudPositions[i+1] - position.y, 0);
			if (Math.abs(v.x) > cloudDist) {
				cloudPositions[i] -= THREE.Math.sign(v.x) * cloudDist * 2;
				cloudGeo.verticesNeedUpdate = true;
			}
			if (Math.abs(v.y) > cloudDist) {
				cloudPositions[i+1] -= THREE.Math.sign(v.y) * cloudDist * 2;
				cloudGeo.verticesNeedUpdate = true;
			}
		}
	};
};


JET.CloudMaterial = function(params) {
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
	this.sizeAttenuation = params.sizeAttenuation;
	this.size = params.size;
	this.vertexColors = params.vertexColors;
	this.setValues(params);

	this.vertexShader = [
		"uniform float size;",
		"uniform float scale;",
		THREE.ShaderChunk[ "color_pars_vertex" ],
		"void main() {",
			THREE.ShaderChunk[ "color_vertex" ],
			"vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );",
			"#ifdef USE_SIZEATTENUATION",
				"gl_PointSize = size * ( scale / -mvPosition.z );",
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
		"void main() {",
			"gl_FragColor = vec4( psColor, opacity );",
			THREE.ShaderChunk[ "map_particle_fragment" ],
			THREE.ShaderChunk[ "alphatest_fragment" ],
			THREE.ShaderChunk[ "color_fragment" ],
		"}"
	].join("\n")
}
JET.CloudMaterial.prototype = Object.create(THREE.ShaderMaterial.prototype);
