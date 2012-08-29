---
layout: doc
title: StarRating
caption: 打分组件
---

{% demo gallery/starrating %}

## 配置

包含 [Brick](/brix/core/brick) 的所有配置

### `split` {Number}

每个星星分割成几个，默认为2

### `maxValue` {Number}

最大值，默认为5

### `length` {Number}

份数（注意：星星的个数=length/split），默认为10

### `defaultValue` {String|Number}

默认值，当是Number类型时候，是指第几份，对应length，默认为false，不设置

### `readOnly` {Boolen}

是否只读，默认false

### `inputs` {Array}

radio数组，如果在组件内部放置radio，并且class为"star",组件初始化会读取。

## 方法

### `select(value)`

选中星星，

* @param  {Number|String} value 同配置参数defaultValue


### `readOnly()`

设置只读

### `disable()`

如果有表单元素，设置不提交

### `enable()`

如果有表单元素，设置提交

## 事件

### `focus(ev)`

鼠标聚焦

* ev.value {String} 星星对应的值

### `blur(ev)`

鼠标离开

* ev.value {String} 星星对应的值

### `selected(ev)`

鼠标点击后

* ev.value {String} 星星对应的值

