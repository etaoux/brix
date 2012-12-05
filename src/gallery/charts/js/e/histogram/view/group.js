KISSY.add('brix/gallery/charts/js/e/histogram/view/group',function(S,Base,node,Global,SVGElement,SVGRenderer,SVGGraphics,EventType){
	
	function Group(){
		
		var self = this

		Group.superclass.constructor.apply(self,arguments);
	}

	Group.ATTRS = {
		index:{
			value:0              //索引
		},
		h:{
			value:100
		},
		data:{
			value:[]             //[{height:100,key:{iskey:0}},{}]  
		},
		element:{
			value:null
		},
		isInduce:{
			value:0              //是否作为感应区
		},
		fills:{
			value:['#458AE6', '#39BCC0', '#5BCB8A', '#C3CC5C', '#E6B522', '#E68422']   //普通色集合
		},
		fills_over:{
			value:['#135EBF','#2E9599','#36B26A','#9CA632','#BF9E39','#BF7C39']        //鼠标划入色集合
		},
		keyFill:{
			value:'#E68422'      //关键色
		},
		keyFill_over:{
			value:'#BF7C39'      //鼠标划入关键色
		},
		fill:{
			value:'#666666'      //初始颜色[线色 + 圆轮廓色]
		},
		fill_over:{
			value:'#000000'      //鼠标划入颜色[线色 + 圆轮廓色]
		},
		intX:{
			value:1               //x是否取整
		},

		disGroupX:{
			value:2              //两端相差的距离
		},
		singleW:{
			value:4              //支柱宽
		},
		disSingleX:{
			value:2              //支柱之间的距离
		},

		_induces:{
			value:null           //感应区对象g
		},
		_pillars:{
			value:null           //支柱对象g
		},
		
		_inducesArr:{
			value:[]             //感应区对象集合
		},	
		_pillarsArr:{
			value:[]             //支柱对象集合	
		},

		_minH:{
			value:2              //支柱最小高
		},
		_disInduce:{
			value:2              //当鼠标划入时增加的值
		},
		_isOver:{
			value:0              //鼠标是否有移动到
		},		
		_fill:{
			value:''             //记录普通色
		},
		_fill_over:{
			value:''             //记录鼠标划入色
		}
	}	

	S.extend(Group,Base,{
		init:function(){
			var self = this
			Group.superclass.constructor.apply(self,arguments);
			
			self.set('element', new SVGElement('g'))//, self.get('element').set('id',self.get('index'))
			self.get('parent').appendChild(self.get('element').element)

			self._widget()
			self._layout()
		},
		induce:function($o,$b){
			var self = this
			var pillar = self.get('_pillarsArr')[$o.id]
			self._induce(pillar,$b)
		},
		//获取每根直方信息集合 包括中心点cx 等
		getInfos:function(){
			var self = this
			var arr = [] 
			for (var a = 0, al = self.get('_pillarsArr').length; a < al; a++ ) {
				var pillar = self.get('_pillarsArr')[a]
				var cx = self.get('intX') ? Global.ceil(Number(pillar.get('_x')) + Number(pillar.get('_w') / 2)) : Number(pillar.get('_x')) + Number(pillar.get('_w') / 2)
				var o = { cx: cx}
				arr.push(o)
			}
			return arr
		},
		getNodeInfoAt:function($index){
			var self = this
			var pillar = self.get('_pillarsArr')[$index]
			var o = {}
			o.index = self.get('index'), o.id = $index
			o.x = Number(pillar.get('_x')), o.y = 0
			o.cx = self.get('intX') ? Global.ceil(Number(pillar.get('_x')) + Number(pillar.get('_w') / 2)) : Number(pillar.get('_x')) + Number(pillar.get('_w') / 2)
			o.h = -pillar.get('_h')
			o.fill = self.get('fills')[$index], o.fill_over = self.get('fills_over')[$index]
			return o
		},
		
		_widget:function(){
			var self = this
			self.set('_pillars', new SVGElement('g')), self.get('_pillars').set('class','pillars')
			self.get('element').appendChild(self.get('_pillars').element)
			self.set('_induces', new SVGElement('g')), self.get('_induces').set('class','induces')
			self.get('element').appendChild(self.get('_induces').element)
		},

		_layout:function(){
			var self = this
			var _pillars_df = document.createDocumentFragment();
			var _induces_df = document.createDocumentFragment();
			for (var a = 0, al = self.get('data').length; a < al; a++ ) {
				var o = self.get('data')[a]
				var x
				var w = self.get('singleW')
				var h = o.height
				h = h > self.get('_minH') ? h : self.get('_minH')

				x = self.get('disGroupX') + (self.get('singleW') + self.get('disSingleX')) * a
				x = self.get('intX') ? Global.ceil(x) : x

				var fill = self.get('fills')[a]
				var iskey = o.key && o.key.isKey ? o.key.isKey : ''
				fill = iskey ? self.get('keyFill') : fill

				//pillar
				var pillar = self._drawGraph({w:w,h:-h,fill:fill})           //-h
				if(self.get('isInduce') == 0){
					_pillars_df.appendChild(pillar.element)
				}
				pillar.transformX(x)
				self.get('_pillarsArr').push(pillar)
				pillar.set('_index', a)
				pillar.set('_x',x)
		
				//induce
				w = self.get('singleW') + self.get('_disInduce')
				h = self.get('h')
				var induce = self._drawGraph({w:w,h:-h,opacity:Global.N00001})
				if(self.get('isInduce') == 1){
					_induces_df.appendChild(induce.element), self.get('_inducesArr').push(induce)
				}
				induce.element.addEventListener("mouseover",function(evt){ self._overHandler(evt)}, false);
				induce.element.addEventListener("mouseout",function(evt){ self._outHandler(evt)}, false);
				x = x - self.get('_disInduce') / 2
				x = self.get('intX') ? Global.ceil(x) : x
				induce.transformX(x)
				induce.set('_index', a)
			}
			if(self.get('isInduce') == 0){
				self.get('_pillars').appendChild(_pillars_df)
			}
			if(self.get('isInduce') == 1){
				self.get('_induces').appendChild(_induces_df)
			}
		},

		//画支柱
		_drawGraph:function($o){
			var w = $o.w,h = $o.h,fill = $o.fill ? $o.fill : '#000000',opacity = $o.opacity ? $o.opacity : 1
			var d = SVGRenderer.symbol('square',0,0,w,h).join(' ')
			var p = new SVGElement('path')
			p.attr({'_w':w,'_h':h,'d':d,'fill':fill,'opacity':opacity})
			return p
		},

		_overHandler:function($evt){
			var self = this
			var index = $evt.target.getAttribute('_index')
			self.set('_isOver', 1)
			self.set('_fill', self.get('fills')[index])
			self.set('_fill_over', self.get('fills_over')[index])
			if (self.get('data')[index].key && self.get('data')[index].key.isKey) { self.set('_fill', self.get('keyFill')), self.set('_fill_over' , self.get('keyFill_over'))}
			var pillar = self.get('_pillarsArr')[index]
			// self._induce(pillar)
			
			var o = {}
			o.index = self.get('index'), o.id = index, o.x = pillar.get('_x'), o.cx = Number(o.x) + Number(self.get('singleW') / 2), o.h = -pillar.get('_h'), o.fill_over = self.get('_fill_over')
			self.get('element').fire(EventType.OVER,o)
		},
		_outHandler:function($evt){
			var self = this
			var index = $evt.target.getAttribute('_index')
			self.set('_isOver', 0)
			var pillar = self.get('_pillarsArr')[index]
			// self._induce(pillar)

			var o = {}
			o.index = self.get('index'), o.id = index
			self.get('element').fire(EventType.OUT,o)
		},

		_induce:function($e,$b){
			var self = this
			var x,y,w,h,d,fill
			var index = $e.get('_index')
			var fill
			if ($b) {
				w = Number($e.get('_w')) + Number(self.get('_disInduce')),h = Number($e.get('_h')) - Number(self.get('_disInduce'))
				x = Number($e.get('_x')) - Number(self.get('_disInduce') / 2)
				fill = self.get('fills_over')[index]
				if (self.get('data')[index].key && self.get('data')[index].key.isKey) { fill = self.get('keyFill_over')}
			}else {
				w = Number($e.get('_w')),h = Number($e.get('_h'))
				x = Number($e.get('_x')) + Number(self.get('_disInduce') / 2)
				fill = self.get('fills')[index]
				if (self.get('data')[index].key && self.get('data')[index].key.isKey) { fill = self.get('keyFill')}
			}
			d = SVGRenderer.symbol('square',0,0,w,h).join(' ')
			$e.set('d',d)
			$e.transformX(x)
			$e.set('fill',fill)
		}
	});

	return Group;

	}, {
	    requires:['base','node','../../../pub/utils/global','../../../pub/utils/svgelement','../../../pub/utils/svgrenderer','../../../pub/views/svggraphics','../model/eventtype']
	}
);