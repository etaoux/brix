KISSY.add("brix/com", function(S) {
	var COM = {
		_idMap : {},
		init : function() {
			return this;
		},
		push : function(brick) {
			this._idMap[brick.id] = brick;
		},
		pop : function(brick) {
			delete this._idMap[brick.id];
		},
		getElementById : function(id) {
			return this._idMap[id] || null;
		}
	};
	return COM.init();
});
