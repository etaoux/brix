KISSY.add('brix/gallery/charts/js/e/histogram3/view/widget',function(S,Base,Node,Global,SVGElement,Infos,EventType,Core){
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
				key:{                    //突出显示
					indexs:'',               //String 索引字符串[1,2,3]
					data:[]                  //Array  索引集合[[1,2,3]]
				},
				vertical:{               //纵轴
					name:'',                 //名称[维度1]
					org:[],                  //原始二维数据[[配置数据中每个队列第一个集合],[],[]]
					max:[],                  //从org中提取的 直方叠加之后的数组 方便操作[[100+10,200+20,300+30],[]]
					sections:[],             //分段之后二维数据[[0]中存放左侧数据、[1]中存放右侧数据]
					data:[]                  //转换坐标后的数据  =>Vertical.data、Back.data
				},
				horizontal:{             //横轴
					name:'',                 //名称[维度2]
					names:[],                //名称集合(1:00,2:00,...,24:00)
					start:{                  //原点
						name:'0'                 //名称[原点]
					},
					org:'',                  //原始数据[0.05,0.1,0.15,0.2,...,2.55]
					data:[]                  //转换坐标后的数据  =>Horizontal.data
				},
				graphs:{                 //图形
					groupCount:1,            //每组中几条数据
					groupW:59,               //一组的宽
					groups:1,                //有几个组
					data:[]                  //转换坐标后的数据(不删减 临时处理成Graphs.data)  =>Graphs.data  
				}
			}
		},

		_top_h:{
			value:0
		},
		_core_y:{
			value:0
		},
		_core_h:{
			value:0
		},

		_core:{
			value:null                   //直方图3核心
		},
		_infos:{                         //信息
			value:null
		},


		_del:{
			value:0                      //当数据量过大时 减去的数据个数
		},
		_timeoutId:{
			value:0                      
		},
		_timeoutDelay:{
			value:1                    
		},
		_isRemoveInfo:{
			value:1
		}
	}

	S.extend(Widget,Base,{
		init:function(){
			var self = this

			self._widget()
		},

		_widget:function(){
			var self = this

		 	self.set('_top_h', 0)
		 	self.set('_core_y', self.get('_top_h'))
		 	self.set('_core_h', self.get('h') - self.get('_top_h') - 0 - 0)

			self.set('element', new SVGElement('g')), self.get('element').set('class','widget')
			self.get('parent').appendChild(self.get('element').element)

			self.set('_core',new Core({parent:self.get('element')}))
			var o = {
				w      : self.get('w'),
				h      : self.get('_core_h'),
				parent : self.get('element'),
				DataSource : self.get('DataSource'),            //图表数据源
				config     : self.get('config').bar             //图表配置
			}
			self.get('_core').get('element').on(EventType.COMPLETE,function(){self._completeHandler()})
			self.get('_core').get('element').on(EventType.OVER,function($o){self._overHandler($o)})
			self.get('_core').get('element').on(EventType.OUT,function($o){self._outHandler($o)})
			self.get('_core').get('element').on(EventType.MOVE,function($o){self._moveHandler($o)})
			self.get('_core').widget(o)
			self.get('_core').get('element').transformY(self.get('_core_y'))

			self.set('_infos',new Infos())
			self.get('_infos').init({parent:self.get('element')})
			self.get('_infos').get('element').on(EventType.OVER,function($o){self._overInfoHandler($o)})
			self.get('_infos').get('element').on(EventType.OUT,function($o){self._outInfoHandler($o)})
		},

		_completeHandler:function(){
			var self = this
			self.set('_DataFrameFormat', self.get('_core').getAttr('DataFrameFormat'))
			self.set('_del', self.get('_core').getAttr('del'))
		},
		_overHandler:function($o){
		},
		_outHandler:function($o){
			// return
			var self = this
			this.set('_timeoutId', setTimeout(function(){self._outTimeout()}, self.get('_timeoutDelay')))
		},
		_outTimeout:function(){
			if(this.get('_isRemoveInfo')){
				this.get('_infos').remove()
			}
		},
		_moveHandler:function($o){
			clearTimeout(this.get('_timeoutId'));
			var index = $o.index
			var id = $o.id
			var x = $o.x
			var y = $o.y
			var tmpID = $o.singleID
			var fills = this.get('config').bar.fills
			var fill = fills[index][tmpID].over
			var data = []
			data[0] = []
			var o = { }

			// return
			o.content = this.get('_DataFrameFormat').vertical.org[index].data[tmpID].signName, o.bold = 1, o.fill = fill, o.size = 14, o.family = '微软雅黑', o.ver_align = 1
			data[0].push(o)
			o = { }
			o.content = this.get('_DataFrameFormat').vertical.name + this.get('_DataFrameFormat').vertical.org[index].data[tmpID].scale + '%', o.bold = 0, o.fill = fill, o.family = '微软雅黑', o.ver_align = 1
			data[1] = []
			data[1].push(o)

			var o = {
				w    : this.get('w'),
				h    : this.get('h'),
				parent : this.get('element'),

				info:{
					x    : x,
					y    : y,
					data : data,
					base_fill:fill
				},
				hLine:{
					is   : 0
				}
			}

			o.hInfo = {
				is   : 0
			}
			this.get('_infos').update(o)
		},
		_overInfoHandler:function($o){
			var self = this
			self.set('_isRemoveInfo', 0)
		},
		_outInfoHandler:function($o){
			var self = this
			self.set('_isRemoveInfo', 1)
			self._outHandler()
		}
	});

	return Widget;

	}, {
	    requires:['base','node','../../../pub/utils/global','../../../pub/utils/svgelement','../../../pub/views/infos/infos','../../../pub/models/eventtype','../../../pub/views/histogram3/core'
	    ]
	}
);