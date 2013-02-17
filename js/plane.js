
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
	if (!params.template)
		throw "Error: Aircraft template required";
	this.id = params.id || Math.floor(Math.random()*100000000).toString(36);
	this.name = params.name || JET.BotNames[Math.floor(Math.random()*JET.BotNames.length)];
	this.faction = params.faction || 0;
	this.local = params.local || true;
	this.position.z = 1520;
	this.ping = 0;

	this.minSpeed = params.template.minSpeed;
	this.maxSpeed = params.template.maxSpeed;
	this.speed = this.minSpeed;
	this.acceleration = params.template.acceleration;
	this.angSpeed = 0;
	this.angle = 0;
	this.turnRate = params.template.turnRate;

	this.maxFuel = 100;
	this.fuel = this.maxFuel;
	this.maxHull = params.template.maxHull;
	this.hull = this.maxHull;

	this.weapons = [];
	if (params.loadout) {
		for (var w in params.loadout.ammo) {
			this.weapons.push(new JET.Weapon(this, params.loadout.ammo[w], DATA.weapons[w]));
		}
	}
	this.curWeapon = 0;
	this.dirtyStatus = true;

	this.target = null;
	this.targets = [];
	this.curTarget = 0;

	this.mesh = null;
	var self = this;
	cache.loadModel("assets/" + params.template.mesh + ".js", function(geometry) {
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

JET.Plane.prototype.cycleWeapons = function(dir) {
	dir = dir || 1;
	this.curWeapon = (this.curWeapon + dir + this.weapons.length) % this.weapons.length;
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
	if (this.hull <= 0) return false;
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

	if (this.target && this.target.hull <= 0) this.target = null;
	return true;
};

JET.Plane.__m1 = new THREE.Matrix4();
