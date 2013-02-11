
function HUD(object) {
	var dom = {};
	var elems = [ "messages", "mg", "rockets", "aam", "speed", "fuel", "hull" ];
	for (var i = 0; i < elems.length; ++i)
		dom[elems[i]] = document.getElementById(elems[i]);

	this.update = function() {
		dom.mg.innerHTML = object.ammo.mg;
		dom.rockets.innerHTML = object.ammo.rockets;
		dom.aam.innerHTML = object.ammo.aam;
		dom.speed.innerHTML = (object.speed / 334).toFixed(1) + " Ma";
		dom.fuel.innerHTML = (object.fuel / object.maxFuel * 100).toFixed(0) + " %";
		dom.hull.innerHTML = (object.hull / object.maxHull * 100).toFixed(0) + " %";
	};
}
