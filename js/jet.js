
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

JET.MaterialLib = {};
JET.GeometryLib = {};
JET.TextureLib = {};

JET.ColorGradient = function(color0, color1) {
	this.points = [];
	this.add = function(factor, color) {
		this.points.push({ f: factor, c: new THREE.Color(color) });
		this.points.sort(function(a, b){ return a.f - b.f; });
	};
	this.add(0, color0);
	this.add(1, color1);
	this.getTo = function(factor, color) {
		// Simple cases
		if (factor >= 1.0) { color.copy(this.points[this.points.length-1].c); return; }
		if (factor <= 0.0) { color.copy(this.points[0].c); return; }
		if (this.points.length == 2) { color.copy(this.points[0].c).lerp(this.points[1].c, factor); return; }
		// Complex multi color case
		var i, a, b;
		for (i = 1; i < this.points.length; ++i) {
			b = this.points[i];
			if (factor <= b.f) break;
		}
		a = this.points[i-1];
		factor = (factor - a.f) / (b.f - a.f);
		color.copy(a.c).lerp(b.c, factor);
	};
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
	var angleError = JET.Math.angleDiff(bot.angle, desiredAngle);
	bot.angSpeed = angleError * 10; // Apply gain, clamped in Plane.update()

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
	if (targetDistSq < 150*150 && angleError < Math.PI / 16) {
		bot.curWeapon = 0; // Cannon
		bot.shoot();
	} else if (targetDistSq > 200*200 && targetDistSq < 500*500 && angleError < Math.PI / 4) {
		var t = Date.now();
		if (t > bot.ai.missileTime + bot.ai.missileDelay * 1000) {
			bot.curWeapon = 1; // SRAAM
			bot.shoot();
			bot.ai.missileTime = t;
		}
	}
};
