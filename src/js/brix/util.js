KISSY.add("brix/util", function(S) {
	var Util = {
		init : function() {
			console = window.console || {};
			console.watching = console.watching || {};
			window.watching = console.watching;
			console.watch = function(key, value) {
				console.watching[key] = value;
			};
			return this;
		}
	}
	return Util.init();
});
