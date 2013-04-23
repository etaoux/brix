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
		isTxt:{
			value:1              //是否展现文字
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
			if(self.get('isInduce') == 1){ self.set('isTxt',0) }
			
			self.set('element', new SVGElement('g')), self.get('element').set('class',self.get('id'))
			self.get('parent').appendChild(self.get('element').element)

			self.set('_total', Global.getArrMergerNumber(self.get('data')))
			self.set('_angleList', self._getAngleList(self.get('data'),self.get('_total'),self.get('_startR')))
			self.set('_scaleList', self._getScaleList(self.get('data'),self.get('_total')))
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
				if(self.get('isTxt') == 1){
					var font
					if (maxR - minR >= 15) {
						font = SVGGraphics.text({'content':String(self.get('_scaleList')[a]) + '%','size':o.size,'fill':self.get('_font_fill'),'bold':1,'family':self.get('_font_family')})
						_element.appendChild(font.element)
						font.transformXY(o.x - font.getWidth() / 2, o.y)
					}else{
						var x
						o = self._getRPoint(self.get('x0'), self.get('y0'), Number(self.get('xr')) + Number(self.get('_disMinCirR')), self.get('yr') + Number(self.get('_disMinCirR')), angle - self.get('_disR') / 2)
						font = SVGGraphics.text({'content':String(self.get('_scaleList')[a]) + '%','size':o.size,'fill':fill,'bold':1})
						_element.appendChild(font.element)
						font.transformXY(o.x - font.getWidth() / 2, o.y + font.getHeight() / 4)
					}

					if(self.get('istxt') == 0){
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

		_getScaleList:function($arr, $total,$s) {
			var self = this
			var $s = $s ? $s : 0
			var arr = []
			var n = Math.pow(10,$s)
			for (var a = 0, al = $arr.length; a < al; a++ ) {
				arr.push(Math.round ($arr[a]/ $total * 100 * n) / n)
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
			var o = self._globalToLocal({'x':$evt.layerX,'y':$evt.layerY})
			var x = o.x, y = o.y
			o = self._getInfo({'index':index, 'x':x, 'y':y})
			self.get('element').fire(EventType.OVER,o)
		},
		_moveHandler:function($evt) {
			var self = this
			var index = S.one($evt.target).parent().attr('_index')
			var o = self._globalToLocal({'x':$evt.layerX,'y':$evt.layerY})
			var x = o.x, y = o.y
			o = self._getInfo({'index':index, 'x':x, 'y':y})
			self.get('element').fire(EventType.MOVE,o)
		},
		_outHandler:function($evt){
			var self = this
			var index = S.one($evt.target).parent().attr('_index')
			var o = self._globalToLocal({'x':$evt.layerX,'y':$evt.layerY})
			var x = o.x, y = o.y
			o = self._getInfo({'index':index, 'x':x, 'y':y})
			self.get('element').fire(EventType.OUT,o)
		},
		//全局坐标 转换相对坐标
		_globalToLocal:function($globalObject){
			var self = this
			var o = {}
			o.x = $globalObject.x - self.get('x')
			o.y = $globalObject.y - self.get('y')
			return o
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