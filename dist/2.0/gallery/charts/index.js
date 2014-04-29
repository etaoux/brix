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

		Charts.superclass.constructor.apply(self, arguments);

		self.resizeFn = function(e){self.resize()};

		S.one(window).on('resize',self.resizeFn);

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
			value : 'brix/gallery/charts/js/case'        //case.js   svg版本主入口
		},
		url_swf:{
			value : 'brix/gallery/charts/as/case'        //case.swf  swf版本主入口
		},
		path_swf:{
			value : Brix.basePath + 'brix/'+ Brix.fixed +'gallery/charts/as/case.swf'
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
			value :0
		},
		_actionsObject:{                   
			value :{
				name:'',
				value:''
			}
		},
		_isDestroy:{
			value : false
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
				if(S.UA.ie > 8){
					isSWF = 0
				}
			}

			isSWF = self._isSWF()

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
	    			if(self.get('_isDestroy')){
	    				return
	    			}
	    			self.set('_case', new Case({
	    				path : self.get('path_swf'),
	    				parent_id : self.get('swfDiv_id'),
	    				config : self.get('config')
	    			}))
	    		})
	    	}else{
	    		S.use(self.get('url_svg'),function(S,Case){
	    			if(self.get('_isDestroy')){
	    				return
	    			}
	    			self.set('_case', new Case({
	    				parent_id : self.get('mainDiv_id'),
	    				configData : self.get('config').configData,
	    				chartData : self.get('config').chartData
	    			})) 
	    			self.get('_case').on('elementClick',function($o){
	    				self.fire('elementClick', $o)
	    			})
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
			self.get('_actionsObject').name = $name, self.get('_actionsObject').value = $value

			self._setDivStyle()
			var _laterStatus = self._laterStatus;
			if(_laterStatus){
				_laterStatus.cancel();
				self._laterStatus = null;
			}

			var status
			if(self.get('_case')){
				status = self.get('_case').actions($name,$value)
			}

			if(!status){
				self._laterStatus = S.later(function(){
					if(self.get('_isDestroy')){
		    				return
		    		}
					self.actions($name,$value)
				},250)
			}
		},

		resize:function(){
			var self = this
			self.set('_resize_index',self.get('_resize_index') + 1)
			if(self.get('_resize_index') % 2 == 0){
				if(self.get('w') == $('#' + self.get('parent_id')).width() && self.get('h') == $('#' + self.get('parent_id')).height()){
					return
				}
				self._setDivStyle()
				if(!isSWF){
					if(self.get('_case')){
						self.get('_case').actions('reset')
					}
				}
			}
		},
		destroy:function(){
			var self = this;
			var _laterStatus = self._laterStatus;
			if(_laterStatus){
				_laterStatus.cancel();
				self._laterStatus = null;
			}

			self.set('_isDestroy', true)
			if(self.get('_case')){
				self.get('_case').actions('destroy')
			}
			$('#' + self.get('parent_id')).empty();
			S.one(window).detach('resize',self.resizeFn);
		},

		_setDivStyle:function(){
			var self = this
			self.set('w',$('#' + self.get('parent_id')).width())
			self.set('h',$('#' + self.get('parent_id')).height())
				
	    	var style = {'width':self.get('w'), 'height':self.get('h'), 'position':'relative'}
	    	self.get('mainDiv').css(style);

			if(isSWF){
	    		var style = {'width':self.get('w'), 'height':self.get('h')}
	    		self.get('swfDiv').css(style);
			}
		},

		_isSWF:function(){
			var self = this
			var o = self._xml(self.get('config').configData)
			var arr = ['scatter']
			// var arr = []
			for(var a = 0, al = arr.length; a<al; a++){
				if(o.type == arr[a]){
					return 1
				}
			}
			if(self.get('appear_mode') == 'flash'){
				return 1
			}
			
			return isSWF
		},

		_xml:function($data){
			var self = this
			var o = {type:''}
			// var domParser = new DOMParser();
			// var xmlDoc = domParser.parseFromString($data, 'text/xml');
			var xmlDoc = KISSY.all(KISSY.parseXML($data))
			var type = xmlDoc.all('chart').attr('type')
			o.type = type ? type : ''

			return o
		}
	});

	return Charts;

	}, {
	    requires:['base','node']
	}
);

