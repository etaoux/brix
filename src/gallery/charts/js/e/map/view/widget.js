KISSY.add('brix/gallery/charts/js/e/map/view/widget',function(S,Base,Node,Global,Move,DataSection,SVGElement,GlobalInduce,Infos,EventType,Graphs){
	var $ = Node.all

	function Widget(){
		
		var self = this

		/*
			arguments:

			  o:{
				parent    :''     //SVGElement
				w         :100    //chart 宽
				h         :100    //chart 高
				DataSource:{}     //数据源
				config    :{}     //配置
			  }

		 */
		Widget.superclass.constructor.apply(self,arguments);

		self.init()
	}

	Widget.ATTRS = {
		w:{
			value:0
		},
		h:{
			value:0
		},
		element:{
			value:null
		},

		_DataFrameFormat : {
			value:{
				key:{                    //突出显示[预留]
					indexs:'',               //String 索引字符串[1,2,3]
					data:[]                  //Array  索引集合[[1,2,3]]
				},
				values:{               
					org:[],                  //原始二维数据['<set index="34"><name name="安徽"/>...</set>','...','...']
					data:[],                 //Object 原始二维数据[见datatrim->data]
					order:[]                 //Array  需要list时 排序之后的数据 根据data中的value
				}
			}
		},

		_dis:{
			value:4                   
		},
		_angle_left:{
			value:235
		},
		_angle_right:{
			value:309
		},
		_radius:{
			value:155
		},
		_graphs:{
			value:null                   //图形
		},
		_infos:{
			value:null                   //信息
		},
		_globalInduce:{
			value:null                   //全局感应区
		},
		_induces:{
			value:null                   //感应区
		},

		_timeoutId:{
			value:0                      
		},
		_timeoutDelay:{
			value:300                    
		},
	}

	S.extend(Widget,Base,{
		init:function(){
			var self = this
			
			self.set('_DataFrameFormat',self.DataExtend(self.get('_DataFrameFormat'), self.get('DataSource')))

			self._widget()
		},

		getData:function(){
			var self = this
			return S.clone(self.get('_DataFrameFormat').values)
		},

		getMap:function(){
			var self = this
			return self.get('_graphs')
		},

		_widget:function(){
			var self = this
			self.set('element', new SVGElement('g')), self.get('element').set('class','widget')
			self.get('parent').appendChild(self.get('element').element)

			self.set('_graphs',new Graphs({parent:self.get('element')}))
			self.set('_infos',new Infos())
			self.set('_globalInduce', new GlobalInduce())

			if(self.get('config').sign.is || self.get('config').list.is){
				self._trim()
			}
			var n = parseInt(Math.min(self.get('w'), self.get('h'))) - self.get('_dis')
			var o = {
				parent: self.get('element'),
				data  : self.get('_DataFrameFormat').values.data,
				w     : self.get('w') - 2 * self.get('_dis'),
				h     : self.get('h') - 2 * self.get('_dis'),
				config: self.get('config')
			}

			self.get('_graphs').widget(o)

			self.get('_infos').init({parent:self.get('element')})
			
			var o = {
				w     : self.get('w'),
				h     : self.get('h'),
				parent: self.get('element'),
				opacity : Global.N00001
				// opacity : 0.1
			}
			self.get('_globalInduce').init(o)

			self.set('_induces',new Graphs({parent:self.get('element'),id: 'induces'}))
			var o = {
				parent: self.get('element'),
				id    : 'induces',
				data  : self.get('_DataFrameFormat').values.data,
				isInduce   : 1,
				w     : self.get('w') - 2 * self.get('_dis'),
				h     : self.get('h') - 2 * self.get('_dis'),
				config: self.get('config')
			}
			self.get('_induces').get('element').on(EventType.COMPLETE,function($o){self._completeHandler($o)})
			self.get('_induces').get('element').on(EventType.OVER,function($o){self._overHandler($o)})
			self.get('_induces').get('element').on(EventType.OUT,function($o){self._outHandler($o)})
			self.get('_induces').widget(o)
		},

		_trim:function(){
			var self = this
			var data = S.clone(self.get('_DataFrameFormat').values.data)
			var tmp = []
			for(var a in data){
				var o = data[a]
				tmp.push(o)
			}
			var tmp = tmp.sort(function(a,b){return b.value-a.value;}); 
			self.get('_DataFrameFormat').values.order = tmp
			var values = []
			var scalesData = []    //有比例的数据集合
			var total = 0
			for(var a = 0, al = tmp.length; a < al; a++){
				var o = tmp[a]
				if(o && o.value){
					scalesData.push(o) 
					values.push(o.value)
					total+= o.value
				}
			}
			var scales = Global.getArrScales(values)
			for(var b = 0, bl = scalesData.length; b < bl; b++){
				var o = scalesData[b]
				o.order = b + 1
				o.scale = scales[b] + '%'
				o.sign.font.content = String(o.order)
			}

			for(var c = 0, cl = tmp.length; c < cl; c++){
				var o = tmp[c]
				if(o){
					data[o.name] = o
				}
			}
			self.get('_DataFrameFormat').values.data = data
		},

		_getRPoint:function(x0, y0, xr, yr, r) {
			var r = r * Math.PI / 180
			return {'x':Math.cos(r) * xr + x0, 'y':Math.sin(r) * yr + y0}
		},

		_completeHandler:function(){
			var self = this
			var x = (self.get('w') - self.get('_graphs').get('map_w')) / 2
			var y = (self.get('h') - self.get('_graphs').get('map_h')) / 2
			self.get('_graphs').get('element').transformXY(x,y)
			self.get('_induces').get('element').transformXY(x,y)
			self.set('_radius',self.get('_graphs').get('map_scale') * self.get('_radius')) 
			self.get('element').fire(EventType.COMPLETE) 
		},
		_overHandler:function($o){
			clearTimeout(this.get('_timeoutId'));
			var self = this
			var index = $o.index
			var x = Number($o.cx) + Number(this.get('_graphs').get('element').get('_x'))
			var y = Number($o.cy) + Number(this.get('_graphs').get('element').get('_y'))
	
			var angle = self.get('w') / 2 < x ? self.get('_angle_left') : self.get('_angle_right')
		
			var p = self._getRPoint(x, y, self.get('_radius'), self.get('_radius'), angle)
			var data = $o.content
			var base_fill = self.get('config').info.frame_fill
			var o = {
				w    : this.get('w'),
				h    : this.get('h'),
				parent : this.get('element'),

				info:{
					x    : p.x,
					y    : p.y,
					data : data,
					base_fill : base_fill
				},
				hLine:{
					is   : 0
				},
				hInfo:{
					is   : 0
				},
				arrow:{
					is   : 1,
					x    : x,
					y    : y
				}
			}
			// this.get('_infos').update(o)
			this.get('_infos').move(o)

			this.get('_graphs').induce({index:$o.index,id:$o.id},true)
			this.get('element').fire(EventType.OVER,$o) 
		},
		_outHandler:function($o){
			var self = this
			this.set('_timeoutId', setTimeout(function(){self._outTimeout()}, self.get('_timeoutDelay')))
			this.get('_graphs').induce({index:$o.index,id:$o.id},false)
			this.get('element').fire(EventType.OUT,$o)
		},
		_outTimeout:function(){
			this.get('_infos').remove()
		},
		/**
		 * 数据继承
		 * @type {Object}
		 */
		DataExtend:function(DataFrameFormat,DataSource){
			// DataFrameFormat.key.indexs = DataSource.key.indexs
			DataFrameFormat.values.org = DataSource.values.data
			DataFrameFormat.values.data = DataSource.data
			
			return DataFrameFormat
		}
	});

	return Widget;

	}, {
	    requires:['base','node','../../../pub/utils/global','../../../pub/utils/move','../../../pub/utils/datasection','../../../pub/utils/svgelement',
	    		  '../../../pub/views/globalinduce','../../../pub/views/infos/infos','../../../pub/models/eventtype','../../../pub/views/map/graphs'

	    ]
	}
);