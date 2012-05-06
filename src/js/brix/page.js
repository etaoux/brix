KISSY.add("brix/page", function(S, Sizzle, Pagelet) {
	var $ = S.all;
	var Page = {
		addBehavior : function() {
			S.each(Pagelet.INSTS, function(pagelet, id) {
				if(pagelet.rendered) {
					pagelet.addBehavior();
					//addBehavior2Pagelet(pagelet);
				}
				//else{
				//todo render & enhance
				//}
			});
		}
	};

	var COM = {
		_idMap : {},
		init : function() {
			console.watch("COM", COM);
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

	Page.COM = COM.init();

	return Page;
}, {
	requires : ["sizzle", "brix/pagelet"]
});
