KISSY.add("brix/index", function(S) {
	var $ = S.all;
	var Brix = {};
	function addBehavior() {
		var pagelets = getPagelets();
		console.watch("pagelets", pagelets);
		S.each(pagelets, function(pagelet, idx) {
			addBehavior2Pagelet(pagelet);
		});
	}

	function addBehavior2Pagelet(pagelet) {
		var bricks = getBricks(pagelet);
		console.watch("brickss", console.watching.brickss ? console.watching.brickss.push(bricks) : (console.watching.brickss = [bricks]));
		S.each(bricks, function(brick) {
			addBehavior2Brick(brick, pagelet);
		});
	}

	function addBehavior2Brick(brick, pagelet) {
		var type = S.one(brick).attr("bx-brick");
		S.use("brix/" + type, function(S, Brick) {
			var myBrick = new Brick({
				pageletId : pagelet.id,
				id : brick.id
			});
			console.watch("brick_" + type, myBrick);
		});
	}

	function getBricks(pagelet) {
		var node = S.one(pagelet);
		var res = node.all('[bx-brick]');
		res = res.getDOMNodes();
		if(node.hasAttr("bx-brick")) {
			res.unshift(node.getDOMNode());
		}
		res = S.filter(res, function(brick) {
			return !S.one(brick).hasAttr("bx-parent");
		});
		return res;
	}

	function getPagelets() {
		var res = $('[bx-pagelet]');
		if(res.length === 0) {
			res = $("body");
		}
		return res.getDOMNodes();
	}

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

	Brix.COM = COM.init();
	Brix.addBehavior = addBehavior;
	return Brix;
}, {
	requires : ["sizzle"]
});
