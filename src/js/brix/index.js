KISSY.add("brix/index", function(S, $) {
	var Brix = {};
	function addBehavior() {
		var pagelets = getPagelets();
	}
	
	function getPagelets(){
		var res = $('[bx-pagelet]');
		return res;
	}
	Brix.addBehavior = addBehavior;
	return Brix;
}, {
	requires : ["sizzle"]
});
