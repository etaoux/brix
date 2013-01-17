KISSY.add("brix/core/brick", function(S, Chunk, Event) {
    /**
     * Brix Brick 组件基类，完成组件渲染后的事件代理（既行为）。
     * initialize是组件在渲染后的初始化方法，destructor是析构方法
     * @extends Brix.Chunk
     * @class Brix.Brick
     */
    var Brick = Chunk.extend({
        initializer: function() {
            var self = this,
                constt = self.constructor;
            while(constt) {
                var renderers = constt.RENDERERS;
                if(renderers) {
                    self.addTmpl();
                    self.get('dataset').setRenderer(renderers, self);
                }
                constt = constt.superclass && constt.superclass.constructor;
            }
        },
        bindUI: function() {
            var self = this;
            self._bindEvent();
        },
        /**
         * 移除代理事件
         * @private
         */
        _detachEvent: function() {
            var self = this;
            var constt = self.constructor;

            while(constt) {
                var defaultEvents = constt.EVENTS;
                if(defaultEvents) {
                    self._removeEvents(defaultEvents);
                }
                var defaultDocEvents = constt.DOCEVENTS;
                if(defaultDocEvents) {
                    self._removeEvents(defaultDocEvents, document);
                }
                constt = constt.superclass && constt.superclass.constructor;
            }
            var events = self.get("events");
            if(events) {
                this._removeEvents(events);
            }
        },
        /**
         * 绑定代理事件
         * @private
         */
        _bindEvent: function() {
            var self = this;
            var constt = self.constructor;
            while(constt) {
                //组件默认事件代理
                //方式一
                var defaultEvents = constt.EVENTS;
                if(defaultEvents) {
                    this._addEvents(defaultEvents);
                }
                //代理在全局的页面上
                var defaultDocEvents = constt.DOCEVENTS;
                if(defaultDocEvents) {
                    this._addEvents(defaultDocEvents, document);
                }
                constt = constt.superclass && constt.superclass.constructor;
            }


            //用户使用组件中的自定义事件代理
            var events = self.get("events");
            if(events) {
                this._addEvents(events);
            }
        },
        /**
         * 移除事件代理
         * @param  {Object} events 事件对象，参见EVENTS属性
         * @private
         */
        _removeEvents: function(events, el) {
            el = el || this.get("el");
            for(var selector in events) {
                var es = events[selector];
                for(var type in es) {
                    var callback = es[type];
                    if(selector === "") {
                        Event.detach(el, type, callback, this);
                    } else {
                        Event.undelegate(el, type, selector, callback, this);
                    }
                }
            }
        },
        /**
         * 添加事件代理绑定
         * @param  {Object} events 事件对象，参见EVENTS属性
         * @private
         */
        _addEvents: function(events, el) {
            el = el || this.get("el");
            for(var selector in events) {
                var es = events[selector];
                for(var type in es) {
                    var callback = es[type];
                    if(selector === "") {
                        Event.on(el, type, callback, this);
                    } else {
                        Event.delegate(el, type, selector, callback, this);
                    }
                }
            }
        },
        /**
         * 销毁组件
         */
        destructor: function() {
            var self = this;
            if(self.get('rendered')) {
                self._detachEvent();
                if(self.get('isRemoveHTML')) {
                    var el = self.get('el');
                    if(self.get('isRemoveEl')) {
                        el.remove();
                    } else {
                        el.empty();
                    }
                }
            }
            if(self.get('pagelet')) {
                self.set('pagelet', null);
            }
        }
    }, {
        ATTRS: {
            pagelet: {
                value: null
            }
        }
    });


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
     *          'selector':{
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
     *          'selector':{
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