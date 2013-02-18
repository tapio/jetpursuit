
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
	var elems = [ "ping", "messages", "weapons", "speed", "fuel", "hull", "distance" ];
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

	// Target reticle
	var reticle = new THREE.Sprite(new THREE.SpriteMaterial({
		map: THREE.ImageUtils.loadTexture("assets/target-reticle.png"),
		transparent: true,
		useScreenCoordinates: false,
		sizeAttenuation: false
	}));
	reticle.scale.set(60, 60, 60);
	reticle.visible = false;
	scene.add(reticle);

	// Radar contact visualization
	var maxContacts = 50;
	var radarRenderDist = 12;
	var radarMat = new THREE.ParticleBasicMaterial({
		size: 3,
		depthTest: true,
		depthWrite: true,
		transparent: false,
		vertexColors: true,
		sizeAttenuation: false
	});
	var radarGeo = new THREE.BufferGeometry();
	radarGeo.dynamic = true;
	radarGeo.attributes = {
		position: {
			itemSize: 3,
			array: new Float32Array(maxContacts * 3),
			numItems: maxContacts * 3
		},
		color: {
			itemSize: 3,
			array: new Float32Array(maxContacts * 3),
			numItems: maxContacts * 3
		}
	};
	var radar = new THREE.ParticleSystem(radarGeo, radarMat);
	scene.add(radar);

	function updateRadar() {
		var i, j, l;
		var vertices = radarGeo.attributes.position.array;
		var colors = radarGeo.attributes.color.array;
		for (i = 0, j = 0, l = game.entityCache.length; i < l; ++i) {
			var contact = game.entityCache[i];
			if (contact.id === object.id) continue;
			if (j >= maxContacts * 3) break;
			var renderDist = radarRenderDist;
			// Determine color and other attributes based on faction
			if (object.target && contact.id === object.target.id) {
				// Target
				colors[j] = 1.0; colors[j+1] = 0.0; colors[j+2] = 0.0;
				renderDist *= 1.1;
			} else if (contact.faction !== object.faction) {
				// Enemy
				colors[j] = 1.0; colors[j+1] = 0.5; colors[j+2] = 0;
			} else {
				// Ally
				colors[j] = 0; colors[j+1] = 0.8; colors[j+2] = 0;
				renderDist *= 0.9;
			}
			// Set position based on direction
			var angle = JET.Math.angleBetween(object, contact);
			vertices[j  ] = object.position.x + Math.cos(angle) * renderDist;
			vertices[j+1] = object.position.y + Math.sin(angle) * renderDist;
			vertices[j+2] = object.position.z;
			j += 3;
		}
		for (i = j, l = maxContacts * 3; i < l; i += 3)
			vertices[i+2] = 100000;
		radarGeo.verticesNeedUpdate = true;
		radarGeo.colorsNeedUpdate = true;
	}

	this.update = function() {
		// Radar
		updateRadar();

		// Reticle & target properties
		if (object.target) {
			reticle.visible = true;
			reticle.position.copy(object.target.position);
			dom.distance.innerHTML = (Math.sqrt(JET.Math.distSq(object, object.target)) / 1000).toFixed(1) + " km";
		} else {
			reticle.visible = false;
			dom.distance.innerHTML = "n/a";
		}

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

		dom.ping.innerHTML = object.ping.toFixed(0);

		renderStats.update();
	};
};
