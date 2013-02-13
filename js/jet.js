
var JET = JET || {};

JET.Math = {
	v1: new THREE.Vector2(),
	angleBetween: function(obj1, obj2) {
		JET.Math.v1.copy(obj2.position).sub(obj1.position);
		return Math.atan2(JET.Math.v1.y, JET.Math.v1.x);
	},
	angleDiff: function(a, b) {
		var ang = (b - a) % (2*Math.PI);
		if (ang > Math.PI) return ang - 2*Math.PI;
		else if (ang < -Math.PI) return ang + 2*Math.PI;
		else return ang;
	},
	distSq: function(obj1, obj2) {
		return obj1.position.distanceToSquared(obj2.position);
	}
};

JET.updateAI = function(bot, dt) {
	// Select target
	if (!bot.target || bot.target.hull <= 0) {
		bot.cycleTargets();
		if (!bot.target) return;
	}

	var targetDistSq = JET.Math.distSq(bot, bot.target);

	// Control angle
	var desiredAngle = JET.Math.angleBetween(bot, bot.target);
	var angleError = JET.Math.angleDiff(bot.rotation.z, desiredAngle);
	var angleCorr = angleError * 10; // Apply gain
	angleCorr = THREE.Math.clamp(angleCorr, -bot.turnRate, bot.turnRate);
	bot.rotation.z += angleCorr * dt;

	// Figure out speed goal
	var desiredSpeed = bot.maxSpeed;
	if (Math.abs(angleError) > Math.PI / 4)
		desiredSpeed = bot.minSpeed;
	else if (targetDistSq < 50*50)
		desiredSpeed = bot.target.speed;
	else if (targetDistSq < 200*200)
		desiredSpeed = bot.target.speed * 1.1;

	// Control the speed
	var speedError = desiredSpeed - bot.speed;
	var speedCorr = speedError * 10; // Apply gain
	speedCorr = THREE.Math.clamp(speedCorr, -bot.acceleration, bot.acceleration);
	bot.speed += speedCorr * dt;

	// Weapons
	if (targetDistSq < 100*100 && angleError < Math.PI / 16) {
		bot.curWeapon = 0;
		bot.shoot();
	}
};
