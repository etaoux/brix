KISSY.add('brix/gallery/charts/js/e/map/view/graphs',function(S,Base,node,Global,Move,SVGElement,SVGRenderer,SVGGraphics,EventType){
	
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
			value:[]             //[o,o,..o]
								 /*
								 	index:0,
									fills:{
										normal:'#000000',
										over  :'#000000'
									},
									content:[]
								  */
		},
		element:{
			value:null
		},
		isInduce:{
			value:0              //是否作为感应区
		},
		map_w:{
			value:100
		},
		map_h:{
			value:100
		},
		maps:{
			value:[]             //地图数据集合
		},
		map_scale:{
			value:1
		},

		_path_map:{
			value:''             //地图路径[charts/src/js/src/e/map/view/maps/***/main]
		},
		_index:{
			value:0              //当鼠标划入时 所突出显示的索引 从0开始
		},
		_dis:{
			value:4              //四周的距离
		},
		_maps:{
			value:null           //maps
		},
		_main:{
			value:null           //main
		}
	}			

	S.extend(Graphs,Base,{
		init:function(){
			var self = this
			
			self.set('element', new SVGElement('g')), self.get('element').set('class',self.get('id'))
			self.get('parent').appendChild(self.get('element').element)

			self.set('_path_map', self._getMap())
		},

		widget:function(){
			var self = this

			Graphs.superclass.constructor.apply(self,arguments);
			
			self._widget()
		},

		induce:function($o,$b){
			var self = this
			self._induce($o.index,$b)
		},

		_widget:function(){
			var self = this
			self.set('_maps', new SVGElement('g')), self.get('_maps').set('class','maps')
			self.get('element').appendChild(self.get('_maps').element)
			if(self.get('isInduce') == 1){
				self.get('_maps').set('opacity',0)
			}

			self.set('_test', new SVGElement('g')), self.get('_test').set('class','test')
			self.get('element').appendChild(self.get('_test').element)
			// self.set('_induces', new SVGElement('g')), self.get('_induces').set('id','J_induces')
			// self.get('element').appendChild(self.get('_induces').element)
			
			//展现
			S.use(self.get('_path_map'),function(S,Main){
				var o = {}
				o.parent = self.get('_maps')
				
				self.set('_main',new Main(o))
				self.get('_main').get('element').on(EventType.COMPLETE,function($o){self._completeHandler($o)})
				self.get('_main').widget()
			})
		},

		_layout:function(){
			var self = this
			self.set('map_w', self.get('_main').get('map_w'))
			self.set('map_h', self.get('_main').get('map_h'))
			self.set('maps', self.get('_main').get('maps'))

			var o = Global.fit( { w:self.get('w'), h:self.get('h') }, { w:self.get('map_w'), h:self.get('map_h') } )
			self.set('map_scale',o.scale)

			var matrix = 'matrix('+ (self.get('map_scale')) +',0,0,' + (self.get('map_scale')) + ',' + (0) + ',' + (0) + ')'
			self.get('_maps').set('transform',matrix)

			self.set('map_w', self.get('element').getWidth())
			self.set('map_h', self.get('element').getHeight())

			var maps = self.get('maps')
			for(var a = 0, al = maps.length; a < al; a++){
				var map = maps[a]
				var o = self.get('data')[a]
				if(map && o){
					var element = map.element
					if(o.fills.normal){
						element.set('fill',o.fills.normal)
						element.element.addEventListener("mouseover",function(evt){ self._overHandler(evt)}, false);
						element.element.addEventListener("mouseout",function(evt){ self._outHandler(evt)}, false);
					}
				}
			}

			self.get('element').fire(EventType.COMPLETE)
		},

		_completeHandler:function(){
			var self = this
			self._layout()
		},
		_overHandler:function($evt){
			var self = this
			var index = $evt.target.getAttribute('_index')
			var o = {}
			var map = self.get('maps')[index]
			var data = self.get('data')[index]
			var cx = self.get('map_scale') * map.cx
			var cy = self.get('map_scale') * map.cy
			// var cx = self.get('map_w') / self.get('_main').get('map_w') * o.cx
			// var cy = self.get('map_h') / self.get('_main').get('map_h') * o.cy

			// var circle = SVGGraphics.circle({'r':2.5,'fill':'#000000','stroke':'#ff0000','stroke_width':1,'fill_opacity':0.5})
			// self.get('_test').element.appendChild(circle.element)
			// circle.transformXY(cx,cy)
			self._induce(index,true)

			o.index = index
			o.cx = cx, o.cy = cy
			o.content = data.content

			self.get('element').fire(EventType.OVER,o)
		},
		_outHandler:function($evt){
			var self = this
			var index = $evt.target.getAttribute('_index')
			var o = {}
			self._induce(index,false)

			o.index = index
			self.get('element').fire(EventType.OUT,o)
		},
		_induce:function($index,$b){
			var self = this
			var o = self.get('data')[$index]
			var map = self.get('maps')[$index]
			var element = map.element
			if(o){
				if($b){
					element.set('fill',o.fills.over)
				}else{
					element.set('fill',o.fills.normal)
				}
			}
		},

		_getMap:function(){
			var self = this
			return self._getPath('zh')
		},

		//获取地图js路径
		_getPath:function($name){
			var self = this
			return 'brix/gallery/charts/js/e/map/view/maps/' + $name + '/' + 'main'
		}
	});

	return Graphs;

	}, {
	    requires:['base','node','../../../pub/utils/global','../../../pub/utils/move','../../../pub/utils/svgelement','../../../pub/utils/svgrenderer','../../../pub/views/svggraphics','../model/eventtype']
	}
);