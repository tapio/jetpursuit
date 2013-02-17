
JET.Controls = function(object) {
	var pressed = [];

	function onKeyDown(event) {
		var key = event.keyCode;
		pressed[key] = true;

		if (object.hull <= 0) return;

		if (key == 38) { // Up
			object.cycleWeapons(-1);
		} else if (key == 40) { // Down
			object.cycleWeapons();
		} else if (key == 69) { // E
			object.cycleTargets();
		} else if (key == 81) { // Q
			object.scanTargets();
		}
	}

	function onKeyUp(event) {
		pressed[event.keyCode] = false;
	}

	document.addEventListener('keydown', onKeyDown, false);
	document.addEventListener('keyup', onKeyUp, false);

	this.update = function(dt) {
		if (object.hull <= 0) return;
		// Throttle
		if (pressed[87]) { // W
			object.speed += object.acceleration * dt;
		} else if (pressed[83]) { // S
			object.speed -= object.acceleration * dt;
		}
		// Steering
		if (pressed[65]) { // A
			object.angSpeed = object.turnRate;
		} else if (pressed[68]) { // D
			object.angSpeed = -object.turnRate;
		}
		// Shoot
		if (pressed[32]) { // Space
			object.shoot();
		}
	};

};
