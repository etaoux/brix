KISSY.add('brix/gallery/charts/index',function(S,Base,Node){
	var $ = Node.all
	var isSWF = 0
	/**
     * 图表
     * arguments:
	 * 	  o:{
	 * 		parent_id :''，    //div id
	 * 		config    :{
	 * 			configData:''//图表配置
	 * 			chartData :''//图表数据
	 * 		}
	 * 	  }
     * <br><a href="../demo/gallery/charts/charts.html" target="_blank">Demo</a>
     * @class Brix.Gallery.Charts
     */
	function Charts(){
		var self = this

		/*
			
		 */
		
		Charts.superclass.constructor.apply(self, arguments);

		S.one(window).on('resize',function(e){self.resize()});

		self.init()
	}

	Charts.ATTRS = {

		w:{
			value : 100
		},

		h:{
			value : 100
		},
		mainDiv:{
			value : null
		},
		url_svg:{
			value : 'brix/gallery/charts/js/case'    //case.js   svg版本主入口
		},
		url_swf:{
			value : 'brix/gallery/charts/as/case'        //case.swf  swf版本主入口
		},
		path_swf:{
			value : Brix.basePath + 'brix/'+Brix.fixed+'gallery/charts/as/case.swf'
		},

		mainDiv_id:{
			value : 'J_Charts_'
		},
		swfDiv:{
			value : null
		},
		swfDiv_id:{
			value : 'J_SWF_'
		},
		_case:{
			value : null
		},

		_resize_index:{                    //当为2的整数时 才resize
			value:0
		}
	}

	S.extend(Charts,Base,{
		init:function(){
			var self = this
			if(window.SVGAngle || document.implementation.hasFeature("http://www.w3.org/TR/SVG11/feature#BasicStructure", "1.1")){
				isSWF = 0
			}else{
				isSWF = 1
			}
			if(S.UA.shell == 'maxthon' || (S.UA.shell == 'ie')){
				isSWF = 1
			}
			// isSWF = 1
			self.set('w',$('#' + self.get('parent_id')).width())
			self.set('h',$('#' + self.get('parent_id')).height())

	    	self.set('mainDiv', $('<div></div>')), self.set('mainDiv_id', self.get('mainDiv_id') + self.get('parent_id'))  
	    	self.get('mainDiv').attr('id',self.get('mainDiv_id'))
	    	var style = {'width':self.get('w'), 'height':self.get('h'), 'position':'relative'}
	    	self.get('mainDiv').css(style);

	    	$('#' + self.get('parent_id')).append(self.get('mainDiv'));
	    	if(isSWF){
	    		self.set('swfDiv',$('<div></div>')), self.set('swfDiv_id', self.get('swfDiv_id') + self.get('parent_id'))
	    		self.get('swfDiv').attr('id',self.get('swfDiv_id'))
	    		var style = {'width':self.get('w'), 'height':self.get('h')}
	    		self.get('swfDiv').css(style);
	    		self.get('mainDiv').append(self.get('swfDiv'))

	    		S.use(self.get('url_swf'),function(S,Case){
	    			self.set('_case', new Case({
	    				path : self.get('path_swf'),
	    				parent_id : self.get('swfDiv_id'),
	    				config : self.get('config')
	    			}))
	    		})
	    	}else{
	    		S.use(self.get('url_svg'),function(S,Case){
	    			self.set('_case', new Case({
	    				parent_id : self.get('mainDiv_id'),
	    				configData : self.get('config').configData,
	    				chartData : self.get('config').chartData
	    			})) 
	    		})
	    	}
		},
		/**
		 * 对外api
		 * @param  {String} $name  方法名
		 * @param  {String} $value 具体参数
		 */
		actions:function($name,$value){
			var self = this
			self.get('_case').actions($name,$value)
		},

		resize:function(){
			var self = this
			self.set('_resize_index',self.get('_resize_index') + 1)
			if(self.get('_resize_index') % 2 == 0){
				self.set('w',$('#' + self.get('parent_id')).width())
				self.set('h',$('#' + self.get('parent_id')).height())
	    		var style = {'width':self.get('w'), 'height':self.get('h'), 'position':'relative'}
	    		self.get('mainDiv').css(style);

			 	if(isSWF){
	    			var style = {'width':self.get('w'), 'height':self.get('h')}
	    			self.get('swfDiv').css(style);
				}else{
					self.get('_case').actions('reset')
				}
			}
		}
	});

	return Charts;

	}, {
	    requires:['base','node']
	}
);
/*
	发布注意事项
        1.svg   flash路径
        2.flash 版本号
 */


/*
	*  版本:1.0.1
	*  日期:2012.11.28
	*  内容:
	*       优化：svg性能优化(解决firefox下卡的问题)
	*
	*  版本:1.0.2
	*  日期:2012.11.29
	*  内容:charts.js
	*       解决：兼容ie9以下版本ie  window.addEventListener
	*
	*  版本:1.0.3
	*  日期:2012.11.29
	*  内容:demo -> test_line.html
	*  		swf
	*       line -> view -> widget.js、graphs.js、group.js
	*               control -> configparse.js
	*                    
	*       新增：折线图 圆大小自定义
	*
	*  版本:1.0.4
	*  日期:2012.11.30
	*  内容:demo -> test_line.html
	*  		swf
	*       line -> view -> widget.js、graphs.js、group.js
	*               control -> configparse.js
	*                    
	*       新增：折线图 过滤数据相同的圆点
	*
	*  版本:1.0.5
	*  日期:2012.12.04
	*  内容:
	*       优化：js文件打包 去掉两个src目录
 */


/*
   是否需要文字类型接口
 */