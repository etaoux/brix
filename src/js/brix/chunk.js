KISSY.add("brix/chunk", function(S, Tmpler, DataSet, DataUnit) {
	function Chunk(config) {
		Chunk.superclass.constructor.call(this, config);
		this.config = config || {};
		this.tmpler = null;
		this.dataSet = null;
		this.dataKeys = null;
		this.rendered = false;
		this.bound = false;
	}


	S.extend(Chunk, S.Base, {
		getHTML : function(fn) {
			var that = this;
			this.buildTmpler();
			this.tmpler.getTmpl(function(tmpl) {
				that.getDataKeys(function(dataKeys) {
					that.buildDataSet(function(ds) {
						that.fillDataSet(function() {
							fn(that.buildHTML());
						});
					});
				});
			});
		},
		getDataKeys : function(fn) {
			this.dataKeys = this.config.dataKeys;
			fn(this.dataKeys);
		},
		buildHTML : function() {
			var tmpl = this.tmpler.getTmpl();
			var data = this.dataSet.get();
			var sHTML = Mustache.to_html(tmpl, data);
			return sHTML;
		},
		buildTmpler : function() {
			this.tmpler = new Tmpler(this.config);
		},
		buildDataSet : function(fn) {
			this.dataSet = new DataSet(this.config);
			fn(this.dataSet);
		},
		fillDataSet : function(fn) {
			var that = this;
			var data = this.config.data;
			if(data) {
				S.each(this.dataKeys, function(key, idx) {
					var du = new DataUnit({
						data : data[key]
					});
					that.dataSet.set(key, du);
				});
				fn();
			}

		},
		writeHTML : function(s, cfg) {
			var that = this;
			this.getHTML(function(s) {
				that.rendered = true;
				that.fire("rendered");
				document.write(s);
			});
		}
	});
	return Chunk;
}, {
	requires : ["brix/tmpler", "brix/dataset", "brix/dataunit", "brix/util"]
});
