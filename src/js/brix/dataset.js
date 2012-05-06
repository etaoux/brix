KISSY.add("brix/dataset", function(S) {
	/*
	 * config:
	 * 		dataKeys required
	 */
	function DataSet(config) {
		this._config = config;
		this._dataKeys = config.dataKeys;
		this._data = {};
	}


	S.extend(DataSet, Object, {
		set : function(arg1, arg2) {
			if(arg2) {
				var o = {};
				o[arg1] = arg2;
				this.set(o);
				return;
			}
			S.each(arg1, function(value, key) {
				this._setDataUnit(key, value);
			}, this);
		},
		get : function() {
			var o ={};
			S.each(this._data,function(value,key){
				o[key] = value.get();
			});
			return o;
		},
		_setDataUnit : function(key, value) {
			if(S.inArray(key, this._dataKeys)) {
				this._data[key] = value;
			}
		}
	});
	S.augment(DataSet, S.EventTarget);
	return DataSet;
}, {
	requires : ["brix/util"]
});
