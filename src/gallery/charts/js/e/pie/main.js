KISSY.add('brix/gallery/charts/js/e/pie/main',function(S,Base,Global,SVGElement,DataParse,ConfigParse,EventType,Widget,List){
	function Main(){

		var self = this

		/*
			arguments:

			  o:{
				parent   :''     //SVGElement
				w        :100    //chart 宽
				h        :100    //chart 高
				config   :''     //图表配置
				data     :''     //图表数据  
			  }

		 */
		Main.superclass.constructor.apply(self,arguments);

		self.init()
	}

	Main.ATTRS = {
		_main:{
			value:null
		},
		_config:{                //图表配置   经过ConfigParse.parse
			value:{}
		},
		_DataSource:{
			value:{}             //图表数据源 经过DataParse.parse
		},
		_data:{
			value:[]             //渲染完之后的数据集合
		},

		_widget:{
			value:null
		},
		_list:{
			value:null
		}
	}

	S.extend(Main,Base,{
		init:function(){
			var self = this
			
			self.set('_DataSource', new DataParse().parse(self.get('data'))) 
			self.set('_config', new ConfigParse().parse(self.get('config'))) 

			self._widget()	
		},

		_widget:function(){
			var self = this
			var config = self.get('_config')   

			self.set('_main',new SVGElement('g'))
			self.get('_main').attr({'class':'main'});
			self.get('parent').appendChild(self.get('_main').element)
			self.get('_main').transformXY(Global.N05,Global.N05)

			var w =  self.get('w'), h = self.get('h')
			if(config.list.is){
				w = w - 120
				self.set('_list', new List({parent:self.get('_main')}))
			}

			var tmpW = w, tmpH = h
			if(config.w){
				tmpW = config.w
			}
			if(config.h){
				tmpH = config.h
			}

			var o = {}
			o.parent = self.get('_main')                       //SVGElement
			o.w = tmpW                                         //chart 宽
			o.h = tmpH                                         //chart 高
			o.maxW = self.get('w')                             //chart最大宽 当配置w h 时使用该值给infos
			o.maxH = self.get('h')                             //chart最大高 当配置w h 时使用该值给infos
			o.DataSource = self.get('_DataSource')             //图表数据源
			o.config = self.get('_config')                     //图表配置
			self.set('_widget', new Widget(o))
			self.get('_widget').get('element').on(EventType.OVER,function($o){self._overHandler($o)})
			self.get('_widget').get('element').on(EventType.OUT,function($o){self._outHandler($o)})
			self.get('_widget').get('element').on(EventType.CLICK,function($o){self._clickHandler($o)})

			var widget = self.get('_widget')
			var pie = self.get('_widget').getPie()
			if(config.x){
				// pie.get('element').transformX(config.x)
				widget.setTransformX(config.x)
			}else if(config.list.is){
				// pie.get('element').transformX(parseInt((self.get('w') - 120) / 2))
				widget.setTransformX(parseInt((self.get('w') - 120) / 2))
			}else{
				// pie.get('element').transformX(parseInt(self.get('w') / 2))
				widget.setTransformX(parseInt(self.get('w') / 2))
			}

			if(config.y){
				// pie.get('element').transformY(config.y)
				widget.setTransformY(config.x)
			}else if(config.list.is){
				// pie.get('element').transformY(parseInt(self.get('h') / 2))
				widget.setTransformY(parseInt(self.get('h') / 2))
			}else{
				// pie.get('element').transformY(parseInt(self.get('h') / 2))
				widget.setTransformY(parseInt(self.get('h') / 2))
			}
			if(config.list.is){
				self.set('_data', self.get('_widget').getData())
				
				var o = {
					parent : self.get('_main'),
					data   : self._getInfo()
				}
				self.get('_list').widget(o)
				
				var x = Number(pie.get('element').get('_x')) + Number(pie.get('mw') / 2) + 16
				var y = (h - self.get('_list').get('h')) / 2
				x = Global.ceil(x), y = Global.ceil(y)

				if(config.list.x){
					self.get('_list').get('element').transformX(config.list.x)
				}else{
					self.get('_list').get('element').transformX(x)
				}

				if(config.list.y){
					self.get('_list').get('element').transformY(config.list.y)
				}else{
					self.get('_list').get('element').transformY(y)
				}
				// self.get('_list').get('element').transformXY(x,y)
			}
		},

		_getInfo:function(){
			var self = this
			var config = self.get('_config')
			var data = self.get('_data').order
			var arr = []
			for (var a = 0, al = data.length; a < al; a++ ) {
				var o = data[a]

				if(o && o.order){

					if(!config.list.max || config.list.max > a){
						arr[a] = []
						arr[a].push({content:o.name, bold:1, fill:'#333333', size:12, ver_align:3, sign: { has:1, trim:1, fill:o.normal, disX:8}})
						var content = o.scale
						if(config.list.content.mode == 1){
							var content = o.data
						}
						arr[a].push({content:content, bold:1, fill:'#333333', size:12, ver_align:3})
					}
				}
			}
			return arr
		},

		_overHandler:function($o){
			var self = this
			if(self.get('_list')){
				var o = $o
				o.is = 1
				self.get('_list').induce(o)
			}
		},
		_outHandler:function($o){
			var self = this
			if(self.get('_list')){
				var o = $o
				o.is = 0
				self.get('_list').induce(o)
			}
		},
		_clickHandler:function($o){
			this.fire('elementClick',$o)
		},
	});

	return Main;

	}, {
	    requires:['base','../../pub/utils/global','../../pub/utils/svgelement','../../pub/controls/pie/dataparse','../../pub/controls/pie/configparse','../../pub/models/eventtype','./view/widget','../../pub/views/list/graphs']
	}
);