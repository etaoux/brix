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