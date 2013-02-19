
JET.Controls = function(object) {
	var pressed = [];

	function onKeyDown(event) {
		var key = event.keyCode;
		pressed[key] = true;

		if (object.hull <= 0) return;

		if (key == 9) { // Tab
			object.cycleWeapons();
			event.preventDefault();
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
		if (pressed[87] || pressed[38]) { // W || Up
			object.speed += object.acceleration * dt;
		} else if (pressed[83] || pressed[40]) { // S || Down
			object.speed -= object.acceleration * dt;
		}
		// Steering
		if (pressed[65] || pressed[37]) { // A || Left
			object.angSpeed = object.turnRate;
		} else if (pressed[68] || pressed[39]) { // D || Right
			object.angSpeed = -object.turnRate;
		}
		// Shoot
		if (pressed[32]) { // Space
			object.shoot();
		}
	};

};
