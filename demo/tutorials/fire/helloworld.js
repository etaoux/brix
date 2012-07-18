KISSY.add('helloworld', function(S, Brick) {
	function HelloWorld() {
		HelloWorld.superclass.constructor.apply(this, arguments);
	}
	HelloWorld.METHOD = {
		show:function () {
			this.get('el').fadeIn();
			this.fire('show',{data:'showdata'});
		},
		hide:function () {
			this.get('el').fadeOut();
			this.fire('hide',{data:'hidedata'});
		}
	};

	S.extend(HelloWorld, Brick, {

	});

	S.augment(HelloWorld,HelloWorld.METHOD);
	return HelloWorld;
}, {
	requires: ["brix/core/brick"]
});