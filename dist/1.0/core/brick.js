KISSY.add("brix/core/brick", function(S, Chunk) {
    function normFn(self, f) {
        if (S.isString(f)) {
            return self[f];
        }
        return f;
    }
    /**
     * Brix Brick 组件基类，完成组件渲染后的事件代理（既行为）。
     * initialize是组件在渲染后的初始化方法，destructor是析构方法
     * @extends Brix.Chunk
     * @class Brix.Brick
     */
    function Brick() {
        var self = this;
        self.pagelet = arguments[0] ? arguments[0].pagelet : null; //pagelet的引用
        Brick.superclass.constructor.apply(this, arguments);
        
        var constt = self.constructor;
        while(constt.NAME!='Brick'){
            var renderers = constt.RENDERERS;
            if (renderers) {
                self._buildTmpler('', false);
                self._buildDataset();
                self.get('dataset').setRenderer(renderers, self);
            }
            constt = constt.superclass.constructor;
        }

        self.on('rendered', function() {
            var main,extChains = [];
            constt = self.constructor;
            while(constt.NAME!='Brick'){
                if (constt.prototype.hasOwnProperty('initialize') && (main = constt.prototype['initialize'])) {
                    extChains.push(main);
                }
                constt = constt.superclass.constructor;
            }
            for (var i = extChains.length - 1; i >= 0; i--) {
                extChains[i] && extChains[i].call(self);
            }
            self._bindEvent();
        });

        var tmpler = self.get('tmpler');
        if (self.get('autoRender')||!tmpler||tmpler.inDom){
            self.render();
        }
    }

    /**
     * 用来标识Brick
     * @property NAME
     * @static
     * @type {String}
     */
    Brick.NAME = 'Brick';

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

    S.extend(Brick, Chunk, {
        /**
         * 初始化方法，提供子类覆盖
         */
        initialize: function() {

        },
        /**
         * 析构函数，用来销毁时候的操作,提供子类覆盖
         */
        destructor:function(){

        },
        /**
         * 移除代理事件
         * @private
         */
        _detachEvent: function() {
            var self = this;
            var constt = self.constructor;

            while(constt.NAME!='Brick'){
                var defaultEvents = constt.EVENTS;
                if (defaultEvents) {
                    self._removeEvents(defaultEvents);
                }
                var defaultDocEvents = constt.DOCEVENTS;
                if (defaultDocEvents) {
                    self._removeEvents(defaultDocEvents, S.one(document));
                }
                constt = constt.superclass.constructor;
            }
            self._undelegateEvents();
            var events = self.get("events");
            if (events) {
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
            while(constt.NAME!='Brick'){
                //组件默认事件代理
                //方式一
                var defaultEvents = constt.EVENTS;
                if (defaultEvents) {
                    this._addEvents(defaultEvents);
                }
                //代理在全局的页面上
                var defaultDocEvents = constt.DOCEVENTS;
                if (defaultDocEvents) {
                    this._addEvents(defaultDocEvents, S.one(document));
                }
                constt = constt.superclass.constructor;
            }

            //方式二
            self._delegateEvents();

            //用户使用组件中的自定义事件代理
            var events = self.get("events");
            if (events) {
                this._addEvents(events);
            }
        },
        // events: {
        //     //此事件代理是原生的页面bxclick等事件的代理
        // },
        /**
         * 移除事件代理
         * @param  {Object} events 事件对象，参见EVENTS属性
         * @private
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
         * @param  {Object} events 事件对象，参见EVENTS属性
         * @private
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
         * @private
         */
        _delegateEvents: function() {
            var events = this.events;
            var node = this.get("el")[0];
            var that = this;
            var foo = function(type){
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
            };
            for (var _type in events) {
                foo(_type);
            }
        },
        /**
         * 取消原生事件代理
         * @private
         */
        _undelegateEvents: function() {
            var events = this.events;
            var node = this.get("el")[0];
            var that = this;
            var foo = function(type){
                node["on" + type] = null;
            };
            for (var _type in events) {
                foo(_type);
            }
        },
        /**
         * 销毁组件
         */
        destroy:function(){
            var self = this;
            self._destroy();
            if(self.get('rendered')){
                self._detachEvent();
            }

            var constt = self.constructor;
            while(constt.NAME!='Brick'){
                if(constt.prototype.hasOwnProperty('destructor')){
                    constt.prototype.destructor.apply(self);
                }
                constt = constt.superclass.constructor;
            }

            if(self.get('rendered')&&self.get('isRemoveHTML')) {
                var el = self.get('el');
                if(self.get('isRemoveEl')){
                    el.remove();
                }
                else{
                    el.empty();
                }
            }
            if(self.pagelet){
                delete self.pagelet;
            }
            self.detach();
        }
    });
    return Brick;
}, {
    requires: ["./chunk"]
});