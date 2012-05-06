KISSY.add("brix/page", function(S, Pagelet) {
	var $ = S.all;
	var Page = {
		addBehavior : function() {
			S.each(Pagelet.INSTS, function(pagelet, id) {
				if(pagelet.rendered) {
					pagelet.addBehavior();
				}
				//else{
				//todo render & enhance
				//}
			});
		}
	};
	return Page;
}, {
	requires : ["brix/pagelet","sizzle"]
});
