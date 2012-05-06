KISSY.add("brix/tab", function(S, Brick) {
	function Tab(config) {
		Tab.superclass.constructor.call(this, config);
	}

	S.extend(Tab, Brick, {
		init : function(config) {
			console.log("tab init~");
		}
	});
	return Tab;
}, {
	requires : ["brix/brick"]
});
/*
 data>>>
 
	 tabList : 
	 	[
	 		{
	 			id : String,
	 			text : String,
	 			__cur : Boolean
	 		}
	 	]
 
 attr>>>
 
 	theme
 
 method>>>
 
 	setCurrent
 
 event>>>
 
 	change
 	
 subtmpl>>>
 
 [
 	'tabList'
 ]
 	
 */