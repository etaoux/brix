---
layout: doc
title: Pagination
caption: 分页组件
---

{% demo gallery/pagination %}

## 配置

包含 [Brick](/brix/core/brick) 的所有配置

### `mode` {String}

模式，传统的第几页还是记录条数.分为p 和s，p是传统模式，s是size总和模式,默认p

### `simplify` {Boolen}

是否精简模式，默认false

### `step` {Number}

步长，默认7

### `index` {Number}

当前页数，默认1

### `size` {Number}

每页记录数，默认15

### `sizeChange` {Boolen}

是否可修改每页记录数

### `count` {Number}

总记录数

### `hascount` {Boolen}

是否有总记录数，用在没有总记录数的分页，默认true

### `max` {Number}

最多页数，和hasmax配合使用，如果设定hasmax为true，则控制页数，如果不设定，则由程序计算

### `hasmax` {Boolen}

是否需要限定最多页数，默认false，

### `statistics` {Boolen}

是否显示统计信息，默认false

### `pageCount` {Boolen}

是否显示总页数信息，默认true

### `jump` {Boolen}

是否显示跳转信息

### `goTo` {Boolen}

是否直接跳转，默认true

### `goToUrl` {String}

跳转的URL信息，默认是location.href

### `pageName` {String}

分页的参数名，默认page

### `pageSizeName` {String}

每页记录数参数名，默认pagesize

### `params` {Object}

页面跳转的额外参数，默认false

### `defaultUI` {Boolen}

是否使用组件内置html，如果使用页面已有html结构，则设置为false，默认true

### `sizes` {Array}

每页显示记录数集合，默认[10, 15, 20,25,30]

## 方法

### `goToPage(page)`

跳转到指定页

* @param  {Number} page 要跳转的页数


### `setConfig(config)`

重设配置

* @param  {Object} config 详见配置项


## 事件

### `beforeGotoPage(ev)`

页面跳转前触发，如果返回false，会阻止跳转

* ev.newIndex {Number} 新的页数
* ev.prevIndex {Number} 老的页数

### `gotoPage(ev)`

页面跳转后触发

* ev.index {Number} 新的页数

### `sizeChange(ev)`

每页显示记录数更改

* ev.size {Number} 新的记录数

## 代码示例

{% highlight js %}
KISSY.use("brix/gallery/pagination/", function(S, Pagination) {
    var p = new Pagination({
        tmpl:'.pagination'
    });
});{% endhighlight %}

