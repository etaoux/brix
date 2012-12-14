KISSY.add('brix/gallery/charts/js/pub/views/integrate/graphs',function(S,Base,node,Global,SVGElement,SVGRenderer,EventType,histogramGraphs,lineGraphs){
	
	function Graphs(){
		
		var self = this

		Graphs.superclass.constructor.apply(self,arguments);

		self.init()
	}

	Graphs.ATTRS = {
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
			value:[]             //直方数据[[{height:100},{}],[]]          //Q3 无key
		},
		element:{
			value:null
		},
		isInduce:{
			value:null
		},
		hasRight:{
			value:1              //是否有右侧
		},
		groupW:{
			value:59             //直方一组的宽
		},
		groupCount:{
			value:1              //直方每组中几条数据
		},		
		data_right:{
			value:[]             //折线数据[ [ { x:0, y:0 } ], [] ]
		},
		radius:{
			value:3              //感应区区域至四个周边的距离
		},
		disX:{
			value:0              //每两个点之间的距离
		},

		_index:{
			value:-1              //索引
		},
		_id:{
			value:0              //对应索引上最近的哪个点(从0开始)
		},

		_histogram:{
			value:null
		},
		_line:{
			value:null
		},
		_induce:{ 
			value:null
		}
	}			

	S.extend(Graphs,Base,{
		init:function(){
			var self = this

			self.set('_histogram',new histogramGraphs())
			self.set('_line',new lineGraphs())
			self.set('_induce', new SVGElement('g')), self.get('_induce').set('class','induce')

		},
		induce:function($o,$b){
			var self = this
			self.get('_histogram').induce($o,$b)
		},

		widget:function(){
			var self = this
			Graphs.superclass.constructor.apply(self,arguments);
			self.set('element', new SVGElement('g')), self.get('element').set('class',self.get('id'))
			self.get('parent').appendChild(self.get('element').element)

			var o = {
				h      : self.get('h'),
				parent : self.get('element'),
				data   : self.get('data'),
				groupCount : self.get('groupCount'),
				groupW : self.get('groupW'),
 			}
 			self.get('_histogram').init(o)

 			self._layout()
		},

		widget_right:function(){
			var self = this
			Graphs.superclass.constructor.apply(self,arguments);

			var config = self.get('config').right
			var o = {
				w      : self.get('w'),
				h      : self.get('h'),
				parent : self.get('element'),
				data   : self.get('data_right'),
				node   : config.node,
				area   : config.area,
				shape  : config.shape,
				fills  : config.fills.normals,
				fills_over : config.fills.overs
			}
			self.get('_line').init(o)

			self._layout()
		},

		//获取直方每一组中最小极限的宽
		getGroupMinW:function(){
			var self = this
			return self.get('_histogram').getGroupMinW()
		},

		//获取每根直方信息集合 并根据每组 返回一个二维数组
		getInfos:function(){
			var self = this
			return self.get('_histogram').getInfos()
		},

		_layout:function(){
			var self = this
			if(self.get('isInduce') == 1){
				if(self.get('_histogram').get('element')){
					self.get('_histogram').get('element').set('visibility','hidden')
				}
				if(self.get('_line') && self.get('_line').get('element')){
					self.get('_line').get('element').set('visibility','hidden')
				}
			}
			if(self.get('hasRight') == 0 || (self.get('hasRight') == 1 && self.get('_line') && self.get('_line').get('element'))){
				self.get('element').appendChild(self.get('_induce').element)

				var induce = new SVGElement('path')
				var w = self.get('w'), h = self.get('h')
				var d = SVGRenderer.symbol('square',0,0,w,h).join(' ')
				induce.attr({'_w':w,'_h':h,'d':d,'opacity':Global.N00001})
				self.get('_induce').appendChild(induce.element)

				self.get('_induce').transformY(-self.get('h'))

				self.get('_induce').element.addEventListener("mousemove",function(evt){ self._moveHandler(evt)}, false);
				self.get('_induce').element.addEventListener("mouseout",function(evt){ self._outHandler(evt)}, false);
			}
		},

	 	_moveHandler:function($evt){
	 		var self = this
			var o = self._globalToLocal({'x':$evt.layerX,'y':$evt.layerY})
			var x = o.x, y = o.y

			var tmp_id = parseInt(x / (self.get('disX')))
			if(tmp_id >= self.get('data').length){
				return
			}
			var o1 = {}, o2 = {}
			if(self.get('hasRight')){
				o1 = self.get('_line').getNodeInfoAt(0, tmp_id)
			}
			o2 = self.get('_histogram').getNodeInfoAt(tmp_id, 0)

			var arr = []
			var tmp_index = 1
			if(self.get('hasRight')){
				arr = [o1.y, -o2.h]
				tmp_index = Global.disMinATArr(y,arr)
			}
			var o = {
				layout_order : 2,
				histogram : o2,
				line      : o1
			}

			//靠近线
			if(tmp_index == 0){
				o.layout_order = 1
			}
			if(tmp_index == self.get('_index') && tmp_id == self.get('_id')){

			}else{
				self.set('_index', tmp_index)
				self.get('element').fire(EventType.OVER,o)
			}
			self.set('_id', tmp_id)
		},
		_outHandler:function($evt){
			var self = this
			var o = {}
			o.index = self.get('_id'), o.id = 0

			self.get('element').fire(EventType.OUT,o)
			self.set('_index', -1)
			self.set('_id', 0)
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
	    requires:['base','node','../../utils/global','../../utils/svgelement','../../utils/svgrenderer','../../models/eventtype','../histogram/graphs','../line/graphs']
	}
);