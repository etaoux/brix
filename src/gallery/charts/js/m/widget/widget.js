KISSY.add('brix/gallery/charts/js/m/widget/widget',function(S,Base,Node,SVGElement){
	var $ = Node.all

	function Widget(){
		
		var self = this

		/*
			arguments:

			  o:{
				parent_id:''     //div id
				w        :100    //div 宽
				h        :100    //div 高
				type     :''     //图表类型[histogram = 直方图  |  line =  ]
				config   :''     //图表配置
				data     :''     //图表数据  
			  }

		 */
		Widget.superclass.constructor.apply(self,arguments);

		self.init()
	}

	Widget.ATTRS = {

		path_chart:{
			value:''             //图表路径[brix/gallery/charts/js/e/***/main]
		},

		_FileType:{              //文件类型
			value:{
				histogram : 'histogram',
				histogram2: 'histogram2',
				integrate : 'integrate',
				integrate2: 'integrate2',
				integrate3: 'integrate3',
				integrate4: 'integrate4',
				integrate5: 'integrate5',
				line      : 'line',
				line2     : 'line2',
				line3     : 'line3',
				pie       : 'pie',
				scatter   : 'scatter',
				map       : 'map',
				treemap		:'treemap',
				treemap2		:'treemap2'
			}
		},

		_svg:{
			value:null           //svg主节点
		},
		_main:{
			value:null           //main节点
		}
	}

	S.extend(Widget,Base,{
		init:function(){
			var self = this

			if(!self.get('type')){
				self.set('type', self.get('_FileType').histogram)
			}
			self.set('path_chart', self._getPath(self.get('_FileType')[self.get('type')]))
			self._widget()
		},

		_widget:function(){
			var self = this

			//展现
			S.use(self.get('path_chart'),function(S,Main){
				//删除svg内容
				var parent = $('#' + self.get('parent_id')).getDOMNode()
				if(parent && parent.lastChild) {parent.removeChild(parent.lastChild)}    

				self.set('_svg',new SVGElement('svg'))
				self.get('_svg').attr({'version':'1.1','width':self.get('w'),'height':self.get('h'),'xmlns':'http://www.w3.org/2000/svg', 'xmlns:xlink':'http://www.w3.org/1999/xlink'});
				//'zoomAndpan':"disable"    //禁止鼠标右键面板
	  			$('#' + self.get('parent_id')).append(self.get('_svg').element)
	  			self.get('_svg').set('style','cursor:default'), self.get('_svg').mouseEvent(false)

				var o = {}
				o.parent = self.get('_svg')                        //SVGElement
				o.w = self.get('w')                                //chart 宽
				o.h = self.get('h')                                //chart 高
				o.type = self.get('type')                          //图表类型
  				o.config = self.get('config')                      //配置
  				o.data = self.get('data')                          //图表数据

				self.set('_main',new Main(o))
			})
		},

		//获取图表js路径
		_getPath:function($name){
			var self = this
			return 'brix/gallery/charts/js/e/' + $name + '/' + 'main'
		}
	});

	return Widget;

	}, {
	    requires:['base','node','../../pub/utils/svgelement']
	}
);