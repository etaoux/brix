### Brix组件框架

Brix组件框架依托KISSY。在组件开发和使用上找寻了另一条途径。

Brix认为任何组件和模块的都是由html片段和事件行为构成，所以做简单的约定，就能让组件开发和使用过程达到某种一致。

#### 核心类关系图

![Brix 类关系图](http://img02.taobaocdn.com/tps/i2/T1Wrg6Xk4hXXcMABjZ-1027-1025.png)

#### 约定大于配置的原则
* Brix的核心钩子有五个: bx-name、bx-path、bx-config、bx-tmpl、bx-datakey，详细看https://github.com/etaoux/brix#%E7%BB%84%E4%BB%B6%E9%92%A9%E5%AD%90、
* 基于Brix的组件、模块有统一的写法：ATTRS、EVENTS、DOCEVENTS、METHODS、FIRES、RENDERERS这些配置完整的表现了一个组件需要的属性、事件、方法、接口、以及模板渲染增强。
* Brix基于统一的渲染方式，既模板（tmpl）和数据(data)产生html片段。innerHTML到DOM节点中.


#### 局部刷新

* 因为基于统一的渲染方式，我们在拿到模板的时候可以做更多的事情，提取子模板，结合数据的更新，达到局部刷新，开发者不需要再关心页面的表现，而专心于数据的变化。

#### 基于钩子的组件实例构建

* DOM节点上标明bx-name的钩子都会被Brix提供的Pagelet按照统一的方式实例化。