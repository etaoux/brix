KISSY.add('brix/gallery/charts/js/case',function(S,Base,Node,DataSource,Widget){
	var $ = S.all

	function Case(){
		var self = this
		/*
			arguments:

			  o:{
				parent_id :''    //div id
				configData:''    //图表配置
				chartData :''    //图表数据
			  }
		 */
		Case.superclass.constructor.apply(this, arguments);

		self.init()
	}
	Case.ATTRS = {

		//图表
		chart:{
			value :{
				type:'',         //图表类型[histogram = 直方图  |  line =  ]
				config:'',       //图表配置
				data:''          //图表数据
			}
		},

		_widget:{
			value :null
		},
		_isDestroy:{
			value : false
		}
	}

	S.extend(Case,Base,{
		init:function(){
			var self = this

			var dataSource = new DataSource().parse(self.get('configData'))

			self.get('chart').type = dataSource.type
			self.get('chart').config = dataSource.data
			self.get('chart').data = self.get('chartData')

			//展现
			var o = {}
			o.parent_id = self.get('parent_id')                //div id
			o.w = $('#' + self.get('parent_id')).width()       //div 宽
			o.h = $('#' + self.get('parent_id')).height()      //div 高
			o.type = self.get('chart').type                    //图表类型
			o.config = self.get('chart').config                //配置
			o.data = self.get('chart').data                    //图表数据

			self.set('_widget', new Widget(o)) 
			self.get('_widget').on('elementClick',function($o){
				self.fire('elementClick',$o)
			})
		},
		//与外部js交互总接口
		actions:function($name,$value){
			var self = this
			//下载具体某图
			if($name == 'reset'){
				var o = $value
				if(o){
					self.set('configData',o.configData)
					self.set('chartData',o.chartData)
				}
				self.reset()
				return true
			}else if($name == 'destroy'){
				self.set('_isDestroy', true)
				if(self.get('_widget')){
					self.get('_widget').actions('destroy')
				}
			}
		},
		//重新展现图表
		reset:function(){
			var self = this
			// self.remove()
			self.init()
		}
		/*
		//删除svg内容
		remove:function(){
			var self = this
			var parent = $('#' + self.get('parent_id')).getDOMNode()
			if(parent && parent.lastChild) {parent.removeChild(parent.lastChild)}                  //R3
		}
		*/
	});

	return Case;

	}, {
	    requires:['base','node','./m/datasource/datasource','./m/widget/widget']
	}
);





KISSY.add('brix/gallery/charts/js/e/histogram/main',function(S,Base,Global,SVGElement,DataParse,ConfigParse,Widget){
	function Main(){

		var self = this

		/*
			arguments:

			  o:{
				parent   :''     //SVGElement
				w        :100    //chart 宽
				h        :100    //chart 高
				config   :''     //图表配置
				data     :''     //图表数据  
			  }

		 */
		Main.superclass.constructor.apply(self,arguments);

		self.init()
	}

	Main.ATTRS = {
		_main:{
			value:null
		},
		_config:{                //图表配置   经过ConfigParse.parse
			value:{}
		},
		_DataSource:{
			value:{}             //图表数据源 经过DataParse.parse
		}
	}

	S.extend(Main,Base,{
		init:function(){
			var self = this
			
			self.set('_DataSource', new DataParse().parse(self.get('data'))) 
			self.set('_config', new ConfigParse().parse(self.get('config'))) 

			self._widget()	
		},

		_widget:function(){
			var self = this
			
			self.set('_main',new SVGElement('g'))
			self.get('_main').attr({'class':'main'});
			self.get('parent').appendChild(self.get('_main').element)
			self.get('_main').transformXY(Global.N05,Global.N05)

			var o = {}
			o.parent = self.get('_main')                       //SVGElement
			o.w = self.get('w')                                //chart 宽
			o.h = self.get('h')                                //chart 高
			o.DataSource = self.get('_DataSource')             //图表数据源
			o.config = self.get('_config')                     //图表配置

			new Widget(o)
		}
		
	});

	return Main;

	}, {
	    requires:['base','../../pub/utils/global','../../pub/utils/svgelement','../../pub/controls/histogram/dataparse','../../pub/controls/histogram/configparse','./view/widget']
	}
);
KISSY.add('brix/gallery/charts/js/e/histogram/view/widget',function(S,Base,Node,Global,DataSection,SVGElement,Vertical,Horizontal,Back,GlobalInduce,Infos,EventType,Graphs){
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
		_globalInduce:{
			value:null                   //全局感应区
		},
		_induces:{
			value:null                   //感应区
		},

		_disX:{
			value:6                      //左、右的距离
		},
		_disY:{
			value:10                     //上、下的距离
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
			value:800                    
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
			self.set('_baseNumber', self.get('_DataFrameFormat').vertical.section[0])
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
			self.set('_globalInduce', new GlobalInduce())
			self.set('_induces',new Graphs())
			
			self._trimVertical()
			var o = {
				parent : self.get('element'),
				data   : self.get('_DataFrameFormat').vertical.data
			}
			self.get('_vertical').init(o)
			self.get('_vertical').get('element').transformXY(self.get('_disX'), self.get('h') - self.get('_horizontal').get('h') - self.get('_disY'))

			self._trimGraphs()
			var o = {
				w      : self.get('_horizontalMaxW'),
				h      : self.get('_verticalMaxH'),
				parent : self.get('element'),
				data_hor : self.get('_DataFrameFormat').vertical.data,
			}
			self.get('_back').init(o)
			self.get('_back').get('element').transformXY(self.get('_disX') + self.get('_vertical').get('w'), self.get('h') -  self.get('_horizontal').get('h') - self.get('_disY'))

			self.get('_DataFrameFormat').graphs.groupW = self._getGroupWidth()

			var  o = {
				h      : self.get('_verticalGraphsH'),
				parent : self.get('element'),
				config : self.get('config'),
				data   : Global.delArrUnPop(self.get('_DataFrameFormat').graphs.data, self.get('_del')),
				groupW : self.get('_DataFrameFormat').graphs.groupW,
				groupCount : self.get('_DataFrameFormat').graphs.groupCount
			}
			self.get('_graphs').init(o)
			var x =  self.get('_disX') + self.get('_vertical').get('w') + Global.N05
			x = config.x_axis.layout.mode == 1 ? x + Global.ceil(self.get('_DataFrameFormat').graphs.groupW / 2) - 1 : x 
			self.get('_graphs').get('element').transformXY(x, self.get('h') -  self.get('_horizontal').get('h') - self.get('_disY') + Global.N05)

			self._trimHorizontal()
			var o = {
				w      : self.get('_back').get('w'),
				parent : self.get('element'),
				data   : self.get('_DataFrameFormat').horizontal.data,
				dis_left : self.get('_disX') + self.get('_vertical').get('w') - self.get('_disX')
			}
			self.get('_horizontal').init(o)
			self.get('_horizontal').get('element').transformXY(self.get('_disX') + self.get('_vertical').get('w'), self.get('h') -  self.get('_horizontal').get('h') - self.get('_disY'))

			self.get('_infos').init({parent:self.get('element')})

			var o = {
				w     : self.get('w'),
				h     : self.get('h'),
				parent: self.get('element'),
				opacity : Global.N00001
				// opacity : 0.1
			}
			self.get('_globalInduce').init(o)

			var o = {
				w     : self.get('_horizontalMaxW'),
				h     : self.get('_verticalGraphsH'),
				parent: self.get('element'),
				config : self.get('config'),
				id    : 'induces',
				data  : Global.delArrUnPop(self.get('_DataFrameFormat').graphs.data, self.get('_del')),
				isInduce   : 1,
				groupW: self.get('_DataFrameFormat').graphs.groupW,
				groupCount : self.get('_DataFrameFormat').graphs.groupCount

			}
			self.get('_induces').init(o)
			self.get('_induces').get('element').on(EventType.OVER,function($o){self._overHandler($o)})
			self.get('_induces').get('element').on(EventType.OUT,function($o){self._outHandler($o)})
			self.get('_induces').get('element').transformXY(x, self.get('h') -  self.get('_horizontal').get('h') - self.get('_disY') + Global.N05)
		},

		//换算纵向
		_trimVertical:function(){
			var self = this
			var config = self.get('config')
			self.set('_verticalMaxH', self.get('h') - self.get('_disY') - self.get('_horizontal').get('h') - self.get('_disY'))
			self.set('_verticalGraphsH', self.get('_verticalMaxH') - self._getVerticalDisY())
			var max = self.get('_DataFrameFormat').vertical.section[self.get('_DataFrameFormat').vertical.section.length - 1]
			var arr = self.get('_DataFrameFormat').vertical.section
			var tmpData = []
			for (var a = 0, al = arr.length; a < al; a++ ) {
				var y = -(arr[a] - self.get('_baseNumber')) / (max - self.get('_baseNumber')) * self.get('_verticalGraphsH')                                    
				y = isNaN(y) ? 0 : Global.ceil(y)      
				var value = config.y_axis.data.mode == 1 ? arr[a] + config.y_axis.data.suffix : arr[a]
				tmpData[a] = { 'value':value, 'y': y }
			}
			self.get('_DataFrameFormat').vertical.data = tmpData
		},
		//获取纵向总高到第一条线之间的距离
		_getVerticalDisY:function(){
			var self = this
			var disMin = self.get('_dis_line')
			var disMax = 2 * self.get('_dis_line')
			var dis = disMin
			dis = disMin + self.get('_verticalMaxH') % self.get('_DataFrameFormat').vertical.section.length   //Q3  DataFrameFormat.vertical.section.length
			dis = dis > disMax ? disMax : dis
			return dis
		},
		//获取图形中每组的宽
		_getGroupWidth:function(){
			var self = this
			var config = self.get('config')
			var n = 0
			var disMin = self.get('_dis_line')
			var disMax = 2 * self.get('_dis_line')
			var dis = disMin
			var min = self.get('_graphs').getGroupMinW()
			var w = self.get('_horizontalMaxW') - disMin

			if (w % self.get('_DataFrameFormat').graphs.groups + disMin > disMax) {
				dis = disMax
			}else {
				dis = disMin + w % self.get('_DataFrameFormat').graphs.groups
			}
			//一组的宽一半
			var groupW = 0
			if(config.x_axis.layout.mode == 1){
				groupW = (self.get('_horizontalMaxW') - dis) / self.get('_DataFrameFormat').graphs.groups / 2
			}
			w = self.get('_horizontalMaxW') - dis - groupW
			n = w / self.get('_DataFrameFormat').graphs.groups
			if (n < min) { n = min }
			return n
		},
		//换算横向
		_trimHorizontal:function(){
			var self = this
			var arr = Global.delArrUnPop(self.get('_DataFrameFormat').horizontal.org, self.get('_del'))
			var tmpData = []
		    for (var i = 0, l  = arr.length; i < l; i++ ) {
				tmpData.push( { 'value':arr[i], 'x':Global.ceil(self.get('_graphs').get('groupW') * (i+1)) } )
			}
			self.get('_DataFrameFormat').horizontal.data = tmpData

		},
		//获取横向总宽到第一条线之间的距离
		_getHorizontalDisX:function(){
			var self = this
			var disMin = self.get('_dis_line')
			var disMax = 2 * self.get('_dis_line')
			var dis = disMin
			dis = disMin + self.get('_horizontalMaxW') % self.get('_DataFrameFormat').horizontal.org.length 
			dis = dis > disMax ? disMax : dis
			return dis
		},
		//换算图形
		_trimGraphs:function(){   
			var self = this                                                           
			var config = self.get('config')
			self.set('_horizontalMaxW', self.get('w') - self.get('_disX') - self.get('_vertical').get('w') - self.get('_disX'))
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
			if (self.get('_DataFrameFormat').graphs.groups * self.get('_graphs').getGroupMinW() > self.get('_horizontalMaxW') - self.get('_dis_line')) {
				self.set('_del', Global.ceil((self.get('_DataFrameFormat').graphs.groups * self.get('_graphs').getGroupMinW() - (self.get('_horizontalMaxW') - self.get('_dis_line'))) / self.get('_graphs').getGroupMinW()))
				var tmpData = Global.delArrUnPop(self.get('_DataFrameFormat').graphs.data, self.get('_del'))
				self.get('_DataFrameFormat').graphs.groups = tmpData.length
			}
		},
		//每两个点之间的距离
		_getGraphsDisX:function(){
			var self = this
			return self.get('_horizontalGraphsW') / (self.get('_DataFrameFormat').horizontal.org.length - 1)
		},

		_overHandler:function($o){
			var config = this.get('config')
			clearTimeout(this.get('_timeoutId'));
			var index = $o.index
			var id = $o.id
			if (index + 1 >= this.get('_DataFrameFormat').vertical.org[id].length - this.get('_del') && index + 1 < this.get('_DataFrameFormat').vertical.org[id].length) {
					index = index + this.get('_del')
			}
			var x = Number($o.cx) + Number(this.get('_graphs').get('element').get('_x'))
			var y = Number(this.get('_graphs').get('element').get('_y')) - Number($o.h)
			var base_fill = $o.fill_over
			var data = []
			data[0] = []
			var o = { }
			o.content = this.get('_DataFrameFormat').vertical.name
			data[0].push(o)
			o = { }
			o.content = this.get('_DataFrameFormat').graphs.data[index][id].value
			data[0].push(o)

			var o = {
				w    : this.get('w'),
				h    : this.get('h'),
				parent : this.get('element'),

				info:{
					x    : x,
					y    : y,
					data : data,
					base_fill : base_fill
				},
				hLine:{
					is   : 1,
					x    : x,
					y    : this.get('_graphs').get('element').get('_y')
				}
			}

			var pre = this.get('_DataFrameFormat').horizontal.org[index - 1] ? this.get('_DataFrameFormat').horizontal.org[index - 1] : ''
			pre = index == 0 ? this.get('_DataFrameFormat').horizontal.start.name : pre
			var next =  this.get('_DataFrameFormat').horizontal.org[index]
			var content = this.get('_DataFrameFormat').horizontal.name + pre + ' - ' + next
			content = config.x_axis.layout.mode == 1 ? this.get('_DataFrameFormat').horizontal.name + next : content

			o.hInfo = {
				is   : 1,
				x    : x,
				y    : this.get('_graphs').get('element').get('_y'),
				content : content
			}

			this.get('_infos').update(o)

			this.get('_graphs').induce({index:$o.index,id:$o.id},true)
		},
		_outHandler:function($o){
			var self = this
			this.set('_timeoutId', setTimeout(function(){self._outTimeout()}, self.get('_timeoutDelay')))

			this.get('_graphs').induce({index:$o.index,id:$o.id},false)
		},
		_outTimeout:function(){
			this.get('_infos').remove()
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
KISSY.add('brix/gallery/charts/js/e/histogram2/main',function(S,Base,Global,SVGElement,DataParse,ConfigParse,Widget){
	function Main(){

		var self = this

		/*
			arguments:

			  o:{
				parent   :''     //SVGElement
				w        :100    //chart 宽
				h        :100    //chart 高
				config   :''     //图表配置
				data     :''     //图表数据  
			  }

		 */
		Main.superclass.constructor.apply(self,arguments);

		self.init()
	}

	Main.ATTRS = {
		_main:{
			value:null
		},
		_config:{                //图表配置   经过ConfigParse.parse
			value:{}
		},
		_DataSource:{
			value:{}             //图表数据源 经过DataParse.parse
		}
	}

	S.extend(Main,Base,{
		init:function(){
			var self = this
			
			self.set('_DataSource', new DataParse().parse(self.get('data'))) 
			self.set('_config', new ConfigParse().parse(self.get('config')))
			self.set('_config', self._defaultConfig(self.get('_config')))

			self._widget()	
		},

		_widget:function(){
			var self = this
			
			self.set('_main',new SVGElement('g'))
			self.get('_main').attr({'class':'main'});
			self.get('parent').appendChild(self.get('_main').element)
			self.get('_main').transformXY(Global.N05,Global.N05)

			var o = {}
			o.parent = self.get('_main')                       //SVGElement
			o.w = self.get('w')                                //chart 宽
			o.h = self.get('h')                                //chart 高
			o.DataSource = self.get('_DataSource')             //图表数据源
			o.config = self.get('_config')                     //图表配置

			new Widget(o)
		},

		_defaultConfig:function($config){
			var config = $config
			config.graphs.layout.mode = 1
			return config
		}
	});

	return Main;

	}, {
	    requires:['base','../../pub/utils/global','../../pub/utils/svgelement','../../pub/controls/histogram/dataparse','../../pub/controls/histogram/configparse','./view/widget']
	}
);
KISSY.add('brix/gallery/charts/js/e/histogram2/view/widget',function(S,Base,Node,Global,DataSection,SVGElement,Vertical,Horizontal,Back,GlobalInduce,Infos,EventType,Graphs){
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
		_globalInduce:{
			value:null                   //全局感应区
		},
		_induces:{
			value:null                   //感应区
		},

		_disX:{
			value:6                      //左、右的距离
		},
		_disY:{
			value:10                     //上、下的距离
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
		_horizontalGraphsW:{
			value:0                      //横向最右侧的线到原点之间的宽度
		},
		_del:{
			value:0                      //当数据量过大时 减去的数据个数
		},
		_timeoutId:{
			value:0                      
		},
		_timeoutDelay:{
			value:800                    
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
			
			//由于位置的排列根据原点 往上排列 所以要倒序
			// if(self.get('_DataFrameFormat').vertical.org[0]){
			// 	self.get('_DataFrameFormat').vertical.org[0].reverse();
			// }
			// self.get('_DataFrameFormat').horizontal.org.reverse();

			self.get('_DataFrameFormat').vertical.section = DataSection.section(Global.getChildsArr(self.get('_DataFrameFormat').vertical.org))
			if(self.get('_DataFrameFormat').vertical.section[0] == 0){
				self.get('_DataFrameFormat').vertical.section.shift()
			}
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
			self.set('_globalInduce', new GlobalInduce())
			self.set('_induces',new Graphs())
			
			self.get('_DataFrameFormat').graphs.groupW = self._getGroupWidth()

			self._trimVertical()
			var o = {
				parent : self.get('element'),
				data   : self.get('_DataFrameFormat').vertical.data,
				line_h : 1,
			}
			self.get('_vertical').init(o)
			self.get('_vertical').get('element').transformXY(self.get('_disX'), self.get('h') - self.get('_horizontal').get('h') - self.get('_disY'))

			self._trimHorizontal()

			self._trimGraphs()
			var o = {
				w      : self.get('_horizontalMaxW'),
				h      : self.get('_verticalMaxH'),
				parent : self.get('element'),
				data_ver : self.get('_DataFrameFormat').horizontal.data,
				line_ver_mode : 0
			}
			self.get('_back').init(o)
			self.get('_back').get('element').transformXY(self.get('_disX') + self.get('_vertical').get('w'), self.get('h') -  self.get('_horizontal').get('h') - self.get('_disY'))

			var  o = {
				w      : self.get('_horizontalGraphsW'),
				h      : self.get('_verticalGraphsH'),
				parent : self.get('element'),
				config : self.get('config'),
				data   : Global.delArrUnPop(self.get('_DataFrameFormat').graphs.data, self.get('_del')),
				layout : self.get('config').graphs.layout,
				groupW : self.get('_DataFrameFormat').graphs.groupW,
				groupCount : self.get('_DataFrameFormat').graphs.groupCount
			}
			self.get('_graphs').init(o)
			var x =  self.get('_disX') + self.get('_vertical').get('w') + Global.N05
			// x = config.x_axis.layout.mode == 1 ? x + Global.ceil(self.get('_DataFrameFormat').graphs.groupW / 2) - 1 : x 
			var y = self.get('h') -  self.get('_horizontal').get('h') - self.get('_disY') + Global.N05
			y = config.x_axis.layout.mode == 1 ? y - Global.ceil(self.get('_DataFrameFormat').graphs.groupW / 2) : y 
 			self.get('_graphs').get('element').transformXY(x, y)

			var o = {
				w      : self.get('_back').get('w'),
				parent : self.get('element'),
				data   : self.get('_DataFrameFormat').horizontal.data,
				line_w : 3
			}
			self.get('_horizontal').init(o)
			self.get('_horizontal').get('element').transformXY(self.get('_disX') + self.get('_vertical').get('w'), self.get('h') -  self.get('_horizontal').get('h') - self.get('_disY'))

			self.get('_infos').init({parent:self.get('element')})

			var o = {
				w     : self.get('w'),
				h     : self.get('h'),
				parent: self.get('element'),
				opacity : Global.N00001
				// opacity : 0.1
			}
			self.get('_globalInduce').init(o)
			
			var o = {
				w     : self.get('_horizontalGraphsW'),
				h     : self.get('_verticalGraphsH'),
				parent: self.get('element'),
				config : self.get('config'),
				id    : 'induces',
				data  : Global.delArrUnPop(self.get('_DataFrameFormat').graphs.data, self.get('_del')),
				layout : self.get('config').graphs.layout,
				isInduce   : 1,
				groupW: self.get('_DataFrameFormat').graphs.groupW,
				groupCount : self.get('_DataFrameFormat').graphs.groupCount

			}
			self.get('_induces').init(o)
			self.get('_induces').get('element').on(EventType.OVER,function($o){self._overHandler($o)})
			self.get('_induces').get('element').on(EventType.OUT,function($o){self._outHandler($o)})
			self.get('_induces').get('element').transformXY(x, y)
		},

		/*
		//换算纵向
		_trimVertical:function(){
			var self = this
			var config = self.get('config')
			self.set('_verticalMaxH', self.get('h') - self.get('_disY') - self.get('_horizontal').get('h') - self.get('_disY'))
			self.set('_verticalGraphsH', self.get('_verticalMaxH') - self._getVerticalDisY())
			var max = self.get('_DataFrameFormat').vertical.section[self.get('_DataFrameFormat').vertical.section.length - 1]
			var arr = self.get('_DataFrameFormat').vertical.section
			var tmpData = []
			for (var a = 0, al = arr.length; a < al; a++ ) {
				var y = -arr[a] / max * self.get('_verticalGraphsH')                                    
				y = isNaN(y) ? 0 : Global.ceil(y)      
				var value = config.y_axis.data.mode == 1 ? arr[a] + config.y_axis.data.suffix : arr[a]
				tmpData[a] = { 'value':value, 'y': y }
			}
			self.get('_DataFrameFormat').vertical.data = tmpData
		},
		//获取纵向总高到第一条线之间的距离
		_getVerticalDisY:function(){
			var self = this
			var disMin = self.get('_dis_line')
			var disMax = 2 * self.get('_dis_line')
			var dis = disMin
			dis = disMin + self.get('_verticalMaxH') % self.get('_DataFrameFormat').vertical.section.length   //Q3  DataFrameFormat.vertical.section.length
			dis = dis > disMax ? disMax : dis
			return dis
		},
		*/
		//换算纵向
		_trimVertical:function(){
			var self = this
			var config = self.get('config')
			self.set('_verticalMaxH', self.get('h') - self.get('_disY') - self.get('_horizontal').get('h') - self.get('_disY'))
			self.set('_verticalGraphsH', self.get('_verticalMaxH') - self._getVerticalDisY())
			var max = self.get('_DataFrameFormat').horizontal.org.length
			var arr = self.get('_DataFrameFormat').horizontal.org
			var tmpData = []
			for (var a = 0, al = arr.length; a < al; a++ ) {
				// var y = -(a + 1) / max * self.get('_verticalGraphsH')                                    
				var y = -Global.ceil(self.get('_DataFrameFormat').graphs.groupW * (a+1))                               
				y = isNaN(y) ? 0 : Global.ceil(y)      
				var value = arr[a]
				tmpData[a] = { 'value':value, 'y': y }
			}
			self.get('_DataFrameFormat').vertical.data = tmpData
		},
		//获取纵向总高到第一条线之间的距离
		_getVerticalDisY:function(){
			var self = this
			var disMin = self.get('_dis_line')
			var disMax = 2 * self.get('_dis_line')
			var dis = disMin
			dis = disMin + self.get('_verticalMaxH') % self.get('_DataFrameFormat').vertical.section.length   //Q3  DataFrameFormat.vertical.section.length
			dis = dis > disMax ? disMax : dis
			return dis
		},
		//获取图形中每组的宽
		_getGroupWidth:function(){
			var self = this
			var config = self.get('config')
			self.set('_verticalMaxH', self.get('h') - self.get('_disY') - self.get('_horizontal').get('h') - self.get('_disY'))
			var n = 0
			var disMin = self.get('_dis_line')
			var disMax = 2 * self.get('_dis_line')
			var dis = disMin
			var min = self.get('_graphs').getGroupMinW()
			var maxW = self.get('_verticalMaxH')
			var w = maxW - disMin

			if (w % self.get('_DataFrameFormat').graphs.groups + disMin > disMax) {
				dis = disMax
			}else {
				dis = disMin + w % self.get('_DataFrameFormat').graphs.groups
			}
			//一组的宽一半
			var groupW = 0
			if(config.x_axis.layout.mode == 1){
				groupW = (maxW - dis) / self.get('_DataFrameFormat').graphs.groups / 2
			}
			w = maxW - dis - groupW
			n = w / self.get('_DataFrameFormat').graphs.groups
			if (n < min) { n = min }
			return n
		},
		/*
		//换算横向
		_trimHorizontal:function(){
			var self = this
			var arr = Global.delArrUnPop(self.get('_DataFrameFormat').horizontal.org, self.get('_del'))
			var tmpData = []
		    for (var i = 0, l  = arr.length; i < l; i++ ) {
				tmpData.push( { 'value':arr[i], 'x':Global.ceil(self.get('_graphs').get('groupW') * (i+1)) } )
			}
			self.get('_DataFrameFormat').horizontal.data = tmpData

		},
		//获取横向总宽到最右侧线之间的距离
		_getHorizontalDisX:function(){
			var self = this
			var disMin = self.get('_dis_line')
			var disMax = 2 * self.get('_dis_line')
			var dis = disMin
			dis = disMin + self.get('_horizontalMaxW') % self.get('_DataFrameFormat').horizontal.org.length 
			dis = dis > disMax ? disMax : dis
			return dis
		},
		*/
		//换算横向
		_trimHorizontal:function(){
			var self = this
			var config = self.get('config')
			self.set('_horizontalMaxW', self.get('w') - self.get('_disX') - self.get('_vertical').get('w') - self.get('_disX'))
			self.set('_horizontalGraphsW', self.get('_horizontalMaxW') - self._getHorizontalDisX())
			var max = self.get('_DataFrameFormat').vertical.section.length
			var arr = self.get('_DataFrameFormat').vertical.section
			var tmpData = []
			for (var a = 0, al = arr.length; a < al; a++ ) {
				var x = (a + 1) / max * self.get('_horizontalGraphsW')                                    
				x = isNaN(x) ? 0 : Global.ceil(x)      
				var value = config.y_axis.data.mode == 1 ? arr[a] + config.y_axis.data.suffix : arr[a]
				tmpData[a] = { 'value':value, 'x': x }
			}
			self.get('_DataFrameFormat').horizontal.data = tmpData

		},
		//获取横向总宽到最右侧线之间的距离
		_getHorizontalDisX:function(){
			var self = this
			var disMin = self.get('_dis_line')
			var disMax = 2 * self.get('_dis_line')
			var dis = disMin
			dis = disMin + self.get('_horizontalMaxW') % self.get('_DataFrameFormat').vertical.section.length 
			dis = dis > disMax ? disMax : dis
			return dis
		},
		/*
		//换算图形
		_trimGraphs:function(){   
			var self = this                                                           
			var config = self.get('config')
			self.set('_horizontalMaxW', self.get('w') - self.get('_disX') - self.get('_vertical').get('w') - self.get('_disX'))
			var max = self.get('_DataFrameFormat').vertical.section[self.get('_DataFrameFormat').vertical.section.length - 1]
			var arr = self.get('_DataFrameFormat').vertical.org
			var tmpData = []
			for (var a = 0, al = arr.length; a < al; a++ ) {
				for (var b = 0, bl = arr[a].length ; b < bl; b++ ) {
					!tmpData[b] ? tmpData[b] = [] : ''
					var value = config.y_axis.data.mode == 1 ? arr[a][b] + config.y_axis.data.suffix : arr[a][b]
					tmpData[b].push( {'value':value,'height':arr[a][b] / max * self.get('_verticalGraphsH'), 'key': { 'isKey':0 } } )
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
			if (self.get('_DataFrameFormat').graphs.groups * self.get('_graphs').getGroupMinW() > self.get('_horizontalMaxW') - self.get('_dis_line')) {
				self.set('_del', Global.ceil((self.get('_DataFrameFormat').graphs.groups * self.get('_graphs').getGroupMinW() - (self.get('_horizontalMaxW') - self.get('_dis_line'))) / self.get('_graphs').getGroupMinW()))
				var tmpData = Global.delArrUnPop(self.get('_DataFrameFormat').graphs.data, self.get('_del'))
				self.get('_DataFrameFormat').graphs.groups = tmpData.length
			}
		},
		*/
		//换算图形
		_trimGraphs:function(){
			var self = this                                                           
			var config = self.get('config')
			//self.set('_horizontalMaxW', self.get('w') - self.get('_disX') - self.get('_vertical').get('w') - self.get('_disX'))
			var max = self.get('_DataFrameFormat').vertical.section[self.get('_DataFrameFormat').vertical.section.length - 1]
			var arr = self.get('_DataFrameFormat').vertical.org
			var tmpData = []
			for (var a = 0, al = arr.length; a < al; a++ ) {
				for (var b = 0, bl = arr[a].length ; b < bl; b++ ) {
					!tmpData[b] ? tmpData[b] = [] : ''
					var value = config.y_axis.data.mode == 1 ? arr[a][b] + config.y_axis.data.suffix : arr[a][b]
					// tmpData[b].push( {'value':value,'height':arr[a][b] / max * self.get('_verticalGraphsH'), 'key': { 'isKey':0 } } )
					tmpData[b].push( {'value':value,'height':arr[a][b] / max * self.get('_horizontalGraphsW'), 'key': { 'isKey':0 } } )
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
			if (self.get('_DataFrameFormat').graphs.groups * self.get('_graphs').getGroupMinW() > self.get('_horizontalMaxW') - self.get('_dis_line')) {
				self.set('_del', Global.ceil((self.get('_DataFrameFormat').graphs.groups * self.get('_graphs').getGroupMinW() - (self.get('_horizontalMaxW') - self.get('_dis_line'))) / self.get('_graphs').getGroupMinW()))
				var tmpData = Global.delArrUnPop(self.get('_DataFrameFormat').graphs.data, self.get('_del'))
				self.get('_DataFrameFormat').graphs.groups = tmpData.length
			}
		},
		//每两个点之间的距离
		_getGraphsDisX:function(){
			var self = this
			return self.get('_horizontalGraphsW') / (self.get('_DataFrameFormat').horizontal.org.length - 1)
		},

		_overHandler:function($o){
			var config = this.get('config')
			clearTimeout(this.get('_timeoutId'));
			var index = $o.index
			var id = $o.id
			if (index + 1 >= this.get('_DataFrameFormat').vertical.org[id].length - this.get('_del') && index + 1 < this.get('_DataFrameFormat').vertical.org[id].length) {
					index = index + this.get('_del')
			}
			var x = Number($o.cx) + Number(this.get('_graphs').get('element').get('_x'))
			x = Math.ceil(x)
			var y = Number(this.get('_graphs').get('element').get('_y')) - Number($o.cy)
			var h = Number(this.get('_horizontal').get('element').get('_y')) - y + 6

			var base_fill = $o.fill_over
			var data = []
			data[0] = []
			var o = { }
			// o.content = this.get('_DataFrameFormat').vertical.name
			o.content = this.get('_DataFrameFormat').horizontal.name
			// data[0].push(o)
			o = { }
			// o.content = this.get('_DataFrameFormat').graphs.data[index][id].value
			o.content = this.get('_DataFrameFormat').horizontal.org[index]
			data[0].push(o)

			o = { }
			o.content = this.get('_DataFrameFormat').graphs.data[index][id].value
			data[0].push(o)
			var o = {
				w    : this.get('w'),
				h    : this.get('h'),
				parent : this.get('element'),

				dis_info : 0,

				info:{
					x    : x,
					y    : y,
					data : data,
					base_fill : base_fill,
					ver_dis : 4
				},
				hLine:{
					is   : 1,
					x    : x,
					y    : y,
					h    : h
				}
			}

			// var pre = this.get('_DataFrameFormat').horizontal.org[index - 1] ? this.get('_DataFrameFormat').horizontal.org[index - 1] : ''
			// pre = index == 0 ? this.get('_DataFrameFormat').horizontal.start.name : pre
			// var next =  this.get('_DataFrameFormat').horizontal.org[index]
			// var content = this.get('_DataFrameFormat').horizontal.name + pre + ' - ' + next
			var content = this.get('_DataFrameFormat').vertical.name + this.get('_DataFrameFormat').graphs.data[index][id].value
			
			// content = config.x_axis.layout.mode == 1 ? this.get('_DataFrameFormat').horizontal.name + next : content
			content = config.x_axis.layout.mode == 1 ? this.get('_DataFrameFormat').vertical.name + this.get('_DataFrameFormat').graphs.data[index][id].value : content

			o.hInfo = {
				is   : 1,
				x    : x,
				y    : this.get('_horizontal').get('element').get('_y'),
				content : content
			}

			this.get('_infos').update(o)

			this.get('_graphs').induce({index:$o.index,id:$o.id},true)
		},
		_outHandler:function($o){
			var self = this
			this.set('_timeoutId', setTimeout(function(){self._outTimeout()}, self.get('_timeoutDelay')))

			this.get('_graphs').induce({index:$o.index,id:$o.id},false)
		},
		_outTimeout:function(){
			this.get('_infos').remove()
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
KISSY.add('brix/gallery/charts/js/e/histogram3/control/configparse',function(S,Base,Node,BarConfigParse,Style1ConfigParse){
	var $ = Node.all

	function ConfigParse(){
		
		var self = this

		ConfigParse.superclass.constructor.apply(self,arguments);
	}

	ConfigParse.ATTRS = {
		o:{
			value:{
				v:'1.0',

				bar:{},

				layout:{},

				infos:{
			        xAxis:{
					    mode:0               //模式[0 = 显示两个点(1:00-2:00) | 1 = 显示一个点(2013-03-08)]
						  }
			          }
			      }
		}
	}

	S.extend(ConfigParse,Base,{
		parse:function($data,$type){
			var self = this

			var o = S.clone(self.o) 
			var type = $type ? $type : 'xml'
			if(type == 'xml'){
				o = self._xml($data)
			}
			return o
		},
		_xml:function($data){
			var self = this

			var o = S.clone(self.get('o')) 
			var data = String($data)
			var domParser = new DOMParser();
			var xmlDoc = domParser.parseFromString(data, 'text/xml');

			var __data = xmlDoc.getElementsByTagName("data")[0]
			if(__data){
				o.v = __data.getAttribute('v') && String(__data.getAttribute('v')) ? String(__data.getAttribute('v')) : o.v

				var s = ''
				if(__data.getElementsByTagName("bar")[0]){
					 s = new XMLSerializer().serializeToString(__data.getElementsByTagName("bar")[0])
				}
				s = s.replace('<bar', "<data")
				s = s.replace('bar>', "data>")
				o.bar = new BarConfigParse().parse(s)

				var s = ''
				if(__data.getElementsByTagName("layout")[0]){
					s = new XMLSerializer().serializeToString(__data.getElementsByTagName("layout")[0])
				}
				s = s.replace('<layout', "<data")
				s = s.replace('layout>', "data>")
				o.layout = new Style1ConfigParse().parse(s)

				var __infos = __data.getElementsByTagName("infos")[0]
				if(__infos){
					var __x_axis = __infos.getElementsByTagName("x_axis")[0]
					if(__x_axis){
						o.infos.xAxis.mode = __x_axis.getAttribute('mode') || __x_axis.getAttribute('mode') == 0 ? Number(__x_axis.getAttribute('mode')) : o.infos.xAxis.mode
					}
				}
			}else{
				o.bar = new BarConfigParse().parse('')
				o.layout = new Style1ConfigParse().parse('')
			}
			return o
		}
	});

	return ConfigParse;

	}, {
	    requires:['base','node','../../../pub/controls/bar/configparse','../../../pub/controls/layouts/style1/configparse']
	}
);
KISSY.add('brix/gallery/charts/js/e/histogram3/main',function(S,Base,Global,SVGElement,DataParse,ConfigParse,Widget){
	function Main(){

		var self = this

		/*
			arguments:

			  o:{
				parent   :''     //SVGElement
				w        :100    //chart 宽
				h        :100    //chart 高
				config   :''     //图表配置
				data     :''     //图表数据  
			  }

		 */
		Main.superclass.constructor.apply(self,arguments);

		self.init()
	}

	Main.ATTRS = {
		_main:{
			value:null
		},
		_config:{                //图表配置   经过ConfigParse.parse
			value:{}
		},
		_DataSource:{
			value:{}             //图表数据源 经过DataParse.parse
		}
	}

	S.extend(Main,Base,{
		init:function(){
			var self = this
			
			self.set('_DataSource', new DataParse().parse(self.get('data'))) 
			self.set('_config', new ConfigParse().parse(self.get('config')))
			self.set('_config', self._defaultConfig(self.get('_config')))

			self.get('_config')
			self._widget()	
		},

		_widget:function(){
			var self = this
			
			self.set('_main',new SVGElement('g'))
			self.get('_main').attr({'class':'main'});
			self.get('parent').appendChild(self.get('_main').element)
			self.get('_main').transformXY(Global.N05,Global.N05)

			var o = {}
			o.parent = self.get('_main')                       //SVGElement
			o.w = self.get('w')                                //chart 宽
			o.h = self.get('h')                                //chart 高
			o.DataSource = self.get('_DataSource')             //图表数据源
			o.config = self.get('_config')                     //图表配置

			new Widget(o)
		},

		_defaultConfig:function($config){
			var self = this
			var config = $config
			var arr = [ { normal:'#5BCB8A', over:'#36B26A' }, { normal:'#E68422', over:'#BF7C39' }]
			for(var a = 0; a < 100; a++){
				config.bar.fills[a] = arr
			}
			return config
		}
	});

	return Main;

	}, {
	    requires:['base','../../pub/utils/global','../../pub/utils/svgelement','../../pub/controls/bar/dataparse','./control/configparse','./view/widget']
	}
);
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
KISSY.add('brix/gallery/charts/js/e/histogram4/main',function(S,Base,Global,SVGElement,DataParse,ConfigParse,Widget){
	function Main(){

		var self = this

		/*
			arguments:

			  o:{
				parent   :''     //SVGElement
				w        :100    //chart 宽
				h        :100    //chart 高
				config   :''     //图表配置
				data     :''     //图表数据  
			  }

		 */
		Main.superclass.constructor.apply(self,arguments);

		self.init()
	}

	Main.ATTRS = {
		_main:{
			value:null
		},
		_config:{                //图表配置   经过ConfigParse.parse
			value:{}
		},
		_DataSource:{
			value:{}             //图表数据源 经过DataParse.parse
		}
	}

	S.extend(Main,Base,{
		init:function(){
			var self = this
			
			self.set('_DataSource', new DataParse().parse(self.get('data'))) 
			self.set('_config', new ConfigParse().parse(self.get('config'))) 

			// S.log(self.get('_DataSource'))
			self._widget()	
		},

		_widget:function(){
			var self = this
			
			self.set('_main',new SVGElement('g'))
			self.get('_main').attr({'class':'main'});
			self.get('parent').appendChild(self.get('_main').element)
			self.get('_main').transformXY(Global.N05,Global.N05)

			var o = {}
			o.parent = self.get('_main')                       //SVGElement
			o.w = self.get('w')                                //chart 宽
			o.h = self.get('h')                                //chart 高
			o.DataSource = self.get('_DataSource')             //图表数据源
			o.config = self.get('_config')                     //图表配置

			new Widget(o)
		}
		
	});

	return Main;

	}, {
	    requires:['base','../../pub/utils/global','../../pub/utils/svgelement','../../pub/controls/histogram/dataparse','../../pub/controls/histogram/configparse','./view/widget']
	}
);
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
KISSY.add('brix/gallery/charts/js/e/integrate/control/configparse',function(S,Base,Node,HistogramConfigParse,LineConfigParse){
	var $ = Node.all

	function ConfigParse(){
		
		var self = this

		ConfigParse.superclass.constructor.apply(self,arguments);
	}

	ConfigParse.ATTRS = {
		o:{
			value:{
				v:'1.0',

				fills:{
					normals:['#458AE6'],
					overs  :['#135EBF']
				},

				right:{}
			}
		}
	}

	S.extend(ConfigParse,Base,{
		parse:function($data,$type){
			var self = this

			var o = S.clone(self.o) 
			var type = $type ? $type : 'xml'
			if(type == 'xml'){
				o = self._xml($data)
			}
			return o
		},
		_xml:function($data){
			var self = this

			var o = S.clone(self.get('o')) 
			var data = String($data)
			var domParser = new DOMParser();
			var xmlDoc = domParser.parseFromString(data, 'text/xml');

			var __data = xmlDoc.getElementsByTagName("data")[0]
			o.v = __data.getAttribute('v') && String(__data.getAttribute('v')) ? String(__data.getAttribute('v')) : o.v

			var s = ''
			if(__data.getElementsByTagName("line")[0]){
				s = new XMLSerializer().serializeToString(__data.getElementsByTagName("line")[0])
			}
			s = s.replace('<line', "<data")
			s = s.replace('line>', "data>")

			o.right = new LineConfigParse().parse(s)

			return o
		},

		//将'0x' 替换成 '#'
		_trimFills:function($arr){
			var arr = []
			for(var a = 0,al = $arr.length; a < al; a++){
				var s = String($arr[a])
				s = s.replace('0x','#')
				arr.push(s)
			}
			return arr
		}
	});

	return ConfigParse;

	}, {
	    requires:['base','node','../../../pub/controls/histogram/configparse','../../../pub/controls/line/configparse']
	}
);
KISSY.add('brix/gallery/charts/js/e/integrate/control/dataparse',function(S,Base,Node){
	var $ = Node.all

	function DataParse(){
		
		var self = this

		DataParse.superclass.constructor.apply(self,arguments);
	}

	DataParse.ATTRS = {
		o:{
			value:{
				key:{                    //突出显示[预留]
					indexs:''                //String 索引字符串[1,2,3]                            
				},
				vertical:{               //纵轴	
					names:[],                //名称二维数据[ [千次展现价格:,展现次数:] ]
					data:[]                  //原始三维数据[ [  [[8300],[8100],[...]]   , [[4300],[4100],[...]]   ] ]
				},
				horizontal:{             //横轴
					data:[]                  //原始二维数据[[3月8号],[3月9号],[...]]
				}
			}
		}
	}

	S.extend(DataParse,Base,{
		parse:function($data,$type){
			var o
			var type = $type ? $type : 'xml'
			if(type == 'xml'){
				o = this._xml($data)
			}
			return o
		},

		_xml:function($data){
			var self = this

			var o = S.clone(self.get('o')) 
			var data = String($data)

			var domParser = new DOMParser();
			var xmlDoc = domParser.parseFromString(data, 'text/xml');

			o = self._getObject(xmlDoc.getElementsByTagName("data"))

			return o
		},

		_getObject:function($list){
			var self = this

			var o = S.clone(self.get('o')) 
			var item;

			for (var a = 0, al = $list.length; a < al; a++) {
				var __data = $list[a]
				var __indexAxis = __data.getElementsByTagName("indexAxis")[0]
				var __sets = __data.getElementsByTagName("sets")[0]

				//Q3(js:空的数组判断能通过)
				o.horizontal.data = o.horizontal.data.length > 0 ? o.horizontal.data : __indexAxis.getAttribute('labels') ? String(__indexAxis.getAttribute('labels')).split(',') : []

				o.vertical.names.push(String(__sets.getAttribute('name')).split(',')) 
				o.vertical.data.push(String(__sets.getElementsByTagName('set')[0].getAttribute('values')).split(','))
			}

			return o
		}
	});

	return DataParse;

	}, {
	    requires:['base','node']
	}
);
KISSY.add('brix/gallery/charts/js/e/integrate/main',function(S,Base,Global,SVGElement,Widget,DataParse,ConfigParse){
	function Main(){

		var self = this

		/*
			arguments:

			  o:{
				parent   :''     //SVGElement
				w        :100    //chart 宽
				h        :100    //chart 高
				config   :''     //图表配置
				data     :''     //图表数据  
			  }

		 */
		Main.superclass.constructor.apply(self,arguments);

		self.init()
	}

	Main.ATTRS = {
		_main:{
			value:null
		},
		_config:{                //图表配置   经过ConfigParse.parse
			value:{}
		},
		_DataSource:{
			value:{}             //图表数据源 经过DataParse.parse
		}
	}

	S.extend(Main,Base,{
		init:function(){
			var self = this

			self.set('_DataSource', new DataParse().parse(self.get('data'))) 
			self.set('_config', new ConfigParse().parse(self.get('config'))) 
			
			self._widget()	
		},

		_widget:function(){
			var self = this
			
			self.set('_main',new SVGElement('g'))
			self.get('_main').attr({'class':'main'});
			self.get('parent').appendChild(self.get('_main').element)
			self.get('_main').transformXY(Global.N05, Global.N05)

			var o = {}
			o.parent = self.get('_main')                       //SVGElement
			o.w = self.get('w')                                //chart 宽
			o.h = self.get('h')                                //chart 高
			o.DataSource = self.get('_DataSource')             //图表数据源
			o.config = self.get('_config')                     //图表配置

			new Widget(o)
		}
		
	});

	return Main;

	}, {
	    requires:['base','../../pub/utils/global','../../pub/utils/svgelement','./view/widget','./control/dataparse','./control/configparse']
	}
);
KISSY.add('brix/gallery/charts/js/e/integrate/view/graphs',function(S,Base,node,Global,SVGElement,SVGRenderer,EventType,histogramGraphs,lineGraphs){
	
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
			// var o = self._globalToLocal({'x':$evt.layerX,'y':$evt.layerY})
			// var x = o.x, y = o.y
			var o = Global.getLocalXY($evt, self.get('parent').element)
			var x = o.x - Number(self.get('element').get('_x')), y = o.y - Number(self.get('element').get('_y'))
			
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
	    requires:['base','node','../../../pub/utils/global','../../../pub/utils/svgelement','../../../pub/utils/svgrenderer','../../../pub/models/eventtype','../../../pub/views/histogram/graphs','../../../pub/views/line/graphs']
	}
);
KISSY.add('brix/gallery/charts/js/e/integrate/view/widget',function(S,Base,Node,Global,DataSection,SVGElement,Vertical,Horizontal,Back,GlobalInduce,Infos,EventType,Graphs){
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
				vertical:{               //纵轴
					names:[],                //名称二维数据[ [千次展现价格:,展现次数:] ]
					org:[],                  //原始三维数据[ [  [[8300],[8100],[...]]   , [[4300],[4100],[...]]   ] ]
					sections:[],             //分段之后二维数据[[0]中存放左侧数据、[1]中存放右侧数据]
					datas:[]                 //转换坐标后的二维数据: 二维数组[[0]中存放左侧数据、[1]中存放右侧数据]  =>Vertical.data、Back.data_hor
				},
				horizontal:{             //横轴
					name:'',                 //名称[预留]
					org:'',                  //原始二维数据[[3月8号],[3月9号],[...]]
					data:[]                  //转换坐标后的数据  =>Horizontal.data
				},
				graphs:{                 //图形
					groupCount:1,            //每组中几条数据    Q3 有且只有一条
					groupW:59,               //一组的宽
					groups:1,                //有几个组
					datas:[],                 //直方和折线转换坐标后的数据(不删减 [0]临时处理成Graphs.data,[1]临时处理成Graphs.data_right)
					infos:[],                //二维数组 一个数组代表一个直方组 直方信息数据({cx = 每个直方中心点坐标})[[{cx:100},{}],[]]
					info:[]                  //根据infos 将二维数组 转换成一维数组(cx = 每个直方中心点坐标)[[{cx:100},{}]]  
				}
			}
		},

		_vertical:{
			value:null                   //纵向
		},
		_vertical_right:{
			value:null                   //纵向(右侧)
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
		_globalInduce:{
			value:null                   //全局感应区
		},
		_induces:{
			value:null                   //感应区
		},

		_hasRight:{
			value:0                      //是否有右侧
		},
		_disX:{
			value:6                      //左、右的距离
		},
		_disY:{
			value:10                     //上、下的距离
		},
		_dis_line:{
			value:6                      //纵向最高的线与最高高度最小相差的像素 而横向最右边的小线与最宽宽度也是最小相差该像素
		},          
		_dis_graphs:{
			value:0                      //在图形中 由于考虑到圆本身的半径  实际图形中的左、下都必须预留的像素差   右、上预留的像素差的最小值也是此值
		},

		_verticalMaxH:{
			value:0                      //纵向最大的高
		},
		_verticalGraphsH:{
			value:0                      //最上面的第一条线到原点之间的高度
		},
		_verticalDrawH:{
			value:0                      //图形区域由于考虑到圆的半径 因此圆必须高出最下面_dis_graphs个像素 而此值代表最上面的第一条线到_dis_graphs之间的距离
		},
		_horizontalMaxW:{
			value:0                      //横向最大的宽
		},
		// _horizontalGraphsW:{
		// 	value:0                      //图形区域真正的宽(最右边的第一条线到原点之间的高度)
		// },
		// _horizontalDrawW:{
		// 	value:0                      //图形区域由于考虑到圆的半径 因此圆必须高出最右边_dis_graphs个像素
		// },
		_del:{
			value:0                      //当数据量过大时 减去的数据个数
		},
		_timeoutId:{
			value:0                      
		},
		_timeoutDelay:{
			value:100                    
		},
		_induceIndex:{
			value:-1
		},
		_baseNumber:{                    //基础值(原点)
			value:0
		},
		_baseNumberRight:{               //右侧基础值(原点)
			value:0
		}
	}

	S.extend(Widget,Base,{
		init:function(){
			var self = this
			
			self.set('_DataFrameFormat',self.DataExtend(self.get('_DataFrameFormat'), self.get('DataSource')))
			self.set('_hasRight',self.get('_DataFrameFormat').vertical.org.length == 2 ? 1 : 0)
			self.get('_DataFrameFormat').vertical.sections.push(DataSection.section(self.get('_DataFrameFormat').vertical.org[0]))
			self.set('_baseNumber', self.get('_DataFrameFormat').vertical.sections[0][0])
			if(self.get('_hasRight') == 1){
				self.get('_DataFrameFormat').vertical.sections.push(DataSection.section(self.get('_DataFrameFormat').vertical.org[1]))
				self.set('_baseNumberRight', self.get('_DataFrameFormat').vertical.sections[1][0])
				if(self.get('_DataFrameFormat').vertical.sections[1].length < 1){
					self.get('_DataFrameFormat').vertical.sections[1] = [0]
				}
			}
			
			self.get('_DataFrameFormat').graphs.groupCount = 1
			self.get('_DataFrameFormat').graphs.groups = self.get('_DataFrameFormat').vertical.org[0].length
			self._widget()
		},

		_widget:function(){
			var self = this
			self.set('element', new SVGElement('g')), self.get('element').set('class','widget')
			self.get('parent').appendChild(self.get('element').element)

			self.set('_vertical',new Vertical())
			self.set('_vertical_right',new Vertical())
			self.set('_horizontal',new Horizontal())
			self.set('_back',new Back())
			self.set('_graphs',new Graphs())
			self.get('_graphs').set('groupCount',self.get('_DataFrameFormat').graphs.groupCount)
			self.set('_infos',new Infos())
			self.set('_globalInduce', new GlobalInduce())
			self.set('_induces',new Graphs())
			
			self._trimVertical()
			var o = {
				parent : self.get('element'),
				data   : self.get('_DataFrameFormat').vertical.datas[0],
				font_fill : self.get('config').fills.normals[0],
				line_fill : self.get('config').fills.normals[0]
			}
			self.get('_vertical').init(o)
			self.get('_vertical').get('element').transformXY(self.get('_disX'), self.get('h') - self.get('_horizontal').get('h') - self.get('_disY'))

			if(self.get('_hasRight') == 1){
				self._trimVertical(1)
				var o = {
					parent : self.get('element'),
					id     : 'vertical_right',
					data   : self.get('_DataFrameFormat').vertical.datas[1],
					mode   : 2,
					font_fill : self.get('config').right.fills.normals[0],
					line_fill : self.get('config').right.fills.normals[0]
				}
				self.get('_vertical_right').init(o)
				self.get('_vertical_right').get('element').transformXY(self.get('w') - self.get('_disX') - self.get('_vertical_right').get('w'), self.get('h') - self.get('_horizontal').get('h') - self.get('_disY'))
			}
			
			self._trimGraphs()
			var o = {
				w      : self.get('_horizontalMaxW'),
				h      : self.get('_verticalMaxH'),
				parent : self.get('element'),
				data_hor : self.get('_DataFrameFormat').vertical.datas[0],
				h_ver    : self.get('_verticalMaxH'),
			}
			if(self.get('_hasRight') == 1){
				o.data_ver = [ { x:self.get('_horizontalMaxW') } ]
			}
			self.get('_back').init(o)
			self.get('_back').get('element').transformXY(self.get('_disX') + self.get('_vertical').get('w'), self.get('h') -  self.get('_horizontal').get('h') - self.get('_disY'))

			self.get('_DataFrameFormat').graphs.groupW = self._getGroupWidth()

			var o = {
				x     : self.get('_disX') + self.get('_vertical').get('w') + Global.N05,
				y     : self.get('h') -  self.get('_horizontal').get('h') - self.get('_disY') + Global.N05,
				w     : self.get('_horizontalMaxW'),
				h     : self.get('_verticalGraphsH'),
				config: self.get('config'),
				parent: self.get('element'),
				data  : Global.delArrUnPop(self.get('_DataFrameFormat').graphs.datas[0],self.get('_del')),
				hasRight:self.get('_hasRight'),
				// disX  : self._getGraphsDisX(),
				groupW: self.get('_DataFrameFormat').graphs.groupW
			}
			self.get('_graphs').widget(o)
			self.get('_graphs').get('element').transformXY(self.get('_disX') + self.get('_vertical').get('w') + Global.N05, self.get('h') -  self.get('_horizontal').get('h') - self.get('_disY') + Global.N05)

			self.get('_DataFrameFormat').graphs.infos =  self.get('_graphs').getInfos()
			self.get('_DataFrameFormat').graphs.info  =  Global.getChildsArr(self.get('_DataFrameFormat').graphs.infos)

			if(self.get('_hasRight') == 1){
				self._trimGraphsRight(1)
				var o = {
					data_right : self.get('_DataFrameFormat').graphs.datas[1]
				}
				self.get('_graphs').widget_right(o)
			}
			
			self._trimHorizontal()

			var o = {
				w      : self.get('_horizontalMaxW'),
				parent : self.get('element'),
				data   : self.get('_DataFrameFormat').horizontal.data,
				dis_left : self.get('_disX') + self.get('_vertical').get('w') - self.get('_disX')
			}
			if(self.get('_hasRight') == 1){
				// o.dis_right = self.get('_horizontalMaxW') + self.get('_vertical_right').get('w')
				o.dis_right = self.get('_horizontalMaxW') + 10
			}
			self.get('_horizontal').init(o)
			self.get('_horizontal').get('element').transformXY(self.get('_disX') + self.get('_vertical').get('w'), self.get('h') -  self.get('_horizontal').get('h') - self.get('_disY'))
			
			self.get('_infos').init({parent:self.get('element')})

			var o = {
				w     : self.get('w'),
				h     : self.get('h'),
				parent: self.get('element'),
				opacity : Global.N00001
			}
			self.get('_globalInduce').init(o)

			var o = {
				x     : self.get('_disX') + self.get('_vertical').get('w') + Global.N05,
				y     : self.get('h') -  self.get('_horizontal').get('h') - self.get('_disY') + Global.N05,
				w     : self.get('_horizontalMaxW'),
				h     : self.get('_verticalGraphsH'),
				config: self.get('config'),
				parent: self.get('element'),
				id    : 'induces',
				data  : Global.delArrUnPop(self.get('_DataFrameFormat').graphs.datas[0],self.get('_del')),
				isInduce   : 1,
				hasRight:self.get('_hasRight'),
				disX  : self._getGraphsDisX(),
				groupW: self.get('_DataFrameFormat').graphs.groupW
			}
			self.get('_induces').widget(o)
			if(self.get('_hasRight') == 1){
				var o = {
					data_right : self.get('_DataFrameFormat').graphs.datas[1]
				}
				self.get('_induces').widget_right(o)
			}
			self.get('_induces').get('element').on(EventType.OVER,function($o){self._overHandler($o)})
			self.get('_induces').get('element').on(EventType.OUT,function($o){self._outHandler($o)})
			self.get('_induces').get('element').transformXY(self.get('_disX') + self.get('_vertical').get('w') + Global.N05, self.get('h') -  self.get('_horizontal').get('h') - self.get('_disY') + Global.N05)

		},

		//换算纵向
		_trimVertical:function($i){
			var self = this
			var $i = $i ? $i : 0
			self.set('_verticalMaxH', self.get('h') - self.get('_disY') - self.get('_horizontal').get('h') - self.get('_disY'))
			self.set('_verticalGraphsH', self.get('_verticalMaxH') - self._getVerticalDisY($i))
			self.set('_verticalDrawH', self.get('_verticalGraphsH') - self.get('_dis_graphs'))
			var max = self.get('_DataFrameFormat').vertical.sections[$i][self.get('_DataFrameFormat').vertical.sections[$i].length - 1]
			var arr = self.get('_DataFrameFormat').vertical.sections[$i]
			var _baseNumber = $i == 0 ? self.get('_baseNumber') : self.get('_baseNumberRight')
			var tmpData = []
			for (var a = 0, al = arr.length; a < al; a++ ) {
				var y = -self.get('_dis_graphs') - (arr[a] - _baseNumber) / (max - _baseNumber) * self.get('_verticalDrawH')                                    
				y = isNaN(y) ? 0 : Global.ceil(y)                                                    
				tmpData[a] = { 'value':arr[a], 'y': y }
			}
			self.get('_DataFrameFormat').vertical.datas[$i] = tmpData
		},
		//获取纵向总高到第一条线之间的距离
		_getVerticalDisY:function($i){
			var self = this
			var $i = $i ? $i : 0
			var disMin = self.get('_dis_line')
			var disMax = 2 * self.get('_dis_line')
			var dis = disMin
			dis = disMin + self.get('_verticalMaxH') % self.get('_DataFrameFormat').vertical.sections[$i].length
			dis = dis > disMax ? disMax : dis
			return dis
		},
		//获取图形中每组的宽
		_getGroupWidth:function(){
			var self = this
			var _dis_line = 0
			var n = 0
			var disMin = _dis_line
			var disMax = 2 * _dis_line
			var dis = disMin
			var min = self.get('_graphs').getGroupMinW()
			var w = self.get('_horizontalMaxW') - disMin
			if (w % self.get('_DataFrameFormat').graphs.groups + disMin > disMax) {
				dis = disMax
			}else {
				dis = disMin + w % self.get('_DataFrameFormat').graphs.groups
			}
			w = self.get('_horizontalMaxW') - dis
			n = w / self.get('_DataFrameFormat').graphs.groups
			if (n < min) { n = min }
			return n
		},

		//换算横向
		_trimHorizontal:function(){
			var self = this
			var arr = Global.delArrUnPop(self.get('_DataFrameFormat').horizontal.org, self.get('_del'))
			var tmpData = []
		    for (var i = 0, l  = arr.length; i < l; i++ ) {
				tmpData.push( { value:arr[i], x: self.get('_DataFrameFormat').graphs.info[i].cx } )
			}
			self.get('_DataFrameFormat').horizontal.data = tmpData
		},

		//换算图形
		_trimGraphs:function($i){   
			var self = this 
			var $i = $i ? $i : 0  
			if(self.get('_hasRight') == 1){
				self.set('_horizontalMaxW', self.get('w') - self.get('_disX') - self.get('_vertical').get('w') - self.get('_vertical_right').get('w') - self.get('_disX'))
			}else{
				self.set('_horizontalMaxW', self.get('w') - self.get('_disX') - self.get('_vertical').get('w') - self.get('_disX'))
			}

			var max = self.get('_DataFrameFormat').vertical.sections[$i][self.get('_DataFrameFormat').vertical.sections[$i].length - 1]
			var arr = self.get('_DataFrameFormat').vertical.org[$i]
			var tmpData = []
			for (var a = 0, al = arr.length; a < al; a++ ) {
				var h = (arr[a] - self.get('_baseNumber')) / (max - self.get('_baseNumber')) * self.get('_verticalGraphsH')  
				!tmpData[a] ? tmpData[a] = [] : ''                                           
				tmpData[a][0] = {'value':arr[a], 'height':h} 
			}
			self.get('_DataFrameFormat').graphs.datas[0] = tmpData
			if (self.get('_DataFrameFormat').graphs.groups * self.get('_graphs').getGroupMinW() > self.get('_horizontalMaxW') - self.get('_dis_line')) {
				self.set('_del', Global.ceil((self.get('_DataFrameFormat').graphs.groups * self.get('_graphs').getGroupMinW() - (self.get('_horizontalMaxW') - self.get('_dis_line'))) / self.get('_graphs').getGroupMinW()))
				var tmpData = Global.delArrUnPop(self.get('_DataFrameFormat').graphs.datas[0], self.get('_del'))
				self.get('_DataFrameFormat').graphs.groups = tmpData.length
			}
		},
		_trimGraphsRight:function($i) {
			var self = this 
			var $i = $i ? $i : 0  
			var max = self.get('_DataFrameFormat').vertical.sections[$i][self.get('_DataFrameFormat').vertical.sections[$i].length - 1]
			var arr = Global.delArrUnPop(self.get('_DataFrameFormat').vertical.org[$i], self.get('_del'))
			var tmpData = []
			tmpData[0] = []
			for (var a = 0, al = arr.length; a < al; a++ ) {
				var y = - (arr[a] - self.get('_baseNumberRight')) / (max - self.get('_baseNumberRight')) * self.get('_verticalGraphsH')
				y = isNaN(y) ? 0 : Global.ceil(y)
				tmpData[0][a] = {'value':arr[a], x:self.get('_DataFrameFormat').graphs.info[a].cx, y:y}
			}
			self.get('_DataFrameFormat').graphs.datas[1] = tmpData
		},

		//每两个点之间的距离
		_getGraphsDisX:function(){
			var self = this
			return self.get('_horizontalMaxW') / (self.get('_DataFrameFormat').horizontal.data.length)
		},

		_overHandler:function($o){
			clearTimeout(this.get('_timeoutId'));
			var index = $o.histogram.index
			var id = $o.histogram.id
			if (index + 1 >= this.get('_DataFrameFormat').vertical.org[id].length - this.get('_del') && index + 1 < this.get('_DataFrameFormat').vertical.org[id].length) {
					index = index + this.get('_del')
			}
 			
 			var fills_over = [$o.histogram.fill_over,$o.line.fill_over]
			var data = []
			for (var a = 0, al = this.get('_DataFrameFormat').vertical.names.length; a < al; a++ ) {
				data[a] = []
				var o = { }
				o.content = this.get('_DataFrameFormat').vertical.names[a], o.fill = fills_over[a], o.font = '微软雅黑',o.ver_align = 3
				data[a].push(o)
				o = { }
				o.content = this.get('_DataFrameFormat').vertical.org[a][index], o.fill = fills_over[a], o.font = 'Tahoma',o.ver_align = 1
				data[a].push(o)
			}
			if ($o.layout_order == 1) {
				Global.unshiftIndexArray(data,1)
			}

			var o = {
				w    : this.get('w'),
				h    : this.get('h'),
				parent : this.get('element'),
				
				info:{
					x    : Number($o.histogram.cx) + Number(this.get('_graphs').get('element').get('_x')),
					y    : Number(this.get('_graphs').get('element').get('_y')) - Number($o.histogram.h),
					data : data,
					base_fill : $o.histogram.fill_over
				},
				// light:{
				// 	is   : 1,
				// 	x    : Number(this.get('_graphs').get('element').get('_x')) + Number($o.line.x),
				// 	y    : Number(this.get('_graphs').get('element').get('_y')) + Number($o.line.y),
				// 	fill : $o.line.fill_over
				// },
				hLine:{
					is   : 1,
					x    : Number($o.histogram.cx) + Number(this.get('_graphs').get('element').get('_x')),
					y    : this.get('_graphs').get('element').get('_y')
				}
			}
			if($o.layout_order == 1){
				o.info.x = Number($o.line.x) +  Number(this.get('_graphs').get('element').get('_x'))
				o.info.y = Number($o.line.y) +  Number(this.get('_graphs').get('element').get('_y')) - 7
			}

			var pre = this.get('_DataFrameFormat').horizontal.org[index]
			var content = this.get('_DataFrameFormat').horizontal.name + pre

			o.hInfo = {
				is   : 1,
				x    : Number($o.histogram.cx) + Number(this.get('_graphs').get('element').get('_x')),
				y    : this.get('_graphs').get('element').get('_y'),
				content : content
			}
			var other = []
			other[0] = $o.line
			other[0].x = Number($o.line.x) +  Number(this.get('_graphs').get('element').get('_x'))
			other[0].y = Number($o.line.y) +  Number(this.get('_graphs').get('element').get('_y'))
			o.other = {
				is   : 1,
				os   : other
			}
			this.get('_infos').update(o)

			if(this.get('_induceIndex') != -1){
				this.get('_graphs').induce({index:this.get('_induceIndex'),id:id},false)
			}
			this.set('_induceIndex',$o.histogram.index)
			this.get('_graphs').induce({index:$o.histogram.index,id:id},true)
		},
		_outHandler:function($o){
			var self = this
			this.set('_timeoutId', setTimeout(function(){self._outTimeout()}, self.get('_timeoutDelay')))
			this.get('_graphs').induce({index:$o.index,id:$o.id},false)
			this.set('_induceIndex',-1)
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
			// DataFrameFormat.info = DataSource.info
			DataFrameFormat.vertical.names = DataSource.vertical.names
			DataFrameFormat.vertical.org = DataSource.vertical.data
			// DataFrameFormat.horizontal.name = DataSource.horizontal.name
			DataFrameFormat.horizontal.org = DataSource.horizontal.data

			return DataFrameFormat
		}
	});

	return Widget;

	}, {
	    requires:['base','node','../../../pub/utils/global','../../../pub/utils/datasection','../../../pub/utils/svgelement',
	    		  '../../../pub/views/vertical','../../../pub/views/horizontal','../../../pub/views/back','../../../pub/views/globalinduce','../../../pub/views/infos/infos','../../../pub/models/eventtype','./graphs'

	    ]
	}
);
KISSY.add('brix/gallery/charts/js/e/integrate2/control/configparse',function(S,Base,Node,BarConfigParse,Style1ConfigParse){
	var $ = Node.all

	function ConfigParse(){
		
		var self = this

		ConfigParse.superclass.constructor.apply(self,arguments);
	}

	ConfigParse.ATTRS = {
		o:{
			value:{
				v:'1.0',

				bar:{},

				layout:{},

				infos:{
			        xAxis:{
					    mode:0               //模式[0 = 显示两个点(1:00-2:00) | 1 = 显示一个点(2013-03-08)]
						  }
			          }
			      }
		}
	}

	S.extend(ConfigParse,Base,{
		parse:function($data,$type){
			var self = this

			var o = S.clone(self.o) 
			var type = $type ? $type : 'xml'
			if(type == 'xml'){
				o = self._xml($data)
			}
			return o
		},
		_xml:function($data){
			var self = this

			var o = S.clone(self.get('o')) 
			var data = String($data)
			var domParser = new DOMParser();
			var xmlDoc = domParser.parseFromString(data, 'text/xml');

			var __data = xmlDoc.getElementsByTagName("data")[0]
			if(__data){
				o.v = __data.getAttribute('v') && String(__data.getAttribute('v')) ? String(__data.getAttribute('v')) : o.v

				var s = ''
				if(__data.getElementsByTagName("bar")[0]){
					 s = new XMLSerializer().serializeToString(__data.getElementsByTagName("bar")[0])
				}
				s = s.replace('<bar', "<data")
				s = s.replace('bar>', "data>")
				o.bar = new BarConfigParse().parse(s)

				var s = ''
				if(__data.getElementsByTagName("layout")[0]){
					s = new XMLSerializer().serializeToString(__data.getElementsByTagName("layout")[0])
				}
				s = s.replace('<layout', "<data")
				s = s.replace('layout>', "data>")
				o.layout = new Style1ConfigParse().parse(s)

				var __infos = __data.getElementsByTagName("infos")[0]
				if(__infos){
					var __x_axis = __infos.getElementsByTagName("x_axis")[0]
					if(__x_axis){
						o.infos.xAxis.mode = __x_axis.getAttribute('mode') || __x_axis.getAttribute('mode') == 0 ? Number(__x_axis.getAttribute('mode')) : o.infos.xAxis.mode
					}
				}
			}else{
				o.bar = new BarConfigParse().parse('')
				o.layout = new Style1ConfigParse().parse('')
			}
			return o
		}
	});

	return ConfigParse;

	}, {
	    requires:['base','node','../../../pub/controls/bar/configparse','../../../pub/controls/layouts/style1/configparse']
	}
);
KISSY.add('brix/gallery/charts/js/e/integrate2/main',function(S,Base,Global,SVGElement,DataParse,ConfigParse,Widget){
	function Main(){

		var self = this

		/*
			arguments:

			  o:{
				parent   :''     //SVGElement
				w        :100    //chart 宽
				h        :100    //chart 高
				config   :''     //图表配置
				data     :''     //图表数据  
			  }

		 */
		Main.superclass.constructor.apply(self,arguments);

		self.init()
	}

	Main.ATTRS = {
		_main:{
			value:null
		},
		_config:{                //图表配置   经过ConfigParse.parse
			value:{}
		},
		_DataSource:{
			value:{}             //图表数据源 经过DataParse.parse
		}
	}

	S.extend(Main,Base,{
		init:function(){
			var self = this
			
			self.set('_DataSource', new DataParse().parse(self.get('data'))) 
			self.set('_config', new ConfigParse().parse(self.get('config'))) 

			self._widget()	
		},

		_widget:function(){
			var self = this
			
			self.set('_main',new SVGElement('g'))
			self.get('_main').attr({'class':'main'});
			self.get('parent').appendChild(self.get('_main').element)
			self.get('_main').transformXY(Global.N05,Global.N05)

			var o = {}
			o.parent = self.get('_main')                       //SVGElement
			o.w = self.get('w')                                //chart 宽
			o.h = self.get('h')                                //chart 高
			o.DataSource = self.get('_DataSource')             //图表数据源
			o.config = self.get('_config')                     //图表配置

			new Widget(o)
		}
		
	});

	return Main;

	}, {
	    requires:['base','../../pub/utils/global','../../pub/utils/svgelement','../../pub/controls/bar/dataparse','./control/configparse','./view/widget']
	}
);
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
KISSY.add('brix/gallery/charts/js/e/integrate3/control/configparse',function(S,Base,Node,BarConfigParse,Style1ConfigParse){
	var $ = Node.all

	function ConfigParse(){
		
		var self = this

		ConfigParse.superclass.constructor.apply(self,arguments);
	}

	ConfigParse.ATTRS = {
		o:{
			value:{
				v:'1.0',

				bar:{},

				layout:{},

				infos:{
			        xAxis:{
					    mode:0               //模式[0 = 显示两个点(1:00-2:00) | 1 = 显示一个点(2013-03-08)]
						  }
			          }
			      }
		}
	}

	S.extend(ConfigParse,Base,{
		parse:function($data,$type){
			var self = this

			var o = S.clone(self.o) 
			var type = $type ? $type : 'xml'
			if(type == 'xml'){
				o = self._xml($data)
			}
			return o
		},
		_xml:function($data){
			var self = this

			var o = S.clone(self.get('o')) 
			var data = String($data)
			var domParser = new DOMParser();
			var xmlDoc = domParser.parseFromString(data, 'text/xml');

			var __data = xmlDoc.getElementsByTagName("data")[0]
			if(__data){
				o.v = __data.getAttribute('v') && String(__data.getAttribute('v')) ? String(__data.getAttribute('v')) : o.v

				var s = ''
				if(__data.getElementsByTagName("bar")[0]){
					 s = new XMLSerializer().serializeToString(__data.getElementsByTagName("bar")[0])
				}
				s = s.replace('<bar', "<data")
				s = s.replace('bar>', "data>")
				o.bar = new BarConfigParse().parse(s)

				var s = ''
				if(__data.getElementsByTagName("layout")[0]){
					s = new XMLSerializer().serializeToString(__data.getElementsByTagName("layout")[0])
				}
				s = s.replace('<layout', "<data")
				s = s.replace('layout>', "data>")
				o.layout = new Style1ConfigParse().parse(s)

				var __infos = __data.getElementsByTagName("infos")[0]
				if(__infos){
					var __x_axis = __infos.getElementsByTagName("x_axis")[0]
					if(__x_axis){
						o.infos.xAxis.mode = __x_axis.getAttribute('mode') || __x_axis.getAttribute('mode') == 0 ? Number(__x_axis.getAttribute('mode')) : o.infos.xAxis.mode
					}
				}
			}else{
				o.bar = new BarConfigParse().parse('')
				o.layout = new Style1ConfigParse().parse('')
			}
			return o
		}
	});

	return ConfigParse;

	}, {
	    requires:['base','node','../../../pub/controls/bar/configparse','../../../pub/controls/layouts/style1/configparse']
	}
);
KISSY.add('brix/gallery/charts/js/e/integrate3/main',function(S,Base,Global,SVGElement,DataParse,ConfigParse,Widget){
	function Main(){

		var self = this

		/*
			arguments:

			  o:{
				parent   :''     //SVGElement
				w        :100    //chart 宽
				h        :100    //chart 高
				config   :''     //图表配置
				data     :''     //图表数据  
			  }

		 */
		Main.superclass.constructor.apply(self,arguments);

		self.init()
	}

	Main.ATTRS = {
		_main:{
			value:null
		},
		_config:{                //图表配置   经过ConfigParse.parse
			value:{}
		},
		_DataSource:{
			value:{}             //图表数据源 经过DataParse.parse
		}
	}

	S.extend(Main,Base,{
		init:function(){
			var self = this
			
			self.set('_DataSource', new DataParse().parse(self.get('data'))) 
			self.set('_config', new ConfigParse().parse(self.get('config'))) 
			self.set('_config', self._defaultConfig(self.get('_config')))

			self._widget()	
		},

		_widget:function(){
			var self = this
			
			self.set('_main',new SVGElement('g'))
			self.get('_main').attr({'class':'main'});
			self.get('parent').appendChild(self.get('_main').element)
			self.get('_main').transformXY(Global.N05,Global.N05)

			var o = {}
			o.parent = self.get('_main')                       //SVGElement
			o.w = self.get('w')                                //chart 宽
			o.h = self.get('h')                                //chart 高
			o.DataSource = self.get('_DataSource')             //图表数据源
			o.config = self.get('_config')                     //图表配置

			new Widget(o)
		},

		_defaultConfig:function($config){
			var config = $config
			config.bar.fills = [[ { normal:'#458AE6', over:'#135EBF' } ], [ { normal:'#94CC5C', over:'#78A64B' } ]]
			return config
		}
		
	});

	return Main;

	}, {
	    requires:['base','../../pub/utils/global','../../pub/utils/svgelement','../../pub/controls/bar/dataparse','./control/configparse','./view/widget']
	}
);
KISSY.add('brix/gallery/charts/js/e/integrate3/view/widget',function(S,Base,Node,Global,SVGElement,Infos,EventType,Core,Layout){
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
			var  o = {
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
			var  o = {
				w      : self.get('w'),
				h      : self.get('h'),  
				data   : self._getPieInfos(),
				parent : self.get('element'),
				config     : self.get('config').layout,         //图表配置
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

			var tmp = { }
			arr.push(tmp)
			
			tmp.pie = { data:[], fills:[] }
			tmp.info = []
			
			var infoIndex = 0
			
			//var o:Object = { }
			var $arr = data.vertical.org
			var totals = []
			for (var a = 0, al = $arr.length; a < al; a++ ) {
				var o = $arr[a]
				
				for (var b = 0, bl = o.data.length; b < bl; b++ ) {
					tmp.pie.data.push(o.data[b].total)
					tmp.pie.fills.push(config.fills[a][b].normal)
					
					var infoObj = { }
					infoObj = { content:o.data[b].signName, bold:0, fill:config.fills[a][b].over, family:'微软雅黑', size:12, sign: { has:1, trim:1, fill:config.fills[a][b].normal }}
					!tmp.info[infoIndex] ? tmp.info[infoIndex] = [] : ''
					tmp.info[infoIndex].push(infoObj)
					
					totals.push(o.data[b].total)
				}
				infoIndex++
			}
			var scales = Global.getArrScales(totals)
			for (var c = 0, cl = infoIndex; c < cl; c++ ) {
				tmp.info[c][0].content = tmp.info[c][0].content + scales[c] + '%'
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
			// o = { }
			// o.content = this.get('_DataFrameFormat').vertical.name + Global.numAddSymbol(this.get('_DataFrameFormat').vertical.max[id][index]), o.bold = 0, o.fill = '#666666', o.family = '微软雅黑', o.ver_align = 1
			// data[1] = []
			// data[1].push(o)
			var dataID = 1
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
KISSY.add('brix/gallery/charts/js/e/integrate4/control/configparse',function(S,Base,Node,LineConfigParse,Style1ConfigParse){
	var $ = Node.all

	function ConfigParse(){
		
		var self = this

		ConfigParse.superclass.constructor.apply(self,arguments);
	}

	ConfigParse.ATTRS = {
		o:{
			value:{
				v:'1.0',

				line:{},

				layout:{},

				infos:{
			        xAxis:{
					    mode:0               //模式[0 = 显示两个点(1:00-2:00) | 1 = 显示一个点(2013-03-08)]
						  }
			          }
			      }
		}
	}

	S.extend(ConfigParse,Base,{
		parse:function($data,$type){
			var self = this

			var o = S.clone(self.o) 
			var type = $type ? $type : 'xml'
			if(type == 'xml'){
				o = self._xml($data)
			}
			return o
		},
		_xml:function($data){
			var self = this

			var o = S.clone(self.get('o')) 
			var data = String($data)
			var domParser = new DOMParser();
			var xmlDoc = domParser.parseFromString(data, 'text/xml');

			var __data = xmlDoc.getElementsByTagName("data")[0]
			if(__data){
				o.v = __data.getAttribute('v') && String(__data.getAttribute('v')) ? String(__data.getAttribute('v')) : o.v

				var s = ''
				if(__data.getElementsByTagName("line")[0]){
					 s = new XMLSerializer().serializeToString(__data.getElementsByTagName("line")[0])
				}
				s = s.replace('<line', "<data")
				s = s.replace('line>', "data>")
				o.line = new LineConfigParse().parse(s)

				var s = ''
				if(__data.getElementsByTagName("layout")[0]){
					s = new XMLSerializer().serializeToString(__data.getElementsByTagName("layout")[0])
				}
				s = s.replace('<layout', "<data")
				s = s.replace('layout>', "data>")
				o.layout = new Style1ConfigParse().parse(s)

				var __infos = __data.getElementsByTagName("infos")[0]
				if(__infos){
					var __x_axis = __infos.getElementsByTagName("x_axis")[0]
					if(__x_axis){
						o.infos.xAxis.mode = __x_axis.getAttribute('mode') || __x_axis.getAttribute('mode') == 0 ? Number(__x_axis.getAttribute('mode')) : o.infos.xAxis.mode
					}
				}
			}else{
				o.line = new LineConfigParse().parse('')
				o.layout = new Style1ConfigParse().parse('')
			}
			return o
		}
	});

	return ConfigParse;

	}, {
	    requires:['base','node','../../../pub/controls/line/configparse','../../../pub/controls/layouts/style1/configparse']
	}
);
KISSY.add('brix/gallery/charts/js/e/integrate4/main',function(S,Base,Global,SVGElement,DataParse,ConfigParse,Widget){
	function Main(){

		var self = this

		/*
			arguments:

			  o:{
				parent   :''     //SVGElement
				w        :100    //chart 宽
				h        :100    //chart 高
				config   :''     //图表配置
				data     :''     //图表数据  
			  }

		 */
		Main.superclass.constructor.apply(self,arguments);

		self.init()
	}

	Main.ATTRS = {
		_main:{
			value:null
		},
		_config:{                //图表配置   经过ConfigParse.parse
			value:{}
		},
		_DataSource:{
			value:{}             //图表数据源 经过DataParse.parse
		}
	}

	S.extend(Main,Base,{
		init:function(){
			var self = this
			
			self.set('_DataSource', new DataParse().parse(self.get('data'))) 
			self.set('_config', new ConfigParse().parse(self.get('config'))) 
			self.set('_config', self._defaultConfig(self.get('_config')))

			self._widget()	
		},

		_widget:function(){
			var self = this
			
			self.set('_main',new SVGElement('g'))
			self.get('_main').attr({'class':'main'});
			self.get('parent').appendChild(self.get('_main').element)
			self.get('_main').transformXY(Global.N05,Global.N05)

			var o = {}
			o.parent = self.get('_main')                       //SVGElement
			o.w = self.get('w')                                //chart 宽
			o.h = self.get('h')                                //chart 高
			o.DataSource = self.get('_DataSource')             //图表数据源
			o.config = self.get('_config')                     //图表配置

			new Widget(o)
		},

		_defaultConfig:function($config){
			var self = this
			var config = $config
			config.line.node = 1
			config.line.area = 1
			// config.line.shape = 1
			config.line.areaMode = 1
			config.line.area_opacity = [0.4, 0.4]
			config.line.isLine = 1
			config.line.fills = self._changeConfig(config.line.fills)
		//	config.line.fills = [[ { normal:'#94CC5C', over:'#78A64B' }, { normal:'#458AE6', over:'#135EBF' } ]]
			config.line.data = {mode:1}
			return config
		},
		

		_changeConfig:function($fills){
			var arr = []
			arr[0] = []

			var normals = ['#458AE6', '#39BCC0', '#5BCB8A', '#94CC5C', '#C3CC5C', '#E6B522', '#E68422']
			var overs = ['#135EBF', '#2E9599', '#36B26A', '#78A64B', '#9CA632', '#BF9E39', '#BF7C39']
			if($fills.normals.join(" ") == normals.join(" ") && $fills.overs.join(" ") == overs.join(" ")){
				arr = [[ { normal:'#94CC5C', over:'#78A64B' }, { normal:'#458AE6', over:'#135EBF' } ]]
				return arr
			}

			for(var a = 0, al = $fills.normals.length; a < al; a++){
				var o = {normal:$fills.normals[a], over:$fills.overs[a]}
				arr[0].push(o)
			}
			return arr
		}
	});

	return Main;

	}, {
	    requires:['base','../../pub/utils/global','../../pub/utils/svgelement','../../pub/controls/bar/dataparse','./control/configparse','./view/widget']
	}
);
KISSY.add('brix/gallery/charts/js/e/integrate4/view/widget',function(S,Base,Node,Global,SVGElement,Infos,EventType,Core,Layout){
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
					names:[],                //名称集合[维度1---1：,,维度1---3：]
					org:[],                  //原始二维数据[[配置数据中每个队列第一个集合],[],[]]
					section:[],              //分段之后数据[200, 400, 600, 800, 1000, 1200, 1400, 1600]
					data:[]                  //转换坐标后的数据  =>Vertical.data、Back.data_hor
				},
				horizontal:{             //横轴
					name:'',                 //名称[维度2]
					org:'',                  //原始数据[0.05,0.1,0.15,0.2,...,2.55]
					data:[]                  //转换坐标后的数据  =>Horizontal.data
				},
				graphs:{                 //图形
					disX:59,                 //每两个点之间的距离
					data:[]                  //转换坐标后的数据
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

		 	self.set('_top_h', 70)
		 	self.set('_core_y', self.get('_top_h'))
		 	self.set('_core_h', self.get('h') - self.get('_top_h') - 12 - 6)

			self.set('element', new SVGElement('g')), self.get('element').set('class','widget')
			self.get('parent').appendChild(self.get('element').element)

			self.set('_core',new Core({parent:self.get('element')}))
			var  o = {
				gx     : 0,                                     //全局坐标 应用于graphs鼠标感应计算
				gy     : self.get('_core_y'),                    
				w      : self.get('w'),
				h      : self.get('_core_h'),
				parent : self.get('element'),
				DataSource : self.get('DataSource'),            //图表数据源
				config     : self.get('config').line            //图表配置
			}
			self.get('_core').get('element').on(EventType.COMPLETE,function(){self._completeHandler()})
			self.get('_core').get('element').on(EventType.OVER,function($o){self._overHandler($o)})
			self.get('_core').get('element').on(EventType.OUT,function($o){self._outHandler($o)})
			self.get('_core').widget(o)
			self.get('_core').get('element').transformY(self.get('_core_y'))

			self.set('_layout',new Layout())
			var  o = {
				w      : self.get('w'),
				h      : self.get('h'),  
				data   : self._getPieInfos(),
				parent : self.get('element'),
				config     : self.get('config').layout,         //图表配置
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
			var config = self.get('config').line
			var arr = []

			var $arr = data.vertical.org
			for (var a = 0, al = $arr.length; a < al; a++ ) {
				var o = $arr[a]
				var tmp = { }
				tmp.pie = { data:[], fills:[] }
				tmp.info = []
				var infoObj = { content:o.name, bold:1, fill:'#333333', family:'微软雅黑', ver_align:1, size:12 }
				var infoIndex = 0
				// tmp.info[infoIndex] = []
				// tmp.info[infoIndex].push(infoObj)
				
				var totals = []
				for (var b = 0, bl = o.data.length; b < bl; b++ ) {
					tmp.pie.data.push(o.data[b].total)
					tmp.pie.fills.push(config.fills[a][b].normal)

					infoObj = { content:o.data[b].signName, bold:0, fill:config.fills[a][b].over, family:'微软雅黑', size:12, sign: { has:1, trim:1, fill:config.fills[a][b].normal }}
					!tmp.info[infoIndex] ? tmp.info[infoIndex] = [] : ''
					tmp.info[infoIndex].push(infoObj)
					
					totals.push(o.data[b].total)
					infoIndex++
				}
				
				var scales = Global.getArrScales(totals)
				infoIndex = 0
				for (var c = 0, cl = o.data.length; c < cl; c++ ) {
					tmp.info[infoIndex][0].content = tmp.info[infoIndex][0].content + scales[c] + '%'
					infoIndex++
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
			id = 0

			var x = $o.x
			var y = $o.y
			var dx = $o.dx
			var dy = $o.dy
			var base_fill = $o.fill_over

			var data = []
			data[0] = []
			var o = { }
			o.content = this.get('_DataFrameFormat').vertical.org[id].name, o.bold = 1, o.fill = '#333333', o.size = 14, o.family = '微软雅黑', o.ver_align = 1
			data[0].push(o)
			// o = { }
			// o.content = this.get('_DataFrameFormat').vertical.name + Global.numAddSymbol(this.get('_DataFrameFormat').vertical.max[id][index]), o.bold = 0, o.fill = '#666666', o.family = '微软雅黑', o.ver_align = 1
			// data[1] = []
			// data[1].push(o)
			var dataID = 1
			var values = 0
			for (var a = 0, al = this.get('_DataFrameFormat').vertical.org[id].data.length; a < al; a++ ) {
				o = { }
				var fills = this.get('config').line.fills
				var fill_normal = fills[id][a] && fills[id][a].normal ? fills[id][a].normal : '#000000'
				var fill_over = fills[id][a] && fills[id][a].over ? fills[id][a].over : '#000000'
 				o.content = this.get('_DataFrameFormat').vertical.org[id].data[a].name + Global.numAddSymbol(this.get('_DataFrameFormat').vertical.org[id].data[a].data[$o.id]), o.bold = 0, o.fill = fill_over, o.family = '微软雅黑', o.hor_align = 2, o.sign = {has:1,trim:1,fill:fill_normal }
				data[dataID] = []
				data[dataID].push(o)
				dataID++

				values = Global.CountAccuracy.add(values, Number(this.get('_DataFrameFormat').vertical.org[id].data[a].data[$o.id]))
			}
			data[0][0].content += Global.numAddSymbol(values)

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
				light:{
					is   : 1,
					x    : x,
					y    : y,
					fill : base_fill
				},
				hLine:{
					is   : 0,
					x    : x,
					y    : dy,
				}
			}
			var pre = this.get('_DataFrameFormat').horizontal.names[$o.id] ? this.get('_DataFrameFormat').horizontal.names[$o.id] : ''
			var next =  this.get('_DataFrameFormat').horizontal.names[$o.id + 1] ? this.get('_DataFrameFormat').horizontal.names[$o.id + 1] : this.get('_DataFrameFormat').horizontal.names[0]
			var content = this.get('_DataFrameFormat').horizontal.name + pre + ' - ' + next
			if (this.get('config').infos.xAxis.mode == 1) {
				content = this.get('_DataFrameFormat').horizontal.name + pre
			}

			o.hInfo = {
				is   : 1,
				x    : x,
				y    : dy,
				y1   : 6,
				content : content
			}
			o.other = {
				is   : 1,
				os   : $o.other
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
	    requires:['base','node','../../../pub/utils/global','../../../pub/utils/svgelement','../../../pub/views/infos/infos','../../../pub/models/eventtype','../../../pub/views/line/core','../../../pub/views/layouts/style1/main'
	    ]
	}
);
KISSY.add('brix/gallery/charts/js/e/integrate5/control/configparse',function(S,Base,Node,LineConfigParse,Style1ConfigParse){
	var $ = Node.all

	function ConfigParse(){
		
		var self = this

		ConfigParse.superclass.constructor.apply(self,arguments);
	}

	ConfigParse.ATTRS = {
		o:{
			value:{
				v:'1.0',

				line:{},

				layout:{},

				infos:{
			        xAxis:{
					    mode:0               //模式[0 = 显示两个点(1:00-2:00) | 1 = 显示一个点(2013-03-08)]
						  }
			          }
			    }
		}
	}

	S.extend(ConfigParse,Base,{
		parse:function($data,$type){
			var self = this

			var o = S.clone(self.o) 
			var type = $type ? $type : 'xml'
			if(type == 'xml'){
				o = self._xml($data)
			}
			return o
		},
		_xml:function($data){
			var self = this

			var o = S.clone(self.get('o')) 
			var data = String($data)
			var domParser = new DOMParser();
			var xmlDoc = domParser.parseFromString(data, 'text/xml');

			var __data = xmlDoc.getElementsByTagName("data")[0]
			if(__data){
				o.v = __data.getAttribute('v') && String(__data.getAttribute('v')) ? String(__data.getAttribute('v')) : o.v

				var s = ''
				if(__data.getElementsByTagName("line")[0]){
					 s = new XMLSerializer().serializeToString(__data.getElementsByTagName("line")[0])
				}
				s = s.replace('<line', "<data")
				s = s.replace('line>', "data>")
				o.line = new LineConfigParse().parse(s)

				var s = ''
				if(__data.getElementsByTagName("layout")[0]){
					s = new XMLSerializer().serializeToString(__data.getElementsByTagName("layout")[0])
				}
				s = s.replace('<layout', "<data")
				s = s.replace('layout>', "data>")
				o.layout = new Style1ConfigParse().parse(s)
				var __infos = __data.getElementsByTagName("infos")[0]
				if(__infos){
					var __x_axis = __infos.getElementsByTagName("x_axis")[0]
					if(__x_axis){
						o.infos.xAxis.mode = __x_axis.getAttribute('mode') || __x_axis.getAttribute('mode') == 0 ? Number(__x_axis.getAttribute('mode')) : o.infos.xAxis.mode
					}
				}
			}else{
				o.line = new LineConfigParse().parse('')
				o.layout = new Style1ConfigParse().parse('')
			}
			return o
		}
	});

	return ConfigParse;

	}, {
	    requires:['base','node','../../../pub/controls/line/configparse','../../../pub/controls/layouts/style1/configparse']
	}
);
KISSY.add('brix/gallery/charts/js/e/integrate5/main',function(S,Base,Global,SVGElement,DataParse,ConfigParse,Widget){
	function Main(){

		var self = this

		/*
			arguments:

			  o:{
				parent   :''     //SVGElement
				w        :100    //chart 宽
				h        :100    //chart 高
				config   :''     //图表配置
				data     :''     //图表数据  
			  }

		 */
		Main.superclass.constructor.apply(self,arguments);

		self.init()
	}

	Main.ATTRS = {
		_main:{
			value:null
		},
		_config:{                //图表配置   经过ConfigParse.parse
			value:{}
		},
		_DataSource:{
			value:{}             //图表数据源 经过DataParse.parse
		}
	}

	S.extend(Main,Base,{
		init:function(){
			var self = this
			
			self.set('_DataSource', new DataParse().parse(self.get('data'))) 
			self.set('_config', new ConfigParse().parse(self.get('config'))) 

			self.set('_config', self._defaultConfig(self.get('_config')))

			self._widget()	
		},

		_widget:function(){
			var self = this
			
			self.set('_main',new SVGElement('g'))
			self.get('_main').attr({'class':'main'});
			self.get('parent').appendChild(self.get('_main').element)
			self.get('_main').transformXY(Global.N05,Global.N05)

			var o = {}
			o.parent = self.get('_main')                       //SVGElement
			o.w = self.get('w')                                //chart 宽
			o.h = self.get('h')                                //chart 高
			o.DataSource = self.get('_DataSource')             //图表数据源
			o.config = self.get('_config')                     //图表配置

			new Widget(o)
		},

		_defaultConfig:function($config){
			var self = this
			var config = $config
			config.line.node = 1
			config.line.area = 1
			// config.line.shape = 1
			// config.line.areaMode = 1
			if(config.line.isArea_opacity == 0){
				config.line.area_opacity = [0.4, 0.4]
			}
			config.line.isLine = 1
			if(config.line.fills.isDefault == 1){
				config.line.fills = [[ { normal:'#458AE6', over:'#135EBF' }, { normal:'#999999', over:'#666666' } ]]
			}else{
				config.line.fills = self.changeColor(config.line.fills)
			}
			// config.line.fills = [[ { normal:'#458AE6', over:'#135EBF' }, { normal:'#999999', over:'#666666' } ]]
			return config
		},
		
		changeColor:function ($fills){
			var arr = []
			arr[0] = []
			
			for(var a = 0, al = $fills.normals.length; a < al; a++){
				var o = {normal:$fills.normals[a], over:$fills.overs[a]}
				arr[0].push(o)
			}
			return arr
		}
	});

	return Main;

	}, {
	    requires:['base','../../pub/utils/global','../../pub/utils/svgelement','../../pub/controls/bar/dataparse','./control/configparse','./view/widget']
	}
);
KISSY.add('brix/gallery/charts/js/e/integrate5/view/widget',function(S,Base,Node,Global,SVGElement,Infos,EventType,Core,Layout){
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
					names:[],                //名称集合[维度1---1：,,维度1---3：]
					org:[],                  //原始二维数据[[配置数据中每个队列第一个集合],[],[]]
					section:[],              //分段之后数据[200, 400, 600, 800, 1000, 1200, 1400, 1600]
					data:[]                  //转换坐标后的数据  =>Vertical.data、Back.data_hor
				},
				horizontal:{             //横轴
					name:'',                 //名称[维度2]
					org:'',                  //原始数据[0.05,0.1,0.15,0.2,...,2.55]
					data:[]                  //转换坐标后的数据  =>Horizontal.data
				},
				graphs:{                 //图形
					disX:59,                 //每两个点之间的距离
					data:[]                  //转换坐标后的数据
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

		 	self.set('_top_h', 70)
		 	self.set('_core_y', self.get('_top_h'))
		 	self.set('_core_h', self.get('h') - self.get('_top_h') - 12 - 6)

			self.set('element', new SVGElement('g')), self.get('element').set('class','widget')
			self.get('parent').appendChild(self.get('element').element)

			self.set('_core',new Core({parent:self.get('element')}))
			var  o = {
				gx     : 0,                                     //全局坐标 应用于graphs鼠标感应计算
				gy     : self.get('_core_y'),                    
				w      : self.get('w'),
				h      : self.get('_core_h'),
				parent : self.get('element'),
				DataSource : self.get('DataSource'),            //图表数据源
				config     : self.get('config').line            //图表配置
			}
			self.get('_core').get('element').on(EventType.COMPLETE,function(){self._completeHandler()})
			self.get('_core').get('element').on(EventType.OVER,function($o){self._overHandler($o)})
			self.get('_core').get('element').on(EventType.OUT,function($o){self._outHandler($o)})
			self.get('_core').widget(o)
			self.get('_core').get('element').transformY(self.get('_core_y'))

			self.set('_layout',new Layout())
			var  o = {
				w      : self.get('w'),
				h      : self.get('h'),  
				// data   : self._getPieInfos(),
				parent : self.get('element'),
				config     : self.get('config').layout,         //图表配置
			}
			self.get('_layout').init(o)
			self.get('_layout').get('y_txt').transformXY(6, self.get('_core_y') - 12 - 12)
			self.get('_layout').get('x_txt').transformXY(Number(self.get('w')) - Number(self.get('_layout').get('x_txt').getWidth()) - 6, Number(self.get('h')) - Number(self.get('_layout').get('x_txt').getHeight()) - 6)
			// self.get('_layout').get('infos').transformXY(Number(self.get('w')) - Number(self.get('_layout').get('infos').getDynamic('w'))- 3 - 6 - 18, 6)

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
			// return
			clearTimeout(this.get('_timeoutId'));
			var index = $o.index
			var id = $o.id
			id = 0

			var x = $o.x
			var y = $o.y
			var dx = $o.dx
			var dy = $o.dy
			var base_fill = $o.fill_over

			var data = []
			data[0] = []
			var o = { }
			o.content = this.get('_DataFrameFormat').vertical.org[id].name, o.bold = 1, o.fill = '#333333', o.size = 14, o.family = '微软雅黑', o.ver_align = 1
			data[0].push(o)
			// o = { }
			// o.content = this.get('_DataFrameFormat').vertical.name + Global.numAddSymbol(this.get('_DataFrameFormat').vertical.max[id][index]), o.bold = 0, o.fill = '#666666', o.family = '微软雅黑', o.ver_align = 1
			// data[1] = []
			// data[1].push(o)
			var dataID = 1
			var values = 0
			for (var a = 0, al = this.get('_DataFrameFormat').vertical.org[id].data.length; a < al; a++ ) {
				o = { }
				var fills = this.get('config').line.fills
				var fill_normal = fills[id][a] && fills[id][a].normal ? fills[id][a].normal : '#000000'
				var fill_over = fills[id][a] && fills[id][a].over ? fills[id][a].over : '#000000'
 				o.content = this.get('_DataFrameFormat').vertical.org[id].data[a].name + Global.numAddSymbol(this.get('_DataFrameFormat').vertical.org[id].data[a].data[$o.id]), o.bold = 0, o.fill = fill_over, o.family = '微软雅黑', o.hor_align = 2, o.sign = {has:1,trim:1,fill:fill_normal }
				data[dataID] = []
				if(this.get('_DataFrameFormat').vertical.org[id].data[a].data[$o.id]){
					data[dataID].push(o)
				}
				dataID++

				// values = Global.CountAccuracy.add(values, Number(this.get('_DataFrameFormat').vertical.org[id].data[a].data[$o.id]))
			}
			// data[0][0].content += Global.numAddSymbol(values)

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
				light:{
					is   : 1,
					x    : x,
					y    : y,
					fill : base_fill
				},
				hLine:{
					is   : 0,
					x    : x,
					y    : dy,
				}
			}
			var pre = this.get('_DataFrameFormat').horizontal.names[$o.id] ? this.get('_DataFrameFormat').horizontal.names[$o.id] : ''
			var next =  this.get('_DataFrameFormat').horizontal.names[$o.id + 1] ? this.get('_DataFrameFormat').horizontal.names[$o.id + 1] : this.get('_DataFrameFormat').horizontal.names[0]
			var content = this.get('_DataFrameFormat').horizontal.name + pre + ' - ' + next
			if (this.get('config').infos.xAxis.mode == 1) {
				content = this.get('_DataFrameFormat').horizontal.name + pre
			}

			o.hInfo = {
				is   : 1,
				x    : x,
				y    : dy,
				y1   : 6,
				content : content
			}
			o.other = {
				is   : 1,
				os   : $o.other
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
	    requires:['base','node','../../../pub/utils/global','../../../pub/utils/svgelement','../../../pub/views/infos/infos','../../../pub/models/eventtype','../../../pub/views/line/core','../../../pub/views/layouts/style1/main'
	    ]
	}
);
KISSY.add('brix/gallery/charts/js/e/line/main',function(S,Base,Global,SVGElement,Widget,DataParse,ConfigParse){
	function Main(){

		var self = this

		/*
			arguments:

			  o:{
				parent   :''     //SVGElement
				w        :100    //chart 宽
				h        :100    //chart 高
				config   :''     //图表配置
				data     :''     //图表数据  
			  }

		 */
		Main.superclass.constructor.apply(self,arguments);

		self.init()
	}

	Main.ATTRS = {
		_main:{
			value:null
		},
		_config:{                //图表配置   经过ConfigParse.parse
			value:{}
		},
		_DataSource:{
			value:{}             //图表数据源 经过DataParse.parse
		}
	}

	S.extend(Main,Base,{
		init:function(){
			var self = this
			
			self.set('_DataSource', new DataParse().parse(self.get('data'))) 
			self.set('_config', new ConfigParse().parse(self.get('config'))) 

			self._widget()	
		},

		_widget:function(){
			var self = this
			
			self.set('_main',new SVGElement('g'))
			self.get('_main').attr({'class':'main'});
			self.get('parent').appendChild(self.get('_main').element)
			self.get('_main').transformXY(Global.N05,Global.N05)

			var o = {}
			o.parent = self.get('_main')                       //SVGElement
			o.w = self.get('w')                                //chart 宽
			o.h = self.get('h')                                //chart 高
			o.DataSource = self.get('_DataSource')             //图表数据源
			o.config = self.get('_config')                     //图表配置
			
			new Widget(o)
		}
		
	});

	return Main;

	}, {
	    requires:['base','../../pub/utils/global','../../pub/utils/svgelement','./view/widget','../../pub/controls/line/dataparse','../../pub/controls/line/configparse']
	}
);
KISSY.add('brix/gallery/charts/js/e/line/view/widget',function(S,Base,Node,Global,DataSection,SVGElement,Vertical,Horizontal,Back,GlobalInduce,Infos,EventType,Graphs){
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
					names:[],                //名称集合[维度1---1：,,维度1---3：]
					org:[],                  //原始二维数据[[配置数据中每个队列第一个集合],[],[]]
					section:[],              //分段之后数据[200, 400, 600, 800, 1000, 1200, 1400, 1600]
					data:[]                  //转换坐标后的数据  =>Vertical.data、Back.data_hor
				},
				horizontal:{             //横轴
					name:'',                 //名称[维度2]
					org:'',                  //原始数据[0.05,0.1,0.15,0.2,...,2.55]
					data:[]                  //转换坐标后的数据  =>Horizontal.data
				},
				graphs:{                 //图形
					disX:59,                 //每两个点之间的距离
					data:[]                  //转换坐标后的数据
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
		_globalInduce:{
			value:null                   //全局感应区
		},
		_induces:{
			value:null                   //感应区
		},

		_disX:{
			value:6                      //左、右的距离
		},
		_disY:{
			value:10                     //上、下的距离
		},
		_dis_line:{
			value:6                      //纵向最高的线与最高高度最小相差的像素 而横向最右边的小线与最宽宽度也是最小相差该像素
		},          
		_dis_graphs:{
			value:0                      //在图形中 由于考虑到圆本身的半径实际图形中的左、下都必须预留的像素差右、上预留的像素差的最小值也是此值
		},

		_verticalMaxH:{
			value:0                      //纵向最大的高
		},
		_verticalGraphsH:{
			value:0                      //最上面的第一条线到原点之间的高度
		},
		_verticalDrawH:{
			value:0                      //图形区域由于考虑到圆的半径 因此圆必须高出最下面_dis_graphs个像素 而此值代表最上面的第一条线到_dis_graphs之间的距离
		},
		_horizontalMaxW:{
			value:0                      //横向最大的宽
		},
		_horizontalGraphsW:{
			value:0                      //图形区域真正的宽(最右边的第一条线到原点之间的高度)
		},
		_horizontalDrawW:{
			value:0                      //图形区域由于考虑到圆的半径 因此圆必须高出最右边_dis_graphs个像素
		},
		_timeoutId:{
			value:0                      
		},
		_timeoutDelay:{
			value:100                    
		},
		_baseNumber:{                    //基础值(原点)
			value:0
		}
	}

	S.extend(Widget,Base,{
		init:function(){
			var self = this
			var config = self.get('config')

			self.set('_DataFrameFormat',self.DataExtend(self.get('_DataFrameFormat'), self.get('DataSource'))) 
			self.get('_DataFrameFormat').key.data = String(self.get('_DataFrameFormat').key.indexs).split(',')
			var arr = Global.getChildsArr(self.get('_DataFrameFormat').vertical.org)
			self.get('_DataFrameFormat').vertical.section = DataSection.section(arr, null, {isInt:config.y_axis.data.isInt})
			// S.log(self.get('_DataFrameFormat').vertical.section)
			self.set('_baseNumber', self.get('_DataFrameFormat').vertical.section[0])
			// self.get('_DataFrameFormat').vertical.section = [10330000, 10340000, 10350000, 10360000, 10370000, 10380000, 10390000] 
			if(arr.length == 1){
				self.get('_DataFrameFormat').vertical.section[0] = arr[0] * 2
				self.set('_baseNumber', 0)
			}

			self._widget()
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
			self.set('_globalInduce', new GlobalInduce())
			self.set('_induces',new Graphs())
			
			self._trimVertical()
			var o = {
				parent : self.get('element'),
				data   : self.get('_DataFrameFormat').vertical.data
			}
			self.get('_vertical').init(o)
			self.get('_vertical').get('element').transformXY(self.get('_disX'), self.get('h') - self.get('_horizontal').get('h') - self.get('_disY'))

			if(config.y_axis.enabled == 0){
				self.get('_vertical').set('w', 6)
				self.get('_vertical').get('element').set('visibility','hidden')
			}

			// return
			self._trimHorizontal()

			var o = {
				w      : self.get('_horizontalMaxW'),
				parent : self.get('element'),
				data   : self.get('_DataFrameFormat').horizontal.data,
				dis_left : self.get('_disX') + self.get('_vertical').get('w') - self.get('_disX'),
				line   : config.x_axis.line
			}
			self.get('_horizontal').init(o)
			self.get('_horizontal').get('element').transformXY(self.get('_disX') + self.get('_vertical').get('w'), self.get('h') -  self.get('_horizontal').get('h') - self.get('_disY'))

			self._trimGraphs()

			var o = {
				w      : self.get('_horizontalMaxW'),
				h      : self.get('_verticalMaxH'),
				parent : self.get('element'),
				data_hor : self.get('_DataFrameFormat').vertical.data,
				data_ver : config.back.y_axis.enabled == 1 ? self.get('_horizontal').getShowData() : [],
				h_ver    : self.get('_verticalGraphsH'),
				axis     : config.back.axis
			}
			self.get('_back').init(o)
			self.get('_back').get('element').transformXY(self.get('_disX') + self.get('_vertical').get('w'), self.get('h') -  self.get('_horizontal').get('h') - self.get('_disY'))

			var o = {
				x     : self.get('_disX') + self.get('_vertical').get('w') + Global.N05,
				y     : self.get('h') -  self.get('_horizontal').get('h') - self.get('_disY') + Global.N05,
				w     : self.get('_horizontalGraphsW'),
				h     : self.get('_verticalGraphsH'),
				parent: self.get('element'),
				data  : self.get('_DataFrameFormat').graphs.data,
				disX  : self.get('_DataFrameFormat').graphs.disX,
				node  : self.get('config').node,
				area  : self.get('config').area,
				shape : self.get('config').shape,
				thickness : self.get('config').thickness,
				fills : self.get('config').fills.normals,
				fills_over : self.get('config').fills.overs,
				circle: self.get('config').circle.normal
			}
			self.get('_graphs').init(o)
			self.get('_graphs').get('element').transformXY(self.get('_disX') + self.get('_vertical').get('w') + Global.N05, self.get('h') -  self.get('_horizontal').get('h') - self.get('_disY') + Global.N05)

			self.get('_infos').init({parent:self.get('element')})

			var o = {
				w     : self.get('w'),
				h     : self.get('h'),
				parent: self.get('element'),
				opacity : Global.N00001
			}
			self.get('_globalInduce').init(o)

			if(self.get('_DataFrameFormat').horizontal.org.length == 0){
				return
			}

			var o = {
				x     : self.get('_disX') + self.get('_vertical').get('w') + Global.N05,
				y     : self.get('h') -  self.get('_horizontal').get('h') - self.get('_disY') + Global.N05,
				w     : self.get('_horizontalMaxW'),
				h     : self.get('_verticalGraphsH'),
				parent: self.get('element'),
				id    : 'induces',
				data  : self.get('_DataFrameFormat').graphs.data,
				isInduce   : 1,
				disX  : self.get('_DataFrameFormat').graphs.disX,
				fills : self.get('config').fills.normals,
				fills_over : self.get('config').fills.overs,
			}
			self.get('_induces').init(o)
			self.get('_induces').get('element').on(EventType.OVER,function($o){self._overHandler($o)})
			self.get('_induces').get('element').on(EventType.OUT,function($o){self._outHandler($o)})
			self.get('_induces').get('element').transformXY(self.get('_disX') + self.get('_vertical').get('w') +Global.N05, self.get('h') -  self.get('_horizontal').get('h') - self.get('_disY') + Global.N05)

		},

		//换算纵向
		_trimVertical:function(){
			var self = this
			self.set('_verticalMaxH', self.get('h') - self.get('_disY') - self.get('_horizontal').get('h') - self.get('_disY'))
			self.set('_verticalGraphsH', self.get('_verticalMaxH') - self._getVerticalDisY())
			self.set('_verticalDrawH', self.get('_verticalGraphsH') - self.get('_dis_graphs'))
			var max = self.get('_DataFrameFormat').vertical.section[self.get('_DataFrameFormat').vertical.section.length - 1]
			var arr = self.get('_DataFrameFormat').vertical.section
			var tmpData = []
			for (var a = 0, al = arr.length; a < al; a++ ) {
				var y = -self.get('_dis_graphs') - (arr[a] - self.get('_baseNumber')) / (max - self.get('_baseNumber'))* self.get('_verticalDrawH')                                    
				y = isNaN(y) ? 0 : Global.ceil(y)                                                    
				tmpData[a] = { 'value':arr[a], 'y': y }
			}
			self.get('_DataFrameFormat').vertical.data = tmpData
		},
		//获取纵向总高到第一条线之间的距离
		_getVerticalDisY:function(){
			var self = this
			var disMin = self.get('_dis_line')
			var disMax = 2 * self.get('_dis_line')
			var dis = disMin
			dis = disMin + self.get('_verticalMaxH') % self.get('_DataFrameFormat').vertical.section.length   //Q3  DataFrameFormat.vertical.section.length
			dis = dis > disMax ? disMax : dis
			return dis
		},
		//换算横向
		_trimHorizontal:function(){
			var self = this
			self.set('_horizontalMaxW', self.get('w') - self.get('_disX') - self.get('_vertical').get('w') - self.get('_disX'))
			self.set('_horizontalGraphsW', self.get('_horizontalMaxW') - self._getHorizontalDisX())
			self.set('_horizontalDrawW', self.get('_horizontalGraphsW') - self.get('_dis_graphs'))
			var max = self.get('_DataFrameFormat').horizontal.org.length
			var arr = self.get('_DataFrameFormat').horizontal.org
			var tmpData = []
		    for (var a = 0, al  = arr.length; a < al; a++ ) {
		    	var o = { 'value':arr[a], 'x':Global.ceil(self.get('_dis_graphs') + a / (max - 1) * self.get('_horizontalDrawW')) }
				tmpData.push( o )
			}
			if(max == 1){
				o.x = Global.ceil(self.get('_horizontalDrawW') / 2)
			}
			self.get('_DataFrameFormat').horizontal.data = tmpData
		},
		//获取横向总宽到第一条线之间的距离
		_getHorizontalDisX:function(){
			var self = this
			var disMin = self.get('_dis_line')
			var disMax = 2 * self.get('_dis_line')
			var dis = disMin
			dis = disMin + self.get('_horizontalMaxW') % self.get('_DataFrameFormat').horizontal.org.length 
			dis = dis > disMax ? disMax : dis
			dis = isNaN(dis) ? 0 : dis
			return dis
		},
		//换算图形
		_trimGraphs:function(){   
			var self = this                                                           
			var maxVertical = self.get('_DataFrameFormat').vertical.section[self.get('_DataFrameFormat').vertical.section.length - 1]
			var maxHorizontal = self.get('_DataFrameFormat').horizontal.org.length
			var arr = self.get('_DataFrameFormat').vertical.org
			var tmpData = []
			var no_nodes = self._getNoNodes()
			//处理不显示的节点
			for (var a = 0, al = arr.length; a < al; a++ ) {
				for (var b = 0, bl = arr[a].length ; b < bl; b++ ) {
					!tmpData[a] ? tmpData[a] = [] : ''
					var y = -self.get('_dis_graphs') - (arr[a][b] - self.get('_baseNumber')) / (maxVertical - self.get('_baseNumber')) * self.get('_verticalDrawH')
					y = isNaN(y) ? 0 : y
					tmpData[a][b] = {'value':arr[a][b], 'x':self.get('_dis_graphs') + b / (maxHorizontal - 1) * self.get('_horizontalDrawW'),'y':y}
					if(no_nodes[a] && no_nodes[a][b]){
						tmpData[a][b].no_node = 1
					}
				}
			}
			if(maxHorizontal == 1){
				if(tmpData[0] && tmpData[0][0]){
					tmpData[0][0].x = Global.ceil(self.get('_horizontalDrawW') / 2)
				}
			}
			self.get('_DataFrameFormat').graphs.data = tmpData
			self.get('_DataFrameFormat').graphs.disX = self._getGraphsDisX()
		},
		//每两个点之间的距离
		_getGraphsDisX:function(){
			var self = this
			return self.get('_horizontalGraphsW') / (self.get('_DataFrameFormat').horizontal.org.length - 1)
		},
		//过滤不显示的节点
		_getNoNodes:function(){
			var self = this
			var arr = []
			var nodes_mode = self.get('config').circle.mode
			var data = self.get('_DataFrameFormat').vertical.org
			if(nodes_mode == 0){
			}else if(nodes_mode == 1){
				for (var a = 0, al = data.length; a < al; a++ ) {
					!arr[a] ? arr[a] = [] : ''
					var value
					for (var b = 0, bl = data[a].length ; b < bl; b++ ) {
						if(value == data[a][b]){
							arr[a][b] = 1
						}
						value = data[a][b]
						if(data[a][b + 1]){   //如果有后一个点
							if(value != data[a][b + 1]){
								arr[a][b] = 0
							}
						}else{                //最后一个点
							arr[a][b] = 0
						}
					}
				}
			}
			self.get('_DataFrameFormat').vertical.no_nodes = arr
			return arr
		},

		_overHandler:function($o){
			clearTimeout(this.get('_timeoutId'));
			var config = this.get('config')
			var index = $o.index
			var id = $o.id

			var x = Number($o.x)// + Number(this.get('_graphs').get('element').get('_x'))
			var y = Number($o.y)// + Number(this.get('_graphs').get('element').get('_y'))
			
			var base_fill = $o.fill_over
			var data = []
			data[0] = []
			var o = { }
			o.content = this.get('_DataFrameFormat').vertical.names[index] ? this.get('_DataFrameFormat').vertical.names[index] : this.get('_DataFrameFormat').vertical.name
			data[0].push(o)
			o = { }
			o.content = this.get('_DataFrameFormat').graphs.data[index][id].value
			data[0].push(o)

			var o = {
				w    : this.get('w'),
				h    : this.get('h'),
				parent : this.get('element'),
				
				info:{
					x    : x,
					y    : y,
					data : data,
					base_fill : base_fill
				},
				light:{
					is   : 1,
					x    : x,
					y    : y,
					fill : base_fill,
					min_radius:config.circle.over.min_radius,
					max_radius:config.circle.over.max_radius,
					max_thickness:config.circle.over.max_thickness
				},
				hLine:{
					is   : 1,
					x    : x,
					y    : this.get('_graphs').get('element').get('_y')
				}
			}

			var pre = this.get('_DataFrameFormat').horizontal.org[id]
			var content = this.get('_DataFrameFormat').horizontal.name + pre

			o.hInfo = {
				is   : 1,
				x    : x,
				y    : this.get('_graphs').get('element').get('_y'),
				content : content
			}

			this.get('_infos').update(o)

			this.get('_graphs').induce({index:$o.index,id:$o.id},true)
			 
		},
		_outHandler:function($o){
			var self = this
			this.set('_timeoutId', setTimeout(function(){self._outTimeout()}, self.get('_timeoutDelay')))
			this.get('_graphs').induce({index:$o.index,id:$o.id},false)
		},
		_outTimeout:function(){
			this.get('_infos').remove()
		},
		/**
		 * 数据继承
		 * @type {Object}
		 */
		DataExtend:function(DataFrameFormat,DataSource){
			DataFrameFormat.key.indexs = DataSource.key.indexs
			DataFrameFormat.vertical.name = DataSource.vertical.name
			DataFrameFormat.vertical.names = DataSource.vertical.names
			DataFrameFormat.vertical.org = DataSource.vertical.data
			DataFrameFormat.vertical.no_nodes = DataSource.vertical.no_nodes
			DataFrameFormat.horizontal.name = DataSource.horizontal.name
			DataFrameFormat.horizontal.org = DataSource.horizontal.data

			return DataFrameFormat
		}
	});

	return Widget;

	}, {
	    requires:['base','node','../../../pub/utils/global','../../../pub/utils/datasection','../../../pub/utils/svgelement',
	    		  '../../../pub/views/vertical','../../../pub/views/horizontal','../../../pub/views/back','../../../pub/views/globalinduce','../../../pub/views/infos/infos','../../../pub/models/eventtype','../../../pub/views/line/graphs'

	    ]
	}
);
KISSY.add('brix/gallery/charts/js/e/line2/main',function(S,Base,Global,SVGElement,Widget,DataParse,ConfigParse){
	function Main(){

		var self = this

		/*
			arguments:

			  o:{
				parent   :''     //SVGElement
				w        :100    //chart 宽
				h        :100    //chart 高
				config   :''     //图表配置
				data     :''     //图表数据  
			  }

		 */
		Main.superclass.constructor.apply(self,arguments);

		self.init()
	}

	Main.ATTRS = {
		_main:{
			value:null
		},
		_config:{                //图表配置   经过ConfigParse.parse
			value:{}
		},
		_DataSource:{
			value:{}             //图表数据源 经过DataParse.parse
		}
	}

	S.extend(Main,Base,{
		init:function(){
			var self = this
			
			self.set('_DataSource', new DataParse().parse(self.get('data'))) 
			self.set('_config', new ConfigParse().parse(self.get('config'))) 

			self._widget()	
		},

		_widget:function(){
			var self = this
			
			self.set('_main',new SVGElement('g'))
			self.get('_main').attr({'class':'main'});
			self.get('parent').appendChild(self.get('_main').element)
			self.get('_main').transformXY(Global.N05,Global.N05)

			var o = {}
			o.parent = self.get('_main')                       //SVGElement
			o.w = self.get('w')                                //chart 宽
			o.h = self.get('h')                                //chart 高
			o.DataSource = self.get('_DataSource')             //图表数据源
			o.config = self.get('_config')                     //图表配置

			new Widget(o)
		}
	});

	return Main;

	}, {
	    requires:['base','../../pub/utils/global','../../pub/utils/svgelement','./view/widget','../../pub/controls/line2/dataparse','../../pub/controls/line/configparse']
	}
);
KISSY.add('brix/gallery/charts/js/e/line2/view/widget',function(S,Base,Node,Global,DataSection,SVGElement,Vertical,Horizontal,Back,GlobalInduce,Infos,EventType,Graphs){
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
				vertical:{               //纵轴
					names:[],                //名称三维数据[ [  [[03月08号:],[...]] , [[03月01号:],[...]] ] ]
					org:[],                  //原始三维数据[ [  [[83],[81],[...]]   , [[43],[41],[...]]   ] ]
					section:[],              //分段之后数据[200, 400, 600, 800, 1000, 1200, 1400, 1600]
					data:[]                  //转换坐标后的数据  =>Vertical.data、Back.data_hor
				},
				horizontal:{             //横轴
					name:'',                 //名称[预留]
					org:'',                  //原始二维数据[[3月8号],[3月9号],[...]]
					data:[]                  //转换坐标后的数据  =>Horizontal.data
				},
				graphs:{                 //图形
					disX:59,                 //每两个点之间的距离
					data:[]                  //转换坐标后的数据
				},				
				info:{                   //显示信息配置         
				    content:{                //内容
						title:{                  //标题 
							name:'',                 //内容
							fill:''                  //颜色
						}
					}
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
		_globalInduce:{
			value:null                   //全局感应区
		},
		_induces:{
			value:null                   //感应区
		},

		_disX:{
			value:6                      //左、右的距离
		},
		_disY:{
			value:10                     //上、下的距离
		},
		_dis_line:{
			value:6                      //纵向最高的线与最高高度最小相差的像素 而横向最右边的小线与最宽宽度也是最小相差该像素
		},          
		_dis_graphs:{
			value:0                      //在图形中 由于考虑到圆本身的半径  实际图形中的左、下都必须预留的像素差   右、上预留的像素差的最小值也是此值
		},

		_verticalMaxH:{
			value:0                      //纵向最大的高
		},
		_verticalGraphsH:{
			value:0                      //最上面的第一条线到原点之间的高度
		},
		_verticalDrawH:{
			value:0                      //图形区域由于考虑到圆的半径 因此圆必须高出最下面_dis_graphs个像素 而此值代表最上面的第一条线到_dis_graphs之间的距离
		},
		_horizontalMaxW:{
			value:0                      //横向最大的宽
		},
		_horizontalGraphsW:{
			value:0                      //图形区域真正的宽(最右边的第一条线到原点之间的高度)
		},
		_horizontalDrawW:{
			value:0                      //图形区域由于考虑到圆的半径 因此圆必须高出最右边_dis_graphs个像素
		},
		_timeoutId:{
			value:0                      
		},
		_timeoutDelay:{
			value:100                    
		},
		_baseNumber:{                    //基础值(原点)
			value:0
		}
	}

	S.extend(Widget,Base,{
		init:function(){
			var self = this

			self.set('_DataFrameFormat',self.DataExtend(self.get('_DataFrameFormat'), self.get('DataSource'))) 
			// self.get('_DataFrameFormat').key.data = String(self.get('_DataFrameFormat').key.indexs).split(',')
			self.get('_DataFrameFormat').vertical.section = DataSection.section(Global.getChildsArr(self.get('_DataFrameFormat').vertical.org))
			self.set('_baseNumber', self.get('_DataFrameFormat').vertical.section[0])

			self._widget()
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
			self.set('_globalInduce', new GlobalInduce())
			self.set('_induces',new Graphs())
			
			self._trimVertical()
			var o = {
				parent : self.get('element'),
				data   : self.get('_DataFrameFormat').vertical.data,
				line_has : config.y_axis.line.enabled
			}
			self.get('_vertical').init(o)
			self.get('_vertical').get('element').transformXY(self.get('_disX'), self.get('h') - self.get('_horizontal').get('h') - self.get('_disY'))

			self._trimHorizontal()
			var o = {
				w      : self.get('_horizontalMaxW'),
				parent : self.get('element'),
				data   : self.get('_DataFrameFormat').horizontal.data,
				dis_left : self.get('_disX') + self.get('_vertical').get('w') - self.get('_disX')
			}
			self.get('_horizontal').init(o)
			self.get('_horizontal').get('element').transformXY(self.get('_disX') + self.get('_vertical').get('w'), self.get('h') -  self.get('_horizontal').get('h') - self.get('_disY'))

			self._trimGraphs()
			var o = {
				w      : self.get('_horizontalMaxW'),
				h      : self.get('_verticalMaxH'),
				parent : self.get('element'),
				data_hor : self.get('_DataFrameFormat').vertical.data,
				data_ver : config.back.y_axis.enabled == 1 ? self.get('_horizontal').getShowData() : [],
				h_ver    : self.get('_verticalGraphsH'),
				axis   : config.back.axis,
				line_hor_mode : config.back.x_axis.mode
			}
			self.get('_back').init(o)
			self.get('_back').get('element').transformXY(self.get('_disX') + self.get('_vertical').get('w'), self.get('h') -  self.get('_horizontal').get('h') - self.get('_disY'))

			var o = {
				x     : self.get('_disX') + self.get('_vertical').get('w') + Global.N05,
				y     : self.get('h') -  self.get('_horizontal').get('h') - self.get('_disY') + Global.N05,
				w     : self.get('_horizontalGraphsW'),
				h     : self.get('_verticalGraphsH'),
				parent: self.get('element'),
				data  : self.get('_DataFrameFormat').graphs.data,
				disX  : self.get('_DataFrameFormat').graphs.disX,
				node  : config.node,
				area  : config.area,
				shape : config.shape,
				thickness : config.thickness,
				fills : config.fills.normals,
				fills_over : config.fills.overs,
				circle: config.circle.normal
			}
			self.get('_graphs').init(o)
			self.get('_graphs').get('element').transformXY(self.get('_disX') + self.get('_vertical').get('w') + Global.N05, self.get('h') -  self.get('_horizontal').get('h') - self.get('_disY') + Global.N05)

			self.get('_infos').init({parent:self.get('element')})

			var o = {
				w     : self.get('w'),
				h     : self.get('h'),
				parent: self.get('element'),
				opacity : Global.N00001
			}
			self.get('_globalInduce').init(o)

			var o = {
				x     : self.get('_disX') + self.get('_vertical').get('w') + Global.N05,
				y     : self.get('h') -  self.get('_horizontal').get('h') - self.get('_disY') + Global.N05,
				w     : self.get('_horizontalMaxW'),
				h     : self.get('_verticalGraphsH'),
				parent: self.get('element'),
				id    : 'induces',
				data  : self.get('_DataFrameFormat').graphs.data,
				isInduce   : 1,
				disX  : self.get('_DataFrameFormat').graphs.disX,
				fills : config.fills.normals,
				fills_over : config.fills.overs,
			}
			self.get('_induces').init(o)
			self.get('_induces').get('element').on(EventType.OVER,function($o){self._overHandler($o)})
			self.get('_induces').get('element').on(EventType.OUT,function($o){self._outHandler($o)})
			self.get('_induces').get('element').transformXY(self.get('_disX') + self.get('_vertical').get('w') +Global.N05, self.get('h') -  self.get('_horizontal').get('h') - self.get('_disY') + Global.N05)

		},

		//换算纵向
		_trimVertical:function(){
			var self = this
			self.set('_verticalMaxH', self.get('h') - self.get('_disY') - self.get('_horizontal').get('h') - self.get('_disY'))
			self.set('_verticalGraphsH', self.get('_verticalMaxH') - self._getVerticalDisY())
			self.set('_verticalDrawH', self.get('_verticalGraphsH') - self.get('_dis_graphs'))
			var max = self.get('_DataFrameFormat').vertical.section[self.get('_DataFrameFormat').vertical.section.length - 1]
			var arr = self.get('_DataFrameFormat').vertical.section
			var tmpData = []
			for (var a = 0, al = arr.length; a < al; a++ ) {
				var y = -self.get('_dis_graphs') - (arr[a] - self.get('_baseNumber')) / (max - self.get('_baseNumber')) * self.get('_verticalDrawH')                                    
				y = isNaN(y) ? 0 : Global.ceil(y)                                                    
				tmpData[a] = { 'value':arr[a], 'y': y }
			}
			self.get('_DataFrameFormat').vertical.data = tmpData
		},
		//获取纵向总高到第一条线之间的距离
		_getVerticalDisY:function(){
			var self = this
			var disMin = self.get('_dis_line')
			var disMax = 2 * self.get('_dis_line')
			var dis = disMin
			dis = disMin + self.get('_verticalMaxH') % self.get('_DataFrameFormat').vertical.section.length   //Q3  DataFrameFormat.vertical.section.length
			dis = dis > disMax ? disMax : dis
			return dis
		},
		//换算横向
		_trimHorizontal:function(){
			var self = this
			self.set('_horizontalMaxW', self.get('w') - self.get('_disX') - self.get('_vertical').get('w') - self.get('_disX'))
			self.set('_horizontalGraphsW', self.get('_horizontalMaxW') - self._getHorizontalDisX())
			self.set('_horizontalDrawW', self.get('_horizontalGraphsW') - self.get('_dis_graphs'))
			var max = self.get('_DataFrameFormat').horizontal.org.length
			var arr = self.get('_DataFrameFormat').horizontal.org
			var tmpData = []
		    for (var a = 0, al  = arr.length; a < al; a++ ) {
				tmpData.push( { 'value':arr[a], 'x':Global.ceil(self.get('_dis_graphs') + a / (max - 1) * self.get('_horizontalDrawW')) } )
			}
			self.get('_DataFrameFormat').horizontal.data = tmpData
		},
		//获取横向总宽到第一条线之间的距离
		_getHorizontalDisX:function(){
			var self = this
			var disMin = self.get('_dis_line')
			var disMax = 2 * self.get('_dis_line')
			var dis = disMin
			dis = disMin + self.get('_horizontalMaxW') % self.get('_DataFrameFormat').horizontal.org.length 
			dis = dis > disMax ? disMax : dis
			dis = isNaN(dis) ? 0 : dis
			return dis
		},
		//换算图形
		_trimGraphs:function(){   
			var self = this                                                           
			var maxVertical = self.get('_DataFrameFormat').vertical.section[self.get('_DataFrameFormat').vertical.section.length - 1]
			var maxHorizontal = self.get('_DataFrameFormat').horizontal.org.length
			var arr = self.get('_DataFrameFormat').vertical.org
			var tmpData = []
			for (var a = 0, al = arr.length; a < al; a++ ) {
				for (var b = 0, bl = arr[a].length ; b < bl; b++ ) {
					!tmpData[a] ? tmpData[a] = [] : ''
					var y = -self.get('_dis_graphs') - (arr[a][b] - self.get('_baseNumber')) / (maxVertical - self.get('_baseNumber')) * self.get('_verticalDrawH')
					y = isNaN(y) ? 0 : y
					tmpData[a][b] = {'value':arr[a][b], 'x':self.get('_dis_graphs') + b / (maxHorizontal - 1) * self.get('_horizontalDrawW'),'y':y} 
				}
			}
			self.get('_DataFrameFormat').graphs.data = tmpData
			self.get('_DataFrameFormat').graphs.disX = self._getGraphsDisX()
		},
		//每两个点之间的距离
		_getGraphsDisX:function(){
			var self = this
			return self.get('_horizontalGraphsW') / (self.get('_DataFrameFormat').horizontal.org.length - 1)
		},

		_overHandler:function($o){
			clearTimeout(this.get('_timeoutId'));
			var config = this.get('config')
			var index = $o.index
			var id = $o.id

			var x = Number($o.x)// + Number(this.get('_graphs').get('element').get('_x'))
			var y = Number($o.y)// + Number(this.get('_graphs').get('element').get('_y'))
			var base_fill = $o.fill_over
			var data = []
			for (var a = 0, al = this.get('_DataFrameFormat').vertical.names.length; a < al; a++ ) {
				data[a] = []
				var o = { }
				o.content = this.get('_DataFrameFormat').vertical.names[a][id], o.fill = config.fills.overs[a], o.font = '微软雅黑',o.ver_align = 3
				if(o.content){
					data[a].push(o)
				}
				o = { }
				o.content = this.get('_DataFrameFormat').vertical.org[a][id], o.fill = config.fills.overs[a], o.font = 'Tahoma',o.ver_align = 1
				if(o.content){
					data[a].push(o)
				}
			}
			var tmp = data[index]
			data.splice(index,1)
			data.unshift(tmp)
			if(this.get('_DataFrameFormat').info.content.title.name){
				o = { }
				o.content = this.get('_DataFrameFormat').info.content.title.name, o.fill = this.get('_DataFrameFormat').info.content.title.fill, o.font = '微软雅黑',o.ver_align = 1
				data.unshift([o])
			}

			var o = {
				w    : this.get('w'),
				h    : this.get('h'),
				parent : this.get('element'),
				
				info:{
					x    : x,
					y    : y,
					data : data,
					base_fill : base_fill
				},
				light:{
					is   : 1,
					x    : x,
					y    : y,
					fill : base_fill,
					min_radius:config.circle.over.min_radius,
					max_radius:config.circle.over.max_radius,
					max_fill_opacity:config.circle.over.max_fill_opacity,
					max_thickness:config.circle.over.max_thickness,
					max_thickness_opacity:config.circle.over.max_thickness_opacity
				},
				hLine:{
					is   : 1,
					x    : x,
					y    : this.get('_graphs').get('element').get('_y')
				}
			}

			var pre = this.get('_DataFrameFormat').horizontal.org[id]
			var content = this.get('_DataFrameFormat').horizontal.name + pre

			o.hInfo = {
				is   : 1,
				x    : x,
				y    : this.get('_graphs').get('element').get('_y'),
				content : content
			}
			for(var a = 0, al = $o.other.length; a < al; a++){
				$o.other[a].x = Number($o.other[a].x) +  Number(this.get('_graphs').get('element').get('_x'))
				$o.other[a].y = Number($o.other[a].y) +  Number(this.get('_graphs').get('element').get('_y'))
			}
			o.other = {
				is   : 1,
				os   : $o.other,
				config : {
							min_radius:config.circle.over.min_radius,
							max_radius:config.circle.over.max_radius,
							max_fill_opacity:config.circle.over.max_fill_opacity,
							max_thickness:config.circle.over.max_thickness,
							max_thickness_opacity:config.circle.over.max_thickness_opacity
						 }
			}

			this.get('_infos').update(o)

			this.get('_graphs').induce({index:$o.index,id:$o.id},true)
			 
		},
		_outHandler:function($o){
			var self = this
			this.set('_timeoutId', setTimeout(function(){self._outTimeout()}, self.get('_timeoutDelay')))
			this.get('_graphs').induce({index:$o.index,id:$o.id},false)
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
			DataFrameFormat.info = DataSource.info
			DataFrameFormat.vertical.names = DataSource.vertical.names
			DataFrameFormat.vertical.org = DataSource.vertical.data
			// DataFrameFormat.horizontal.name = DataSource.horizontal.name
			DataFrameFormat.horizontal.org = DataSource.horizontal.data

			return DataFrameFormat
		}
	});

	return Widget;

	}, {
	    requires:['base','node','../../../pub/utils/global','../../../pub/utils/datasection','../../../pub/utils/svgelement',
	    		  '../../../pub/views/vertical','../../../pub/views/horizontal','../../../pub/views/back','../../../pub/views/globalinduce','../../../pub/views/infos/infos','../../../pub/models/eventtype','../../../pub/views/line/graphs'

	    ]
	}
);
KISSY.add('brix/gallery/charts/js/e/line3/main',function(S,Base,Global,SVGElement,Widget,DataParse,ConfigParse){
	function Main(){

		var self = this

		/*
			arguments:

			  o:{
				parent   :''     //SVGElement
				w        :100    //chart 宽
				h        :100    //chart 高
				config   :''     //图表配置
				data     :''     //图表数据  
			  }

		 */
		Main.superclass.constructor.apply(self,arguments);

		self.init()
	}

	Main.ATTRS = {
		_main:{
			value:null
		},
		_config:{                //图表配置   经过ConfigParse.parse
			value:{}
		},
		_DataSource:{
			value:{}             //图表数据源 经过DataParse.parse
		}
	}

	S.extend(Main,Base,{
		init:function(){
			var self = this
			
			self.set('_DataSource', new DataParse().parse(self.get('data'))) 
			self.set('_config', new ConfigParse().parse(self.get('config'))) 
			
			self._widget()	
		},

		_widget:function(){
			var self = this
			
			self.set('_main',new SVGElement('g'))
			self.get('_main').attr({'class':'main'});
			self.get('parent').appendChild(self.get('_main').element)
			self.get('_main').transformXY(Global.N05, Global.N05)

			var o = {}
			o.parent = self.get('_main')                       //SVGElement
			o.w = self.get('w')                                //chart 宽
			o.h = self.get('h')                                //chart 高
			o.DataSource = self.get('_DataSource')             //图表数据源
			o.config = self.get('_config')                     //图表配置

			new Widget(o)
		}
		
	});

	return Main;

	}, {
	    requires:['base','../../pub/utils/global','../../pub/utils/svgelement','./view/widget','../../pub/controls/line3/dataparse','../../pub/controls/line3/configparse']
	}
);
KISSY.add('brix/gallery/charts/js/e/line3/view/widget',function(S,Base,Node,Global,DataSection,SVGElement,Vertical,Horizontal,Back,GlobalInduce,Infos,EventType,Graphs){
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
				vertical:{               //纵轴
					names:[],                //名称二维数据[ [千次展现价格:,展现次数:] ]
					org:[],                  //原始三维数据[ [  [[8300],[8100],[...]]   , [[4300],[4100],[...]]   ] ]
					sections:[],             //分段之后二维数据[[0]中存放左侧数据、[1]中存放右侧数据]
					datas:[]                 //转换坐标后的二维数据: 二维数组[[0]中存放左侧数据、[1]中存放右侧数据]  =>Vertical.data、Back.data_hor
				},
				horizontal:{             //横轴
					name:'',                 //名称[预留]
					org:'',                  //原始二维数据[[3月8号],[3月9号],[...]]
					data:[]                  //转换坐标后的数据  =>Horizontal.data
				},
				graphs:{                 //图形
					disX:59,                 //每两个点之间的距离
					data:[]                  //转换坐标后的数据
				}
			}
		},

		_vertical:{
			value:null                   //纵向
		},
		_vertical_right:{
			value:null                   //纵向(右侧)
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
		_globalInduce:{
			value:null                   //全局感应区
		},
		_induces:{
			value:null                   //感应区
		},

		_hasRight:{
			value:0                      //是否有右侧
		},
		_disX:{
			value:6                      //左、右的距离
		},
		_disY:{
			value:10                     //上、下的距离
		},
		_dis_line:{
			value:6                      //纵向最高的线与最高高度最小相差的像素 而横向最右边的小线与最宽宽度也是最小相差该像素
		},          
		_dis_graphs:{
			value:0                      //在图形中 由于考虑到圆本身的半径  实际图形中的左、下都必须预留的像素差   右、上预留的像素差的最小值也是此值
		},

		_verticalMaxH:{
			value:0                      //纵向最大的高
		},
		_verticalGraphsH:{
			value:0                      //最上面的第一条线到原点之间的高度
		},
		_verticalDrawH:{
			value:0                      //图形区域由于考虑到圆的半径 因此圆必须高出最下面_dis_graphs个像素 而此值代表最上面的第一条线到_dis_graphs之间的距离
		},
		_horizontalMaxW:{
			value:0                      //横向最大的宽
		},
		_horizontalGraphsW:{
			value:0                      //图形区域真正的宽(最右边的第一条线到原点之间的高度)
		},
		_horizontalDrawW:{
			value:0                      //图形区域由于考虑到圆的半径 因此圆必须高出最右边_dis_graphs个像素
		},
		_timeoutId:{
			value:0                      
		},
		_timeoutDelay:{
			value:100                    
		},
		_baseNumber:{                    //基础值(原点)
			value:0
		},
		_baseNumberRight:{               //右侧基础值(原点)
			value:0
		}
	}

	S.extend(Widget,Base,{
		init:function(){
			var self = this
			
			var scales = self.get('config').scales
			self.set('_DataFrameFormat',self.DataExtend(self.get('_DataFrameFormat'), self.get('DataSource')))
			self.set('_hasRight',self.get('_DataFrameFormat').vertical.org.length == 2 ? 1 : 0)
			self.get('_DataFrameFormat').vertical.sections.push(DataSection.section(self.get('_DataFrameFormat').vertical.org[0],null,{scale:scales[0]}))
			if(self.get('_DataFrameFormat').vertical.sections[0].length >= 2){
				self.set('_baseNumber', self.get('_DataFrameFormat').vertical.sections[0][0])
			}
			if(self.get('_hasRight') == 1){
				self.get('_DataFrameFormat').vertical.sections.push(DataSection.section(self.get('_DataFrameFormat').vertical.org[1],null,{scale:scales[1]}))
				if(self.get('_DataFrameFormat').vertical.sections[1].length > 2){
					self.set('_baseNumberRight', self.get('_DataFrameFormat').vertical.sections[1][0])
				}
				if(self.get('_DataFrameFormat').vertical.sections[1].length < 1){
					self.get('_DataFrameFormat').vertical.sections[1] = [0]
				}
			}

			self._widget()
		},

		_widget:function(){
			var self = this
			self.set('element', new SVGElement('g')), self.get('element').set('class','widget')
			self.get('parent').appendChild(self.get('element').element)

			self.set('_vertical',new Vertical())
			self.set('_vertical_right',new Vertical())
			self.set('_horizontal',new Horizontal())
			self.set('_back',new Back())
			self.set('_graphs',new Graphs())
			self.set('_infos',new Infos())
			self.set('_globalInduce', new GlobalInduce())
			self.set('_induces',new Graphs())
			
			self._trimVertical()
			var o = {
				parent : self.get('element'),
				data   : self.get('_DataFrameFormat').vertical.datas[0],
				font_fill : self.get('config').fills.normals[0],
				line_fill : self.get('config').fills.normals[0]
			}
			self.get('_vertical').init(o)
			self.get('_vertical').get('element').transformXY(self.get('_disX'), self.get('h') - self.get('_horizontal').get('h') - self.get('_disY'))

			if(self.get('_hasRight') == 1){
				self._trimVertical(1)

				var o = {
					parent : self.get('element'),
					id     : 'vertical_right',
					data   : self.get('_DataFrameFormat').vertical.datas[1],
					mode   : 2,
					font_fill : self.get('config').fills.normals[1],
					line_fill : self.get('config').fills.normals[1]
				}
				self.get('_vertical_right').init(o)
				self.get('_vertical_right').get('element').transformXY(self.get('w') - self.get('_disX') - self.get('_vertical_right').get('w'), self.get('h') - self.get('_horizontal').get('h') - self.get('_disY'))
			}
			self._trimHorizontal()
			self._trimGraphs()
			if(self.get('_hasRight') == 1){
				self._trimGraphs(1)
			}

			var o = {
				w      : self.get('_horizontalMaxW'),
				parent : self.get('element'),
				data   : self.get('_DataFrameFormat').horizontal.data,
				dis_left : self.get('_disX') + self.get('_vertical').get('w') - self.get('_disX')
			}
			if(self.get('_hasRight') == 1){
				o.dis_right = self.get('_horizontalMaxW') + self.get('_vertical_right').get('w')    //Q3 self.get('_horizontalMaxW') 
			}
			self.get('_horizontal').init(o)
			self.get('_horizontal').get('element').transformXY(self.get('_disX') + self.get('_vertical').get('w'), self.get('h') -  self.get('_horizontal').get('h') - self.get('_disY'))
			
			var o = {
				w      : self.get('_horizontalMaxW'),
				h      : self.get('_verticalMaxH'),
				parent : self.get('element'),
				data_hor : self.get('_DataFrameFormat').vertical.datas[0],
				data_ver : self.get('_horizontal').getShowData(),
				h_ver    : self.get('_verticalGraphsH'),
			}
			self.get('_back').init(o)
			self.get('_back').get('element').transformXY(self.get('_disX') + self.get('_vertical').get('w'), self.get('h') -  self.get('_horizontal').get('h') - self.get('_disY'))
			
			var o = {
				x     : self.get('_disX') + self.get('_vertical').get('w') + Global.N05,
				y     : self.get('h') -  self.get('_horizontal').get('h') - self.get('_disY') + Global.N05,
				w     : self.get('_horizontalGraphsW'),
				h     : self.get('_verticalGraphsH'),
				parent: self.get('element'),
				data  : self.get('_DataFrameFormat').graphs.data,
				disX  : self.get('_DataFrameFormat').graphs.disX,
				node  : self.get('config').node,
				area  : self.get('config').area,
				shape : self.get('config').shape,
				fills : self.get('config').fills.normals,
				fills_over : self.get('config').fills.overs,
			}
			self.get('_graphs').init(o)
			self.get('_graphs').get('element').transformXY(self.get('_disX') + self.get('_vertical').get('w') + Global.N05, self.get('h') -  self.get('_horizontal').get('h') - self.get('_disY') + Global.N05)

			self.get('_infos').init({parent:self.get('element')})

			var o = {
				w     : self.get('w'),
				h     : self.get('h'),
				parent: self.get('element'),
				opacity : Global.N00001
			}
			self.get('_globalInduce').init(o)

			if(!self.get('_DataFrameFormat').vertical.org[0][0] && !self.get('_DataFrameFormat').vertical.org[0][0]){
				return
			}

			var o = {
				x     : self.get('_disX') + self.get('_vertical').get('w') + Global.N05,
				y     : self.get('h') -  self.get('_horizontal').get('h') - self.get('_disY') + Global.N05,
				w     : self.get('_horizontalMaxW'),
				h     : self.get('_verticalGraphsH'),
				parent: self.get('element'),
				id    : 'induces',
				data  : self.get('_DataFrameFormat').graphs.data,
				isInduce   : 1,
				disX  : self.get('_DataFrameFormat').graphs.disX,
				fills : self.get('config').fills.normals,
				fills_over : self.get('config').fills.overs,
			}
			self.get('_induces').init(o)
			self.get('_induces').get('element').on(EventType.OVER,function($o){self._overHandler($o)})
			self.get('_induces').get('element').on(EventType.OUT,function($o){self._outHandler($o)})
			self.get('_induces').get('element').transformXY(self.get('_disX') + self.get('_vertical').get('w') +Global.N05, self.get('h') -  self.get('_horizontal').get('h') - self.get('_disY') + Global.N05)

		},

		//换算纵向
		_trimVertical:function($i){
			var self = this
			var $i = $i ? $i : 0
			self.set('_verticalMaxH', self.get('h') - self.get('_disY') - self.get('_horizontal').get('h') - self.get('_disY'))
			self.set('_verticalGraphsH', self.get('_verticalMaxH') - self._getVerticalDisY($i))
			self.set('_verticalDrawH', self.get('_verticalGraphsH') - self.get('_dis_graphs'))
			var max = self.get('_DataFrameFormat').vertical.sections[$i][self.get('_DataFrameFormat').vertical.sections[$i].length - 1]
			var arr = self.get('_DataFrameFormat').vertical.sections[$i]
			var _baseNumber = $i == 0 ? self.get('_baseNumber') : self.get('_baseNumberRight')
			var tmpData = []
			for (var a = 0, al = arr.length; a < al; a++ ) {
				var y = -self.get('_dis_graphs') - (arr[a] - _baseNumber) / (max -_baseNumber) * self.get('_verticalDrawH')                                    
				y = isNaN(y) ? 0 : Global.ceil(y)                                                    
				tmpData[a] = { 'value':arr[a], 'y': y }
			}
			self.get('_DataFrameFormat').vertical.datas[$i] = tmpData
		},
		//获取纵向总高到第一条线之间的距离
		_getVerticalDisY:function($i){
			var self = this
			var $i = $i ? $i : 0
			var disMin = self.get('_dis_line')
			var disMax = 2 * self.get('_dis_line')
			var dis = disMin
			dis = disMin + self.get('_verticalMaxH') % self.get('_DataFrameFormat').vertical.sections[$i].length
			dis = dis > disMax ? disMax : dis
			return dis
		},
		//换算横向
		_trimHorizontal:function(){
			var self = this
			if(self.get('_hasRight') == 1){
				self.set('_horizontalMaxW', self.get('w') - self.get('_disX') - self.get('_vertical').get('w') - self.get('_vertical_right').get('w') - self.get('_disX'))
			}else{
				self.set('_horizontalMaxW', self.get('w') - self.get('_disX') - self.get('_vertical').get('w') - self.get('_disX'))
			}
			
			self.set('_horizontalGraphsW', self.get('_horizontalMaxW') - self._getHorizontalDisX())
			self.set('_horizontalDrawW', self.get('_horizontalGraphsW') - self.get('_dis_graphs'))
			var max = self.get('_DataFrameFormat').horizontal.org.length
			var arr = self.get('_DataFrameFormat').horizontal.org
			var tmpData = []
		    for (var a = 0, al  = arr.length; a < al; a++ ) {
		    	var x = Global.ceil(self.get('_dis_graphs') + a / (max - 1) * self.get('_horizontalDrawW'))
		    	x = isNaN(x) ? 0 : x
				tmpData.push( { 'value':arr[a], 'x': x} )
			}
			if(self.get('_hasRight') && self.get('_DataFrameFormat').vertical.org[1].length == 1){
				var value = arr[0] ? arr[0] : ''
				tmpData.push( { 'value':value, 'x': self.get('_horizontalDrawW')} )
			}
			self.get('_DataFrameFormat').horizontal.data = tmpData
		},
		//获取横向总宽到第一条线之间的距离
		_getHorizontalDisX:function(){
			var self = this
			var disMin = self.get('_dis_line')
			var disMax = 2 * self.get('_dis_line')
			var dis = disMin
			dis = disMin + self.get('_horizontalMaxW') % self.get('_DataFrameFormat').horizontal.org.length 
			dis = dis > disMax ? disMax : dis
			if(self.get('_hasRight') == 1){
				dis = 0
			}
			return dis
		},
		//换算图形
		_trimGraphs:function($i){   
			var self = this 
			var $i = $i ? $i : 0                                                          
			var maxVertical = self.get('_DataFrameFormat').vertical.sections[$i][self.get('_DataFrameFormat').vertical.sections[$i].length - 1]
			var maxHorizontal = self.get('_DataFrameFormat').horizontal.org.length
			var arr = self.get('_DataFrameFormat').vertical.org[$i]
			var _baseNumber = $i == 0 ? self.get('_baseNumber') : self.get('_baseNumberRight')
			var tmpData = []
			for (var a = 0, al = arr.length; a < al; a++ ) {
				var x = self.get('_dis_graphs') + a / (maxHorizontal - 1) * self.get('_horizontalDrawW')
				x = isNaN(x) ? 0 : x
				if($i == 1 && al == 1){
					x = self.get('_horizontalDrawW')
				}
				var y = -self.get('_dis_graphs') - (arr[a] - _baseNumber) / (maxVertical - _baseNumber) * self.get('_verticalDrawH')
				y = isNaN(y) ? 0 : Global.ceil(y)                                                    
				tmpData[a] = {'value':arr[a], 'x':x,'y':y} 
			}
			self.get('_DataFrameFormat').graphs.data.push(tmpData)
			self.get('_DataFrameFormat').graphs.disX = self._getGraphsDisX()
		},
		//每两个点之间的距离
		_getGraphsDisX:function(){
			var self = this
			return self.get('_horizontalGraphsW') / (self.get('_DataFrameFormat').horizontal.org.length - 1)
		},

		_overHandler:function($o){
			clearTimeout(this.get('_timeoutId'));
			var index = $o.index
			var id = $o.id

			var x = Number($o.x)// + Number(this.get('_graphs').get('element').get('_x'))
			var y = Number($o.y)// + Number(this.get('_graphs').get('element').get('_y'))
			var base_fill = $o.fill_over
			var data = []
			for (var a = 0, al = this.get('_DataFrameFormat').vertical.names.length; a < al; a++ ) {
				data[a] = []
				var o = { }
				o.content = this.get('_DataFrameFormat').vertical.names[a], o.fill = this.get('config').fills.overs[a], o.font = '微软雅黑',o.ver_align = 3
				data[a].push(o)
				o = { }
				o.content = this.get('_DataFrameFormat').vertical.org[a][id], o.fill = this.get('config').fills.overs[a], o.font = 'Tahoma',o.ver_align = 1
				data[a].push(o)
			}
			var tmp = data[index]
			data.splice(index,1)
			data.unshift(tmp)

			var o = {
				w    : this.get('w'),
				h    : this.get('h'),
				parent : this.get('element'),
				
				info:{
					x    : x,
					y    : y,
					data : data,
					base_fill : base_fill
				},
				light:{
					is   : 1,
					x    : x,
					y    : y,
					fill : base_fill
				},
				hLine:{
					is   : 1,
					x    : x,
					y    : this.get('_graphs').get('element').get('_y')
				}
			}

			var pre = this.get('_DataFrameFormat').horizontal.org[id]
			var content = this.get('_DataFrameFormat').horizontal.name + pre

			o.hInfo = {
				is   : 1,
				x    : x,
				y    : this.get('_graphs').get('element').get('_y'),
				content : content
			}
			for(var a = 0, al = $o.other.length; a < al; a++){
				$o.other[a].x = Number($o.other[a].x) +  Number(this.get('_graphs').get('element').get('_x'))
				$o.other[a].y = Number($o.other[a].y) +  Number(this.get('_graphs').get('element').get('_y'))
			}
			o.other = {
				is   : 1,
				os   : $o.other
			}

			this.get('_infos').update(o)

			this.get('_graphs').induce({index:$o.index,id:$o.id},true)
			 
		},
		_outHandler:function($o){
			var self = this
			this.set('_timeoutId', setTimeout(function(){self._outTimeout()}, self.get('_timeoutDelay')))
			this.get('_graphs').induce({index:$o.index,id:$o.id},false)
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
			// DataFrameFormat.info = DataSource.info
			DataFrameFormat.vertical.names = DataSource.vertical.names
			DataFrameFormat.vertical.org = DataSource.vertical.data
			// DataFrameFormat.horizontal.name = DataSource.horizontal.name
			DataFrameFormat.horizontal.org = DataSource.horizontal.data

			return DataFrameFormat
		}
	});

	return Widget;

	}, {
	    requires:['base','node','../../../pub/utils/global','../../../pub/utils/datasection','../../../pub/utils/svgelement',
	    		  '../../../pub/views/vertical','../../../pub/views/horizontal','../../../pub/views/back','../../../pub/views/globalinduce','../../../pub/views/infos/infos','../../../pub/models/eventtype','../../../pub/views/line/graphs'

	    ]
	}
);
KISSY.add('brix/gallery/charts/js/e/map/main',function(S,Base,Global,SVGElement,Widget,List,DataParse,DataTrim,ConfigParse,EventType){
	function Main(){

		var self = this

		/*
			arguments:

			  o:{
				parent   :''     //SVGElement
				w        :100    //chart 宽
				h        :100    //chart 高
				config   :''     //图表配置
				data     :''     //图表数据  
			  }

		 */
		Main.superclass.constructor.apply(self,arguments);

		self.init()
	}

	Main.ATTRS = {
		_main:{
			value:null
		},
		_config:{                //图表配置   经过ConfigParse.parse
			value:{}
		},
		_DataSource:{
			value:{}             //图表数据源 经过DataParse.parse
		},
		_data:{
			value:[]            //渲染完之后的数据集合
		},

		_widget:{
			value:null
		},
		_list:{
			value:null
		},
		_dis:{
			value:120
		}
	}

	S.extend(Main,Base,{
		init:function(){
			var self = this
			
			self.set('_DataSource', new DataParse().parse(self.get('data'))) 
			self.set('_config', new ConfigParse().parse(self.get('config')))
			self.get('_DataSource').data = new DataTrim().parse(self.get('_DataSource').values.data,self.get('_config'))
			self._widget()	
		},

		_widget:function(){
			var self = this
			var config = self.get('_config')   
			
			self.set('_main',new SVGElement('g'))
			self.get('_main').attr({'class':'main'});
			self.get('parent').appendChild(self.get('_main').element)
			self.get('_main').transformXY(Global.N05, Global.N05)

			var w =  self.get('w'), h = self.get('h')
			if(config.list.is){
				w = w - self.get('_dis')
				self.set('_list', new List({parent:self.get('_main')}))
			}

			var o = {}
			o.parent = self.get('_main')                       //SVGElement
			o.w = w                                            //chart 宽
			o.h = h                                            //chart 高
			o.DataSource = self.get('_DataSource')             //图表数据源
			o.config = config                                  //图表配置
			self.set('_widget', new Widget(o))
			self.get('_widget').get('element').on(EventType.OVER,function($o){self._overHandler($o)})
			self.get('_widget').get('element').on(EventType.OUT,function($o){self._outHandler($o)})
			self.get('_widget').get('element').on(EventType.COMPLETE,function($o){self._completeHandler($o)})
		},

		_getInfo:function(){
			var self = this
			var config = self.get('_config')
			var data = self.get('_data').order
			var arr = []
			for (var a = 0, al = data.length; a < al; a++ ) {
				var o = data[a]
				if(o && o.order){

					if(!config.list.max || config.list.max > a){
						arr[a] = []
						arr[a].push({content:o.order, bold:1, fill:config.list.font.fill.normal, size:12, ver_align:3})
						arr[a].push({content:o.name,  bold:1, fill:config.list.font.fill.normal, size:12, ver_align:1})
						arr[a].push({content:o.scale, bold:1, fill:config.list.font.fill.normal, size:12, ver_align:3})
					}
				}
			}
			return arr
		},

		_completeHandler:function(){
			var self = this
			var config = self.get('_config')
			if(config.list.is){
				self.set('_data', self.get('_widget').getData())

				// self.set('_list', new List())
				var o = {
					parent : self.get('_main'),
					data   : self._getInfo()
				}
				self.get('_list').widget(o)
				var w =  self.get('w'), h = self.get('h')
				var x = self.get('_widget').getMap().get('element').get('_x')
				x =  w - self.get('_dis') - x + 30
				var y = (h - self.get('_list').get('h')) / 2
				x = Global.ceil(x), y = Global.ceil(y)
				self.get('_list').get('element').transformXY(x,y)
			}
		},

		_overHandler:function($o){
			var self = this
			var config = self.get('_config')
			if(self.get('_list')){
				var o = $o
				o.is = 1
				o.index = Number($o.order) - 1
				o.mode  = 2
				o.fill  = config.list.font.fill.over
				self.get('_list').induce(o)
			}
		},
		_outHandler:function($o){
			var self = this
			if(self.get('_list')){
				var o = $o
				o.is = 0
				o.index = Number($o.order) - 1
				o.mode  = 2
				self.get('_list').induce(o)
			}
		},
	});

	return Main;

	}, {
	    requires:['base','../../pub/utils/global','../../pub/utils/svgelement','./view/widget','../../pub/views/list/graphs','../../pub/controls/map/dataparse','../../pub/controls/map/datatrim','../../pub/controls/map/configparse','../../pub/models/eventtype']
	}
);
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
KISSY.add('brix/gallery/charts/js/e/pie/main',function(S,Base,Global,SVGElement,DataParse,ConfigParse,EventType,Widget,List){
	function Main(){

		var self = this

		/*
			arguments:

			  o:{
				parent   :''     //SVGElement
				w        :100    //chart 宽
				h        :100    //chart 高
				config   :''     //图表配置
				data     :''     //图表数据  
			  }

		 */
		Main.superclass.constructor.apply(self,arguments);

		self.init()
	}

	Main.ATTRS = {
		_main:{
			value:null
		},
		_config:{                //图表配置   经过ConfigParse.parse
			value:{}
		},
		_DataSource:{
			value:{}             //图表数据源 经过DataParse.parse
		},
		_data:{
			value:[]             //渲染完之后的数据集合
		},

		_widget:{
			value:null
		},
		_list:{
			value:null
		}
	}

	S.extend(Main,Base,{
		init:function(){
			var self = this
			
			self.set('_DataSource', new DataParse().parse(self.get('data'))) 
			self.set('_config', new ConfigParse().parse(self.get('config'))) 

			self._widget()	
		},

		_widget:function(){
			var self = this
			var config = self.get('_config')   

			self.set('_main',new SVGElement('g'))
			self.get('_main').attr({'class':'main'});
			self.get('parent').appendChild(self.get('_main').element)
			self.get('_main').transformXY(Global.N05,Global.N05)

			var w =  self.get('w'), h = self.get('h')
			if(config.list.is){
				w = w - 120
				self.set('_list', new List({parent:self.get('_main')}))
			}

			var tmpW = w, tmpH = h
			if(config.w){
				tmpW = config.w
			}
			if(config.h){
				tmpH = config.h
			}

			var o = {}
			o.parent = self.get('_main')                       //SVGElement
			o.w = tmpW                                         //chart 宽
			o.h = tmpH                                         //chart 高
			o.maxW = self.get('w')                             //chart最大宽 当配置w h 时使用该值给infos
			o.maxH = self.get('h')                             //chart最大高 当配置w h 时使用该值给infos
			o.DataSource = self.get('_DataSource')             //图表数据源
			o.config = self.get('_config')                     //图表配置
			self.set('_widget', new Widget(o))
			self.get('_widget').get('element').on(EventType.OVER,function($o){self._overHandler($o)})
			self.get('_widget').get('element').on(EventType.OUT,function($o){self._outHandler($o)})
			self.get('_widget').get('element').on(EventType.CLICK,function($o){self._clickHandler($o)})

			var widget = self.get('_widget')
			var pie = self.get('_widget').getPie()
			if(config.x){
				// pie.get('element').transformX(config.x)
				widget.setTransformX(config.x)
			}else if(config.list.is){
				// pie.get('element').transformX(parseInt((self.get('w') - 120) / 2))
				widget.setTransformX(parseInt((self.get('w') - 120) / 2))
			}else{
				// pie.get('element').transformX(parseInt(self.get('w') / 2))
				widget.setTransformX(parseInt(self.get('w') / 2))
			}

			if(config.y){
				// pie.get('element').transformY(config.y)
				widget.setTransformY(config.x)
			}else if(config.list.is){
				// pie.get('element').transformY(parseInt(self.get('h') / 2))
				widget.setTransformY(parseInt(self.get('h') / 2))
			}else{
				// pie.get('element').transformY(parseInt(self.get('h') / 2))
				widget.setTransformY(parseInt(self.get('h') / 2))
			}
			if(config.list.is){
				self.set('_data', self.get('_widget').getData())
				
				var o = {
					parent : self.get('_main'),
					data   : self._getInfo()
				}
				self.get('_list').widget(o)
				
				var x = Number(pie.get('element').get('_x')) + Number(pie.get('mw') / 2) + 16
				var y = (h - self.get('_list').get('h')) / 2
				x = Global.ceil(x), y = Global.ceil(y)

				if(config.list.x){
					self.get('_list').get('element').transformX(config.list.x)
				}else{
					self.get('_list').get('element').transformX(x)
				}

				if(config.list.y){
					self.get('_list').get('element').transformY(config.list.y)
				}else{
					self.get('_list').get('element').transformY(y)
				}
				// self.get('_list').get('element').transformXY(x,y)
			}
		},

		_getInfo:function(){
			var self = this
			var config = self.get('_config')
			var data = self.get('_data').order
			var arr = []
			for (var a = 0, al = data.length; a < al; a++ ) {
				var o = data[a]

				if(o && o.order){

					if(!config.list.max || config.list.max > a){
						arr[a] = []
						arr[a].push({content:o.name, bold:1, fill:'#333333', size:12, ver_align:3, sign: { has:1, trim:1, fill:o.normal, disX:8}})
						var content = o.scale
						if(config.list.content.mode == 1){
							var content = o.data
						}
						arr[a].push({content:content, bold:1, fill:'#333333', size:12, ver_align:3})
					}
				}
			}
			return arr
		},

		_overHandler:function($o){
			var self = this
			if(self.get('_list')){
				var o = $o
				o.is = 1
				self.get('_list').induce(o)
			}
		},
		_outHandler:function($o){
			var self = this
			if(self.get('_list')){
				var o = $o
				o.is = 0
				self.get('_list').induce(o)
			}
		},
		_clickHandler:function($o){
			this.fire('elementClick',$o)
		},
	});

	return Main;

	}, {
	    requires:['base','../../pub/utils/global','../../pub/utils/svgelement','../../pub/controls/pie/dataparse','../../pub/controls/pie/configparse','../../pub/models/eventtype','./view/widget','../../pub/views/list/graphs']
	}
);
KISSY.add('brix/gallery/charts/js/e/pie/view/widget',function(S,Base,Node,Global,DataSection,SVGElement,GlobalInduce,Infos,EventType,Graphs){
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
		maxW:{
			value:0
		},
		maxH:{
			value:0
		},
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
					indexs:'',             //String 索引字符串[1,2,3]
					data  :[]              //Array indexs split之后的数组
				},
				values:{
					names :[],             //原始名称数组
					org   :[],             //原始数据数组(未排序)
					data  :[],             //排序后的数据(大->小 纯org的排序)
					all   :[],             //排序后的数据对象集合[{names:,data:},{}]
					order :[]              //Array  需要list时 排序之后的数据 根据data中的value
				}
			}
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

		_dis:{
			value:20                     //上、下、左、右的距离
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
			var config = self.get('config')

			self.set('_DataFrameFormat',self.DataExtend(self.get('_DataFrameFormat'),self.get('DataSource'))) 
			if(config.order.mode == 1){
				self.get('_DataFrameFormat').values.data = S.clone(self.get('_DataFrameFormat').values.org).sort(function(a,b){return b-a;}); 
			}else if(config.order.mode == 0){
				self.get('_DataFrameFormat').values.data = S.clone(self.get('_DataFrameFormat').values.org)
			}
			self.get('_DataFrameFormat').values.all = self._trimData()
			self.get('_DataFrameFormat').values.order = self.get('_DataFrameFormat').values.all

			self._widget()
		},

		getData:function(){
			var self = this
			return S.clone(self.get('_DataFrameFormat').values)
		},

		getPie:function(){
			var self = this
			return self.get('_graphs')
		},
		setTransformX:function($n){
			var self = this
			self.get('_graphs').get('element').transformX($n)
			self.get('_induces').get('element').transformX($n)
		},
		setTransformY:function($n){
			var self = this
			self.get('_graphs').get('element').transformY($n)
			self.get('_induces').get('element').transformY($n)
		},

		_widget:function(){
			var self = this
			var config = self.get('config')
			self.set('element', new SVGElement('g')), self.get('element').set('class','widget')
			self.get('parent').appendChild(self.get('element').element)

			self.set('_graphs',new Graphs())
			self.set('_infos',new Infos())
			self.set('_globalInduce', new GlobalInduce())
			self.set('_induces',new Graphs())

			var n = parseInt(Math.min(self.get('w'), self.get('h'))) - self.get('_dis')
			var o = {
				x     : parseInt(self.get('w')/2),
				y     : parseInt(self.get('h')/2),
				parent: self.get('element'),
				data  : self.get('_DataFrameFormat').values.data,
				mw    : n,
				mh    : n,
				xr    : n / 2 - config.dis,
				yr    : n / 2 - config.dis,
				tr    : (n / 2 - config.dis) * 0.6,
				font  : self.get('config').font
			}
			if(self.get('config').fills.normals.length > 0){
				o.fills = self._getArrayForObjectPro(self.get('_DataFrameFormat').values.all,'normal')
				o.fills_over = self._getArrayForObjectPro(self.get('_DataFrameFormat').values.all, 'over')
			}
			self.get('_graphs').init(o)
			self.get('_graphs').get('element').transformXY(parseInt(self.get('w')/2),parseInt(self.get('h')/2))

			self.get('_infos').init({parent:self.get('element')})
			var o = {
				w     : self.get('w'),
				h     : self.get('h'),
				parent: self.get('element'),
				opacity : Global.N00001
				// opacity : 0.1
			}
			self.get('_globalInduce').init(o)

			var o = {
				x     : parseInt(self.get('w')/2),
				y     : parseInt(self.get('h')/2),
				parent: self.get('element'),
				id    : 'induces',
				data  : self.get('_DataFrameFormat').values.data,
				isInduce   : 1,
				mw    : n,
				mh    : n,
				xr    : n / 2 - config.dis,
				yr    : n / 2 - config.dis,
				tr    : (n / 2 - config.dis) * 0.6,
				font  : self.get('config').font
			}
			if(self.get('config').fills.normals.length > 0){
				o.fills = self._getArrayForObjectPro(self.get('_DataFrameFormat').values.all,'normal')
				o.fills_over = self._getArrayForObjectPro(self.get('_DataFrameFormat').values.all, 'over')
			}
			self.get('_induces').init(o)
			self.get('_induces').get('element').on(EventType.OVER,function($o){self._overHandler($o)})
			self.get('_induces').get('element').on(EventType.MOVE,function($o){self._moveHandler($o)})
			self.get('_induces').get('element').on(EventType.OUT,function($o){self._outHandler($o)})
			self.get('_induces').get('element').on(EventType.CLICK,function($o){self._clickHandler($o)})
			self.get('_induces').get('element').transformXY(parseInt(self.get('w')/2),parseInt(self.get('h')/2))
		},

	 	_trimData:function(){
	 		var self = this
	 		var config = self.get('config')
			var arr = []
			for (var a = 0, al = self.get('_DataFrameFormat').values.org.length; a < al; a++ ) {
				var o = { }
				o.name = self.get('_DataFrameFormat').values.names[a]
				o.data = Number(self.get('_DataFrameFormat').values.org[a])
				if(self.get('config').fills.order == 1){
					o.normal = self.get('config').fills.normals[a] ? self.get('config').fills.normals[a] : ''
					o.over = self.get('config').fills.overs[a] ? self.get('config').fills.overs[a] : ''
				} 
				arr.push(o)
			}
			
			if(config.order.mode == 1){
				// arr.sort(function(o1,o2){return o1.data < o2.data})
				arr.sort(function(a,b){return b.data-a.data;})
			}

			for(var b = 0, bl = arr.length; b < bl; b++ ) {
				var o  = arr[b]
				if(self.get('config').fills.order == 0){
					o.normal = self.get('config').fills.normals[b] ? self.get('config').fills.normals[b] : ''
					o.over = self.get('config').fills.overs[b] ? self.get('config').fills.overs[b] : ''
				}
			}
			if(self.get('config').list.is){
				var values = self.get('_DataFrameFormat').values.data
				var scales = Global.getArrScales(values, self.get('config').font.exact)
				for(var c = 0, cl = arr.length; c < cl; c++ ) {
					var o  = arr[c]
					o.order = c + 1
					o.scale = scales[c] + '%'
				}
			}
			if(self.get('config').font.is == 0){
				self.get('config').dis = 0
			}
			return arr
		},

		//从一个对象数组中提取 相同对象属性的值组合成数组 并返回
		_getArrayForObjectPro:function($arr,$pro) {
			var arr = []
			for (var a = 0, al = $arr.length; a < al; a++ ) {
				var o = $arr[a]
				arr.push(o[$pro])
			}
			return  arr
		},

		_overHandler:function($o){
			this.get('_graphs').induce({index:$o.index},true)
			this.get('element').fire(EventType.OVER,$o)
		},
		_moveHandler:function($o){
			clearTimeout(this.get('_timeoutId'));
			var index = $o.index
			var x = Number($o.x)// + Number(this.get('_graphs').get('element').get('_x'))
			var y = Number($o.y)// + Number(this.get('_graphs').get('element').get('_y'))
			// debugger;			
			var base_fill = $o.fill_over
			var data = []
			data[0] = []
			var o = { }
			o.content = this.get('_DataFrameFormat').values.all[index].name + '  '
			data[0].push(o)
			o = { }
			o.content = $o.contents
			data[0].push(o)

			var o = {
				w    : this.get('maxW'),
				h    : this.get('maxH'),
				parent : this.get('element'),

				info:{
					x    : x,
					y    : y,
					data : data,
					base_fill : base_fill
				},
				hLine:{
					is   : 0
				},
				hInfo:{
					is   : 0
				}
			}

			this.get('_infos').update(o)
		},
		_outHandler:function($o){
			var self = this
			this.set('_timeoutId', setTimeout(function(){self._outTimeout()}, self.get('_timeoutDelay')))

			this.get('_graphs').induce({index:$o.index},false)
			this.get('element').fire(EventType.OUT,$o)
		},
		_outTimeout:function(){
			this.get('_infos').remove()
		},
		_clickHandler:function($o){
			this.get('element').fire(EventType.CLICK,$o)
		},
		/**
		 * 数据继承
		 * @type {Object}
		 */
		DataExtend:function(DataFrameFormat,DataSource){
			// DataFrameFormat.key.indexs = DataSource.key.indexs
			DataFrameFormat.values.names = DataSource.values.names
			DataFrameFormat.values.org = DataSource.values.data

			return DataFrameFormat
		}
	});

	return Widget;

	}, {
	    requires:['base','node','../../../pub/utils/global','../../../pub/utils/datasection','../../../pub/utils/svgelement','../../../pub/views/globalinduce','../../../pub/views/infos/infos','../../../pub/models/eventtype','../../../pub/views/pie/graphs'
	    ]
	}
);
KISSY.add('brix/gallery/charts/js/e/scatter/main',function(S,Base,Global,SVGElement,Widget,DataParse,ConfigParse){
	function Main(){

		var self = this

		/*
			arguments:

			  o:{
				parent   :''     //SVGElement
				w        :100    //chart 宽
				h        :100    //chart 高
				config   :''     //图表配置
				data     :''     //图表数据  
			  }

		 */
		Main.superclass.constructor.apply(self,arguments);

		self.init()
	}

	Main.ATTRS = {
		_main:{
			value:null
		},
		_config:{                //图表配置   经过ConfigParse.parse
			value:{}
		},
		_DataSource:{
			value:{}             //图表数据源 经过DataParse.parse
		}
	}

	S.extend(Main,Base,{
		init:function(){
			var self = this
			
			self.set('_DataSource', new DataParse().parse(self.get('data'))) 
			self.set('_config', new ConfigParse().parse(self.get('config'))) 

			self._widget()	
		},

		_widget:function(){
			var self = this
			
			self.set('_main',new SVGElement('g'))
			self.get('_main').attr({'class':'main'});
			self.get('parent').appendChild(self.get('_main').element)
			self.get('_main').transformXY(Global.N05,Global.N05)

			var o = {}
			o.parent = self.get('_main')                       //SVGElement
			o.w = self.get('w')                                //chart 宽
			o.h = self.get('h')                                //chart 高
			o.DataSource = self.get('_DataSource')             //图表数据源
			o.config = self.get('_config')                     //图表配置

			new Widget(o)
		}
		
	});

	return Main;

	}, {
	    requires:['base','../../pub/utils/global','../../pub/utils/svgelement','./view/widget','../../pub/controls/scatter/dataparse','../../pub/controls/scatter/configparse']
	}
);
KISSY.add('brix/gallery/charts/js/e/scatter/view/widget',function(S,Base,Node,Global,DataSection,SVGElement,Vertical,Horizontal,Back,GlobalInduce,Infos,EventType,Graphs){
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
					org:[],                  //原始二维数据[256,10,432,379...100]
					section:[],              //分段之后数据[200,400,600,800...1200]
					data:[]                  //转换坐标后的数据  =>Vertical.data、Back.data_hor
				},
				horizontal:{             //横轴
					name:'',                 //名称[维度2]
					org:'',                  //原始数据[1000,2000,3000,4000...38000]
					section:[],              //分段之后数据[500,10000,15000,20000...40000]
					data:[]                  //转换坐标后的数据  =>Horizontal.data
				},
				graphs:{                 //图形
					data:[]                  //转换坐标后的数据
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
		_globalInduce:{
			value:null                   //全局感应区
		},
		_induces:{
			value:null                   //感应区
		},

		_disX:{
			value:6                      //左、右的距离
		},
		_disY:{
			value:10                     //上、下的距离
		},
		_dis_line:{
			value:10                     //纵向最高的线与最高高度最小相差的像素 而横向最右边的小线与最宽宽度也是最小相差该像素
		},          
		_dis_graphs:{
			value:10                     //在图形中 由于考虑到圆本身的半径  实际图形中的左、下都必须预留的像素差   右、上预留的像素差的最小值也是此值
		},

		_verticalMaxH:{
			value:0                      //纵向最大的高
		},
		_verticalGraphsH:{
			value:0                      //最上面的第一条线到原点之间的高度
		},
		_verticalDrawH:{
			value:0                      //图形区域由于考虑到圆的半径 因此圆必须高出最下面_dis_graphs个像素 而此值代表最上面的第一条线到_dis_graphs之间的距离
		},
		_horizontalMaxW:{
			value:0                      //横向最大的宽
		},
		_horizontalGraphsW:{
			value:0                      //图形区域真正的宽(最右边的第一条线到原点之间的高度)
		},
		_horizontalDrawW:{
			value:0                      //图形区域由于考虑到圆的半径 因此圆必须高出最右边_dis_graphs个像素
		},
		_timeoutId:{
			value:0                      
		},
		_timeoutDelay:{
			value:800                    
		},
	}

	S.extend(Widget,Base,{
		init:function(){
			var self = this

			self.set('_DataFrameFormat',self.DataExtend(self.get('_DataFrameFormat'), self.get('DataSource'))) 
			self.get('_DataFrameFormat').key.data = String(self.get('_DataFrameFormat').key.indexs).split(',')
			self.get('_DataFrameFormat').vertical.section = DataSection.section(self.get('_DataFrameFormat').vertical.org, null, {mode:1})
			self.get('_DataFrameFormat').horizontal.section = DataSection.section(self.get('_DataFrameFormat').horizontal.org, null, {mode:1})

			self._widget()
		},

		_widget:function(){
			var self = this
			self.set('element', new SVGElement('g')), self.get('element').set('class','widget')
			self.get('parent').appendChild(self.get('element').element)

			self.set('_vertical',new Vertical())
			self.set('_horizontal',new Horizontal())
			self.set('_back',new Back())
			self.set('_graphs',new Graphs())
			self.set('_infos',new Infos())
			self.set('_globalInduce', new GlobalInduce())
			self.set('_induces',new Graphs())
			
			self._trimVertical()
			var o = {
				parent : self.get('element'),
				data   : self.get('_DataFrameFormat').vertical.data
			}
			self.get('_vertical').init(o)
			self.get('_vertical').get('element').transformXY(self.get('_disX'), self.get('h') - self.get('_horizontal').get('h') - self.get('_disY'))

			self._trimHorizontal()
			var o = {
				w      : self.get('_horizontalMaxW'),
				parent : self.get('element'),
				data   : self.get('_DataFrameFormat').horizontal.data,
				dis_left : self.get('_disX') + self.get('_vertical').get('w') - self.get('_disX')
			}
			self.get('_horizontal').init(o)
			self.get('_horizontal').get('element').transformXY(self.get('_disX') + self.get('_vertical').get('w'), self.get('h') -  self.get('_horizontal').get('h') - self.get('_disY'))
			
			self._trimGraphs()

			var o = {
				w      : self.get('_horizontalMaxW'),
				h      : self.get('_verticalMaxH'),
				parent : self.get('element'),
				data_hor : self.get('_DataFrameFormat').vertical.data,
				data_ver : self.get('_horizontal').getShowData(),
				h_ver    : self.get('_verticalGraphsH'),
			}
			self.get('_back').init(o)
			self.get('_back').get('element').transformXY(self.get('_disX') + self.get('_vertical').get('w'), self.get('h') -  self.get('_horizontal').get('h') - self.get('_disY'))

			var o = {
				x     : self.get('_disX') + self.get('_vertical').get('w') + Global.N05,
				y     : self.get('h') -  self.get('_horizontal').get('h') - self.get('_disY') + Global.N05,
				w     : self.get('_horizontalGraphsW'),
				h     : self.get('_verticalGraphsH'),
				parent: self.get('element'),
				data  : self.get('_DataFrameFormat').graphs.data,
				style : self.get('config').style
			}
			
			self.get('_graphs').init(o)
			self.get('_graphs').get('element').transformXY(self.get('_disX') + self.get('_vertical').get('w') + Global.N05, self.get('h') -  self.get('_horizontal').get('h') - self.get('_disY') + Global.N05)

			self.get('_infos').init({parent:self.get('element')})

			var o = {
				w     : self.get('w'),
				h     : self.get('h'),
				parent: self.get('element'),
				opacity : Global.N00001,
			}
			self.get('_globalInduce').init(o)
			
			var o = {
				x     : self.get('_disX') + self.get('_vertical').get('w') + Global.N05,
				y     : self.get('h') -  self.get('_horizontal').get('h') - self.get('_disY') + Global.N05,
				w     : self.get('_horizontalGraphsW'),
				h     : self.get('_verticalGraphsH'),
				parent: self.get('element'),
				id    : 'induces',
				data  : self.get('_DataFrameFormat').graphs.data,
				isInduce   : 1,
				style : self.get('config').style
			}
			self.get('_induces').init(o)
			self.get('_induces').get('element').on(EventType.OVER,function($o){self._overHandler($o)})
			self.get('_induces').get('element').on(EventType.OUT,function($o){self._outHandler($o)})
			self.get('_induces').get('element').transformXY(self.get('_disX') + self.get('_vertical').get('w') +Global.N05, self.get('h') -  self.get('_horizontal').get('h') - self.get('_disY') + Global.N05)

		},

		//换算纵向
		_trimVertical:function(){
			var self = this
			self.set('_verticalMaxH', self.get('h') - self.get('_disY') - self.get('_horizontal').get('h') - self.get('_disY'))
			self.set('_verticalGraphsH', self.get('_verticalMaxH') - self._getVerticalDisY())
			self.set('_verticalDrawH', self.get('_verticalGraphsH') - self.get('_dis_graphs'))
			var max = self.get('_DataFrameFormat').vertical.section[self.get('_DataFrameFormat').vertical.section.length - 1]
			var arr = self.get('_DataFrameFormat').vertical.section
			var tmpData = []
			for (var a = 0, al = arr.length; a < al; a++ ) {
				var y = -self.get('_dis_graphs') - arr[a] / max * self.get('_verticalDrawH')                                    
				y = isNaN(y) ? 0 : Global.ceil(y)                                                    
				tmpData[a] = { 'value':arr[a], 'y': y }
			}
			self.get('_DataFrameFormat').vertical.data = tmpData
		},
		//获取纵向总高到第一条线之间的距离
		_getVerticalDisY:function(){
			var self = this
			var disMin = self.get('_dis_line')
			var disMax = 2 * self.get('_dis_line')
			var dis = disMin
			dis = disMin + self.get('_verticalMaxH') % self.get('_DataFrameFormat').vertical.section.length   //Q3  DataFrameFormat.vertical.section.length
			dis = dis > disMax ? disMax : dis
			return dis
		},
		//换算横向
		_trimHorizontal:function(){
			var self = this
			self.set('_horizontalMaxW', self.get('w') - self.get('_disX') - self.get('_vertical').get('w') - self.get('_disX'))
			self.set('_horizontalGraphsW', self.get('_horizontalMaxW') - self._getHorizontalDisX())
			self.set('_horizontalDrawW', self.get('_horizontalGraphsW') - self.get('_dis_graphs'))
			var max = self.get('_DataFrameFormat').horizontal.section[self.get('_DataFrameFormat').horizontal.section.length - 1]
			var arr = self.get('_DataFrameFormat').horizontal.section
			var tmpData = []
		    for (var a = 0, al  = arr.length; a < al; a++ ) {
				tmpData.push( { 'value':arr[a], 'x':Global.ceil(self.get('_dis_graphs') + arr[a] / max * self.get('_horizontalDrawW')) } )
			}
			self.get('_DataFrameFormat').horizontal.data = tmpData
		},
		//获取横向总宽到第一条线之间的距离
		_getHorizontalDisX:function(){
			var self = this
			var disMin = self.get('_dis_line')
			var disMax = 2 * self.get('_dis_line')
			var dis = disMin
			dis = disMin + self.get('_horizontalMaxW') % self.get('_DataFrameFormat').horizontal.org.length 
			dis = dis > disMax ? disMax : dis
			return dis
		},
		//换算图形
		_trimGraphs:function(){   
			var self = this                                                           
			var maxVertical = self.get('_DataFrameFormat').vertical.section[self.get('_DataFrameFormat').vertical.section.length - 1]
			var maxHorizontal = self.get('_DataFrameFormat').horizontal.section[self.get('_DataFrameFormat').horizontal.section.length - 1]
			var arr = self.get('_DataFrameFormat').vertical.org
			var tmpData = []
			for (var a = 0, al = arr.length; a < al; a++ ) {
				tmpData[a] = {'value':arr[a], 'x':self.get('_dis_graphs') + self.get('_DataFrameFormat').horizontal.org[a] / maxHorizontal * self.get('_horizontalDrawW') ,'y':-self.get('_dis_graphs') - arr[a] / maxVertical * self.get('_verticalDrawH'),'key': { 'isKey':0 }} 
			}
			for (var d = 0, dl = self.get('_DataFrameFormat').key.data.length; d < dl; d++ ) {
				if (tmpData[self.get('_DataFrameFormat').key.data[d] - 1]) {
					tmpData[self.get('_DataFrameFormat').key.data[d] - 1].key.isKey = 1
				}
			}
			self.get('_DataFrameFormat').graphs.data = tmpData
		},

		_overHandler:function($o){
			clearTimeout(this.get('_timeoutId'));
			var index = $o.index
			var id = $o.id

			var x = Number($o.x) + Number(this.get('_graphs').get('element').get('_x'))
			var y = Number($o.y) + Number(this.get('_graphs').get('element').get('_y'))
			var base_fill = $o.fill_over
			var data = []
			data[0] = []
			var o = { }
			o.content = this.get('_DataFrameFormat').vertical.name
			data[0].push(o)
			o = { }
			o.content = this.get('_DataFrameFormat').graphs.data[index].value
			data[0].push(o)

			var o = {
				w    : this.get('w'),
				h    : this.get('h'),
				parent : this.get('element'),
				
				info:{
					x    : x,
					y    : y,
					data : data,
					base_fill : base_fill
				},
				light:{
					is   : 1,
					x    : x,
					y    : y,
					min_radius:5,
					fill : base_fill,
					max_radius:18,
					max_fill_opacity:Global.N00001
				},
				hLine:{
					is   : 1,
					x    : x,
					y    : this.get('_graphs').get('element').get('_y'),
					// y1   : -(this.get('_graphs').get('element').get('_y') - y)
				}
			}

			var pre = this.get('_DataFrameFormat').horizontal.org[index]
			var content = this.get('_DataFrameFormat').horizontal.name + pre

			o.hInfo = {
				is   : 1,
				x    : x,
				y    : this.get('_graphs').get('element').get('_y'),
				content : content
			}

			this.get('_infos').update(o)

			this.get('_graphs').induce({index:$o.index},true)
			 
		},
		_outHandler:function($o){
			var self = this
			this.set('_timeoutId', setTimeout(function(){self._outTimeout()}, self.get('_timeoutDelay')))
		},
		_outTimeout:function(){
			this.get('_infos').remove()
			this.get('_graphs').induce({},false)
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

			return DataFrameFormat
		}
	});

	return Widget;

	}, {
	    requires:['base','node','../../../pub/utils/global','../../../pub/utils/datasection','../../../pub/utils/svgelement',
	    		  '../../../pub/views/vertical','../../../pub/views/horizontal','../../../pub/views/back','../../../pub/views/globalinduce','../../../pub/views/infos/infos','../../../pub/models/eventtype','../../../pub/views/scatter/graphs'

	    ]
	}
);
KISSY.add('brix/gallery/charts/js/e/treemap/main', function(S, Base, d3) {
	function Main() {
		var self = this
		/*
			arguments:

			  o:{
				parent   :''     //SVGElement
				w        :100    //chart 宽
				h        :100    //chart 高
				config   :''     //图表配置
				data     :''     //图表数据  
			  }

		 */
		Main.superclass.constructor.apply(self, arguments);
		self.init()
	}

	Main.ATTRS = {
		_main: {
			value: null
		},
		_config: { //图表配置   经过ConfigParse.parse
			value: {}
		},
		_DataSource: {
			value: {} //图表数据源 经过DataParse.parse
		}
	}

	S.extend(Main, Base, {
		init: function() {
			var self = this

			// self.set('_DataSource', new DataParse().parse(self.get('data'))) 
			// self.set('_config', new ConfigParse().parse(self.get('config'))) 

			self._widget()
		},

		_widget: function() {
			var self = this
			var w = self.get('w'),
				h = self.get('h'),
				x = d3.scale.linear().range([0, w]),
				y = d3.scale.linear().range([0, h]),
				color = d3.scale.category20c(),
				root,
				node;
			var treemap = d3.layout.treemap()
				.round(false)
				.size([w, h])
				.sticky(true)
				.value(function(d) {
				return d.size;
			});

			var svg = d3.select(self.get('parent').element).append("svg:g").attr("transform", "translate(.5,.5)");


			node = root = self.get('data');

			var nodes = treemap.nodes(root).filter(function(d) {
				return !d.children;
			});

			var cell = svg.selectAll("g").data(nodes).enter().append("svg:g").attr("class", "cell").attr("transform", function(d) {
				return "translate(" + d.x + "," + d.y + ")";
			}).on("click", function(d) {
				return zoom(node == d.parent ? root : d.parent);
			});
			cell.append("svg:title").text(function(d) {
				return d.name;
			});
			cell.append("svg:rect").attr("width", function(d) {
				return d.dx;
			}).attr("height", function(d) {
				return d.dy;
			}).style("fill", function(d) {
				return color(d.parent.name);
			});

			cell.append("svg:text").attr("x", function(d) {
				return d.dx / 2;
			}).attr("y", function(d) {
				return d.dy / 2;
			}).attr("dy", ".35em").attr("text-anchor", "middle").text(function(d) {
				return d.name;
			}).style("visibility", function(d) {
				d.w = this.getComputedTextLength();
				return d.dx > d.w ? 'visible' : 'hidden';
			});

			function zoom(d) {
				var kx = w / d.dx,
					ky = h / d.dy;
				x.domain([d.x, d.x + d.dx]);
				y.domain([d.y, d.y + d.dy]);

				var t = svg.selectAll("g.cell").transition().duration(d3.event.altKey ? 7500 : 750).attr("transform", function(d) {
					return "translate(" + x(d.x) + "," + y(d.y) + ")";
				});

				t.select("rect").attr("width", function(d) {
					return kx * d.dx;
				}).attr("height", function(d) {
					return ky * d.dy;
				})

				t.select("text").attr("x", function(d) {
					return kx * d.dx / 2;
				}).attr("y", function(d) {
					return ky * d.dy / 2;
				}).style("visibility", function(d) {
					return kx * d.dx > d.w ? 'visible' : 'hidden';
				});

				node = d;
			}
		}
	});
	return Main;
}, {
	requires: ['base', './view/widget']
});
KISSY.add('brix/gallery/charts/js/e/treemap/view/widget', function(S,d3) {
    return d3;
}, {
    requires: ['brix/gallery/d3/']
});
KISSY.add('brix/gallery/charts/js/e/treemap2/main', function(S, Base, d3) {
	function Main() {
		var self = this
		/*
			arguments:

			  o:{
				parent   :''     //SVGElement
				w        :100    //chart 宽
				h        :100    //chart 高
				config   :''     //图表配置
				data     :''     //图表数据  
			  }

		 */
		Main.superclass.constructor.apply(self, arguments);
		self.init()
	}

	Main.ATTRS = {
		_main: {
			value: null
		},
		_config: { //图表配置   经过ConfigParse.parse
			value: {}
		},
		_DataSource: {
			value: {} //图表数据源 经过DataParse.parse
		}
	}

	S.extend(Main, Base, {
		init: function() {
			var self = this
			self._widget()
		},

		_widget: function() {
			var self = this
			var w = self.get('w'),
				h = self.get('h'),
				x = d3.scale.linear().range([0, w]),
				y = d3.scale.linear().range([0, h]),
				color = d3.scale.category20c(),
				root,
				node;
			var treemap = d3.layout.treemap()
				.round(false)
				.size([w, h])
				.sticky(true)
				.value(function(d) {
				return d.size;
			});

			var svg = d3.select(self.get('parent').element).append("svg:g").attr("transform", "translate(.5,.5)").attr('class', 'parent');

			node = root = self.get('data');

			var nodes = treemap.nodes(root).filter(function(d) {
				return !d.parent;
			});
			//appendChildren(nodes,root);
			appendChildren(root.children, root);

			// d3.select(window).on("click", function() {
			// 	zoom(root);
			// });

			function appendChildren(nodes, d) {
				var kx = w / d.dx,
					ky = h / d.dy;
				x.domain([d.x, d.x + d.dx]);
				y.domain([d.y, d.y + d.dy]);

				var cell = svg.selectAll(".parent").data(nodes).enter().append("svg:g").attr("class", "cell").attr("transform", function(d) {
					return "translate(" + x(d.x) + "," + y(d.y) + ")";
				}).on("click", function(d) {
					if (d3.event.button == 0) {
						if (d.children) {
							zoom(d, d3.select(this));
						} else {
							var parent = d.parent.parent;
							if (parent) {
								zoom(parent, (parent == root ? null : d3.select(this)));
							}
						}
					} else {
						var parent = d.parent.parent;
						if (parent) {
							zoom(parent, (parent == root ? null : d3.select(this)));
						}
					}
				}).on("contextmenu", function(d) {
					var parent = d.parent.parent;
					if (parent) {
						zoom(parent, (parent == root ? null : d3.select(this)));
					}
					d3.event.preventDefault()
				});
				cell.append("svg:title").text(function(d) {
					return d.name;
				});
				cell.append("svg:rect").attr("width", function(d) {
					return kx * d.dx;
				}).attr("height", function(d) {
					return ky * d.dy;
				}).style("fill", function(d) {
					return color(d.name);
				});
				cell.append("svg:text").attr("x", function(d) {
					return kx * d.dx / 2;
				}).attr("y", function(d) {
					return ky * d.dy / 2;
				}).attr("text-anchor", "middle").text(function(d) {
					return d.name;
				}).style("visibility", function(d) {
					d.w = this.getComputedTextLength();
					return kx * d.dx > d.w ? 'visible' : 'hidden';
				});
			}

			function zoom(d, context) {
				var kx = w / d.dx,
					ky = h / d.dy;
				S.log(kx)
				x.domain([d.x, d.x + d.dx]);
				y.domain([d.y, d.y + d.dy]);
				var flg = false;
				var t = svg.selectAll("g.cell").transition().duration(d3.event.altKey ? 7500 : 750).attr("transform", function(d) {
					return "translate(" + x(d.x) + "," + y(d.y) + ")";
				}).each("end", function(xx, i) {
					if (i == 1 && !flg) {
						flg = true;
						if (context) {
							context.select("text").style("visibility", 'hidden');
						} else {
							svg.selectAll(".cell").remove();
						}
						appendChildren(d.children, d);
					}
				});

				t.select("rect").attr("width", function(d) {
					return kx * d.dx;
				}).attr("height", function(d) {
					return ky * d.dy;
				})

				t.select("text").attr("x", function(d) {
					return kx * d.dx / 2;
				}).attr("y", function(d) {
					return ky * d.dy / 2;
				}).style("visibility", function(d) {
					return kx * d.dx > d.w ? 'visible' : 'hidden';
				});
			}
		}
	});
	return Main;
}, {
	requires: ['base', './view/widget']
})
KISSY.add('brix/gallery/charts/js/e/treemap2/view/widget', function(S,d3) {
    return d3;
}, {
    requires: ['brix/gallery/d3/']
});
KISSY.add('brix/gallery/charts/js/m/datasource/datasource',function(S,Base){

	function DataSource(){
		
		var self = this

		DataSource.superclass.constructor.apply(self,arguments);
	}

	DataSource.ATTRS = {
		o:{
			value:{
				type : '',
				data : ''
			}	
		},
		version:{
			value:{
				v1:'1.0'
			}
		}
	}

	S.extend(DataSource,Base,{
		parse:function($data,$type){
			var self = this
			var o
			var type = $type ? $type : 'xml'
			if(type == 'xml'){
				o = self._xml($data)
			}
			return o
		},
		_xml:function($data){
			var self = this
			var o
			var domParser = new DOMParser();
			var xmlDoc = domParser.parseFromString($data, 'text/xml');
			var __chart = xmlDoc.getElementsByTagName("chart")[0]
			var v = __chart && __chart.getAttribute('v') && String(__chart.getAttribute('v')) ? String(__chart.getAttribute('v')) : '1.0'
			if(v == self.get('version').v1){
				o = self._V1($data)
			}

			return o
		},
		_V1:function($data){
			var self = this
			var o = S.clone(self.get('o'))
			var domParser = new DOMParser();
			var xmlDoc = domParser.parseFromString($data, 'text/xml');
			var __chart = xmlDoc.getElementsByTagName("chart")[0]

			o.type = __chart.getAttribute('type') && String(__chart.getAttribute('type')) ? String(__chart.getAttribute('type')) : ''
			
			var __data = __chart.getElementsByTagName("data")[0]
			if(__data){
				o.data = (new XMLSerializer()).serializeToString(__chart.getElementsByTagName("data")[0])
			}
			
			return o
		}

	});

	return DataSource;

	}, {
	    requires:['base']
	}
);
KISSY.add('brix/gallery/charts/js/m/widget/widget',function(S,Base,Node,SVGElement){
	var $ = Node.all

	function Widget(){
		
		var self = this

		/*
			arguments:

			  o:{
				parent_id:''     //div id
				w        :100    //div 宽
				h        :100    //div 高
				type     :''     //图表类型[histogram = 直方图  |  line =  ]
				config   :''     //图表配置
				data     :''     //图表数据  
			  }

		 */
		Widget.superclass.constructor.apply(self,arguments);

		self.init()
	}

	Widget.ATTRS = {

		path_chart:{
			value:''             //图表路径[brix/gallery/charts/js/e/***/main]
		},

		_FileType:{              //文件类型
			value:{
				histogram : 'histogram',
				histogram2: 'histogram2',
				histogram3: 'histogram3',
				histogram4: 'histogram4',
				integrate : 'integrate',
				integrate2: 'integrate2',
				integrate3: 'integrate3',
				integrate4: 'integrate4',
				integrate5: 'integrate5',
				line      : 'line',
				line2     : 'line2',
				line3     : 'line3',
				pie       : 'pie',
				scatter   : 'scatter',
				map       : 'map',
				treemap		:'treemap',
				treemap2		:'treemap2'
			}
		},

		_svg:{
			value:null           //svg主节点
		},
		_main:{
			value:null           //main节点
		},
		_isDestroy:{
			value : false
		}
	}

	S.extend(Widget,Base,{
		init:function(){
			var self = this

			if(!self.get('type')){
				self.set('type', self.get('_FileType').histogram)
			}
			self.set('path_chart', self._getPath(self.get('_FileType')[self.get('type')]))
			self._widget()
		},
		//与外部case.js交互总接口
		actions:function($name,$value){
			var self = this
			self.set('_isDestroy', true)
		},

		_widget:function(){
			var self = this

			//展现
			S.use(self.get('path_chart'),function(S,Main){
				if(self.get('_isDestroy')){
	    				return
	    		}
				//删除svg内容
				var parent = $('#' + self.get('parent_id')).getDOMNode()
				if(parent && parent.lastChild) {parent.removeChild(parent.lastChild)}    

				self.set('_svg',new SVGElement('svg'))
				self.get('_svg').attr({'version':'1.1','width':self.get('w'),'height':self.get('h'),'xmlns':'http://www.w3.org/2000/svg', 'xmlns:xlink':'http://www.w3.org/1999/xlink'});
				//'zoomAndpan':"disable"    //禁止鼠标右键面板
	  			$('#' + self.get('parent_id')).append(self.get('_svg').element)
	  			self.get('_svg').set('style','cursor:default'), self.get('_svg').mouseEvent(false)

				var o = {}
				o.parent = self.get('_svg')                        //SVGElement
				o.w = self.get('w')                                //chart 宽
				o.h = self.get('h')                                //chart 高
				o.type = self.get('type')                          //图表类型
  				o.config = self.get('config')                      //配置
  				o.data = self.get('data')                          //图表数据

				self.set('_main',new Main(o))
				self.get('_main').on('elementClick',function($o){self._clickHandler($o)})
			})
		},

		_clickHandler:function($o){
			this.fire('elementClick',$o)
		},

		//获取图表js路径
		_getPath:function($name){
			var self = this
			return 'brix/gallery/charts/js/e/' + $name + '/' + 'main'
		}
	});

	return Widget;

	}, {
	    requires:['base','node','../../pub/utils/svgelement']
	}
);
KISSY.add('brix/gallery/charts/js/pub/controls/bar/configparse',function(S,Base,Node){
	var $ = Node.all

	function ConfigParse(){
		
		var self = this

		ConfigParse.superclass.constructor.apply(self,arguments);
	}

	ConfigParse.ATTRS = {
		o:{
			value:{
				v:'1.0',

				fills:[[ { normal:'#94CC5C', over:'#78A64B' }, { normal:'#458AE6', over:'#135EBF' }, { normal:'#FF0000', over:'#FF0000' }], [ { normal:'#CCCCCC', over:'#999999' }, { normal:'#999999', over:'#666666' }, { normal:'#0000FF', over:'#0000FF' }]]
			}
		}
	}

	S.extend(ConfigParse,Base,{
		parse:function($data,$type){
			var self = this

			var o = S.clone(self.o) 
			var type = $type ? $type : 'xml'
			if(type == 'xml'){
				o = self._xml($data)
			}
			return o
		},
		_xml:function($data){
			var self = this

			var o = S.clone(self.get('o')) 
			var data = String($data)
			var domParser = new DOMParser();
			var xmlDoc = domParser.parseFromString(data, 'text/xml');

			var __data = xmlDoc.getElementsByTagName("data")[0]
			if(!__data){
				return o
			}
				
			o.v = __data.getAttribute('v') && String(__data.getAttribute('v')) ? String(__data.getAttribute('v')) : o.v
			
			return o
		}
	});

	return ConfigParse;

	}, {
	    requires:['base','node']
	}
);
KISSY.add('brix/gallery/charts/js/pub/controls/bar/dataparse',function(S,Base,Node,Global){
	var $ = Node.all

	function DataParse(){
		
		var self = this

		DataParse.superclass.constructor.apply(self,arguments);
	}

	DataParse.ATTRS = {
		o:{
			value:{
				key:{                    //突出显示
					indexs:'',               //String 索引字符串[1,2,3]                             ->DataFrameFormat.key.indexs
					data:[]                  //Array indexs split之后的数组
				},
				vertical:{               //纵轴
					name:'',                 //名称[维度1]                                          ->DataFrameFormat.vertical.name
					data:[]                  //原始二维数据[[配置数据中每个队列第一个集合],[],[]]   ->DataFrameFormat.vertical.org
				},
				horizontal:{             //横轴
					name:'',                 //名称[维度2]                                          ->DataFrameFormat.horizontal.name
					names:[],                //名称集合(1:00,2:00,...,24:00)                        ->DataFrameFormat.horizontal.names
					start:{                  //原点
						name:'0'                 //名称[原点]                                       ->DataFrameFormat.horizontal.start.name
					},
					data:[]                  //原始数据[0.05,0.1,0.15,0.2,...,2.55]                 ->DataFrameFormat.horizontal.org
				}
			}
		}
	}

	S.extend(DataParse,Base,{
		parse:function($data,$type){
			var o
			var type = $type ? $type : 'xml'
			if(type == 'xml'){
				o = this._xml($data)
			}
			return o
		},

		_xml:function($data){
			var self = this
			var o = S.clone(self.get('o')) 
			var data = String($data.replace(/>\s*?</g, '><').replace(/\n+/g, '').replace(/\r+/g, ''))

			var domParser = new DOMParser();
			var xmlDoc = domParser.parseFromString(data, 'text/xml');
			var __indexAxis = xmlDoc.getElementsByTagName("indexAxis")[0]
			var __key = __indexAxis.getElementsByTagName('key')[0]
			var __start = __indexAxis.getElementsByTagName('start')[0]
			var __sets = xmlDoc.getElementsByTagName("sets")[0]

			//防止没有key节点
			o.key.indexs = __key && String(__key.getAttribute('indexs')) ? String(__key.getAttribute('indexs')) : o.key.indexs

			//__sets.getAttribute('name') 当没有name属性时 防止null
			o.vertical.name = __sets.getAttribute('name') && String(__sets.getAttribute('name')) ? String(__sets.getAttribute('name')) : o.vertical.name
			o.vertical.data = self._getItems(__sets.childNodes)

			o.horizontal.name = __indexAxis.getAttribute('name') && String(__indexAxis.getAttribute('name')) ? String(__indexAxis.getAttribute('name')) : o.horizontal.name
			o.horizontal.names = __indexAxis.getAttribute('names') && String(__indexAxis.getAttribute('names')) ? String(__indexAxis.getAttribute('names')).split(',') : o.horizontal.names
			o.horizontal.data = __indexAxis.getAttribute('labels') ? String(__indexAxis.getAttribute('labels')).split(',') : o.horizontal.data
			o.horizontal.start.name = __start && String(__start.getAttribute('name')) ? String(__start.getAttribute('name')) : o.horizontal.start.name
			return o
		},

		/*
		_getItems:function($list){
			var items = []
			var item;

			for (var a = 0, al = $list.length; a < al; a++) {
				item = $list[a]
				if(String(item.getAttribute('values'))){
					items.push(String(item.getAttribute('values')).split(','))
				}
			}
			return items
		}
		*/
		_getItems:function($list){
			var items = []
			
			for (var a = 0, al = $list.length; a < al; a++) {
				var item = $list[a]
				var o = { }
				o.name = item.getAttribute('name')
				o.data = []
				for (var b = 0, bl = $list[a].childNodes.length; b < bl; b++) {
					var item1 = $list[a].childNodes[b]
					var o1 = { }
					o1.name = item1.getAttribute('name')
					o1.signName = item1.getAttribute('name_sign')
					o1.data = item1.getAttribute('values') ? String(item1.getAttribute('values')).split(',') : []
					o1.value = item1.getAttribute('value') ? item1.getAttribute('value') : ''
					o1.total = Global.getArrMergerNumber(o1.data)
					o.data.push(o1)
				}
				items.push(o)
			}
			return items
		}
	});

	return DataParse;

	}, {
	    requires:['base','node','../../utils/global']
	}
);
KISSY.add('brix/gallery/charts/js/pub/controls/histogram/configparse',function(S,Base,Node){
	var $ = Node.all

	function ConfigParse(){
		
		var self = this

		ConfigParse.superclass.constructor.apply(self,arguments);
	}

	ConfigParse.ATTRS = {
		o:{
			value:{
				v:'1.0',

				fills:{
					normals:['#458AE6', '#39BCC0', '#5BCB8A', '#C3CC5C', '#E6B522', '#E68422'],
					overs  :['#135EBF', '#2E9599', '#36B26A', '#9CA632', '#BF9E39', '#BF7C39']
				},

				y_axis:{                //y轴
					data:{              //数据
						mode:0,         //模式(空或0 = 普通  |  1 = 比例)
						suffix:'%'      //后缀
					}
				},

				x_axis:{                //x轴
					layout:{            //布局
						mode:0          //模式(空或0 = 区间  |  1 = 对应轴)
					}
				},

				graphs:{                //图形
					layout:{            //布局
						mode:0          //模式(0 = 纵向 | 1 = 横向)
					}
				},

				tip:{                   //提示
					info:{              //信息
						suffix:''       //后缀
					}
				}
			}
		}
	}

	S.extend(ConfigParse,Base,{
		parse:function($data,$type){
			var self = this

			var o = S.clone(self.o) 
			var type = $type ? $type : 'xml'
			if(type == 'xml'){
				o = self._xml($data)
			}
			return o
		},
		_xml:function($data){
			var self = this
			
			var o = S.clone(self.get('o')) 
			var data = String($data)
			var domParser = new DOMParser();
			var xmlDoc = domParser.parseFromString(data, 'text/xml');
			var __data = xmlDoc.getElementsByTagName("data")[0]
			if(__data){
				o.v = __data.getAttribute('v') && String(__data.getAttribute('v')) ? String(__data.getAttribute('v')) : o.v

				var __fills = __data.getElementsByTagName("colors")[0]
				if(__fills){
					o.fills.normals = __fills.getAttribute('normals') && String(__fills.getAttribute('normals')) ? String(__fills.getAttribute('normals')).split(',') : o.fills.normals
					o.fills.overs = __fills.getAttribute('overs') && String(__fills.getAttribute('overs')) ? String(__fills.getAttribute('overs')).split(',') : o.fills.overs
				}
			}

			var __y_axis = xmlDoc.getElementsByTagName("y_axis")[0]
			if(__y_axis){
				var __data = __y_axis.getElementsByTagName("data")[0]
				if(__data){
					o.y_axis.data.mode = __data.getAttribute('mode') ? Number(__data.getAttribute('mode')) : o.y_axis.data.mode
				}
			}

			var __x_axis = xmlDoc.getElementsByTagName("x_axis")[0]
			if(__x_axis){
				var __layout = __x_axis.getElementsByTagName("layout")[0]
				if(__layout){
					o.x_axis.layout.mode = __layout.getAttribute('mode') ? Number(__layout.getAttribute('mode')) : o.x_axis.layout.mode
				}
			}

			var __tip = xmlDoc.getElementsByTagName("tip")[0]
			if(__tip){
				var __info = __tip.getElementsByTagName("info")[0]
				if(__info){
					o.tip.info.suffix = __info.getAttribute('suffix') ? __info.getAttribute('suffix') : o.tip.info.suffix
				}
			}
			o.fills.normals = self._trimFills(o.fills.normals)
			o.fills.overs = self._trimFills(o.fills.overs)
			return o
		},

		//将'0x' 替换成 '#'
		_trimFills:function($arr){
			var arr = []
			for(var a = 0,al = $arr.length; a < al; a++){
				var s = String($arr[a])
				s = s.replace('0x','#')
				arr.push(s)
			}
			return arr
		}
	});

	return ConfigParse;

	}, {
	    requires:['base','node']
	}
);
KISSY.add('brix/gallery/charts/js/pub/controls/histogram/dataparse',function(S,Base,Node){
	var $ = Node.all

	function DataParse(){
		
		var self = this

		DataParse.superclass.constructor.apply(self,arguments);
	}

	DataParse.ATTRS = {
		o:{
			value:{
				key:{                    //突出显示
					indexs:'',               //String 索引字符串[1,2,3]                             ->DataFrameFormat.key.indexs
					data:[]                  //Array indexs split之后的数组
				},
				vertical:{               //纵轴
					name:'',                 //名称[维度1]                                          ->DataFrameFormat.vertical.name
					data:[]                  //原始二维数据[[配置数据中每个队列第一个集合],[],[]]   ->DataFrameFormat.vertical.org
				},
				horizontal:{             //横轴
					name:'',                 //名称[维度2]                                          ->DataFrameFormat.horizontal.name
					start:{                  //原点
						name:'0'                 //名称[原点]                                       ->DataFrameFormat.horizontal.start.name
					},
					data:[],                 //原始数据[0.05,0.1,0.15,0.2,...,2.55]                 ->DataFrameFormat.horizontal.org
					datas:[]                 //原始数据[['今天','(0-17点)'],['对比日','(0-17点)']]  应用于多行的情况
				}
			}
		}
	}

	S.extend(DataParse,Base,{
		parse:function($data,$type){
			var o
			var type = $type ? $type : 'xml'
			if(type == 'xml'){
				o = this._xml($data)
			}
			return o
		},

		_xml:function($data){
			var self = this
			var o = S.clone(self.get('o')) 
			var data = String($data)

			var domParser = new DOMParser();
			var xmlDoc = domParser.parseFromString(data, 'text/xml');
			var __indexAxis = xmlDoc.getElementsByTagName("indexAxis")[0]
			var __key = __indexAxis.getElementsByTagName('key')[0]
			var __start = __indexAxis.getElementsByTagName('start')[0]
			var __sets = xmlDoc.getElementsByTagName("sets")[0]

			//防止没有key节点
			o.key.indexs = __key && String(__key.getAttribute('indexs')) ? String(__key.getAttribute('indexs')) : o.key.indexs

			//__sets.getAttribute('name') 当没有name属性时 防止null
			o.vertical.name = __sets.getAttribute('name') && String(__sets.getAttribute('name')) ? String(__sets.getAttribute('name')) : o.vertical.name
			o.vertical.data = self._getItems(__sets.getElementsByTagName('set'))

			o.horizontal.name = __indexAxis.getAttribute('name') && String(__indexAxis.getAttribute('name')) ? String(__indexAxis.getAttribute('name')) : o.horizontal.name
			o.horizontal.data = __indexAxis.getAttribute('labels') ? String(__indexAxis.getAttribute('labels')).split(',') : o.horizontal.data
			o.horizontal.datas = self._getNames(__sets.getElementsByTagName('set'))
			o.horizontal.start.name = __start && String(__start.getAttribute('name')) ? String(__start.getAttribute('name')) : o.horizontal.start.name
			return o
		},

		_getItems:function($list){
			var items = []
			var item;

			for (var a = 0, al = $list.length; a < al; a++) {
				item = $list[a]
				if(String(item.getAttribute('values'))){
					items.push(String(item.getAttribute('values')).split(','))
				}
			}
			return items
		},

		_getNames:function($list){
			var items = []
			var item;

			for (var a = 0, al = $list.length; a < al; a++) {
				item = $list[a]
				var __name = item.getElementsByTagName('name')[0]
				if(__name){
					if(String(__name.getAttribute('values'))){
						items.push(String(__name.getAttribute('values')).split(','))
					}
				}
			}
			return items
		}
	});

	return DataParse;

	}, {
	    requires:['base','node']
	}
);
KISSY.add('brix/gallery/charts/js/pub/controls/integrate/configparse',function(S,Base,Node,HistogramConfigParse,LineConfigParse){
	var $ = Node.all

	function ConfigParse(){
		
		var self = this

		ConfigParse.superclass.constructor.apply(self,arguments);
	}

	ConfigParse.ATTRS = {
		o:{
			value:{
				v:'1.0',

				fills:{
					normals:['#458AE6'],
					overs  :['#135EBF']
				},

				right:{}
			}
		}
	}

	S.extend(ConfigParse,Base,{
		parse:function($data,$type){
			var self = this

			var o = S.clone(self.o) 
			var type = $type ? $type : 'xml'
			if(type == 'xml'){
				o = self._xml($data)
			}
			return o
		},
		_xml:function($data){
			var self = this

			var o = S.clone(self.get('o')) 
			var data = String($data)
			var domParser = new DOMParser();
			var xmlDoc = domParser.parseFromString(data, 'text/xml');

			var __data = xmlDoc.getElementsByTagName("data")[0]
			o.v = __data.getAttribute('v') && String(__data.getAttribute('v')) ? String(__data.getAttribute('v')) : o.v

			var s = new XMLSerializer().serializeToString(__data.getElementsByTagName("line")[0])
			s = s.replace('<line', "<data")
			s = s.replace('line>', "data>")

			o.right = new LineConfigParse().parse(s)

			return o
		},

		//将'0x' 替换成 '#'
		_trimFills:function($arr){
			var arr = []
			for(var a = 0,al = $arr.length; a < al; a++){
				var s = String($arr[a])
				s = s.replace('0x','#')
				arr.push(s)
			}
			return arr
		}
	});

	return ConfigParse;

	}, {
	    requires:['base','node','../histogram/configparse','../line/configparse']
	}
);
KISSY.add('brix/gallery/charts/js/pub/controls/integrate/dataparse',function(S,Base,Node){
	var $ = Node.all

	function DataParse(){
		
		var self = this

		DataParse.superclass.constructor.apply(self,arguments);
	}

	DataParse.ATTRS = {
		o:{
			value:{
				key:{                    //突出显示[预留]
					indexs:''                //String 索引字符串[1,2,3]                            
				},
				vertical:{               //纵轴	
					names:[],                //名称二维数据[ [千次展现价格:,展现次数:] ]
					data:[]                  //原始三维数据[ [  [[8300],[8100],[...]]   , [[4300],[4100],[...]]   ] ]
				},
				horizontal:{             //横轴
					data:[]                  //原始二维数据[[3月8号],[3月9号],[...]]
				}
			}
		}
	}

	S.extend(DataParse,Base,{
		parse:function($data,$type){
			var o
			var type = $type ? $type : 'xml'
			if(type == 'xml'){
				o = this._xml($data)
			}
			return o
		},

		_xml:function($data){
			var self = this

			var o = S.clone(self.get('o')) 
			var data = String($data)

			var domParser = new DOMParser();
			var xmlDoc = domParser.parseFromString(data, 'text/xml');

			o = self._getObject(xmlDoc.getElementsByTagName("data"))

			return o
		},

		_getObject:function($list){
			var self = this

			var o = S.clone(self.get('o')) 
			var item;

			for (var a = 0, al = $list.length; a < al; a++) {
				var __data = $list[a]
				var __indexAxis = __data.getElementsByTagName("indexAxis")[0]
				var __sets = __data.getElementsByTagName("sets")[0]

				//Q3(js:空的数组判断能通过)
				o.horizontal.data = o.horizontal.data.length > 0 ? o.horizontal.data : __indexAxis.getAttribute('labels') ? String(__indexAxis.getAttribute('labels')).split(',') : []

				o.vertical.names.push(String(__sets.getAttribute('name')).split(',')) 
				o.vertical.data.push(String(__sets.getElementsByTagName('set')[0].getAttribute('values')).split(','))
			}

			return o
		}
	});

	return DataParse;

	}, {
	    requires:['base','node']
	}
);
KISSY.add('brix/gallery/charts/js/pub/controls/layouts/style1/configparse',function(S,Base,Node){
	var $ = Node.all

	function ConfigParse(){
		
		var self = this

		ConfigParse.superclass.constructor.apply(self,arguments);
	}

	ConfigParse.ATTRS = {
		o:{
			value:{
				xAxis: {
						name:'单位(整点)'
					   },
				yAxis: {
						name:''
					   }
			}
		}
	}

	S.extend(ConfigParse,Base,{
		parse:function($data,$type){
			var self = this

			var o = S.clone(self.o) 
			var type = $type ? $type : 'xml'
			if(type == 'xml'){
				o = self._xml($data)
			}
			return o
		},
		_xml:function($data){
			var self = this
			var o = S.clone(self.get('o')) 
			var data = String($data)
			var domParser = new DOMParser();
			var xmlDoc = domParser.parseFromString(data, 'text/xml');
			var __data = xmlDoc.getElementsByTagName("data")[0]
			if(__data){
				var __x_axis = xmlDoc.getElementsByTagName("x_axis")[0]
				if(__x_axis){
					o.xAxis.name = __x_axis.getAttribute('name') && String(__x_axis.getAttribute('name')) ? String(__x_axis.getAttribute('name')) : o.xAxis.name
					o.xAxis.name = __x_axis.getAttribute('name') == '' ? '' : o.xAxis.name
				}
				var __y_axis = xmlDoc.getElementsByTagName("y_axis")[0]
				if(__y_axis){
					o.yAxis.name = __y_axis.getAttribute('name') && String(__y_axis.getAttribute('name')) ? String(__y_axis.getAttribute('name')) : o.yAxis.name
					o.yAxis.name = __y_axis.getAttribute('name') == '' ? '' : o.yAxis.name
				}
			}
			return o
		}
	});

	return ConfigParse;

	}, {
	    requires:['base','node']
	}
);
KISSY.add('brix/gallery/charts/js/pub/controls/line/configparse',function(S,Base,Node){
	var $ = Node.all

	function ConfigParse(){
		
		var self = this

		ConfigParse.superclass.constructor.apply(self,arguments);
	}

	ConfigParse.ATTRS = {
		o:{
			value:{
				v:'1.0',

				node:0,
				shape:0,
				area:0,
				areaMode:0,             //区域闭合模式(0 = 自动闭合 | 1 = 不自动闭合 根据前一条线闭合)
				isArea_opacity:0,       //是否有调整区域填充部分的透明度
				area_opacity:[0.05, 0.25],//区域填充部分的透明度
				isLine:0,               //当鼠标划入时 是否有线

				data:{
				   mode:0               //数据模式(0 = 普通 | 1 = 叠加)
				},

				thickness:{             //线条粗线
					normal  : 2,        //正常情况
					over    : 3         //鼠标划入时
				},
				
				x_axis:{                //x轴
					line : {
						enabled : 1
					}
				},

				y_axis:{                //y轴
					enabled : 1,
					line: {
						enabled : 1
					},
					data:{
						isInt:0         //是否都为整数  防止[8, 8.2, 8.4, 8.6, 8.8, 9]   应该[8, 9]
					}
				},

				back:{                  //背景
					axis : {
						enabled : 1     //是否有从原点开始的x轴以及y轴
					},
					x_axis : {          //x轴
						mode : 0        //模式(0 = 虚线 | 1 = 实线)                
					},
					y_axis : {
						enabled : 1     //是否有y轴
					}
				},

				fills:{
					isDefault : 1,      //是否默认  如果外部传入有normals | overs  该值为0
					                    //用于integrate5
					normals:['#458AE6', '#39BCC0', '#5BCB8A', '#94CC5C', '#C3CC5C', '#E6B522', '#E68422'],
					overs  :['#135EBF', '#2E9599', '#36B26A', '#78A64B', '#9CA632', '#BF9E39', '#BF7C39']
				},
				
				circle:{
					mode  :0,           //模式[(仅当node=1) 空或0=显示所有节点 | 1=在数据变化时 显示变化的节点] 
					normal:{
						radius:3,       //半径
						thickness:2,    //轮廓粗细
						fill:'#FFFFFF', //填充色
						fill_follow : 0 //填充色是否跟随线条颜色(0 = 否 | 1 = 是)       ---
					},
					over  :{
						min_radius:4,                       //小圆半径
						max_radius:7,                       //大圆半径(白)
						max_fill_opacity:1,                 //大圆填充透明度           
						max_thickness:2,                    //大圆线框粗线
						max_thickness_opacity:1             //大圆线框透明度           
					}
				}
			}
		}
	}

	S.extend(ConfigParse,Base,{
		parse:function($data,$type){
			var self = this

			var o = S.clone(self.o) 
			var type = $type ? $type : 'xml'
			if(type == 'xml'){
				o = self._xml($data)
			}
			return o
		},
		_xml:function($data){
			var self = this

			var o = S.clone(self.get('o')) 
			var data = String($data)
			var domParser = new DOMParser();
			var xmlDoc = domParser.parseFromString(data, 'text/xml');
			
			var __data = xmlDoc.getElementsByTagName("data")[0]
			if(!__data){
				return o 
			}
			o.v = __data.getAttribute('v') && String(__data.getAttribute('v')) ? String(__data.getAttribute('v')) : o.v

			o.node = __data.getAttribute('node') && String(__data.getAttribute('node')) ? Number(__data.getAttribute('node')) : o.node
			o.shape = __data.getAttribute('shape') && String(__data.getAttribute('shape')) ? Number(__data.getAttribute('shape')) : o.shape
			o.area = __data.getAttribute('area') && String(__data.getAttribute('area')) ? Number(__data.getAttribute('area')) : o.area
			
			if(__data.getAttribute('area_opacity') && String(__data.getAttribute('area_opacity'))){
				o.isArea_opacity = 1
			}
			o.area_opacity = __data.getAttribute('area_opacity') && String(__data.getAttribute('area_opacity')) ? String(__data.getAttribute('area_opacity')).split(',') : o.area_opacity
			

			var __thickness = xmlDoc.getElementsByTagName("thickness")[0]
			if(__thickness){
				o.thickness.normal = __thickness.getAttribute('normal') ? __thickness.getAttribute('normal') : o.thickness.normal
				o.thickness.over = __thickness.getAttribute('over') ? __thickness.getAttribute('over') : o.thickness.over
			}

			var __x_axis = xmlDoc.getElementsByTagName("x_axis")[0]
			if(__x_axis){
				var __line = __x_axis.getElementsByTagName("line")[0]
				if(__line){
					o.x_axis.line.enabled = String(__line.getAttribute('enabled')) ? Number(__line.getAttribute('enabled')) : o.x_axis.line.enabled
				}
			}

			var __y_axis = xmlDoc.getElementsByTagName("y_axis")[0]
			if(__y_axis){
				o.y_axis.enabled = __y_axis.getAttribute('enabled') && String(__y_axis.getAttribute('enabled')) ? Number(__y_axis.getAttribute('enabled')) : o.y_axis.enabled
				var __line = __y_axis.getElementsByTagName("line")[0]
				if(__line){
					o.y_axis.line.enabled = String(__line.getAttribute('enabled')) ? Number(__line.getAttribute('enabled')) : o.y_axis.line.enabled
				}
				var __data = __y_axis.getElementsByTagName("data")[0]
				if(__data){
					o.y_axis.data.isInt = __data.getAttribute('int') && String(__data.getAttribute('int')) ? Number(__data.getAttribute('int')) : o.y_axis.data.isInt
				}
			}

			var __back = xmlDoc.getElementsByTagName("back")[0]
			if(__back){
				var __axis = __back.getElementsByTagName("axis")[0]
				if(__axis){
					o.back.axis.enabled = String(__axis.getAttribute('enabled')) ? Number(__axis.getAttribute('enabled')) : o.back.axis.enabled
				}

				var __x_axis = __back.getElementsByTagName("x_axis")[0]
				if(__x_axis){
					o.back.x_axis.mode = String(__x_axis.getAttribute('mode')) ? Number(__x_axis.getAttribute('mode')) : o.back.x_axis.mode
				}
				var __y_axis = __back.getElementsByTagName("y_axis")[0]
				if(__y_axis){
					o.back.y_axis.enabled = String(__y_axis.getAttribute('enabled')) ? Number(__y_axis.getAttribute('enabled')) : o.back.__y_axis.enabled
				}
			}


			var __fills = xmlDoc.getElementsByTagName("colors")[0]
			if(__fills){
				if((__fills.getAttribute('normals') && String(__fills.getAttribute('normals'))) || (__fills.getAttribute('overs') && String(__fills.getAttribute('overs')))){
					o.fills.isDefault = 0
				}
				o.fills.normals = __fills.getAttribute('normals') && String(__fills.getAttribute('normals')) ? String(__fills.getAttribute('normals')).split(',') : o.fills.normals
				o.fills.overs = __fills.getAttribute('overs') && String(__fills.getAttribute('overs')) ? String(__fills.getAttribute('overs')).split(',') : o.fills.overs
			}

			o.fills.normals = self._trimFills(o.fills.normals)
			o.fills.overs = self._trimFills(o.fills.overs)

			var __circle = xmlDoc.getElementsByTagName("node")[0]
			if(__circle){
				o.circle.mode = __circle.getAttribute('mode') && String(__circle.getAttribute('normals')) ? Number(__circle.getAttribute('mode')) : o.circle.mode
				var __normal = __circle.getElementsByTagName("normal")[0]
				if(__normal){
					o.circle.normal.radius = __normal.getAttribute('radius') && String(__normal.getAttribute('radius')) ? __normal.getAttribute('radius') : o.circle.normal.radius
					o.circle.normal.thickness = __normal.getAttribute('thickness') && String(__normal.getAttribute('thickness')) ? __normal.getAttribute('thickness') : o.circle.normal.thickness
					o.circle.normal.fill = __normal.getAttribute('color') && String(__normal.getAttribute('color')) ? String(__normal.getAttribute('fill')) : o.circle.normal.fill
					o.circle.normal.fill_follow =__normal.getAttribute('color_follow') && String(__normal.getAttribute('color_follow')) ? Number(__normal.getAttribute('color_follow')) : o.circle.normal.fill_follow
				}
				var __over = __circle.getElementsByTagName("over")[0]
				if(__over){
					o.circle.over.min_radius = __over.getAttribute('min_radius') && String(__over.getAttribute('min_radius')) ? __over.getAttribute('min_radius') : o.circle.over.min_radius
					o.circle.over.max_radius = __over.getAttribute('max_radius') && String(__over.getAttribute('max_radius')) ? __over.getAttribute('max_radius') : o.circle.over.max_radius
					o.circle.over.max_fill_opacity = __over.getAttribute('max_color_opacity') && String(__over.getAttribute('max_color_opacity')) ? Number(__over.getAttribute('max_color_opacity')) : o.circle.over.max_fill_opacity
					o.circle.over.max_thickness = __over.getAttribute('max_thickness') && String(__over.getAttribute('max_thickness')) ? __over.getAttribute('max_thickness') : o.circle.over.max_thickness
					o.circle.over.max_thickness_opacity = __over.getAttribute('max_thickness_opacity') && String(__over.getAttribute('max_thickness_opacity')) ? Number(__over.getAttribute('max_thickness_opacity')) : o.circle.over.max_thickness_opacity

				}
			}

			o.circle.normal.fill = self._trimFill(o.circle.normal.fill)
			return o
		},

		//将'0x' 替换成 '#'
		_trimFills:function($arr){
			var arr = []
			for(var a = 0,al = $arr.length; a < al; a++){
				var s = String($arr[a])
				s = s.replace('0x','#')
				arr.push(s)
			}
			return arr
		},
		_trimFill:function($s){
			var s = $s.replace('0x','#')
			return s
		}
	});

	return ConfigParse;

	}, {
	    requires:['base','node']
	}
);
KISSY.add('brix/gallery/charts/js/pub/controls/line/dataparse',function(S,Base,Node){
	var $ = Node.all

	function DataParse(){
		
		var self = this

		DataParse.superclass.constructor.apply(self,arguments);
	}

	DataParse.ATTRS = {
		o:{
			value:{
				key:{                    //突出显示
					indexs:''                //String 索引字符串[1,2,3]                             ->DataFrameFormat.key.indexs
				},
				vertical:{               //纵轴
					name:'',                 //名称[维度1]                                          ->DataFrameFormat.vertical.name
					names:[],                //名称集合[维度1---1：,,维度1---3：]
					data:[],                 //原始二维数据[[配置数据中每个队列第一个集合],[],[]]   ->DataFrameFormat.vertical.org
					no_nodes:[]              //无节点集合 1=不显示节点 | 0=显示节点 当该数组长度为0时代表所有节点均显示[0,0,1,0]
				},
				horizontal:{             //横轴
					name:'',                 //名称[维度2]                                          ->DataFrameFormat.horizontal.name
					data:[]                  //原始数据[0.05,0.1,0.15,0.2,...,2.55]                 ->DataFrameFormat.horizontal.org
				}
			}
		}
	}

	S.extend(DataParse,Base,{
		parse:function($data,$type){
			var o
			var type = $type ? $type : 'xml'
			if(type == 'xml'){
				o = this._xml($data)
			}
			return o
		},

		_xml:function($data){
			var self = this

			var o = S.clone(self.get('o')) 
			var data = String($data)

			var domParser = new DOMParser();
			var xmlDoc = domParser.parseFromString(data, 'text/xml');
			var __indexAxis = xmlDoc.getElementsByTagName("indexAxis")[0]
			var __key = __indexAxis.getElementsByTagName('key')[0]
			var __sets = xmlDoc.getElementsByTagName("sets")[0]

			//防止没有key节点
			o.key.indexs = __key && String(__key.getAttribute('indexs')) ? String(__key.getAttribute('indexs')) : o.key.indexs

			//__sets.getAttribute('name') 当没有name属性时 防止null
			o.vertical.name = __sets.getAttribute('name') && String(__sets.getAttribute('name')) ? String(__sets.getAttribute('name')) : o.vertical.name
			o.vertical.names = self._getNames(__sets.getElementsByTagName('set'))
			o.vertical.data = self._getItems(__sets.getElementsByTagName('set'))
			o.horizontal.name = __indexAxis.getAttribute('name') && String(__indexAxis.getAttribute('name')) ? String(__indexAxis.getAttribute('name')) : o.horizontal.name
			o.horizontal.data = __indexAxis.getAttribute('labels') ? String(__indexAxis.getAttribute('labels')).split(',') : o.horizontal.data
			return o
		},

		_getItems:function($list){
			var items = []
			var item;

			for (var a = 0, al = $list.length; a < al; a++) {
				item = $list[a]
				if(String(item.getAttribute('values'))){
					items.push(String(item.getAttribute('values')).split(','))
				}
			}
			return items
		},
		_getNames:function($list){
			var items = []
			var item 

			for (var a = 0, al = $list.length; a < al; a++) {
				item = $list[a]
				items[a] = item.getAttribute('name') && String(item.getAttribute('name')) ? String(item.getAttribute('name')) : ''
			}
			return items
		}
	});

	return DataParse;

	}, {
	    requires:['base','node']
	}
);
KISSY.add('brix/gallery/charts/js/pub/controls/line2/configparse',function(S,Base,Node){
	var $ = Node.all

	function ConfigParse(){
		
		var self = this

		ConfigParse.superclass.constructor.apply(self,arguments);
	}

	ConfigParse.ATTRS = {
		o:{
			value:{
				v:'1.0',

				node:0,
				shape:0,
				area:0,

				fills:{
					normals:['0x458AE6', '0xE68422', '0x5BCB8A', '0x94CC5C', '0xC3CC5C', '0xE6B522', '0xE68422'],
					overs  :['0x135EBF', '0xBF7C39', '0x36B26A', '0x78A64B', '0x9CA632', '0xBF9E39', '0xBF7C39']
				}
			}
		}
	}

	S.extend(ConfigParse,Base,{
		parse:function($data,$type){
			var self = this

			var o = S.clone(self.o) 
			var type = $type ? $type : 'xml'
			if(type == 'xml'){
				o = self._xml($data)
			}
			return o
		},
		_xml:function($data){
			var self = this

			var o = S.clone(self.get('o')) 
			var data = String($data)
			var domParser = new DOMParser();
			var xmlDoc = domParser.parseFromString(data, 'text/xml');

			var __data = xmlDoc.getElementsByTagName("data")[0]
			o.v = __data.getAttribute('v') && String(__data.getAttribute('v')) ? String(__data.getAttribute('v')) : o.v

			o.node = __data.getAttribute('node') && String(__data.getAttribute('node')) ? Number(__data.getAttribute('node')) : o.node
			o.shape = __data.getAttribute('shape') && String(__data.getAttribute('shape')) ? Number(__data.getAttribute('shape')) : o.shape
			o.area = __data.getAttribute('area') && String(__data.getAttribute('area')) ? Number(__data.getAttribute('area')) : o.area

			var __fills = xmlDoc.getElementsByTagName("colors")[0]
			if(__fills){
				o.fills.normals = __fills.getAttribute('normals') && String(__fills.getAttribute('normals')) ? String(__fills.getAttribute('normals')).split(',') : o.fills.normals
				o.fills.overs = __fills.getAttribute('overs') && String(__fills.getAttribute('overs')) ? String(__fills.getAttribute('overs')).split(',') : o.fills.overs
			}

			o.fills.normals = self._trimFills(o.fills.normals)
			o.fills.overs = self._trimFills(o.fills.overs)

			return o
		},

		//将'0x' 替换成 '#'
		_trimFills:function($arr){
			var arr = []
			for(var a = 0,al = $arr.length; a < al; a++){
				var s = String($arr[a])
				s = s.replace('0x','#')
				arr.push(s)
			}
			return arr
		}
	});

	return ConfigParse;

	}, {
	    requires:['base','node']
	}
);
KISSY.add('brix/gallery/charts/js/pub/controls/line2/dataparse',function(S,Base,Node){
	var $ = Node.all

	function DataParse(){
		
		var self = this

		DataParse.superclass.constructor.apply(self,arguments);
	}

	DataParse.ATTRS = {
		o:{
			value:{
				key:{                    //突出显示[预留]
					indexs:''                //String 索引字符串[1,2,3]                            
				},
				vertical:{               //纵轴	
					names:[],                //名称三维数据[ [  [[03月08号:],[...]] , [[03月01号:],[...]] ] ]   				
					data:[]                  //原始三维数据[ [  [[83],[81],[...]]   , [[43],[41],[...]]   ] ]
				},
				horizontal:{             //横轴
					data:[]                  //原始二维数据[[3月8号],[3月9号],[...]]
				},
				info:{                   //显示信息配置         
				    content:{                //内容
						title:{                  //标题 
							name:'',                 //内容
							fill:'#505050'           //颜色
						}
					}
		        }
			}
		}
	}

	S.extend(DataParse,Base,{
		parse:function($data,$type){
			var o
			var type = $type ? $type : 'xml'
			if(type == 'xml'){
				o = this._xml($data)
			}
			return o
		},

		_xml:function($data){
			var self = this

			var o = S.clone(self.get('o')) 
			var data = String($data)

			var domParser = new DOMParser();
			var xmlDoc = domParser.parseFromString(data, 'text/xml');

			o = self._getObject(xmlDoc.getElementsByTagName("data"))

			var __info = xmlDoc.getElementsByTagName('info')[0]
			if(__info){
				var __content = __info.getElementsByTagName('content')[0]
				if(__content){
					var __title = __content.getElementsByTagName('title')[0]
					if(__title){
						o.info.content.title.name = __title.getAttribute('name') ? String(__title.getAttribute('name')) : o.info.content.title.name
						o.info.content.title.fill = __title.getAttribute('color') ? self._trimFill(__title.getAttribute('color')) : o.info.content.title.fill
					}
				}
			}
			return o
		},

		_getObject:function($list){
			var self = this

			var o = S.clone(self.get('o')) 
			var item;

			for (var a = 0, al = $list.length; a < al; a++) {
				var __data = $list[a]
				var __indexAxis = __data.getElementsByTagName("indexAxis")[0]
				var __sets = __data.getElementsByTagName("sets")[0]

				//Q3(js:空的数组判断能通过)
				o.horizontal.data = o.horizontal.data.length > 0 ? o.horizontal.data : __indexAxis.getAttribute('labels') ? String(__indexAxis.getAttribute('labels')).split(',') : []

				o.vertical.names.push(String(__sets.getAttribute('name')).split(','))
				o.vertical.data.push(String(__sets.getElementsByTagName('set')[0].getAttribute('values')).split(','))
			}

			return o
		},

		_trimFill:function($s){
			var s = $s.replace('0x','#')
			return s
		}
	});

	return DataParse;

	}, {
	    requires:['base','node']
	}
);
KISSY.add('brix/gallery/charts/js/pub/controls/line3/configparse',function(S,Base,Node){
	var $ = Node.all

	function ConfigParse(){
		
		var self = this

		ConfigParse.superclass.constructor.apply(self,arguments);
	}

	ConfigParse.ATTRS = {
		o:{
			value:{
				v:'1.0',

				node:0,
				shape:0,
				area:0,

				scales:[1,1],

				fills:{
					normals:['0x458AE6', '0x94CC5C'],
					overs  :['0x135EBF', '0x78A64B']
				}
			}
		}
	}

	S.extend(ConfigParse,Base,{
		parse:function($data,$type){
			var self = this

			var o = S.clone(self.o) 
			var type = $type ? $type : 'xml'
			if(type == 'xml'){
				o = self._xml($data)
			}
			return o
		},
		_xml:function($data){
			var self = this

			var o = S.clone(self.get('o')) 
			var data = String($data)
			var domParser = new DOMParser();
			var xmlDoc = domParser.parseFromString(data, 'text/xml');

			var __data = xmlDoc.getElementsByTagName("data")[0]
			o.v = __data.getAttribute('v') && String(__data.getAttribute('v')) ? String(__data.getAttribute('v')) : o.v

			o.node = __data.getAttribute('node') && String(__data.getAttribute('node')) ? Number(__data.getAttribute('node')) : o.node
			o.shape = __data.getAttribute('shape') && String(__data.getAttribute('shape')) ? Number(__data.getAttribute('shape')) : o.shape
			o.area = __data.getAttribute('area') && String(__data.getAttribute('area')) ? Number(__data.getAttribute('area')) : o.area
			o.scales = __data.getAttribute('scales') && String(__data.getAttribute('scales')) ? String(__data.getAttribute('scales')).split(',') : o.scales

			var __fills = xmlDoc.getElementsByTagName("colors")[0]
			if(__fills){
				o.fills.normals = __fills.getAttribute('normals') && String(__fills.getAttribute('normals')) ? String(__fills.getAttribute('normals')).split(',') : o.fills.normals
				o.fills.overs = __fills.getAttribute('overs') && String(__fills.getAttribute('overs')) ? String(__fills.getAttribute('overs')).split(',') : o.fills.overs
			}

			o.fills.normals = self._trimFills(o.fills.normals)
			o.fills.overs = self._trimFills(o.fills.overs)

			return o
		},

		//将'0x' 替换成 '#'
		_trimFills:function($arr){
			var arr = []
			for(var a = 0,al = $arr.length; a < al; a++){
				var s = String($arr[a])
				s = s.replace('0x','#')
				arr.push(s)
			}
			return arr
		}
	});

	return ConfigParse;

	}, {
	    requires:['base','node']
	}
);
KISSY.add('brix/gallery/charts/js/pub/controls/line3/dataparse',function(S,Base,Node){
	var $ = Node.all

	function DataParse(){
		
		var self = this

		DataParse.superclass.constructor.apply(self,arguments);
	}

	DataParse.ATTRS = {
		o:{
			value:{
				key:{                    //突出显示[预留]
					indexs:''                //String 索引字符串[1,2,3]                            
				},
				vertical:{               //纵轴	
					names:[],                //名称二维数据[ [千次展现价格:,展现次数:] ]
					data:[]                  //原始三维数据[ [  [[8300],[8100],[...]]   , [[4300],[4100],[...]]   ] ]
				},
				horizontal:{             //横轴
					data:[]                  //原始二维数据[[3月8号],[3月9号],[...]]
				}
			}
		}
	}

	S.extend(DataParse,Base,{
		parse:function($data,$type){
			var o
			var type = $type ? $type : 'xml'
			if(type == 'xml'){
				o = this._xml($data)
			}
			return o
		},

		_xml:function($data){
			var self = this

			var o = S.clone(self.get('o')) 
			var data = String($data)

			var domParser = new DOMParser();
			var xmlDoc = domParser.parseFromString(data, 'text/xml');

			o = self._getObject(xmlDoc.getElementsByTagName("data"))
			return o
		},

		_getObject:function($list){
			var self = this

			var o = S.clone(self.get('o')) 
			var item;

			for (var a = 0, al = $list.length; a < al; a++) {
				var __data = $list[a]
				var __indexAxis = __data.getElementsByTagName("indexAxis")[0]
				var __sets = __data.getElementsByTagName("sets")[0]

				//Q3(js:空的数组判断能通过)
				o.horizontal.data = o.horizontal.data.length > 0 ? o.horizontal.data : __indexAxis.getAttribute('labels') ? String(__indexAxis.getAttribute('labels')).split(',') : []

				o.vertical.names.push(String(__sets.getAttribute('name')).split(',')) 
				o.vertical.data.push(String(__sets.getElementsByTagName('set')[0].getAttribute('values')).split(','))
			}

			return o
		}
	});

	return DataParse;

	}, {
	    requires:['base','node']
	}
);
KISSY.add('brix/gallery/charts/js/pub/controls/map/configparse',function(S,Base,Node){
	var $ = Node.all

	function ConfigParse(){
		
		var self = this

		ConfigParse.superclass.constructor.apply(self,arguments);
	}

	ConfigParse.ATTRS = {
		o:{
			value:{
				v:'1.0',

				fills:{
					normals:['0xBED2ED'],
					over:'0xF89D60'
				},

				info:{
					contents:[],
					bolds   :[1,1,1],
					fills  :['0x1351BF','0x1351BF','0x1351BF'],
					sizes   :[14,12,12],
					frame_fill :'0x1351BF'
				},

				sign:{
					is : 0,
					max: '',
					circle:{
						fill:{
							normal:'#937ACC',
							over  :'#7459B3'
						}
					}
				},

				list:{
					is : 0,
					max: '',
					font:{
						fill:{
							normal:'#333333',
							over:'#7459B3'
						}
					}
				}
			}
		}
	}

	S.extend(ConfigParse,Base,{
		parse:function($data,$type){
			var self = this

			var o = S.clone(self.o) 
			var type = $type ? $type : 'xml'
			if(type == 'xml'){
				o = self._xml($data)
			}
			return o
		},
		_xml:function($data){
			var self = this

			var o = S.clone(self.get('o')) 
			var data = String($data)
			var domParser = new DOMParser();
			var xmlDoc = domParser.parseFromString(data, 'text/xml');

			var __data = xmlDoc.getElementsByTagName("data")[0]
			var __fills = __data.getElementsByTagName("colors")[0]
			var __info = __data.getElementsByTagName("info")[0]
			var __sign = __data.getElementsByTagName("sign")[0]
			var __list = __data.getElementsByTagName("list")[0]

			o.v = __data.getAttribute('v') && String(__data.getAttribute('v')) ? String(__data.getAttribute('v')) : o.v

			if(__fills){
				o.fills.normals = __fills.getAttribute('normals') && String(__fills.getAttribute('normals')) ? String(__fills.getAttribute('normals')).split(',') : o.fills.normals
				o.fills.over = __fills.getAttribute('over') && String(__fills.getAttribute('over')) ? String(__fills.getAttribute('over')) : o.fills.over
			}
			if(__info){
				o.info.contents = __info.getAttribute('contents') && String(__info.getAttribute('contents')) ? String(__info.getAttribute('contents')).split(',') : o.info.contents
				o.info.bolds = __info.getAttribute('bolds') && String(__info.getAttribute('bolds')) ? String(__info.getAttribute('bolds')).split(',') : o.info.bolds
				o.info.fills = __info.getAttribute('colors') && String(__info.getAttribute('colors')) ? String(__info.getAttribute('colors')).split(',') : o.info.fills
				o.info.sizes = __info.getAttribute('sizes') && String(__info.getAttribute('sizes')) ? String(__info.getAttribute('sizes')).split(',') : o.info.sizes

				o.info.frame_fill = __info.getAttribute('f_c') && String(__info.getAttribute('f_c')) ? String(__info.getAttribute('f_c')) : o.info.frame_fill
			}

			o.fills.normals = self._trimFills(o.fills.normals)
			o.fills.over = self._trimFill(o.fills.over)

			o.info.fills = self._trimFills(o.info.fills)
			o.info.frame_fill = self._trimFill(o.info.frame_fill)

			if(__sign){
				o.sign.is = 1
				o.sign.max = __sign.getAttribute('value') && __sign.getAttribute('value') != 0 ? __sign.getAttribute('value') : o.sign.max
			}
			if(__list){
				o.list.is = 1
				o.list.max = __list.getAttribute('value') && __list.getAttribute('value') != 0 ? __list.getAttribute('value') : o.list.max
			}
			return o
		},

		//将'0x' 替换成 '#'
		_trimFills:function($arr){
			var arr = []
			for(var a = 0,al = $arr.length; a < al; a++){
				var s = String($arr[a])
				s = s.replace('0x','#')
				arr.push(s)
			}
			return arr
		},

		_trimFill:function($s){
			var s = $s
			s = s.replace('0x','#')
			return s
		}
	});

	return ConfigParse;

	}, {
	    requires:['base','node']
	}
);
KISSY.add('brix/gallery/charts/js/pub/controls/map/dataparse',function(S,Base,Node){
	var $ = Node.all

	function DataParse(){
		
		var self = this

		DataParse.superclass.constructor.apply(self,arguments);
	}

	DataParse.ATTRS = {
		o:{
			value:{
				key:{                    //突出显示[预留]
					indexs:''                //String 索引字符串[1,2,3]                            
				},
				values:{                 	
					data:[]                  //原始二维数据['<set index="34"><name name="安徽"/>...</set>','...','...']
				}
			}
		}
	}

	S.extend(DataParse,Base,{
		parse:function($data,$type){
			var o
			var type = $type ? $type : 'xml'
			if(type == 'xml'){
				o = this._xml($data)
			}
			return o
		},

		_xml:function($data){
			var self = this

			var o = S.clone(self.get('o')) 
			var data = String($data)

			var domParser = new DOMParser();
			var xmlDoc = domParser.parseFromString(data, 'text/xml');
			var __data = xmlDoc.getElementsByTagName("data")[0]
			var __sets = __data.getElementsByTagName("sets")[0]

			o.values.data = self._getItems(__sets.getElementsByTagName("set"))
			
			return o
		},

		_getItems:function($list){
			var self = this

			var item = []

			for (var a = 0, al = $list.length; a < al; a++) {
				var __data = $list[a]
				
				item.push(__data)
			}

			return item
		}
	});

	return DataParse;

	}, {
	    requires:['base','node']
	}
);
KISSY.add('brix/gallery/charts/js/pub/controls/map/datatrim',function(S,Base,Node,Global){
	var $ = Node.all

	function DataTrim(){
		
		var self = this

		DataTrim.superclass.constructor.apply(self,arguments);
	}

	DataTrim.ATTRS = {
		data:{
			value:{}
						         //[o,o,...o]
				                 /*o:{
				                 	 index:
				                 	 colors:{
										normal:[#000000]
									    content:[]
				                 	 }
				                 }*/
		},

		o:{
			value:{
				index:0,         //索引(浙江)
				name :'',        //名称(浙江)
				value:0,         //根据此值计算比例(1000)
				order:0,         //排名 过滤0 真正计算时从1开始(1)
				scale:0,         //比例(10%)
				fills:{
					normal:'#BED2ED',
					over  :'#F89D60'
				},
				content:[],
				sign:{
					is  :0,
					font:{
						content:''
					}
				}
			}
		}
	}

	S.extend(DataTrim,Base,{
		parse:function($arr,$config){
			var self = this

			var data = S.clone(self.get('data')) 

			for(var a = 0,al = $arr.length; a < al; a++){
				var item = (new XMLSerializer()).serializeToString($arr[a])
				var domParser = new DOMParser();
				var xmlDoc = domParser.parseFromString(item, 'text/xml');
				var __set = xmlDoc.getElementsByTagName("set")[0]
				var __fills = __set.getElementsByTagName("colors")[0]
				var __sign = __set.getElementsByTagName("sign")[0]
				var __name = __set.getElementsByTagName("name")[0]

				var o = S.clone(self.get('o'))
				o.index = __set.getAttribute('index') && String(__set.getAttribute('index')) ? Number(__set.getAttribute('index')) : o.index
				o.value = __set.getAttribute('value') && String(__set.getAttribute('value')) ? Number(__set.getAttribute('value')) : o.value
				if(__name){
					o.name = String(__name.getAttribute('name')) ? String(__name.getAttribute('name')) : o.name
					o.index = name
				}

				if(__fills){
					o.fills.normal = __fills.getAttribute('normal') && String(__fills.getAttribute('normal')) ? $config.fills.normals[Number(__fills.getAttribute('normal')) - 1] : o.fills.normal
					o.fills.over = $config.fills.over
				}else{
					o.fills.normal = $config.fills.normals[0]
					o.fills.over = $config.fills.over
				}

				var contents = $config.info.contents
				for(var b = 0,bl = contents.length; b < bl; b++){
					o.content[b] = []
					var o1 = {}
					var content = contents[b]

					var name
					var value
					var __name =  __set.getElementsByTagName(content)[0]
					if(__name){
						name = __name.getAttribute('name') && String(__name.getAttribute('name')) ?  String(__name.getAttribute('name')) : ''
						value = __name.getAttribute('value') && String(__name.getAttribute('value')) ?  String(__name.getAttribute('value')) : ''
						value = Global.numAddSymbol(value)
					}
					
					o1.content = name + value
					o1.size = $config.info.sizes[b]
					o1.bold = $config.info.bolds[b]
					o1.fill = $config.info.fills[b]
					o.content[b].push(o1)
				}

				o.sign.is = $config.sign.is ? 1 : 0
				/*
				if(__sign){
					var __font = __sign.getElementsByTagName("font")[0]
					if(__font){
						var content = __font.getAttribute('content') && String(__font.getAttribute('content')) ? String(__font.getAttribute('content')) : o.sign.font.content
					}
				}*/
				data[o.name] = o
			}
			return data
		},

		_getItems:function($list){
			var self = this

			var item = []

			for (var a = 0, al = $list.length; a < al; a++) {
				var __data = $list[a]

				item.push(__data)
			}

			return item
		}
	});

	return DataTrim;

	}, {
	    requires:['base','node','../../utils/global']
	}
);
KISSY.add('brix/gallery/charts/js/pub/controls/pie/configparse',function(S,Base,Node){
	var $ = Node.all

	function ConfigParse(){
		
		var self = this

		ConfigParse.superclass.constructor.apply(self,arguments);
	}

	ConfigParse.ATTRS = {
		o:{
			value:{

				x:'',
				y:'',
				w:'',
				h:'',

				dis:26,                 //圆饼实际大小与上、下、左、右之间的间隔

				font:{
					is:1,
					exact:0             //显示百分比时 精确的小数点位置
				},

				fills:{
					order  :0,
					normals:['0x458AE6', '0x45B5E6', '0x39BCC0', '0x5BCB8A', '0x94CC5C', '0xC3CC5C', '0xE6B522', '0xE68422', '0xB0704A', '0x6280A1'],
					overs  :['0x135EBF', '0x3997BF', '0x2E9599', '0x36B26A', '0x78A64B', '0x9CA632', '0xBF9E39', '0xBF7C39', '0x8C5738', '0x4D6580']
				},

				list:{
					is : 0,
					x:'',
					y:'',
					max: '',
					content:{           //内容
						mode:0          //模式(0 = 比例 | 1 = 数字)
					}
				},

				order:{                 //数据排序
					mode:1              //模式(0 = 不排序 | 1 = 从大到小)
				}
			}
		}
	}

	S.extend(ConfigParse,Base,{
		parse:function($data,$type){
			var self = this

			var o = S.clone(self.o) 
			var type = $type ? $type : 'xml'
			if(type == 'xml'){
				o = self._xml($data)
			}
			return o
		},
		_xml:function($data){
			var self = this

			var o = S.clone(self.get('o')) 
			var data = String($data)
			var domParser = new DOMParser();
			var xmlDoc = domParser.parseFromString(data, 'text/xml');

			var __data = xmlDoc.getElementsByTagName("data")[0]
			var __font = __data.getElementsByTagName("font")[0]
			var __fills = __data.getElementsByTagName("colors")[0]
			var __list = __data.getElementsByTagName("list")[0]
			var __order = __data.getElementsByTagName("order")[0]

			o.x = __data.getAttribute('x') || __data.getAttribute('x') == 0 ? __data.getAttribute('x') : o.x
			o.y = __data.getAttribute('y') || __data.getAttribute('y') == 0? __data.getAttribute('y') : o.y
			o.w = __data.getAttribute('w') ? __data.getAttribute('w') : o.w
			o.h = __data.getAttribute('h') ? __data.getAttribute('h') : o.h
			if(__font){
				o.font.is = __font.getAttribute('enabled') == 0 ? 0 : o.font.is
				o.font.exact = __font.getAttribute('exact') ? Number(__font.getAttribute('exact')) : o.font.exact
			}

			if(__fills){
				o.fills.order = __fills.getAttribute('normals') && String(__fills.getAttribute('normals')) ? 1 : o.fills.order
				o.fills.order = __fills.getAttribute('mode') == 1 ? 0 : o.fills.order
				o.fills.normals = __fills.getAttribute('normals') && String(__fills.getAttribute('normals')) ? String(__fills.getAttribute('normals')).split(',') : o.fills.normals
				o.fills.overs = __fills.getAttribute('overs') && String(__fills.getAttribute('overs')) ? String(__fills.getAttribute('overs')).split(',') : o.fills.overs
			}
			o.fills.normals = self._trimFills(o.fills.normals)
			o.fills.overs = self._trimFills(o.fills.overs)

			if(__list){
				o.list.is = 1
				
				o.list.x = __list.getAttribute('x') || __list.getAttribute('x') == 0 ? __list.getAttribute('x') : o.list.x
				o.list.y = __list.getAttribute('y') || __list.getAttribute('y') == 0 ? __list.getAttribute('y') : o.list.y
				
				o.list.max = __list.getAttribute('value') && __list.getAttribute('value') != 0 ? __list.getAttribute('value') : o.list.max

				var __content = __list.getElementsByTagName("content")[0]
				if(__content){
					o.list.content.mode = __content.getAttribute('mode') ? __content.getAttribute('mode') : o.list.content.mode
				}
			}

			if(__order){
				o.order.mode = __order.getAttribute('mode') ? __order.getAttribute('mode') : o.order.mode
			}
			return o
		},

		//将'0x' 替换成 '#'
		_trimFills:function($arr){
			var arr = []
			for(var a = 0,al = $arr.length; a < al; a++){
				var s = String($arr[a])
				s = s.replace('0x','#')
				arr.push(s)
			}
			return arr
		}
	});

	return ConfigParse;

	}, {
	    requires:['base','node']
	}
);
KISSY.add('brix/gallery/charts/js/pub/controls/pie/dataparse',function(S,Base,Node){
	var $ = Node.all

	function DataParse(){
		
		var self = this

		DataParse.superclass.constructor.apply(self,arguments);
	}

	DataParse.ATTRS = {
		o:{
			value:{
				key:{                    //突出显示[预留]
					indexs:'',               //String 索引字符串[1,2,3]
					data:[]                  //Array indexs split之后的数组
				},
				values:{
					names:[],                //原始名称数组
					data:[],                 //原始数据数组(未排序)
				}
			}
		}
	}

	S.extend(DataParse,Base,{
		parse:function($data,$type){
			var o
			var type = $type ? $type : 'xml'
			if(type == 'xml'){
				o = this._xml($data)
			}
			return o
		},

		_xml:function($data){
			var self = this
			var o = S.clone(self.get('o')) 
			var data = String($data)

			var domParser = new  DOMParser();
			var xmlDoc = domParser.parseFromString(data, 'text/xml');
			var __indexAxis = xmlDoc.getElementsByTagName("indexAxis")[0]
			var __key = __indexAxis.getElementsByTagName('key')[0]
			var __sets = xmlDoc.getElementsByTagName("sets")[0]
			var __set = __sets.getElementsByTagName("set")[0]

			//防止没有key节点
			o.key.indexs = __key && String(__key.getAttribute('indexs')) ? String(__key.getAttribute('indexs')) : o.key.indexs

			o.values.data = __set.getAttribute('values') && String(__set.getAttribute('values')) ? String(__set.getAttribute('values')).split(',') : o.values.data
			o.values.names = __set.getAttribute('names') && String(__set.getAttribute('names')) ? String(__set.getAttribute('names')).split(',') : o.values.names
			return o
		},
	});

	return DataParse;

	}, {
	    requires:['base','node']
	}
);
KISSY.add('brix/gallery/charts/js/pub/controls/scatter/configparse',function(S,Base,Node){
	var $ = Node.all

	function ConfigParse(){
		
		var self = this

		ConfigParse.superclass.constructor.apply(self,arguments);
	}

	ConfigParse.ATTRS = {
		o:{
			value:{
				v:'1.0',

				style:1
			}
		}
	}

	S.extend(ConfigParse,Base,{
		parse:function($data,$type){
			var self = this

			var o = S.clone(self.o) 
			var type = $type ? $type : 'xml'
			if(type == 'xml'){
				o = self._xml($data)
			}
			return o
		},
		_xml:function($data){
			var self = this

			var o = S.clone(self.get('o')) 
			var data = String($data)
			var domParser = new DOMParser();
			var xmlDoc = domParser.parseFromString(data, 'text/xml');
			
			var __data = xmlDoc.getElementsByTagName("data")[0]
			o.v = __data.getAttribute('v') && String(__data.getAttribute('v')) ? String(__data.getAttribute('v')) : o.v

			o.style = __data.getAttribute('style') && String(__data.getAttribute('style')) ? Number(__data.getAttribute('style')) : o.style
			return o
		}
	});

	return ConfigParse;

	}, {
	    requires:['base','node']
	}
);
KISSY.add('brix/gallery/charts/js/pub/controls/scatter/dataparse',function(S,Base,Node){
	var $ = Node.all

	function DataParse(){
		
		var self = this

		DataParse.superclass.constructor.apply(self,arguments);
	}

	DataParse.ATTRS = {
		o:{
			value:{
				key:{                    //突出显示
					indexs:''                //String 索引字符串[1,2,3]                             ->DataFrameFormat.key.indexs
				},
				vertical:{               //纵轴
					name:'',                 //名称[维度1]                                          ->DataFrameFormat.vertical.name
					data:[]                  //原始二维数据[256,10,432,379...100]                   ->DataFrameFormat.vertical.org
				},
				horizontal:{             //横轴
					name:'',                 //名称[维度2]                                          ->DataFrameFormat.horizontal.name
					data:[]                  //原始数据[1000,2000,3000,4000...38000]                ->DataFrameFormat.horizontal.org
				}
			}
		}
	}

	S.extend(DataParse,Base,{
		parse:function($data,$type){
			var o
			var type = $type ? $type : 'xml'
			if(type == 'xml'){
				o = this._xml($data)
			}
			return o
		},

		_xml:function($data){
			var self = this

			var o = S.clone(self.get('o')) 
			var data = String($data)

			var domParser = new DOMParser();
			var xmlDoc = domParser.parseFromString(data, 'text/xml');
			var __indexAxis = xmlDoc.getElementsByTagName("indexAxis")[0]
			var __key = __indexAxis.getElementsByTagName('key')[0]
			var __sets = xmlDoc.getElementsByTagName("sets")[0]
			var __set = __sets.getElementsByTagName("set")[0]

			//防止没有key节点
			o.key.indexs = __key && String(__key.getAttribute('indexs')) ? String(__key.getAttribute('indexs')) : o.key.indexs

			//__sets.getAttribute('name') 当没有name属性时 防止null
			o.vertical.name = __sets.getAttribute('name') && String(__sets.getAttribute('name')) ? String(__sets.getAttribute('name')) : o.vertical.name
			o.vertical.data = __set.getAttribute('values') ? String(__set.getAttribute('values')).split(',') : o.vertical.data
			o.horizontal.name = __indexAxis.getAttribute('name') && String(__indexAxis.getAttribute('name')) ? String(__indexAxis.getAttribute('name')) : o.horizontal.name
			o.horizontal.data = __indexAxis.getAttribute('labels') ? String(__indexAxis.getAttribute('labels')).split(',') : o.horizontal.data
			return o
		}
	});

	return DataParse;

	}, {
	    requires:['base','node']
	}
);
KISSY.add('brix/gallery/charts/js/pub/models/eventtype',function(S){
	
	var EventType  = {
		MOVE : 'move',
		OVER : 'over',
		OUT  : 'out',
		COMPLETE:'complete',
		CLICK: '_click'       //为防止跟原有click重复触发
	};

	return EventType;

	}
);
KISSY.add('brix/gallery/charts/js/pub/utils/datasection',function(S){


	 function normalizeTickInterval(interval, magnitude) {
        var normalized, i;
        // var multiples = [1, 2, 2.5, 5, 10];
        var multiples = [1, 2, 5, 10];
        // round to a tenfold of 1, 2, 2.5 or 5
        normalized = interval / magnitude;

        // normalize the interval to the nearest multiple
        for (i = 0; i < multiples.length; i++) {
            interval = multiples[i];
            if (normalized <= (multiples[i] + (multiples[i + 1] || multiples[i])) / 2) {
                break;
            }
        }

        // multiply back to the correct magnitude
        interval *= magnitude;

        return interval;
    }

    /**
     * Fix JS round off float errors
     * @param {Number} num
     */

    function correctFloat(num) {
        return parseFloat(
            num.toPrecision(14));
    }

    /**
     * Set the tick positions of a linear axis to round values like whole tens or every five.
     */

    function getLinearTickPositions(arr,$maxPart,$cfg) {
    	var scale = $cfg && $cfg.scale ? parseFloat($cfg.scale) :1
    	//返回的数组中的值 是否都为整数(思霏)  防止返回[8, 8.2, 8.4, 8.6, 8.8, 9]   应该返回[8, 9]
    	var isInt = $cfg && $cfg.isInt ? 1 : 0 

		if(isNaN(scale)){
			scale = 1
		}
        // var max = arrayMax(arr);
        var max = Math.max.apply(null,arr)
        var initMax = max
        max *= scale
        // var min = arrayMin(arr);
        var min = Math.min.apply(null,arr) 

        if(min==max){
        	if(max>=0){
        		min= 0
        		// min= Math.round(max/2);
        	}
        	else{
        		min=max*2;
        	}
        }

        var length = max - min;
        if (length) {
        	var tempmin = min //保证min>0的时候不会出现负数
        	min -= length * 0.05;
            // S.log(min +":"+ tempmin)
            if(min<0 && tempmin>=0){
            	min=0
            }
            max += length * 0.05;
        }
        
        var tickInterval = (max - min) * 72 / 365;
        var magnitude = Math.pow(10, Math.floor(Math.log(tickInterval) / Math.LN10));

        tickInterval = normalizeTickInterval(tickInterval, magnitude);
        if(isInt){
        	tickInterval = Math.ceil(tickInterval)
        }

        var pos,
            lastPos,
            roundedMin = correctFloat(Math.floor(min / tickInterval) * tickInterval),
            roundedMax = correctFloat(Math.ceil(max / tickInterval) * tickInterval),
            tickPositions = [];

        // Populate the intermediate values
        pos = roundedMin;
        while (pos <= roundedMax) {

            // Place the tick on the rounded value
            tickPositions.push(pos);

            // Always add the raw tickInterval, not the corrected one.
            pos = correctFloat(pos + tickInterval) 

            // If the interval is not big enough in the current min - max range to actually increase
            // the loop variable, we need to break out to prevent endless loop. Issue #619
            if (pos === lastPos) {
                break;
            }

            // Record the last value
            lastPos = pos;
        }
        if(tickPositions.length >= 3){
        	if(tickPositions[tickPositions.length - 2] >= initMax){
				tickPositions.pop()
			}
        }
        return tickPositions;
    }
	
	var DataSection  = {
		
		section:function($arr,$maxPart,$cfg){
			var arr = []
			// S.log($arr)
			if($cfg && $cfg.mode == 1){
				arr = oldSection($arr,$maxPart,$cfg)	
			}else{
				arr = getLinearTickPositions($arr,$maxPart,$cfg)
				if(arr.length < 1){
					arr = oldSection($arr,$maxPart,$cfg)		
				}
			}
			
			return arr
		}
	};

	function oldSection($arr,$maxPart,$cfg){
		var _max = Math.max.apply(null,$arr)   //所有数据中最大值
		var _min = Math.min.apply(null,$arr) 
		var _count =  $arr.length               //总共有几条数据
		var _maxPart = $maxPart ? $maxPart : 9  //当前 最多有几个分段
		var arr = []
		var tmpMax = _max
		var tmpMin = 0
		var l = String(Math.ceil(_max)).length
		var scale = 1
		$cfg || ($cfg = {})
		scale = parseFloat($cfg.scale)
		if(!isNaN(scale)){
			_max *= scale
		}
		if (_max % Math.pow(10, l - 1) != 0) {
			//千位数以上 
			if (l >= 3) {
				if (parseInt(_max / Math.pow(10, l - 2)) % 2 == 0) {
					tmpMax = parseInt(_max / Math.pow(10, l - 2)) * Math.pow(10, l - 2) + 2 * Math.pow(10, l - 2)
				}else {
					tmpMax = parseInt(_max / Math.pow(10, l - 2)) * Math.pow(10, l - 2) + Math.pow(10, l - 2)
				}
			}else {
				tmpMax = parseInt(_max / Math.pow(10, l - 1) + 1) * Math.pow(10, l - 1)
			}
		}
		l = String(tmpMax).length
		if (_maxPart >= _count ) { _maxPart = _count }
		var part = _maxPart
		//十位数以上
		if (l >= 2) {
			for (var a = 1, al = tmpMax / Math.pow(10, l - 2) ; a <= al; a++ ) {
				if (tmpMax / (a *  Math.pow(10, l - 2)) == parseInt(tmpMax / (a *  Math.pow(10, l - 2)))) {
					if (tmpMax / (a *  Math.pow(10, l - 2)) <= _maxPart) {
						if (_maxPart - tmpMax / (a *  Math.pow(10, l - 2)) < part) {
							part = _maxPart - tmpMax / (a *  Math.pow(10, l - 2))
						}
					}
				}
			}
			for (var b = 0, bl = _maxPart - part; b < bl; b++ ) {
				arr[b] = tmpMax / (_maxPart - part) * (b + 1)
			}
			//个位数及小数点
		}else if (l <= 1) {
			for (var c = 1, cl = tmpMax ; c <= cl; c++ ) {
				if (tmpMax / c == parseInt(tmpMax / c)) {
					if (tmpMax / c <= _maxPart) {
						if (_maxPart - tmpMax / c < part) {
							part = _maxPart - tmpMax / c
						}
					}
				}
			}
			for (var d = 0, dl = _maxPart - part; d < dl; d++ ) {
				arr[d] = tmpMax / (_maxPart - part) * (d + 1)
			}
		}
		if (arr.length < 1) {
			arr = [0]
		}
		// arr = [10330000,10360000]
		return arr
	}

	return DataSection;

	}
);
KISSY.add('brix/gallery/charts/js/pub/utils/global',function(S){
	
	var Global  = {

		N05    : 0.5,
		N00001 : 0.00001,

		/**
		 * 数字千分位加','号
		 * @param  {[Number]} $n [数字]
		 * @param  {[type]} $s [千分位上的符号]
		 * @return {[String]}    [根据$s提供的值 对千分位进行分隔 并且小数点上自动加上'.'号  组合成字符串]
		 */
		numAddSymbol:function($n,$s){
			var s = String($n)
			var symbol = $s ? $s : ','
			if(isNaN($n)){
				return s
			}
			var n_arr = s.split('.')
			s = n_arr[0]
			var l = s.length
			var d = l / 3
			var arr = []
			if(d > 1){
				for(var a = 1;a<d;a++){
					arr.unshift(s.substr(-3,3))
					s = s.substr(0,s.length - 3)
				}
			}
			arr.unshift(s)
			n_arr.shift()
			arr.concat(n_arr)
			s = arr.join($s)
			if(n_arr.length == 1){
				s = s + '.' + n_arr[0]
			}
			return s
		},

		/**
		 * 将二维数组转换成一维数组
		 * @param  {[Array]} $arr [二维数组]
		 * @return {[Array]}      [一维数组]
		 */
		getChildsArr:function($arr){
			var arr = []
			for (var i = 0, l = $arr.length; i < l; i++){
				var tmp = $arr[i]
				arr = arr.concat(tmp);
			}
			return arr;
		},

		/**
		 * 从一个二维数组中获取子数组最长的长度值
		 * @param  {[type]} $arr:Array [description]
		 * @return {[type]}            [description]
		 */
		getMaxChildArrLength:function($arr) {
			var n = 0
			var arr = $arr
			for (var i = 0, l = arr.length; i < l; i++ ) {
				n = n > arr[i].length ? n : arr[i].length
			}
			return n
		},

		/**
		 * 根据$start和$end 从一个数组中合并数据
		 * @param  {[Array]} $arr    [数组]
		 * @param  {[Number]} $start [开始的索引]
		 * @param  {[Number]} $end   [结束的索引]
		 * @return {[Number]}        [之和的数字]
		 */
		getArrMergerNumber:function($arr,$start,$end){
			var n = 0
			var start = $start ? $start : 0 
			var end = $end || $end == 0 ? $end : $arr.length - 1
			if (start > end) {
				return n
			}
			for (var a = 0, al = $arr.length; a < al; a++) {
				if(a >= start){
					n = n + Number($arr[a])
					if(a == end){
						break;
					}
				}
			}
			return n
		},

		//在一个数组中 返回比对$arr中的值离$n最近的值的索引
		disMinATArr:function($n, $arr) {
			var index = 0
			var n = Math.abs($n - $arr[0])
			for (var a = 1, al = $arr.length ; a < al; a++ ) {
				if (n > Math.abs($n - $arr[a])) {
					n = Math.abs($n - $arr[a])
					index = a
				}
			}
			return index
		},

		/**
		 * 从一个数组中删除$length参数指定的长度 但需要保留子数组最后一位 返回新的数组
		 * @param  {[Array]} $arr    [数组]
		 * @param  {[Number]} $length [删除的长度]
		 * @return {[Array]}         [删除之后的数组]
		 */
		delArrUnPop:function($arr, $length) {
			var tmp = S.clone($arr);
			if (tmp.length >= $length + 1){
				var pop = tmp[tmp.length - 1];
				tmp.length = tmp.length - $length - 1;
				tmp.push(pop);
			}
			return tmp;
		},

		//根据$index指定的索引 将$arr中的$index处的数据 放到最前面 $index之后的数据自动提前一位
		unshiftIndexArray:function ($arr, $index) {
			var tmp = $arr[$index]
			$arr.splice($index,1)
			$arr.unshift(tmp)
		},

		ceil:function ($n){
			return Math.ceil($n)
		},

		//等比例缩放数值 $p1=缩放后最大w,h  $p2=需要缩放的w,h
		fit:function($p1,$p2){
			var p = {}
			var disW = $p1.w / $p2.w, disH = $p1.h / $p2.h
			
			if (disW >= disH) {
				p.scale = disH
				p.w = $p2.w * disH , p.h = $p1.h
			} else {
				p.scale = disW
				p.w = $p1.w, p.h = $p2.h * disW;
			}
			return p
		},

		//根据文字的length获取文字的宽
		getTextWidth:function($length){
			return 11 + 7 * ($length-1)
		},

		/**
		 * 计算数组中的每个值 占该数组总值的比例 并按原始索引返回对应的比例数组  比例总和为100
		 * @param  {[Array]} $arr    [数组]
		 * @return {[Array]}         [对应的比例数组]
		 */
		getArrScales:function($arr, $exact){
			/*
			var arr = []
			var total = 0
			var max = 0
			var maxIndex = 0
			var scale
			for (var a = 0 , al = $arr.length; a < al; a++) {
				$arr[a] = Number($arr[a])
				total += $arr[a]
			}
			if (total == 0) {
				for (var g = 0 , gl = $arr.length; g < gl; g++) {
					scale = Math.round(1 / $arr.length * 100)
					arr.push(scale)
				}
				return arr
			}
			
			for (var b = 0, bl = $arr.length; b < bl; b++) {
				scale = Math.round($arr[b] / total * 100)
				arr.push(scale)
			}
			
			total = 0
			for (var c = 0, cl = arr.length; c < cl; c++) {
				arr[c] = isNaN(arr[c]) || arr[c] < 0 ? 0 : arr[c]
				if(max < arr[c]){
					max = arr[c]
					maxIndex = c
				}
				total += arr[c]
			}
			if (total > 100) {
				arr[maxIndex] = arr[maxIndex] - (total - 100)
			}else if(total < 100){
				arr[maxIndex] = arr[maxIndex] + (100 - total)
			}
			if (arr[maxIndex] < 0) {
				arr[maxIndex] = 0
			}
			return arr
			*/

			var arr = []
			var total = 0
			var max = 0
			var maxIndex = 0
			var scale
			//几位小数点
			var exact = $exact ? $exact : 0
			var exactNumber = Math.pow(10, (2 + exact))
			//最后整数除以该数 得到exact位的小数点值
			var exactDisNumber = Math.pow(10, exact)
			for (var a = 0 , al = $arr.length; a < al; a++) {
				$arr[a] = Number($arr[a])
				total += $arr[a]
			}
			if (total == 0) {
				for (var g = 0 , gl = $arr.length; g < gl; g++) {
					scale = Math.round(1 / $arr.length * exactNumber)
					arr.push(scale)
				}
				return arr
			}
			
			for (var b = 0, bl = $arr.length; b < bl; b++) {
				scale = Math.round($arr[b] / total * exactNumber)
				arr.push(scale)
			}
			
			total = 0
			for (var c = 0, cl = arr.length; c < cl; c++) {
				arr[c] = isNaN(arr[c]) || arr[c] < 0 ? 0 : arr[c]
				if(max < arr[c]){
					max = arr[c]
					maxIndex = c
				}
				total += arr[c]
			}
			if (total > exactNumber) {
				arr[maxIndex] = arr[maxIndex] - (total - exactNumber)
			}else if(total < exactNumber){
				arr[maxIndex] = arr[maxIndex] + (exactNumber - total)
			}
			if (arr[maxIndex] < 0) {
				arr[maxIndex] = 0
			}
			
			if (exact != 0) {
				for (var d = 0, dl = arr.length; d < dl; d++) {
					arr[d] = arr[d] / exactDisNumber
				}
			}
			return arr
		},

		/**
		 * Number精度计算
		 * @param  {[Array]} $arr    [数组]
		 * @param  {[Number]} $length [删除的长度]
		 * @return {[Array]}         [删除之后的数组]
		 */
		CountAccuracy:{
			/**
			 * 加法
			 * @param  {[Number]} $arg1  [数字1]
			 * @param  {[Number]} $arg2  [数字2]
			 * @return {[Number]}        [两个数字之和后的值]
			 */
			add:function($arg1,$arg2){
				var r1, r2, m;  
				try {  r1 = $arg1.toString().split(".")[1].length;  }  catch (e) {  r1 = 0;  }  
				try {  r2 = $arg2.toString().split(".")[1].length;  }  catch (e) {  r2 = 0;  }  
				m = Math.pow(10, Math.max(r1, r2)); 
				//19.6*100 = ?????
				return (this.mul($arg1, m) + this.mul($arg2, m)) / m;
			},

			/**
			 * 乘法
			 * @param  {[Number]} $arg1  [数字1]
			 * @param  {[Number]} $arg2  [数字2]
			 * @return {[Number]}        [两个数字之乘后的值]
			 */
			mul:function($arg1, $arg2) {  
				var m = 0, s1 = $arg1.toString(), s2 = $arg2.toString();  
				try {  m += s1.split(".")[1].length;  }  catch (e) {  }  
				try {  m += s2.split(".")[1].length;  }  catch (e) {  }  
				return Number(s1.replace(".", "")) * Number(s2.replace(".", "")) / Math.pow(10, m)
			}
		},
		/**
		 * 获取相对坐标(相对于div)
		 * @param  {[Obhect]}   $evt     [鼠标事件对象]
		 * @param  {[document]} $element [删除的长度]
		 * @return {[Object]}            [相对于div坐标]
		 */
		getLocalXY:function($evt,$element){
			// while($element.tagName!='DIV'){
			// 	$element = $element.parentNode
			// }
			var o = S.one($element).offset()
			// var o = $element
			//S.log($element)
			//S.log('$evt.pageX ' + $evt.pageX +"   |   "+ '$evt.pageY ' + $evt.pageY)
			// S.log('offset   X ' + o.left +"   |   "+ 'offset   Y ' + o.top)
			//debugger
			return {'x':$evt.pageX - o.left, 'y':$evt.pageY - o.top};
		},

		/**
		 * 获取一个简单的价格
		 * @param  {[Number]}   $n       [一个值]
		 * @return {[String]}            [一个带单位的字符串]
		 */
		getSimplePrice:function($n){
			// var $n = 5432167890.08
			var s = String($n)
			s = s.split('.')[0]
			if(s.length > 5){
				var s1 = s.substr(0,s.length - 4)
				var s2 = s.substr(s.length - 4, 4)
				s = Math.round(Number(s1 + '.' + s2))
				s = this.numAddSymbol(String(s)) + '万'
				return s
			}else{
				return $n
			}
		}
	};

	return Global;

	}
);
KISSY.add('brix/gallery/charts/js/pub/utils/move',function(S,Base){                               //R3
	
	function Move(p1, p2, s, mFn, eFn){
		
		var self = this

		Move.superclass.constructor.apply(self,arguments);
		self._id = null
		self.init(p1, p2, s, mFn, eFn);


	}
	Move.ATTRS = {
		_time:{
			value:10
		}
	}
	S.extend(Move,Base,{
		init:function(p1, p2, s, mFn, eFn){
			
			var self = this
			self.ok = 1
			var dN = self._distance(p1, p2);
			var dirX = p2.x-p1.x>0 ? 1 : -1, dirY = p2.y-p1.y>0 ? 1 : -1;
			var pXN, pYN;
			var addXN, addYN
			var curX = p1.x,curY = p1.y
			
			self._id = setInterval(function() {
				if(self.ok==1){
					
				}else{
					return
				}
				mFn({x:curX, y:curY});
				var disX = Math.abs(p2.x - curX), disY = Math.abs(p2.y - curY);
				var nx = disX / 10 * dirX, ny = disY / 10 * dirY
 				// console.log(nx,ny)
				curX += nx, curY += ny
				// console.log(curX,curY)
				if(Math.abs(curX) == Math.abs(p2.x) && Math.abs(curY) == Math.abs(p2.y)){
					eFn ? eFn() : ''
					clearInterval(self._id), self._id = null
				}

				// var dis = self._distance(p2, { x:curX, y:curY } );
				// var disX = Math.abs(p2.x - curX), disY = Math.abs(p2.y - curY);
				// if (addXN < Math.abs(disX * s * dirX) || addYN < Math.abs(disY * s * dirY)) {
				// 	curX = p2.x, curY = p2.y;
				// 	eFn ? eFn() : ''
				// 	clearInterval(self._id), self._id = null
				// }
				// var nx = disX * s * dirX, ny = disY * s * dirY
				// nx = dirX * nx > 0 ? nx : -nx, ny = dirY * ny > 0 ? ny : -ny
				// curX += nx, curY += ny;

				// if (curX == pXN && curY == pYN) {
				// 	curX = p2.x, curY = p2.y;
				// 	eFn ? eFn() : ''
				// 	clearInterval(self._id), self._id = null
				// }
				// pXN = curX, pYN = curY;
				// addXN = Math.abs(disX * s * dirX), addYN = Math.abs(disY * s * dirY)
			},self.get('_time'))
		},

		stop:function(){
			var self = this
			this.ok = 0
			clearInterval(self._id), self._id = null
		},

		_distance:function(p1, p2) {
			var disX = p2.x - p1.x, disY = p2.y - p1.y
			return Math.sqrt(disX*disX+disY*disY);
		}
	});

	return Move;

	}, {
	    requires:['base']
	}
);
KISSY.add('brix/gallery/charts/js/pub/utils/parsestringtoobject',function(S){
	
	var ParseStringToObject  = {
		toArray:function($s,$s1,$s2){
			var $s1 = $s1 ? $s1 : '&'
			var $s2 = $s2 ? $s2 : '='

			var arr = $s.split($s1);
			var l = arr.length;
			if (l == 1 && !arr[0].split($s2)[1]) { 
				return [];
			}
			var Arr = new Array();
			for (var i = 0; i<l; i++) {
				var tmpArr = arr[i].split($s2);
				var o = new Object();
				o.name = tmpArr[0], o.value = tmpArr[1]
				if (o.value != undefined) {
					Arr.push(o);
				}
			}
			return Arr;
		},
		toObject:function($s,$s1,$s2){
			var $s1 = $s1 ? $s1 : '&'
			var $s2 = $s2 ? $s2 : '='

			var o = { }
			var arr = ParseStringToObject.toArray($s, $s1, $s2)
			if (arr.length) {
				for (var a = 0, al= arr.length; a < al; a++ ) {
					o[arr[a].name] = arr[a].value
				}
			}else {
				return o
			}
			return o
		}
	};

	return ParseStringToObject;

	}
);
KISSY.add('brix/gallery/charts/js/pub/utils/svgelement',function(S,Base){                               //R3
	
	function SVGElement(){
		
		var self = this

		SVGElement.superclass.constructor.apply(self,arguments);

		self.element = null

		self.dynamic = {}

		self.init.apply(self,arguments);
	}

	S.extend(SVGElement,Base,{
		init:function(){
			this.createElement(arguments[0])
		},

		attr:function($attrs){
			for(var i in $attrs){
				this.set(i,$attrs[i])
			}
		},

		getDynamic:function($name){
			return this.dynamic[$name]
		},
		setDynamic:function($name,$value){
			this.dynamic[$name] = $value
		},

		set:function($name,$value){
			this.element.setAttribute($name,$value);
		},

		get:function($attr){
			return this.element.getAttribute($attr);
		},

		//添加事件
		on: function ($eventType, $handler) {
			var fn = $handler;
			this.element['on' + $eventType] = fn;
			return this;
		},
		//触发事件
		fire:function($eventType,$o){
			if(this.element['on' + $eventType]){
				this.element['on' + $eventType]($o)
			}
		},

		createElement:function($att){
			this.element = document.createElementNS('http://www.w3.org/2000/svg',$att);
		},

		addChild:function($class){
			this.element.appendChild($class.get('element').element)
		},
		delChild:function($class){
			this.element.removeChild($class.get('element').element)
		},

		appendChild:function($node){
			this.element.appendChild($node)
		},
		removeChild:function($node){
			this.element.removeChild($node);
		},

		getWidth:function(){
			return this.element.getBBox().width
			// return this.element.clientWidth
		},
		getHeight:function(){
			return this.element.getBBox().height
			// return this.element.clientHeight
		},

		transformX:function($x){
			var y = this.get('_y') ? this.get('_y') : 0
			var s = 'matrix(1,0,0,1,' + $x + ',' + y + ')';
			this.set('_x',$x)
			this.set('transform',s)
		},
		transformY:function($y){
			var x = this.get('_x') ? this.get('_x') : 0
			var s = 'matrix(1,0,0,1,' + x + ',' + $y + ')';
			this.set('_y',$y)
			this.set('transform',s)
		},
		transformXY:function($x,$y){
			var s = 'matrix(1,0,0,1,' + $x + ',' + $y + ')';
			this.set('_x',$x)
			this.set('_y',$y)
			this.set('transform',s)
		},

		mouseEvent:function($b){
			var self = this
			if($b){
				var value = null
			}else{
				var value = cancel
			}
			self.element.onclick = value
			self.element.ondblclick = value
			self.element.onmousedown = value
			self.element.onmouseup = value
			self.element.onmouseover = value
			self.element.onmousemove = value
			self.element.onmouseout = value
			function cancel($e){
				return false
			}
		}
		

	});

	return SVGElement;

	}, {
	    requires:['base','node']
	}
);
KISSY.add('brix/gallery/charts/js/pub/utils/svgrenderer',function(S){
	
	/**
	 * SVG渲染Path String
	 * @type {Object}
	 */
	var SVGRenderer = {

	  	symbol: function ($symbol, $x, $y, $w, $h, $options) {

		   var symbolFn = this.symbols[$symbol],
		       path = symbolFn && symbolFn(

		       Math.round($x),
		       Math.round($y),
		       $w,
		       $h,
		       $options
		    );

		    return path;
	 	},
	 	actions:{
	 		M : 'M',
	 		L : 'L',
	 		Q : 'Q'

	 	},
	 	symbols: {

		    //直线
		    'line'  : function($x,$y,$w,$h){
		    	return [
		    		SVGRenderer.actions.M, $x, $y,
		    		SVGRenderer.actions.L, $w, $h
		    	]
		    },
		    //多线组合
		    'lines' : function($x, $y, $w, $h, $options){
		    	var $arr = $options
		    	var s = SVGRenderer.actions.M + $arr[0].x + ' ' + $arr[0].y
		    	for(var a = 1,al = $arr.length; a < al ; a++){

		    		var x = $arr[a].x
		    		var y = $arr[a].y
		    		s += ' ' + SVGRenderer.actions.L + x + ' ' + y
		    	}
		    	return s
		    },
		    //二次贝塞尔曲线
		    'curveLines':function($x, $y, $w, $h, $options){
		    	var arr = S.clone($options);

				var s = SVGRenderer.actions.M + arr[0].x + ' ' + arr[0].y

			    for (var a = 0, al = arr.length - 2; a < al; a++ ) {
				    var x2 = (arr[a + 1].x + arr[a + 2].x ) / 2
				    var y2 = (arr[a + 1].y + arr[a + 2].y ) / 2
				    var x = arr[a + 1].x * 2 - (arr[a].x + x2) / 2;
				    var y = arr[a + 1].y * 2 - (arr[a].y + y2) / 2;
				    s +=' ' +  SVGRenderer.actions.Q + x + ' ' + y + ' ' + x2 + ' ' + y2
				    arr[a + 1] = {x:x2,y:y2}
			    }
			    s += ' ' + SVGRenderer.actions.L + arr[arr.length - 1].x + ' ' + arr[arr.length - 1].y
		   	 	return s
		    },
		    //方形
		    'square': function (x, y, w, h) {
		        return [
		            SVGRenderer.actions.M, x, y,
		            SVGRenderer.actions.L, x + w, y,
		            x + w, y + h,
		            x, y + h
		        ];
		    }
		}
	}

	return SVGRenderer;

	}
);
KISSY.add('brix/gallery/charts/js/pub/views/back',function(S,Base,node,Global,SVGElement,SVGRenderer,SVGGraphics){
	
	function Back(){
		
		var self = this

		Back.superclass.constructor.apply(self,arguments);

		// self.init.apply(self,arguments);
	}

	Back.ATTRS = {
		w:{
			value:0
		},
		h:{
			value:0
		},
		h_ver:{
			value:0              //纵轴的高
		},
		w_hor:{
			value:0              //横轴的宽
		},
		element:{
			value:null
		},
		data_ver:{
			value:[]             //纵轴数据集合  [{x:100},{}]
		},
		data_hor:{
			value:[]             //横轴数据集合  [{y:100}.{}]
		},
		line_fill:{
			value:'#D6D6D6'
		},
		line_ver_mode:{          //纵向的线模式(0 = 虚线 | 1 = 实线)
			value:1
		},
		line_hor_mode:{          //横向的线模式(0 = 虚线 | 1 = 实线)
			value:0    
		},
		axis:{                   //坐标轴
			value:{
				enabled : 1,

				x:{
					enabled : 1
				},

				y:{
					enabled : 1
				}
			}
		},


		_line_ver:{
			value:null           //纵轴框
		},
		_line_hor:{
			value:null           //横轴框
		},
		_line_w:{ 
			value:1              //线宽
		},
		_df:{
			value:null
		}
	}

	S.extend(Back,Base,{
		init:function(){
			var self = this
			Back.superclass.constructor.apply(self,arguments);
			
			self.set('element', new SVGElement('g')), self.get('element').set('class','back')
			self.get('parent').appendChild(self.get('element').element)

			self._widget()
			self._layout()

		},

		_widget:function(){
			var self = this
			var axis = self.get('axis')
			//_line_ver
			// S.log(S.now())
			self.set('_df',document.createDocumentFragment())
			if(axis.enabled == 1){
				//y
				// if(axis.y && axis.y.enabled == 1){
					var d = SVGRenderer.symbol('line',0,0,0,-self.get('h')).join(' ')
					self.set('_line_ver', new SVGElement('path'))
				    self.get('_line_ver').attr({'stroke':self.get('line_fill'),'stroke-width':self.get('_line_w'),'d':d})
				    self.get('_df').appendChild(self.get('_line_ver').element)
			    // }
			    //x
			    // if(axis.x && axis.x.enabled == 1){
				    var d = SVGRenderer.symbol('line',0,0,self.get('w'),0).join(' ')
					self.set('_line_hor', new SVGElement('path'))
				    self.get('_line_hor').attr({'stroke':self.get('line_fill'),'stroke-width':self.get('_line_w'),'d':d})
				    self.get('_df').appendChild(self.get('_line_hor').element)
				// }
		    }
		},
		_layout:function(){
			var self = this
			self.set('h_ver', self.get('h_ver') ? self.get('h_ver') : self.get('h'))
			self.set('w_hor', self.get('w_hor') ? self.get('w_hor') : self.get('w'))
			// S.log(S.now())
			//横向实现 |虚线
			for (var a = 0, al = self.get('data_hor').length; a < al; a++ ) {
				var o = self.get('data_hor')[a]
				var y = o.y
				var line = new SVGElement('line')
				if(self.get('line_hor_mode') == 0){
					line.attr({'x1':0,'y1':0,'x2':self.get('w_hor'),'y2':0,'stroke':self.get('line_fill'),'stroke-dasharray':'2,3'})
				}else if(self.get('line_hor_mode') == 1){
					line.attr({'x1':0,'y1':0,'x2':self.get('w_hor'),'y2':0,'stroke':self.get('line_fill')})
				}
				line.transformY(y)
				self.get('_df').appendChild(line.element)
			}

			//纵向实线 | 虚线
			for (var b = 0, bl = self.get('data_ver').length; b < bl; b++ ) {
				var o = self.get('data_ver')[b]
				var x = o.x
				var line = new SVGElement('line')
				if(self.get('line_ver_mode') == 0){
					line.attr({'x1':0,'y1':0,'x2':0,'y2':-self.get('h_ver'),'stroke':self.get('line_fill'),'stroke-dasharray':'2,3'})
				}else if(self.get('line_ver_mode') == 1){
					line.attr({'x1':0,'y1':0,'x2':0,'y2':-self.get('h_ver'),'stroke':self.get('line_fill')})
				}
				line.transformX(x)
				self.get('_df').appendChild(line.element)
			}
			self.get('element').appendChild(self.get('_df'))
			// S.log(S.now())
		}
	});

	return Back;

	}, {
	    requires:['base','node','../utils/global','../utils/svgelement','../utils/svgrenderer','../views/svggraphics']
	}
);
KISSY.add('brix/gallery/charts/js/pub/views/globalinduce',function(S,Base,node,SVGElement,SVGRenderer){
	
	function GlobalInduce(){
		
		var self = this

		GlobalInduce.superclass.constructor.apply(self,arguments);
	}

	GlobalInduce.ATTRS = {
		w:{
			value:100
		},
		h:{
			value:100
		},
		element:{
			value:null
		},
		opacity:{
			value:1              
		}
	}

	S.extend(GlobalInduce,Base,{
		init:function(){
			var self = this
			GlobalInduce.superclass.constructor.apply(self,arguments);

			self.set('element', new SVGElement('g')), self.get('element').set('class','globalInduce')
			self.get('parent').appendChild(self.get('element').element)

			var induce = new SVGElement('path')
			var w = self.get('w'), h = self.get('h')
			var d = SVGRenderer.symbol('square',0,0,w,h).join(' ')
			induce.attr({'_w':w,'_h':h,'d':d,'opacity':self.get('opacity')})
			self.get('element').appendChild(induce.element)
		}
	});

	return GlobalInduce;

	}, {
	    requires:['base','node','../utils/svgelement','../utils/svgrenderer']
	}
);
KISSY.add('brix/gallery/charts/js/pub/views/histogram/core',function(S,Base,Node,Global,DataSection,SVGElement,Vertical,Horizontal,Back,GlobalInduce,EventType,Graphs){
	var $ = Node.all

	function Core(){
		
		var self = this

		/*
			arguments:

			  o:{
				parent    :''     //SVGElement
				w         :100    //宽
				h         :100    //高
				DataSource:{}     //数据源
				config    :{}     //配置
			  }

		 */
		Core.superclass.constructor.apply(self,arguments);

		self.init()
	}

	Core.ATTRS = {
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
		_globalInduce:{
			value:null                   //全局感应区
		},
		_induces:{
			value:null                   //感应区
		},

		_disX:{
			value:6                      //左、右的距离
		},
		_disY:{
			value:10                     //上、下的距离
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
	}

	S.extend(Core,Base,{
		init:function(){
			var self = this
			self.set('element', new SVGElement('g')), self.get('element').set('class','core')
			self.get('parent').appendChild(self.get('element').element)
		},

		widget:function(){
			var self = this

			Graphs.superclass.constructor.apply(self,arguments);
			
			self._widget()
		},

		getAttr:function($name){
			var self = this
			return self.get('_' + $name)
		},

		_widget:function(){
			var self = this
			self.set('_DataFrameFormat',self.DataExtend(self.get('_DataFrameFormat'),self.get('DataSource'))) 
			self.get('_DataFrameFormat').key.data = String(self.get('_DataFrameFormat').key.indexs).split(',')
			self.get('_DataFrameFormat').vertical.max = self._getChildsMaxArr(self.get('_DataFrameFormat').vertical.org)
			self.get('_DataFrameFormat').vertical.section = DataSection.section(Global.getChildsArr(self.get('_DataFrameFormat').vertical.max), null, {mode:1})
			self.get('_DataFrameFormat').graphs.groupCount = self.get('_DataFrameFormat').vertical.max.length
			self.get('_DataFrameFormat').graphs.groups = Global.getMaxChildArrLength(self.get('_DataFrameFormat').vertical.max)

			self.set('_vertical',new Vertical())
			self.set('_horizontal',new Horizontal())
			self.set('_back',new Back())
			self.set('_graphs',new Graphs())
			self.set('_globalInduce', new GlobalInduce())
			self.set('_induces',new Graphs())
			
			self._trimVertical()
			var o = {
				parent : self.get('element'),
				data   : self.get('_DataFrameFormat').vertical.data
			}
			self.get('_vertical').init(o)
			self.get('_vertical').get('element').transformXY(self.get('_disX'), self.get('h') - self.get('_horizontal').get('h') - self.get('_disY'))

			self._trimGraphs()
			var o = {
				w      : self.get('_horizontalMaxW'),
				h      : self.get('_verticalMaxH'),
				parent : self.get('element'),
				data_hor : self.get('_DataFrameFormat').vertical.data,
			}
			self.get('_back').init(o)
			self.get('_back').get('element').transformXY(self.get('_disX') + self.get('_vertical').get('w'), self.get('h') -  self.get('_horizontal').get('h') - self.get('_disY'))

			self.get('_DataFrameFormat').graphs.groupW = self._getGroupWidth()

			var  o = {
				h      : self.get('_verticalGraphsH'),
				parent : self.get('element'),
				data   : Global.delArrUnPop(self.get('_DataFrameFormat').graphs.data, self.get('_del')),
				groupW : self.get('_DataFrameFormat').graphs.groupW,
				singleW: 8,
				disSingleX : 2,
				groupCount : self.get('_DataFrameFormat').graphs.groupCount
			}
			self.get('_graphs').init(o)
			self.get('_graphs').get('element').transformXY(self.get('_disX') + self.get('_vertical').get('w') + Global.N05, self.get('h') -  self.get('_horizontal').get('h') - self.get('_disY') + Global.N05)

			self._trimHorizontal()
			var o = {
				w      : self.get('_back').get('w'),
				parent : self.get('element'),
				data   : self.get('_DataFrameFormat').horizontal.data,
				dis_left : self.get('_disX') + self.get('_vertical').get('w') - self.get('_disX')
			}
			self.get('_horizontal').init(o)
			self.get('_horizontal').get('element').transformXY(self.get('_disX') + self.get('_vertical').get('w'), self.get('h') -  self.get('_horizontal').get('h') - self.get('_disY'))

			var o = {
				w     : self.get('w'),
				h     : self.get('h'),
				parent: self.get('element'),
				opacity : Global.N00001
				// opacity : 0.1
			}
			self.get('_globalInduce').init(o)
			// return
			var o = {
				w     : self.get('_horizontalMaxW'),
				h     : self.get('_verticalGraphsH'),
				parent: self.get('element'),
				id    : 'induces',
				data  : Global.delArrUnPop(self.get('_DataFrameFormat').graphs.data, self.get('_del')),
				isInduce   : 1,
				singleW: 8,
				disSingleX : 2,
				groupW: self.get('_DataFrameFormat').graphs.groupW,
				groupCount : self.get('_DataFrameFormat').graphs.groupCount

			}
			self.get('_induces').init(o)
			self.get('_induces').get('element').on(EventType.OVER,function($o){self._overHandler($o)})
			self.get('_induces').get('element').on(EventType.OUT,function($o){self._outHandler($o)})
			self.get('_induces').get('element').transformXY(self.get('_disX') + self.get('_vertical').get('w') +Global.N05, self.get('h') -  self.get('_horizontal').get('h') - self.get('_disY') + Global.N05)

			self.get('element').fire(EventType.COMPLETE)
		},

		_getChildsMaxArr:function($arr){
			var arr = []

			for (var a = 0, al = $arr.length; a < al; a++ ) {
				var o = $arr[a]
				
				var tmp = []
				for (var b = 0, bl = o.data.length; b < bl; b++ ) {
					var o1 = o.data[b]
					for (var c = 0, cl = o1.data.length; c < cl; c++ ) {
						!tmp[c] ? tmp[c] = 0 : ''
						tmp[c] = Global.CountAccuracy.add(tmp[c], Number(o1.data[c]))
					}
				}
				arr.push(tmp)
			}
			return arr
		},

		//换算纵向
		_trimVertical:function(){
			var self = this
			self.set('_verticalMaxH', self.get('h') - self.get('_disY') - self.get('_horizontal').get('h') - self.get('_disY'))
			self.set('_verticalGraphsH', self.get('_verticalMaxH') - self._getVerticalDisY())
			var max = self.get('_DataFrameFormat').vertical.section[self.get('_DataFrameFormat').vertical.section.length - 1]
			var arr = self.get('_DataFrameFormat').vertical.section
			var tmpData = []
			for (var a = 0, al = arr.length; a < al; a++ ) {
				var y = -arr[a] / max * self.get('_verticalGraphsH')                                    
				y = isNaN(y) ? 0 : Global.ceil(y)                                                    
				tmpData[a] = { 'value':arr[a], 'y': y }
			}
			self.get('_DataFrameFormat').vertical.data = tmpData
		},
		//获取纵向总高到第一条线之间的距离
		_getVerticalDisY:function(){
			var self = this
			var disMin = self.get('_dis_line')
			var disMax = 2 * self.get('_dis_line')
			var dis = disMin
			dis = disMin + self.get('_verticalMaxH') % self.get('_DataFrameFormat').vertical.section.length   //Q3  DataFrameFormat.vertical.section.length
			dis = dis > disMax ? disMax : dis
			return dis
		},
		//获取图形中每组的宽
		_getGroupWidth:function(){
			var self = this
			var n = 0
			var disMin = self.get('_dis_line')
			var disMax = 2 * self.get('_dis_line')
			var dis = disMin
			var min = self.get('_graphs').getGroupMinW()
			var w = self.get('_horizontalMaxW') - disMin
			if (w % self.get('_DataFrameFormat').graphs.groups + disMin > disMax) {
				dis = disMax
			}else {
				dis = disMin + w % self.get('_DataFrameFormat').graphs.groups
			}
			w = self.get('_horizontalMaxW') - dis
			n = w / self.get('_DataFrameFormat').graphs.groups
			if (n < min) { n = min }
			return n
		},
		//换算横向
		_trimHorizontal:function(){
			var self = this
			var arr = Global.delArrUnPop(self.get('_DataFrameFormat').horizontal.org, self.get('_del'))
			var tmpData = []
		    for (var i = 0, l  = arr.length; i < l; i++ ) {
				tmpData.push( { 'value':arr[i], 'x':Global.ceil(self.get('_graphs').get('groupW') * (i+1)) } )
			}
			self.get('_DataFrameFormat').horizontal.data = tmpData

		},
		//获取横向总宽到第一条线之间的距离
		_getHorizontalDisX:function(){
			var self = this
			var disMin = self.get('_dis_line')
			var disMax = 2 * self.get('_dis_line')
			var dis = disMin
			dis = disMin + self.get('_horizontalMaxW') % self.get('_DataFrameFormat').horizontal.org.length 
			dis = dis > disMax ? disMax : dis
			return dis
		},
		
		//换算图形
		_trimGraphs:function(){   
			var self = this                                                           

			self.set('_horizontalMaxW', self.get('w') - self.get('_disX') - self.get('_vertical').get('w') - self.get('_disX'))
			var max = self.get('_DataFrameFormat').vertical.section[self.get('_DataFrameFormat').vertical.section.length - 1]
			var fills = self.get('config').fills
			// fills = [[ { normal:'#94CC5C', over:'#78A64B' }, { normal:'#458AE6', over:'#135EBF' }, { normal:'#FF0000', over:'#FF0000' } ], [ { normal:'#CCCCCC', over:'#999999' }, { normal:'#999999', over:'#666666' }, { normal:'#FF0000', over:'#FF0000' } ]]
			var arr = self.get('_DataFrameFormat').vertical.org
			var tmpData = []

			for (var a = 0, al = arr.length; a < al; a++ ) {
				var o = arr[a]
				
				var tmp = []
				//b = 2
				for (var b = 0, bl = o.data.length; b < bl; b++ ) {
					var o1 = o.data[b]
					//c = 5
					for (var c = 0, cl = o1.data.length; c < cl; c++ ) {
						!tmp[c] ? tmp[c] = [] : '' 
						var value = Number(o1.data[c])
						var fill = fills[a] && fills[a][b] ? fills[a][b] : null  
						var oo = { 'value':value, 'height': value / max * self.get('_verticalGraphsH'), fill: fill}
						!tmp[c].unshift(oo)
					}
				}
				tmpData.push(tmp)
			}
			
			var tmpData2 = []
			for (var d = 0, dl = tmpData.length; d < dl; d++ ) {
				for (var e = 0, el = tmpData[d].length; e < el; e++ ) {
					!tmpData2[e] ? tmpData2[e] = [] : ''
					tmpData2[e].push(tmpData[d][e])
				}
			}
			self.get('_DataFrameFormat').graphs.data = tmpData2
			if (self.get('_DataFrameFormat').graphs.groups * self.get('_graphs').getGroupMinW() > self.get('_horizontalMaxW') - self.get('_dis_line')) {
				self.set('_del', Global.ceil((self.get('_DataFrameFormat').graphs.groups * self.get('_graphs').getGroupMinW() - (self.get('_horizontalMaxW') - self.get('_dis_line'))) / self.get('_graphs').getGroupMinW()))
				var tmpData = Global.delArrUnPop(self.get('_DataFrameFormat').graphs.data, self.get('_del'))
				self.get('_DataFrameFormat').graphs.groups = tmpData.length
			}
		},
		//每两个点之间的距离
		_getGraphsDisX:function(){
			var self = this
			return self.get('_horizontalGraphsW') / (self.get('_DataFrameFormat').horizontal.org.length - 1)
		},

		_overHandler:function($o){
			$o.cx = Number($o.cx) + Number(this.get('_graphs').get('element').get('_x'))
			$o.cy = Number(this.get('_graphs').get('element').get('_y') - $o.cy)
			this.get('_graphs').induce({index:$o.index,id:$o.id},true)
			this.get('element').fire(EventType.OVER,$o)
		},
		_outHandler:function($o){
			this.get('_graphs').induce({index:$o.index,id:$o.id},false)
			this.get('element').fire(EventType.OUT,$o)
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
			DataFrameFormat.horizontal.names = DataSource.horizontal.names
			DataFrameFormat.horizontal.org = DataSource.horizontal.data
			DataFrameFormat.horizontal.start.name = DataSource.horizontal.start.name ? DataSource.horizontal.start.name : DataFrameFormat.horizontal.start.name

			return DataFrameFormat
		}
	});

	return Core;

	}, {
	    requires:['base','node','../../utils/global','../../utils/datasection','../../utils/svgelement',
	    		  '../../views/vertical','../../views/horizontal','../../views/back','../../views/globalinduce','../../models/eventtype','./graphs'
	    ]
	}
);
KISSY.add('brix/gallery/charts/js/pub/views/histogram/graphs',function(S,Base,node,Global,SVGElement,SVGRenderer,Group,EventType){
	
	function Graphs(){
		
		var self = this

		Graphs.superclass.constructor.apply(self,arguments);
	}

	Graphs.ATTRS = {
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
			value:[]             //[[{x:0,y:-100},{}],[]]
		},
		element:{
			value:null
		},
		isInduce:{
			value:0              //是否作为感应区
		},
		groupW:{
			value:59             //一组的宽
		},
		groupCount:{
			value:1              //每组中几条数据
		},		
		disGroupX:{
			value:22             //组之间距离
		},
		disGroupMinX:{
			value:2              //组之间最小距离
		},
		disGroupLimitX:{
			value:1              //组之间极限距离
		},
		disSingleX:{
			value:4              //组中支柱距离
		},
		disSingle:{
			value:0              //当layout的mode=1时 支柱之间的距离
		},

		disSingleMinX:{
			value:1              //组中支柱最小距离
		},
		singleW:{
			value:16             //支柱宽
		},
		singleMinW:{
			value:4              //支柱最小宽
		},
		intX:{
			value:16             //x是否取整
		},
		layout:{                 //布局
			value:{
				mode:0           //模式(0 = 纵向 | 1 = 横向)
			}
		},

		_groupMinW:{
			value:0              //每组最小的宽
		},
		_groupNormalW:{
			value:0              //每组中在正常状态下的宽
		},
		_disGroupX:{ 
			value:0              //当前 组之间距离
		},
		_disSingleX:{
			value:0              //当前 组中支柱距离    
		},
		_singleW:{ 
			value:0              //当前 支柱宽         
		},
		_groupArr:{ 
			value:[]             //group对象集合    
		},

		_groups:{ 
			value:null
		}
	}			

	S.extend(Graphs,Base,{
		init:function(){
			var self = this
			Graphs.superclass.constructor.apply(self,arguments);
			
			self.set('element', new SVGElement('g')), self.get('element').set('class',self.get('id'))
			self.get('parent').appendChild(self.get('element').element)

			self.set('_disGroupX',self.get('disGroupX'))
			self.set('_disSingleX',self.get('disSingleX'))
			self.set('_singleW',self.get('singleW'))

			self._algorithm()
			self._widget()
			self._layout()
		},
		induce:function($o,$b){
			var self = this
			self.get('_groupArr')[$o.index].induce({id:$o.id},$b)
		},
		//获取每组最小的宽
		getGroupMinW:function(){
			var self = this
			if(!self.get('_groupMinW')){
				 self.set('_groupMinW', 2 * self.get('disGroupLimitX') + self.get('groupCount') * self.get('singleMinW') + (self.get('groupCount') - 1) * self.get('disSingleMinX'))				 
			}
			return self.get('_groupMinW')
		},
		//获取每根直方信息集合 并根据每组 返回一个二维数组
		getInfos:function(){
			var self = this
			var arr = []
			for (var a = 0, al = self.get('_groupArr').length; a < al; a++ ) {
				var group = self.get('_groupArr')[a]
				var o = group.getInfos()
				
				arr.push(o)
			}
			
			//将cx属性转换成相对于this的坐标系统
			for (var b = 0, bl = arr.length; b < bl; b++ ) {
				for (var c = 0, cl = arr[b].length; c < cl; c++ ) {
					o = arr[b][c]
					o.cx = self.get('intX') ? o.cx + Global.ceil(b * self.get('groupW')) : o.cx + b * self.get('groupW')
				}
			}
			
			return arr
		},
		//获取某个直方的信息
		getNodeInfoAt:function($index, $id){
			var self = this
			var group = self.get('_groupArr')[$index]
			var o  = group.getNodeInfoAt($id)
			o.cx = Number(o.cx) + Number(group.get('element').get('_x'))
			o.x = Number(o.x) + Number(group.get('element').get('_x'))
			return o
		},

		_widget:function(){
			var self = this

			self.set('_groups', new SVGElement('g')), self.get('_groups').set('class','groups')
			self.get('element').appendChild(self.get('_groups').element)
		},

		_layout:function(){
			var self = this
			var config = self.get('config')
			// var data = [
			// 	[ [{ value:'201', height:60, key: { isKey:'' }, fill:{normal:'#458AE6',over:'#135EBF'}}, { value:'101', height:30, key: { isKey:'' }, fill:{normal:'#94CC5C',over:'#78A64B'}}],[{ value:'201', height:160, key: { isKey:'' }, fill:{normal:'#C3C3C3',over:'#B7B7B7'}}, { value:'101', height:130, key: { isKey:'' }, fill:{normal:'#E0E0E0',over:'#D8D8D8'}}] ],
			// 	[ [{ value:'201', height:60, key: { isKey:'' }, fill:{normal:'#458AE6',over:'#135EBF'}}, { value:'101', height:30, key: { isKey:'' }, fill:{normal:'#94CC5C',over:'#78A64B'}}],[{ value:'201', height:160, key: { isKey:'' }, fill:{normal:'#C3C3C3',over:'#B7B7B7'}}, { value:'101', height:130, key: { isKey:'' }, fill:{normal:'#E0E0E0',over:'#D8D8D8'}}] ]
			// ]
			// self.set('data',data)
			for (var a = 0, al = self.get('data').length; a < al; a++ ) {
				var group = new Group()
				self.get('_groupArr').push(group)
				var o = {
					index  : a,
					h      : self.get('layout').mode == 0 ? self.get('h') : self.get('w'),
					parent : self.get('_groups'),
					data   : self.get('data')[a],
					isInduce : self.get('isInduce'),
					layout : self.get('layout'),
					disGroupX : self.get('_disGroupX'),
					disSingleX : self.get('_disSingleX'),
					disSignle  : self.get('disSingle'),
					singleW : self.get('_singleW'),
					intX   : self.get('intX')
				}
				if(config && config.fills){
					o.fills = config.fills.normals,
					o.fills_over = config.fills.overs
				}

				group.init(o)
				group.get('element').on(EventType.OVER,function($o){self._overHandler($o)})
				group.get('element').on(EventType.OUT,function($o){self._outHandler($o)})
				group.get('element').on(EventType.MOVE,function($o){self._moveHandler($o)})

				group.get('element').set('_index',a)
				if(self.get('layout').mode == 0){
					var x = Global.ceil(self.get('groupW') * a)
					group.get('element').transformX(x)

				}else if(self.get('layout').mode == 1){
					var y = Global.ceil(self.get('groupW') * a)
					group.get('element').transformY(-y)
				}
			}
		},

		//获取每组正常的宽
		_getGroupNormalW:function(){
			var self = this
			if (!self.get('_groupNormalW')) {
				self.set('_groupNormalW', 2 * self.get('disGroupX') + self.get('groupCount') * self.get('singleW') + (self.get('groupCount') - 1) * self.get('disSingleX'))
			}
			return self.get('_groupNormalW')
		},

		//算法
	 	_algorithm:function(){
	 		var self = this
	 		self._getGroupNormalW()
	 		if (self.get('groupW') > self.get('_groupNormalW')) {
				self.set('_disGroupX', self.get('disGroupX') + (self.get('groupW') - self.get('_groupNormalW')) / 2)
			}else if (self.get('groupW') < self.get('_groupNormalW')) {
				//比正常中心+最小两端大
				if (self.get('groupW') > (2 * self.get('disGroupMinX') + self.get('groupCount') * self.get('singleW') + (self.get('groupCount') - 1) * self.get('disSingleX'))) {
					self.set('_disGroupX', (self.get('groupW') -(self.get('groupCount') * self.get('singleW') + (self.get('groupCount') - 1) * self.get('disSingleX'))) / 2)
				}else if (self.get('groupW') < (2 * self.get('disGroupMinX') + self.get('groupCount') * self.get('singleW') + (self.get('groupCount') - 1) * self.get('disSingleX'))) {
					self.set('_disGroupX', self.get('disGroupMinX'))
					if (self.get('groupW') > (2 * self.get('disGroupMinX') + self.get('groupCount') * self.get('singleW') + (self.get('groupCount') - 1) * self.get('disSingleMinX'))) {
						self.set('_disSingleX', (self.get('groupW') - (2 * self.get('disGroupMinX') + self.get('groupCount') * self.get('singleW'))) / (self.get('groupCount') - 1))
					}else if(self.get('groupW') < (2 * self.get('disGroupMinX') + self.get('groupCount') * self.get('singleW') + (self.get('groupCount') - 1) * self.get('disSingleMinX'))){
						self.set('_disSingleX', self.get('disSingleMinX'))
						self.set('singleW',self.get('singleW')-1)
						
						if (self.get('singleW') <= self.get('singleMinW')) {
							self.set('singleW', self.get('singleMinW'))
							self.set('disGroupMinX',self.get('disGroupMinX')-1)
							self.set('_disGroupX', self.get('disGroupMinX'))
							if (self.get('_disGroupX') <= self.get('disGroupLimitX')) {
								var scale = self.get('groupW') / (2 * self.get('disGroupLimitX') + self.get('groupCount') * self.get('singleW') + (self.get('groupCount') - 1) * self.get('disSingleMinX'))
								self.set('_disGroupX', scale * self.get('disGroupLimitX'))
								self.set('_disSingleX', scale * self.get('disSingleMinX'))
								self.set('_singleW', scale * self.get('singleMinW'))
								return
							}
						}
						self.set('_singleW', self.get('singleW'))
						self._algorithm()
						
					}else {
						self.set('_disSingleX', self.get('disSingleMinX'))
					}
				}else {
					self.set('_disGroupX', self.get('disGroupMinX'))
				}
			}
	 	},

	 	_overHandler:function($o){
	 		var self = this
	 		var layout = self.get('layout')
			var group = self.get('_groupArr')[$o.index]
			$o.cx = Number($o.cx) + Number(group.get('element').get('_x'))
			$o.cy = Number($o.cy) - Number(group.get('element').get('_y'))
			if(layout.mode == 0){
			}else if(layout.mode == 1){
				$o.h = Number($o.h) - Number(group.get('element').get('_y'))
			}
			self.get('element').fire(EventType.OVER,$o)
		},
		_outHandler:function($o){
			var self = this
			self.get('element').fire(EventType.OUT,$o)
		},
		_moveHandler:function($o){
			var self = this
			var o = Global.getLocalXY($o.evt, self.get('parent').element)
			var x = o.x, y = o.y
			$o.x = x, $o.y = y
			self.get('element').fire(EventType.MOVE,$o)
		}
	});

	return Graphs;

	}, {
	    requires:['base','node','../../utils/global','../../utils/svgelement','../../utils/svgrenderer','./group','../../models/eventtype']
	}
);
KISSY.add('brix/gallery/charts/js/pub/views/histogram/group',function(S,Base,node,Global,SVGElement,SVGRenderer,SVGGraphics,EventType){
	
	function Group(){
		
		var self = this

		Group.superclass.constructor.apply(self,arguments);
	}

	Group.ATTRS = {
		index:{
			value:0              //索引
		},
		h:{
			value:100
		},
		data:{
			value:[]             //[{height:100,key:{iskey:0}},{}]  
		},
		element:{
			value:null
		},
		isInduce:{
			value:0              //是否作为感应区
		},
		layout:{                 //布局
			value:{
				mode : 0         //模式(0 = 纵向 | 1 = 横向)
			}
		},	
		fills:{
			value:['#458AE6', '#39BCC0', '#5BCB8A', '#C3CC5C', '#E6B522', '#E68422']   //普通色集合
		},
		fills_over:{
			value:['#135EBF','#2E9599','#36B26A','#9CA632','#BF9E39','#BF7C39']        //鼠标划入色集合
		},
		keyFill:{
			value:'#E68422'      //关键色
		},
		keyFill_over:{
			value:'#BF7C39'      //鼠标划入关键色
		},
		fill:{
			value:'#666666'      //初始颜色[线色 + 圆轮廓色]
		},
		fill_over:{
			value:'#000000'      //鼠标划入颜色[线色 + 圆轮廓色]
		},
		intX:{
			value:1               //x是否取整
		},

		disGroupX:{
			value:2              //两端相差的距离
		},
		singleW:{
			value:4              //支柱宽
		},
		disSingleX:{
			value:2              //支柱之间的距离
		},
		disSingle:{
			value:0              //当layout的mode=1时 支柱直接的距离
		},

		_induces:{
			value:null           //感应区对象g
		},
		_pillars:{
			value:null           //支柱对象g
		},
		
		_inducesArr:{
			value:[]             //感应区对象集合
		},	
		_pillarsArr:{
			value:[]             //支柱对象集合	
		},


		_sytle:{
			value:1              //样式[1 = 只有一个直方 | 2 = 多个直方叠加]
		},
		_minH:{
			value:2              //支柱最小高
		},
		_disInduce:{
			value:2              //当鼠标划入时增加的值
		},
		_isOver:{
			value:0              //鼠标是否有移动到
		},		
		_fill:{
			value:''             //记录普通色
		},
		_fill_over:{
			value:''             //记录鼠标划入色
		}
	}	

	S.extend(Group,Base,{
		init:function(){
			var self = this
			Group.superclass.constructor.apply(self,arguments);
			
			self.set('element', new SVGElement('g'))//, self.get('element').set('id',self.get('index'))
			self.get('parent').appendChild(self.get('element').element)

			self._widget()
			self._layout()

			// self.set('_circle', SVGGraphics.circle({'r':2,'fill':'#ffffff','stroke':'#000000','stroke_width':1}))
			// self.get('element').appendChild(self.get('_circle').element)
		},
		induce:function($o,$b){
			var self = this
			var pillar = self.get('_pillarsArr')[$o.id]
			self._induce(pillar,$b)
		},
		//获取每根直方信息集合 包括中心点cx 等
		getInfos:function(){
			var self = this
			var arr = [] 
			for (var a = 0, al = self.get('_pillarsArr').length; a < al; a++ ) {
				var pillar = self.get('_pillarsArr')[a]
				var cx = self.get('intX') ? Global.ceil(Number(pillar.get('_x')) + Number(pillar.get('_w') / 2)) : Number(pillar.get('_x')) + Number(pillar.get('_w') / 2)
				var o = { cx: cx}
				arr.push(o)
			}
			return arr
		},
		getNodeInfoAt:function($index){
			var self = this
			var pillar = self.get('_pillarsArr')[$index]
			var o = {}
			o.index = self.get('index'), o.id = $index
			o.x = Number(pillar.get('_x')), o.y = 0
			o.cx = self.get('intX') ? Global.ceil(Number(pillar.get('_x')) + Number(pillar.get('_w') / 2)) : Number(pillar.get('_x')) + Number(pillar.get('_w') / 2)
			o.h = -pillar.get('_h')
			o.fill = self.get('fills')[$index], o.fill_over = self.get('fills_over')[$index]
			return o
		},
		
		_widget:function(){
			var self = this
			self.set('_pillars', new SVGElement('g')), self.get('_pillars').set('class','pillars')
			self.get('element').appendChild(self.get('_pillars').element)
			self.set('_induces', new SVGElement('g')), self.get('_induces').set('class','induces')
			self.get('element').appendChild(self.get('_induces').element)
		},

		_layout:function(){
			var self = this
			var layout = self.get('layout')
			var _pillars_df = document.createDocumentFragment();
			var _induces_df = document.createDocumentFragment();
			for (var a = 0, al = self.get('data').length; a < al; a++ ) {
				var o = self.get('data')[a]
				var x
				x = self.get('disGroupX') + (self.get('singleW') + self.get('disSingleX')) * a
				x = self.get('intX') ? Global.ceil(x) : x

				var w = self.get('singleW')
				if(!(o instanceof Array)){
					var h = o.height
					h = h > self.get('_minH') ? h : self.get('_minH')
				
					var fill = self.get('fills')[a]
					var iskey = o.key && o.key.isKey ? o.key.isKey : ''
					fill = iskey ? self.get('keyFill') : fill

					//pillar 支柱
					if(layout.mode == 0){
						var pillar = self._drawGraph({w:w,h:-h,fill:fill})           //-h
					}else if(layout.mode == 1){
						var pillar = self._drawGraph({w:h,h:-w,fill:fill})
					}
					_pillars_df.appendChild(pillar.element)
					self.get('_pillarsArr').push(pillar)
					pillar.set('_index', a)
					if(layout.mode == 0){
						pillar.transformX(x)
					}else if(layout.mode == 1){
						pillar.transformY(-x)
					}
				}else{
					//直方上叠直方
					self.set('_sytle', 2)

					//pillar 支柱
					var pillar = new SVGElement('g')
					_pillars_df.appendChild(pillar.element)

					var singles_arr = []
					var max_h = 0
					for (var b = 0, bl = o.length; b < bl; b++ ) {
						var oo = o[b]
						var h = oo.height
						h = h > self.get('_minH') ? h : self.get('_minH')
						max_h += h
						var fill = (oo.fill && oo.fill.normal) ? oo.fill.normal : '#000000'
						//single 单个直方
						// var single = self._drawGraph({w:w,h:-h,fill:fill})
						if(layout.mode == 0){
							var single = self._drawGraph({w:w,h:-h,fill:fill})
						}else if(layout.mode == 1){
							var single = self._drawGraph({w:h,h:-w,fill:fill})
						}
						pillar.appendChild(single.element)
						singles_arr.push(single)

						single.transformY(0)
						//前一个小直方数据对象
						var pre_oo = o[b - 1]
						if(pre_oo){
							var pre_single = singles_arr[b-1]
							var y = Number(pre_single.get('_y')) + Number(pre_single.get('_h'))
							// single.transformY(y)
							if(layout.mode == 0){
								single.transformY(y)
							}else if(layout.mode == 1){
								// var x = Number(pre_single.get('_x')) + Number(pre_single.get('_w'))
								single.transformX(Number(pre_single.get('_x')) + Number(pre_single.get('_w')) + self.get('disSingle'))
							}
						}
					}
					pillar.setDynamic('singles_arr', singles_arr)
					// pillar.transformX(x)
					if(layout.mode == 0){
						pillar.transformX(x)
					}else if(layout.mode == 1){
						pillar.transformY(-x)
					}
					self.get('_pillarsArr').push(pillar)
					pillar.set('_index', a)
					pillar.set('_h', -max_h)
				}

				//induce
				w = self.get('singleW') + self.get('_disInduce')
				h = self.get('h')
				// var induce = self._drawGraph({w:w,h:-h,opacity:0.2})
				if(layout.mode == 0){
					var induce = self._drawGraph({w:w,h:-h,opacity:Global.N00001})
					// var induce = self._drawGraph({w:w,h:-h,opacity:0.2})
				}else if(layout.mode == 1){
					var induce = self._drawGraph({w:h,h:-w,opacity:Global.N00001})
					// var induce = self._drawGraph({w:h,h:-w,opacity:0.5})
				}
				_induces_df.appendChild(induce.element), self.get('_inducesArr').push(induce)
				induce.element.addEventListener("mouseover",function(evt){ self._overHandler(evt)}, false);
				induce.element.addEventListener("mouseout",function(evt){ self._outHandler(evt)}, false);
				induce.element.addEventListener("mousemove",function(evt){ self._moveHandler(evt)}, false);
				if(layout.mode == 0){
					x = x - self.get('_disInduce') / 2
				}else if(layout.mode == 1){
					x = x - self.get('_disInduce') / 2
				}
				x = self.get('intX') ? Global.ceil(x) : x
				induce.set('_index', a)
				if(layout.mode == 0){
					induce.transformX(x)
				}else if(layout.mode == 1){
					induce.transformY(-x)
				}
			}

			if(self.get('isInduce') == 0){
				self.get('_pillars').appendChild(_pillars_df)
			}
			if(self.get('isInduce') == 1){
				self.get('_induces').appendChild(_induces_df)
			}
		},

		//画支柱
		_drawGraph:function($o){
			var w = $o.w,h = $o.h,fill = $o.fill ? $o.fill : '#000000',opacity = $o.opacity ? $o.opacity : 1
			var d = SVGRenderer.symbol('square',0,0,w,h).join(' ')
			var p = new SVGElement('path')
			p.attr({'_w':w,'_h':h,'d':d,'fill':fill,'opacity':opacity})
			return p
		},

		_overHandler:function($evt){
			var self = this
			var layout = self.get('layout')
			var index = $evt.target.getAttribute('_index')
			var pillar = self.get('_pillarsArr')[index]

			if(self.get('_sytle') == 1){
				self.set('_isOver', 1)
				self.set('_fill', self.get('fills')[index])
				self.set('_fill_over', self.get('fills_over')[index])
				if (self.get('data')[index].key && self.get('data')[index].key.isKey) { self.set('_fill', self.get('keyFill')), self.set('_fill_over' , self.get('keyFill_over'))}
			}else if(self.get('_sytle') == 2){
			}
			var o = {}
			if(layout.mode == 0){
				o.index = self.get('index'), o.id = index, o.x = pillar.get('_x'), o.cx = Number(o.x) + Number(self.get('singleW') / 2), o.cy = -pillar.get('_h'), o.h = -pillar.get('_h'), o.fill_over = self.get('_fill_over')
			}else if(layout.mode == 1){
				o.index = self.get('index'), o.id = index, o.x = 0, o.y = -pillar.get('_y') , o.cx = Number(o.x) + Number(pillar.get('_w')) + Number(self.get('_disInduce')), o.cy = o.y -pillar.get('_h') / 2, o.h = o.y, o.fill_over = self.get('_fill_over')
			}
			// self.set('_circle', SVGGraphics.circle({'r':2,'fill':'#ffffff','stroke':'#000000','stroke_width':1}))
			// self.get('element').appendChild(self.get('_circle').element)
			// self.get('_circle').transformXY(o.cx,-o.h)

			self.get('element').fire(EventType.OVER,o)
		},
		_outHandler:function($evt){
			var self = this
			var index = $evt.target.getAttribute('_index')
			self.set('_isOver', 0)
			var pillar = self.get('_pillarsArr')[index]
			// self._induce(pillar)

			var o = {}
			o.index = self.get('index'), o.id = index
			self.get('element').fire(EventType.OUT,o)
		},
		_moveHandler:function($evt){
			var self = this
			var index = $evt.target.getAttribute('_index')

			var o = {}
			o.index = self.get('index'), o.id = index, o.evt = $evt
			self.get('element').fire(EventType.MOVE,o)
		},

		_induce:function($e,$b){
			var self = this
			var x,y,w,h,d,fill
			var layout = self.get('layout')
			var index = $e.get('_index')
			if(self.get('_sytle') == 1){
				if ($b) {
					w = Number($e.get('_w')) + Number(self.get('_disInduce')),h = Number($e.get('_h')) - Number(self.get('_disInduce'))
					if(layout.mode == 0){
						x = Number($e.get('_x')) - Number(self.get('_disInduce') / 2)
					}else if(layout.mode == 1){
						y = Number($e.get('_y')) + Number(self.get('_disInduce') / 2)
					}
					fill = self.get('fills_over')[index]
					if (self.get('data')[index].key && self.get('data')[index].key.isKey) { fill = self.get('keyFill_over')}
				}else {
					w = Number($e.get('_w')),h = Number($e.get('_h'))
					if(layout.mode == 0){
						x = Number($e.get('_x')) + Number(self.get('_disInduce') / 2)
					}else if(layout.mode == 1){
						y = Number($e.get('_y')) - Number(self.get('_disInduce') / 2)
					}
					fill = self.get('fills')[index]
					if (self.get('data')[index].key && self.get('data')[index].key.isKey) { fill = self.get('keyFill')}
				}
				d = SVGRenderer.symbol('square',0,0,w,h).join(' ')
				$e.set('d',d)
				if(layout.mode == 0){
					$e.transformX(x)
				}else if(layout.mode == 1){
					$e.transformY(y)
				}
				$e.set('fill',fill)
			}else if(self.get('_sytle') == 2){
				for (var a = 0, al = $e.getDynamic('singles_arr').length; a < al; a++ ) {
					//单个直方
					var e = $e.getDynamic('singles_arr')[a]
					if ($b) {
						w = Number(e.get('_w')) + Number(self.get('_disInduce')),h = Number(e.get('_h')) - Number(self.get('_disInduce'))
						x = Number(e.get('_x')) - Number(self.get('_disInduce') / 2)
						if(layout.mode == 1){
							y = Number(e.get('_y')) + Number(self.get('_disInduce') / 2)
						}
						fill = self.get('data')[index][a].fill.over
					}else {
						w = Number(e.get('_w')),h = Number(e.get('_h'))
						x = Number(e.get('_x')) + Number(self.get('_disInduce') / 2)
						if(layout.mode == 1){
							y = Number(e.get('_y')) - Number(self.get('_disInduce') / 2)
						}
						fill = self.get('data')[index][a].fill.normal
					}
					d = SVGRenderer.symbol('square',0,0,w,h).join(' ')
					e.set('d',d)
					if(layout.mode == 0){
						e.transformX(x)
					}else if(layout.mode == 1){
						e.transformY(y)
					}
					e.set('fill',fill)
				}
			}
		}
	});

	return Group;

	}, {
	    requires:['base','node','../../utils/global','../../utils/svgelement','../../utils/svgrenderer','../../views/svggraphics','../../models/eventtype']
	}
);
KISSY.add('brix/gallery/charts/js/pub/views/histogram3/core',function(S,Base,Node,Global,DataSection,SVGElement,Vertical,GlobalInduce,EventType,Graphs){
	var $ = Node.all

	function Core(){
		
		var self = this

		/*
			arguments:

			  o:{
				parent    :''     //SVGElement
				w         :100    //宽
				h         :100    //高
				DataSource:{}     //数据源
				config    :{}     //配置
			  }

		 */
		Core.superclass.constructor.apply(self,arguments);

		self.init()
	}

	Core.ATTRS = {
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
					sections:[],             //分段之后二维数据[[0]中存放左侧数据、[1]中存放右侧数据]
					data:[],                 //转换坐标后的数据  =>Vertical.data、Back.data
					datas:[]                 //转换坐标后的二维数据: 二维数组[[0]中存放左侧数据、[1]中存放右侧数据]  =>Vertical.data、Back.data_hor

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

		_vertical:{
			value:null                   //纵向
		},
		_vertical_right:{
			value:null                   //纵向(右侧)
		},
		_graphs:{
			value:null                   //图形
		},
		_globalInduce:{
			value:null                   //全局感应区
		},
		_induces:{
			value:null                   //感应区
		},

		_disX:{
			value:6                      //左、右的距离
		},
		_disY:{
			value:6                      //上、下的距离
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
		_baseNumber:{                    //基础值(原点)
			value:0
		},
		_baseNumberRight:{               //右侧基础值(原点)
			value:0
		}
	}

	S.extend(Core,Base,{
		init:function(){
			var self = this
			self.set('element', new SVGElement('g')), self.get('element').set('class','core')
			self.get('parent').appendChild(self.get('element').element)
		},

		widget:function(){
			var self = this

			Graphs.superclass.constructor.apply(self,arguments);
			
			self._widget()
		},

		getAttr:function($name){
			var self = this
			return self.get('_' + $name)
		},

		_widget:function(){
			var self = this
			self.set('_DataFrameFormat',self.DataExtend(self.get('_DataFrameFormat'),self.get('DataSource'))) 
			var trimData = self._trimData()
			self.get('_DataFrameFormat').key.data = String(self.get('_DataFrameFormat').key.indexs).split(',')
			self.get('_DataFrameFormat').vertical.max = self._getChildsMaxArr(self.get('_DataFrameFormat').vertical.org)
			self.get('_DataFrameFormat').vertical.section = DataSection.section(Global.getChildsArr(self.get('_DataFrameFormat').vertical.max), null, {mode:1})
			self.get('_DataFrameFormat').vertical.sections = trimData.sections
			self.get('_DataFrameFormat').graphs.groupCount = self.get('_DataFrameFormat').vertical.max[0].length
			// self.get('_DataFrameFormat').graphs.groups = Global.getMaxChildArrLength(self.get('_DataFrameFormat').vertical.max)
			self.get('_DataFrameFormat').graphs.groups = self.get('_DataFrameFormat').vertical.max.length

			self.set('_vertical',new Vertical())
			self.set('_vertical_right',new Vertical())
			self.set('_graphs',new Graphs())
			self.set('_globalInduce', new GlobalInduce())
			self.set('_induces',new Graphs())
			
			self._trimVertical()
			var o = {
				parent : self.get('element'),
				data   : self.get('_DataFrameFormat').vertical.datas[0],
				font_fill:'#666666',
				line_has:0
			}
			self.get('_vertical').init(o)
			self.get('_vertical').get('element').transformXY(self.get('_disX'), self.get('h') - self.get('_disY'))

			self._trimVertical(1)
			var o = {
				parent : self.get('element'),
				id     : 'vertical_right',
				data   : self.get('_DataFrameFormat').vertical.datas[1],
				line_has:0,
				font_fill:'#666666',
				mode   : 2
			}
			self.get('_vertical_right').init(o)
			self.get('_vertical_right').get('element').transformXY(self.get('w') - self.get('_disX') - self.get('_vertical_right').get('w'), self.get('h') - self.get('_disY'))

			self._trimGraphs()

			self.get('_DataFrameFormat').graphs.groupW = self._getGroupWidth()

			var  o = {
				h      : self.get('_verticalGraphsH'),
				w      : self.get('_horizontalMaxW'),
				parent : self.get('element'),
				data   : Global.delArrUnPop(self.get('_DataFrameFormat').graphs.data, self.get('_del')),
				layout : {mode:1},
				groupW : self.get('_DataFrameFormat').graphs.groupW,
				singleW: 20,
				disSingleX : 2,
				disSingle  : 1,
				groupCount : self.get('_DataFrameFormat').graphs.groupCount
			}
			self.get('_graphs').init(o)
			self.get('_graphs').get('element').transformXY(self.get('_disX') + self.get('_vertical').get('w') + Global.N05, self.get('h') - self.get('_disY') + Global.N05 - self.get('_DataFrameFormat').graphs.groupW / 2)
			// self.get('_graphs').get('element').transformXY(self.get('_disX') + self.get('_vertical').get('w') + Global.N05, self.get('h') - self.get('_disY') + Global.N05)

			var o = {
				w     : self.get('w'),
				h     : self.get('h'),
				parent: self.get('element'),
				opacity : Global.N00001
				// opacity : 0.1
			}
			self.get('_globalInduce').init(o)
			// return
			var o = {
				h      : self.get('_verticalGraphsH'),
				w      : self.get('_horizontalMaxW'),
				parent: self.get('element'),
				id    : 'induces',
				data  : Global.delArrUnPop(self.get('_DataFrameFormat').graphs.data, self.get('_del')),
				layout : {mode:1},
				isInduce   : 1,
				singleW: 20,
				disSingleX : 2,
				disSingle  : 1,
				groupW: self.get('_DataFrameFormat').graphs.groupW,
				groupCount : self.get('_DataFrameFormat').graphs.groupCount

			}
			self.get('_induces').init(o)
			self.get('_induces').get('element').on(EventType.OVER,function($o){self._overHandler($o)})
			self.get('_induces').get('element').on(EventType.OUT,function($o){self._outHandler($o)})
			self.get('_induces').get('element').on(EventType.MOVE,function($o){self._moveHandler($o)})
			self.get('_induces').get('element').transformXY(self.get('_disX') + self.get('_vertical').get('w') +Global.N05, self.get('h') - self.get('_disY') + Global.N05 - self.get('_DataFrameFormat').graphs.groupW / 2)

			self.get('element').fire(EventType.COMPLETE)
		},

		_trimData:function(){
			var self = this
			var data = self.get('_DataFrameFormat').vertical.org
			var names = []
			var sections = []
			for(var a = 0, al = data.length; a < al; a++){
				var o = data[a]
				var data1 = o.data
				for(var b = 0, bl = data1.length; b < bl; b++){
					var o1 = data1[b]
					!names[b] ? names[b] = [] : ''
					names[b].push(o1)
				}
			}
			for(var a = 0, al = names.length; a < al; a++){
				var arr = names[a]
				!sections[a] ? sections[a] = [] : ''
				for(var b = 0, bl = arr.length; b < bl; b++){
					var o = arr[b]
					sections[a].unshift(o.signName)
				}
			}

			//计算比例 直接赋值
			var arr = data
			for (var a = 0, al = arr.length; a < al; a++ ) {
				var o = arr[a]
				
				var totals = []
				for (var b = 0, bl = o.data.length; b < bl; b++ ) {
					var o1 = o.data[b]
					totals.push(Number(o1.value))
				}

				var scales = Global.getArrScales(totals)

				for(var c = 0, cl = scales.length; c < cl; c++){
					var o1 = o.data[c]
					o1.scale = scales[c]
					o1.data = [1]
				}
			}
			
			return {names:names, sections:sections}
		},

		_getChildsMaxArr:function($arr){
			var arr = []

			for (var a = 0, al = $arr.length; a < al; a++ ) {
				var o = $arr[a]
				
				var tmp = []
				for (var b = 0, bl = o.data.length; b < bl; b++ ) {
					var o1 = o.data[b]
					for (var c = 0, cl = o1.data.length; c < cl; c++ ) {
						!tmp[c] ? tmp[c] = 0 : ''
						tmp[c] = Global.CountAccuracy.add(tmp[c], Number(o1.data[c]))
					}
				}
				arr.push(tmp)
			}
			return arr
		},

		//换算纵向
		_trimVertical:function($i){
			var self = this
			var $i = $i ? $i : 0
			self.set('_verticalMaxH', self.get('h') - self.get('_disY') - self.get('_disY'))
			self.set('_verticalGraphsH', self.get('_verticalMaxH'))// - self._getVerticalDisY($i))
			// var max = self.get('_DataFrameFormat').vertical.sections[$i].length 
			var max = self.get('_DataFrameFormat').vertical.sections[$i].length + 1
			var arr = self.get('_DataFrameFormat').vertical.sections[$i]
			var tmpData = []
			for (var a = 0, al = arr.length; a < al; a++ ) {
				var y = -(a + 1) / max * self.get('_verticalMaxH')                                    
				y = isNaN(y) ? 0 : Global.ceil(y)   
				tmpData[a] = { 'value':arr[a], 'y': y }
			}
			self.get('_DataFrameFormat').vertical.datas[$i] = tmpData
		},
		//获取图形中每组的宽
		_getGroupWidth:function(){
			var self = this
			var config = self.get('config')
			self.set('_verticalMaxH', self.get('h') - self.get('_disY') - self.get('_disY'))
			var n = 0
			var disMin = self.get('_dis_line')
			var disMax = 2 * self.get('_dis_line')
			var dis = disMin
			var min = self.get('_graphs').getGroupMinW()
			var maxW = self.get('_verticalMaxH')
			var w = maxW - disMin

			if (w % self.get('_DataFrameFormat').graphs.groups + disMin > disMax) {
				dis = disMax
			}else {
				dis = disMin + w % self.get('_DataFrameFormat').graphs.groups
			}
			//一组的宽一半
			var groupW = 0
			// if(config.x_axis.layout.mode == 1){
				groupW = (maxW - dis) / self.get('_DataFrameFormat').graphs.groups / 2
			// }
			w = maxW - dis - groupW
			n = w / self.get('_DataFrameFormat').graphs.groups
			if (n < min) { n = min }
			// n = self.get('_verticalMaxH') / self.get('_DataFrameFormat').graphs.groups
			n = self.get('_verticalMaxH') / (self.get('_DataFrameFormat').graphs.groups + 1)
			return n
		},

		//换算图形
		_trimGraphs:function(){   
			var self = this                                                           

			self.set('_horizontalMaxW', self.get('w') - self.get('_disX') - self.get('_vertical').get('w') - self.get('_disX') - self.get('_vertical_right').get('w'))
			var max = self.get('_DataFrameFormat').vertical.section[self.get('_DataFrameFormat').vertical.section.length - 1]
			var fills = self.get('config').fills
			// fills = [[ { normal:'#94CC5C', over:'#78A64B' }, { normal:'#458AE6', over:'#135EBF' }, { normal:'#FF0000', over:'#FF0000' } ], [ { normal:'#CCCCCC', over:'#999999' }, { normal:'#999999', over:'#666666' }, { normal:'#FF0000', over:'#FF0000' } ]]
			var arr = self.get('_DataFrameFormat').vertical.org
			var tmpData = []

			var maxW = self.get('w') - self.get('_disX') - self.get('_vertical').get('w') - self.get('_disX') - self.get('_vertical_right').get('w')
			for (var a = 0, al = arr.length; a < al; a++ ) {
				var o = arr[a]
				
				var tmp = []
				//b = 2
				for (var b = 0, bl = o.data.length; b < bl; b++ ) {
					var o1 = o.data[b]
					//c = 5
					for (var c = 0, cl = o1.data.length; c < cl; c++ ) {
						!tmp[c] ? tmp[c] = [] : '' 
						var value = Number(o1.scale)
						var fill = fills[a] && fills[a][b] ? fills[a][b] : null  
						var oo = { 'value':value, 'height': value / 100 * maxW, fill: fill}
						!tmp[c].push(oo)
					}
				}
				tmpData.unshift(tmp)
			}
			
			// var tmpData2 = []
			// for (var d = 0, dl = tmpData.length; d < dl; d++ ) {
			// 	for (var e = 0, el = tmpData[d].length; e < el; e++ ) {
			// 		!tmpData2[e] ? tmpData2[e] = [] : ''
			// 		tmpData2[e].push(tmpData[d][e])
			// 	}
			// }
			self.get('_DataFrameFormat').graphs.data = tmpData
			if (self.get('_DataFrameFormat').graphs.groups * self.get('_graphs').getGroupMinW() > self.get('_horizontalMaxW') - self.get('_dis_line')) {
				self.set('_del', Global.ceil((self.get('_DataFrameFormat').graphs.groups * self.get('_graphs').getGroupMinW() - (self.get('_horizontalMaxW') - self.get('_dis_line'))) / self.get('_graphs').getGroupMinW()))
				var tmpData = Global.delArrUnPop(self.get('_DataFrameFormat').graphs.data, self.get('_del'))
				self.get('_DataFrameFormat').graphs.groups = tmpData.length
			}
		},
		//每两个点之间的距离
		_getGraphsDisX:function(){
			var self = this
			return self.get('_horizontalGraphsW') / (self.get('_DataFrameFormat').horizontal.org.length - 1)
		},

		_overHandler:function($o){
			$o.cx = Number($o.cx) + Number(this.get('_graphs').get('element').get('_x'))
			$o.cy = Number(this.get('_graphs').get('element').get('_y') - $o.cy)
			this.get('_graphs').induce({index:$o.index,id:$o.id},true)
			this.get('element').fire(EventType.OVER,$o)
		},
		_outHandler:function($o){
			this.get('_graphs').induce({index:$o.index,id:$o.id},false)
			this.get('element').fire(EventType.OUT,$o)
		},
		_moveHandler:function($o){
			var self = this
			var x = $o.x - (self.get('_disX') + self.get('_vertical').get('w') + Global.N05)
			var h = self.get('_DataFrameFormat').graphs.data[$o.index][$o.id][0].height
			if(x > h){
				$o.singleID = 1
			}else{
				$o.singleID = 0
			}
			$o.index = self.get('_DataFrameFormat').vertical.org.length - $o.index - 1
			self.get('element').fire(EventType.MOVE,$o)
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
			DataFrameFormat.horizontal.names = DataSource.horizontal.names
			DataFrameFormat.horizontal.org = DataSource.horizontal.data
			DataFrameFormat.horizontal.start.name = DataSource.horizontal.start.name ? DataSource.horizontal.start.name : DataFrameFormat.horizontal.start.name

			return DataFrameFormat
		}
	});

	return Core;

	}, {
	    requires:['base','node','../../utils/global','../../utils/datasection','../../utils/svgelement',
	    		  '../../views/vertical','../../views/globalinduce','../../models/eventtype','../histogram/graphs'
	    ]
	}
);
KISSY.add('brix/gallery/charts/js/pub/views/horizontal',function(S,Base,node,Global,SVGElement,SVGRenderer,SVGGraphics){
	
	function Horizontal(){
		
		var self = this

		Horizontal.superclass.constructor.apply(self,arguments);

		// self.init.apply(self,arguments);
	}

	Horizontal.ATTRS = {
		w:{
			value:140
		},
		h:{
			value:23
		},
		data:{
			value:[]             //[{value:123,x:0},{}]
		},
		datas:{
			value:[]
		},
		element:{
			value:null
		},
		dis_left:{
			value:0              //第一个文字最左侧坐标的最大值
		},
		dis_right:{
			value:0              //最后一个文字最右侧坐标的最大值
		},
		font_fill:{
			value:'#000000'
		},
		line_fill:{
			value:'#BEBEBE'
		},
		line_w:{
			value:1
		},
		line:{
			value:{
				enabled : 1
			}
		},
		fontsInfo:{             //文字组信息(x)
			value:[]            //[{x:}]
		},

		_data:{
			value:[]             //删除多余数据之后的数组
		},
		_maxTextHeight:{
			value:14             //文字最大的高   写死
		},
		_disX:{
			value:2              //文字到线的距离
		},
		_disY:{
			value:2              //文字到线的距离
		},
		_line_w:{
			value:1
		},
		_line_h:{
			value:6
		},
		_fontsArr:{              //当文字为多行时 几个文字的集合g
			value:[]
		},
		_fontArr:{
			value:[]
		},
		_lineArr:{
			value:[]
		},
	}

	S.extend(Horizontal,Base,{
		init:function(){
			var self = this
			Horizontal.superclass.constructor.apply(self,arguments);

			self.set('_line_w', self.get('line_w'))

			self.set('element', new SVGElement('g')), self.get('element').set('class','horizontal')
			self.get('parent').appendChild(self.get('element').element)

					// var d = SVGRenderer.symbol('line',0,0,100,0).join(' ')
					// self.set('_line_ver', new SVGElement('path'))
				 //    self.get('_line_ver').attr({'stroke':self.get('line_fill'),'stroke-width':self.get('_line_w'),'d':d})
				 //    self.get('element').appendChild(self.get('_line_ver').element)

			self._widget()
			self._layout()
			
			if(self.get('datas').length >= 1){
				return
			}
			self.set('h', self.get('_line_h') + self.get('_disY') + self.get('_maxTextHeight'))
	 	},

		//获取真正显示的数据组合
		getShowData:function(){     
			var self = this
			return self.get('_data')
		},

		_widget:function(){
			// S.log(S.now())
			var self = this
			self.set('dis_right', self.get('dis_right') ? self.get('dis_right') : self.get('w')) 
			var d = SVGRenderer.symbol('line',0,0,0,self.get('_line_h')).join(' ')

			var _df = document.createDocumentFragment();

			if(self.get('datas').length >= 1){
				var arr = self.get('datas')
				var _fontsArr = self.get('_fontsArr')
				var _fontArr = self.get('_fontArr')
				//创建fonts font
				for(var a = 0, al = arr.length; a < al; a++){
					var fonts = new SVGElement('g')
					_fontsArr.push(fonts)
					_df.appendChild(fonts.element)

					!_fontArr[a] ? _fontArr[a] = [] : ''
					for(var b = 0, bl = arr[a].length; b < bl; b++){
						var o = arr[a][b]
						var font = SVGGraphics.text({'fill':self.get('font_fill'),'content':Global.numAddSymbol(o.value)})
						_fontArr[a].push(font)
				   	 	fonts.appendChild(font.element)
					}
				}
				self.get('element').appendChild(_df)

				var arr = _fontArr
				var maxArr = []
				var maxH = 0
				//取每个fonts中的最大宽度 并调整下一个font的y
				for(var c = 0, cl = _fontArr.length; c < cl; c++){
					var maxW = 0
					for(var d = 0, dl = _fontArr[c].length; d < dl; d++){
						var font = _fontArr[c][d]

						var preFont = _fontArr[c][d - 1]
						var y 
						if(preFont){
							y = preFont.getHeight() + self.get('_disY') + font.getHeight()
						}else{
							y = font.getHeight()
						}
						maxW = maxW < font.getWidth() ? Math.floor(font.getWidth()) : maxW 
						maxH = maxH < parseInt(y) ? parseInt(y) + self.get('_disY') : maxH
						font.transformY(y)
					}
					maxArr.push(maxW)
				}

				self.set('h', maxH)

				//居中调整font
				for(var e = 0, el = _fontArr.length; e < el; e++){
					for(var f = 0, fl = _fontArr[e].length; f < fl; f++){
						var font = _fontArr[e][f]
						var x = parseInt((maxArr[e] - font.getWidth()) / 2)
						font.transformX(x)
					}
				}

				var arr = self.get('datas')
				if(arr.length == 2){
					var fonts = _fontsArr[0]
					fonts.setDynamic('center',parseInt(self.get('_disX') + maxArr[0] / 2))
					fonts.transformX(self.get('_disX'))
					var fonts = _fontsArr[1]
					var x = Math.ceil(self.get('w') - maxArr[1] - self.get('_disX'))
					fonts.setDynamic('center',parseInt(x + maxArr[1] / 2))
					fonts.transformX(x)

					var fontsInfo = self.get('fontsInfo')
					fontsInfo.push({x: _fontsArr[0].getDynamic('center')})
					fontsInfo.push({x: _fontsArr[1].getDynamic('center')})
				}
				return
			}

			var max = 0                                                           //获取文字最大的length
			for(var a = 0, al = self.get('data').length; a < al; a++){
				var o = self.get('data')[a]
				var x = o.x
				var y = 0
				var s = Global.numAddSymbol(o.value)
				if(s.length > max){
					max = s.length
				}
			}
			var textMaxWidth = Global.getTextWidth(max)                            //获取文字最大宽
			var maxWidth = self.get('dis_right')                                   //总共能多少像素展现
			var n = Math.floor(maxWidth / (textMaxWidth + 10))                     //能展现几个
			n = n > self.get('data').length ? self.get('data').length : n
			var dis = Math.floor(self.get('data').length / (n - 1))                //array中展现间隔
			dis = self.get('data').length == 2 && n == 2 ? 1 : dis       
			dis = self.get('data').length == 1 && n == 1 ? 0 : dis       
			var arr = []                                                           //存放展现的数据
			for(var a = 0, al = self.get('data').length; a < al; a++){
				var o = self.get('data')[dis * a]
				if(o){
					arr.push(self.get('data')[dis * a])
				}
			}
			if (arr.length > n) {
				dis = Math.ceil(self.get('data').length / (n - 1))
				dis = self.get('data').length == 2 && n == 2 ? 1 : dis       
				dis = self.get('data').length == 1 && n == 1 ? 0 : dis
				arr = []                                                           
				for(a = 0, al = self.get('data').length; a < al; a++){
					o = self.get('data')[dis * a]
					if (o) {
						arr.push(self.get('data')[dis * a])
					}
				}
			}
			
			if (n == 1 && arr.length == 0 ) {                                      //防止连第一条都没的情况
				arr[0] = self.get('data')[0]
			}
			if (n == 2 && arr.length == 1 && self.get('data').length >= 2) {
				arr[1] = self.get('data')[self.get('data').length - 1]
			}

			for(var a = 0, al = arr.length; a < al; a++){
				var o = arr[a]
				var x = o.x
				var y = 0
				//文字
				var font = SVGGraphics.text({'fill':self.get('font_fill'),'content':Global.numAddSymbol(o.value)})
			    self.get('_fontArr').push(font)
			    _df.appendChild(font.element)

			    //线条
			    if(self.get('line').enabled == 1){
				   	var line = new SVGElement('path')
				   	line.attr({'stroke':self.get('line_fill'),'stroke-width':self.get('_line_w'),'d':d})
				    self.get('_lineArr').push(line)
				    x = o.x
				    y = 0
				    line.transformXY(x,y)
				    _df.appendChild(line.element)
			    }
			}
			self.get('element').appendChild(_df)

			for(var a = 0, al = self.get('_fontArr').length; a < al; a++){
				var o = arr[a]
				var font = self.get('_fontArr')[a]
				var x = o.x
				var y = 0
				x = x - font.getWidth() / 2
			    y = self.get('_line_h') + self.get('_disY') + font.getHeight()
			    font.transformXY(x,y)
			}

			self.set('_data', S.clone(arr))
			// S.log(S.now())
		},

		_layout:function(){
			// return
			var self = this

			if(self.get('datas').length >= 1){
				return
			}

			var firstText = self.get('_fontArr')[0]
			var popText = self.get('_fontArr')[self.get('_fontArr').length - 1]

			if(firstText && firstText.get('_x') < -self.get('dis_left')){
				firstText.transformX(-self.get('dis_left'))
			}
			if (popText && (Number(popText.get('_x')) + Number(popText.getWidth())) > self.get('dis_right')) {
				popText.transformX(self.get('dis_right') - popText.getWidth())
			}
		}
	});

	return Horizontal;

	}, {
	    requires:['base','node','../utils/global','../utils/svgelement','../utils/svgrenderer','../views/svggraphics']
	}
);
KISSY.add('brix/gallery/charts/js/pub/views/infos/arrow',function(S,Base,node,Global,SVGElement,SVGRenderer,SVGGraphics){
	
	function Arrow(){
		
		var self = this

		Arrow.superclass.constructor.apply(self,arguments);
	}

	Arrow.ATTRS = {
		element:{
			value:null
		},
		fill:{
			value:'#FFFFFF'
		},
		fill_opacity:{
			value:0.9
		},

		_arrow:{
			value:null    
		}
	}

	S.extend(Arrow,Base,{

		add:function(){
			var self = this
			Arrow.superclass.constructor.apply(self,arguments);

			self.set('element', new SVGElement('g')), self.get('element').set('class','arrow')
			self.get('parent').appendChild(self.get('element').element)
		},

		update:function(){
			var self = this
			Arrow.superclass.constructor.apply(self,arguments);
			if(self.get('_arrow')){
				self.get('element').removeChild(self.get('_arrow').element)
				self.set('arrow',null)
			}
			self.init()
		},

		init:function(){
			var self = this
			Arrow.superclass.constructor.apply(self,arguments);

			// self.add()
			self._widget()
			self._layout()
		},

		_widget:function(){
			var self = this
			self.set('_arrow', new SVGElement('g')), self.get('_arrow').attr({'filter':'url(#' + self.get('shadow_id') + ')'})
			self.get('element').appendChild(self.get('_arrow').element)
		},
		_layout:function(){
			var self = this
			var arrow = SVGGraphics.lines({'lines':self.get('data'),'fill':self.get('fill'),'stroke':'none','fill_opacity':self.get('fill_opacity')})
		    // arrow.attr({'stroke':self.get('fill'),'stroke-width':self.get('w'),'d':d})
		    self.get('_arrow').appendChild(arrow.element)
		}
	});

	return Arrow;

	}, {
	    requires:['base','node','../../utils/global','../../utils/svgelement','../../utils/svgrenderer','../svggraphics']
	}
);
KISSY.add('brix/gallery/charts/js/pub/views/infos/hinfo',function(S,Base,node,Global,SVGElement,SVGGraphics){
	
	function HInfo(){
		
		var self = this

		HInfo.superclass.constructor.apply(self,arguments);
	}

	HInfo.ATTRS = {
		w:{
			value:80
		},
		h:{
			value:25
		},
		element:{
			value:null
		},
		content:{
			value:''
		},
		font_fill:{
			value:'#ffffff'
		},
		font_bold:{
			value:1
		},
		bg_fill:{
			value:'#6D6D6D'
		},
		dis:{
			value:8
		},

		_g:{
			value:null    
		},
		_font:{
			value:null
		},
		_back:{
			value:null
		}
	}

	S.extend(HInfo,Base,{
		init:function(){
			var self = this
			HInfo.superclass.constructor.apply(self,arguments);
			
			self.set('element', new SVGElement('g')), self.get('element').set('class','hinfo')
			self.get('parent').appendChild(self.get('element').element)

			self._widget()
			self._layout()
		},
		
		_widget:function(){
			var self = this
			self.set('_g', new SVGElement('g')), self.get('_g').set('class','g')
			self.get('element').appendChild(self.get('_g').element)

			self.set('_back', new SVGElement('rect')), self.get('_back').attr({'class':'back'})
			self.get('_g').appendChild(self.get('_back').element)

			self.set('_font', new SVGElement('g')),self.get('_font').set('class','font')
			self.get('_g').appendChild(self.get('_font').element)
		},
		_layout:function(){
			var self = this
			var font = SVGGraphics.text({'content':Global.numAddSymbol(self.get('content')),'fill':self.get('font_fill'),'bold':self.get('font_bold')})
			self.get('_font').element.appendChild(font.element)
			var x,y
			var w,h

			w = font.getWidth() + 2 * self.get('dis')
			h = font.getHeight() + self.get('dis')

			x = Global.ceil((w - font.getWidth())/ 2),y = Global.ceil(font.getHeight() * 0.8 + self.get('dis')/2 )
			font.transformXY(x,y)

			self.get('_back').attr({'_w':w,'_h':h,'width':w,'height':h,'fill':self.get('bg_fill'),'rx':4,'rx':4})

			x = -Global.ceil(w/2),y = -Global.ceil(h/2)
			self.get('_g').transformXY(x,y)

			self.set('w', w), self.set('h', h)
		}
	});

	return HInfo;

	}, {
	    requires:['base','node','../../utils/global','../../utils/svgelement','../svggraphics']
	}
);
KISSY.add('brix/gallery/charts/js/pub/views/infos/hline',function(S,Base,node,Global,SVGElement,SVGRenderer,SVGGraphics){
	
	function HLine(){
		
		var self = this

		HLine.superclass.constructor.apply(self,arguments);
	}

	HLine.ATTRS = {
		w:{
			value:1
		},
		h:{
			value:6
		},
		y1:{
			value:0
		},
		element:{
			value:null
		},
		fill:{
			value:'#555555'
		},

		_line:{
			value:null    
		}
	}

	S.extend(HLine,Base,{
		init:function(){
			var self = this
			HLine.superclass.constructor.apply(self,arguments);

			self.set('element', new SVGElement('g')), self.get('element').set('class','hline')
			self.get('parent').appendChild(self.get('element').element)

			self._widget()
			self._layout()
		},

		_widget:function(){
			var self = this
			self.set('_line', new SVGElement('g')), self.get('_line').set('class','line')
			self.get('element').appendChild(self.get('_line').element)
		},
		_layout:function(){
			var self = this
			var line = new SVGElement('path')
			var d = SVGRenderer.symbol('line',0,self.get('y1'),0,self.get('h')).join(' ')
		    line.attr({'stroke':self.get('fill'),'stroke-width':self.get('w'),'d':d})
		    self.get('_line').appendChild(line.element)
		}
	});

	return HLine;

	}, {
	    requires:['base','node','../../utils/global','../../utils/svgelement','../../utils/svgrenderer','../svggraphics']
	}
);
KISSY.add('brix/gallery/charts/js/pub/views/infos/info',function(S,Base,node,Global,SVGElement,SVGGraphics,EventType){
	
	function Info(){
		
		var self = this

		Info.superclass.constructor.apply(self,arguments);

		// self.init.apply(self,arguments);
	}

	Info.ATTRS = {
		w:{
			value:80
		},
		h:{
			value:24
		},
		/*
		 * 二维数组中 一个数组代表一行
		 * o = 
		 *    content(文字内容)[]:展现次数, size(文字大小)[12]:12, bold(是否粗体 1 = 是 | 0 = 否)[0]:1, fill(文字颜色)[0x000000]:0xFF0000, font(字体)[Arial]:Arial
		 *    ver_align(同一列对齐方式 1 = 左对齐 | 2 = 居中对齐 | 3 = 右对齐)[1]:2
		 *    hor_align(同一行对齐方式 1 = 上对齐 | 2 = 居中对齐 | 3 = 下对齐)[1]:2
		*/
		data:{
			value:[]                     //文字描述二维数据集合[[{o},{}],[]]
		},
		element:{
			value:null
		},
		base_fill:{
			value:'#000000'
		},
		isBack:{
			value:1                      //是否有背景
		}, 
		hor_dis:{                        //文字每一排之间的距离
			value:0
		},
		ver_dis:{                        //文字每一列之间的距离
			value:0
		},

		_lay:{
			value:{}                     //根据此对象设置集合文字坐标、对齐方式等 {maxHorH(每一行最大的高集合):[24,24,24], maxVerW(对应列最大的宽集合):[100,100], maxVerAllW(对应列最大的宽集合 包括标志位):[120,120]}      
		},
		_fontsArr:{
			value:[]                     //存放所有文字的二维数组  存入结构类似this.data  
		},
		_font_family:{
			value:'tahoma'
		},
		_disX:{ 
			value:10                     //文字集合到左、右的距离         
		},
		_disY:{ 
			value:5                      //文字集合到上、下的距离     
		},
		_hor_count:{                     //有几排
			value:0
		},
		_ver_count:{                     //有几列
			value:0
		},

		_g:{
			value:null
		},
		_fonts:{ 
			value:null  
		},
		_back:{ 
			value:null  
		}
	}

	S.extend(Info,Base,{
		init:function(){
			var self = this
			Info.superclass.constructor.apply(self,arguments);
			
			self.set('element', new SVGElement('g')), self.get('element').set('class','info')
			self.get('parent').appendChild(self.get('element').element)
			// self.get('element').set('style','cursor:default'), self.get('element').mouseEvent(false)
			self.get('element').element.addEventListener("mouseover",function(evt){ self._overHandler(evt)}, false);
			self.get('element').element.addEventListener("mouseout",function(evt){ self._outHandler(evt)}, false);

			self._widget()
			self._layout()
			// self.set('_circle', SVGGraphics.circle({'r':5,'fill':'#ffffff','stroke':'#000000','stroke_width':2}))
			// self.get('element').appendChild(self.get('_circle').element)
		},

		setShadow:function($id){
			var self = this
			self.get('_back').attr({'class':'back','filter':'url(#' + $id + ')'})
		},

		moveRowTxt:function($o) {
			var self = this
			var is = $o.is ? $o.is : 0
			var index = $o.index ? $o.index : 0
			var mode = $o.mode ? $o.mode : 1
			var rowFonts = self.get('_fonts').getDynamic('childs')[index]

			if (rowFonts) {
				if (mode == 1) {
					var x = is ? -2 : 0
					rowFonts.transformX(x)	
				}else if(mode == 2){
					var childs = rowFonts.getDynamic('childs')
					for(var a = 0, al = childs.length; a < al; a++){
						var child = childs[a]
						var fill = is ? $o.fill : child.getDynamic('info').init.fill
						child.set('fill',fill)
					}
				}
			}
		},

		_widget:function(){
			var self = this
			self.set('_g', new SVGElement('g')), self.get('_g').set('class','g')
			self.get('element').appendChild(self.get('_g').element)

			self.set('_back', new SVGElement('rect'))//, self.get('_back').attr({'id':'J_back','filter':'url(#' + self.get('shadow_id') + ')'})
			self.get('_g').appendChild(self.get('_back').element)

			self.set('_fonts', new SVGElement('g')), self.get('_fonts').set('class','fonts')
			self.get('_g').appendChild(self.get('_fonts').element)
		},
		_layout:function(){
			var self = this
			var _lay = self.get('_lay')
			_lay.maxHorH = [], _lay.maxVerW = [], _lay.maxVerAllW = []

			self.get('_fonts').setDynamic('childs',[])

			self.set('_hor_count', self.get('data').length)
			if(self.get('data')[0]){
				self.set('_ver_count', self.get('data')[0].length)
			}

			for(var a = 0, al = self.get('data').length; a < al; a++){
				//一行中最高的值
				var maxHorH = 0
				var maxSignW = 0 
				//一行文字     
				var rowFonts = new SVGElement('g')
				rowFonts.setDynamic('childs',[])
				self.get('_fonts').element.appendChild(rowFonts.element)
				self.get('_fonts').getDynamic('childs').push(rowFonts)

				for(var b = 0, bl = self.get('data')[a].length; b < bl ; b++){
					var o = self.get('data')[a][b]
					var bold = o.bold || Number(o.bold) == 0 ? Number(o.bold) : 1
					var fill = o.fill ? o.fill : self.get('base_fill')
					var family = o.family ? o.family : self.get('_font_family')
					//单个文字
					var font = SVGGraphics.text({'content':Global.numAddSymbol(o.content),'size':o.size,'fill':fill,'bold':bold,'family':family})
					font.setDynamic('info',{init:{fill:fill}})
					rowFonts.element.appendChild(font.element)
					rowFonts.getDynamic('childs').push(font)

					maxHorH = maxHorH < font.getHeight() ? font.getHeight() : maxHorH
					
					if(!_lay.maxVerW[b]){
						_lay.maxVerW[b] = 0
						_lay.maxVerAllW[b] = 0
					}
					if(_lay.maxVerW[b] < font.getWidth()){
						_lay.maxVerW[b] = font.getWidth()
						_lay.maxVerAllW[b] = _lay.maxVerW[b]
					}
					
					if (o.sign && o.sign.has) {
						var radius = o.sign.radius ? o.sign.radius : 4
						var disX = o.sign.disX ? o.sign.disX : 4
						_lay.maxVerAllW[b] = Number(_lay.maxVerW[b]) + Number(radius) + Number(disX)
					}
				}
				_lay.maxHorH.push(maxHorH)	
			}
			for (var c = 0, cl = self.get('data').length; c < cl; c++ ) {
				var rowFonts = self.get('_fonts').getDynamic('childs')[c]
				for (var d = 0, dl = self.get('data')[c].length; d < dl; d++ ) {
					var o = self.get('data')[c][d]
					var font = rowFonts.getDynamic('childs')[d]

					var x = Global.getArrMergerNumber(_lay.maxVerAllW, 0, d - 1) + d * self.get('ver_dis')
					var y = c > 0 ? Global.getArrMergerNumber(_lay.maxHorH, 0, c - 1) + c * self.get('hor_dis') : 0
					rowFonts.transformY(y)
					y = 0

					var initX = x 
					var initY = y

					var ver_align = o.ver_align ? o.ver_align : 2
					var hor_align = o.hor_align ? o.hor_align : 2
					if (ver_align == 2) {
						x = x + (_lay.maxVerW[d] - font.getWidth())/2
					}else if (ver_align == 3) {
						x = x + _lay.maxVerW[d] - font.getWidth()
					}
					if (hor_align == 2) {
						y = y + (_lay.maxHorH[c] - font.getHeight())/2
					}else if (hor_align == 3) {
						y = y + _lay.maxHorH[c] - font.getHeight()
					}
					if (o.sign) {
						var radius = o.sign.radius ? o.sign.radius : 4
						var disX = o.sign.disX ? o.sign.disX : 4
						var fill = o.sign.fill ? o.sign.fill : '#000000'
						//当圆与文字坐标都为0时的视觉差
						var dis = 2
						if (o.sign.has && o.sign.trim) {
							var sign = SVGGraphics.circle({'r':radius,'fill':fill})
							rowFonts.element.appendChild(sign.element)
							sign.transformXY(parseInt(radius), parseInt(font.getHeight()/2))
							
							x = Number(sign.get('_x')) + Number(radius / 2 + disX)
						}
						if (!o.sign.has && o.sign.trim) {
							//x = dis + radius + disX
						}
					}
					y = y + font.getHeight() * 0.75
					x = Global.ceil(x), y = Global.ceil(y)
					font.transformXY(x,y)
				}
			}

			var w,h
			var ver_dis = (self.get('_ver_count') - 1) * self.get('ver_dis')
			var hor_dis = (self.get('_hor_count') - 1) * self.get('hor_dis')
			if(self.get('isBack')){
				self.get('_fonts').transformXY(self.get('_disX'),self.get('_disY'))
				w = Global.getArrMergerNumber(_lay.maxVerAllW) + self.get('_disX') * 2 + ver_dis
				h = Global.getArrMergerNumber(_lay.maxHorH) + self.get('_disY') * 2 + hor_dis
			}else{
				w = Global.getArrMergerNumber(_lay.maxVerAllW) + ver_dis
				h = Global.getArrMergerNumber(_lay.maxHorH) + hor_dis
			}

			if(self.get('isBack')){
				self.get('_back').attr({'_w':w,'_h':h,'width':w,'height':h,'fill':'#ffffff','opacity':1,'rx':4,'rx':4,'stroke':self.get('base_fill') ? self.get('base_fill') : '#000000','stroke-width':2})
			}
			self.set('w', w), self.set('h', h)

			var x = Global.ceil(-w/2), y = Global.ceil(-h/2)
			self.get('_g').transformXY(x,y)
		},

		_overHandler:function($evt){
			var self = this
			self.get('element').fire(EventType.OVER)
		},
		_outHandler:function($evt){
			var self = this
			self.get('element').fire(EventType.OUT)
		}
	});

	return Info;

	}, {
	    requires:['base','node','../../utils/global','../../utils/svgelement','../svggraphics','../../models/eventtype']
	}
);
KISSY.add('brix/gallery/charts/js/pub/views/infos/infos',function(S,Base,node,Global,Move,SVGElement,SVGRenderer,SVGGraphics,EventType,Info,Light,HInfo,HLine,Other,Arrow){
	
	function Infos(){
		
		var self = this

		Infos.superclass.constructor.apply(self,arguments);

		this._move = null;
	}

	Infos.ATTRS = {
		w:{
			value:100
		},
		h:{
			value:100
		},
		element:{
			value:null
		},
		dis_info:{
			value:8
		},
		info:{
			value:{
				x:0,                     //x坐标               
				y:0,                     //y坐标
				data:[],                 //Info.data
				base_fill:'#000000',     //Info.base_fill
				ver_dis:0,
				isBack:1
			}
		},
		light:{
			value:{
				is:0,                    //是否有
				x:0,                     //x坐标
				y:0,                     //y坐标
				min_radius:4,
				fill:'#000000',          //小圆填充
				max_radius:7,            
				max_fill_opacity:1,      //大圆填充透明度  
				max_thickness:2,
				max_thickness_opacity:1
			}
		},
		other:{
			value:{
				is:0,                    //是否有 
				os:[],                   //数组中有几个就几个
				config:{}                //圆的配置
			}
		},
		hInfo:{
			value:{
				is:1,                    //是否有
				x:0,                     //x坐标
				y:0,                     //y坐标
				y1:6,                    //当没有hLine时 默认的Y坐标
				content:''               //HInfo.content
			}
		},
		hLine:{
			value:{
				is:1,                    //是否有 
				x:0,                     //x坐标
				y:0,                     //y坐标
				y1:0,
				h:6
			}
		},
		arrow:{
			value:{
				is:0,
				mode:1,                  //模式(1 = 左上 | 2 = 右上 | 3 = 右下 | 4 = 左下)
				x:0,
				y:0,
			}
		},

		_is_new_shadow:{
			value:0
		},
		_shadow_id:{
			value:'shadow'
		},
		_move:{
			value:null
		},

		_info:{
			value:null          
		},
		_light:{
			value:null          
		},
		_other:{
			value:null
		},
		_hInfo:{ 
			value:null            
		},
		_hLine:{ 
			value:null            
		},
		_arrow:{
			value:null
		}
	}

	S.extend(Infos,Base,{
		init:function(){
			var self = this
			Infos.superclass.constructor.apply(self,arguments);
			
			self.set('element', new SVGElement('g')), self.get('element').set('class','infos')
			self.get('parent').appendChild(self.get('element').element)

			self.get('element').element.addEventListener("mouseover",function(evt){ self._overHandler(evt)}, false);
			self.get('element').element.addEventListener("mouseout",function(evt){ self._outHandler(evt)}, false);
		},
		remove:function(){
			var self = this
			if(self.get('_arrow')){
				self.get('element').removeChild(self.get('_arrow').get('element').element)
				self.set('_arrow', null)
			}
			if(self.get('_hLine')){
				self.get('element').removeChild(self.get('_hLine').get('element').element)
				self.set('_hLine', null)
			}
			if(self.get('_hInfo')){
				self.get('element').removeChild(self.get('_hInfo').get('element').element)
				self.set('_hInfo', null)
			}
			if(self.get('_other')){
				self.get('element').removeChild(self.get('_other').get('element').element)
				self.set('_other', null)
			}
			if(self.get('_light')){
				self.get('element').removeChild(self.get('_light').get('element').element)
				self.set('_light', null)
			}
			if(self.get('_info')){
				self.get('element').removeChild(self.get('_info').get('element').element)
				self.set('_info', null)
			}
		},
		
		move:function(){
			var self = this
			Infos.superclass.constructor.apply(self,arguments);
			var x = 0, y = 0
			if(self.get('_info')){
				x = Number(self.get('_info').get('element').get('_x'))
				y = Number(self.get('_info').get('element').get('_y'))
			}
			if(x == 0 && y == 0){
			   x = Number(self.get('info').x) - 17
			   y = Number(self.get('info').y)
			}
			self.update()

			var x2 = Number(self.get('_info').get('element').get('_x'))
			var y2 = Number(self.get('_info').get('element').get('_y'))

			if(this._move){
				this._move.stop()
				this._move = null
			}
			this._move = new Move({x:x,y:y},{x:x2,y:y2},0.3,function($o){
				if(!self.get('_info')){
					return		
				}
				self.get('_info').get('element').transformXY($o.x,$o.y)
				//arrow
				if(self.get('arrow').is){
					var info = self._getArrowInfo()
					var o = {
						parent : self.get('element'),
						data   : info.lines,
						shadow_id : self.get('_shadow_id')
					}
					self.get('_arrow').update(o)
					var x = self.get('_info').get('element').get('_x'), y = self.get('_info').get('element').get('_y')
					self.get('_arrow').get('element').transformXY(x,y)
				}
			},function(){'a'})
		},

		update:function(){
			var self = this
			Infos.superclass.constructor.apply(self,arguments);

			if(self.get('_is_new_shadow') == 0){
				self._shadow()
				if(self.get('arrow').is){
					self._shadow({'dx':-2, 'id':'shadow2'})
				}
				self.set('_is_new_shadow',1)
			}

			self.remove()
			self._widget()
			self._layout()
		},
		_getArrowInfo:function(){
			var self = this
			var arrow = self.get('arrow')
			var angle = 45
			var x = self.get('_info').get('element').get('_x')
			var y = self.get('_info').get('element').get('_y')
			var w = self.get('_info').get('w')
			var h = self.get('_info').get('h')
			var dis = arrow.dis ? arrow.dis : 4
			if (arrow.x < x && arrow.y < y) {
				arrow.mode = 1
			}else if(arrow.x > x && arrow.y < y){
				arrow.mode = 2
			}else if(arrow.x > x && arrow.y > y){
				arrow.mode = 3
			}else if(arrow.x < x && arrow.y > y){
				arrow.mode = 4
			}
			var arr = []
			if(arrow.mode == 1 || arrow.mode == 3){
				self.set('_shadow_id','shadow')
				var o = {}
				o.x = w / 2, o.y = -h / 2 + dis
				arr.push(o)
				var o = {}
				o.x = arrow.x - x, o.y = arrow.y - y
				arr.push(o)
				var o = {}
				o.x = -w / 2 + dis, o.y = h / 2
				arr.push(o)
			}else if(arrow.mode == 2 || arrow.mode == 4){
				self.set('_shadow_id','shadow2')
				angle = 135
				var o = {}
				o.x = w / 2 - dis, o.y = h / 2 
				arr.push(o)
				var o = {}
				o.x = arrow.x - x, o.y = arrow.y - y
				arr.push(o)
				var o = {}
				o.x = -w / 2, o.y = -h / 2 + dis
				arr.push(o)
			}
			return {'lines':arr, 'angle':angle}
		},
		_widget:function(){
			var self = this
			if(self.get('arrow').is){
				self.set('_arrow', new Arrow())
			}
			if(self.get('hLine').is){
				self.set('_hLine', new HLine())
			}
			if(self.get('hInfo').is){
				self.set('_hInfo', new HInfo())
			}
			if(self.get('other').is){
				self.set('_other', new Other())
			}
			if(self.get('light').is){
				self.set('_light', new Light())
			}
			self.set('_info', new Info())
		},
		_layout:function(){
			var self = this

			//arrow
			if(self.get('arrow').is){
				var o = {
					parent : self.get('element'),
				}
				self.get('_arrow').add(o)
			}

			//hline
			if(self.get('hLine').is){
				var o = {
					parent : self.get('element'),
				}
				if(self.get('hLine').y1){
					o.y1 = self.get('hLine').y1
				}
				if(self.get('hLine').h){
					o.h = self.get('hLine').h
				}
				self.get('_hLine').init(o)
			    var x = self.get('hLine').x, y = self.get('hLine').y
			    self.get('_hLine').get('element').transformXY(x,y)
			}

		    //hinfo
		    if(self.get('hInfo').is){
				var o ={
					parent : self.get('element'),
			    	content: self.get('hInfo').content
			    }
			    self.get('_hInfo').init(o)

			    var y1 = self.get('_hLine') ? self.get('_hLine').get('h') : self.get('hInfo').y1
			    var x = self.get('hInfo').x, y = Number(self.get('hInfo').y) + Number(self.get('_hInfo').get('h') / 2) + y1
			   	var p = self._allShow(self.get('w'), self.get('h'), {w:self.get('_hInfo').get('w'),h:self.get('_hInfo').get('h')}, {x:x,y:y})
			    x = p.x, y = p.y
			    self.get('_hInfo').get('element').transformXY(x,y)
			}
		    //other
		    if(self.get('_other')){
		    	var o = {
					parent : self.get('element'),
			    	os     : self.get('other').os,
			    	config : self.get('other').config
			    }
			    self.get('_other').init(o)
		    }

			//light
			if(self.get('_light')){
		    	var o = {
		    		parent : self.get('element'),
		    		fill   : self.get('light').fill,
		    	}
		    	if(self.get('light').min_radius){
		    		o.min_radius = self.get('light').min_radius
		    	}
		    	if(self.get('light').max_radius){
		    		o.max_radius = self.get('light').max_radius
		    	}
				if(String(self.get('light').max_fill_opacity)){
					if(self.get('light').max_fill_opacity == 0) self.get('light').max_fill_opacity = Global.N00001;
					o.max_fill_opacity = self.get('light').max_fill_opacity
		    	}
		    	//防止undefined
		    	if(self.get('light').max_thickness){
		    		o.max_thickness = self.get('light').max_thickness
		    	}
		    	if(String(self.get('light').max_thickness_opacity)){
		    		o.max_thickness_opacity = self.get('light').max_thickness_opacity
		    	}
		    	
			    self.get('_light').init(o)
			    // self.get('_light').get('element').on(EventType.OVER,function($o){self._overHandler({child:'light'})})
				// self.get('_light').get('element').on(EventType.OUT,function($o){self._outHandler({child:'light'})})
			    var x = self.get('light').x, y = self.get('light').y
			    self.get('_light').get('element').transformXY(x,y)
		    }

			//info
			var o = {
				data   : self.get('info').data,
				parent : self.get('element'),
				base_fill   : self.get('info').base_fill,
				shadow_id   : self.get('_shadow_id'),
			}
			if(self.get('info').ver_dis){
				o.ver_dis = self.get('info').ver_dis
			}
			if(self.get('info').isBack == 0){
				o.isBack = 0
			}
		    self.get('_info').init(o)
		    // self.get('_info').get('element').on(EventType.OVER,function($o){self._overHandler({child:'info'})})
			// self.get('_info').get('element').on(EventType.OUT,function($o){self._outHandler({child:'info'})})

		    var x = self.get('info').x, y = Number(self.get('info').y) - Number(self.get('dis_info')) - Number(self.get('_info').get('h') / 2)
		    if(self.get('arrow').is){
		 	   y = Number(self.get('info').y)
			}
		    if(self.get('_light')){
		    	y -= Number(self.get('_light').get('max_radius'))
		    }
		  	var p = self._allShow(self.get('w'), self.get('h'), {w:self.get('_info').get('w'),h:self.get('_info').get('h')}, {x:x,y:y})
		   	x = p.x, y = p.y
		    if(self.get('_light')){
		    	if (Number(y) + Number(self.get('_info').get('h') / 2) + Number(self.get('dis_info')) + Number(self.get('_light').get('max_radius')) > Number(self.get('_light').get('element').get('_y')) + 0.00001) {
			
					y = Number(self.get('light').y) + Number(self.get('_light').get('max_radius')) + Number(self.get('dis_info')) + Number(self.get('_info').get('h') / 2)
				}
		    }else{
		    	// if (Number(self.get('_info').get('element').get('_y')) + Number(self.get('_info').get('h') / 2) + Number(self.get('dis_info')) + Number(self.get('_light').get('max_radius')) > self.get('_light').get('element').get('_y')) {
		    	// }
		    }
		    self.get('_info').get('element').transformXY(x,y)

		   	//arrow
			if(self.get('arrow').is){
				var info = self._getArrowInfo()
				var o = {
					parent : self.get('element'),
					data   : info.lines,
					shadow_id : self.get('_shadow_id')
				}
				self.get('_arrow').init(o)
				var x = self.get('_info').get('element').get('_x'), y = self.get('_info').get('element').get('_y')
				self.get('_arrow').get('element').transformXY(x,y)
			}

			//info
			self.get('_info').setShadow(self.get('_shadow_id'))
		},

		//全显
		_allShow:function($w,$h,$i,$p,$dis){
			var dis = $dis ? $dis : 4
			var w = $w, h = $h
			var x = $p.x , y = $p.y
			if ($p.x - $i.w / 2 < dis) { x = $i.w / 2 + dis}
			if ($p.x + $i.w / 2 > w - dis) { x = w - $i.w / 2 - dis }
			if ($p.y - $i.h / 2 < dis) { y = $i.h / 2 + dis}
			if ($p.y + $i.h / 2 > h - dis) { y = h - $i.h / 2 - dis }
			return {x:x, y:y}
		},

		_shadow:function($o){
			var self = this

			var dx = 2
			var dy = 2
			var id = 'shadow'

			if($o){
				dx = $o.dx ? $o.dx : dx
			 	dy = $o.dy ? $o.dy : dy
			 	id = $o.id ? $o.id : id
			}

			var defs = new SVGElement('defs')
			self.get('element').appendChild(defs.element)

			var filter = new SVGElement('filter')
			filter.attr({'id':id,'filterUnits':'objectBoundingBox','x':'-10%','y':'-10%','width':'150%','height':'150%'})
			defs.appendChild(filter.element)

			var feGaussianBlur = new SVGElement('feGaussianBlur')
			feGaussianBlur.attr({'in':'SourceAlpha','stdDeviation':1,'result':'blurredAlpha'})
			filter.appendChild(feGaussianBlur.element)

			var feOffset = new SVGElement('feOffset')
			feOffset.attr({'in':'blurredAlpha','dx':dx,'dy':dy,'result':'offsetBlurredAlpha'})
			filter.appendChild(feOffset.element)

			var feFlood = new SVGElement('feFlood')
			feFlood.attr({'style':'flood-color:#000000;flood-opacity:0.15','result':'flooded'})
			filter.appendChild(feFlood.element)

			var feComposite = new SVGElement('feComposite')
			feComposite.attr({'in':'flooded','operator':"in",'in2':'offsetBlurredAlpha','result':'coloredShadow'})
			filter.appendChild(feComposite.element)

			var feComposite = new SVGElement('feComposite')
			feComposite.attr({'in':'SourceGraphic','in2':'coloredShadow','operator':'over'})
			filter.appendChild(feComposite.element)
		},

		_overHandler:function($o){
			var self = this
			self.get('element').fire(EventType.OVER,$o)
		},
		_outHandler:function($o){
			var self = this
			self.get('element').fire(EventType.OUT,$o)
		},
	});

	return Infos;

	}, {
	    requires:['base','node','../../utils/global','../../utils/move','../../utils/svgelement','../../utils/svgrenderer','../svggraphics','../../models/eventtype','./info','./light','./hinfo','./hline','./other','./arrow']
	}
);
KISSY.add('brix/gallery/charts/js/pub/views/infos/light',function(S,Base,node,Global,SVGElement,SVGGraphics,EventType){
	
	function Light(){
		
		var self = this

		Light.superclass.constructor.apply(self,arguments);
	}

	Light.ATTRS = {
		element:{
			value:null
		},
		min_radius:{
			value:4
		},
		fill:{                        //小圆填充
			value:'#555555'
		},
		max_radius:{
			value:7
		},
		max_fill_opacity:{            //大圆填充透明度
			value:1
		},
		max_thickness:{               //大圆边框粗细
			value:2
		},
		max_thickness_opacity:{       //大圆边框透明度
			value:1
		},

		_max:{
			value:null    
		},
		_min:{
			value:null
		}
	}

	S.extend(Light,Base,{
		init:function(){
			var self = this
			Light.superclass.constructor.apply(self,arguments);
			self.set('element', new SVGElement('g')), self.get('element').set('class','light')
			self.get('parent').appendChild(self.get('element').element)
			self.get('element').element.addEventListener("mouseover",function(evt){ self._overHandler(evt)}, false);
			self.get('element').element.addEventListener("mouseout",function(evt){ self._outHandler(evt)}, false);

			self._widget()
		},
		
		_widget:function(){
			var self = this
			self.set('_max', SVGGraphics.circle({'r':self.get('max_radius'),'fill':'#ffffff','fill_opacity':self.get('max_fill_opacity'),'stroke':self.get('fill'),'stroke_opacity':self.get('max_thickness_opacity'),'stroke_width':self.get('max_thickness')}))
			self.get('element').appendChild(self.get('_max').element)

			self.set('_min', SVGGraphics.circle({'r':self.get('min_radius'),'fill':self.get('fill'),'stroke':'none'}))
			self.get('element').appendChild(self.get('_min').element)
		},

		_overHandler:function($evt){
			var self = this
			self.get('element').fire(EventType.OVER)
		},
		_outHandler:function($evt){
			var self = this
			self.get('element').fire(EventType.OUT)
		}
	});

	return Light;

	}, {
	    requires:['base','node','../../utils/global','../../utils/svgelement','../svggraphics','../../models/eventtype']
	}
);
KISSY.add('brix/gallery/charts/js/pub/views/infos/other',function(S,Base,node,Global,SVGElement,SVGGraphics,Light){
	
	function Other(){
		
		var self = this

		Other.superclass.constructor.apply(self,arguments);
	}

	Other.ATTRS = {
		element:{
			value:null
		},
		os:{
			value:[]
		}
	}

	S.extend(Other,Base,{
		init:function(){
			var self = this
			Other.superclass.constructor.apply(self,arguments);
			
			self.set('element', new SVGElement('g')), self.get('element').set('class','other')
			self.get('parent').appendChild(self.get('element').element)

			self._widget()
		},
		
		_widget:function(){

			var self = this
			var config = self.get('config')
			for(var a = 0, al = self.get('os').length; a < al; a++){
				var $o = self.get('os')[a]
				if($o){
					var light = new Light()
			    	var o = {
			    		parent : self.get('element'),
			    		fill   : $o.fill_over,
			    	}

			    	if(config){
			    		o.min_radius = config.min_radius,
						o.max_radius = config.max_radius,
						o.max_fill_opacity = config.max_fill_opacity,
						o.max_thickness = config.max_thickness,
						o.max_thickness_opacity = config.max_thickness_opacity
			    	}

				 	light.init(o)
				    var x = $o.x, y = $o.y
				    light.get('element').transformXY(x,y)
			    }
			}
		}
	});

	return Other;

	}, {
	    requires:['base','node','../../utils/global','../../utils/svgelement','../svggraphics','./light']
	}
);
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
KISSY.add('brix/gallery/charts/js/pub/views/layouts/style1/main',function(S,Base,Node,Global,SVGElement,SVGGraphics,PieInfo){
	var $ = Node.all

	function Main(){
		
		var self = this

		/*
			arguments:

			  o:{
				parent    :''     //SVGElement
				w         :100    //宽
				h         :100    //高
				config    :{}     //配置
			  }

		 */
		Main.superclass.constructor.apply(self,arguments);

		// self.init()
	}

	Main.ATTRS = {
		w:{
			value:0
		},
		h:{
			value:0
		},
		data:{
			value:[]
		},
		element:{
			value:null
		},
		txtStartIndex:{
			value:0
		},

		font:{
			value:{
				family:'微软雅黑',
				fill:'#ADADAD',
				size:12
			}
		},

		infos:{                         //右上角信息
			value:null
		},
		x_txt:{                         //横轴文本
			value:null
		},
		y_txt:{                         //纵轴文本
			value:null
		}
	}

	S.extend(Main,Base,{
		init:function(){
			var self = this
			Main.superclass.constructor.apply(self,arguments);

			self.set('element', new SVGElement('g')), self.get('element').set('class','layouts_style1')
			// self.get('element').set('style','cursor:default'), self.get('element').mouseEvent(false)
			self.get('parent').appendChild(self.get('element').element)

			self._widget()
		},

		_widget:function(){
			var self = this
			var element = self.get('element')
			var font = self.get('font')

			self._createInfos()

			var txt = SVGGraphics.text({'family':font.family,'fill':font.fill,'content':self.get('config').xAxis.name})
			self.set('x_txt',new SVGElement('g')), self.get('x_txt').set('class','x_txt')
			self.get('x_txt').appendChild(txt.element)
			element.appendChild(self.get('x_txt').element)
			txt.transformXY(0,txt.getHeight())

			var txt = SVGGraphics.text({'family':font.family,'fill':font.fill,'content':self.get('config').yAxis.name})
			self.set('y_txt',new SVGElement('g')), self.get('y_txt').set('class','y_txt')
			self.get('y_txt').appendChild(txt.element)
			element.appendChild(self.get('y_txt').element)
			txt.transformXY(0,txt.getHeight())
		},

		_createInfos:function(){
			var self = this
			var data = self.get('data')

			// data[0] = {pie: { data:[300, 100], fills:['#ff0000', '#ffff00'] }, info:[]}
			// data[0].info = test()
			// data[1] = {pie: { data:[100, 300], fills:['#135ebf', '#78a64b'] }, info:[]}
			// data[1].info = test()
			
			// function test(){
			// 	var data
			// 	var o = {}
			// 	o.content = '2012-12-21', o.bold = 1, o.fill = '#333333', o.size = 12, o.ver_align = 1
			// 	data = []
			// 	data[0] = []
			// 	data[0].push(o)
				
			// 	o = {}
			// 	o.content = '智能优化40%', o.bold = 0, o.fill = '#135ebf', o.sign = {has:1,trim:1,fill:'#135ebf' }
			// 	data[1] = []
			// 	data[1].push(o)
				
			// 	o = {}
			// 	o.content = '品牌展位60%', o.bold = 0, o.fill = '#78a64b', o.sign = {has:1,trim:1,fill:'#78a64b' }
			// 	data[2] = []
			// 	data[2].push(o)
			// 	return data
			// }

			if(data.length == 0){
				return
			}

			self.set('infos', new SVGElement('g')), self.get('infos').set('class','infos')
			self.get('element').appendChild(self.get('infos').element)

			var pieInfos = []
			for (var a = 0, al = data.length; a < al; a++ ) { 
				var o = data[a]
				var pieInfo = new PieInfo()
				pieInfo.init({data:o, parent:self.get('infos'),txtStartIndex:self.get('txtStartIndex')})
				pieInfos.push(pieInfo)

				var pre
				if (a >= 1) {
					pre = pieInfos[a-1]
				}
				if (pre) {
					var x = pieInfo.get('element').get('_x') ? pieInfo.get('element').get('_x') : 0
					pieInfo.get('element').transformX(Number(x) + Number(pre.get('w')) + 20)
					var w = Number(x) + Number(pre.get('w')) + Number(20)
				}
			}

			var last = pieInfos[a - 1]
			var w = Number(last.get('element').get('_x')) + Number(last.get('w'))
			self.get('infos').setDynamic('w',w)
		}
	});

	return Main;

	}, {
	    requires:['base','node','../../../utils/global','../../../utils/svgelement','../../../views/svggraphics','../../../views/modules/pieinfo/main'
	    ]
	}
);
KISSY.add('brix/gallery/charts/js/pub/views/line/core',function(S,Base,Node,Global,DataSection,SVGElement,Vertical,Horizontal,Back,GlobalInduce,EventType,Graphs){
	var $ = Node.all

	function Core(){
		
		var self = this

		/*
			arguments:

			  o:{
				parent    :''     //SVGElement
				w         :100    //宽
				h         :100    //高
				DataSource:{}     //数据源
				config    :{}     //配置
			  }

		 */
		Core.superclass.constructor.apply(self,arguments);

		self.init()
	}

	Core.ATTRS = {
		gx:{                            //全局坐标 应用于graphs鼠标感应计算
			value:0
		},
		gy:{
			value:0
		},
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
					names:[],                //名称集合[维度1---1：,,维度1---3：]
					org:[],                  //原始二维数据[[配置数据中每个队列第一个集合],[],[]]
					section:[],              //分段之后数据[200, 400, 600, 800, 1000, 1200, 1400, 1600]
					data:[]                  //转换坐标后的数据  =>Vertical.data、Back.data_hor
				},
				horizontal:{             //横轴
					name:'',                 //名称[维度2]
					names:[],                //名称集合(1:00,2:00,...,24:00)
					org:'',                  //原始数据[0.05,0.1,0.15,0.2,...,2.55]
					data:[]                  //转换坐标后的数据  =>Horizontal.data
				},
				graphs:{                 //图形
					disX:59,                 //每两个点之间的距离
					data:[]                  //转换坐标后的数据
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
		_globalInduce:{
			value:null                   //全局感应区
		},
		_induces:{
			value:null                   //感应区
		},

		_disX:{
			value:6                      //左、右的距离
		},
		_disY:{
			value:10                     //上、下的距离
		},
		_dis_line:{
			value:6                      //纵向最高的线与最高高度最小相差的像素 而横向最右边的小线与最宽宽度也是最小相差该像素
		},
		_dis_graphs:{
			value:0                      //在图形中 由于考虑到圆本身的半径实际图形中的左、下都必须预留的像素差右、上预留的像素差的最小值也是此值
		},

		_verticalMaxH:{
			value:0                      //纵向最大的高
		},
		_verticalGraphsH:{
			value:0                      //最上面的第一条线到原点之间的高度
		},
		_verticalDrawH:{
			value:0                      //图形区域由于考虑到圆的半径 因此圆必须高出最下面_dis_graphs个像素 而此值代表最上面的第一条线到_dis_graphs之间的距离
		},
		_horizontalMaxW:{
			value:0                      //横向最大的宽
		},
		_horizontalGraphsW:{
			value:0                      //图形区域真正的宽(最右边的第一条线到原点之间的高度)
		},
		_horizontalDrawW:{
			value:0                      //图形区域由于考虑到圆的半径 因此圆必须高出最右边_dis_graphs个像素
		},
		_del:{
			value:0                      //当数据量过大时 减去的数据个数
		},
	}

	S.extend(Core,Base,{
		init:function(){
			var self = this
			self.set('element', new SVGElement('g')), self.get('element').set('class','core')
			self.get('parent').appendChild(self.get('element').element)
		},

		widget:function(){
			var self = this

			Graphs.superclass.constructor.apply(self,arguments);
			
			self._widget()
		},

		getAttr:function($name){
			var self = this
			return self.get('_' + $name)
		},

		_widget:function(){
			var self = this
			self._trimConfig()
			self.set('_DataFrameFormat',self.DataExtend(self.get('_DataFrameFormat'),self.get('DataSource')))
			self.get('_DataFrameFormat').key.data = String(self.get('_DataFrameFormat').key.indexs).split(',')
			self.get('_DataFrameFormat').vertical.dataObject = self._trimVerticalOrgData(self.get('_DataFrameFormat').vertical.org)

			var arr = self.get('_DataFrameFormat').vertical.dataObject.section
			self.get('_DataFrameFormat').vertical.section = DataSection.section(arr, null, {mode:1})
			if(arr.length == 1){
				self.get('_DataFrameFormat').vertical.section[0] = arr[0] * 2
			}

			self.set('_vertical',new Vertical())
			self.set('_horizontal',new Horizontal())
			self.set('_back',new Back())
			self.set('_graphs',new Graphs())
			self.set('_globalInduce', new GlobalInduce())
			self.set('_induces',new Graphs())
			
			self._trimVertical()
			var o = {
				parent : self.get('element'),
				data   : self.get('_DataFrameFormat').vertical.data
			}
			self.get('_vertical').init(o)
			self.get('_vertical').get('element').transformXY(self.get('_disX'), self.get('h') - self.get('_horizontal').get('h') - self.get('_disY'))
			// return
			self._trimHorizontal()
			var o = {
				w      : self.get('_horizontalMaxW'),
				parent : self.get('element'),
				data   : self.get('_DataFrameFormat').horizontal.data,
				dis_left : self.get('_disX') + self.get('_vertical').get('w') - self.get('_disX')
			}
			self.get('_horizontal').init(o)
			self.get('_horizontal').get('element').transformXY(self.get('_disX') + self.get('_vertical').get('w'), self.get('h') -  self.get('_horizontal').get('h') - self.get('_disY'))

			self._trimGraphs()
			var o = {
				w      : self.get('_horizontalMaxW'),
				h      : self.get('_verticalMaxH'),
				parent : self.get('element'),
				data_hor : self.get('_DataFrameFormat').vertical.data,
				data_ver : self.get('_horizontal').getShowData(),
				h_ver    : self.get('_verticalGraphsH'),
			}
			self.get('_back').init(o)
			self.get('_back').get('element').transformXY(self.get('_disX') + self.get('_vertical').get('w'), self.get('h') -  self.get('_horizontal').get('h') - self.get('_disY'))

			var o = {
				x     : self.get('_disX') + self.get('_vertical').get('w') + Global.N05,
				y     : self.get('h') -  self.get('_horizontal').get('h') - self.get('_disY') + Global.N05,
				w     : self.get('_horizontalGraphsW'),
				h     : self.get('_verticalGraphsH'),
				parent: self.get('element'),
				data  : self.get('_DataFrameFormat').graphs.data,
				disX  : self.get('_DataFrameFormat').graphs.disX,
				node  : self.get('config').node,
				area  : self.get('config').area,
				areaMode   : self.get('config').areaMode,
				area_opacity : self.get('config').area_opacity,
				isLine: self.get('config').isLine,
				shape : self.get('config').shape,
				fills : self.get('config').fillsObject.normals,
				fills_over : self.get('config').fillsObject.overs,
				circle: self.get('config').circle.normal
			}
			self.get('_graphs').init(o)
			self.get('_graphs').get('element').transformXY(self.get('_disX') + self.get('_vertical').get('w') + Global.N05, self.get('h') -  self.get('_horizontal').get('h') - self.get('_disY') + Global.N05)

			var o = {
				w     : self.get('w'),
				h     : self.get('h'),
				parent: self.get('element'),
				opacity : Global.N00001
			}
			self.get('_globalInduce').init(o)

			if(self.get('_DataFrameFormat').horizontal.org.length == 0){
				return
			}
			var o = {
				gx    : self.get('gx'),            
				gy    : self.get('gy'),   
				x     : self.get('_disX') + self.get('_vertical').get('w') + Global.N05,
				y     : self.get('h') -  self.get('_horizontal').get('h') - self.get('_disY') + Global.N05,
				w     : self.get('_horizontalMaxW'),
				h     : self.get('_verticalGraphsH'),
				parent: self.get('element'),
				id    : 'induces',
				data  : self.get('_DataFrameFormat').graphs.data,
				isInduce   : 1,
				disX  : self.get('_DataFrameFormat').graphs.disX,
				fills : self.get('config').fillsObject.normals,
				fills_over : self.get('config').fillsObject.overs,
			}
			self.get('_induces').init(o)
			self.get('_induces').get('element').on(EventType.OVER,function($o){self._overHandler($o)})
			self.get('_induces').get('element').on(EventType.OUT,function($o){self._outHandler($o)})
			self.get('_induces').get('element').transformXY(self.get('_disX') + self.get('_vertical').get('w') +Global.N05, self.get('h') -  self.get('_horizontal').get('h') - self.get('_disY') + Global.N05)

			self.get('element').fire(EventType.COMPLETE)
		},
		
		_trimConfig:function(){
			var self = this
			var normals = []
			var overs = []
			var config = self.get('config')
			for (var a = 0, al = config.fills[0].length; a < al; a++ ) {
				var o = config.fills[0][a]
				normals.push(o.normal)
				overs.push(o.over)
			}
			config.fillsObject = {}
			config.fillsObject.normals = normals
			config.fillsObject.overs = overs
		},

		//从data.vertical.org提取的对象 $arr = data.vertical.org
		//max = 直方叠加之后的数组 方便操作[[100+10,200+20,300+30],[]]
		//section = 用于计算纵轴section的数组[145,413,...,168,763,...,839]
		_trimVerticalOrgData:function($arr){
			var self = this
			var max = []
			var section = []
			var data = []          //二维数组
			var config = self.get('config')
			
			for (var a = 0, al = $arr.length; a < al; a++ ) {
				var o = $arr[a]
				
				var tmp = []
				for (var b = 0, bl = o.data.length; b < bl; b++ ) {
					var o1 = o.data[b]
					for (var c = 0, cl = o1.data.length; c < cl; c++ ) {
						!tmp[c] ? tmp[c] = 0 : ''
						tmp[c] += Number(o1.data[c])
					}
					section = section.concat(o1.data)
					data.push(o1.data)
				}
				max.push(tmp)
			}
			if (config.data.mode == 1) {
				tmp = []
				for (var d = 0, dl = data.length; d < dl; d++ ) {
					//倒序
					var di = data.length - 1 - d
					
					var newValuesArr = []
					for (var e = di, el = data.length; e < el; e++ ) {
						for (var f = 0, fl = data[e].length; f < fl; f++ ) {
							!newValuesArr[f] ? newValuesArr[f] = 0 : ''
							newValuesArr[f] = newValuesArr[f] + Number(data[e][f])
						}
					}
					tmp.unshift(newValuesArr)
				}
				section = tmp[0]
				data = tmp
			}
			return { max:max, section:section, data:data }
		},

		//换算纵向
		_trimVertical:function(){
			var self = this
			self.set('_verticalMaxH', self.get('h') - self.get('_disY') - self.get('_horizontal').get('h') - self.get('_disY'))
			self.set('_verticalGraphsH', self.get('_verticalMaxH') - self._getVerticalDisY())
			self.set('_verticalDrawH', self.get('_verticalGraphsH') - self.get('_dis_graphs'))
			var max = self.get('_DataFrameFormat').vertical.section[self.get('_DataFrameFormat').vertical.section.length - 1]
			var arr = self.get('_DataFrameFormat').vertical.section
			var tmpData = []
			for (var a = 0, al = arr.length; a < al; a++ ) {
				var y = -self.get('_dis_graphs') - arr[a] / max * self.get('_verticalDrawH')                                    
				y = isNaN(y) ? 0 : Global.ceil(y)                                                    
				tmpData[a] = { 'value':arr[a], 'y': y }
			}
			self.get('_DataFrameFormat').vertical.data = tmpData
		},
		//获取纵向总高到第一条线之间的距离
		_getVerticalDisY:function(){
			var self = this
			var disMin = self.get('_dis_line')
			var disMax = 2 * self.get('_dis_line')
			var dis = disMin
			dis = disMin + self.get('_verticalMaxH') % self.get('_DataFrameFormat').vertical.section.length   //Q3  DataFrameFormat.vertical.section.length
			dis = dis > disMax ? disMax : dis
			return dis
		},
		//换算横向
		_trimHorizontal:function(){
			var self = this
			self.set('_horizontalMaxW', self.get('w') - self.get('_disX') - self.get('_vertical').get('w') - self.get('_disX'))
			self.set('_horizontalGraphsW', self.get('_horizontalMaxW') - self._getHorizontalDisX())
			self.set('_horizontalDrawW', self.get('_horizontalGraphsW') - self.get('_dis_graphs'))
			var max = self.get('_DataFrameFormat').horizontal.org.length
			var arr = self.get('_DataFrameFormat').horizontal.org
			var tmpData = []
		    for (var a = 0, al  = arr.length; a < al; a++ ) {
				// tmpData.push( { 'value':arr[a], 'x':Global.ceil(self.get('_dis_graphs') + a / (max - 1) * self.get('_horizontalDrawW')) } )
				var o = { 'value':arr[a], 'x':Global.ceil(self.get('_dis_graphs') + a / (max - 1) * self.get('_horizontalDrawW')) }
				tmpData.push( o )
			}
			if(max == 1){
				o.x = Global.ceil(self.get('_horizontalDrawW') / 2)
			}
			self.get('_DataFrameFormat').horizontal.data = tmpData
		},
		//获取横向总宽到第一条线之间的距离
		_getHorizontalDisX:function(){
			var self = this
			var disMin = self.get('_dis_line')
			var disMax = 2 * self.get('_dis_line')
			var dis = disMin
			dis = disMin + self.get('_horizontalMaxW') % self.get('_DataFrameFormat').horizontal.org.length 
			dis = dis > disMax ? disMax : dis
			dis = isNaN(dis) ? 0 : dis
			return dis
		},
		//换算图形
		_trimGraphs:function(){   
			var self = this                                                           
			var maxVertical = self.get('_DataFrameFormat').vertical.section[self.get('_DataFrameFormat').vertical.section.length - 1]
			var maxHorizontal = self.get('_DataFrameFormat').horizontal.org.length
			var arr = self.get('_DataFrameFormat').vertical.dataObject.data
			var tmpData = []
			var no_nodes = self._getNoNodes()
			//处理不显示的节点
			for (var a = 0, al = arr.length; a < al; a++ ) {
				for (var b = 0, bl = arr[a].length ; b < bl; b++ ) {
					!tmpData[a] ? tmpData[a] = [] : ''
					var y = -self.get('_dis_graphs') - arr[a][b] / maxVertical * self.get('_verticalDrawH')
					y = isNaN(y) ? 0 : y
					tmpData[a][b] = {'value':arr[a][b], 'x':self.get('_dis_graphs') + b / (maxHorizontal - 1) * self.get('_horizontalDrawW'),'y':y}
					if(no_nodes[a] && no_nodes[a][b]){
						tmpData[a][b].no_node = 1
					}
				}
			}
			if(maxHorizontal == 1){
				if(tmpData[0] && tmpData[0][0]){
					tmpData[0][0].x = Global.ceil(self.get('_horizontalDrawW') / 2)
				}
			}
			self.get('_DataFrameFormat').graphs.data = tmpData
			self.get('_DataFrameFormat').graphs.disX = self._getGraphsDisX()
		},
		//每两个点之间的距离
		_getGraphsDisX:function(){
			var self = this
			return self.get('_horizontalGraphsW') / (self.get('_DataFrameFormat').horizontal.org.length - 1)
		},
		//过滤不显示的节点
		_getNoNodes:function(){
			var self = this
			var arr = []
			var nodes_mode = self.get('config').circle.mode
			var data = self.get('_DataFrameFormat').vertical.org
			if(nodes_mode == 0){
			}else if(nodes_mode == 1){
				for (var a = 0, al = data.length; a < al; a++ ) {
					!arr[a] ? arr[a] = [] : ''
					var value
					for (var b = 0, bl = data[a].length ; b < bl; b++ ) {
						if(value == data[a][b]){
							arr[a][b] = 1
						}
						value = data[a][b]
						if(data[a][b + 1]){   //如果有后一个点
							if(value != data[a][b + 1]){
								arr[a][b] = 0
							}
						}else{                //最后一个点
							arr[a][b] = 0
						}
					}
				}
			}
			self.get('_DataFrameFormat').vertical.no_nodes = arr
			return arr
		},

		_overHandler:function($o){
			var $o = S.clone($o)
			// $o.x = Number(this.get('gx')) +  Number(this.get('_graphs').get('element').get('_x')) + Number($o.x)
			// $o.y = Number(this.get('gy')) +  Number(this.get('_graphs').get('element').get('_y')) + Number($o.y)
			$o.x = Number(this.get('gx')) + Number($o.x)
			$o.y = Number(this.get('gy')) + Number($o.y)
			//底部xy
			$o.dx = Number(this.get('gx')) 
			$o.dy = Number(this.get('gy')) +  Number(this.get('_graphs').get('element').get('_y'))

			for(var a = 0, al = $o.other.length; a < al; a++){
				$o.other[a].x = Number(this.get('gx')) +  Number(this.get('_graphs').get('element').get('_x')) + Number($o.other[a].x)
				$o.other[a].y = Number(this.get('gy')) +  Number(this.get('_graphs').get('element').get('_y')) + Number($o.other[a].y)
			}

			this.get('_graphs').induce({index:$o.index,id:$o.id},true)
			this.get('element').fire(EventType.OVER,$o)
		},
		_outHandler:function($o){
			this.get('_graphs').induce({index:$o.index,id:$o.id},false)
			this.get('element').fire(EventType.OUT,$o)
		},

		/**
		 * 数据继承
		 * @type {Object}
		 */
		DataExtend:function(DataFrameFormat,DataSource){
			DataFrameFormat.key.indexs = DataSource.key.indexs
			DataFrameFormat.vertical.name = DataSource.vertical.name
			DataFrameFormat.vertical.names = DataSource.vertical.names
			DataFrameFormat.vertical.org = DataSource.vertical.data
			DataFrameFormat.vertical.no_nodes = DataSource.vertical.no_nodes
			DataFrameFormat.horizontal.name = DataSource.horizontal.name
			DataFrameFormat.horizontal.names = DataSource.horizontal.names
			DataFrameFormat.horizontal.org = DataSource.horizontal.data

			return DataFrameFormat
		}
	});

	return Core;

	}, {
	    requires:['base','node','../../utils/global','../../utils/datasection','../../utils/svgelement',
	    		  '../../views/vertical','../../views/horizontal','../../views/back','../../views/globalinduce','../../models/eventtype','./graphs'
	    ]
	}
);
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
KISSY.add('brix/gallery/charts/js/pub/views/line/group',function(S,Base,node,Global,SVGElement,SVGRenderer,SVGGraphics){
	
	function Group(){
		
		var self = this

		Group.superclass.constructor.apply(self,arguments);
	}

	Group.ATTRS = {
		index:{
			value:0              //索引
		},
		data:{
			value:[]             //[{x:0,y:-100,no_node:1[1=不显示节点]},{}]
		},
		element:{
			value:null
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
		area_opacity:{             //区域填充部分的透明度
			value:[0.05, 0.25]
		},
		shape:{
			value:0              //线条样式[0 = 直线 | 1 = 曲线]
		},
		thickness:{              //线条粗线
			value:{
				normal  : 2,     //正常情况
				over    : 3      //鼠标划入时
			}
		},
		line:{
			value:1              //是否有线条
		},
		fill:{
			value:'#666666'      //初始颜色[线色 + 圆轮廓色]
		},
		fill_over:{
			value:'#000000'      //鼠标划入颜色[线色 + 圆轮廓色]
		},
		circle:{                 //圆
			value:{ 
				radius:3,        //半径
				thickness:2,     //轮廓粗线
				fill:'#FFFFFF'   //填充色
			}
		},

		_circlesArr:{
			value:[]             //circle对象集合
		},

		_lines:{
			value:null           //线集合g
		},
		_circles:{
			value:null           //圆集合g
		},
		_linesCrude:{
			value:null           //粗线集合g
		},
		_circlesCrude:{
			value:null           //粗圆集合g(当this.node=1时才看的到)
		},
		_fill:{
			value:null           //区域
		},		

		_linearGradientIndex:{
			value:'linearGradient'//线性渐变索引	
		}
	}	

	S.extend(Group,Base,{
		init:function(){
			var self = this
			Group.superclass.constructor.apply(self,arguments);
			self.set('element', new SVGElement('g'))//, self.get('element').set('id',self.get('index'))
			self.get('parent').appendChild(self.get('element').element)

			if(self.get('area')){
				self.set('_linearGradientIndex', self.get('_linearGradientIndex') + '_' + self.get('index'))
				self._linearGradient({'id':self.get('_linearGradientIndex'),'top_fill':self.get('fill'),'top_opacity':self.get('area_opacity')[1],'down_fill':self.get('fill'),'down_opacity':self.get('area_opacity')[0]})
			}
			self._widget()

		},
		induce:function($b){
			var self = this
			self._induce($b)
		},
		getNodeInfoAt:function($index){
			var self = this
			var o = {}
			var circle = self.get('_circlesArr')[$index]
			if(circle){
				o.index = self.get('index'), o.id = Number(circle.get('_index'))
				o.x = Number(circle.get('_x')), o.y = Number(circle.get('_y'))
				o.fill = self.get('fill'), o.fill_over = self.get('fill_over')
				return o
			}else{
				return ''
			}
		},

		_widget:function(){
			// S.log('-------------------------')
			// S.log(S.now())
			var self = this
			if(self.get('area')){
				// S.log('1')
				self.set('_fill', new SVGElement('g')), self.get('_fill').set('id','J_fill')
				self.get('element').appendChild(self.get('_fill').element)
				var fill
				var o = {'lines':self.get('data'),'stroke':'none','fill':'url(#' + self.get('_linearGradientIndex') + ')'}
				if(self.get('shape') == 0){
					fill = self._fillLine(o)
				}else{
					fill = self._fillCurveLine(o)
				}
				self.get('_fill').element.appendChild(fill.element)
			}
			if(self.get('line')){
				// S.log('2')
				self.set('_lines', new SVGElement('g')), self.get('_lines').set('class','lines')
				self.get('element').appendChild(self.get('_lines').element)
				
				self.set('_circles', new SVGElement('g')), self.get('_circles').set('class','circles')
				self.get('element').appendChild(self.get('_circles').element)

				self.set('_linesCrude', new SVGElement('g')), self.get('_circles').set('class','linesCrude')
				self.get('element').appendChild(self.get('_linesCrude').element)
				

				self.set('_circlesCrude', new SVGElement('g')), self.get('_circles').set('class','circlesCrude')
				self.get('element').appendChild(self.get('_circlesCrude').element)

				//线组
				var line
				if(self.get('shape') == 0){
					if(self.get('data').length > 1){
						line = SVGGraphics.lines({'lines':self.get('data'),'stroke':self.get('fill'),'stroke_width':self.get('thickness').normal})
					}
				}else{
					if(self.get('data').length > 1){
						line = SVGGraphics.curveLines({'lines':self.get('data'),'stroke':self.get('fill'),'stroke_width':self.get('thickness').normal})
					}
				}
				if(line && line.element){
					self.get('_lines').element.appendChild(line.element)
				}				

				//圆点
				if(self.get('node') == 0){
					self.get('_circles').set('visibility','hidden')
				}
				
				var _df = document.createDocumentFragment();
				for (var a = 0, al = self.get('data').length; a < al; a++ ) {
					if(self.get('circle').fill_follow == 1){
						self.get('circle').fill = self.get('fill')
					}
					var circle = SVGGraphics.circle({'r':self.get('circle').radius,'fill':self.get('circle').fill,'stroke':self.get('fill'),'stroke_width':self.get('circle').thickness})
					// self.get('_circles').element.appendChild(circle.element), self.get('_circlesArr').push(circle)
					var x = self.get('data')[a].x , y = self.get('data')[a].y
					circle.transformXY(x,y)
					circle.set('_index', a)
					circle.set('_x',x)
					circle.set('_y',y)
					_df.appendChild(circle.element), self.get('_circlesArr').push(circle)
					if(self.get('data')[a].no_node){
						 circle.set('visibility','hidden')
					}
				}
				self.get('_circles').element.appendChild(_df)

				//鼠标划入时
				//粗线
				self.get('_linesCrude').set('visibility','hidden')
				var line
				if(self.get('shape') == 0){
					if(self.get('data').length > 1){
						line = SVGGraphics.lines({'lines':self.get('data'),'stroke':self.get('fill_over'),'stroke_width':self.get('thickness').over})
					}
				}else{
					if(self.get('data').length > 1){
						line = SVGGraphics.curveLines({'lines':self.get('data'),'stroke':self.get('fill_over'),'stroke_width':self.get('thickness').over})
					}
				}
				if(line && line.element){
					self.get('_linesCrude').element.appendChild(line.element)	
				}

				//粗圆点
				self.get('_circlesCrude').set('visibility','hidden')
				var _df = document.createDocumentFragment();
				for (var a = 0, al = self.get('data').length; a < al; a++ ) {
					var circle = SVGGraphics.circle({'r':self.get('circle').radius,'fill':self.get('circle').fill,'stroke':self.get('fill_over'),'stroke_width':self.get('circle').thickness})
					circle.transformXY(self.get('data')[a].x,self.get('data')[a].y)
					_df.appendChild(circle.element)
					if(self.get('data')[a].no_node){
						circle.set('visibility','hidden')
					}
				}
				self.get('_circlesCrude').element.appendChild(_df)
			}
			// S.log(S.now())
		},

		_induce:function($b){
			var self = this
			var visibility
			if($b){
				visibility = 'visible'
			}else{
				visibility = 'hidden'
			}
			self.get('_linesCrude').set('visibility',visibility)

			if(self.get('node') == 1){
				self.get('_circlesCrude').set('visibility',visibility)
			}
		},

		//填充直线
		_fillLine:function($o){
			var self = this
			var $o = $o ? $o : {}
			var arr = $o.lines
			var fill = $o.fill ? $o.fill : 'none'
			var stroke = $o.stroke ? $o.stroke : '#000000'
			var stroke_width = $o.stroke_width ? $o.stroke_width : 1

			if(self.get('areaMode') == 0 ){
				var d = SVGRenderer.symbol('lines','','','','',arr)
				d += ' ' + SVGRenderer.actions.L + ' ' + arr[arr.length - 1].x + ' ' + 0
				d += ' ' + SVGRenderer.actions.L + ' ' + (Number(arr[0].x)) + ' ' + 0
				d += ' ' + SVGRenderer.actions.L + ' ' + (Number(arr[0].x)) + ' ' + (Number(arr[0].y))
			}else{

				var arr = S.clone(arr)
				var d = SVGRenderer.symbol('lines','','','','',arr)
				d += ' ' + SVGRenderer.actions.L + arr[0].x + ' ' + arr[0].y		
				
				/*  flash设计思路在svg下有问题
				var arr = S.clone(arr)
				var arr1 = arr.splice(0, arr.length / 2)
				var arr2 = arr.reverse()

				var d = ' ' + SVGRenderer.actions.M + arr1[0].x + ' ' + arr1[0].y
				d = self._drawLines(d, arr1)

				d += ' ' + SVGRenderer.actions.L + arr1[0].x + ' ' + arr1[0].y
				d += ' ' + SVGRenderer.actions.L + arr2[0].x + ' ' + arr2[0].y
				d = self._drawLines(d, arr2)

				d += ' ' + SVGRenderer.actions.L + arr1[arr1.length - 1].x + ' ' + arr1[arr1.length - 1].y
				*/
			}

			var path = new SVGElement('path')
			path.attr({'d':d,'fill':fill, 'stroke':stroke,'stroke-width':stroke_width})
			return path
		},

		_drawLines:function ($d, $arr) {
			var d = $d
			for (var a = 1, al = $arr.length; a < al; a++) {
				d += ' ' + SVGRenderer.actions.L + $arr[a].x + ' ' + $arr[a].y
			}
			return d
		},
		_drawCurveLines:function($d, $arr) {
			var s = $d
			var arr = $arr

		    for (var a = 0, al = arr.length - 2; a < al; a++ ) {
			    var x2 = (arr[a + 1].x + arr[a + 2].x ) / 2
			    var y2 = (arr[a + 1].y + arr[a + 2].y ) / 2
			    var x = arr[a + 1].x * 2 - (arr[a].x + x2) / 2;
			    var y = arr[a + 1].y * 2 - (arr[a].y + y2) / 2;
			    s +=' ' +  SVGRenderer.actions.Q + x + ' ' + y + ' ' + x2 + ' ' + y2
			    arr[a + 1] = {x:x2,y:y2}
		    }
		    s += ' ' + SVGRenderer.actions.L + arr[arr.length - 1].x + ' ' + arr[arr.length - 1].y
	   	 	return s
		},
		//填充曲线
		_fillCurveLine:function($o){
			var self = this
			var $o = $o ? $o : {}
			var arr = $o.lines
			var fill = $o.fill ? $o.fill : 'none'
			var stroke = $o.stroke ? $o.stroke : '#000000'
			var stroke_width = $o.stroke_width ? $o.stroke_width : 1

			if(self.get('areaMode') == 0 ){
				var d = SVGRenderer.symbol('curveLines','','','','',arr)
				d += ' ' + SVGRenderer.actions.L + ' ' + arr[arr.length - 1].x + ' ' + 0
				d += ' ' + SVGRenderer.actions.L + ' ' + (Number(arr[0].x)) + ' ' + 0
				d += ' ' + SVGRenderer.actions.L + ' ' + (Number(arr[0].x)) + ' ' + (Number(arr[0].y))
			}else{
				var arr = arr.splice(0, arr.length / 2)
				var d = SVGRenderer.symbol('curveLines','','','','',arr)
				d += ' ' + SVGRenderer.actions.L + ' ' + arr[arr.length - 1].x + ' ' + 0
				d += ' ' + SVGRenderer.actions.L + ' ' + (Number(arr[0].x)) + ' ' + 0
				d += ' ' + SVGRenderer.actions.L + ' ' + (Number(arr[0].x)) + ' ' + (Number(arr[0].y))

				/*  flash设计思路在svg下有问题
				var arr = S.clone(arr)
				var arr1 = arr.splice(0, arr.length / 2)
				var arr2 = arr//.reverse()

				var d  = SVGRenderer.actions.M + ' ' + arr1[0].x + ' ' + arr1[0].y
				d = self._drawCurveLines(d, arr1)
				
				// d += ' ' + SVGRenderer.actions.M + ' ' + arr1[arr1.length - 1].x + ' ' + arr1[arr1.length - 1].y
				d += ' ' + SVGRenderer.actions.L + ' ' + arr2[0].x + ' ' + arr2[0].y

				d = self._drawCurveLines(d, arr2)
				d += ' ' + SVGRenderer.actions.L + ' ' + arr1[0].x + ' ' + arr1[0].y
				*/
			}

			var path = new SVGElement('path')
			path.attr({'d':d,'fill':fill, 'stroke':stroke,'stroke-width':stroke_width})
			return path
		},

		//线性填充
		_linearGradient:function($o){
			var self = this
			var $o = $o ? $o : {}
			var id = $o.id ? $o.id : 'linearGradient'
			var top_fill = $o.top_fill ? $o.top_fill : '#000000'
			var top_opacity = $o.top_opacity ? $o.top_opacity : 1
			var down_fill = $o.down_fill ? $o.down_fill : '#000000'
			var down_opacity = $o.down_opacity ? $o.down_opacity : 1
			var defs = new SVGElement('defs')
			self.get('element').appendChild(defs.element)

			var linearGradient = new SVGElement('linearGradient')
			linearGradient.attr({'id':id,'x1':'0%','y1':'0%','x2':'0%','y2':'100%'})
			defs.appendChild(linearGradient.element)

			var stop = new SVGElement('stop')
			stop.attr({'stop-color':top_fill,'stop-opacity':top_opacity,'offset':'0'})
			linearGradient.appendChild(stop.element)

			var stop = new SVGElement('stop')
			stop.attr({'stop-color':down_fill,'stop-opacity':down_opacity,'offset':'1'})
			linearGradient.appendChild(stop.element)
		}
	});

	return Group;

	}, {
	    requires:['base','node','../../utils/global','../../utils/svgelement','../../utils/svgrenderer','../../views/svggraphics']
	}
);
KISSY.add('brix/gallery/charts/js/pub/views/list/graphs',function(S,Base,node,Global,SVGElement,SVGRenderer,SVGGraphics,Info){
	
	function List(){
		
		var self = this

		List.superclass.constructor.apply(self,arguments);

		self.init()
	}

	List.ATTRS = {
		w:{
			value:0
		},
		h:{
			value:0
		},
		data:{
			value:[]
		},
		element:{
			value:null
		},

		_info:{
			value:null
		}
	}			

	S.extend(List,Base,{
		init:function(){
			var self = this
			List.superclass.constructor.apply(self,arguments);
			
			self.set('element', new SVGElement('g')), self.get('element').set('class','list')
			self.get('element').setDynamic('childs',[])
			self.get('parent').appendChild(self.get('element').element)
		},

		induce:function($o,$b){
			var self = this
			if (self.get('_info')) {
				self.get('_info').moveRowTxt($o)
			}
		},

		widget:function(){
			var self = this
			List.superclass.constructor.apply(self,arguments);
			self._widget()
		},

		_widget:function(){
			var self = this
			var w = self.get('w'), h = self.get('h') 
			var _info
			var data = self.get('data')
			//data = self._test()

			if(data.length){
				self.set('_info', new Info())
				_info = self.get('_info')

				var o = {
					data   : data,
					parent : self.get('element'),
					isBack : 0,
					hor_dis: 3,
					ver_dis: 5
				}
				_info.init(o)

				w = Math.floor(_info.get('w') / 2), h = Math.floor(_info.get('h') / 2)
				_info.get('element').transformXY(w, h)

				w = _info.get('w'), h = _info.get('h')
				self.set('w', w), self.set('h', h)
			}

			// var induce = self._drawGraph({w:w,h:h,opacity:0.4})
			// self.get('element').appendChild(induce.element)
		},

		/*
		_test:function(){
			var data = []
			data = test()

			function test(){
				var data = []
				data[0] = []
				data[1] = []
				// data[2] = []
				
				var o = {}
				o.content = '1', o.bold = 1, o.fill = '#333333', o.size = 12, o.ver_align = 3
				data[0].push(o)
				o = {}
				o.content = '浙江', o.bold = 1, o.fill = '#333333', o.size = 12, o.ver_align = 1
				data[0].push(o)
				o = {}
				o.content = '22%', o.bold = 1, o.fill = '#333333', o.size = 12, o.ver_align = 3
				data[0].push(o)
				
				o = {}
				o.content = '12', o.bold = 1, o.fill = '#333333', o.size = 12, o.ver_align = 3
				data[1].push(o)
				o = {}
				o.content = '黑龙江', o.bold = 1, o.fill = '#333333', o.size = 12, o.ver_align = 1
				data[1].push(o)
				o = {}
				o.content = '7%', o.bold = 1, o.fill = '#333333', o.size = 12, o.ver_align = 3
				data[1].push(o)
				
				// o = {}
				// o.content = '品牌展位60%', o.bold = 0, o.fill = '#78a64b', o.sign = {has:1,trim:1,fill:'#78a64b' }
				// data[2].push(o)
				return data
			}
			return data
		},
		
	
		//画支柱
		_drawGraph:function($o){
			var w = $o.w,h = $o.h,fill = $o.fill ? $o.fill : '#000000',opacity = $o.opacity ? $o.opacity : 1
			var d = SVGRenderer.symbol('square',0,0,w,h).join(' ')
			var p = new SVGElement('path')
			p.attr({'_w':w,'_h':h,'d':d,'fill':fill,'opacity':opacity})
			return p
		},*/
	});

	return List;

	}, {
	    requires:['base','node','../../utils/global','../../utils/svgelement','../../utils/svgrenderer','../svggraphics','../infos/info']
	}
);
KISSY.add('brix/gallery/charts/js/pub/views/map/graphs',function(S,Base,node,Global,Move,SVGElement,SVGRenderer,SVGGraphics,EventType,Sign){
	
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
		},
		_signs:{
			value:null           //_signs
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
			self.set('_signs', new SVGElement('g')), self.get('_signs').set('class','circles')
			self.get('element').appendChild(self.get('_signs').element)
			self.get('_signs').setDynamic('childs',[])

			if(self.get('isInduce') == 1){
				self.get('_maps').set('opacity',0)
			}

			// self.set('_test', new SVGElement('g')), self.get('_test').set('class','test')
			// self.get('element').appendChild(self.get('_test').element)
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

		_completeHandler:function(){
			var self = this
			self._layout()
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
			self.get('_signs').set('transform',matrix)

			self.set('map_w', self.get('element').getWidth())
			self.set('map_h', self.get('element').getHeight())

			var maps = self.get('maps')
			// for(var a = 0, al = maps.length; a < al; a++){
			var signs = 0
			for(var a in maps){
				var map = maps[a]
				var o = self.get('data')[a]
				if(map){
					var element = map.element
					if(o && o.fills && o.fills.normal){
						element.set('fill',o.fills.normal)
						element.element.addEventListener("mouseover",function(evt){ self._overHandler(evt)}, false);
						element.element.addEventListener("mouseout",function(evt){ self._outHandler(evt)}, false);
					}else{
						element.set('fill',self.get('config').fills.normals[0])
					}
				}
				if(map && o){
					if(o.sign.is && o.sign.font.content && self.get('isInduce') == 0){
						if(!self.get('config').sign.max || Number(self.get('config').sign.max) >= Number(o.sign.font.content)){
							var sign = new Sign()
							self.get('_signs').getDynamic('childs')[o.order] = sign
							var config = {

									circle:{
										  is:1,
										  radius:12,
										  fill:self.get('config').sign.circle.fill.normal
									},
									font:{
										is:1,
										content:o.sign.font.content,
										size:14,
										fill:'#FFFFFF',
										bold:1
									}	
							}
							var o = {
								parent : self.get('_signs'),
								config : config
							}
							sign.init(o)
							sign.get('element').transformXY(map.cx, map.cy)
							signs++
						}
					}
				}
			}
			self.get('element').fire(EventType.COMPLETE)
		},

		_overHandler:function($evt){
			var self = this
			var index = $evt.target.getAttribute('_index')
			var o = S.clone(self.get('data')[index])
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
			var o = S.clone(self.get('data')[index])
			self._induce(index,false)

			o.index = index
			self.get('element').fire(EventType.OUT,o)
		},
		_induce:function($index,$b){
			var self = this
			if(self.get('isInduce') == 1){
				return
			}
			var o = self.get('data')[$index]
			var map = self.get('maps')[$index]
			var element = map.element
			if(o){
				if($b){
					element.set('fill',o.fills.over)
				}else{
					element.set('fill',o.fills.normal)
				}

				var sign = self.get('_signs').getDynamic('childs')[o.order]
				if(sign){
					var fill = $b ? self.get('config').sign.circle.fill.over : self.get('config').sign.circle.fill.normal
					sign.setStyle({circle:{fill:fill}})
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
			return 'brix/gallery/charts/js/pub/views/map/maps/' + $name + '/' + 'main'
		}
	});

	return Graphs;

	}, {
	    requires:['base','node','../../utils/global','../../utils/move','../../utils/svgelement','../../utils/svgrenderer','../../views/svggraphics','../../models/eventtype','../modules/sign/main']
	}
);
KISSY.add('brix/gallery/charts/js/pub/views/map/maps/zh/main',function(S,Base,SVGElement,EventType,MapData){
	function Main(){

		var self = this

		Main.superclass.constructor.apply(self,arguments);

		self.init()
	}

	Main.ATTRS = {

		map_w:{
			value:560
		},
		map_h:{
			value:470
		},
		maps:{
			value:[]
		},
		element:{
			value:null
		},

		_main:{
			value:null
		}
	}

	S.extend(Main,Base,{
		init:function(){
			var self = this
			self.set('element',new SVGElement('g'))
			self.get('element').attr({'class':'zh'});
			self.get('parent').appendChild(self.get('element').element)
		},

		widget:function(){
			var self = this
			
			self._widget()
			self._layout()
			self.get('element').fire(EventType.COMPLETE)
		},

		_widget:function(){
			var self = this
			self.set('maps', MapData.get())
		},

		_layout:function(){
			var self = this
			var arr = self.get('maps')
			var _df = document.createDocumentFragment();
			// for(var a = 0, al = arr.length; a < al; a++){
			for(var a in arr){
				var o = arr[a]
				if(o){
					var path = new SVGElement('path')
					path.attr({'d':o.d,'fill':'#BED2ED', 'stroke':'#ffffff','stroke-width':1.5})
					_df.appendChild(path.element)
					path.set('_index', a)
					o.element = path
				}
			}
			self.get('element').appendChild(_df)
			// self.set('_back', new SVGElement('rect')), self.get('_back').attr({'width':self.get('map_w'),'height':self.get('map_h'),'fill':'none','stroke':'#000000'})
			// self.get('element').appendChild(self.get('_back').element)
		},

		_overHandler:function($evt){
			console.log($evt.target.getAttribute('_index'))
		},
		_outHandler:function($evt){
			console.log('_outHandler')	
		}
	});

	return Main;

	}, {
	    requires:['base','../../../../utils/svgelement','../../../../models/eventtype','./mapdata']
	}
);
KISSY.add('brix/gallery/charts/js/pub/views/map/maps/zh/mapdata',function(S){
	
	var MapData  = {

		get:function(){
			var self = this

			var arr = {}
			arr['安徽'] = self._setMapInfo({'index':'安徽', 'cx':439, 'cy':284, d:'M423.637,253.208l2.024-0.597l6.312,2.621c0,0,1.768,2.299,2.861,2.856c1.092,0.557,5.118,1.43,5.118,1.43l2.021,1.667l2.858-0.479l0.599,1.072l-0.957,6.074l2.858,1.666l1.189,2.263l4.287,0.831l1.666-2.854l2.621,0.356l1.666,2.265l-0.24,2.021l-5.121,0.596v2.264v1.665l-2.021,2.265l1.43,2.618l4.287,2.856l0.237,3.454l8.572,0.832v4.525l-1.666,2.381l1.191,2.263l-0.951,1.43l-3.338,0.594l-1.428,1.906l0.235,4.882l-4.285,6.072l-0.715,0.683l-2.381-2.111H446.5l-2.498-2.855l-4.884,4.761l-1.786-0.834l2.026-3.69l-0.24-1.188l-1.786-0.479l-5.718,3.099l-5.356-10.241l1.666-3.214l-0.595-1.071l-2.858-0.952l-4.76-2.858l1.903-3.928l2.855-1.43l0.598-3.214l-1.07-5.716l-0.596-0.479l-2.856,2.86c0,0-5.978-4.647-4.287-3.453c1.69,1.192-3.217-4.049-3.217-4.049l3.217-2.261l0.834-4.05l2.021-1.431l-0.354-5.359l1.43-1.188l2.619,1.787l1.664,2.26l3.453-2.26l1.192-1.434l-0.598-2.617l-4.049-2.263L423.637,253.208z'})

			arr['澳门'] = self._setMapInfo({'index':'澳门', 'cx':414, 'cy':416, d:'M413.032,414.183l-0.96,1.752c0,0,0.889,0.883,1.98,1.086s1.995-0.493,1.995-0.493 L413.032,414.183z'})

			arr['北京'] = self._setMapInfo({'index':'北京', 'cx':416, 'cy':183, d:'M421.139,189.75l-0.357-2.856l-0.832-1.905l5.095-2.126l0.381-1.683l-1.189-4.767h-1.668l-6.666-3.449l-3.69,3.69c0,0-1.125,6.585-0.832,4.88c0.289-1.704-3.693,4.288-3.693,4.288l-0.594,4.286l0.832,2.263l4.881-0.834l3.693,1.071l1.784-1.667L421.139,189.75z'})

			arr['重庆'] = self._setMapInfo({'index':'重庆', 'cx':340, 'cy':310, d:'M318.986,317.871l5.58-2.092l4.564,2.092l1.014-5.811l5.346-3.72l1.351-7.671l3.932-1.059v-7.47l3.689-1.432l8.096,2.857l1.666,2.26l4.051-0.829l2.5,0.238l2.619,3.452l1.07,6.548l-0.832,2.262l-1.666-0.594c0,0-3.072,3.501-4.884,3.812c-1.809,0.311-8.336,1.429-8.336,1.429l-2.26,2.263l1.783,2.262l0.24,4.883l2.262,0.597l5.715,7.142l0.357,9.407l-3.218,2.412l-0.592,0.445l-3.334-3.451l-3.215-4.29l-0.24-2.619l-2.26-0.476l-2.621,0.834l-4.287-2.025l-2.022,4.883l-3.691,0.239l-2.619,4.049l-1.666-0.834l-2.28-6.977l-6.507-4.07L318.986,317.871z'})

			arr['福建'] = self._setMapInfo({'index':'福建', 'cx':459, 'cy':357, d:'M435.945,374.779c0,0,2.881-12.508,1.742-10.365c-1.137,2.144,1.672-2.62,1.672-2.62l0.83-2.854l2.023-4.286l-1.072-1.668l0.24-3.691l4.881-5.475l-0.357-3.691l3.215-5.478l3.095,0.834l6.311-4.524l1.193-2.26l3.69,0.593l2.025,5.118l1.666,3.454h4.047l2.498-3.215l3.693,3.69l6.454-2.276l-4.069,9.776l-2.385-1.192l-1.666,0.835l-0.238,0.954l2.262,2.501l-0.598,8.929l0.598,2.859l-0.598,0.834l-2.617-0.599l-1.668,1.667l1.191,2.384l-3.214,3.095l0.595,1.189l-3.097,1.665l0.478,2.264l-1.072,1.191h-4.285l-2.264,2.025l-0.357,0.832l2.023,1.428l-2.26,3.452l-2.859,3.691l-1.189-0.356l-3.1,3.216l-3.447-7.502l-3.098-3.929l-2.023,0.24l-1.43-1.072L435.945,374.779z'})

			arr['广东'] = self._setMapInfo({'index':'广东', 'cx':408, 'cy':395, d:'M391.37,382.632l2.265-1.666v-3.45l1.188-1.072l2.859,0.235l4.879,2.264l0.834-1.667l-1.188-2.025l0.354-1.427l3.098-2.619l5.478,1.427l3.096-1.905l2.264,2.265l5.478-1.429l1.07,2.021l-1.666,2.264l-2.859,4.288v1.069l1.67,1.192l11.43-4.525l4.048,2.264l1.19-1.191l-1.19-2.499l0.28-1.663l7.459,1.663l1.431,1.072l2.022-0.24l3.094,3.929l3.451,7.502l-2.26,1.667l-2.023,3.689l-1.786,0.596l-1.664,3.455l-5.716,2.854l-2.266-1.188l-1.426,2.382v0.833h-1.787h-3.098l-2.857,2.023l-2.021-1.188l-2.5,1.663l-6.314,2.619l-5.121-4.05l-0.354,3.217l1.788,4.882l-4.646,1.904l-2.498,3.452l-4.887,1.191l-2.617,1.073h-5.119c0,0-0.869,2.545-3.453,3.452c-2.584,0.904-9.168,3.213-9.168,3.213l-4.522,3.098l-2.265,2.263l4.287,6.903l-2.856,2.501l-3.451-0.238l-4.053-7.381l0.954-5.238v-2.501l2.854-4.646l3.695-0.831l-0.355-2.501l3.809-1.785l0.476-4.288l6.668-5.119l-0.355-6.905l5.119-6.547l-0.24-2.5l1.666-2.381L391.37,382.632z'})

			arr['甘肃'] = self._setMapInfo({'index':'甘肃', 'cx':280, 'cy':218, d:'M196.462,200.108l-1.43-16.55l0.836-3.453l4.879-2.262c0,0,5.209-5.03,6.903-5.717c1.696-0.686,10.6-4.285,10.6-4.285l4.285-2.025v-4.047l1.905-2.262l1.788,0.237l7.144,1.192l-0.358,3.095l1.43,4.88l-0.834,7.978l6.072,8.929l3.097,2.026l4.883-3.812h10.237l2.623,0.953l1.429,2.264l-1.193,2.499l-5.714,4.645l0.597,2.261l6.549,4.882h2.618l0.834,1.07l-0.596,2.025l4.05,3.217l9.404,1.429l4.525-1.19l5.718-5.719l6.903,0.598l2.855,4.287l-1.664,3.929l0.475,2.382l-3.688,2.263l-1.668,2.024l0.596,4.763l6.545,4.646l2.875-0.653l7.725,9.458l1.668,7.145l-0.834,3.451l5.357,2.859v2.26l4.883,1.192h1.426v-4.05l3.693-0.595l0.951-4.763l-2.619-2.026l-2.025-2.021l0.834-9.166l2.023-1.071l3.453,1.43l1.432-0.598l0.834,1.667l9.166,4.639l4.883,3.1l0.832,2.856l-2.619,3.691l1.431,4.285l-0.834,2.021l-6.785,0.6l-1.433,0.833l0.478,1.191v1.903l-5.355,0.594l-2.856-1.428h-3.691l-0.596,0.834l0.596,2.024l-1.789,2.023l-0.592,2.262l3.449,2.857l-2.498,5.119l1.072,2.622l-0.238,1.188h-4.051l-2.854,1.435l2.26,3.091l-1.428,4.051l-4.287,1.07l0.357,2.023l-1.189,1.428l-7.383-0.596l-2.854-2.021l-0.601-4.525l-1.664-1.669l-2.62,1.669l-4.523-4.521l-3.455-2.385l-0.354-3.335l-1.074-2.619h-1.787l-7.144,3.096l0.356,3.454h-2.618l-4.287-4.288l-4.525-0.593l-1.786-2.499l1.431-2.86l2.617,2.5l3.097,0.954l2.62-2.025v-4.881l2.857-2.62l2.265-2.263l-1.073-2.856l5.716-4.522l0.832-7.147l-2.619-3.688l-1.429-6.071l-7.144-9.405l-3.692,1.431l-5.118-4.524l-6.907-4.287l-2.856-6.905l-5.359,2.023l-9.999-6.309l-4.883,2.616l-7.501-1.188l-5.714,3.452l-3.691,0.237l-5.715-3.451l-3.93-2.265L196.462,200.108z'})

			arr['广西'] = self._setMapInfo({'index':'广西', 'cx':356, 'cy':399, d:'M305.646,387.87l3.688,0.241l4.051-3.694l1.668,1.072l7.737,3.216l1.429-0.835l0.235-2.619l1.433-1.429l10.955-7.145l1.903,2.266l6.668,2.021l3.691-4.883l1.666,1.192h2.619v-1.431l3.453-1.192v-1.069l1.43-1.428l0.832,0.236l3.453-3.451l2.856,0.832l2.857-3.931l1.432,3.099l0.832-0.238l4.525-4.288l1.188,0.24l2.021-1.073l3.693,1.073v4.048l2.856,0.595l-0.832,3.929l-2.623,4.29l-1.188,3.688h1.188l3.101-2.854l2.616,5.713l2.025-1.43h2.26l1.666,5.717l-1.666,2.383l0.24,2.5l-5.119,6.547l0.355,6.905l-6.668,5.12l-0.476,4.285l-3.809,1.787l0.354,2.5l-3.694,0.831l-2.853,4.646l-7.502,1.071l-3.93-2.856l-4.049-1.669l-4.049,4.05l-4.158,0.241l-4.058,0.234c0,0-10.996-6.139-9.168-5.119c1.828,1.021-1.666-4.526-1.666-4.526l2.261-4.646l-2.617-1.902h-3.455l-0.832-0.952l-3.691,0.952l-3.692-2.62l1.432-4.048l2.855-0.235l1.069-0.834l0.957-3.69l-1.192-2.024l-9.765-1.785l-1.668-2.856h-2.854h-2.619l-1.906-3.099L305.646,387.87z'})

			arr['贵州'] = self._setMapInfo({'index':'贵州', 'cx':333, 'cy':359, d:'M313.622,349.296l-1.666,4.761l-2.856,0.951l-6.313-0.951l-1.43,1.429l-3.453-1.07l-3.094,4.286l1.428,1.43v2.856l1.431,2.501l6.309-1.906l1.908,1.667l-2.859,12.027l3.81,3.689l-1.188,6.907l3.688,0.238l4.051-3.695l1.668,1.073l7.737,3.216l1.429-0.832l0.235-2.622l1.433-1.429l10.955-7.144l1.903,2.265l6.668,2.021l3.689-4.883l1.668,1.192h2.619v-1.432l3.453-1.189v-1.071l1.43-1.428l0.832,0.237l3.453-3.452l-2.857-5.123l1.429-7.142l-1.785-2.263l-5.121,1.428l-0.596-0.834l5.717-6.309l-2.5-10.001l-3.81,2.855l-3.334-3.45l-3.215-4.29l-0.24-2.619l-2.26-0.477l-2.621,0.834l-4.287-2.024l-2.022,4.883l-3.691,0.239l-2.619,4.049l-1.666-0.834l-2.623,0.834l-3.928-2.266l-3.213,3.69v1.668l6.312,3.453l1.426,2.621c0,0-6.094,2.245-4.523,1.667C322.1,348.955,313.622,349.296,313.622,349.296z'})

			arr['河北'] = self._setMapInfo({'index':'河北', 'cx':406, 'cy':200, d:'M413.04,235.229l0.357-1.426l-1.783-3.453l6.902-12.5c0,0,8.725-7.9,6.313-5.718c-2.411,2.185,4.523-1.188,4.523-1.188l4.268-5.423l-1.647-1.125l-1.56-3.907l-3.319,1.286l-5.479-1.428l-0.237-1.428l-0.238-9.17l3.69-1.667l-0.419-1.563l-0.177-0.104l0.81-3.557l-5.094,2.128l0.832,1.905l0.178,1.424l0.18,1.433l-2.857,1.19l-1.785,1.667l-3.692-1.071l-4.881,0.834l-0.832-2.264l0.594-4.287l3.693-4.286l0.831-4.88l3.691-3.691l6.666,3.454h1.668l1.189,4.762l1.905,0.95l0.953,3.1l-0.356,2.024l4.047,2.854l0.594,2.264l3.338,1.428l8.332-4.523v-2.621l4.883-7.143l-3.45-4.881l-2.621-0.238l-4.763-3.218l1.668-5.118l-7.387-0.595l-3.213-4.765l0.357-2.619l-6.31-6.906l-4.051,2.026l-3.451,3.452l1.191,2.62l-0.834,1.667l-4.882,0.237l-2.264,2.022l-2.022-0.835l-2.021,2.026l-4.527,3.453l-2.024-1.43v-4.644l-1.666-0.832l-2.619,1.189l-3.096,6.547l-1.189,6.311l3.689,6.19l3.215,2.858v5.24l1.904,4.286l-0.834,4.764l-4.884,3.213l-2.26,7.382l4.049,4.645l2.857,5.717l-1.785,2.857l-0.477,3.928l-1.787,2.619l-0.834,2.859l2.621,3.446l11.43,1.431l4.524-1.787L413.04,235.229z'})

			arr['湖北'] = self._setMapInfo({'index':'湖北', 'cx':389, 'cy':303, d:'M356.486,329.29l1.787-4.048l5.119-4.287l4.881,2.026l3.096-2.026l-2.621-3.093l1.429-1.433l13.219,0.836l4.525,3.097l2.264,1.425l3.451-2.26l2.619-0.833l0.596,3.093h1.904l1.43-2.021l2.856-2.86l1.431,2.027v4.049l1.19,1.667l2.619,0.594l2.855-2.854l4.287-1.433l7.979-7.381l3.691,0.236l4.522-1.428l-5.358-10.24l1.668-3.214l-0.593-1.071l-2.862-0.952l-4.761-2.858l-2.381-1.427l-3.098,1.427l-3.451-2.854h-4.524l-3.455-1.907l-0.83-2.856l-1.787-1.786l-2.5,1.428L395.421,285c0,0-9.509,0.927-7.146,1.071c2.363,0.146-7.736-1.666-7.736-1.666l-9.407-8.334l-2.619,2.023l-1.188-0.831h-1.907h-8.572l-1.189,1.068l2.619,2.62l2.5,0.593l2.26,0.837l-1.067,1.668l-4.287,2.021l-0.834,3.451l0.834,1.191l0.596,4.288l2.5,0.238l2.619,3.452l1.07,6.548l-0.832,2.262l-1.666-0.594l-4.883,3.812l-8.336,1.429l-2.261,2.263l1.783,2.262l0.24,4.882l2.262,0.598L356.486,329.29z'})

			arr['黑龙江'] = self._setMapInfo({'index':'黑龙江', 'cx':505, 'cy':74, d:'M464.838,96.639l6.787-1.19l2.854,5.241l4.285,3.095l2.856-1.188h2.386l4.285-2.501l3.094,3.094l2.024,0.357l5.357-2.023l3.813,2.023l1.666,4.288h2.857l1.43,1.904l3.689,4.049l1.426-0.833l-0.594-5.12l2.026-1.432l2.854,5.716l2.621,1.074l2.858,3.212l2.021-0.357l0.836-1.427l4.523-5.12l2.022,1.428l1.43-2.022l1.431,2.619l4.283,1.429h2.86l2.07,0.088l-1.238-2.113l-0.598-6.906l-5.115-7.978l2.855-2.857l2.616-4.883h9.646l1.785-1.665l-0.597-3.69l2.025-3.691l-0.596-2.024l0.832-3.451l-0.236-17.742l2.855-5.715l-3.214-3.692l0.595-2.261l-1.427-2.024l-3.69,1.429l-4.289,4.884l-4.283,2.023l-4.289,5.951l-10.598,3.692l-4.879-3.692l0.594-2.262l-2.5-3.689l-1.191-3.811l-4.047-0.239l-7.145-3.69l-2.859,1.071l-3.33-1.667l-4.887,0.834l-4.283-1.429l-2.621-3.69l-2.498-2.857l-0.951-2.857l-3.334-3.452l-2.026-3.099l-4.644-6.31l-1.428-3.69l-5.119-6.548l-1.432-3.454l-6.549-3.216l-4.287,1.429l-3.689-0.833l-8.336-1.668l-11.07,3.932l-2.024,1.786l2.262,3.096l-2.856,7.499l0.834,0.835l4.881,3.096l2.621-4.286l4.524,2.856l-0.235,2.022l1.664,5.119l2.854,3.218l5.717,0.833l1.668-1.787l3.451-0.477l6.547-5.476l8.576,6.31l-2.858,11.669l0.594,8.333v5.119l-2.26,1.191l-0.238,13.335l-0.597-0.476l-2.26-2.858h-1.192l-0.595,1.073c0,0-8.797,13.044-7.146,10.596c1.652-2.448-3.451,4.523-3.451,4.523l0.357,1.428l7.145,4.886l3.926-1.071l0.599,1.071l-0.834,1.189l-3.689,1.667l-0.359,3.214L464.838,96.639z'})

			arr['海南'] = self._setMapInfo({'index':'海南', 'cx':371, 'cy':454, d:'M385.895,447.523l-5.119,8.93v3.929l-10.238,8.336l-10.598-3.689l-2.025-7.501l0.597-3.454c0,0,8.074-8.075,5.715-5.716c-2.357,2.358,2.025-1.665,2.025-1.665l9.403-1.668l4.289-0.358l1.426-1.666l3.103,0.832L385.895,447.523z'})

			arr['河南'] = self._setMapInfo({'index':'河南', 'cx':398, 'cy':264, d:'M371.131,276.068l9.405,8.336l7.742,1.665l7.144-1.072l2.262,1.072l2.5-1.43l1.783,1.787l0.834,2.856l3.455,1.905h4.524l3.451,2.857l3.098-1.428l2.382,1.428l1.903-3.929l2.855-1.43l0.598-3.216l-1.07-5.715l-0.596-0.479l-2.856,2.86l-4.287-3.453l-3.218-4.049l3.218-2.263l0.834-4.048l2.021-1.431l-0.354-5.359l1.43-1.188l2.619,1.787l1.664,2.26l3.455-2.26l1.19-1.434l-0.598-2.617l-4.049-2.263l-0.834-2.619l-7.142,0.835l-4.524-3.93l-2.021-0.596v-2.621l10-11.074l-3.69,0.834l-2.261,1.669l-0.957-1.429v-1.666l-1.663-0.6l-4.525,1.785l-11.43-1.428l-0.597,9.408c0,0-6.604,5.169-5.479,4.287c1.129-0.884-7.381,1.429-7.381,1.429l-10.359,7.142l-8.215,2.264v1.43l7.738,11.666L371.131,276.068L371.131,276.068z'})

			arr['湖南'] = self._setMapInfo({'index':'湖南', 'cx':385, 'cy':344, d:'M408.279,325.242l-2.619-0.594l-1.188-1.667v-4.05l-1.43-2.026l-2.857,2.86l-1.43,2.023h-1.904l-0.594-3.096l-2.621,0.833l-3.451,2.263l-2.264-1.428c0,0-2.666-2.521-4.525-3.097c-1.857-0.576-13.217-0.832-13.217-0.832l-1.43,1.429l2.62,3.093l-3.096,2.026l-4.883-2.026l-5.117,4.287l-1.787,4.05c0,0-0.19,6.479,0.357,9.405c0.551,2.926,2.5,10.002,2.5,10.002l-5.717,6.31l0.596,0.833l5.121-1.428l1.785,2.263l-1.429,7.144l2.857,5.121l2.856,0.832l2.857-3.931l1.43,3.099l0.834-0.238l4.523-4.288l1.191,0.24l2.021-1.073l3.693,1.073v4.048l2.856,0.595l-0.832,3.929l-2.623,4.29l-1.188,3.688h1.188l3.103-2.854l2.617,5.713l2.021-1.43h2.264l2.263-1.666v-3.45l1.188-1.072l2.859,0.235l4.879,2.264l0.834-1.667l-1.188-2.023l0.354-1.429l3.098-2.619l5.478,1.428l3.096-1.906l-1.193-2.021l1.193-4.642l-0.234-6.789l-2.026-0.831l-1.785-4.647v-3.927l-0.834-0.596l-1.43,0.596l-0.832-0.955l0.594-6.188l2.502-2.024l1.785-3.454l-0.355-3.452L408.279,325.242z'})

			arr['吉林'] = self._setMapInfo({'index':'吉林', 'cx':501, 'cy':123, d:'M544.896,113.042l-2.07-0.088h-2.858l-4.285-1.431l-1.43-2.619l-1.431,2.024l-2.022-1.428l-4.523,5.12l-0.834,1.427l-2.022,0.357l-2.859-3.214l-2.621-1.072l-2.854-5.715l-2.027,1.431l0.594,5.12l-1.426,0.833l-3.689-4.05l-1.432-1.903h-2.854l-1.666-4.288l-3.813-2.023l-5.354,2.023l-2.025-0.357l-3.098-3.094l-4.285,2.5h-2.383l-2.857,1.191l-4.285-3.096l-2.854-5.24l-6.787,1.189l-2.621,3.099l-0.238,3.45l-7.502-2.023l-1.074,2.381l0.601,1.667l3.928,2.859v4.046l0.594,3.929l2.265,3.456l0.356,3.095l1.666,1.191l5.717-5.479l5.953,7.502v4.288l3.213,1.667l0.238-1.431l4.885,1.431l3.451,4.046l1.666-1.784l0.357-1.074l8.217,11.075l0.594,4.286l4.527,5.239l0.592,4.761l4.051-2.499l3.689-10.598l1.67-0.595l4.047,2.263l6.549-0.834l2.26-2.024l-3.092-4.763l0.832-1.191c0,0,7.84-2.611,6.072-2.022c-1.766,0.588,2.5-4.883,2.5-4.883l3.215-1.428l0.238-4.766l0.832-3.212l1.785-0.596l1.668,1.789l1.668,1.426l4.287-5.715l1.188-4.288L544.896,113.042z'})

			arr['江苏'] = self._setMapInfo({'index':'江苏', 'cx':463, 'cy':266, d:'M483.646,282.616l-1.426,4.286l-1.898,2.251l-3.225,3.824l-4.879-0.835l-3.929-2.383l-2.383,1.19l-8.571-0.832l-0.238-3.454l-4.287-2.856l-1.428-2.618l2.02-2.264v-1.665v-2.267l5.121-0.594l0.24-2.023l-1.666-2.263l-2.621-0.355l-1.666,2.854l-4.287-0.831l-1.188-2.263l-2.857-1.666l0.955-6.074l-0.598-1.072l-2.859,0.479l-2.021-1.667l-5.118-1.429l-2.861-2.857l-6.307-2.621l0.592-2.856l2.5-1.069l4.645,3.927h1.433l4.284-0.476l2.5-2.022l3.453,2.856l1.427-2.62l0.358-1.43l2.857-1.667l0.834-3.45l2.854-0.597l7.148,4.881c0,0,3.365,0.754,5.117,2.025c1.754,1.271,9.766,16.313,9.766,16.313l-0.357,1.666l6.548,3.095l1.784,2.859l3.099,1.429l1.428,2.855l-2.023,0.951l-3.334-1.188h-4.645l-4.287-1.432l-1.666,1.432l3.932,1.188l3.813,1.669L483.646,282.616z'})

			arr['江西'] = self._setMapInfo({'index':'江西', 'cx':429, 'cy':339, d:'M408.279,325.242l3.336,6.549l0.355,3.452l-1.785,3.454l-2.502,2.024l-0.594,6.188l0.832,0.955l1.43-0.596l0.834,0.596v3.927l1.785,4.647l2.026,0.831l0.234,6.789l-1.193,4.642l1.193,2.021l2.266,2.265l5.474-1.429l1.071,2.022l-1.665,2.263l-2.859,4.287v1.07l1.67,1.192l11.43-4.525l4.047,2.263l1.191-1.19l-1.191-2.499l0.281-1.663l1.742-10.365l1.67-2.62l0.832-2.854l2.025-4.286l-1.072-1.668l0.238-3.691l4.881-5.475l-0.355-3.691l3.213-5.478l3.095,0.834l6.311-4.524l1.193-2.263l-4.049-7.501l-2.619-3.69l1.901-1.818l-2.381-2.111H446.5l-2.5-2.855l-4.884,4.762l-1.784-0.835l2.024-3.69l-0.24-1.188l-1.784-0.479l-5.716,3.099l-4.524,1.429l-3.689-0.238c0,0-9.709,9.669-7.979,7.381c1.731-2.287-4.287,1.433-4.287,1.433L408.279,325.242z'})

			arr['辽宁'] = self._setMapInfo({'index':'辽宁', 'cx':475, 'cy':156, d:'M491.15,173.2l6.783-10.002l4.287-4.881l-0.595-4.763l-4.524-5.239l-0.594-4.286l-8.216-11.075l-0.358,1.074l-1.666,1.786l-3.453-4.05l-4.883-1.429l-0.236,1.429v2.264l-2.022,2.022l-4.047,4.05H467.1l-1.666,2.856h-1.789l-3.094,3.096h-1.787l-3.691,3.691l-2.262,0.596l-4.881,7.5l-3.096-4.644l-3.453-2.262l-1.666,1.667l1.903,10.002l-1.666,3.453l-1.668,5.12l4.763,3.215l2.621,0.238l3.45,4.881l2.5-1.429c0,0,2.857-2.881,4.05-4.882c1.192-2.002,4.049-6.788,4.049-6.788l6.787-1.429l4.287,4.286l-3.099,6.787l-4.049,6.311l3.688,2.62l-0.233,3.098l-2.857,2.855l0.597,1.19l4.881-2.619l7.143-9.407l10.836-6.072L491.15,173.2z'})

			arr['内蒙古'] = self._setMapInfo({'index':'内蒙古', 'cx':374, 'cy':162, d:'M301.969,226.604l3.438-0.779l2.859-1.188l4.762-3.932l0.953-6.31l2.855-9.168l5.954-4.048l0.835,0.951l1.786,6.19l-2.858,4.049l-0.594,3.691l9.168,3.453l0.832,2.621l5.358-0.359l2.617,0.596l1.191,0.834l9.405-13.454l2.502-0.835l0.593-1.664l-0.236-2.623l3.096-4.523l6.072-0.358l2.262-2.5l1.431,1.074l3.452-2.86h1.904l6.312-9.046l3.215,0.235l3.93-2.855l1.191,1.189l7.381-3.809l-3.689-6.193l1.189-6.311l3.096-6.549l2.619-1.188l1.666,0.832v4.644l2.025,1.43l4.526-3.453l2.021-2.026l2.022,0.835l2.265-2.025l4.881-0.234l0.834-1.667l-1.191-2.622l3.453-3.452l4.049-2.024l6.31,6.908l-0.355,2.618l3.213,4.763l7.385,0.595l1.666-3.453l-1.903-10.002l1.666-1.667l3.453,2.262l3.096,4.644l4.881-7.5l2.264-0.596l3.689-3.692h1.787l3.094-3.095h1.787l1.666-2.856h4.527l4.047-4.051l2.021-2.021v-2.264l-3.213-1.667v-4.286l-5.953-7.502l-5.717,5.478l-1.666-1.19l-0.357-3.096l-2.264-3.453l-0.594-3.931v-4.046l-3.928-2.858l-0.601-1.667l1.074-2.382l7.502,2.022l0.238-3.452l2.621-3.099l-1.789-1.666l0.358-3.214l3.689-1.667l0.834-1.19l-0.598-1.07l-3.927,1.07l-7.145-4.882l-0.357-1.43l3.453-4.524l7.146-10.597l0.594-1.072h1.193l2.26,2.858l0.596,0.479l0.238-13.336l2.26-1.191v-5.121l-0.594-8.333l2.858-11.668l-8.575-6.312l-6.548,5.478l-3.45,0.476l-1.668,1.786l-5.718-0.832l-2.854-3.215l-1.664-5.122l0.236-2.021l-4.525-2.858l-2.621,4.289l-4.881-3.096l-0.834-0.835l2.856-7.5L433.4,7.223h-2.024l-5.119,3.688l-4.285,6.311l1.668,1.071l3.211,0.359l2.504,6.548l-1.43,2.618l-2.502,3.689l-4.644,17.147l1.785,2.856l-1.428,2.498l-10.599,7.742l-5.713-1.071l-3.215-1.191l-0.479,1.667l-4.642,18.577l-2.264,2.378l1.191,3.335l2.854,2.382l4.764-2.623l7.74,0.598l2.26-3.692l4.052-0.951l7.737,2.856l9.408,9.765v2.023l-2.024,1.429l-10.836,0.599l-3.691,2.854l-2.857-0.355l-2.022,3.214l-5.121,1.07l-3.457,5.12l-0.592,3.81l-7.379,4.763l-4.646,0.598l-5.119,6.904l-4.883,2.859l-9.408-2.025l-3.092-1.431l-3.692,3.694l-1.785,6.548l5.119,7.501l-3.335,3.451l-4.643,2.859c0,0-8.422,10.638-6.787,8.571c1.637-2.064-6.619,3.36-8.93,3.93c-2.31,0.568-14.525,1.429-14.525,1.429l-2.264-0.237l-16.906,7.144l-7.742,4.881l-2.262-1.19l-0.83-2.262l-10.36-0.597l-11.909-3.688l-3.211-3.69l-17.385-2.025l-3.217,1.43l-21.072-2.022l-0.358,3.095l1.43,4.883l-0.834,7.976l6.073,8.929l3.096,2.026l4.883-3.812h10.237l2.623,0.953l1.426,2.262l-1.19,2.5l-5.714,4.646l0.597,2.261l6.549,4.88h2.618l0.834,1.072l-0.596,2.023l4.05,3.217l9.403,1.429l4.527-1.19l5.716-5.719l6.903,0.598l2.857,4.289l-1.664,3.926l0.473,2.382l-3.688,2.263l-1.668,2.024l0.596,4.76l6.545,4.647L301.969,226.604z'})

			arr['宁夏'] = self._setMapInfo({'index':'宁夏', 'cx':317, 'cy':226, d:'M329.934,230.111l0.24-5.476l1.785-2.499l-0.832-2.62l-9.168-3.454l0.594-3.691l2.858-4.049l-1.786-6.19l-0.835-0.952l-5.954,4.049l-2.855,9.168l-0.953,6.31l-4.762,3.93l-2.859,1.189l-3.438,0.779c0,0,9.184,11.236,7.729,9.458c-1.455-1.78,1.664,7.146,1.664,7.146l-0.834,3.449l5.357,2.859v2.262l4.881,1.19h1.43v-4.048l3.691-0.597l0.951-4.763l-2.619-2.026l-2.023-2.021l0.832-9.163l2.023-1.073l3.453,1.43L329.934,230.111z'})

			arr['青海'] = self._setMapInfo({'index':'青海', 'cx':219, 'cy':244, d:'M153.954,234.989l4.523,1.667l7.742-2.617l-1.193-1.429h-2.021l-0.834-2.259l0.594-2.024l3.692-1.668l2.617-4.286l-7.977-6.548l-0.356-6.906c0,0,2.08-2.545,3.689-2.856c1.609-0.313,26.317-5.119,26.317-5.119l1.783-1.428l3.931,0.594l13.215,3.095l3.93,2.265l5.714,3.451l3.692-0.237l5.714-3.452l7.501,1.188l4.882-2.616l9.999,6.309l5.36-2.023l2.856,6.903l6.907,4.286l5.119,4.527l3.691-1.431l7.146,9.405l1.426,6.071l2.619,3.688l-0.832,7.146l-5.715,4.524l1.073,2.856l-2.265,2.263l-2.856,2.62v4.879l-2.621,2.027l-3.097-0.954l-2.617-2.5l-1.431,2.859l1.787,2.499l4.524,0.594l4.287,4.288h2.618l2.024,2.265l-1.787,4.046v0.239l-3.688-0.479l-2.621,1.905l-1.666-2.856l-4.524,1.785l-1.19,2.264v3.451l-4.524,0.836l-5.715-5.716l-1.787-2.856l-4.524,1.428l-7.738-2.262l-11.67,1.666l-0.952,1.189l-1.071,3.69l-2.263,1.43l0.238,3.692l-6.906,8.931l-11.43-2.383l-0.833-4.285l-7.146-5.718l-15.717-2.498l-6.786-1.19l-2.621-0.238l-5.953-4.883l-12.384-2.857l-8.57-16.551l-0.238-4.642l3.451-1.672v-5.117l2.502-6.313l-2.858-2.856L153.954,234.989z'})

			arr['四川'] = self._setMapInfo({'index':'四川', 'cx':286, 'cy':310, d:'M279.33,280.95l1.788-4.05l-2.025-2.261l-0.357-3.454l7.145-3.096h1.787l1.069,2.619l0.357,3.336l3.455,2.384l4.522,4.521l2.621-1.669l1.664,1.669l0.6,4.525l2.855,2.021l7.383,0.599l1.189-1.431l-0.357-2.023l4.287-1.07l2.381,0.478l0.238,2.617l2.024,0.237l7.382-1.427l1.43,0.593l0.354,2.026l3.099,0.834l6.549,3.214v7.47l-3.932,1.059l-1.351,7.671l-5.346,3.72l-1.014,5.811l-4.564-2.092l-5.58,2.092l-0.231,4.416l-0.464,4.53l6.507,4.07l2.28,6.977l-2.623,0.833l-3.928-2.263l-3.213,3.691v1.666l6.311,3.452l1.427,2.62l-4.523,1.666l-6.904-0.238l-0.831-2.855l-2.621-0.954l-4.285,2.623l-2.859-1.429l-0.238-3.694l-1.43-1.786v-1.903l-4.047-0.952l-1.072,1.188l0.599,2.858l-3.215,1.431l-0.836,2.021l0.836,2.504l-7.146,8.334l1.191,9.764l-3.453,2.855l-1.666-1.784l-6.906,4.049l-2.621-1.431l-10.001-19.17l-3.931-2.854l-3.216-0.835l-1.428-2.623l1.787-2.854l-2.857-2.264l-3.455,2.858l-3.45,0.595l-2.264-10.359l-0.597-2.499c0,0-2.04-22.568-0.594-16.55c1.446,6.017-3.099-8.336-3.099-8.336l2.267-1.665l-6.55-12.027l-7.977-6.311l1.069-3.692l0.953-1.188l11.669-1.666l7.738,2.262l4.523-1.431l1.785,2.859l5.717,5.715l4.524-0.833v-3.453l1.191-2.266l4.522-1.783l1.667,2.856l2.621-1.903l3.689,0.478v-0.241H279.33z'})

			arr['山东'] = self._setMapInfo({'index':'山东', 'cx':438, 'cy':228, d:'M425.661,252.611l0.597-2.856l2.5-1.069l4.645,3.927h1.433l4.284-0.476l2.5-2.022l3.453,2.856l1.429-2.62l0.356-1.43l2.857-1.667l0.834-3.45l2.854-0.595l7.98-13.454l-1.429-2.264l1.429-1.427l1.666,0.595l2.619-1.429l1.432-3.094l6.545-6.073l5.121-1.666l2.381-2.266l-0.592-4.88l-3.457-0.355l-7.738,0.952l-5.356-2.62l-3.216,0.596l-7.977,10.239l-2.262,1.429l-5.117-2.263l-0.359-2.619l-1.069-4.523l-2.859-1.669l-4.643,1.073l-2.882-1.971l-4.266,5.423l-4.523,1.188c0,0-8.514,7.798-6.313,5.718c2.201-2.081-6.902,12.5-6.902,12.5l1.783,3.45l-0.357,1.431v1.666l0.957,1.429l2.261-1.669l3.69-0.834l-10.002,11.074v2.621l2.023,0.596l4.524,3.93l7.146-0.835L425.661,252.611z'})

			arr['上海'] = self._setMapInfo({'index':'上海', 'cx':485, 'cy':287, d:'M484.32,292.485l-3.998-3.332c0,0,0.867-0.375,1.898-2.251c1.031-1.875,1.426-4.286,1.426-4.286l4.287,1.788l2.027,2.854l-1.433,2.024L484.32,292.485z'})

			arr['山西'] = self._setMapInfo({'index':'山西', 'cx':378, 'cy':217, d:'M363.393,259.519l8.217-2.265l10.357-7.142l7.381-1.431l5.477-4.287l0.599-9.405l-2.623-3.449l0.836-2.856l1.787-2.619l0.477-3.929l1.785-2.86l-2.859-5.713l-4.047-4.645l2.262-7.383l4.886-3.212l0.83-4.765l-1.904-4.286v-5.242l-3.215-2.854l-7.381,3.809l-1.191-1.189l-3.93,2.855l-3.213-0.235l-6.312,9.048h-1.906l-3.452,2.858l0.237,4.046l-1.67,3.452l-0.594,4.525l-3.096,4.884l3.334,6.905l-1.07,3.929l-2.619,4.286c0,0,4.146,18.996,3.689,16.903s-2.498,8.81-2.498,8.81L363.393,259.519z'})

			arr['陕西'] = self._setMapInfo({'index':'陕西', 'cx':351, 'cy':260, d:'M363.393,259.519l-1.428-3.454l2.498-8.81l-3.689-16.903c0,0,3.262-5.777,2.619-4.286c-0.646,1.49,1.07-3.929,1.07-3.929l-3.334-6.905l3.096-4.884l0.594-4.525l1.67-3.452l-0.238-4.046l-1.432-1.074l-2.26,2.502l-6.072,0.356l-3.096,4.526l0.236,2.62l-0.593,1.665l-2.502,0.834l-9.406,13.454l-1.19-0.836l-2.617-0.594l-5.359,0.359l-1.789,2.499l-0.233,5.478l0.834,1.667l9.166,4.637l4.883,3.099l0.832,2.855l-2.619,3.691l1.431,4.286l-0.835,2.021l-6.784,0.6l-1.433,0.835l0.478,1.188v1.904l-5.355,0.596l-2.856-1.428h-3.691l-0.596,0.832l0.596,2.026l-1.789,2.022l-0.592,2.261l3.451,2.861l-2.5,5.117l1.071,2.619l-0.237,1.191h-4.052l-2.854,1.429l2.262,3.098l-1.43,4.048l2.383,0.478l0.238,2.617l2.021,0.237l7.386-1.427l1.43,0.593l0.354,2.025l3.099,0.835l6.547,3.216l3.69-1.434l8.097,2.857l1.666,2.26l4.051-0.829l-0.596-4.288l-0.834-1.191l0.834-3.451l4.286-2.021l1.068-1.668l-2.26-0.837l-2.5-0.593l-2.619-2.62l1.189-1.068h8.571h1.908l1.189,0.83l2.616-2.022v-3.454l-7.737-11.668L363.393,259.519L363.393,259.519z'})

			arr['天津'] = self._setMapInfo({'index':'天津', 'cx':425, 'cy':193, d:'M430.413,200.491c0,0-1.832,1.672-3.319,1.284c-1.49-0.388-5.479-1.428-5.479-1.428l-0.237-1.429l-0.238-9.169l3.69-1.667l-0.596-1.666l0.81-3.557l0.385-1.683l1.901,0.95l0.953,3.098l-0.356,2.022l4.047,2.858l0.594,2.263l-2.379,1.668l-0.834,3.809L430.413,200.491z'})

			arr['台湾'] = self._setMapInfo({'index':'台湾', 'cx':497, 'cy':378, d:'M505.438,371.203l-3.217,19.169l-1.664,6.07v5.123l-1.43,1.427l-3.451-5.119l-3.693-2.858l-3.215-8.571c0,0-0.451-5.62,0.357-7.74c0.809-2.118,5.356-14.05,5.356-14.05l6.313-5.357l4.051,1.904L505.438,371.203z'})

			arr['香港'] = self._setMapInfo({'index':'香港', 'cx':422, 'cy':410, d:'M417.745,409.005l3.394,0.773l3.453-2.558l1.666,4.582c0,0-5.521,2.673-3.691,1.785c1.828-0.884-4.641-0.355-4.641-0.355l-0.834-3.454L417.745,409.005z'})

			arr['新疆'] = self._setMapInfo({'index':'新疆', 'cx':125, 'cy':167, d:'M153.889,69.508l2.327-0.014l-1.428,4.525l2.025,2.38l0.236,1.666l4.525,4.524l1.191,3.453l5.953,0.357l2.62,2.265h1.429l3.453,7.379l3.451,8.931l-1.784,5.357l0.358,2.025l-3.215,5.477l0.833,4.286l11.192,4.763l12.025,1.788l12.503,8.571l4.049,1.429l0.237,2.261l2.619,5.478l2.619,7.146l3.333,5.953l-1.903,2.263v4.047l-4.286,2.026l-10.596,4.284l-6.907,5.719l-4.881,2.26l-0.834,3.453l1.43,16.55l-3.931-0.596l-1.783,1.431l-26.315,5.119l-3.691,2.856l0.358,6.906l7.978,6.548l-2.62,4.286l-3.69,1.668l-0.597,2.024l0.835,2.259h2.021l1.192,1.429l-7.738,2.617l-4.525-1.667l-2.382-1.424h-5.715l-10.24-4.642h-6.546l-5.121,1.428h-5.714l-8.931,4.879l-7.143-0.834l-7.145,2.5l-5.956-1.907l-3.689-3.211l-9.525-1.427l-6.191,4.28l-3.452-1.425l-2.858-2.263l-6.907-1.667l-1.07-1.189l-2.857-0.237l-9.782,5.945l-10.037-1.25l-0.822-0.359l1.113-8.623l-4.524-1.191l-9.406-6.902l-2.62-0.241l-2.023-4.525l1.427-4.643l-0.477-2.26l-3.451-2.266l-1.192-2.26l-7.143-4.049v-1.189l3.452-1.431l2.023,1.19l2.025-2.025l-0.598-6.785l0.598-5.716l-4.646-4.642l-3.095,0.833l-1.189-3.336l1.785-3.452l-0.952-3.214l3.038-2.749l1.248-1.182v-2.618l4.285-2.024l4.286-0.833l3.811-1.429l3.099,0.832l2.26-0.832l0.833,0.595l0.356,2.859l2.022,0.832l4.765-0.238c0,0,3.566-4.729,5.478-6.073c1.911-1.346,11.19,2.381,11.19,2.381l5.717-4.048l16.552-3.689l1.069-2.264l1.43-6.31l4.643-3.69h1.433v-1.906l0.236-15.836l0.833-3.212l-4.521-1.668l-0.24-1.191l4.762-1.428l12.384-1.073l1.905,2.501l4.287,0.952l1.192,0.239l1.665-2.262l-2.265-2.263l9.169-18.574l1.431-0.953l8.335,4.047h3.689l1.667,2.264l7.979-2.502l2.023-13.212l3.452-2.265l4.048-0.238l2.859-3.452l1.071-3.454l2.263-1.191L153.889,69.508z'})

			arr['西藏'] = self._setMapInfo({'index':'西藏', 'cx':130, 'cy':288, d:'M152.525,339.529l6.787,0.834l2.265,3.216l1.189,0.477l10.239-1.904l0.594-1.787l2.023-1.07l4.884-4.05l4.285-0.594l3.93-2.501l7.74-4.286l0.832,1.428l5.716,1.904l8.334-4.285l2.618,1.787l-2.379,3.452l0.952,0.833h3.332l0.359,1.427l-2.857,5.121l0.833,0.834h1.666l8.336,2.265l3.691-3.099l5.478,4.289l1.667-2.026l1.43,1.431h1.784l0.834-1.431l-0.356-6.549l1.429-0.835l3.451-4.284l-0.594-16.549l-3.099-8.337l2.265-1.665l-6.548-12.027l-7.979-6.311l-2.26,1.43l0.238,3.692l-6.908,8.931l-11.428-2.384l-0.833-4.286l-7.146-5.716l-15.717-2.498l-6.787-1.188l-2.619-0.241l-5.952-4.883l-12.385-2.857l-8.57-16.551l-0.238-4.642l3.451-1.672v-5.117l2.502-6.311l-2.858-2.858l3.811-3.095l-2.383-1.425h-5.716l-10.238-4.644h-6.549l-5.118,1.43h-5.715l-8.931,4.879l-7.144-0.834l-7.146,2.5l-5.954-1.906l-3.688-3.212l-9.526-1.427l-6.192,4.28l-3.45-1.425l-2.859-2.263l-6.908-1.667l-1.065-1.189l-2.857-0.237l-9.782,5.945l-10.412-1.297l2.428,4.398l2.68,1.995l-0.821,3.842l-0.231,3.758l0.256,2.672l0,0l-0.193,3.208l3.451,3.454l0.239,4.884l-1.072,1.907l-5.119,0.591l-2.621-2.854l-2.619,0.355l-0.476,2.265l1.428,3.688l0.479,2.62v3.333l-0.833,2.381l0.354,1.909l3.336,0.356l1.785,3.094l7.739,6.071v1.906l5.716,6.311l1.902,2.262l1.79,0.595l3.451-3.451l3.096,2.856c0,0,15.395,13.684,13.098,11.193c-2.297-2.491,2.381,5.715,2.381,5.715h2.859l1.667-1.665l1.426,1.428v5.117l7.741,4.287l1.667-0.357l1.191,4.287l6.548,3.81l0.238,2.501l1.188,0.835l5.717-0.24h3.098l4.644,3.457l10.24-0.359l5.476-0.239l1.428,2.265l-1.188,4.883l1.427,1.664l5.715-4.761l7.146-5.239l5.12,0.95L152.525,339.529z'})

			arr['云南'] = self._setMapInfo({'index':'云南', 'cx':271, 'cy':390, d:'M313.622,349.296l-0.836-2.858l-2.618-0.954l-4.283,2.622l-2.859-1.432l-0.238-3.688l-1.43-1.79v-1.903l-4.049-0.952l-1.07,1.188l0.599,2.859l-3.217,1.43l-0.834,2.021l0.834,2.5l-7.146,8.336l1.191,9.766l-3.453,2.854l-1.666-1.784l-6.907,4.048l-2.618-1.431c0,0-11.535-22.106-10.002-19.172c1.533,2.938-3.931-2.854-3.931-2.854l-3.213-0.834l-1.432-2.619l1.787-2.859l-2.857-2.263l-3.455,2.859l-3.451,0.598l-2.263-10.363l-0.596-2.499l-3.454,4.286l-1.427,0.831l0.356,6.551l-0.834,1.431h-1.784l-1.43-1.431l-1.667,2.026l1.667,7.381h2.024l1.667,1.19c0,0,0.468,2.396,0.594,4.521c0.125,2.125-0.833,15.719-0.833,15.719l-10.837,9.766l-0.594,3.689l-2.024,1.787l-0.238,1.903l1.669,4.643l-1.431,3.454l0.834,0.478l5.478-1.433l7.738-0.476l-0.834,3.098l1.431,2.857l0.475,4.287l0.955,1.426l4.524,0.243l2.024,1.425l-2.264,2.856l-0.356,3.453l-1.667,4.05l1.068,1.43l2.86,0.238l4.881,1.784l-0.593,1.667l3.212,4.881h4.524l5.716-3.213l1.786,0.952v1.906l0.832,2.856l1.432,1.429l3.092-0.477l1.192,0.834l1.072-1.192v-4.525l-1.906-8.333l1.431-2.5h4.762h1.192l2.62-3.213l6.783,2.261l2.858-2.503l1.431,1.432l2.858-1.786l2.615,2.618h1.073l0.953-1.428l2.261-2.263l1.073,0.833l3.213-0.595l3.099-2.502l2.619-3.811l3.688-0.831l2.023,2.021l1.43-4.048l2.857-0.235l1.069-0.834l0.957-3.691l-1.192-2.023l-9.765-1.785l-1.668-2.857h-2.854h-2.619l-1.906-3.097l0.24-1.665l1.188-6.907l-3.809-3.689l2.859-12.027l-1.908-1.667l-6.309,1.906l-1.431-2.501v-2.856l-1.428-1.43l3.094-4.286l3.453,1.07l1.43-1.429l6.313,0.951l2.856-0.951L313.622,349.296z'})

			arr['浙江'] = self._setMapInfo({'index':'浙江', 'cx':475, 'cy':314, d:'M483.793,336.063l-6.455,2.276l-3.693-3.69l-2.498,3.215h-4.049l-1.666-3.454l-2.023-5.118l-3.692-0.596l-4.047-7.501l-2.619-3.69l1.903-1.818l0.716-0.685c0,0,6.241-8.84,4.286-6.07c-1.954,2.769-0.239-4.882-0.239-4.882l1.43-1.906l3.336-0.594l0.951-1.43l-1.189-2.263l1.666-2.382v-4.524l2.384-1.189l3.928,2.382l4.879,0.835l3.225-3.824l3.998,3.332l-1.744,1.324l-2.021,3.096l-3.217,0.952l-1.074,0.833l3.098,1.666l5.715-2.499l9.406,3.929l0.953,7.979h-3.809l-0.24,2.382l2.024,3.332l-1.784,2.024l2.022,3.214l-3.096,3.69l-1.43-1.787l-4.644,11.788L483.793,336.063z'})
			return arr
		},

		_setMapInfo:function($o){
			var o = {
				index   : $o.index,
				element : null,                //SVGElement
				cx      : $o.cx,
				cy      : $o.cy,
				d       : $o.d
			}
			return o 
		}
	};

	return MapData;

	}
);
KISSY.add('brix/gallery/charts/js/pub/views/modules/pieinfo/main',function(S,Base,Node,Global,SVGElement,Graphs,Info,EventType,SVGGraphics){
	var $ = Node.all

	function Main(){
		
		var self = this

		/*
			arguments:

			  o:{
				parent    :''     //SVGElement
				w         :100    //宽
				h         :100    //高
				config    :{}     //配置
			  }

		 */
		Main.superclass.constructor.apply(self,arguments);

		// self.init()
	}

	Main.ATTRS = {
		w:{
			value:0
		},
		h:{
			value:0
		},
		data:{
			value:[]             //[ pie: { data:[300, 100], fills:['#ff0000', '#ffff00'] }, info:[] ]
		},
		element:{
			value:null
		},
		txtStartIndex:{
			value:0              //饼图对应info中的文字的起始索引
		},

		_graphs:{
			value:null           //pie graphs
		},
		_info:{
			value:null           
		},
		_radius:{
			value:30
		},
	}

	S.extend(Main,Base,{
		init:function(){
			var self = this
			Main.superclass.constructor.apply(self,arguments);

			self.set('element', new SVGElement('g')), self.get('element').set('class','pieInfo')
			self.get('parent').appendChild(self.get('element').element)

			self._widget()

			// self.set('_circle', SVGGraphics.circle({'r':5,'fill':'#ffffff','stroke':'#000000','stroke_width':2}))
			// self.get('element').appendChild(self.get('_circle').element)
		},

		_widget:function(){
			var self = this
			var _radius = self.get('_radius')
			var data = self.get('data')
			var _graphs,_info

			self.set('_graphs', new Graphs())
			_graphs = self.get('_graphs')

			var o = {
				x     : _radius,
				y     : _radius,
				parent: self.get('element'),
				data  : data.pie.data,
				fills : data.pie.fills,
				mw    : _radius * 2,
				mh    : _radius * 2,
				xr    : _radius,
				yr    : _radius,
				tr    : _radius * 0.6,
				font  : {is:0},
				disMove : 4,
			}
			_graphs.init(o)
			_graphs.get('element').set('transform','matrix(-1,-0.005,0.005,-1,' + _radius + ',' + _radius + ')')
			_graphs.get('element').on(EventType.OVER,function($o){self._overHandler($o)})
			_graphs.get('element').on(EventType.OUT,function($o){self._outHandler($o)})
			var total = Global.getArrMergerNumber(data.pie.data)
			if (!total) {
				_graphs.get('element').set('visibility','hidden')
			}

			if (data.info) {
				self.set('_info', new Info())
				_info = self.get('_info')

				var o = {
					data   : data.info,
					parent : self.get('element'),
					isBack : 0
				}
				_info.init(o)
			}

			var y = _radius
			if(_radius + 6 - _info.get('h') / 2 < 0){
				y = _radius - (_radius + 6 - _info.get('h') / 2)
			}

			_info.get('element').transformXY(Math.floor(_radius * 2 + 6 + _info.get('w') / 2), y)

			if (_info) {
				var w = Math.floor(_radius * 2 + 6 + _info.get('w'))
			}else {
				var w = Math.floor(_radius * 2)
			}

			self.set('w',w)
		},

		_overHandler:function($o){
			var index = $o.index
			this.get('_graphs').induce({index:index},true)
			if (this.get('_info')) {
				this.get('_info').moveRowTxt( { is:1, index:Number(this.get('txtStartIndex')) + Number(index), mode:1 } )
			}
		},
		_outHandler:function($o){
			var index = $o.index
			this.get('_graphs').induce({index:index},false)
			if (this.get('_info')) {
				this.get('_info').moveRowTxt( { is:0, index:Number(this.get('txtStartIndex')) + Number(index), mode:1 } )
			}
		}
	});

	return Main;

	}, {
	    requires:['base','node','../../../utils/global','../../../utils/svgelement','../../../views/pie/graphs','../../../views/infos/info','../../../models/eventtype','../../../views/svggraphics'
	    ]
	}
);
KISSY.add('brix/gallery/charts/js/pub/views/modules/sign/main',function(S,Base,Node,Global,SVGElement,SVGGraphics){
	var $ = Node.all

	function Main(){
		
		var self = this

		Main.superclass.constructor.apply(self,arguments);

		// self.init()
	}

	Main.ATTRS = {
		w:{
			value:0
		},
		h:{
			value:0
		},
		element:{
			value:null
		},

		_circle:{
			value:null
		},
		_font:{
			value:null
		}
	}

	S.extend(Main,Base,{
		init:function(){
			var self = this
			Main.superclass.constructor.apply(self,arguments);

			self.set('element', new SVGElement('g')), self.get('element').set('class','layouts_sign')
			// self.get('element').set('style','cursor:default'), self.get('element').mouseEvent(false)
			self.get('parent').appendChild(self.get('element').element)

			self._widget()
		},

		_widget:function(){
			var self = this
			var w = 0, h = 0
			var element = self.get('element')
			var config = self.get('config')

			if(config.circle.is){
				var circle = config.circle
				self.set('_circle', SVGGraphics.circle({'r':circle.radius,'fill':circle.fill}))
				var _circle = self.get('_circle')
				element.appendChild(_circle.element)

				w = circle.radius * 2, h = circle.radius * 2
			}
			
			if(config.font.is){
				var font = config.font
				self.set('_font', SVGGraphics.text({'content':font.content,'size':font.size,'fill':font.fill,'bold':font.bold,'family':font.family}))
				var _font = self.get('_font')
				element.appendChild(_font.element)

				var y = _font.getHeight() / 2 * 0.50
				var x = -_font.getWidth() / 2
				_font.transformXY(x,y)

				if(_font.getWidth() > w){
					w = _font.getWidth()
				}
				if(_font.getHeight() > h){
					h = _font.getHeight()
				}
			}


			self.set('w', w)
			self.set('h', h)
		},

		setStyle:function($o){
			var self = this
			if($o.circle){
				self.get('_circle').set('fill',$o.circle.fill)
			}
		}
	});

	return Main;

	}, {
	    requires:['base','node','../../../utils/global','../../../utils/svgelement','../../../views/svggraphics'
	    ]
	}
);
KISSY.add('brix/gallery/charts/js/pub/views/pie/graphs',function(S,Base,node,Global,Move,SVGElement,SVGRenderer,SVGGraphics,EventType){
	
	function Graphs(){
		
		var self = this

		Graphs.superclass.constructor.apply(self,arguments);
		this._move = []
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
			value:[]             //[[1100, 2445, 575]]
		},
		element:{
			value:null
		},
		isInduce:{
			value:0              //是否作为感应区
		},
		fills:{
			value:[]             //图形颜色集合
		},
		fills_over:{
			value:[]             //鼠标划入时对应的颜色集合
		},
		x0:{
			value:0              //圆心x
		},
		y0:{
			value:0              //圆心y
		},		
		xr:{
			value:100            //延x方向半径
		},
		yr:{
			value:100            //延y方向半径
		},
		mw:{
			value:300            
		},
		mh:{
			value:300            
		},
		tr:{
			value:60             //圆的厚度
		},
		disMove:{
			value:8              //鼠标划入时候移动的距离
		},
		font:{
			value:{
				is    : 1,       //是否展现文字
				exact : 0        //显示百分比时 精确的小数点位置
			}
		},

		_elements:{
			value:null           //区域集合g
		},
		_induces:{
			value:null           //感应区集合g
		},	
		_index:{
			value:-1             //当鼠标划入时 所突出显示的索引 从0开始
		},
		_startR:{
			value:0              //设置角度从0开始
		},
		_total:{ 
			value:0              //总数据
		},
		_elementList:{
			value:[]             //元素集合  
		},
		_angleList:{ 
			value:[]             //角度范围集合   
		},
		_scaleList:{ 
			value:[]             //比例集合    
		},
		_moveList:{ 
			value:[]             //移动的距离集合    
		},
		_elementArr:{ 
			value:[]             //_element对象集合    
		},
		_disR:{
			value:1              //每个扇形之间的距离 当只有一个数据时为0
		},
		_disMinCirR:{
			value:16             //当角度过小时 小圆与圆周之间的距离
		},
		_minCirR:{
			value:2.5            //当角度过小时 小圆的半径
		},

		_font_fill:{ 
			value:'#FFFFFF'
		},
		_font_family:{
			value:'Tahoma'
		},
		// _move:{
		// 	value:null
		// }
	}			

	S.extend(Graphs,Base,{
		init:function(){
			var self = this
			Graphs.superclass.constructor.apply(self,arguments);
			if(self.get('isInduce') == 1){ self.get('font').is = 0 }
			
			self.set('element', new SVGElement('g')), self.get('element').set('class',self.get('id'))
			self.get('parent').appendChild(self.get('element').element)

			self.set('_total', Global.getArrMergerNumber(self.get('data')))
			self.set('_angleList', self._getAngleList(self.get('data'),self.get('_total'),self.get('_startR')))
			// self.set('_scaleList', self._getScaleList(self.get('data'),self.get('_total')))
			self.set('_scaleList', Global.getArrScales(self.get('data'), self.get('font').exact))

			if(self.get('_total') == 0){
				self.set('_angleList',self._getAngleList(self.get('_scaleList'),100,self.get('_startR')))
			}

			if (self.get('data').length <= 1) {
				self.set('_disR',0)
			}

			self._widget()
			self._layout()
		},
		induce:function($o,$b){
			var self = this
			self._induce($o.index,$b)
		},

		_widget:function(){
			var self = this
			self.set('_elements', new SVGElement('g')), self.get('_elements').set('class','elements')
			self.get('element').appendChild(self.get('_elements').element)
			self.set('_induces', new SVGElement('g')), self.get('_induces').set('class','induces')
			self.get('element').appendChild(self.get('_induces').element)
		},
		_layout:function(){
			var self = this
			for (var a = 0, al = self.get('_angleList').length; a < al; a++) {
				var _element = new SVGElement('g')
				_element.set('class','element')
				_element.transformXY(0,0)
				self.get('_elements').appendChild(_element.element), self.get('_elementArr').push(_element)

				var graph = new SVGElement('g')
				graph.set('class','graph')
				_element.appendChild(graph.element)

				var fill = self.get('fills')[a] ? self.get('fills')[a] : '#000000'

				//最左边的弧度
				var r = self.get('_angleList')[a][0];
				var minR = r
				var maxR = self.get('_angleList')[a][1];
				r = r - self.get('_disR')
				maxR = maxR - 2 * self.get('_disR')
				if(self.get('isInduce') == 0 ){
					var arr = []
					var p = self._getRPoint(self.get('x0'), self.get('y0'), self.get('xr'), self.get('yr'), r)
					arr.push(p)
					for (var w = r, wl = maxR; w <= wl; w++ ){
						p = self._getRPoint(self.get('x0'), self.get('y0'), self.get('xr'), self.get('yr'), w)
						arr.push(p)
					}
					r = self.get('_angleList')[a][0];
					for (var e = maxR, el = r; e >= el; e-- ) {
						p = self._getRPoint(self.get('x0'), self.get('y0'), Number(self.get('xr')) - Number(self.get('tr')), Number(self.get('yr')) - Number(self.get('tr')), e)
						arr.push(p)
					}
					p = self._getRPoint(self.get('x0'), self.get('y0'), Number(self.get('xr')) - Number(self.get('tr')), Number(self.get('yr')) - Number(self.get('tr')), r)
					arr.push(p)

					graph.appendChild(self._fillLine({lines:arr,fill:fill,stroke:'none'}).element)

				}

				//感应区
				var _induce = new SVGElement('g')
				_induce.set('class','induce')
				self.get('_induces').appendChild(_induce.element)

				r = self.get('_angleList')[a][0] - self.get('_disR')
				maxR = self.get('_angleList')[a][1] - 2 * self.get('_disR')
				var arr = []
				var p = self._getRPoint(self.get('x0'), self.get('y0'), self.get('xr') + self.get('disMove'), self.get('yr') + self.get('disMove'), r)
				arr.push(p)
				for (var f = r, fl = maxR; f <= fl; f++ ){
					p = self._getRPoint(self.get('x0'), self.get('y0'), self.get('xr') + self.get('disMove'), self.get('yr') + self.get('disMove'), f)
					arr.push(p)
				}
				r = self.get('_angleList')[a][0];
				for (var j = maxR, jl = r; j >= jl; j-- ) {
					p = self._getRPoint(self.get('x0'), self.get('y0'), Number(self.get('xr')) - Number(self.get('tr')), Number(self.get('yr')) - Number(self.get('tr')), j)
					arr.push(p)
				}
				p = self._getRPoint(self.get('x0'), self.get('y0'), Number(self.get('xr')) - Number(self.get('tr')), Number(self.get('yr')) - Number(self.get('tr')), r)
				arr.push(p)
				_induce.element.addEventListener("mouseover",function(evt){ self._overHandler(evt)}, false);
				_induce.element.addEventListener("mousemove",function(evt){ self._moveHandler(evt)}, false);
				_induce.element.addEventListener("mouseout",function(evt){ self._outHandler(evt)}, false);
				_induce.element.addEventListener("click",function(evt){ self._clickHandler(evt)}, false);
				_induce.appendChild(self._fillLine({'lines':arr,'fill':'#000000','stroke':'none','opacity':0}).element)
				_induce.set('_index', a)


				//移动坐标
				var angle = 0
				if (Math.abs(r) > Math.abs(maxR)) {
					angle = (r - maxR) / 2
				}else {
					angle = (maxR- r) / 2
				}
				angle = r + (maxR - r) / 2
				var o = self._getRPoint(self.get('x0'), self.get('y0'), Number(self.get('xr')) - Number(self.get('tr')) / 2 , Number(self.get('yr')) - Number(self.get('tr')) / 2, angle - self.get('_disR') / 2)
				self.get('_moveList').push(self._getRPoint(self.get('x0'), self.get('y0'), self.get('disMove') , self.get('disMove'), angle - self.get('_disR') / 2))

				//文字
				if(self.get('font').is == 1){
					var font
					if (maxR - minR >= 15) {
						font = SVGGraphics.text({'content':String(self.get('_scaleList')[a]) + '%','size':o.size,'fill':self.get('_font_fill'),'bold':1,'family':self.get('_font_family')})
						_element.appendChild(font.element)
						font.transformXY(o.x - font.getWidth() / 2 + 1, o.y + 1)
					}else{
						var x

						if (self.get('font').exact > 0) {
							self.set('_disMinCirR', 22)
						}
						o = self._getRPoint(self.get('x0'), self.get('y0'), Number(self.get('xr')) + Number(self.get('_disMinCirR')), self.get('yr') + Number(self.get('_disMinCirR')), angle - self.get('_disR') / 2)
						self.set('_disMinCirR', 16)
						font = SVGGraphics.text({'content':String(self.get('_scaleList')[a]) + '%','size':o.size,'fill':fill,'bold':1})
						_element.appendChild(font.element)
						font.transformXY(o.x - font.getWidth() / 2 + 1, o.y + font.getHeight() / 4 + 1)
					}

					if(self.get('font').is == 0){
						font.set()
					}
				}
			}
		},

		//填充直线
		_fillLine:function($o){
			var self = this
			var $o = $o ? $o : {}
			var arr = $o.lines
			var fill = $o.fill ? $o.fill : 'none'
			var opacity = $o.opacity || $o.opacity == 0 ? $o.opacity : 1
			var stroke = $o.stroke ? $o.stroke : '#000000'
			var stroke_width = $o.stroke_width ? $o.stroke_width : 1
			var d = SVGRenderer.symbol('lines','','','','',arr)

			var path = new SVGElement('path')
			path.attr({'d':d,'fill':fill, 'stroke':stroke,'stroke-width':stroke_width,'opacity':opacity})
			return path
		},

		_getAngleList:function($arr, $total, $startR){
			var self = this
			var arr = []
			var tmpR = $startR
			for (var a = 0, al = $arr.length; a < al; a++ ) {
				if (a == al - 1) {
					arr.push([tmpR, 360 + self.get('_startR')])
				}else{
					var r = Math.round($arr[a] / $total * 360);
					var posR = tmpR + r
					arr.push([tmpR, posR])
					tmpR = posR
				}
		    }
			return arr
		},

		//通过知道圆心、两个半径、角度 获取处于圆周上的这个点坐标
		_getRPoint:function(x0, y0, xr, yr, r){
			var r = r * Math.PI / 180
			return {x:Math.cos(r) * xr + x0, y:Math.sin(r) * yr + y0}
		},

	 	_overHandler:function($evt){
	 		var self = this
			var index = S.one($evt.target).parent().attr('_index')
			var o = Global.getLocalXY($evt, self.get('parent').element)
			var x = o.x, y = o.y
			o = self._getInfo({'index':index, 'x':x, 'y':y})
			self.get('element').fire(EventType.OVER,o)
		},
		_moveHandler:function($evt) {
			var self = this
			var index = S.one($evt.target).parent().attr('_index')
			var o = Global.getLocalXY($evt, self.get('parent').element)
			var x = o.x, y = o.y
			o = self._getInfo({'index':index, 'x':x, 'y':y})
			self.get('element').fire(EventType.MOVE,o)
		},
		_outHandler:function($evt){
			var self = this
			var index = S.one($evt.target).parent().attr('_index')
			var o =  Global.getLocalXY($evt, self.get('parent').element)
			var x = o.x, y = o.y
			o = self._getInfo({'index':index, 'x':x, 'y':y})
			self.get('element').fire(EventType.OUT,o)
		},
		_clickHandler:function($evt){
			var self = this
			var index = S.one($evt.target).parent().attr('_index')
			var o = {}
			o.index = parseInt(index)
			self.get('element').fire(EventType.CLICK,o)
		},
		_getInfo:function($o){
			var self = this
			var o = {}
			o.index = $o.index
			o.x = $o.x, o.y = $o.y
			o.fill = self.get('fills')[o.index], o.fill_over = self.get('fills_over')[o.index]
			o.contents = String(self.get('_scaleList')[o.index]) + '%'
			return o
		},
		_induce:function($index,$b){
			// console.log($index,$b)
			var self = this
			var _element = self.get('_elementArr')[$index]
			if($b){
				x = self.get('_moveList')[$index].x, y = self.get('_moveList')[$index].y
			}else{
				x = 0, y = 0
			}
			var a = Math.floor(Math.random()*100)
			// console.log(self.get('move')[$index])
			if(this._move && this._move[$index]){
				this._move[$index].stop()
				this._move[$index] = null
			}
		 	this._move[$index] = new Move({x:Number(_element.get('_x')),y:Number(_element.get('_y'))},{x:Number(x),y:Number(y)},0.2,function($o){
				_element.transformXY($o.x,$o.y)
			},function(){'a'})
		}
	});

	return Graphs;

	}, {
	    requires:['base','node','../../utils/global','../../utils/move','../../utils/svgelement','../../utils/svgrenderer','../../views/svggraphics','../../models/eventtype']
	}
);
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
KISSY.add('brix/gallery/charts/js/pub/views/scatter/group',function(S,Base,node,Global,SVGElement,SVGRenderer,SVGGraphics,EventType){
	
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
	    requires:['base','node','../../utils/global','../../utils/svgelement','../../utils/svgrenderer','../../views/svggraphics','../../models/eventtype']
	}
);
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
KISSY.add('brix/gallery/charts/js/pub/views/svggraphics',function(S,Node,SVGElement,SVGRenderer){
	
	var SVGGraphics = {
		/**
		 * 创建文字
		 * @param  {[Object]} $o [配置参数]
		 * @return {[SVGElement]}    [文本SVGElement对象]
		 */
		text:function($o){
			var $o = $o ? $o : {}
			var family = $o.family ? $o.family : 'Arial'
			var size = $o.size ? $o.size : 12
			var fill = $o.fill ? $o.fill : '#000000'
			var content = $o.content ? $o.content : ''
			var bold = $o.bold ? 'bold' : ''

			var font = new SVGElement('text')
			font.attr({'font-family':family, 'font-size':size,'fill':fill,'font-weight':bold})
			
			// var tspan = new SVGElement("tspan");
		    // tspan.appendChild(document.createTextNode(content));
		    // font.appendChild(tspan.element);
		 	font.appendChild(document.createTextNode(content));
		    return font
		},
		/**
		 * 创建圆
		 * @param  {[Object]} $o [配置参数]
		 * @return {[SVGElement]}    [圆SVGElement对象]
		 */
		circle:function($o){
			var $o = $o ? $o : {}
			var r = $o.r ? $o.r : 10
			var fill = $o.fill ? $o.fill : '#000000'
			var fill_opacity = $o.fill_opacity || Number($o.fill_opacity) == 0 ? $o.fill_opacity : 1
			var stroke = $o.stroke ? $o.stroke : null
			var stroke_width = $o.stroke_width || Number($o.stroke_width) == 0 ? $o.stroke_width : 1
			var stroke_opacity = $o.stroke_opacity || Number($o.stroke_opacity) == 0 ? $o.stroke_opacity : 1

			var circle = new SVGElement('circle')
			circle.attr({'r':r,'fill':fill, 'fill-opacity':fill_opacity, 'stroke':stroke, 'stroke-width':stroke_width, 'stroke-opacity':stroke_opacity})
			return circle
		},
		/**
		 * 创建线组
		 * @param  {[Object]} $o [配置参数]
		 * @return {[SVGElement]}    [线组SVGElement对象]
		 */
		lines:function($o){
			var $o = $o ? $o : {}
			var lines = $o.lines
			var fill = $o.fill ? $o.fill : 'none'
			var stroke = $o.stroke ? $o.stroke : '#000000'
			var stroke_width = $o.stroke_width ? $o.stroke_width : 1
			var d = SVGRenderer.symbol('lines','','','','',lines)
			var fill_opacity = $o.fill_opacity ? $o.fill_opacity : 1

			var path = new SVGElement('path')
			path.attr({'d':d,'fill':fill, 'stroke':stroke,'stroke-width':stroke_width, 'fill-opacity':fill_opacity})
			return path
		},
		/**
		 * 创建二次贝塞尔曲线组
		 * @param  {[Object]} $o [配置参数]
		 * @return {[SVGElement]}    [线组SVGElement对象]
		 */
		curveLines:function($o){
			var $o = $o ? $o : {}
			var lines = $o.lines
			var fill = $o.fill ? $o.fill : 'none'
			var stroke = $o.stroke ? $o.stroke : '#000000'
			var stroke_width = $o.stroke_width ? $o.stroke_width : 1
			var d = SVGRenderer.symbol('curveLines','','','','',lines)

			var path = new SVGElement('path')
			path.attr({'d':d,'fill':fill, 'stroke':stroke,'stroke-width':stroke_width})
			return path
		}
	}

	return SVGGraphics;

	}, {
	    requires:['node','../utils/svgelement','../utils/svgrenderer']
	}
);
KISSY.add('brix/gallery/charts/js/pub/views/vertical',function(S,Base,node,Global,SVGElement,SVGRenderer,SVGGraphics){
	
	function Vertical(){
		
		var self = this

		Vertical.superclass.constructor.apply(self,arguments);

		// self.init.apply(self,arguments);
	}

	Vertical.ATTRS = {
		w:{
			value:0
		},
		h:{
			value:0
		},
		id:{
			value:'vertical'
		},
		data:{
			value:[]             //[{value:123,y:0},{}]
		},
		element:{
			value:null
		},
		mode:{
			value:1              //模式[1 = 左侧布局 | 2 = 右侧布局]
		},
		line_has:{
			value:1              //是否有线条
		},
		font_fill:{
			value:'#000000'
		},
		line_fill:{
			value:'#BEBEBE'
		},
		line_h:{
			value:3
		},

		_maxTextWidth:{
			value:0
		},
		_dis:{
			value:6
		},
		_line_w:{
			value:6
		},
		_line_h:{
			value:3
		},
		_fontArr:{
			value:[]
		},
		_lineArr:{
			value:[]
		}	
	}

	S.extend(Vertical,Base,{
		init:function(){
			var self = this
			var line_has = self.get('line_has')
			Vertical.superclass.constructor.apply(self,arguments);

			self.set('_line_h', self.get('line_h'))
			
			self.set('element', new SVGElement('g')), self.get('element').set('class',self.get('id'))
			self.get('parent').appendChild(self.get('element').element)

			self._widget()
			if(self.get('mode') == 1){
				self._layout()	
			}else if(self.get('mode') == 2){
				self._layout_right()
			}

			self.set('w',self.get('_maxTextWidth') + self.get('_dis') + self.get('_line_w'))


			if (line_has == 0) {
				self.set('w',self.get('_maxTextWidth') + self.get('_dis'))
			}else {
				self.set('w',self.get('_maxTextWidth') + self.get('_dis') + self.get('_line_w'))
			}
			if(self.get('data').length == 0){
				self.set('w', 0)
			}
		},

		_widget:function(){
			var self = this

			var d = SVGRenderer.symbol('line',0,0,self.get('_line_w'),0).join(' ')

			var _df = document.createDocumentFragment();
			for(var a = 0,al = self.get('data').length;a<al;a++){
				var o = self.get('data')[a]

				//文本
			 	var font = SVGGraphics.text({'fill':self.get('font_fill'),'content':Global.numAddSymbol(o.value)})
			 	self.get('_fontArr').push(font)
			 	_df.appendChild(font.element)

			    //线条
			    if(self.get('line_has') == 1){
				    var line = new SVGElement('path')
				    self.get('_lineArr').push(line)
				    line.attr({'stroke':self.get('line_fill'),'stroke-width':self.get('_line_h'),'d':d})
				    _df.appendChild(line.element)
				}
			}
			self.get('element').appendChild(_df);
			for(var a = 0,al = self.get('data').length;a<al;a++){
				var font = self.get('_fontArr')[a]
				if (self.get('_maxTextWidth') < font.getWidth()){ self.set('_maxTextWidth',font.getWidth())}
			}
		},
		// _widget:function(){
		// 	var self = this

		// 	var d = SVGRenderer.symbol('line',0,0,self.get('_line_w'),0).join(' ')

		// 	for(var a = 0,al = self.get('data').length;a<al;a++){
		// 		var o = self.get('data')[a]

		// 		//文本
		// 	 	var font = SVGGraphics.text({'fill':self.get('font_fill'),'content':Global.numAddSymbol(o.value)})
		// 	 	self.get('_fontArr').push(font)
		// 	 	self.get('element').appendChild(font.element)

		// 	    //线条
		// 	    var line = new SVGElement('path')
		// 	    self.get('_lineArr').push(line)
		// 	    line.attr({'stroke':self.get('line_fill'),'stroke-width':self.get('_line_h'),'d':d})

		// 	    self.get('element').appendChild(line.element)

		// 	    if (self.get('_maxTextWidth') < font.getWidth()){ self.set('_maxTextWidth',font.getWidth())}
			   
		// }

		//左侧布局
		_layout:function(){
			var self = this
			// self.get('element')..set('visibility','hidden')
			for(var a = 0,al = self.get('data').length; a < al ; a++){
				var y = self.get('data')[a].y
				
				var font = self.get('_fontArr')[a]
				var x = self.get('_maxTextWidth') - font.getWidth()
				var y = y + (font.getHeight() / 4)
				font.transformXY(x,y)

				var line = self.get('_lineArr')[a]
				if(line){
					var x = self.get('_maxTextWidth') + self.get('_dis')
					x = Global.ceil(x)
					line.transformXY(x,self.get('data')[a].y)
				}
			}
		},
		//右侧布局
		_layout_right:function(){
			var self = this

			for(var a = 0,al = self.get('data').length; a < al; a++){
				var y = self.get('data')[a].y
				var font = self.get('_fontArr')[a]
				var x = self.get('_line_w') + self.get('_dis')
				var y = y + (font.getHeight() / 4)
				font.transformXY(x,y)

				var line = self.get('_lineArr')[a]
				if(line){
					var x = 0
					line.transformXY(x,self.get('data')[a].y)
				}
			}
		}
	});

	return Vertical;

	}, {
	    requires:['base','node','../utils/global','../utils/svgelement','../utils/svgrenderer','../views/svggraphics']
	}
);