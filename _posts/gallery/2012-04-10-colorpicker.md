---
layout: post
title: ColorPicker
category: gallery
caption: 颜色选择组件
---

{% demo gallery/colorpicker %}

## 配置

包含 [Brick](/brix/core/brick) 的所有配置

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

### `align(align)`

对齐 ColorPicker 到 node 的 points 点, 偏移 offset 处

* @param  {Object} align 同配置参数align


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

