KISSY.add('brix/gallery/charts/js/pub/views/infos/hinfo',function(S,Base,node,Global,SVGElement,SVGGraphics){
	
	function HInfo(){
		
		var self = this

		HInfo.superclass.constructor.apply(self,arguments);
	}

	HInfo.ATTRS = {
		w:{
			value:80
		},
		h:{
			value:25
		},
		element:{
			value:null
		},
		content:{
			value:''
		},
		font_fill:{
			value:'#ffffff'
		},
		font_bold:{
			value:1
		},
		bg_fill:{
			value:'#6D6D6D'
		},
		dis:{
			value:8
		},

		_g:{
			value:null    
		},
		_font:{
			value:null
		},
		_back:{
			value:null
		}
	}

	S.extend(HInfo,Base,{
		init:function(){
			var self = this
			HInfo.superclass.constructor.apply(self,arguments);
			
			self.set('element', new SVGElement('g')), self.get('element').set('class','hinfo')
			self.get('parent').appendChild(self.get('element').element)

			self._widget()
			self._layout()
		},
		
		_widget:function(){
			var self = this
			self.set('_g', new SVGElement('g')), self.get('_g').set('class','g')
			self.get('element').appendChild(self.get('_g').element)

			self.set('_back', new SVGElement('rect')), self.get('_back').attr({'class':'back'})
			self.get('_g').appendChild(self.get('_back').element)

			self.set('_font', new SVGElement('g')),self.get('_font').set('class','font')
			self.get('_g').appendChild(self.get('_font').element)
		},
		_layout:function(){
			var self = this
			var font = SVGGraphics.text({'content':Global.numAddSymbol(self.get('content')),'fill':self.get('font_fill'),'bold':self.get('font_bold')})
			self.get('_font').element.appendChild(font.element)
			var x,y
			var w,h

			w = font.getWidth() + 2 * self.get('dis')
			h = font.getHeight() + self.get('dis')

			x = Global.ceil((w - font.getWidth())/ 2),y = Global.ceil(font.getHeight() * 0.8 + self.get('dis')/2 )
			font.transformXY(x,y)

			self.get('_back').attr({'_w':w,'_h':h,'width':w,'height':h,'fill':self.get('bg_fill'),'rx':4,'rx':4})

			x = -Global.ceil(w/2),y = -Global.ceil(h/2)
			self.get('_g').transformXY(x,y)

			self.set('w', w), self.set('h', h)
		}
	});

	return HInfo;

	}, {
	    requires:['base','node','../../utils/global','../../utils/svgelement','../svggraphics']
	}
);