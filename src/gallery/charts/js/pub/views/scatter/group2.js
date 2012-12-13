KISSY.add('brix/gallery/charts/js/pub/views/scatter/group2',function(S,Base,node,Global,SVGElement,SVGRenderer,SVGGraphics,EventType){
	
	function Group2(){
		
		var self = this

		Group2.superclass.constructor.apply(self,arguments);
	}

	Group2.ATTRS = {
		index:{
			value:0              //索引
		},
		element:{
			value:null
		},
		x:{
			value:0
		},
		y:{
			value:0              
		},
		w:{
			value:100              
		},
		h:{
			value:100             
		},
		key:{
			value:{
					'iskey':0
				  }
		},

		fill:{
			value:'#458AE6'
		},
		fill_over:{
			value:'#135EBF'
		},
		keyFill:{
			value:'#E68422'
		},
		keyFill_over:{
			value:'#BF7C39'
		},

		_radius:{
			value:10
		}
	}	

	S.extend(Group2,Base,{
		init:function(){
			var self = this
			Group2.superclass.constructor.apply(self,arguments);
			
			self.set('element', new SVGElement('g'))//, self.get('element').set('id',self.get('index'))
			self.get('parent').appendChild(self.get('element').element)

			self._widget()
		},
		getInfo:function(){
			var self = this
			var o = self._getInfo()
			return o
		},

		_widget:function(){
			var self = this
			var fill = self.get('fill')
			if(self.get('key').isKey){
				fill = self.get('keyFill')
			}

			var circle = SVGGraphics.circle({'r':self.get('_radius'),'fill':fill,'stroke':fill,'stroke_width':2,'fill_opacity':0.8})
			circle.element.addEventListener("mouseover",function(evt){ self._overHandler(evt)}, false);
			circle.element.addEventListener("mouseout",function(evt){ self._outHandler(evt)}, false);
			self.get('element').element.appendChild(circle.element)
			var x = self.get('x'), y = self.get('y')
			circle.transformXY(x,y)
		},

		_overHandler:function($evt){
			var self = this
			var o = self._getInfo()
			self.get('element').fire(EventType.OVER,o)
		},
		_outHandler:function($evt){
			var self = this
			var o = self._getInfo()
			self.get('element').fire(EventType.OUT,o)
		},
		_getInfo:function(){
			var self = this
			var o = {}
			o.index = self.get('index')
			o.x = self.get('x'), o.y = self.get('y')
			o.fill = self.get('fill'), o.fill_over = self.get('fill_over')
			if(self.get('key').isKey){
				o.fill =  self.get('keyFill'), o.fill_over = self.get('keyFill_over')
			}
			return o
		}
	});

	return Group2;

	}, {
	    requires:['base','node','../../utils/global','../../utils/svgelement','../../utils/svgrenderer','../../views/svggraphics','../../models/eventtype']
	}
);