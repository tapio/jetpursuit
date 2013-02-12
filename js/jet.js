
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
	bot.target = game.entityCache[0]; // FIXME

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
	else if (JET.Math.distSq(bot, bot.target) < 30*30)
		desiredSpeed = bot.target.speed;
	// Control the speed
	var speedError = desiredSpeed - bot.speed;
	var speedCorr = speedError * 10; // Apply gain
	speedCorr = THREE.Math.clamp(speedCorr, -bot.acceleration, bot.acceleration);
	bot.speed += speedCorr * dt;
};
