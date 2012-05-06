KISSY.add("brix/chunk", function(S) {
	function Chunk(config) {
		this.config = config || {};
		this.tmpler = null;
		this.dataKeys = null;
		this.dataSet = null;
	}


	S.extend(Chunk, Object, {
		getHTML : function(fn) {
			var s = buildHTML();
			fn(s);
		},
		buildHTML : function() {
			return Mustache.to_html(this.tmpler.get(), this.dataset.get());
		},
		buildTmpler : function() {

		},
		buildDataSet : function() {

		},
		fillDataSet : function() {

		},
		writeHTML : function(s, cfg) {
			document.write(s);
		}
	});
	S.augment(DataUnit, S.EventTarget);
	return Chunk;
}, {
	requires : ["brix/util"]
});
