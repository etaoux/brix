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