
JET.BotNames = [
	"Ace", "Goose", "Hotshot", "Dagger", "Sword", "Anvil", "Hammer",
	"Flamer", "Dash", "Thunder", "Buzz", "Rooster"
];

JET.MaterialLib.factions = [
	new THREE.MeshPhongMaterial({ color: 0x335533, specular: 0xffffff }),
	new THREE.MeshPhongMaterial({ color: 0x663333, specular: 0xffffff })
];


JET.Plane = function(params) {
	THREE.Object3D.call(this);
	params = params || {};
	this.id = params.id || Math.floor(Math.random()*100000000).toString(36);
	this.name = params.name || JET.BotNames[Math.floor(Math.random()*JET.BotNames.length)];
	this.faction = params.faction || 0;
	this.local = params.local || true;
	this.position.z = 1520;
	this.ping = 0;

	this.minSpeed = 75;
	this.maxSpeed = 500;
	this.speed = this.minSpeed;
	this.acceleration = 100;
	this.angSpeed = 0;
	this.angle = 0;
	this.turnRate = Math.PI / 2;

	this.fuel = 100;
	this.maxFuel = 100;
	this.hull = 100;
	this.maxHull = 100;

	this.weapons = [
		new JET.Weapon("Cannon", { ammo: 1000, flightTime: 1.5, damage: 10, speed: 200, delay: 0.1 }),
		new JET.Weapon("SRAAM", { ammo: 20, flightTime: 6, damage: 35, speed: 150, delay: 0.2, guided: true, turnRate: Math.PI/6 }),
		new JET.Weapon("MRAAM", { ammo: 6, flightTime: 10, damage: 60, speed: 150, delay: 1.0, guided: true, turnRate: Math.PI/8 })
	];
	this.curWeapon = 0;
	this.dirtyStatus = true;

	this.target = null;
	this.targets = [];
	this.curTarget = 0;

	this.mesh = null;
	var self = this;
	var models = [ "F-15.js", "F-18.js", "F-22.js" ];
	cache.loadModel("assets/" + models[Math.floor(Math.random()*models.length)], function(geometry) {
		self.mesh = new THREE.Mesh(geometry, JET.MaterialLib.factions[self.faction]);
		self.add(self.mesh);
	});
	this.trail = JET.createTrail(this);
	game.addEmitter(this.trail);
};

JET.Plane.prototype = Object.create(THREE.Object3D.prototype);

JET.Plane.prototype.scanTargets = function() {
	this.targets = [];
	for (var i = 0, l = game.entityCache.length; i < l; ++i) {
		var contact = game.entityCache[i];
		if (contact.faction === this.faction) continue;
		this.targets.push(contact);
		contact.tempSortDist = JET.Math.distSq(this, contact);
	}
	this.targets.sort(function(a, b) { return a.tempSortDist - b.tempSortDist; });
	this.curTarget = 0;
	this.target = this.targets[this.curTarget];
	this.dirtyStatus = true;
};

JET.Plane.prototype.cycleTargets = function() {
	this.dirtyStatus = true;
	if (!this.targets.length) { this.scanTargets(); return; }
	++this.curTarget;
	if (this.curTarget >= this.targets.length) { this.scanTargets(); return; }
	this.target = this.targets[this.curTarget];
};

JET.Plane.prototype.cycleWeapons = function() {
	this.curWeapon = (this.curWeapon + 1) % this.weapons.length;
	this.dirtyStatus = true;
};

JET.Plane.prototype.shoot = function() {
	if (this.weapons[this.curWeapon].shoot(this)) {
		this.dirtyStatus = true;
		if (this.weapons[this.curWeapon].guided)
			JET.SoundLibrary.missile.play();
		else JET.SoundLibrary.cannon.play();
	}
};

JET.Plane.prototype.testHit = function(pos, radius) {
	var distSq = this.position.distanceToSquared(pos);
	var thresholdSq = radius + this.mesh.geometry.boundingSphere.radius;
	thresholdSq *= thresholdSq;
	if (distSq < thresholdSq) return true;
	else return false;
};

JET.Plane.prototype.update = function(dt) {
	this.speed = THREE.Math.clamp(this.speed, this.minSpeed, this.maxSpeed);
	this.angSpeed = THREE.Math.clamp(this.angSpeed, -this.turnRate, this.turnRate);

	// Update heading
	this.angle += this.angSpeed * dt;
	this.angSpeed *= 0.9;

	// Rotate the model based on roll and yaw
	var roll = THREE.Math.clamp(-this.angSpeed, -Math.PI / 6, Math.PI / 6);
	JET.Plane.__m1.makeRotationX(roll);
	this.matrix.makeRotationZ(this.angle);
	this.matrix.multiply(JET.Plane.__m1);
	this.rotation.setEulerFromRotationMatrix(this.matrix);

	// Update position
	this.position.x += Math.cos(this.angle) * this.speed * dt;
	this.position.y += Math.sin(this.angle) * this.speed * dt;
};

JET.Plane.__m1 = new THREE.Matrix4();
