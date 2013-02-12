
function Plane(bulletManager) {
	THREE.Object3D.call(this);
	this.bulletManager = bulletManager;
	this.position.z = 1520;

	this.minSpeed = 30;
	this.maxSpeed = 660;
	this.speed = this.minSpeed;
	this.acceleration = 30;
	this.turnRate = Math.PI / 2;

	this.fuel = 100;
	this.maxFuel = 100;
	this.hull = 100;
	this.maxHull = 100;
	this.ammo = {
		mg: 1000,
		cannon: 100,
		rockets: 20,
		agm: 4,
		aam: 6
	};
	this.mesh = null;

	var self = this;
	cache.loadModel("assets/F-15.js", function(geometry, materials) {
		self.mesh = new THREE.Mesh(geometry, materials[0]);
		self.add(self.mesh);
	});
}

Plane.prototype = Object.create(THREE.Object3D.prototype);

Plane.prototype.shoot = function() {
	this.bulletManager.add(new Bullet(this, 100));
}

Plane.prototype.update = function(dt) {
	var angle = this.rotation.z;
	this.position.x += Math.cos(angle) * this.speed * dt;
	this.position.y += Math.sin(angle) * this.speed * dt;
};
