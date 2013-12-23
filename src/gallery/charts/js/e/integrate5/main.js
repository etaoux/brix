KISSY.add('brix/gallery/charts/js/e/integrate5/main',function(S,Base,Global,SVGElement,DataParse,ConfigParse,Widget){
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

			self.set('_config', self._defaultConfig(self.get('_config')))

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
		},

		_defaultConfig:function($config){
			var self = this
			var config = $config
			config.line.node = 1
			config.line.area = 1
			// config.line.shape = 1
			// config.line.areaMode = 1
			if(config.line.isArea_opacity == 0){
				config.line.area_opacity = [0.4, 0.4]
			}
			config.line.isLine = 1
			if(config.line.fills.isDefault == 1){
				config.line.fills = [[ { normal:'#458AE6', over:'#135EBF' }, { normal:'#999999', over:'#666666' } ]]
			}else{
				config.line.fills = self.changeColor(config.line.fills)
			}
			// config.line.fills = [[ { normal:'#458AE6', over:'#135EBF' }, { normal:'#999999', over:'#666666' } ]]
			return config
		},
		
		changeColor:function ($fills){
			var arr = []
			arr[0] = []
			
			for(var a = 0, al = $fills.normals.length; a < al; a++){
				var o = {normal:$fills.normals[a], over:$fills.overs[a]}
				arr[0].push(o)
			}
			return arr
		}
	});

	return Main;

	}, {
	    requires:['base','../../pub/utils/global','../../pub/utils/svgelement','../../pub/controls/bar/dataparse','./control/configparse','./view/widget']
	}
);