
JET.BotNames = [
	"Ace", "Goose", "Hotshot", "Dagger", "Sword", "Anvil", "Hammer",
	"Flamer", "Dash", "Thunder", "Buzz", "Rooster"
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

	this.minSpeed = 30;
	this.maxSpeed = 660;
	this.speed = this.minSpeed;
	this.acceleration = 100;
	this.turnRate = Math.PI / 2;

	this.fuel = 100;
	this.maxFuel = 100;
	this.hull = 100;
	this.maxHull = 100;

	this.weapons = [
		new JET.Weapon("Cannon", { ammo: 1000, flightTime: 1.5, damage: 10, speed: 200, delay: 0.1 }),
		new JET.Weapon("SRAAM", { ammo: 20, flightTime: 6, damage: 35, speed: 150, delay: 0.2, guided: true, turnRate: Math.PI/4 }),
		new JET.Weapon("MRAAM", { ammo: 6, flightTime: 10, damage: 60, speed: 150, delay: 1.0, guided: true, turnRate: Math.PI/6 })
	];
	this.curWeapon = 0;
	this.dirtyStatus = true;

	this.target = null;
	this.targets = [];
	this.curTarget = 0;

	this.mesh = null;
	var self = this;
	var models = [ "F-15.js", "F-18.js", "F-22.js" ];
	cache.loadModel("assets/" + models[Math.floor(Math.random()*models.length)], function(geometry, materials) {
		var material = materials[0].clone();
		material.color.lerp(self.faction === 0 ? new THREE.Color(0x00ff00) : new THREE.Color(0xff0000), 0.15);
		self.mesh = new THREE.Mesh(geometry, material);
		self.add(self.mesh);
	});
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
	this.targets.sort(function(a, b) { a.tempSortDist - b.tempSortDist; });
	this.curTarget = 0;
	this.target = this.targets[this.curTarget];
	this.dirtyStatus = true;
};

JET.Plane.prototype.cycleTargets = function() {
	this.dirtyStatus = true;
	if (!this.targets.length) { this.scanTargets(); return }
	++this.curTarget;
	if (this.curTarget >= this.targets.length) { this.scanTargets(); return }
	this.target = this.targets[this.curTarget];
};

JET.Plane.prototype.cycleWeapons = function() {
	this.curWeapon = (this.curWeapon + 1) % this.weapons.length;
	this.dirtyStatus = true;
};

JET.Plane.prototype.shoot = function() {
	if (this.hull <= 0) return;
	this.weapons[this.curWeapon].shoot(this);
	this.dirtyStatus = true;
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

	var angle = this.rotation.z;
	this.position.x += Math.cos(angle) * this.speed * dt;
	this.position.y += Math.sin(angle) * this.speed * dt;
};
