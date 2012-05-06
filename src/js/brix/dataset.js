KISSY.add("brix/dataset", function(S) {
	/*
	 * config:
	 * 		dataKeys required
	 */
	function DataSet(config) {
		this._config = config;
		this._dataKeys = config.dataKeys;
		this._data = {}
	}


	S.extend(DataSet, Object, {
		set : function(arg1, arg2) {
			if(arg2) {
				this.set({
					arg1 : arg2
				});
				return;
			}
			S.each(arg1, function(value, key) {
				this._setDataUnit(key, value);
			}, this);
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
