KISSY.add("brix/pagelet", function(S, Chunk) {
	function Pagelet(config) {
		Pagelet.superclass.constructor.call(this, config);
		this.id = config.id;
		this.enhanced = false;
		this.brickNodes = [];
		Pagelet.INSTS[this.id] = this;
	}


	Pagelet.INSTS = {};
	S.extend(Pagelet, Chunk, {
		addBehavior : function() {
			this.brickNodes = this.getBrickNodes();
			console.watch("brickss", console.watching.brickss ? console.watching.brickss.push(this.brickNodes) : (console.watching.brickss = [this.brickNodes]));
			S.each(this.brickNodes, function(node) {
				this.createBrick(node);
			},this);
		},
		createBrick:function(node){
			var type = S.one(node).attr("bx-brick");
			var that = this;
			S.use("brix/" + type, function(S, TheBrick) {
				var myBrick = new TheBrick({
					pageletId : that.id,
					id : node.id
				});
				console.watch("brick_" + type, myBrick);
			});
		},
		getBrickNodes : function() {
			var node = S.one("#"+this.id);
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
	});
	console.watch("Pagelet", Pagelet);
	return Pagelet;
}, {
	requires : ["brix/chunk"]
});
