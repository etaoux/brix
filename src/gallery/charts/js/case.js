KISSY.add('brix/gallery/charts/js/case',function(S,Base,Node,DataSource,Widget){
	var $ = S.all

	function Case(){
		var self = this
		/*
			arguments:

			  o:{
				parent_id :''    //div id
				configData:''    //图表配置
				chartData :''    //图表数据
			  }
		 */
		Case.superclass.constructor.apply(this, arguments);

		self.init()
	}
	Case.ATTRS = {

		//图表
		chart:{
			value :{
				type:'',         //图表类型[histogram = 直方图  |  line =  ]
				config:'',       //图表配置
				data:''          //图表数据
			}
		},

		_widget:{
			value :null
		},
		_isDestroy:{
			value : false
		}
	}

	S.extend(Case,Base,{
		init:function(){
			var self = this

			var dataSource = new DataSource().parse(self.get('configData'))

			self.get('chart').type = dataSource.type
			self.get('chart').config = dataSource.data
			self.get('chart').data = self.get('chartData')

			//展现
			var o = {}
			o.parent_id = self.get('parent_id')                //div id
			o.w = $('#' + self.get('parent_id')).width()       //div 宽
			o.h = $('#' + self.get('parent_id')).height()      //div 高
			o.type = self.get('chart').type                    //图表类型
			o.config = self.get('chart').config                //配置
			o.data = self.get('chart').data                    //图表数据

			_widget = new Widget(o)
		},
		//与外部js交互总接口
		actions:function($name,$value){
			var self = this
			//下载具体某图
			if($name == 'reset'){
				var o = $value
				if(o){
					self.set('configData',o.configData)
					self.set('chartData',o.chartData)
				}
				self.reset()
				return true
			}else if($name == 'destroy'){
				self.set('_isDestroy', true)
				self.get('_widget').actions('destroy')
			}
		},
		//重新展现图表
		reset:function(){
			var self = this
			// self.remove()
			self.init()
		}
		/*
		//删除svg内容
		remove:function(){
			var self = this
			var parent = $('#' + self.get('parent_id')).getDOMNode()
			if(parent && parent.lastChild) {parent.removeChild(parent.lastChild)}                  //R3
		}
		*/
	});

	return Case;

	}, {
	    requires:['base','node','./m/datasource/datasource','./m/widget/widget']
	}
);




