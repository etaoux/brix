KISSY.add('brix/gallery/charts/js/e/scatter/main',function(S,Base,Global,SVGElement,Widget,DataParse,ConfigParse){
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
			
			self.set('_main',new SVGElement('g'))
			self.get('_main').attr({'class':'main'});
			self.get('parent').appendChild(self.get('_main').element)
			self.get('_main').transformXY(Global.N05,Global.N05)

			var o = {}
			o.parent = self.get('_main')                       //SVGElement
			o.w = self.get('w')                                //chart 宽
			o.h = self.get('h')                                //chart 高
			o.DataSource = self.get('_DataSource')             //图表数据源
			o.config = self.get('_config')                     //图表配置

			new Widget(o)
		}
		
	});

	return Main;

	}, {
	    requires:['base','../../pub/utils/global','../../pub/utils/svgelement','./view/widget','../../pub/controls/scatter/dataparse','../../pub/controls/scatter/configparse']
	}
);