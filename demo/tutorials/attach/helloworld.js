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
				top.console.log('节点被点击');
			}
		},
		"#spanName":{
			"click":function(e){
				e.halt();//阻止冒泡
				this.set('name','I\'m Click')
				S.one(e.currentTarget).html(this.get('name'));
			}
		}
	};

	HelloWorld.DOCATTACH = {
		"":{
			"click":function(){
				top.console.log('document被点击');
			}
		}
	};

	S.extend(HelloWorld, Brick, {

	});

	return HelloWorld;
}, {
	requires: ["brix/core/brick"]
});