KISSY.add('brix/gallery/charts/js/pub/views/line/graphs',function(S,Base,node,Global,SVGElement,SVGRenderer,Group,EventType){
	
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
			value:'graphs'       //id
		},
		data:{
			value:[]             //[[{x:0,y:-100,no_node:1[1=不显示节点]},{}],[]]
		},
		element:{
			value:null
		},
		isInduce:{
			value:0              //是否作为感应区
		},
		disX:{
			value:[]             //每两个点之间的距离
		},
		isEventListener:{
			value:1              //是否有事件监听
		},
		node:{
			value:0              //是否有节点
		},
		area:{
			value:0              //是否有区域
		},
		areaMode:{
			value:0              //区域闭合模式(0 = 自动闭合 | 1 = 不自动闭合 根据前一条线闭合)
		},
		area_opacity:{
			value:[0.05, 0.25]   //区域填充部分的透明度
		},
		shape:{
			value:1              //线条形状
		},
		thickness:{              //线条粗线
			value:{
				normal  : 2,     //正常情况
				over    : 3      //鼠标划入时
			}
		},
		fills:{
			value:[]             //图形颜色集合
		},
		fills_over:{
			value:[]             //鼠标划入时对应的颜色集合
		},
		circle:{                 //圆
			value:{}
		},
		isLine:{
			value:0              //当鼠标划入时 是否有线
		},

		_groupArr:{
			value:[]             //group对象集合
		},
		_index:{
			value:0              //哪条线 从0开始
		},
		_id:{ 
			value:-1             //线中的哪个点 从0开始
		},
		_nodesInfoList:{
			value:[]             
		},
		_nodesYList:{ 
			value:[]            
		},

		_groups:{ 
			value:null
		},
		_areas:{
			value:null           
		},
		_induce:{ 
			value:null          
		},
		_line:{
			value:null
		}
	}			

	S.extend(Graphs,Base,{
		init:function(){
			var self = this
			Graphs.superclass.constructor.apply(self,arguments);
			
			self.set('element', new SVGElement('g')), self.get('element').set('class',self.get('id'))
			self.get('parent').appendChild(self.get('element').element)

			self._widget()
			self._layout()
		},
		induce:function($o,$b){
			var self = this
			self.get('_groupArr')[self.get('_index')].induce(false)
			self.set('_index', $o.index), self.set('_id', $o.id)
			self.get('_groupArr')[$o.index].induce($b)
			
			if(self.get('isLine')){
				if(self.get('_line').element.lastChild) {self.get('_line').element.removeChild(self.get('_line').element.lastChild)}
				if($b){
					var o = self.get('_groupArr')[$o.index].getNodeInfoAt(self.get('_id'))
					var line = new SVGElement('path')
					var d = SVGRenderer.symbol('line',0,0,0,-o.y + 6).join(' ')
				    line.attr({'stroke':'#555555','stroke-width':1,'d':d})
				    self.get('_line').appendChild(line.element)
				    line.transformXY(o.x,o.y)
				}
			}
		},
		getNodeInfoAt:function($index,$id){
			var self = this
			return self.get('_groupArr')[$index].getNodeInfoAt($id)
		},

		_widget:function(){
			var self = this
			self.set('_areas', new SVGElement('g')), self.get('_areas').set('class','areas')
			self.get('element').appendChild(self.get('_areas').element)
			if(self.get('isInduce')){
				self.get('_areas').set('visibility','hidden')
			}

			self.set('_groups', new SVGElement('g')), self.get('_groups').set('class','groups')
			self.get('element').appendChild(self.get('_groups').element)
			if(self.get('isInduce')){
				self.get('_groups').set('visibility','hidden')
			}

			self.set('_line', new SVGElement('g')), self.get('_line').set('class','line')
			self.get('element').appendChild(self.get('_line').element)
			if(self.get('isInduce')){
				self.get('_line').set('visibility','hidden')
			}

			self.set('_induce', new SVGElement('path')),self.get('_induce').set('class','induce')
			var d = SVGRenderer.symbol('square',0,0,self.get('w'),self.get('h')).join(' ')
			self.get('_induce').attr({'_w':self.get('w'),'_h':self.get('h'),'d':d,'opacity':Global.N00001})
			self.get('element').appendChild(self.get('_induce').element)
		},

		_layout:function(){
			var self = this
			self.get('_induce').transformY(-self.get('h'))
			for(var a = 0,al = self.get('data').length; a < al; a++){
				var group = new Group()
				self.get('_groupArr').push(group)
				var o = {
					index  : a,
					parent : self.get('_groups'),
					data   : self.get('data')[a],
					node   : self.get('node'),
					shape  : self.get('shape'),
					fill   : self.get('fills')[a],
					fill_over : self.get('fills_over')[a],
					thickness : self.get('thickness')
				}
				if(self.get('circle').radius){
					!o.circle ? o.circle = {} : ''
		    		o.circle.radius = self.get('circle').radius
		    	}
		    	if(self.get('circle').thickness){
		    		!o.circle ? o.circle = {} : ''
		    		o.circle.thickness = self.get('circle').thickness
		    	}
		    	if(self.get('circle').fill){
		    		!o.circle ? o.circle = {} : ''
		    		o.circle.fill = self.get('circle').fill
		    	}
		    	if(self.get('circle').fill_follow){
		    		!o.circle ? o.circle = {} : ''
		    		o.circle.fill_follow = self.get('circle').fill_follow
		    	}
				group.init(o)
			}
			if(self.get('area')){
				for(var a = 0,al = self.get('data').length; a < al; a++){
					var _area = new Group()
					var o = {
						index  : a,
						parent : self.get('_areas'),
						data   : self.get('data')[a],
						line   : 0,
						area   : self.get('area'),
						area_opacity: self.get('area_opacity'),
						shape  : self.get('shape'),
						fill   : self.get('fills')[a],
						fill_over : self.get('fills_over')[a]
					}

					if (self.get('areaMode') == 1) {
						if (self.get('data')[a] && self.get('data')[a + 1]) {
							o.data = o.data.concat(S.clone(self.get('data')[a + 1]).reverse())
							o.areaMode = self.get('areaMode')
						}
					}
					_area.init(o)
				}
			}

			if(self.get('isEventListener')){
				// this._induce.element.addEventListener("mousedown",function(evt){ self._moveHandler(evt)}, false);
				self.get('_induce').element.addEventListener("mousemove",function(evt){ self._moveHandler(evt)}, false);
				self.get('_induce').element.addEventListener("mouseout",function(evt){ self._outHandler(evt)}, false);
				self.get('_induce').element.addEventListener("click",function(evt){ self._clickHandler(evt)}, false);
			}
		},

		_moveHandler:function($evt){
			var self = this
			// var o = self._globalToLocal({'x':$evt.layerX,'y':$evt.layerY})
			var o = Global.getLocalXY($evt, self.get('parent').element)
			var x = o.x - Number(self.get('element').get('_x')), y = o.y - Number(self.get('element').get('_y'))
			var n = x / (self.get('disX') / 2)
			n = n % 2 == 0 ? n : n + 1
			var tmp_id = parseInt(n / 2)
			// self.induce({index:self._index},false)
			if(tmp_id >= self.get('data')[0].length){
				return
			}
			if(tmp_id != self.get('_id')){
				self.set('_nodesInfoList', [])
				self.set('_nodesYList', [])
				for (var a = 0, al = self.get('_groupArr').length; a < al; a++ ) {
					var o = self.get('_groupArr')[a].getNodeInfoAt(tmp_id)
					self.get('_nodesInfoList').push(o)
					self.get('_nodesYList').push(o.y)
				}
			}
			var tmp_index = Global.disMinATArr(y,self.get('_nodesYList'))
			if(tmp_index == self.get('_index') && tmp_id == self.get('_id')){

			}else{
				self.set('_index', tmp_index)
				self.set('_id', tmp_id)
				var o = S.clone(self.get('_nodesInfoList')[self.get('_index')])
				var arr = S.clone(self.get('_nodesInfoList'))
				arr.splice(self.get('_index'), 1)
				o.other = arr
				o.x = o.x + Number(self.get('element').get('_x')), o.y = o.y + Number(self.get('element').get('_y'))
				self.get('element').fire(EventType.OVER,o)
			}
			self.set('_id', tmp_id)
			// self.induce({index:self._index},true)
		},
		_outHandler:function($evt){
			var self = this
			var o = {}
			o.index = self.get('_index'), o.id = self.get('_id')
			self.get('element').fire(EventType.OUT,o)
			self.set('_index', 0)
			self.set('_id', -1)
		},
		_clickHandler:function($evt){
			var self = this
			var o = {}
			o.line_index = Number(self.get('_index')) + 1, o.node_index = Number(self.get('_id')) + 1
			self.get('element').fire(EventType.CLICK,o)
		},

		//全局坐标 转换相对坐标
		_globalToLocal:function($globalObject){
			var self = this
			var o = {}
			var gx = self.get('gx') ? self.get('gx') : 0
			var gy = self.get('gy') ? self.get('gy') : 0
			o.x = $globalObject.x - self.get('x') - gx
			o.y = $globalObject.y - self.get('y') - gy
			return o
		}
	});

	return Graphs;

	}, {
	    requires:['base','node','../../utils/global','../../utils/svgelement','../../utils/svgrenderer','./group','../../models/eventtype']
	}
);