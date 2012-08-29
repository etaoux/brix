---
layout: doc
title: ColorPicker
caption: 颜色选择组件
---

{% demo gallery/colorpicker %}

## 配置

包含 [Brick](/brix/core/brick) 的所有配置

### `trigger` {String|Node}

触发节点或者容器节点

### `triggerType` {Array}

弹出状态下, 触发的事件, 例如：[‘click’,’focus’], 默认为[‘click’]
### `align` {Object}

弹出组件对其方式

{% highlight js %}
 {
    node: null,         // 参考元素,
    points: ['cc','cc'], // ['tr', 'tl'] 表示 colorpicker 的 tl 与参考节点的 tr 对齐
    offset: [0, 0]      // 偏移值，有效值为 [n, m]
}
{% endhighlight %}

### `color` {String}

默认颜色 hex，默认#ffffff

## 方法

### `show()`

显示

### `hide()`

隐藏

### `toggle()`

切换显示隐藏

### `setHex()`

设置颜色

* @param {String} hex 颜色值#RRGGBB.

### `setRgb()`

设置颜色

* @param {Object} rgb rgb对象 { r: <red>, g: <green>, b: <blue> }

### `setHsv()`

设置颜色

* @param {Object} hsv hsv对象 { h: <hue>, s: <saturation>, v: <value> }

## 事件

### `selected(ev)`

确定事件

* ev.hex {String} hex 颜色值#RRGGBB.
* ev.hsv {Object} hsv对象 { h: <hue>, s: <saturation>, v: <value> }
* ev.rgb {String} rgb对象 { r: <red>, g: <green>, b: <blue> }

