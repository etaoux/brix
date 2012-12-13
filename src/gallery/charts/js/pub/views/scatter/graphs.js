KISSY.add('brix/gallery/charts/js/pub/views/scatter/graphs',function(S,Base,node,Global,SVGElement,SVGRenderer,Group,Group2,EventType){
	
	function Graphs(){
		
		var self = this

		Graphs.superclass.constructor.apply(self,arguments);
	}

	Graphs.ATTRS = {
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
		id:{
			value:'graphs'     //id
		},
		data:{
			value:[]             //[{x:0,y:-100},{}]
		},
		element:{
			value:null
		},
		isInduce:{
			value:0              //是否作为感应区
		},
		style:{
			value:1              //样式
		},

		_groupArr:{
			value:[]             //group对象集合
		},

		_groups:{
			value:null
		},
		_line:{
			value:null
		},

		_fills:{
			value:['#458AE6','#45B5E6','#5BCB8A','#94CC5C','#C3CC5C','#E6B552','#E68422']
		},
		_fill_scale:{
			value:[]
		},
		_fills_over:{
			value:['#135EBF','#3997BF','#36B36A','#78A64B','#9CA632','#BF971D','#BF7C39']
		},
		_linearGradient_id:{
			value:'linearGradient'
		}
	}			

	S.extend(Graphs,Base,{
		init:function(){
			var self = this
			Graphs.superclass.constructor.apply(self,arguments);
			
			self.set('element', new SVGElement('g')), self.get('element').set('class',self.get('id'))
			self.get('parent').appendChild(self.get('element').element)

			if(self.get('style') == 1){
				self._linearGradient({'fills':self.get('_fills')})
			}

			self._widget()
			self._layout()
		},
		induce:function($o,$b){
			var self = this
			if(self.get('_line').element.lastChild) {self.get('_line').element.removeChild(self.get('_line').element.lastChild)}
			if($b){
				var o = self.get('_groupArr')[$o.index].getInfo()
				var line = new SVGElement('path')
				var d = SVGRenderer.symbol('line',0,0,0,-o.y).join(' ')
			    line.attr({'stroke':'#555555','stroke-width':1,'d':d})
			    self.get('_line').appendChild(line.element)
			    line.transformXY(o.x,o.y)
			}
		},

		_widget:function(){
			var self = this

			self.set('_line', new SVGElement('g')), self.get('_line').set('class','line')
			self.get('element').appendChild(self.get('_line').element)

			self.set('_groups', new SVGElement('g')), self.get('_groups').set('class','groups')
			self.get('element').appendChild(self.get('_groups').element)
			if(self.get('isInduce') == 1){
				self.get('_groups').set('opacity',0)
			}
		},

		_layout:function(){
			var self = this
			// S.log('---------')
			// S.log(S.now())
			var _groups_df = document.createDocumentFragment();
			for(var a = 0,al = self.get('data').length; a < al; a++){
			// for(var a = 0,al = 1; a < al; a++){
				if(self.get('style') == 1){
					var group = new Group()
				}else if(self.get('style') == 2){
					var group = new Group2()
				}
				
				self.get('_groupArr').push(group)
				var o = {
					index  : a,
					x      : self.get('data')[a].x,
					y      : self.get('data')[a].y,
					w      : self.get('w'),
					h      : self.get('h'),
					parent : _groups_df,
					isInduce : self.get('isInduce'),
					key    : self.get('data')[a].key
				}
				if(self.get('style') == 1){
					o.linearGradient_id = self.get('_linearGradient_id')
					var index = self._getScaleIndex(Math.floor(o.x/o.w * 100))
					o.fill = self.get('_fills')[index]
					o.fill_over = self.get('_fills_over')[index]
				}
				group.init(o)
				group.get('element').on(EventType.OVER,function($o){self._overHandler($o)})
				group.get('element').on(EventType.OUT, function($o){self._outHandler($o)} )
			}
			self.get('_groups').appendChild(_groups_df)
			// S.log(S.now())
		},

		_linearGradient:function($o){
			var self = this
			var $o = $o ? $o : {}
			var id = $o.id ? $o.id : 'linearGradient'
			var fills = $o.fills ? $o.fills : []

			var defs = new SVGElement('defs')
			self.get('element').appendChild(defs.element)

			var linearGradient = new SVGElement('linearGradient')
			linearGradient.attr({'id':id})
			defs.appendChild(linearGradient.element)

			for(var a = 0, al = fills.length; a < al; a++){
				var stop = new SVGElement('stop')
				var scale = Math.floor(1 / (fills.length - 1) * a * 100)
				stop.attr({'stop-color':fills[a],'stop-opacity':1,'offset': scale + '%'})
				linearGradient.appendChild(stop.element)

				self.get('_fill_scale').push(scale)
			}
		},

		_getScaleIndex:function($n){
			var self = this
			return Global.disMinATArr($n,self.get('_fill_scale'))
		},

		_overHandler:function($o){
			var self = this
			self.get('element').fire(EventType.OVER,$o)
		},
		_outHandler:function($o){
			var self = this
			self.get('element').fire(EventType.OUT,$o)
		},

		//全局坐标 转换相对坐标
		_globalToLocal:function($globalObject){
			var self = this
			var o = {}
			o.x = $globalObject.x - self.get('x')
			o.y = $globalObject.y - self.get('y')
			return o
		}
	});

	return Graphs;

	}, {
	    requires:['base','node','../../utils/global','../../utils/svgelement','../../utils/svgrenderer','./group','./group2','../../models/eventtype']
	}
);