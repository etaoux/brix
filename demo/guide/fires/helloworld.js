KISSY.add('helloworld', function(S, Brick) {
	function HelloWorld() {
		HelloWorld.superclass.constructor.apply(this, arguments);
	}

	HelloWorld.FIRES = {
		show:'show',
		hide:'hide'
	}
	HelloWorld.METHODS = {
		show:function () {
			this.get('el').fadeIn();
			this.fire(HelloWorld.FIRES.show,{data:'showdata'});
		},
		hide:function () {
			this.get('el').fadeOut();
			this.fire(HelloWorld.FIRES.hide,{data:'hidedata'});
		}
	};

	S.extend(HelloWorld, Brick, {

	});

	S.augment(HelloWorld,HelloWorld.METHODS);
	return HelloWorld;
}, {
	requires: ["brix/core/brick"]
});