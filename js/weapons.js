function Missile(weapon) {
	THREE.Object3D.call(this);
	this.weapon = weapon;
	this.speed = 0;
	this.range = 0;
	this.target = null;
	var geometry = new THREE.CubeGeometry(2.0, 1.0, 1.0);
	var material = new THREE.MeshBasicMaterial({ color: 0x555555 });
	this.mesh = new THREE.Mesh(geometry, material);
	this.add(this.mesh);
}
Missile.prototype = Object.create(THREE.Object3D.prototype);

Missile.prototype.update = function(dt) {
	if (this.target) {
		// TODO: Home to the target
	}
	var angle = this.rotation.z;
	var dpos = this.speed * dt;
	this.position.x += Math.cos(angle) * dpos;
	this.position.y += Math.sin(angle) * dpos;
	this.range -= dpos;
	// TODO: Check for collisions

};


function Weapon(name, params) {
	this.name = name;
	this.range = params.range;
	this.damage = params.damage;
	this.ammo = params.ammo;
	this.maxAmmo = params.ammo;
	this.radius = params.radius || 1;
	this.delay = params.delay || 0.1;
	this.speed = params.speed || 150;
	this.guided  = params.guided || false;
	this.bullets = [];
	this.lastTime = 0;
}

Weapon.prototype.shoot = function(shooter) {
	if (this.ammo <= 0) return;
	var t = Date.now() * 0.001;
	if (t < this.lastTime + this.delay) return;
	this.lastTime = t;
	--this.ammo;
	var bullet = new Missile(this);
	bullet.position.copy(shooter.position);
	bullet.rotation.copy(shooter.rotation);
	bullet.range = this.range;
	bullet.speed = this.speed + shooter.speed;
	if (this.guided) bullet.target = shooter.target;
	this.bullets.push(bullet);
	scene.add(bullet);
};

Weapon.prototype.update = function(dt) {
	for (var i = this.bullets.length-1; i >= 0; --i) {
		var bullet = this.bullets[i];
		bullet.update(dt);
		// Remove the bullet if it's dead
		if (bullet.range <= 0) {
			scene.remove(bullet)
			this.bullets.splice(i, 1);
		}
	}
};
