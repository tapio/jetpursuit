/// Manages the combatants
JET.Game = function() {
	this.playerFaction = 0;
	this.entities = {};
	this.entityCache = [];
	this.bullets = [];
	this.emitters = [];
};

JET.Game.prototype.rebuildCache = function() {
	this.entityCache = [];
	for (var i in this.entities) {
		var obj = this.entities[i];
		if (obj) this.entityCache.push(obj);
	}
};

JET.Game.prototype.findById = function(id) {
	return this.entities[id];
};

JET.Game.prototype.add = function(obj) {
	if (!obj.id) throw "Id required for objects added to game!";
	this.entities[obj.id] = obj;
	scene.add(obj);
	this.rebuildCache();
	return obj;
};

JET.Game.prototype.remove = function(obj, rebuild) {
	if (!obj) return;
	this.entities[obj.id] = undefined;
	scene.remove(obj);
	if (rebuild !== false) this.rebuildCache();
};

JET.Game.prototype.removeById = function(id) {
	this.remove(this.entities[id]);
};

JET.Game.prototype.addBullet = function(obj) {
	scene.add(obj);
	this.bullets.push(obj);
	return obj;
};

JET.Game.prototype.addEmitter = function(obj) {
	scene.add(obj.particleSystem);
	this.emitters.push(obj);
	return obj;
};

JET.Game.prototype.update = function(dt) {
	if (this.ended) return;
	var i, l, rebuild = false;
	var factionAlive = [ false, false ];
	for (i = 0, l = this.entityCache.length; i < l; ++i) {
		var obj = this.entityCache[i];
		// AI
		if (obj.ai) JET.updateAI(obj, dt);
		// Movement
		obj.update(dt);

		// Handle deaths
		if (obj.hull <= 0) {
			addMessage('"' + obj.name + '" destroyed!', "warn");
			JET.SoundLibrary.explosion.play();
			this.addEmitter(JET.createExplosion(obj.position));
			obj.trail.lifeTime = 0;
			this.remove(obj, false);
			rebuild = true;
		} else factionAlive[obj.faction] = true;
	}
	if (rebuild) this.rebuildCache();

	// Check for game end
	var factionsAlive = 0;
	for (i = 0; i < factionAlive.length; ++i)
		if (factionAlive[i]) ++factionsAlive;
	if (factionsAlive <= 1) {
		// TODO
		addMessage("Game ended");
		this.ended = true;
	}

	// Bullets
	for (i = this.bullets.length-1; i >= 0; --i) {
		var bullet = this.bullets[i];
		if (!bullet.update(dt)) {
			// Remove the bullet if it's dead
			scene.remove(bullet);
			this.bullets.splice(i, 1);
		}
	}

	// Emitters
	for (i = this.emitters.length-1; i >= 0; --i) {
		var emitter = this.emitters[i];
		if (!emitter.update(dt)) {
			scene.remove(emitter.particleSystem);
			this.emitters.splice(i, 1);
		}
	}
};
