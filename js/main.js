
(function() {
	var clock = new THREE.Clock();
	var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
	camera.position.z = 100;

	var scene = new THREE.Scene();

	var pl = new Plane();
	scene.add(pl);
	//pl.add(camera);

	var controls = new Controls(pl);

	renderer = new THREE.WebGLRenderer({ antialias: true });
	renderer.setSize(window.innerWidth, window.innerHeight);
	document.body.appendChild(renderer.domElement);

	function render() {
		requestAnimationFrame(render);
		var dt = clock.getDelta();
		if (dt > 0.05) dt = 0.05; // Limit delta to 20 FPS

		controls.update(dt);
		pl.update(dt);

		renderer.render(scene, camera);
	}
	render();

})();
