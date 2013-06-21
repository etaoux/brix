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
	}

	S.extend(Widget,Base,{
		init:function(){
			var self = this
			
			var scales = self.get('config').scales
			self.set('_DataFrameFormat',self.DataExtend(self.get('_DataFrameFormat'), self.get('DataSource')))
			self.set('_hasRight',self.get('_DataFrameFormat').vertical.org.length == 2 ? 1 : 0)
			self.get('_DataFrameFormat').vertical.sections.push(DataSection.section(self.get('_DataFrameFormat').vertical.org[0],null,{scale:scales[0]}))
			if(self.get('_hasRight') == 1){
				self.get('_DataFrameFormat').vertical.sections.push(DataSection.section(self.get('_DataFrameFormat').vertical.org[1],null,{scale:scales[1]}))
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
			var tmpData = []
			for (var a = 0, al = arr.length; a < al; a++ ) {
				var x = self.get('_dis_graphs') + a / (maxHorizontal - 1) * self.get('_horizontalDrawW')
				x = isNaN(x) ? 0 : x
				if($i == 1 && al == 1){
					x = self.get('_horizontalDrawW')
				}
				var y = -self.get('_dis_graphs') - arr[a] / maxVertical * self.get('_verticalDrawH')
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