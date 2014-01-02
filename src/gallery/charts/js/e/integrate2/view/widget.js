KISSY.add('brix/gallery/charts/js/e/integrate2/view/widget',function(S,Base,Node,Global,SVGElement,Infos,EventType,Core,Layout){
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
					section:[],              //分段之后数据[200, 400, 600, 800, 1000, 1200, 1400, 1600]
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
			value:null                   //直方图核心
		},
		_layout:{                        //布局_样式1
			value:null                   
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
			value:100                    
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

		 	self.set('_top_h', 70)
		 	self.set('_core_y', self.get('_top_h'))
		 	self.set('_core_h', self.get('h') - self.get('_top_h') - 12 - 6)

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
			self.get('_core').widget(o)
			self.get('_core').get('element').transformY(self.get('_core_y'))

			self.set('_layout',new Layout())
			var o = {
				w      : self.get('w'),
				h      : self.get('h'),  
				data   : self._getPieInfos(),
				parent : self.get('element'),
				config     : self.get('config').layout,         //图表配置
				txtStartIndex : 1
			}
			self.get('_layout').init(o)
			self.get('_layout').get('y_txt').transformXY(6, self.get('_core_y') - 12 - 12)
			self.get('_layout').get('x_txt').transformXY(Number(self.get('w')) - Number(self.get('_layout').get('x_txt').getWidth()) - 6, Number(self.get('h')) - Number(self.get('_layout').get('x_txt').getHeight()) - 6)
			self.get('_layout').get('infos').transformXY(Number(self.get('w')) - Number(self.get('_layout').get('infos').getDynamic('w'))- 3 - 6 - 18, 6)

			self.set('_infos',new Infos())
			self.get('_infos').init({parent:self.get('element')})
			self.get('_infos').get('element').on(EventType.OVER,function($o){self._overInfoHandler($o)})
			self.get('_infos').get('element').on(EventType.OUT,function($o){self._outInfoHandler($o)})
		},

		_getPieInfos:function(){
			var self = this
			var data = self.get('_DataFrameFormat')
			var config = self.get('config').bar
			var arr = []

			var $arr = data.vertical.org
			for (var a = 0, al = $arr.length; a < al; a++ ) {
				var o = $arr[a]
				var tmp = { }
				tmp.pie = { data:[], fills:[] }
				tmp.info = []
				var infoObj = { content:o.name, bold:1, fill:'#333333', family:'微软雅黑', ver_align:1, size:12 }
				var infoIndex = 0
				tmp.info[infoIndex] = []
				tmp.info[infoIndex].push(infoObj)
				
				var totals = []
				for (var b = 0, bl = o.data.length; b < bl; b++ ) {
					tmp.pie.data.push(o.data[b].total)
					tmp.pie.fills.push(config.fills[a][b].normal)

					infoIndex++
					infoObj = { content:o.data[b].signName, bold:0, fill:config.fills[a][b].over, family:'微软雅黑', size:12, sign: { has:1, trim:1, fill:config.fills[a][b].normal }}
					!tmp.info[infoIndex] ? tmp.info[infoIndex] = [] : ''
					tmp.info[infoIndex].push(infoObj)
					
					totals.push(o.data[b].total)
				}
				
				var scales = Global.getArrScales(totals)
				infoIndex = 0
				for (var c = 0, cl = o.data.length; c < cl; c++ ) {
					infoIndex++
					tmp.info[infoIndex][0].content = tmp.info[infoIndex][0].content + scales[c] + '%'
				}
				
				arr.push(tmp)
			}
			
			return arr
		},

		_completeHandler:function(){
			var self = this
			self.set('_DataFrameFormat', self.get('_core').getAttr('DataFrameFormat'))
			self.set('_del', self.get('_core').getAttr('del'))
		},
		_overHandler:function($o){
			// return
			clearTimeout(this.get('_timeoutId'));
			var index = $o.index
			var id = $o.id
			if (index + 1 >= this.get('_DataFrameFormat').vertical.org[id].length - this.get('_del') && index + 1 < this.get('_DataFrameFormat').vertical.org[id].length) {
				index = index + this.get('_del')
			}
			var x = Number($o.cx) + Number(this.get('_core').get('element').get('_x'))
			var y = Number(this.get('_core_y')) + $o.cy
			// var y = 100
			var data = []
			data[0] = []
			var o = { }
			o.content = this.get('_DataFrameFormat').vertical.org[id].name, o.bold = 1, o.fill = '#333333', o.size = 14, o.family = '微软雅黑', o.ver_align = 1
			data[0].push(o)
			o = { }
			o.content = this.get('_DataFrameFormat').vertical.name + Global.numAddSymbol(this.get('_DataFrameFormat').vertical.max[id][index]), o.bold = 0, o.fill = '#666666', o.family = '微软雅黑', o.ver_align = 1
			data[1] = []
			data[1].push(o)
			var dataID = 2
			for (var a = 0, al = this.get('_DataFrameFormat').vertical.org[id].data.length; a < al; a++ ) {
				o = { }
				var fills = this.get('config').bar.fills
				var fill_normal = fills[id][a] && fills[id][a].normal ? fills[id][a].normal : '#000000'
				var fill_over = fills[id][a] && fills[id][a].over ? fills[id][a].over : '#000000'
 				o.content = this.get('_DataFrameFormat').vertical.org[id].data[a].name + Global.numAddSymbol(this.get('_DataFrameFormat').vertical.org[id].data[a].data[index]), o.bold = 0, o.fill = fill_over, o.family = '微软雅黑', o.hor_align = 2, o.sign = {has:1,trim:1,fill:fill_normal }
				data[dataID] = []
				data[dataID].push(o)
				dataID++
			}

			var o = {
				w    : this.get('w'),
				h    : this.get('h'),
				parent : this.get('element'),

				info:{
					x    : x,
					y    : y,
					data : data,
					base_fill:'#666666'
				},
				hLine:{
					is   : 1,
					x    : x,
					y    : y + $o.h
				}
			}
			var pre = this.get('_DataFrameFormat').horizontal.names[index - 1] ? this.get('_DataFrameFormat').horizontal.names[index - 1] : ''
			pre = index == 0 ? this.get('_DataFrameFormat').horizontal.start.name : pre
			var next =  this.get('_DataFrameFormat').horizontal.names[index]
			var content = this.get('_DataFrameFormat').horizontal.name + pre + ' - ' + next
			if (this.get('config').infos.xAxis.mode == 1) {
				content = this.get('_DataFrameFormat').horizontal.name + next
			}

			o.hInfo = {
				is   : 1,
				x    : x,
				y    : y + $o.h,
				content : content
			}
			this.get('_infos').update(o)
		},
		_outHandler:function($o){
			var self = this
			this.set('_timeoutId', setTimeout(function(){self._outTimeout()}, self.get('_timeoutDelay')))
		},
		_outTimeout:function(){
			if(this.get('_isRemoveInfo')){
				this.get('_infos').remove()
			}
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
	    requires:['base','node','../../../pub/utils/global','../../../pub/utils/svgelement','../../../pub/views/infos/infos','../../../pub/models/eventtype','../../../pub/views/histogram/core','../../../pub/views/layouts/style1/main'
	    ]
	}
);