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
		areaAlphas:{             //区域填充部分的透明度
			value:[0.05, 0.25]
		},
		shape:{
			value:0              //线条样式[0 = 直线 | 1 = 曲线]
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

		
		_line_thickness:{
			value:2              //线条粗线
		},
		_line_thickness_over:{
			value:3              //鼠标划入线条粗线
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
				self._linearGradient({'id':self.get('_linearGradientIndex'),'top_fill':self.get('fill'),'top_opacity':self.get('areaAlphas')[1],'down_fill':self.get('fill'),'down_opacity':self.get('areaAlphas')[0]})
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
						line = SVGGraphics.lines({'lines':self.get('data'),'stroke':self.get('fill'),'stroke_width':self.get('_line_thickness')})
					}
				}else{
					if(self.get('data').length > 1){
						line = SVGGraphics.curveLines({'lines':self.get('data'),'stroke':self.get('fill'),'stroke_width':self.get('_line_thickness')})
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
						line = SVGGraphics.lines({'lines':self.get('data'),'stroke':self.get('fill_over'),'stroke_width':self.get('_line_thickness_over')})
					}
				}else{
					if(self.get('data').length > 1){
						line = SVGGraphics.curveLines({'lines':self.get('data'),'stroke':self.get('fill_over'),'stroke_width':self.get('_line_thickness_over')})
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