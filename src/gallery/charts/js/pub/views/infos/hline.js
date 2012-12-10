KISSY.add('brix/gallery/charts/js/pub/views/infos/hline',function(S,Base,node,Global,SVGElement,SVGRenderer,SVGGraphics){
	
	function HLine(){
		
		var self = this

		HLine.superclass.constructor.apply(self,arguments);
	}

	HLine.ATTRS = {
		w:{
			value:1
		},
		h:{
			value:6
		},
		y1:{
			value:0
		},
		element:{
			value:null
		},
		fill:{
			value:'#555555'
		},

		_line:{
			value:null    
		}
	}

	S.extend(HLine,Base,{
		init:function(){
			var self = this
			HLine.superclass.constructor.apply(self,arguments);

			self.set('element', new SVGElement('g')), self.get('element').set('class','hline')
			self.get('parent').appendChild(self.get('element').element)

			self._widget()
			self._layout()
		},

		_widget:function(){
			var self = this
			self.set('_line', new SVGElement('g')), self.get('_line').set('class','line')
			self.get('element').appendChild(self.get('_line').element)
		},
		_layout:function(){
			var self = this
			var line = new SVGElement('path')
			var d = SVGRenderer.symbol('line',0,self.get('y1'),0,self.get('h')).join(' ')
		    line.attr({'stroke':self.get('fill'),'stroke-width':self.get('w'),'d':d})
		    self.get('_line').appendChild(line.element)
		}
	});

	return HLine;

	}, {
	    requires:['base','node','../../utils/global','../../utils/svgelement','../../utils/svgrenderer','../svggraphics']
	}
);