KISSY.add('brix/gallery/charts/js/pub/views/modules/sign/main',function(S,Base,Node,Global,SVGElement,SVGGraphics){
	var $ = Node.all

	function Main(){
		
		var self = this

		Main.superclass.constructor.apply(self,arguments);

		// self.init()
	}

	Main.ATTRS = {
		w:{
			value:0
		},
		h:{
			value:0
		},
		element:{
			value:null
		},

		_circle:{
			value:null
		},
		_font:{
			value:null
		}
	}

	S.extend(Main,Base,{
		init:function(){
			var self = this
			Main.superclass.constructor.apply(self,arguments);

			self.set('element', new SVGElement('g')), self.get('element').set('class','layouts_sign')
			// self.get('element').set('style','cursor:default'), self.get('element').mouseEvent(false)
			self.get('parent').appendChild(self.get('element').element)

			self._widget()
		},

		_widget:function(){
			var self = this
			var w = 0, h = 0
			var element = self.get('element')
			var config = self.get('config')

			if(config.circle.is){
				var circle = config.circle
				self.set('_circle', SVGGraphics.circle({'r':circle.radius,'fill':circle.fill}))
				var _circle = self.get('_circle')
				element.appendChild(_circle.element)

				w = circle.radius * 2, h = circle.radius * 2
			}
			
			if(config.font.is){
				var font = config.font
				self.set('_font', SVGGraphics.text({'content':font.content,'size':font.size,'fill':font.fill,'bold':font.bold,'family':font.family}))
				var _font = self.get('_font')
				element.appendChild(_font.element)

				var y = _font.getHeight() / 2 * 0.50
				var x = -_font.getWidth() / 2
				_font.transformXY(x,y)

				if(_font.getWidth() > w){
					w = _font.getWidth()
				}
				if(_font.getHeight() > h){
					h = _font.getHeight()
				}
			}


			self.set('w', w)
			self.set('h', h)
		},

		setStyle:function($o){
			var self = this
			if($o.circle){
				self.get('_circle').set('fill',$o.circle.fill)
			}
		}
	});

	return Main;

	}, {
	    requires:['base','node','../../../utils/global','../../../utils/svgelement','../../../views/svggraphics'
	    ]
	}
);