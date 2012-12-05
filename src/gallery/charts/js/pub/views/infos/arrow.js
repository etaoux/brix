KISSY.add('brix/gallery/charts/js/pub/views/infos/arrow',function(S,Base,node,Global,SVGElement,SVGRenderer,SVGGraphics){
	
	function Arrow(){
		
		var self = this

		Arrow.superclass.constructor.apply(self,arguments);
	}

	Arrow.ATTRS = {
		element:{
			value:null
		},
		fill:{
			value:'#FFFFFF'
		},
		fill_opacity:{
			value:0.9
		},

		_arrow:{
			value:null    
		}
	}

	S.extend(Arrow,Base,{

		add:function(){
			var self = this
			Arrow.superclass.constructor.apply(self,arguments);

			self.set('element', new SVGElement('g')), self.get('element').set('class','arrow')
			self.get('parent').appendChild(self.get('element').element)
		},

		update:function(){
			var self = this
			Arrow.superclass.constructor.apply(self,arguments);
			if(self.get('_arrow')){
				self.get('element').removeChild(self.get('_arrow').element)
				self.set('arrow',null)
			}
			self.init()
		},

		init:function(){
			var self = this
			Arrow.superclass.constructor.apply(self,arguments);

			// self.add()
			self._widget()
			self._layout()
		},

		_widget:function(){
			var self = this
			self.set('_arrow', new SVGElement('g')), self.get('_arrow').attr({'filter':'url(#' + self.get('shadow_id') + ')'})
			self.get('element').appendChild(self.get('_arrow').element)
		},
		_layout:function(){
			var self = this
			var arrow = SVGGraphics.lines({'lines':self.get('data'),'fill':self.get('fill'),'stroke':'none','fill_opacity':self.get('fill_opacity')})
		    // arrow.attr({'stroke':self.get('fill'),'stroke-width':self.get('w'),'d':d})
		    self.get('_arrow').appendChild(arrow.element)
		}
	});

	return Arrow;

	}, {
	    requires:['base','node','../../utils/global','../../utils/svgelement','../../utils/svgrenderer','../svggraphics']
	}
);