var scene = new THREE.Scene();
var game = new Game();

(function() {
	var clock = new THREE.Clock();
	var pl = new Plane();
	game.add(pl);

	var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 5000);
	var controls = new Controls(pl);
	var hud = new HUD(pl);
	var world = new World(scene);

	renderer = new THREE.WebGLRenderer({ antialias: true });
	renderer.setSize(window.innerWidth, window.innerHeight);
	document.body.appendChild(renderer.domElement);

	var client = new Client(pl, scene);

	function render() {
		requestAnimationFrame(render);
		var dt = clock.getDelta();
		if (dt > 0.05) dt = 0.05; // Limit delta to 20 FPS

		controls.update(dt);
		game.update(dt);
		world.update(pl.position);
		client.update(dt);
		hud.update();

		camera.position.copy(pl.position);
		camera.position.z += 100;
		renderer.render(scene, camera);
	}

	function onWindowResize() {
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();
		renderer.setSize(window.innerWidth, window.innerHeight);
	};
	window.addEventListener('resize', onWindowResize, false);

	function onKeyPress(event) {
		if (event.charCode == 43) { // Plus
			var bot = new Plane({ faction: THREE.Math.randInt(0, 1) });
			bot.ai = true;
			game.add(bot);
		}
	};
	document.addEventListener('keypress', onKeyPress, false);

	render();

})();
