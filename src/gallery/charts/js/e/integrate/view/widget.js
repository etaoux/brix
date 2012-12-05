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
		}
	}

	S.extend(Widget,Base,{
		init:function(){
			var self = this
			
			self.set('_DataFrameFormat',self.DataExtend(self.get('_DataFrameFormat'), self.get('DataSource')))
			self.set('_hasRight',self.get('_DataFrameFormat').vertical.org.length == 2 ? 1 : 0)
			self.get('_DataFrameFormat').vertical.sections.push(DataSection.section(self.get('_DataFrameFormat').vertical.org[0]))
			if(self.get('_hasRight') == 1){
				self.get('_DataFrameFormat').vertical.sections.push(DataSection.section(self.get('_DataFrameFormat').vertical.org[1]))
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
			var tmpData = []
			for (var a = 0, al = arr.length; a < al; a++ ) {
				var y = -self.get('_dis_graphs') - arr[a] / max * self.get('_verticalDrawH')                                    
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
				var h = arr[a] / max * self.get('_verticalGraphsH')  
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
				var y = - arr[a] / max * self.get('_verticalGraphsH')
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
	    		  '../../../pub/views/vertical','../../../pub/views/horizontal','../../../pub/views/back','../../../pub/views/globalinduce','../../../pub/views/infos/infos','../model/eventtype','./graphs'

	    ]
	}
);