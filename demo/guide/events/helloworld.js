KISSY.add('helloworld', function(S, Brick) {
	function HelloWorld() {
		HelloWorld.superclass.constructor.apply(this, arguments);
	}
	HelloWorld.ATTRS = {
		name:{
			value:'World'
		}
	};

	HelloWorld.EVENTS = {
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

	HelloWorld.DOCEVENTS = {
		"":{
			"click":function(){
				top.console.log('document:click');
			}
		}
	};

	S.extend(HelloWorld, Brick, {
		events:{
			click:{
				helloworld:function(){
					top.console.log('bx:click');
				}
			}
		}
	});

	return HelloWorld;
}, {
	requires: ["brix/core/brick"]
});