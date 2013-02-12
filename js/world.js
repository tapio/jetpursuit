
function World(scene) {
	// Lights
	var ambient = new THREE.AmbientLight(0x444444);
	scene.add(ambient);
	var sun = new THREE.DirectionalLight(0xffffff, 0.6);
	sun.position.set(1.0, 1.0, 2.0);
	scene.add(sun);

	// Sea
	var w = 5000, h = 5000;
	var seaTex = THREE.ImageUtils.loadTexture("assets/water.jpg");
	seaTex.wrapS = seaTex.wrapT = THREE.RepeatWrapping;
	seaTex.repeat.set(2, 2);
	var seaMat = new THREE.MeshBasicMaterial({ map: seaTex });
	var seaGeo = new THREE.PlaneGeometry(w, h);
	var sea = new THREE.Mesh(seaGeo, seaMat);
	scene.add(sea);

	// Clouds
	var numClouds = 1000;
	var cloudDist = 1000;
	var cloudTex = THREE.ImageUtils.loadTexture("assets/cloud1.png");
	var cloudGeo = new THREE.Geometry();
	var cloudMat = new THREE.ParticleBasicMaterial({
		size: 128,
		map: cloudTex,
		depthTest: true,
		transparent: true,
		opacity: 0.9
	});
	var v = new THREE.Vector3();
	var vertex = new THREE.Vector3();
	for (var i = 0; i < numClouds; ++i) {
		vertex.x = Math.random() * 2 * cloudDist - cloudDist;
		vertex.y = Math.random() * 2 * cloudDist - cloudDist;
		vertex.z = Math.random() * 2000 + 1000;
		for (var j = 0; j < 4; ++j) {
			v.set(Math.random() * 50, Math.random() * 50, 0);
			cloudGeo.vertices.push(vertex.clone().add(v));
		}
	}
	var clouds = new THREE.ParticleSystem(cloudGeo, cloudMat);
	clouds.sortParticles = true;
	scene.add(clouds);

	var v = new THREE.Vector3();

	this.update = function(position) {
		// Infinite ocean
		sea.position.x = position.x;
		sea.position.y = position.y;
		seaTex.offset.set(position.x / w * seaTex.repeat.x, position.y / h * seaTex.repeat.y);

		// Infinite clouds
		for (var i = 0, l = cloudGeo.vertices.length; i < l; ++i) {
			var cloudpos = cloudGeo.vertices[i];
			v.subVectors(cloudpos, position);
			if (Math.abs(v.x) > cloudDist) {
				cloudpos.x -= THREE.Math.sign(v.x) * cloudDist * 2;
				cloudGeo.verticesNeedUpdate = true;
			}
			if (Math.abs(v.y) > cloudDist) {
				cloudpos.y -= THREE.Math.sign(v.y) * cloudDist * 2;
				cloudGeo.verticesNeedUpdate = true;
			}
		}
	};
}
