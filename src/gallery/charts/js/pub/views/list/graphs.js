KISSY.add('brix/gallery/charts/js/pub/views/list/graphs',function(S,Base,node,Global,SVGElement,SVGRenderer,SVGGraphics,Info){
	
	function List(){
		
		var self = this

		List.superclass.constructor.apply(self,arguments);

		self.init()
	}

	List.ATTRS = {
		w:{
			value:0
		},
		h:{
			value:0
		},
		data:{
			value:[]
		},
		element:{
			value:null
		},

		_info:{
			value:null
		}
	}			

	S.extend(List,Base,{
		init:function(){
			var self = this
			List.superclass.constructor.apply(self,arguments);
			
			self.set('element', new SVGElement('g')), self.get('element').set('class','list')
			self.get('element').setDynamic('childs',[])
			self.get('parent').appendChild(self.get('element').element)
		},

		induce:function($o,$b){
			var self = this
			if (self.get('_info')) {
				self.get('_info').moveRowTxt($o)
			}
		},

		widget:function(){
			var self = this
			List.superclass.constructor.apply(self,arguments);
			self._widget()
		},

		_widget:function(){
			var self = this
			var w = self.get('w'), h = self.get('h') 
			var _info
			var data = self.get('data')
			//data = self._test()

			if(data.length){
				self.set('_info', new Info())
				_info = self.get('_info')

				var o = {
					data   : data,
					parent : self.get('element'),
					isBack : 0,
					hor_dis: 3,
					ver_dis: 5
				}
				_info.init(o)

				w = Math.floor(_info.get('w') / 2), h = Math.floor(_info.get('h') / 2)
				_info.get('element').transformXY(w, h)

				w = _info.get('w'), h = _info.get('h')
				self.set('w', w), self.set('h', h)
			}

			// var induce = self._drawGraph({w:w,h:h,opacity:0.4})
			// self.get('element').appendChild(induce.element)
		},

		/*
		_test:function(){
			var data = []
			data = test()

			function test(){
				var data = []
				data[0] = []
				data[1] = []
				// data[2] = []
				
				var o = {}
				o.content = '1', o.bold = 1, o.fill = '#333333', o.family = '微软雅黑', o.size = 12, o.ver_align = 3
				data[0].push(o)
				o = {}
				o.content = '浙江', o.bold = 1, o.fill = '#333333', o.family = '微软雅黑', o.size = 12, o.ver_align = 1
				data[0].push(o)
				o = {}
				o.content = '22%', o.bold = 1, o.fill = '#333333', o.family = '微软雅黑', o.size = 12, o.ver_align = 3
				data[0].push(o)
				
				o = {}
				o.content = '12', o.bold = 1, o.fill = '#333333', o.family = '微软雅黑', o.size = 12, o.ver_align = 3
				data[1].push(o)
				o = {}
				o.content = '黑龙江', o.bold = 1, o.fill = '#333333', o.family = '微软雅黑', o.size = 12, o.ver_align = 1
				data[1].push(o)
				o = {}
				o.content = '7%', o.bold = 1, o.fill = '#333333', o.family = '微软雅黑', o.size = 12, o.ver_align = 3
				data[1].push(o)
				
				// o = {}
				// o.content = '品牌展位60%', o.bold = 0, o.fill = '#78a64b', o.family = '微软雅黑', o.sign = {has:1,trim:1,fill:'#78a64b' }
				// data[2].push(o)
				return data
			}
			return data
		},
		
	
		//画支柱
		_drawGraph:function($o){
			var w = $o.w,h = $o.h,fill = $o.fill ? $o.fill : '#000000',opacity = $o.opacity ? $o.opacity : 1
			var d = SVGRenderer.symbol('square',0,0,w,h).join(' ')
			var p = new SVGElement('path')
			p.attr({'_w':w,'_h':h,'d':d,'fill':fill,'opacity':opacity})
			return p
		},*/
	});

	return List;

	}, {
	    requires:['base','node','../../utils/global','../../utils/svgelement','../../utils/svgrenderer','../svggraphics','../infos/info']
	}
);