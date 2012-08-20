---
layout: post
title: DatePicker
category: gallery
caption: 时间选择
---

{% demo gallery/datepicker %}

## 配置

包含 [Brick](/brix/core/brick) 的所有配置

### `trigger` {String|Node}

触发节点或者容器节点

### `triggerType` {Array}

弹出状态下, 触发弹出日历的事件, 例如：[‘click’,’focus’],也可以直接传入’focus’, 默认为[‘click’]

### `align` {Object}

弹出组件对其方式

{% highlight js %}
 {
    points: ['cc','cc'], // ['tr', 'tl'] 表示 colorpicker 的 tl 与参考节点的 tr 对齐
    offset: [0, 0]      // 偏移值，有效值为 [n, m]
}
{% endhighlight %}

### `quickDates` {Date}

快速时段选择

{% highlight js %}
{
	'today': {
	    text: '今天',
	    dateRange: [new Date(), new Date()]
	},
	'yestoday': {
	    text: '昨天',
	    dateRange: [new Date(2011, 12, 26), new Date(2011, 12, 26)]
	}
}
{% endhighlight %}

### `dates` {Date}

已经选择的时间段

{% highlight js %}
{
	start:new Date(),
	end:new Date()
}
{% endhighlight %}

### `pages` {Date}

日历的页数, 默认为1, 包含一页日历

### `notLimited` {Boolen}

是否出现不限的按钮,默认为false

## 方法

### `show()`

显示日历

### `hide()`

隐藏日历

### `toggle()`

切换显示隐藏

## 事件

### `selected(ev)`

范围选择

* ev.start {Date} 选择的开始日期
* ev.end {Date} 选择的开始日期
* ev.isQuick {Boolen} 是否快速选择
* ev.quickDate {Boolen} 快速选择的数据

### `show()`

显示

### `hide()`

隐藏
