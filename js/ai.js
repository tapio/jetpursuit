
var AIUtils = {
	v1: new THREE.Vector2(),
	angleBetween: function(obj1, obj2) {
		AIUtils.v1.copy(obj2.position).sub(obj1.position);
		return Math.atan2(AIUtils.v1.y, AIUtils.v1.x);
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


function AIManager() {
	this.bots = [];
};

AIManager.prototype.spawn = function(faction) {
	faction = faction || THREE.Math.randInt(0, 1);
	var bot = new Plane(faction);
	this.bots.push(bot);
	scene.add(bot);
};

AIManager.prototype.update = function(dt) {
	for (var i = 0, l = this.bots.length; i < l; ++i) {
		var bot = this.bots[i];

		// Select target
		// FIXME: Deathmatch bot, team bot
		bot.target = this.enemy;

		// Control angle
		var desiredAngle = AIUtils.angleBetween(bot, bot.target);
		var angleError = AIUtils.angleDiff(bot.rotation.z, desiredAngle);
		var angleCorr = angleError * 10; // Apply gain
		angleCorr = THREE.Math.clamp(angleCorr, -bot.turnRate, bot.turnRate);
		bot.rotation.z += angleCorr * dt;

		// Figure out speed goal
		var desiredSpeed = bot.maxSpeed;
		if (Math.abs(angleError) > Math.PI / 4)
			desiredSpeed = bot.minSpeed;
		else if (AIUtils.distSq(bot, bot.target) < 30*30)
			desiredSpeed = bot.target.speed;
		// Control the speed
		var speedError = desiredSpeed - bot.speed;
		var speedCorr = speedError * 10; // Apply gain
		speedCorr = THREE.Math.clamp(speedCorr, -bot.acceleration, bot.acceleration);
		bot.speed += speedCorr * dt;

		// Update physics
		bot.update(dt);
	}
};
