/// A projectile
JET.Missile = function(weapon) {
	THREE.Object3D.call(this);
	this.weapon = weapon;
	this.speed = 0;
	this.flightTime = weapon ? weapon.flightTime || 0 : 0;
	this.target = null;
	var geometry = new THREE.CubeGeometry(2.0, 1.0, 1.0);
	var material = new THREE.MeshBasicMaterial({ color: 0x555555 });
	this.mesh = new THREE.Mesh(geometry, material);
	this.add(this.mesh);
};

JET.Missile.prototype = Object.create(THREE.Object3D.prototype);

JET.Missile.prototype.update = function(dt) {
	if (this.target) {
		// TODO: Home to the target
	}
	var angle = this.rotation.z;
	var dpos = this.speed * dt;
	this.position.x += Math.cos(angle) * dpos;
	this.position.y += Math.sin(angle) * dpos;
	this.flightTime -= dt;

	// Test for hit
	for (var i = 0, l = game.entityCache.length; i < l; ++i) {
		var obj = game.entityCache[i];
		if (obj.id === this.weapon.ownerId) continue;
		if (obj.testHit(this.position, this.weapon.radius)) {
			this.flightTime = 0;
			obj.hull -= this.weapon.damage;
			addMessage("HIT!");
			// TODO: Explosion
		}
	}
};


/// Weapon capable of shooting projectiles
/// Also manages its projectiles
JET.Weapon = function(name, params) {
	this.name = name;
	this.ownerId = params.ownerId;
	this.flightTime = params.flightTime;
	this.damage = params.damage;
	this.ammo = params.ammo;
	this.maxAmmo = params.ammo;
	this.radius = params.radius || 1;
	this.delay = params.delay || 0.1;
	this.speed = params.speed || 150;
	this.guided  = params.guided || false;
	this.bullets = [];
	this.lastTime = 0;
};

JET.Weapon.prototype.shoot = function(shooter) {
	if (this.ammo <= 0) return;
	var t = Date.now() * 0.001;
	if (t < this.lastTime + this.delay) return;
	this.lastTime = t;
	this.ownerId = shooter.id;
	--this.ammo;
	var bullet = new JET.Missile(this);
	bullet.position.copy(shooter.position);
	bullet.rotation.copy(shooter.rotation);
	bullet.speed = this.speed + shooter.speed;
	if (this.guided) bullet.target = shooter.target;
	this.bullets.push(bullet);
	scene.add(bullet);
};

JET.Weapon.prototype.update = function(dt) {
	for (var i = this.bullets.length-1; i >= 0; --i) {
		var bullet = this.bullets[i];
		bullet.update(dt);
		// Remove the bullet if it's dead
		if (bullet.flightTime <= 0) {
			scene.remove(bullet);
			this.bullets.splice(i, 1);
		}
	}
};
