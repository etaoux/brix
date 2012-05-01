KISSY.add("brix/bxbase", function(S, Base) {
	function BxBase(config) {
		BxBase.superclass.constructor.call(this, config);
		this.initialize();
	}


	S.extend(BxBase, S.Base, {
		initialize : function() {
			console.log("bxbase initialize~");
			if(this.init){
				this.init();
			}
		}
	});
	return BxBase;
}, {
	requires : ["base"]
});
