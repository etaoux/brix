KISSY.add("brix/tab", function(S, BxBase) {
	function Tab(config) {
		Tab.superclass.constructor.call(this, config);
	}


	S.extend(Tab, BxBase, {
		init : function() {
			console.log("tab init~");
		}
	});
	return Tab;
}, {
	requires : ["brix/bxbase"]
});
/*
 data>>
 
 tabList : 
 	[
 		{
 			id : String,
 			text : String,
 			__cur : Boolean
 		}
 	]
 
 subtmpl>>
 
 [
 	'tabList'
 ]	
 
 attr>>
 
 
 
 method>>
 
 	setCurrent
 
 event>>
 
 	change
 */