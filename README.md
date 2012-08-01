# Brix

基于淘宝 [Kissy](http://kissyui.com) 框架和 [mustache](http://mustache.github.com) 模板引擎的一淘通用组件库。

## 组件库的底层包含七个文件

* chunk.js : `brick.js` 和 `pagelet.js` 类的父类
* tmpler.js : 模板解析类，用 `mustache` 渲染。
* dataset.js : 数据管理类，数据变化时，通知模板引擎更新
* brick.js : 组件基类，所有组件继承此类
* pagelet.js : 组件管理器，对组件实现层次化的渲染
* mustache.js : 模板渲染引擎
* mu.js : 对 `mustache` 模板引擎的增强

## 类关系图

![Brix 类关系图](http://img02.taobaocdn.com/tps/i2/T1ty_nXapdXXaFmrLb-907-733.png)

## 组件钩子

* bx-name : 组件名称，在同一个 `pagelet` 中唯一
* bx-path : 组件地址，一般是包名 + 文件路径
* bx-config : 组件配置，动态渲染时候的参数
* bx-datakey : 组件数据对象 key 值，可以有多个 key，以 “,” 分割，且支持对象的子对象，如 “X.Y,Z.Y.X”
* bx-tmpl : 组件模板 (值等于 `bx-name`)，这个钩子和 `bx-datakey` 组合使用，在数据更新时对模板重新渲染。
* bx-tmpl-source : 指定需要复用的源模板选择器
* bx-parent : 指定当前组件的父组件 (值等于 `bx-name`)，在渲染时，实现层次化的渲染。

## 开发环境需求

* [Node.js](http://nodejs.org) 0.8+
* [NPM](https://npmjs.org)
* [grunt](https://github.com/cowboy/grunt)
* [Less](http://lesscss.org)

## 开发

```bash
# 安装 Grunt
npm install -g grunt
npm install -g less
git clone git://github.com/etaoux/brix.git
cd brix
# 使用 Grunt 运行 Less 自动编译监视器
grunt
```