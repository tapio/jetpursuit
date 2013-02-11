
function World(scene) {
	var w = 5000, h = 5000;
	var seaTex = THREE.ImageUtils.loadTexture("assets/water.jpg");
	seaTex.wrapS = seaTex.wrapT = THREE.RepeatWrapping;
	seaTex.repeat.set(2, 2);
	var seaMat = new THREE.MeshBasicMaterial({ map: seaTex });
	var seaGeo = new THREE.PlaneGeometry(w, h);
	var sea = new THREE.Mesh(seaGeo, seaMat);
	scene.add(sea);

	this.update = function(position) {
		sea.position.x = position.x;
		sea.position.y = position.y;
		seaTex.offset.set(position.x / w * seaTex.repeat.x, position.y / h * seaTex.repeat.y);
	};
}
