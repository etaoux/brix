KISSY.add("brix/core/brick", function(S, Chunk) {
    function normFn(self, f) {
        if (S.isString(f)) {
            return self[f];
        }
        return f;
    }

    function Brick() {
        var self = this;
        self.pagelet = arguments[0] ? arguments[0].pagelet : null; //pagelet的引用
        Brick.superclass.constructor.apply(this, arguments);

        var id = self.get('id'),
            tmpler = self.get('tmpler'),
            renderer = self.constructor.RENDERER;
        if (tmpler&&renderer) {
            self.get('dataset').setRenderer(renderer, self, id);
        }

        self.on('rendered', function() {
            self.initialize();
            self._bindEvent();
        });

        if(self.pagelet){
            if(self.pagelet.get('rendered')){
                self.render();
            }
            else{
                self.pagelet.on('rendered', function() {
                    self.render();
                }) 
            }
        }
        else{
            if (self.get('autoRender')||!tmpler||tmpler.inDom) {
                self.render();
            }
        }
    }
    Brick.ATTACH = {
        //组件内部的事件代理，
        /*"selector":{
            enventtype:function(e){
                //e：事件对象
                //this:指向当前实例
            }
        }*/
    };
    Brick.ATTRS = {
        events: {
            //此事件代理是KISSY选择器的事件的代理
        }
    };

    S.extend(Brick, Chunk, {
        //初始化方法，提供子类覆盖
        initialize: function() {

        },
        //析构函数，用来销毁时候的操作,提供子类覆盖
        destructor:function(){

        },
        /**
         * 移除代理事件
         */
        _detachEvent: function() {
            var self = this;
            var defaultEvents = self.constructor.ATTACH;
            if (defaultEvents) {
                self._removeEvents(defaultEvents);
            }
            var defaultDocEvents = self.constructor.DOCATTACH;
            if (defaultDocEvents) {
                self._removeEvents(defaultDocEvents, S.one(document));
            }

            self._undelegateEvents();
            var events = self.get("events");
            if (events) {
                this._removeEvents(events);
            }
            self.destructor();
        },
        /**
         * 绑定代理事件
         */
        _bindEvent: function() {
            var self = this;
            //组件默认事件代理
            //方式一
            var defaultEvents = self.constructor.ATTACH;
            if (defaultEvents) {
                this._addEvents(defaultEvents);
            }
            //代理在全局的页面上
            var defaultDocEvents = self.constructor.DOCATTACH;
            if (defaultDocEvents) {
                this._addEvents(defaultDocEvents, S.one(document));
            }

            //方式二
            self._delegateEvents();

            //用户使用组件中的自定义事件代理
            var events = self.get("events");
            if (events) {
                this._addEvents(events);
            }
        },
        events: {
            //此事件代理是原生的页面bxclick等事件的代理
        },
        /**
         * 移除事件代理
         * @param  {object} events 事件对象，参见ATTACH属性
         */
        _removeEvents: function(events, el) {
            el = el || this.get("el");
            for (var selector in events) {
                var event = events[selector];
                for (var type in event) {
                    var callback = normFn(this, event[type]);
                    if (selector === "") {
                        el.detach(type, callback, this);
                    } else {
                        el.undelegate(type, selector, callback, this);
                    }
                }
            }
        },
        /**
         * 添加事件代理绑定
         * @param  {object} events 事件对象，参见ATTACH属性
         */
        _addEvents: function(events, el) {
            el = el || this.get("el");
            for (var selector in events) {
                var event = events[selector];
                for (var type in event) {
                    var callback = normFn(this, event[type]);
                    if (selector === "") {
                        el.on(type, callback, this);
                    } else {
                        el.delegate(type, selector, callback, this);
                    }
                }
            }
        },
        /**
         * 原生事件代理
         */
        _delegateEvents: function() {
            var events = this.events;
            var node = this.get("el")[0];
            var that = this;
            for (var _type in events) {
                (function() {
                    var type = _type;
                    node["on" + type] = function() {
                        var event = arguments[0] || window.event;
                        var target = event.target || event.srcElement;
                        if (target.nodeType !== 1) {
                            target = target.parentNode;
                        }
                        var eventinfo = target.getAttribute("bx" + type);
                        if (eventinfo) {
                            var events = eventinfo.split("|"),
                                eventArr, eventKey;
                            for (var i = 0; i < events.length; i++) {
                                eventArr = events[i].split(":");
                                eventKey = eventArr.shift();

                                // 事件代理,通过最后一个参数,决定是否阻止事件冒泡和取消默认动作
                                var evtBehavior = eventArr[eventArr.length - 1],
                                    evtArg = false;
                                if (evtBehavior === '_halt_' || evtBehavior === '_preventDefault_') {
                                    event.preventDefault ? event.preventDefault() : (event.returnValue = false);
                                    evtArg = true;
                                }
                                if (evtBehavior === '_halt_' || evtBehavior === '_stop_') {
                                    event.stopPropagation ? event.stopPropagation() : (event.cancelBubble = true);
                                    evtArg = true;
                                }
                                if (evtArg) {
                                    eventArr.pop();
                                }
                                if (that.events && that.events[type] && that.events[type][eventKey]) {
                                    that.events[type][eventKey].call(that, target, eventArr); //将事件当前上下文更改成当前实例，和kissy mvc一致。
                                }
                            }
                        }
                        target = null;
                    };
                })();
            }
        },
        /**
         * 取消原生事件代理
         */
        _undelegateEvents: function() {
            var events = this.events;
            var node = this.get("el")[0];
            var that = this;
            for (var _type in events) {
                (function() {
                    var type = _type;
                    node["on" + type] = null;
                })();
            }
        },
        /**
         * 销毁组件
         */
        destroy:function(){
            var self = this, 
                tmpler = self.get('tmpler');
            if (tmpler && !S.isEmptyObject(tmpler.bricks)) {
                S.each(tmpler.bricks, function(b, k) {
                    tmpler.bricks[k].brick = null;
                    delete tmpler.bricks[k];
                });
            }
            if(self.pagelet){
                var id = self.get('id');
                self.pagelet.destroy(id);
            }
            else{
                self._detachEvent();
                self.get("el").remove();
            }
            
        }
    });
    return Brick;
}, {
    requires: ["./chunk"]
});