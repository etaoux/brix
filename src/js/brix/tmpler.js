KISSY.add("brix/dataset", function(S) {
	/*
	 * config:
	 * 		dataKeys required
	 */
	function Tmpler(config) {
		this.tmpl = null;
		this.subtmpl = null;

	}


	S.extend(Tmpler, Object, {
		
	});
	S.augment(Tmpler, S.EventTarget);
	return Tmpler;
}, {
	requires : ["brix/util"]
});
