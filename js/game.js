/// Manages the combatants
JET.Game = function() {
	this.entities = {};
	this.entityCache = [];
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

JET.Game.prototype.update = function(dt) {
	var rebuild = false;
	for (var i = 0, l = this.entityCache.length; i < l; ++i) {
		var obj = this.entityCache[i];
		// AI
		if (obj.ai) JET.updateAI(obj, dt);
		// Movement
		obj.update(dt);

		// Remove if dead
		if (obj.hull <= 0) {
			addMessage('"' + obj.name + '" destroyed!', "warn");
			this.remove(obj, false);
			rebuild = true;
		}
	}
	if (rebuild) this.rebuildCache();
};
