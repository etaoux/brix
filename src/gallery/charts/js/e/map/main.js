KISSY.add('brix/gallery/charts/js/e/map/main',function(S,Base,Global,SVGElement,Widget,List,DataParse,DataTrim,ConfigParse,EventType){
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
			value:[]            //渲染完之后的数据集合
		},

		_widget:{
			value:null
		},
		_list:{
			value:null
		},
		_dis:{
			value:120
		}
	}

	S.extend(Main,Base,{
		init:function(){
			var self = this
			
			self.set('_DataSource', new DataParse().parse(self.get('data'))) 
			self.set('_config', new ConfigParse().parse(self.get('config')))
			self.get('_DataSource').data = new DataTrim().parse(self.get('_DataSource').values.data,self.get('_config'))
			self._widget()	
		},

		_widget:function(){
			var self = this
			var config = self.get('_config')   
			
			self.set('_main',new SVGElement('g'))
			self.get('_main').attr({'class':'main'});
			self.get('parent').appendChild(self.get('_main').element)
			self.get('_main').transformXY(Global.N05, Global.N05)

			var w =  self.get('w'), h = self.get('h')
			if(config.list.is){
				w = w - self.get('_dis')
				self.set('_list', new List({parent:self.get('_main')}))
			}

			var o = {}
			o.parent = self.get('_main')                       //SVGElement
			o.w = w                                            //chart 宽
			o.h = h                                            //chart 高
			o.DataSource = self.get('_DataSource')             //图表数据源
			o.config = config                                  //图表配置
			self.set('_widget', new Widget(o))
			self.get('_widget').get('element').on(EventType.OVER,function($o){self._overHandler($o)})
			self.get('_widget').get('element').on(EventType.OUT,function($o){self._outHandler($o)})
			self.get('_widget').get('element').on(EventType.COMPLETE,function($o){self._completeHandler($o)})
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
						arr[a].push({content:o.order, bold:1, fill:config.list.font.fill.normal, size:12, ver_align:3})
						arr[a].push({content:o.name,  bold:1, fill:config.list.font.fill.normal, size:12, ver_align:1})
						arr[a].push({content:o.scale, bold:1, fill:config.list.font.fill.normal, size:12, ver_align:3})
					}
				}
			}
			return arr
		},

		_completeHandler:function(){
			var self = this
			var config = self.get('_config')
			if(config.list.is){
				self.set('_data', self.get('_widget').getData())

				// self.set('_list', new List())
				var o = {
					parent : self.get('_main'),
					data   : self._getInfo()
				}
				self.get('_list').widget(o)
				var w =  self.get('w'), h = self.get('h')
				var x = self.get('_widget').getMap().get('element').get('_x')
				x =  w - self.get('_dis') - x + 30
				var y = (h - self.get('_list').get('h')) / 2
				x = Global.ceil(x), y = Global.ceil(y)
				self.get('_list').get('element').transformXY(x,y)
			}
		},

		_overHandler:function($o){
			var self = this
			var config = self.get('_config')
			if(self.get('_list')){
				var o = $o
				o.is = 1
				o.index = Number($o.order) - 1
				o.mode  = 2
				o.fill  = config.list.font.fill.over
				self.get('_list').induce(o)
			}
		},
		_outHandler:function($o){
			var self = this
			if(self.get('_list')){
				var o = $o
				o.is = 0
				o.index = Number($o.order) - 1
				o.mode  = 2
				self.get('_list').induce(o)
			}
		},
	});

	return Main;

	}, {
	    requires:['base','../../pub/utils/global','../../pub/utils/svgelement','./view/widget','../../pub/views/list/graphs','../../pub/controls/map/dataparse','../../pub/controls/map/datatrim','../../pub/controls/map/configparse','../../pub/models/eventtype']
	}
);