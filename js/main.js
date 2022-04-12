var cache = new JET.Cache();
var scene = new THREE.Scene();
var world = new JET.World(scene);
var renderer = new THREE.WebGLRenderer({ antialias: true });
var game = new JET.Game();
var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 5000);
var pl = null;

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
window.addEventListener('resize', function() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);
}, false);


// Menu background, moving clouds
(function(scene, camera, world) {
	camera.position.z = 1600;
	var clock = new THREE.Clock();
	function render() {
		if (pl !== null) return;
		requestAnimationFrame(render);
		var dt = clock.getDelta();
		world.update(camera.position);
		camera.position.x += 75 * dt;
		renderer.render(scene, camera);
	}
	render();
})(scene, camera, world);


function start(params) {
	params = params || {};
	if (params.allies === undefined && params.enemies === undefined) {
		var count = THREE.Math.randInt(1, 15);
		params.enemies = count;
		params.allies = count - 1;
	}

	pl = new JET.Plane({
		name: "YOU",
		template: params.aircraft || DATA.aircrafts[(Math.random() * DATA.aircrafts.length)|0],
		loadout: params.loadout || DATA.loadouts[(Math.random() * DATA.loadouts.length)|0]
	});
	game.add(pl);
	JET.listener = pl;

	function spawnBot(faction) {
		var template = params.identicalAircrafts ? params.aircraft : DATA.aircrafts[(Math.random() * DATA.aircrafts.length)|0];
		var loadout = params.identicalLoadouts ? params.loadout : DATA.loadouts[(Math.random() * DATA.loadouts.length)|0];
		var bot = new JET.Plane({
			faction: faction !== undefined ? faction : THREE.Math.randInt(0, 1),
			template: template,
			loadout: loadout
		});
		bot.ai = {
			missileDelay: 4.0,
			missileTime: 0
		};
		var angle = Math.random() * Math.PI * 2;
		bot.position.x = pl.position.x + Math.cos(angle) * 500;
		bot.position.y = pl.position.y + Math.sin(angle) * 500;
		game.add(bot);
	}
	var i;
	for (i = 0; i < params.allies; ++i)
		spawnBot(pl.faction);
	for (i = 0; i < params.enemies; ++i)
		spawnBot(pl.faction + 1);

	var controls = new JET.Controls(pl);
	var hud = new JET.HUD(pl);
	//var client = new JET.Client(pl, scene);

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

	var clock = new THREE.Clock();
	function render() {
		requestAnimationFrame(render);
		var dt = clock.getDelta();
		if (dt > 0.05) dt = 0.05; // Limit delta to 20 FPS

		if (!game.ended) {
			controls.update(dt);
			game.update(dt);
			world.update(pl.position);
			//client.update(dt);
			hud.update();

			// Camera position handling, including speed-dependent effects
			var camPos = camera.position;
			camPos.copy(pl.position);
			if (pl.speed >= pl.maxSpeed * 0.75) {
				var shake = THREE.Math.mapLinear(pl.speed, pl.maxSpeed * 0.75, pl.maxSpeed, 0.0, 1.0);
				camPos.x += Math.random() * shake;
				camPos.y += Math.random() * shake;
			}
			camPos.z += THREE.Math.mapLinear(pl.speed, pl.minSpeed, pl.maxSpeed, 100, 200);
		}

		renderer.render(scene, camera);

		if (JET.CONFIG.showStats)
			rendererInfo.innerHTML = formatRenderInfo(renderer.info);
	}

	function onKeyPress(event) {
		if (event.charCode == 43) { // Plus
			spawnBot();
			addMessage("Bot added.");
		}
	}
	document.addEventListener('keypress', onKeyPress, false);

	render();
}
