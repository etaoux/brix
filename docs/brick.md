# Brick

继承自Chunk，是组件的父类


        设计思路:组件基类，完成组件渲染后的事件代理（既行为）。initialize是多有组件在渲染后的初始化方法

## 配置

包含[Chunk](/etaoux/brix/tree/master/docs/chunk.md)的所有配置

* `events` {Object}

    组件事件代理

        例如：
        {
            ".dropdown-a": {
                click: function(e) {
                    var el = this.get('el').one('.dropdown-list');
                    this.__show = true;
                    if (el.css('display') == 'block') {
                        this.blur();
                    } else {
                        this.focus();
                    }
                },
                mouseenter: function(e) {
                    var currentTarget = S.one(e.currentTarget);
                    currentTarget.addClass('dropdown-ahover');
                },
                mouseleave: function(e) {
                    var currentTarget = S.one(e.currentTarget);
                    currentTarget.removeClass('dropdown-ahover');
                }
            }
        }

## 方法



## 事件






