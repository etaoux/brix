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
		showMode:{
			value:0             //显示模式(0 = 显示删减后的数据 | 1 = 显示未删减的数据)
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

			if (self.get('showMode') == 1) {
				arr = self.get('data')
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