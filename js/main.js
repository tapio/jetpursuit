var scene = new THREE.Scene();
var game = new JET.Game();
var cache = new JET.Cache();
var pl = null;

(function() {
	var clock = new THREE.Clock();
	pl = new JET.Plane({
		name: "YOU",
		template: DATA.aircrafts[(Math.random() * DATA.aircrafts.length)|0],
		loadout: DATA.loadouts[(Math.random() * DATA.loadouts.length)|0]
	});
	game.add(pl);

	var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 5000);
	var controls = new JET.Controls(pl);
	var hud = new JET.HUD(pl);
	var world = new JET.World(scene);

	var renderer = new THREE.WebGLRenderer({ antialias: true });
	renderer.setSize(window.innerWidth, window.innerHeight);
	document.body.appendChild(renderer.domElement);

	var client = new JET.Client(pl, scene);

	var rendererInfo = document.getElementById("renderer-info");
	function formatRenderInfo(info) {
		var report = [
			"Prog:", info.memory.programs,
			"Geom:", info.memory.geometries,
			"Tex:", info.memory.textures,
			"Calls:", info.render.calls,
			"Verts:", info.render.vertices,
			"Faces:", info.render.faces,
			"Pts:", info.render.points
		];
		return report.join(' ');
	}

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
		camera.position.z += THREE.Math.mapLinear(pl.speed, pl.minSpeed, pl.maxSpeed, 100, 200);
		renderer.render(scene, camera);
		rendererInfo.innerHTML = formatRenderInfo(renderer.info);
	}

	function onWindowResize() {
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();
		renderer.setSize(window.innerWidth, window.innerHeight);
	}
	window.addEventListener('resize', onWindowResize, false);

	function onKeyPress(event) {
		if (event.charCode == 43) { // Plus
			var bot = new JET.Plane({
				faction: THREE.Math.randInt(0, 1),
				template: DATA.aircrafts[(Math.random() * DATA.aircrafts.length)|0],
				loadout: DATA.loadouts[(Math.random() * DATA.loadouts.length)|0]
			});
			bot.ai = {
				missileDelay: 4.0,
				missileTime: 0
			};
			var angle = Math.random() * Math.PI * 2;
			bot.position.x = pl.position.x + Math.cos(angle) * 500;
			bot.position.y = pl.position.y + Math.sin(angle) * 500;
			game.add(bot);
			addMessage("Bot added.");
		}
	}
	document.addEventListener('keypress', onKeyPress, false);

	render();

})();
