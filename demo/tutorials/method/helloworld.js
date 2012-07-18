KISSY.add('helloworld', function(S, Brick) {
	function HelloWorld() {
		HelloWorld.superclass.constructor.apply(this, arguments);
	}
	HelloWorld.METHOD = {
		show:function () {
			this.get('el').fadeIn();
		},
		hide:function () {
			this.get('el').fadeOut();
		}
	};

	S.extend(HelloWorld, Brick, {

	});

	S.augment(HelloWorld,HelloWorld.METHOD);
	return HelloWorld;
}, {
	requires: ["brix/core/brick"]
});