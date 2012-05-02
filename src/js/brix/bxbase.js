KISSY.add("brix/bxbase", function(S, Base, COM) {
	function BxBase(config) {
		BxBase.superclass.constructor.call(this, config);
		this.initialize(config);
	}

	S.extend(BxBase, S.Base, {
		initialize : function(config) {
			console.log("bxbase initialize~");
			if(this.init) {
				this.init(config);
			}
		},
		register2COM:function(){
			
		}
	});
	return BxBase;
}, {
	requires : ["base", "brix/com"]
});
