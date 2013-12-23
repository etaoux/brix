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