---
title: Scaffolding
category: style
---

### Reset样式

Brix Style 的 Reset 样式直接使用了 [Normalize.css](http://necolas.github.com/normalize.css/)，
省心省力，效果请参考 [Reset测试]({{ site.baseurl }}/src/style/tests/reset.html)

### 工具类

<div class="row show-grid">
  <div class="span18">
    <p>工具类可以直接在页面中使用。</p>
  </div>
  <div class="span32">
  {% highlight css %}
.clearfix
.text-overflow{% endhighlight %}
  </div>
</div>

<h3>Mixin</h3>
<div class="row show-grid">
  <div class="span18">
    <p>Brix Style 提供了许多 Mixins 来加速 Brix 组件的开发。</p>
    <p>暂定有以下 mixin：</p>
  </div>
  <div class="span32">
    {% highlight css %}
.border-radius (@radius)
.opacity (@opacity)
.box-shadow (@shadow)
.transition (@transition)
#gradient > .vertical (@startColor: #555, @endColor: #333)
#gradient > .striped (@color, @angle: -45deg)
.ie7-inline-block ()
.reset-filter ()
.buttonBackground (@startColor, @endColor)
.formFieldState (@textColor: #555, @borderColor: #ccc, @backgroundColor: #f5f5f5)
#popoverArrow > .bottom (@arrowWidth: 5px, @color: @black)
#popoverArrow > .right (@arrowWidth: 5px, @color: @black)
#popoverArrow > .top (@arrowWidth: 5px, @color: @black)
#popoverArrow > .left (@arrowWidth: 5px, @color: @black)
#grid > .core (@gridColumnWidth, @gridGutterWidth)
#grid > .fluid (@fluidGridColumnWidth, @fluidGridGutterWidth)
#grid > .input (@gridColumnWidth, @gridGutterWidth){% endhighlight %}
  </div>
</div>