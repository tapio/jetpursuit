
function Plane(params) {
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
	this.weapons = {
		mg:     new Weapon("MG", { ammo: 1000, range: 100, damage: 5, delay: 0.1 }),
		rocket: new Weapon("Rocket", { ammo: 20, range: 200, damage: 25, delay: 0.2 }),
		aam:    new Weapon("AAM", { ammo: 6, range: 100, damage: 60, delay: 1.0 })
	};
	this.mesh = null;

	var self = this;
	cache.loadModel("assets/F-15.js", function(geometry, materials) {
		var material = materials[0].clone();
		material.color.lerp(self.faction === 0 ? new THREE.Color(0x00ff00) : new THREE.Color(0xff0000), 0.15);
		self.mesh = new THREE.Mesh(geometry, material);
		self.add(self.mesh);
	});
}

Plane.prototype = Object.create(THREE.Object3D.prototype);

Plane.prototype.shoot = function() {
	this.weapons.rocket.shoot(this);
}

Plane.prototype.update = function(dt) {
	this.speed = THREE.Math.clamp(this.speed, this.minSpeed, this.maxSpeed);

	var angle = this.rotation.z;
	this.position.x += Math.cos(angle) * this.speed * dt;
	this.position.y += Math.sin(angle) * this.speed * dt;

	// Update bullets
	for (var w in this.weapons)
		this.weapons[w].update(dt);
};
