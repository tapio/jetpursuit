
JET.Controls = function(object) {
	var pressed = [];

	function onKeyDown(event) {
		var key = event.keyCode;
		pressed[key] = true;

		if (object.hull <= 0) return;

		if (key == 86) { // V
			object.cycleWeapons();
		} else if (key == 67) { // C
			object.cycleTargets();
		} else if (key == 88) { // X
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
		if (pressed[38]) { // Up
			object.speed += object.acceleration * dt;
		} else if (pressed[40]) { // Down
			object.speed -= object.acceleration * dt;
		}
		// Steering
		if (pressed[37]) { // Left
			object.angSpeed = object.turnRate;
		} else if (pressed[39]) { // Right
			object.angSpeed = -object.turnRate;
		}
		// Shoot
		if (pressed[32]) { // Space
			object.shoot();
		}
	};

};
