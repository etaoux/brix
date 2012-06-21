Brix
-----------
基于淘宝KISSY框架和mustache模板引擎的一淘通用组件库。

组件库的底层包含七个文件
-----------
 - chunk.js:brick和pagelet类的父类
 - tmpler.js:模板解析类，用mustache渲染。
 - dataset.js:数据管理类，数据变化时，通知模板引擎更新
 - brick.js:组件基类，所有组件继承此类
 - pagelet.js:组件管理器，对组件实现层次化的渲染
 - mustache.js:模板渲染引擎
 - mu.js:对mustache模板引擎的增强

类关系图
-----------
![brix 类关系图](http://img01.taobaocdn.com/tps/i1/T1S._mXc0gXXaFmrLb-907-733.png)

组件钩子
-----------
 - bx-brick:组件名称，在同一个pagelet中唯一
 - bx-path:组件地址，一般是包名+文件路径
 - bx-config: 组件配置，动态渲染时候的参数
 - bx-datakey:组件数据对象key值，可以有多个key，以“,”分割，且支持对象的子对象，如“X.Y,Z.Y.X”
 - bx-tmpl:组件模板(值等于bx-brick)，这个钩子和bx-datakey组合使用，在数据更新时对模板重新渲染。
 - bx-parent: 指定当前组件的父组件(值等于bx-brick)，在渲染时，实现层次化的渲染。