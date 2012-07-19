KISSY.add('helloworld', function(S, Brick) {
	function HelloWorld() {
		HelloWorld.superclass.constructor.apply(this, arguments);
	}
	HelloWorld.ATTRS = {
		name:{
			value:'World'
		}
	};

	HelloWorld.ATTACH = {
		"":{
			"click":function(){
				top.console.log('节点click');
			}
		},
		"#spanName":{
			"click":function(e){
				this.set('name','I\'m Click')
				S.one(e.currentTarget).html(this.get('name'));
			}
		}
	};

	HelloWorld.DOCATTACH = {
		"":{
			"click":function(){
				top.console.log('document:click');
			}
		}
	};

	S.extend(HelloWorld, Brick, {

	});

	return HelloWorld;
}, {
	requires: ["brix/core/brick"]
});