---
layout: post
title: InplaceEditor
category: gallery
caption: 单行编辑
---

## 配置

包含 [Brick](/etaoux/brix/tree/master/docs/brick.md)的所有配置

## 方法

### `show()`

显示就地编辑

* @param  {Number} x 显示的X坐标
* @param  {Number} y 显示的Y坐标
* @param  {String} v 文本框的值

### `hide()`

隐藏就地编辑

### `getValue()`

获取当前值


## 事件


### `valueChange(e)`

    {String} e.value:当前值

## 代码示例

{% highlight html %}
<script type="text/template" id="tmpl_brick">
    <div class="editPoup" bx-brick="inplaceeditor">
        <input maxlength="128" type="text" value="" />
    </div>
</script>{% endhighlight %}

{% highlight js %}
KISSY.use("brix/gallery/inplaceeditor/", function(S, InplaceEditor) {
    var config = {
        tmpl: S.one("#tmpl_brick").html()
    };
    var inplaceeditor = new InplaceEditor(config);
    inplaceeditor.show();
    inplaceeditor.on('valueChange',function(e){
        console.log(e.value);
    });
});{% endhighlight %}