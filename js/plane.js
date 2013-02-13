
JET.Plane = function(params) {
	THREE.Object3D.call(this);
	params = params || {};
	this.id = params.id || Math.floor(Math.random()*100000000).toString(36);
	this.faction = params.faction || 0;
	this.local = params.local || true;
	this.position.z = 1520;

	this.minSpeed = 30;
	this.maxSpeed = 660;
	this.speed = this.minSpeed;
	this.acceleration = 100;
	this.turnRate = Math.PI / 2;

	this.fuel = 100;
	this.maxFuel = 100;
	this.hull = 100;
	this.maxHull = 100;

	this.target = null;
	this.weapons = [
		new JET.Weapon("Cannon", { ammo: 1000, range: 100, damage: 5, delay: 0.1 }),
		new JET.Weapon("SRAAM", { ammo: 20, range: 200, damage: 25, delay: 0.15 }),
		new JET.Weapon("MRAAM", { ammo: 6, range: 500, damage: 60, delay: 1.0 })
	];
	this.curWeapon = 0;
	this.dirtyStatus = true;
	this.mesh = null;

	var self = this;
	cache.loadModel("assets/F-15.js", function(geometry, materials) {
		var material = materials[0].clone();
		material.color.lerp(self.faction === 0 ? new THREE.Color(0x00ff00) : new THREE.Color(0xff0000), 0.15);
		self.mesh = new THREE.Mesh(geometry, material);
		self.add(self.mesh);
	});
};

JET.Plane.prototype = Object.create(THREE.Object3D.prototype);

JET.Plane.prototype.cycleWeapons = function() {
	this.curWeapon = (this.curWeapon + 1) % this.weapons.length;
	this.dirtyStatus = true;
};

JET.Plane.prototype.shoot = function() {
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

	// Update bullets
	for (var w in this.weapons)
		this.weapons[w].update(dt);
};
