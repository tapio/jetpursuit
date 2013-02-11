
function Controls(object) {
	var pressed = [];

	function onKeyDown(event) {
		pressed[event.keyCode] = true;
	}

	function onKeyUp(event) {
		pressed[event.keyCode] = false;
	}

	document.addEventListener('keydown', onKeyDown, false);
	document.addEventListener('keyup', onKeyUp, false);

	this.update = function(dt) {
		// Thorttle
		if (pressed[38]) { // Up
			object.speed += object.acceleration * dt;
		} else if (pressed[40]) { // Down
			object.speed -= object.acceleration * dt;
		}
		// Steering
		if (pressed[37]) { // Left
			object.rotation.z += object.turnRate * dt;
		} else if (pressed[39]) { // Right
			object.rotation.z -= object.turnRate * dt;
		}
		// Limit speed
		object.speed = Math.max(object.speed, object.minSpeed);
		object.speed = Math.min(object.speed, object.maxSpeed);
	}

}
