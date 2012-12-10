KISSY.add('brix/gallery/charts/js/e/scatter/view/group',function(S,Base,node,Global,SVGElement,SVGRenderer,SVGGraphics,EventType){
	
	function Group(){
		
		var self = this

		Group.superclass.constructor.apply(self,arguments);
	}

	Group.ATTRS = {
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
		isInduce:{
			value:0              //是否作为感应区
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
		linearGradient_id:{
			value:''
		},
		clipPath_id:{
			value:'clipPath'
		},

		_radius:{
			value:10
		},
	}	

	S.extend(Group,Base,{
		init:function(){
			var self = this
			Group.superclass.constructor.apply(self,arguments);
			
			self.set('element', new SVGElement('g')), self.get('element').set('class',self.get('index'))
			self.get('parent').appendChild(self.get('element').element)

			if(self.get('isInduce') == 0){
				self.set('clipPath_id',self.get('clipPath_id') + String(self.get('index')))
				self._clipPath({'id':self.get('clipPath_id'),'r':self.get('_radius'),'x':self.get('x'),'y':self.get('y')})
			}
				
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

			var g = new SVGElement('g')
			self.get('element').appendChild(g.element)
			
			if(self.get('isInduce') == 0){
				var rect = new SVGElement('rect')
				g.appendChild(rect.element)
				var clip_path = 'url(#' + self.get('clipPath_id') + ')'
				var fill      = 'url(#' + self.get('linearGradient_id') + ')'
				rect.attr({'clip-path':clip_path, 'fill':fill, 'width':self.get('w'), 'height':self.get('h'), 'y':-self.get('h'), 'fill-opacity':0.8})

				if(self.get('key').isKey){
					var circle = SVGGraphics.circle({'r':self.get('_radius'),'fill':'none','stroke':'#FFFFFF','stroke_width':2.5})
					self.get('element').element.appendChild(circle.element)
					var x = self.get('x'), y = self.get('y')
					circle.transformXY(x,y)

					var circle = SVGGraphics.circle({'r':self.get('_radius') + 2,'fill':'none','stroke':self.get('fill'),'stroke_width':2.5})
					self.get('element').element.appendChild(circle.element)
					var x = self.get('x'), y = self.get('y')
					circle.transformXY(x,y)
				}else{
					var circle = SVGGraphics.circle({'r':self.get('_radius'),'fill':'none','stroke':self.get('fill'),'stroke_width':2})
					self.get('element').element.appendChild(circle.element)
					var x = self.get('x'), y = self.get('y')
					circle.transformXY(x,y)
				}
			}else{
				var circle = SVGGraphics.circle({'r':self.get('_radius'),'fill':fill,'stroke':fill,'stroke_width':2,'fill_opacity':0.8})
				circle.element.addEventListener("mouseover",function(evt){ self._overHandler(evt)}, false);
				circle.element.addEventListener("mouseout",function(evt){ self._outHandler(evt)}, false);
				self.get('element').element.appendChild(circle.element)
				var x = self.get('x'), y = self.get('y')
				circle.transformXY(x,y)	
			}
		},

		_clipPath:function($o){
			var self = this
			var $o = $o ? $o : {}
			var id = $o.id ? $o.id : 'clipPath'
			var r = $o.r ? $o.r : 10
			var x = $o.x ? $o.x : 0
			var y = $o.y ? $o.y : 0

			var defs = new SVGElement('defs')
			self.get('element').appendChild(defs.element)

			var clipPath = new SVGElement('clipPath')
			clipPath.attr({'id':id})
			defs.appendChild(clipPath.element)

			var circle = SVGGraphics.circle({'r':r, 'fill':'#000000','stroke':'none'})
			clipPath.appendChild(circle.element)
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
			return o
		}
	});

	return Group;

	}, {
	    requires:['base','node','../../../pub/utils/global','../../../pub/utils/svgelement','../../../pub/utils/svgrenderer','../../../pub/views/svggraphics','../model/eventtype']
	}
);