
function ColorGradient(color0, color1) {
	this.points = [];
	this.add = function(factor, color) {
		this.points.push({ f: factor, c: new THREE.Color(color) });
		this.points.sort(function(a, b){ return a.f-b.f });
	}
	this.add(0, color0);
	this.add(1, color1);
	this.get = function(factor) {
		// Simple cases
		if (factor >= 1.0) return this.points[this.points.length-1].c.clone();
		if (factor <= 0.0) return this.points[0].c.clone();
		if (this.points.length == 2) return this.points[0].c.clone().lerp(this.points[1].c, factor);
		// Complex multi color case
		var i, a, b;
		for (i = 1; i < this.points.length; ++i) {
			b = this.points[i];
			if (factor <= b.f) break;
		}
		a = this.points[i-1];
		factor = (factor - a.f) / (b.f - a.f);
		return a.c.clone().lerp(b.c, factor);
	};
}

function HUD(object) {
	var dom = {};
	var elems = [ "messages", "mg", "rockets", "aam", "speed", "fuel", "hull" ];
	for (var i = 0; i < elems.length; ++i)
		dom[elems[i]] = document.getElementById(elems[i]);

	var renderStats = new Stats();
	renderStats.domElement.style.position = 'absolute';
	renderStats.domElement.style.top = '0px';
	container.appendChild(renderStats.domElement);

	var statusGradient = new ColorGradient(0xcc0000, 0x005500);
	statusGradient.add(0.5, 0xcccc00);
	var speedGradient = new ColorGradient(0x005500, 0x00cc55);

	this.update = function() {
		renderStats.update();
		dom.mg.innerHTML = object.ammo.mg;
		dom.rockets.innerHTML = object.ammo.rockets;
		dom.aam.innerHTML = object.ammo.aam;

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
	};
}
