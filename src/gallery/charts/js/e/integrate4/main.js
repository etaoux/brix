KISSY.add('brix/gallery/charts/js/e/integrate4/main',function(S,Base,Global,SVGElement,DataParse,ConfigParse,Widget){
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
			config.line.areaMode = 1
			config.line.areaAlphas = [0.4, 0.4]
			config.line.isLine = 1
			config.line.fills = self._changeConfig(config.line.fills)
		//	config.line.fills = [[ { normal:'#94CC5C', over:'#78A64B' }, { normal:'#458AE6', over:'#135EBF' } ]]
			config.line.data = {mode:1}
			return config
		},
		

		_changeConfig:function($fills){
			var arr = []
			arr[0] = []

			var normals = ['#458AE6', '#39BCC0', '#5BCB8A', '#94CC5C', '#C3CC5C', '#E6B522', '#E68422']
			var overs = ['#135EBF', '#2E9599', '#36B26A', '#78A64B', '#9CA632', '#BF9E39', '#BF7C39']
			if($fills.normals.join(" ") == normals.join(" ") && $fills.overs.join(" ") == overs.join(" ")){
				arr = [[ { normal:'#94CC5C', over:'#78A64B' }, { normal:'#458AE6', over:'#135EBF' } ]]
				return arr
			}

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