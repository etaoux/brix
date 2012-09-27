	KISSY.add("components/test/index", function(S, Brick) {
		function Test(){
			Test.superclass.constructor.apply(this, arguments);
		}
		Test.EVENTS = {
			'.btn':{
				click : function(e){
					e.halt();
					var lavalamp = this.pagelet.getBrick('firstlavalamp');
					if(lavalamp){
						lavalamp.destroy();
					}
				}
			}
		}
		S.extend(Test, Brick, {

		});

		return Test;
	}
	, {
    requires: ["brix/core/brick"]
});