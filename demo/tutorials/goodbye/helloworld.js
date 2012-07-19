KISSY.add('helloworld', function(S, Brick) {
	function HelloWorld() {
		HelloWorld.superclass.constructor.apply(this, arguments);
	}
	HelloWorld.ATTRS = {
        name: {
            value: 'World'
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
    HelloWorld.RENDERER = {
        xx: {
            yy: function(context) {
                return "xx_" + context.get('name') + "_yy"
            }
        }
    };
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