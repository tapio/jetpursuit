
var addMessage = (function() {
	var messages = [];
	var maxMessages = 6;
	var colors = { info: {r:20,g:250,b:20}, warn: {r:200,g:200,b:0}, error: {r:255,g:80,b:80} };
	var elem = document.getElementById("messages");
	return function(msg, msgtype) {
		msgtype = msgtype || "info";
		if (messages.length && messages[messages.length-1].text === msg)
			messages[messages.length-1].count++;
		else messages.push({ text: msg, type: msgtype, count: 1 });
		if (messages.length > maxMessages) messages.splice(0, messages.length - maxMessages);
		var msgs = "", last = messages.length-1, color, fadefactor, r, g, b, mult;
		for (var i = 0; i <= last; ++i) {
			color = colors[messages[i].type];
			fadefactor = (last-i)/3 + 1;
			r = Math.floor(color.r / fadefactor);
			g = Math.floor(color.g / fadefactor);
			b = Math.floor(color.b / fadefactor);
			if (messages[i].count > 1) mult = " x" + messages[i].count;
			else mult = "";
			msgs += '<span style="color: rgb('+r+','+g+','+b+');">'+messages[i].text+mult+'</span><br/>';
			if (i == messages.length-1) msgs = '<span style="font-size:1.1em">'+msgs+'</span>';
		}
		elem.innerHTML = msgs;
	};
})();


JET.HUD = function(object) {
	var dom = {};
	var i;
	var elems = [ "ping", "messages", "weapons", "speed", "fuel", "hull" ];
	for (i = 0; i < elems.length; ++i)
		dom[elems[i]] = document.getElementById(elems[i]);

	// FPS counter
	var renderStats = new Stats();
	renderStats.domElement.style.position = 'absolute';
	renderStats.domElement.style.bottom = '0px';
	document.getElementById("container").appendChild(renderStats.domElement);

	// Gradients
	var statusGradient = new JET.ColorGradient(0xcc0000, 0x005500);
	statusGradient.add(0.5, 0xcccc00);
	var speedGradient = new JET.ColorGradient(0x005500, 0x00cc55);

	// Radar contact visualization
	var radarGeo = new THREE.Geometry();
	var radarMat = new THREE.ParticleBasicMaterial({
		size: 3,
		depthTest: true,
		depthWrite: true,
		transparent: false,
		vertexColors: true,
		sizeAttenuation: false
	});
	for (i = 0; i < 50; ++i) {
		radarGeo.vertices.push(new THREE.Vector3(0, 0, 100000));
		radarGeo.colors.push(new THREE.Color());
	}
	var radarDist = 12;
	var radar = new THREE.ParticleSystem(radarGeo, radarMat);
	scene.add(radar);

	function updateRadar() {
		for (var i = 0, j = 0, l = game.entityCache.length; i < l; ++i) {
			var contact = game.entityCache[i];
			if (contact.id === object.id) continue;
			if (j >= radarGeo.vertices.length) break;
			// Set position based on direction
			var angle = JET.Math.angleBetween(object, contact);
			var vertex = radarGeo.vertices[j];
			vertex.x = object.position.x + Math.cos(angle) * radarDist;
			vertex.y = object.position.y + Math.sin(angle) * radarDist;
			vertex.z = object.position.z;
			// Determine color based on faction
			var color = radarGeo.colors[j];
			if (object.target && contact.id === object.target.id) {
				color.setRGB(1, 0, 1); // Target
				vertex.z += 2; // Put on top
			} else if (contact.faction !== object.faction) {
				color.setRGB(1, 0, 0); // Enemy
				vertex.z += 1; // Rise above allies
			} else color.setRGB(0, 1, 0); // Ally
			++j;
		}
		for (i = j; i < radarGeo.vertices.length; ++i)
			radarGeo.vertices[i].z = 100000;
		radarGeo.verticesNeedUpdate = true;
		radarGeo.colorsNeedUpdate = true;
	}

	this.update = function() {
		// Radar
		updateRadar();

		// Weapons
		if (object.dirtyStatus) {
			var html = "";
			for (var i = 0; i < object.weapons.length; ++i) {
				var weapon = object.weapons[i];
				var ammoRatio = weapon.ammo / weapon.maxAmmo;
				var sel = i == object.curWeapon ? '<li class="selected">' : '<li>';
				html += sel + weapon.name + ': <span style="color:' +
					statusGradient.get(ammoRatio).getStyle() +
					'">' + weapon.ammo + '</span></li>';
			}
			dom.weapons.innerHTML = html;
			object.dirtyStatus = false;
		}

		// Plane status
		var speedRatio = (object.speed - object.minSpeed) / (object.maxSpeed - object.minSpeed);
		var fuelRatio = object.fuel / object.maxFuel;
		var hullRatio = object.hull / object.maxHull;
		dom.speed.innerHTML = (object.speed / 340).toFixed(1) + " Ma";
		dom.fuel.innerHTML = (fuelRatio * 100).toFixed(0) + " %";
		dom.hull.innerHTML = (hullRatio * 100).toFixed(0) + " %";
		// Colors
		dom.speed.style.color = speedGradient.get(speedRatio).getStyle();
		dom.fuel.style.color = statusGradient.get(fuelRatio).getStyle();
		dom.hull.style.color = statusGradient.get(hullRatio).getStyle();

		dom.ping.innerHTML = object.ping;

		renderStats.update();
	};
};
