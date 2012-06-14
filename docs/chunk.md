# Chunk

brick和pagelet类的父类

---

## 配置

* `el` {element}

    组件节点，只读。

* `rendered` {String}

    是否已经渲染到页面，只读

* `render` {String|element}

    容器节点

* `tmpl` {String}

    模板字符串

* `autoRender` {Boolen}

    是否自动渲染

## 方法

* render

    将模板渲染到页面

* setChunkData

    设置数据，并刷新模板数据

    * @param {string} datakey 需要更新的数据对象key
    * @param {object} data    数据对象