/*
    (*) 代表对外接口中用这个
	js  as 不同
    
    颜色    fill         color(*)
    透明度  opacity(*)    alpha

*/


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
	*
	*  版本:1.0.6
	*  日期:2013.03.05
	*  内容:
	*       新增：综合2、综合3、综合4、综合5 4副图表(flash)
	*
	*  版本:1.0.7
	*  日期:2013.05.10
	*  内容:
	*       新增：综合2、综合3、综合4、综合5 4副图表(svg)
	*
	*  版本:1.0.8
	*  日期:2013.05.29
	*  内容:
	*       新增：饼图、中国地图、直方图部分功能(仅svg支持)
	*             横向直方图(仅svg支持)
	*
	*  版本:1.0.9
	*  日期:2013.06.04
	*  内容:
	*       新增：强制使用flash渲染接口
	*
	*  版本:1.1.0
	*  日期:2013.06.05
	*  内容:
	*       优化：line2  第一个数据多 第二个数据少
	*             bar    解析xml String时  去掉空格回车等
	*
	*  版本:1.1.1
	*  日期:2013.06.05
	*  内容:
	*       优化：line  只有一个数据的情况
	*
	*  版本:1.1.2
	*  日期:2013.06.09
	*  内容:
	*       优化：map  调整list与map间距
	*
	*  版本:1.1.3
	*  日期:2013.06.18
	*  内容:
	*       解决：histogram2 显示比例为-1的情况
	*
	*  版本:1.1.4
	*  日期:2013.06.19
	*  内容:
	*       优化：integrate5  只有一个数据的情况
	*
	*  版本:1.1.5
	*  日期:2013.06.21
	*  内容:
	*       优化：ie8+ 显示svg
	*
	*  版本:1.1.6
	*  日期:2013.06.25
	*  内容:
	*       优化：部分图表纵轴数据区间算法更改
	*
	*  版本:1.1.7
	*  日期:2013.07.10
	*  内容:
	*       新增：integrate4折线颜色配置
	*
	*  版本:1.1.8
	*  日期:2013.07.12
	*  内容:
	*       优化：integrate4饼图信息全显
	*
	*  版本:1.1.9
	*  日期:2013.08.26
	*  内容:
	*       新增：pie 列表中显示数值等(直通车三期)(仅svg支持)
	*
	*  版本:1.2.0
	*  日期:2013.09.03
	*  内容:
	*       新增：histogram3 横向直方图2(直通车三期)(仅svg支持)
	*
	*  版本:1.2.1
	*  日期:2013.09.18
	*  内容:
	*       新增：防止将节点添加在body
	*
	*  版本:1.2.2
	*  日期:2013.09.23
	*  内容:
	*       解决：destroy时一个小bug
	*
	*  版本:1.2.1
	*  日期:2013.09.25
	*  内容:
	*       新增：pie 列表中显示数值等(直通车三期)(flash)
	*             histogram3 横向直方图2(直通车三期)(flash)
	*
	*  版本:1.2.2
	*  日期:2013.10.10
	*  内容:
	*       优化：数组计算返回比例的算法 这次主要针对饼图(flash + svg)
	*       解决：ie9 ie10下排序的问题(svg)  flash无此问题
	*
	*  版本:1.2.3
	*  日期:2013.10.14
	*  内容:
	*       解决：饼图中所有数据都为0 不展现的情况(svg)  flash无此问题
	*
	*  版本:1.2.4
	*  日期:2013.10.15
	*  内容:
	*       优化：actions时的代码逻辑 取消状态值(svg)
	*       解决：cannot call method actions错误(svg)
	*
	*  版本:1.2.5
	*  日期:2013.10.23
	*  内容:
	*       优化：line datasection 同步svg(flash)
	*
	*  版本:1.2.6
	*  日期:2013.10.28
	*  内容:
	*       新增：map 取消index对应关系 同步svg(flash)
	*
	*  版本:1.2.7
	*  日期:2013.11.20
	*  内容(品牌时效 巴韶):
	*       新增：百分比算法不再取整 可以配置小数点后面N位   (flash + svg)
	*             饼图配置：坐标，大小，list坐标             (flash + svg)
	*
	*  版本:1.2.8
	*  日期:2013.11.22
	*  内容(直通车 思霏):
	*       新增：配置隐藏：line Y轴、X轴线条、背景坐标轴、背景Y轴   (flash + svg)
    *       配置：line 线条粗细                                      (flash + svg)
    *
   	*  版本:1.2.9
	*  日期:2013.11.27
	*  内容(直通车 思竹):
	*       新增：饼图 点击事件(svg)
	*   	
	*  版本:1.3.0
	*  日期:2013.12.10
	*  内容:
	*       新增：同步svg功能(flash)
	*             直方图、直方图2、综合图、折线图、折线图(双日期)、折线图(双指标)、饼图、地图
	*             至此所有flash版本的图表与svg版本的图表功能相同
	*
	*  版本:1.3.1
	*  日期:2013.12.20
	*  内容(tanx ssp 川溪):
	*       新增：line2 integrate5 新增功能及接口(flash + svg)
	*
	*  版本:1.3.2
	*  日期:2013.12.31
	*  内容(tanx ssp 川溪):
	*       新增：histogram4 新图(svg)
    *
	*  版本:1.3.2
	*  日期:2014.01.07
	*  内容(tanx ssp 川溪):
	*       新增：histogram4 新图(flash)
	*
	*  版本:1.3.3
	*  日期:2014.01.09
	*  内容:
	*       优化：histogram4 调整两根柱子比例
	*
	*  版本:1.3.4
	*  日期:2014.01.09
	*  内容:
	*       新增: histogram4  info中显示后缀的接口
	*             line        y轴显示所有字段都为整数的接口 
	*
	*  版本:1.3.5
	*  日期:2014.03.28
	*  内容(DMP 崇志):
	*       新增：scatter  扩展比例等(flash)
	*
    *  版本:1.3.6
	*  日期:2014.03.28
	*  内容(DMP 崇志):
	*       新增：Chrome 下scatter 走flash
	*
	*  版本:1.3.6
	*  日期:2014.03.30
	*  内容(DMP 崇志):
	*       新增：scatter x轴为非数字的情况处理
	*			  scatter 隐藏x轴接口
	*
	*  版本:1.3.7
	*  日期:2014.03.31
	*  内容(DMP 崇志):
	*       新增：scatter x轴如果不显示 但也预留位置
	*
	*  版本:1.3.8
	*  日期:2014.04.02
	*  内容(钻展 金台):
	*       新增：integrate5 开通两个接口对core的操作：y、h  (flash + svg)
	*
	*  版本:1.3.9
	*  日期:2014.04.08
	*  内容:
	*       优化：line2  只有一个数据的情况 (flash + svg)
 */


/*
   是否需要文字类型接口
 */