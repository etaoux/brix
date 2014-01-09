KISSY.add('brix/gallery/charts/js/e/histogram4/view/widget',function(S,Base,Node,Global,DataSection,SVGElement,Vertical,Horizontal,Back,GlobalInduce,Infos,EventType,Graphs){
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
					section:[],              //分段之后数据[200, 400, 600, 800, 1000, 1200, 1400, 1600]
					data:[]                  //转换坐标后的数据  =>Vertical.data、Back.data
				},
				horizontal:{             //横轴
					name:'',                 //名称[维度2]
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

		_vertical:{
			value:null                   //纵向
		},
		_horizontal:{
			value:null                   //横向
		},		
		_back:{
			value:null                   //背景
		},
		_graphs:{
			value:null                   //图形
		},
		_infos:{
			value:null                   //信息
		},
		_infos2:{
			value:null                   //信息
		},
		_globalInduce:{
			value:null                   //全局感应区
		},
		_induces:{
			value:null                   //感应区
		},

		_disX:{
			value:4                      //左、右的距离
		},
		_disY:{
			value:4                     //上、下的距离
		},
		_dis_line:{
			value:6                      //纵向最高的线与最高高度最小相差的像素 而横向最右边的小线与最宽宽度也是最小相差该像素
		},

		_verticalMaxH:{
			value:0                      //纵向最大的高
		},
		_verticalGraphsH:{
			value:0                      //最上面的第一条线到原点之间的高度
		},
		_horizontalMaxW:{
			value:0                      //横向最大的宽
		},
		_del:{
			value:0                      //当数据量过大时 减去的数据个数
		},
		_timeoutId:{
			value:0                      
		},
		_timeoutDelay:{
			value:0                    
		},
		_baseNumber:{                    //基础值(原点)
			value:0
		}
	}

	S.extend(Widget,Base,{
		init:function(){
			var self = this

			self.set('_DataFrameFormat',self.DataExtend(self.get('_DataFrameFormat'),self.get('DataSource'))) 
			self.get('_DataFrameFormat').key.data = String(self.get('_DataFrameFormat').key.indexs).split(',')

			if(self.get('config').y_axis.data.mode == 1){
				self.get('_DataFrameFormat').vertical.org = self._getDataScale()
			}
			self.get('_DataFrameFormat').vertical.section = DataSection.section(Global.getChildsArr(self.get('_DataFrameFormat').vertical.org))
			// self.set('_baseNumber', self.get('_DataFrameFormat').vertical.section[0])
			self.get('_DataFrameFormat').graphs.groupCount = self.get('_DataFrameFormat').vertical.org.length
			self.get('_DataFrameFormat').graphs.groups = Global.getMaxChildArrLength(self.get('_DataFrameFormat').vertical.org)

			self._widget()
		},

		_getDataScale:function(){
			var self = this
			var arr = []
			var data = self.get('_DataFrameFormat').vertical.org
			for(var a  = 0, al = data.length; a < al; a++){
				var o = data[a]
				o = Global.getArrScales(o)
				arr[a] = o
			}
			return arr 
		},

		_widget:function(){
			var self = this
			var config = self.get('config')
			self.set('element', new SVGElement('g')), self.get('element').set('class','widget')
			self.get('parent').appendChild(self.get('element').element)

			self.set('_vertical',new Vertical())
			self.set('_horizontal',new Horizontal())
			self.set('_back',new Back())
			self.set('_graphs',new Graphs())
			self.set('_infos',new Infos())
			self.set('_infos2',new Infos())
			self.set('_globalInduce', new GlobalInduce())
			self.set('_induces',new Graphs())

			self.set('_horizontalMaxW', self.get('w') - self.get('_disX') - self.get('_disX'))

			self._trimHorizontal()
			var o = {
				w      : self.get('_horizontalMaxW'),
				parent : self.get('element'),
				datas  : self.get('_DataFrameFormat').horizontal.datas,
				dis_left : 0
			}
			self.get('_horizontal').init(o)
			var x = self.get('_disX')
			var y = self.get('h') - self.get('_horizontal').get('h') - self.get('_disY')
			self.get('_horizontal').get('element').transformXY(x, y)


			self.set('_verticalMaxH', y - self.get('_disY'))
			self.set('_verticalGraphsH', self.get('_verticalMaxH'))

			var o = {
				w      : self.get('_horizontalMaxW'),
				h      : self.get('_verticalMaxH'),
				parent : self.get('element'),
				axis   : { enabled : 0 },
				line_hor_mode : 1,
				data_hor : [{y:0}],
			}
			self.get('_back').init(o)
			self.get('_back').get('element').transformXY(x, y)


			self._trimGraphs()
			var singleW = 24
			var fontsInfo = self.get('_horizontal').get('fontsInfo')
			var disSingleX = (fontsInfo[1].x - fontsInfo[0].x) - singleW
			var  o = {
				h      : self.get('_verticalGraphsH'),
				parent : self.get('element'),
				config : self.get('config'),
				data   : Global.delArrUnPop(self.get('_DataFrameFormat').graphs.data, self.get('_del')),
				groupW : self.get('_horizontalMaxW'),
				groupCount : self.get('_DataFrameFormat').graphs.groupCount,
				singleW: singleW,
				disSingleX : disSingleX
			}
			self.get('_graphs').init(o)
			self.get('_graphs').get('element').transformXY(x, y)

			self.get('_infos').init({parent:self.get('element')})
			self.get('_infos2').init({parent:self.get('element')})

			var o = {
				w     : self.get('w'),
				h     : self.get('h'),
				parent: self.get('element'),
				opacity : Global.N00001
				// ,opacity : 0.1
			}
			self.get('_globalInduce').init(o)
			self.get('_globalInduce').get('element').element.addEventListener("mouseover",function(evt){ self._overHandler(evt)}, false);
			self.get('_globalInduce').get('element').element.addEventListener("mouseout",function(evt){ self._outHandler(evt)}, false);

		},
		//换算横向
		_trimHorizontal:function(){
			var self = this
			var arr = self.get('_DataFrameFormat').horizontal.datas
			var tmpData = []
		    for (var a = 0, al  = arr.length; a < al; a++ ) {
		    	!tmpData[a] ? tmpData[a] = [] : '' 
		    	for (var b = 0, bl  = arr[a].length; b < bl; b++ ) {
		    		tmpData[a].push({'value': arr[a][b]})
		    	}
			}
			self.get('_DataFrameFormat').horizontal.datas = tmpData

		},
		//换算图形
		_trimGraphs:function(){   
			var self = this                                                           
			var config = self.get('config')
			var max = self.get('_DataFrameFormat').vertical.section[self.get('_DataFrameFormat').vertical.section.length - 1]
			var arr = self.get('_DataFrameFormat').vertical.org
			var tmpData = []
			for (var a = 0, al = arr.length; a < al; a++ ) {
				for (var b = 0, bl = arr[a].length ; b < bl; b++ ) {
					!tmpData[b] ? tmpData[b] = [] : ''
					var value = config.y_axis.data.mode == 1 ? arr[a][b] + config.y_axis.data.suffix : arr[a][b]
					tmpData[b].push( {'value':value,'height':(arr[a][b] - self.get('_baseNumber')) / (max - self.get('_baseNumber')) * self.get('_verticalGraphsH'), 'key': { 'isKey':0 } } )
				}
			}
			for (var d = 0, dl = self.get('_DataFrameFormat').key.data.length; d < dl; d++ ) {
				if (tmpData[self.get('_DataFrameFormat').key.data[d] - 1]) {
					for (var e = 0, el = tmpData[self.get('_DataFrameFormat').key.data[d] - 1].length; e < el; e++ ) {
						tmpData[self.get('_DataFrameFormat').key.data[d] - 1][e].key.isKey = 1
					}
				}
			}
			self.get('_DataFrameFormat').graphs.data = tmpData
		},

		_overHandler:function($o){
			var self = this
			var config = self.get('config')
			clearTimeout(self.get('_timeoutId'));
			
			self.get('_horizontal').get('element').set('visibility','hidden')

			var x = self.get('_disX') + self.get('_horizontal').get('fontsInfo')[0].x
			var y = Number(self.get('_horizontal').get('element').get('_y')) + self.get('_horizontal').get('h')
			var content = Global.getSimplePrice(self.get('_DataFrameFormat').graphs.data[0][0].value) + config.tip.info.suffix
			var base_fill = $o.fill_over
			var data = []
			data[0] = []
			var o = { }
			o.content = content
			data[0].push(o)

			var o = {
				w    : self.get('w'),
				h    : self.get('h'),
				parent : self.get('element'),

				info:{
					x    : x,
					y    : y,
					data : data,
					base_fill : base_fill,
					isBack : 0
				},
				hLine:{
					is   : 0
				},
				hInfo:{
					is   : 0
				}
			}

			self.get('_infos').update(o)

			var x = self.get('_disX') + self.get('_horizontal').get('fontsInfo')[1].x
			var y = Number(self.get('_horizontal').get('element').get('_y')) + self.get('_horizontal').get('h')
			var content = Global.getSimplePrice(self.get('_DataFrameFormat').graphs.data[0][1].value) + config.tip.info.suffix
			var base_fill = $o.fill_over
			var data = []
			data[0] = []
			var o = { }
			o.content = content
			data[0].push(o)

			var o = {
				w    : self.get('w'),
				h    : self.get('h'),
				parent : self.get('element'),

				info:{
					x    : x,
					y    : y,
					data : data,
					base_fill : base_fill,
					isBack : 0
				},
				hLine:{
					is   : 0
				},
				hInfo:{
					is   : 0
				}
			}

			self.get('_infos2').update(o)
		},
		_outHandler:function($o){
			var self = this
			this.set('_timeoutId', setTimeout(function(){self._outTimeout()}, self.get('_timeoutDelay')))
			// this.get('_graphs').induce({index:$o.index,id:$o.id},false)
		},
		_outTimeout:function(){
			this.get('_horizontal').get('element').set('visibility','visible')
			this.get('_infos').remove()
			this.get('_infos2').remove()
		},
		/**
		 * 数据继承
		 * @type {Object}
		 */
		DataExtend:function(DataFrameFormat,DataSource){
			DataFrameFormat.key.indexs = DataSource.key.indexs
			DataFrameFormat.vertical.name = DataSource.vertical.name
			DataFrameFormat.vertical.org = DataSource.vertical.data
			DataFrameFormat.horizontal.name = DataSource.horizontal.name
			DataFrameFormat.horizontal.org = DataSource.horizontal.data
			DataFrameFormat.horizontal.datas = DataSource.horizontal.datas
			DataFrameFormat.horizontal.start.name = DataSource.horizontal.start.name ? DataSource.horizontal.start.name : DataFrameFormat.horizontal.start.name

			return DataFrameFormat
		}
	});

	return Widget;

	}, {
	    requires:['base','node','../../../pub/utils/global','../../../pub/utils/datasection','../../../pub/utils/svgelement',
	    		  '../../../pub/views/vertical','../../../pub/views/horizontal','../../../pub/views/back','../../../pub/views/globalinduce','../../../pub/views/infos/infos','../../../pub/models/eventtype','../../../pub/views/histogram/graphs'

	    ]
	}
);