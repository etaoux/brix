# Brix

基于淘宝 [Kissy1.3](http://kissyui.com)框架的一淘通用组件框架。

##如何使用

	<link type="text/css" rel="stylesheet" href="http://a.tbcdn.cn/apps/e/brix/1.0/brix-min.css" charset="utf-8">
	<script type="text/javascript" src="http://a.tbcdn.cn/s/kissy/1.3.0/seed-min.js"></script>
	<script type="text/javascript" src="http://a.tbcdn.cn/apps/e/brix/1.0/brix-min.js" bx-config="{autoPagelet:true}"></script>
	<script type="text/javascript">
		//业务代码,自动构建
		KISSY.ready(function(S){
			//pagelet自动构建完成
			Brix.ready(function(){
				//pagelet的实例
				Brix.pagelet.ready(function(){
					//拿到组件实例
					var brick = Brix.pagelet.getBrick('#id');
				});
			});
		});
		//业务代码，手动构建
		/*
		KISSY.ready(function(S){
			S.use('brix/core/pagelet',function(S,Pagelet){
				var config = {tmpl:'body'};
				var pagelet = new Pagelet(config);
			});
		});
		*/
	</script>


## 组件库核心

* brix.js : 框架的配置入口类
* chunk.js : `brick.js` 和 `pagelet.js` 类的父类
* tmpler.js : 模板解析类，用 `xtemplate` 渲染。
* dataset.js : 数据管理类，数据变化时，通知模板引擎更新
* brick.js : 组件基类，所有组件继承此类
* pagelet.js : 组件管理器，对组件实现渲染
* demolet.js : demo组件管理器，根据业务组件的data.json和template.html显示预览

## 类关系图

![Brix 类关系图](http://img01.taobaocdn.com/tps/i1/T1_8g2XjVaXXcMABjZ-1027-1025.png)

## 组件钩子

* bx-name : 组件名称
* bx-path : 组件地址，一般是包名 + 文件路径,核心组件可以省略配置
* bx-config : 组件配置，动态渲染时候的参数
* bx-tmpl : 组件模板，这个钩子和 `bx-datakey`组合使用，在数据更新时对模板重新渲染。具体写法详见: [core/brix.html](https://github.com/etaoux/brix/blob/master/demo/core/brix.html)
* bx-datakey : 组件数据对象 key 值，可以有多个 key，以 `,` 分割，且支持对象的子对象，如 “X.Y,Z.Y.X”


## 开发环境需求

* [Node.js](http://nodejs.org) 0.8+
* [NPM](https://npmjs.org)
* [grunt](https://github.com/cowboy/grunt)
* [grunt-less](https://github.com/jharding/grunt-less)

## 开发

```bash
git clone git://github.com/etaoux/brix.git
cd brix
# 安装 Grunt
npm install -g grunt
npm install grunt-less
# 使用 Grunt 运行 js和less 自动监视文件变化编译,windows系统grunt.cmd
grunt
```

## 目录结构
* demo : 组件开发的demo目录，一般存放静态的html文件，名称以组件名命名。
* dist : 工具打包生成的目标目录，不用人为进行编辑。
* src  : 源文件目录，你懂的；组件存放在gallery，再以组件名命名的组件目录，组件的js文件是以index.js命名，如下拉框组件：gallery/dropdown/index.js
* tasks : 存放打包脚本目录
* tools : 辅助工具目录

## 说明
* 组件开发使用一般使用到src, demo两个目录， src是组件的源代码目录，进入目录后，再选择gallery还是style，同时开发时的demo文件存放在demo目录，对应gallery或style。这两个目录是直接提交到master分支。
* 文档是在gh-pages-source分支，主要是操作_post目录，gallery组件直接放在_post/gallery目录下; style放在_post/style目录下。
* gh-pages-source分支下不要去修改src与demo目录，提交也是无效的。
* 组件中使用到的图片，都传到tps中，项目中直接使用链接地址。




