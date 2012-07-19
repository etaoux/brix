KISSY.add('helloworld', function(S, Brick) {
	function HelloWorld() {
		HelloWorld.superclass.constructor.apply(this, arguments);
	}
	HelloWorld.ATTRS = {

	};
	S.extend(HelloWorld, Brick, {

	});

	return HelloWorld;
}, {
	requires: ["brix/core/brick"]
});