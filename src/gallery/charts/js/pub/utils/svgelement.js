KISSY.add('brix/gallery/charts/js/pub/utils/svgelement',function(S,Base){                               //R3
	
	function SVGElement(){
		
		var self = this

		SVGElement.superclass.constructor.apply(self,arguments);

		self.element = null

		self.init.apply(self,arguments);
	}

	S.extend(SVGElement,Base,{
		init:function(){
			// console.log(arguments)
			this.createElement(arguments[0])
		},

		attr:function($attrs){
			for(var i in $attrs){
				this.set(i,$attrs[i])
			}
		},

		set:function($name,$value){
			this.element.setAttribute($name,$value);
		},

		get:function($attr){
			return this.element.getAttribute($attr);
		},

		//添加事件
		on: function ($eventType, $handler) {
			var fn = $handler;
			this.element['on' + $eventType] = fn;
			return this;
		},
		//触发事件
		fire:function($eventType,$o){
			if(this.element['on' + $eventType]){
				this.element['on' + $eventType]($o)
			}
		},

		createElement:function($att){
			this.element = document.createElementNS('http://www.w3.org/2000/svg',$att);
		},

		addChild:function($class){
			this.element.appendChild($class.get('element').element)
		},
		delChild:function($class){
			this.element.removeChild($class.get('element').element)
		},

		appendChild:function($node){
			this.element.appendChild($node)
		},
		removeChild:function($node){
			this.element.removeChild($node);
		},

		getWidth:function(){
			return this.element.getBBox().width
			// return this.element.clientWidth
		},
		getHeight:function(){
			return this.element.getBBox().height
			// return this.element.clientHeight
		},

		transformX:function($x){
			var y = this.get('_y') ? this.get('_y') : 0
			var s = 'matrix(1,0,0,1,' + $x + ',' + y + ')';
			this.set('_x',$x)
			this.set('transform',s)
		},
		transformY:function($y){
			var x = this.get('_x') ? this.get('_x') : 0
			var s = 'matrix(1,0,0,1,' + x + ',' + $y + ')';
			this.set('_y',$y)
			this.set('transform',s)
		},
		transformXY:function($x,$y){
			var s = 'matrix(1,0,0,1,' + $x + ',' + $y + ')';
			this.set('_x',$x)
			this.set('_y',$y)
			this.set('transform',s)
		}

	});

	return SVGElement;

	}, {
	    requires:['base','node']
	}
);