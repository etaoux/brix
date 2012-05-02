KISSY.add("brix/index", function(S) {
	console = window.console || {};
	console.watch = function(key, value) {
		console.watching = console.watching || {};
		console.watching[key] = value;
	};
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
		var type = S.one(b).attr("bx-brick");
		S.use("brix/" + type, function(S, Brick) {
			var myBrick = new Brick({
				pagelet : pagelet,
				brick : brick
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


	Brix.addBehavior = addBehavior;
	return Brix;
}, {
	requires : ["sizzle"]
});
