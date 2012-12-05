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

		_data:{
			value:[]             //删除多余数据之后的数组
		},
		_maxTextHeight:{
			value:14             //文字最大的高   写死
		},
		_disX:{
			value:10             //文字到线的距离
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

			self.set('element', new SVGElement('g')), self.get('element').set('class','horizontal')
			self.get('parent').appendChild(self.get('element').element)

			self._widget()
			self._layout()
			
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
			   	var line = new SVGElement('path')
			   	line.attr({'stroke':self.get('line_fill'),'stroke-width':self.get('_line_w'),'d':d})
			    self.get('_lineArr').push(line)
			    x = o.x
			    y = 0
			    line.transformXY(x,y)
			    _df.appendChild(line.element)
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

			var firstText = self.get('_fontArr')[0]
			var popText = self.get('_fontArr')[self.get('_fontArr').length - 1]

			if(firstText && firstText.get('_x') < -self.get('dis_left')){
				firstText.transformX(-self.get('dis_left'))
			}
			if (popText && (Number(popText.get('_x')) + Number(popText.getWidth())) > self.get('dis_right')) {
				popText.transformX(self.get('dis_right') - popText.getWidth())
			}

			// S.log(S.now())
		}

		// _widget:function(){
		// 	// return
		// 	S.log(S.now())
		// 	var self = this
		// 	self.set('dis_right', self.get('dis_right') ? self.get('dis_right') : self.get('w')) 
		// 	var d = SVGRenderer.symbol('line',0,0,0,self.get('_line_h')).join(' ')

		// 	for(var a = 0, al = self.get('data').length; a < al; a++){
		// 		var o = self.get('data')[a]
		// 		var x = o.x
		// 		var y = 0

		// 		//文本
		// 	    var font = SVGGraphics.text({'fill':self.get('font_fill'),'content':Global.numAddSymbol(o.value)})
		// 	    self.get('_fontArr').push(font)
		// 	    self.get('element').appendChild(font.element)
		// 	    x = x - font.getWidth() / 2
		// 	    y = self.get('_line_h') + self.get('_disY') + font.getHeight()
		// 	    font.transformXY(x,y)

		// 	    //线条
		// 	   	var line = new SVGElement('path')
		// 	    self.get('_lineArr').push(line)
		// 	    line.attr({'stroke':self.get('line_fill'),'stroke-width':self.get('_line_w'),'d':d})

		// 	    self.get('element').appendChild(line.element)
		// 	    x = o.x
		// 	    y = 0
		// 	    line.transformXY(x,y)

		// 	    if (self.get('_maxTextHeight') < font.getHeight()){ self.set('_maxTextHeight', font.getHeight())}
		// 	}
		// 	S.log(S.now())
		// },

		// _layout:function(){
		// 	var self = this
		// 	self.set('_data', S.clone(self.get('data')))

		// 	var firstText = self.get('_fontArr')[0]
		// 	var popText = self.get('_fontArr')[self.get('_fontArr').length - 1]
		// 	var popLine = self.get('_lineArr')[self.get('_lineArr').length - 1]
		// 	var popData = self.get('_data')[self.get('_data').length - 1]
		// 	//保留最后一组对象
		// 	self.get('_fontArr').pop()
		// 	self.get('_lineArr').pop()
		// 	self.get('_data').pop()

		// 	if(firstText && firstText.get('_x') < -self.get('dis_left')){
		// 		firstText.transformX(-self.get('dis_left'))
		// 	}
		// 	if (popText && (Number(popText.get('_x')) + Number(popText.getWidth())) > self.get('dis_right')) {
		// 		popText.transformX(self.get('dis_right') - popText.getWidth())
		// 	}

		// 	self._cut()

		// 	//处理倒数第二组对象
		// 	var font = self.get('_fontArr')[self.get('_fontArr').length - 1]
		// 	if (font && popText && self.get('_lineArr')[self.get('_lineArr').length - 1]) {
		// 		if (Number(font.get('_x')) + Number(font.getWidth()) + Number(self.get('_disX')) > popText.get('_x')) {
		// 			self.get('element').removeChild(font.element)
		// 			var line = self.get('_lineArr')[self.get('_lineArr').length - 1]
		// 			self.get('element').removeChild(line.element)
		// 			self.get('_data').pop()
		// 		}
		// 	}
		// 	self.get('_data').push(popData)

		// 	S.log(S.now())
		// },

		// _cut:function(){
		// 	var self = this
		// 	for (var a = 0, al =  self.get('_fontArr').length; a < al; a++ ) {
		// 		var pre = self.get('_fontArr')[a]
		// 		var later = self.get('_fontArr')[a + 1]
		// 		if (later) {
		// 			if(Number(pre.get('_x')) + Number(pre.getWidth()) + Number(self.get('_disX')) > later.get('_x')){
		// 				self.get('element').removeChild(later.element)
		// 				self.get('_fontArr').splice(a + 1, 1)
		// 				var line = self.get('_lineArr')[a + 1]
		// 				self.get('element').removeChild(line.element)
		// 				self.get('_lineArr').splice(a + 1, 1)
		// 				self.get('_data').splice(a + 1, 1)
		// 				self._cut()
		// 				break;
		// 			}
		// 		}
		// 	}
		// }
	});

	return Horizontal;

	}, {
	    requires:['base','node','../utils/global','../utils/svgelement','../utils/svgrenderer','../views/svggraphics']
	}
);