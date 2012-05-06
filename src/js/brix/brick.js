KISSY.add("brix/brick", function(S, Chunk) {
	function Brick(config) {
		Brick.superclass.constructor.call(this, config);
		//this.id = config.id;
		//this.enhanced = false;
		//this.bricks = [];
	}


	Brick.INSTS = {};
	S.extend(Brick, Chunk, {
		addBehavior2Brick : function(brick, pagelet) {
			var type = S.one(brick).attr("bx-brick");
			S.use("brix/" + type, function(S, Brick) {
				var myBrick = new Brick({
					pageletId : pagelet.id,
					id : brick.id
				});
				console.watch("brick_" + type, myBrick);
			});
		}
	});
	console.watch("Brick", Brick);
	return Brick;
}, {
	requires : ["brix/chunk"]
});
