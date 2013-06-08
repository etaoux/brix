KISSY.add('brix/gallery/charts/js/pub/views/layouts/style1/main',function(S,Base,Node,Global,SVGElement,SVGGraphics,PieInfo){
	var $ = Node.all

	function Main(){
		
		var self = this

		/*
			arguments:

			  o:{
				parent    :''     //SVGElement
				w         :100    //宽
				h         :100    //高
				config    :{}     //配置
			  }

		 */
		Main.superclass.constructor.apply(self,arguments);

		// self.init()
	}

	Main.ATTRS = {
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
		txtStartIndex:{
			value:0
		},

		font:{
			value:{
				family:'微软雅黑',
				fill:'#ADADAD',
				size:12
			}
		},

		infos:{                         //右上角信息
			value:null
		},
		x_txt:{                         //横轴文本
			value:null
		},
		y_txt:{                         //纵轴文本
			value:null
		}
	}

	S.extend(Main,Base,{
		init:function(){
			var self = this
			Main.superclass.constructor.apply(self,arguments);

			self.set('element', new SVGElement('g')), self.get('element').set('class','layouts_style1')
			// self.get('element').set('style','cursor:default'), self.get('element').mouseEvent(false)
			self.get('parent').appendChild(self.get('element').element)

			self._widget()
		},

		_widget:function(){
			var self = this
			var element = self.get('element')
			var font = self.get('font')

			self._createInfos()

			var txt = SVGGraphics.text({'family':font.family,'fill':font.fill,'content':self.get('config').xAxis.name})
			self.set('x_txt',new SVGElement('g')), self.get('x_txt').set('class','x_txt')
			self.get('x_txt').appendChild(txt.element)
			element.appendChild(self.get('x_txt').element)
			txt.transformXY(0,txt.getHeight())

			var txt = SVGGraphics.text({'family':font.family,'fill':font.fill,'content':self.get('config').yAxis.name})
			self.set('y_txt',new SVGElement('g')), self.get('y_txt').set('class','y_txt')
			self.get('y_txt').appendChild(txt.element)
			element.appendChild(self.get('y_txt').element)
			txt.transformXY(0,txt.getHeight())
		},

		_createInfos:function(){
			var self = this
			var data = self.get('data')

			// data[0] = {pie: { data:[300, 100], fills:['#ff0000', '#ffff00'] }, info:[]}
			// data[0].info = test()
			// data[1] = {pie: { data:[100, 300], fills:['#135ebf', '#78a64b'] }, info:[]}
			// data[1].info = test()
			
			// function test(){
			// 	var data
			// 	var o = {}
			// 	o.content = '2012-12-21', o.bold = 1, o.fill = '#333333', o.size = 12, o.ver_align = 1
			// 	data = []
			// 	data[0] = []
			// 	data[0].push(o)
				
			// 	o = {}
			// 	o.content = '智能优化40%', o.bold = 0, o.fill = '#135ebf', o.sign = {has:1,trim:1,fill:'#135ebf' }
			// 	data[1] = []
			// 	data[1].push(o)
				
			// 	o = {}
			// 	o.content = '品牌展位60%', o.bold = 0, o.fill = '#78a64b', o.sign = {has:1,trim:1,fill:'#78a64b' }
			// 	data[2] = []
			// 	data[2].push(o)
			// 	return data
			// }

			if(data.length == 0){
				return
			}

			self.set('infos', new SVGElement('g')), self.get('infos').set('class','infos')
			self.get('element').appendChild(self.get('infos').element)

			var pieInfos = []
			for (var a = 0, al = data.length; a < al; a++ ) { 
				var o = data[a]
				var pieInfo = new PieInfo()
				pieInfo.init({data:o, parent:self.get('infos'),txtStartIndex:self.get('txtStartIndex')})
				pieInfos.push(pieInfo)

				var pre
				if (a >= 1) {
					pre = pieInfos[a-1]
				}
				if (pre) {
					var x = pieInfo.get('element').get('_x') ? pieInfo.get('element').get('_x') : 0
					pieInfo.get('element').transformX(Number(x) + Number(pre.get('w')) + 20)
					var w = Number(x) + Number(pre.get('w')) + Number(20)
				}
			}

			var last = pieInfos[a - 1]
			var w = Number(last.get('element').get('_x')) + Number(last.get('w'))
			self.get('infos').setDynamic('w',w)
		}
	});

	return Main;

	}, {
	    requires:['base','node','../../../utils/global','../../../utils/svgelement','../../../views/svggraphics','../../../views/modules/pieinfo/main'
	    ]
	}
);