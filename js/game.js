
function Game() {
	this.entities = {};
	this.entityCache = [];
}

Game.prototype.rebuildCache = function() {
	this.entityCache = [];
	for (var i in this.entities) {
		var obj = this.entities[i];
		if (obj) this.entityCache.push(obj);
	}
};

Game.prototype.findById = function(id) {
	return this.entities[id];
};

Game.prototype.add = function(obj) {
	if (!obj.id) throw "Id required for objects added to game!";
	this.entities[obj.id] = obj;
	scene.add(obj);
	this.rebuildCache();
	return obj;
};

Game.prototype.remove = function(obj, rebuild) {
	if (!obj) return;
	this.entities[obj.id] = undefined;
	scene.remove(obj);
	if (rebuild !== false) this.rebuildCache();
};

Game.prototype.removeById = function(id) {
	this.remove(this.entities[id]);
};

Game.prototype.update = function(dt) {
	var rebuild = false;
	for (var i = 0, l = this.entityCache.length; i < l; ++i) {
		var obj = this.entityCache[i];
		// AI
		if (obj.ai) updateAI(obj, dt);
		// Movement
		obj.update(dt);

		// Remove if dead
		if (obj.hull <= 0) {
			this.remove(obj, false);
			rebuild = true;
		}
	}
	if (rebuild) this.rebuildCache();
};
