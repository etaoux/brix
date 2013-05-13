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
			self.get('_DataFrameFormat').vertical.section = DataSection.section(Global.getChildsArr(self.get('_DataFrameFormat').vertical.max))
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