---
layout: post
title: HelloWorld
category: tutorials
caption: 还记得当年学一门语言的时候的helloworld吗，今天，让我们看看brix框架的helloworld吧。
---


## 步骤一

我们先写个helloworld组件，怎么写？[看这里](/brix/meta/gallery)

{% highlight js %}
KISSY.add('helloworld', function(S, Brick) {
    function HelloWorld() {
        HelloWorld.superclass.constructor.apply(this, arguments);
    }
    HelloWorld.ATTRS = {

    };
    S.extend(HelloWorld, Brick, {

    });

    return HelloWorld;
}, {
    requires: ["brix/core/brick"]
});
{% endhighlight %}

他其实什么都没有，一个空组件。没错，他已经能用了，brix框架已经给他某些能力了。

## 步骤二

有了组件，如何用，让我们进入birx之旅

### 方式一

直接在已有的dom结构上new helloworld

#### html代码:

{% highlight html %}
<div id="helloworld1">
    <span>Hello <span>World</span></span>
</div>
{% endhighlight %}

#### js代码:

{% highlight js %}
KISSY.use('helloworld',function(S,HelloWorld){
    var helloworld = new HelloWorld({tmpl:'#helloworld1'});
});
{% endhighlight %}

#### demo：

{% demo tutorials/helloworld/helloworld1.html %}

### 方式二

    直接在已有的dom结构上new pagelet

#### html代码:

{% highlight html %}
<div id="container2">
    <div id="helloworld2" bx-brick="helloworld" path="helloworld">
        <span>Hello <span>World</span></span>
    </div>
</div>
{% endhighlight %}

#### js代码:

{% highlight js %}
KISSY.use('brix/core/pagelet',function(S,Pagelet){
    var pagelet = new Pagelet({tmpl:'#container2'});
});
{% endhighlight %}

#### demo：

{% demo tutorials/helloworld/helloworld2.html %}

### 方式三

    用模板和容器的方式new helloworld

#### html代码:

{% highlight html %}
<div id="container3">
</div>
<script type="text/template" id="tmpl_helloword1">
    <div>
        <span>Hello <span>World</span></span>
    </div>
</script>
{% endhighlight %}

#### js代码:

{% highlight js %}
KISSY.use('helloworld',function(S,HelloWorld){
    var helloworld = new HelloWorld({container:'#container3',tmpl:S.one('#tmpl_helloword1').html()});
    helloworld.render();
});
{% endhighlight %}

#### demo：

{% demo tutorials/helloworld/helloworld3.html %}

### 方式四

    用模板和容器的方式new pagelet

#### html代码:

{% highlight html %}
<div id="container4">
</div>
<script type="text/template" id="tmpl_helloword1">
    <div bx-brick="helloworld" path="helloworld">
        <span>Hello <span>World</span></span>
    </div>
</script>
{% endhighlight %}

#### js代码:

{% highlight js %}
KISSY.use('brix/core/pagelet',function(S,Pagelet){
    var pagelet = new Pagelet({container:'#container4',tmpl:S.one('#tmpl_helloword1').html()});
    pagelet.render();
});
{% endhighlight %}

#### demo：

{% demo tutorials/helloworld/helloworld4.html %}


### 方式五

    用模板、容器、数据的方式new helloworld，实现局部刷新

#### html代码:

{% highlight html %}
<div id="container5">
    <button id="btn5" class="btn btn-taobao btn-size30">
        rename to LiMu
    </button>
</div>
<script type="text/template" id="tmpl_helloword2">
    <div bx-brick="helloworld">
        <span>Hello 
            <span bx-tmpl="helloworld" bx-datakey="name">{{name}}</span>
        </span>
    </div>
</script>
{% endhighlight %}

#### js代码:

{% highlight js %}
var data = {
    name:'ZuoMo'
};
//5
KISSY.use('helloworld',function(S,HelloWorld){
    var helloworld = new HelloWorld({container:'#container5',tmpl:S.one('#tmpl_helloword2').html(),data:data});
    helloworld.render();

    S.one('#btn5').on('click',function(){
        //模板局部刷新
        helloworld.setChunkData('name','LiMu');
    });
});
{% endhighlight %}

#### demo：

{% demo tutorials/helloworld/helloworld5.html %}

### 方式六

    用模板、容器、数据的方式new pagelet，实现局部刷新

#### html代码:

{% highlight html %}
<div id="container6">
    <button id="btn6" class="btn btn-taobao btn-size30">
        rename to YiCai
    </button>
</div>
<script type="text/template" id="tmpl_helloword2">
    <div bx-brick="helloworld" path="helloworld">
        <span>Hello 
            <span bx-tmpl="helloworld" bx-datakey="name">{{name}}</span>
        </span>
    </div>
</script>
{% endhighlight %}

#### js代码:

{% highlight js %}
var data = {
    name:'ZuoMo'
};
//6
KISSY.use('brix/core/pagelet',function(S,Pagelet){
    var pagelet = new Pagelet({container:'#container6',tmpl:S.one('#tmpl_helloword2').html(),data:data});
    pagelet.render();

    S.one('#btn6').on('click',function(){
        //模板局部刷新
        pagelet.setChunkData('name','YiCai');
    });
});
{% endhighlight %}

#### demo：

{% demo tutorials/helloworld/helloworld6.html %}


helloworld之旅到此结束，你应该对brix有了一个初步的认识了,接下来，我们会逐步的完善helloworld，同时了解看看brix还有什么其他的特性。





