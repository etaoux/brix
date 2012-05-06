KISSY.add("brix/dataunit", function(S) {
	/*
	 * config:
	 * 		data
	 */
	function DataUnit(config) {
		config = config || {};
		this._config = config;
		this._data = null;
		if(config.data) {
			this.set(config.data);
		}
	}


	S.extend(DataUnit, Object, {
		set : function(arg1, arg2) {
			if(!arg2) {
				this._create(arg1);
			} else {
				this._update(arg1, arg2);
			}
		},
		get : function(arg1) {
			return this._data;
		},
		_create : function(data) {
			this._data = data;
		},
		_update : function(where, data) {
			//todo
		}
	});
	S.augment(DataUnit, S.EventTarget);
	return DataUnit;
}, {
	requires : ["brix/util"]
});
