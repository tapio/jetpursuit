function Bullet(shooter, speed) {
	THREE.Object3D.call(this);
	this.position.copy(shooter.position);
	this.rotation.copy(shooter.rotation);
	this.speed = shooter.speed + speed;
	this.fuel = 100;

	var geometry = new THREE.CubeGeometry(0.5, 0.5, 0.5);
	var material = new THREE.MeshBasicMaterial({ color: 0x111111 });
	this.mesh = new THREE.Mesh(geometry, material);
	this.add(this.mesh);
}

Bullet.prototype = Object.create(THREE.Object3D.prototype);


Bullet.prototype.update = function(dt) {
	var angle = this.rotation.z;
	this.position.x += Math.cos(angle) * this.speed * dt;
	this.position.y += Math.sin(angle) * this.speed * dt;
};



function BulletManager(scene) {
	this.scene = scene;
	this.bullets = [];
}

BulletManager.prototype.add = function(bullet) {
	this.bullets.push(bullet);
	this.scene.add(bullet);
	return bullet;
};

BulletManager.prototype.update = function(dt) {
	for (var i = 0, l = this.bullets.length; i < l; ++i)
		this.bullets[i].update(dt);
};
