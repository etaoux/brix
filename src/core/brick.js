KISSY.add("brix/core/brick", function(S, Chunk, Event) {
    /**
     * Brix Brick 组件基类，完成组件渲染后的事件代理（既行为）。<br>
     * initializer是组件实例化的初始函数，bindUI在渲染后的绑定逻辑,替换原来的initialize方法，destructor是析构方法
     * @extends Brix.Chunk
     * @class Brix.Brick
     */
    var Brick = Chunk.extend({
        initializer: function() {
            var self = this;
            var constt = self.constructor;
            var dataset = self.get('dataset');
            while (constt) {
                var renderers = constt.RENDERERS;
                if (renderers) {
                    dataset.setRenderer(renderers, self);
                }
                constt = constt.superclass && constt.superclass.constructor;
            }
            //对原有pagelet的兼容
            self.pagelet = self.get('pagelet');
        },
        bindUI: function() {
            this._bx_bindEvent();
        },
        /**
         * 移除代理事件
         * @private
         */
        _bx_detachEvent: function() {
            var self = this;
            var constt = self.constructor;

            while (constt) {
                var defaultEvents = constt.EVENTS;
                if (defaultEvents) {
                    self._bx_removeEvents(defaultEvents);
                }
                var defaultDocEvents = constt.DOCEVENTS;
                if (defaultDocEvents) {
                    self._bx_removeEvents(defaultDocEvents, document);
                }
                var defaultWinEvents = constt.WINEVENTS;
                if (defaultWinEvents) {
                    this._bx_removeWinEvents(defaultWinEvents);
                }
                constt = constt.superclass && constt.superclass.constructor;
            }
            var events = self.get("events");
            if (events) {
                this._bx_removeEvents(events);
            }
        },
        /**
         * 绑定代理事件
         * @private
         */
        _bx_bindEvent: function() {
            var self = this;
            var constt = self.constructor;
            while (constt) {
                //代理在el上的事件
                var defaultEvents = constt.EVENTS;
                if (defaultEvents) {
                    this._bx_addEvents(defaultEvents);
                }
                //代理在document上的事件
                var defaultDocEvents = constt.DOCEVENTS;
                if (defaultDocEvents) {
                    this._bx_addEvents(defaultDocEvents, document);
                }
                //绑定window上的事件
                var defaultWinEvents = constt.WINEVENTS;
                if (defaultWinEvents) {
                    this._bx_addWinEvents(defaultWinEvents);
                }


                constt = constt.superclass && constt.superclass.constructor;
            }


            //用户使用组件中的自定义事件代理
            var events = self.get("events");
            if (events) {
                this._bx_addEvents(events);
            }
        },
        /**
         * 移除事件代理
         * @param  {Object} events 事件对象，参见EVENTS和DOCEVENTS属性
         * @param {Node} el 代理事件根节点
         * @private
         */
        _bx_removeEvents: function(events, el) {
            el = el || this.get("el");
            for (var selector in events) {
                var es = events[selector];
                for (var type in es) {
                    var callback = es[type];
                    if (selector === "") {
                        Event.detach(el, type, callback, this);
                    } else {
                        Event.undelegate(el, type, selector, callback, this);
                    }
                }
            }
        },
        /**
         * 添加事件代理绑定
         * @param  {Object} events 事件对象，参见EVENTS和DOCEVENTS属性
         * @param {Node} el 代理事件根节点
         * @private
         */
        _bx_addEvents: function(events, el) {
            el = el || this.get("el");
            for (var selector in events) {
                var es = events[selector];
                for (var type in es) {
                    var callback = es[type];
                    if (selector === "") {
                        Event.on(el, type, callback, this);
                    } else {
                        Event.delegate(el, type, selector, callback, this);
                    }
                }
            }
        },
        /**
         * 移除window事件绑定
         * @param  {Object} events 事件对象，参见WINEVENTS属性
         * @private
         */
        _bx_removeWinEvents: function(events) {
            for (var type in events) {
                var callback = events[type];
                Event.detach(window, type, callback, this);
            }
        },
        /**
         * 添加window事件绑定
         * @param  {Object} events 事件对象，参见WINEVENTS属性
         * @private
         */
        _bx_addWinEvents: function(events) {
            for (var type in events) {
                var callback = events[type];
                Event.on(window, type, callback, this);
            }
        },
        /**
         * 销毁组件（destroy）时候调用
         * @protected
         */
        destructor: function() {
            var self = this;
            if (self.get('rendered')) {
                self._bx_detachEvent();
                var action = self.get('destroyAction');
                var el = self.get('el');
                switch (action) {
                    case 'remove':
                        el.remove();
                        break;
                    case 'empty':
                        el.empty();
                        break;
                }
            }
            if (self.get('pagelet')) {
                delete self.pagelet;
                self.set('pagelet', null);
            }
        }
    }, {
        ATTRS: {
            pagelet: {
                value: null
            }
        }
    }, 'Brick');


    /**
     * pagelet的实例
     * @property pagelet
     * @type {Object}
     */


    /**
     * 对外方法配置
     *
     *
     *      Brick.METHODS = {
     *          method1:function(){
     *
     *          }
     *      }
     *      S.augment(Brick, Brick.METHODS)
     *
     *
     * @property METHODS
     * @static
     * @type {Object}
     */

    /**
     * 节点代理事件
     *
     *
     *      Brick.EVENTS = {
     *          'selector':{//selector为空表示在el节点上绑定事件
     *              'eventtype':function(){
     *
     *               }
     *           }
     *      }
     *
     *
     * @property EVENTS
     * @static
     * @type {Object}
     */

    /**
     * DOCUMENT节点代理事件
     *
     *
     *      Brick.DOCEVENTS = {
     *          'selector':{//selector为空表示在document上绑定事件
     *              'eventtype':function(){
     *
     *               }
     *           }
     *      }
     *
     *
     * @property DOCEVENTS
     * @static
     * @type {Object}
     */

    /**
     * window事件绑定
     *
     *
     *      Brick.WINEVENTS = {
     *          'eventtype':function(){
     *
     *           }
     *      }
     *
     *
     * @property WINEVENTS
     * @static
     * @type {Object}
     */

    /**
     * 对外事件申明
     *
     *
     *      Brick.FIRES = {
     *          'selector':'selector'
     *      }
     *
     *
     * @property FIRES
     * @static
     * @type {Object}
     */

    /**
     * 模板数据渲染扩展
     *
     *
     *      Brick.RENDERERS = {
     *          'xx':{
     *              'yy'function(){
     *
     *              }
     *          }
     *      }
     *
     *
     * @property RENDERERS
     * @static
     * @type {Object}
     */
    return Brick;
}, {
    requires: ["./chunk", "event"]
});