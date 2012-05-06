KISSY.add("brix/tmpler", function(S) {
	/*
	 * config:
	 * 		dataKeys required
	 */
	function Tmpler(config) {
		this.config = config;
		this.tmpl = null;
		this.subtmpl = null;

	}


	S.extend(Tmpler, Object, {
		getTmpl:function(fn){
			if(this.tmpl){
				return this.tmpl;
			}
			if(this.config.tmplId){
				this.tmpl = S.one("#"+this.config.tmplId).text();
				fn(this.tmpl);
			}
		}
	});
	S.augment(Tmpler, S.EventTarget);
	return Tmpler;
}, {
	requires : ["brix/util"]
});
