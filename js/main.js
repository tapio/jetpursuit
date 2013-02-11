
(function() {
	var clock = new THREE.Clock();
	var scene = new THREE.Scene();

	var pl = new Plane();
	pl.position.z = 1520;
	scene.add(pl);

	var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 5000);

	var controls = new Controls(pl);
	var hud = new HUD(pl);

	renderer = new THREE.WebGLRenderer({ antialias: true });
	renderer.setSize(window.innerWidth, window.innerHeight);
	document.body.appendChild(renderer.domElement);

	function render() {
		requestAnimationFrame(render);
		var dt = clock.getDelta();
		if (dt > 0.05) dt = 0.05; // Limit delta to 20 FPS

		controls.update(dt);
		pl.update(dt);
		hud.update();

		camera.position.copy(pl.position);
		camera.position.z += 100;
		renderer.render(scene, camera);
	}
	render();

})();
