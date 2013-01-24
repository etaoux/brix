/*! Brix - v2.0
* https://github.com/etaoux/brix
* Copyright (c) 2013 etaoux; Licensed MIT */
KISSY.add("brix/core/tmpler", function(S, XTemplate, Node) {
    var $ = Node.all;
    /**
     * 模板解析器，对传入的模板通过钩子进行分析，结合 XTemplate 和数据给出 html 片段。
     * @class Brix.Tmpler
     * @param {String}  tmpl    模板字符串
     * @param {Number} level    对模板进行解析的层级，false表示不解析
     * @requires Brix.Mu
     */

    function Tmpler(tmpl, level) {
        this.tmpls = [];
        if(tmpl && (level !== false)) {
            this._praseTmpl(tmpl, level);
        } else {
            this.tmpl = tmpl;
        }
    }

    S.augment(Tmpler, {
        /**
         * 解析模板
         * @param  {String} tmpl  模板字符串
         * @param  {Number} level 对模板进行解析的层级，false表示不解析
         * @private
         */
        _praseTmpl: function(tmpl, level) {
            var self = this,
                inDom = false,
                node, tmplNode;
            if(typeof tmpl === 'string') {
                if(tmpl.charAt(0) === '.' || tmpl.charAt(0) === '#' || tmpl === 'body') {
                    node = $(tmpl);
                }
            } else {
                node = tmpl;
            }

            if(node) {
                if(node.item(0)[0].nodeName.toUpperCase() == 'SCRIPT') {
                    //如果是script节点，则直接取html
                    tmpl = node.item(0).html();
                } else {
                    inDom = true;
                }
            }

            if(!inDom) {
                var r = '<([\\w]+)\\s+[^>]*?bx-tmpl=["\']?([^"\'\\s]+)["\']?\\s+[^>]*?bx-datakey=["\']?([^"\'\\s]+)["\']?[^>]*?>(@brix@)</\\1>';
                while(level--) {
                    r = r.replace('@brix@', '(?:<\\1[^>]*>@brix@</\\1>|[\\s\\S])*?');
                }
                r = r.replace('@brix@', '(?:[\\s\\S]*?)');
                self.reg = r;
                self.tmpl = tmpl;
                self._buildTmpls(self.tmpl);
            }
            self.inDom = inDom;
        },
        /**
         * 对节点中的bx-tmpl解析，构建模板和数据配置
         * @param  {String} tmpl  需要解析的模板
         * @private
         */
        _buildTmpls: function(tmpl) {
            var self = this;
            var r = new RegExp(self.reg, "ig"),
                m;
            while((m = r.exec(tmpl)) !== null) {
                self.tmpls.push({
                    name: m[2],
                    datakey: m[3],
                    tmpler: new Tmpler(m[4], false)
                });
                self._buildTmpls(m[4]);
            }
        },
        /**
         * 添加子模板
         * @param {String} name    模板名称
         * @param {String} datakey 模板对应的数据key
         * @param {String} tmpl    子模板
         */
        addTmpl: function(name, datakey, tmpl) {
            var self = this;
            self.tmpls.push({
                name: name,
                datakey: datakey,
                tmpler: new Tmpler(tmpl, false)
            });
        },

        /**
         * 获取模板字符串
         * @return {String} 模板字符串
         */
        getTmpl: function() {
            return this.tmpl;
        },
        /**
         * 模板和数据渲染成字符串
         * @param  {Object} data 数据
         * @return {String}      html片段
         */
        render: function(data) {
            return new XTemplate(this.getTmpl()).render(data);
        }
    });
    return Tmpler;
}, {
    requires: ['xtemplate', 'node', 'sizzle']
});
KISSY.add("brix/core/dataset", function(S, Base) {
    /**
     * Brix Dataset 提供数据管理；为所有组件提供基于数据事件的编程
     * @extends KISSY.Base
     * @class Brix.Dataset
     */

    function Dataset() {
        Dataset.superclass.constructor.apply(this, arguments);
    }
    Dataset.ATTRS = {
        /**
         * 数据对象
         * @cfg {Object}
         */
        data: {}
    };
    S.extend(Dataset, Base, {
        /**
         * 扩展数据，用于 mastache 渲染
         * @param {Object} renderer 代理方法对象
         * @param {Object} context  当前上下文环境
         * @param {String} prefix   前缀，防止相同 brick 方法覆盖
         */
        setRenderer: function(renderer, context, prefix) {
            var self = this,
                data = self.get('data'),
                type, wrapperName;
            prefix = prefix ? prefix + '_' : '';
            if(renderer) {
                var foo = function(type, wrapperName) {
                        var name = prefix + type + '_' + wrapperName,
                            fn = renderer[type][wrapperName];
                        data[name] = function() {
                            return fn.call(this, context, type);
                        };
                    };
                for(type in renderer) {
                    for(wrapperName in renderer[type]) {
                        foo(type, wrapperName);
                    }
                }
            }
        }
    });
    return Dataset;
}, {
    requires: ["base"]
});
KISSY.add("brix/core/chunk", function(S, Node, UA, RichBase, Dataset, Tmpler) {
    var $ = Node.all,
        noop = S.noop;
    /**
     * The default set of attributes which will be available for instances of this class, and
     * their configuration
     *
     * By default if the value is an object literal or an array it will be 'shallow' cloned, to
     * protect the default value.
     *
     *      for example:
     *      @example
     *      {
     *          x:{
     *              value: // default value
     *              valueFn: // default function to get value
     *              getter: // getter function
     *              setter: // setter function
     *          }
     *      }
     * see:
     * <a href="http://docs.kissyui.com/kissy/docs/#!/api/KISSY.Base">http://docs.kissyui.com/kissy/docs/#!/api/KISSY.Base</a>
     *
     * @property ATTRS
     * @member KISSY.Base
     * @static
     * @type {Object}
     */

    /**
     * Brix Chunk,Brick和Pagelet类的基类,
     * 作为组件底层，完成渲染、数据更新、销毁操作，是模板解析器（Tmpler）和数据管理器（Dataset）的调度者。
     * @extends KISSY.RichBase
     * @class Brix.Chunk
     */
    var Chunk = RichBase.extend({
        constructor: function Chunk() {
            var self = this;
            Chunk.superclass.constructor.apply(self, arguments);
            var tmpler = self.get('tmpler');
            if(self.get('autoRender') || !tmpler || tmpler.inDom) {
                self.render();
            }
        },

        // change routine from rich-base for uibase
        bindInternal: noop,

        // change routine from rich-base for uibase
        syncInternal: noop,
        /**
         * 初始化
         */
        initializer: function() {
            var self = this;
            var tmpl = self.get('tmpl');
            if(tmpl) {
                self._buildTmpler(tmpl, self.get('level'));
                var tmpler = self.get('tmpler');
                if(tmpler) {
                    self._buildDataset(self.get('data'));
                    if(tmpler.inDom) {
                        self.set('el', tmpl);
                    }
                }
            }
        },
        /**
         * 构建模板解析器
         * @param {String} tmpl 模板字符串
         * @param {Number} level 模板解析的层级
         * @private
         */
        _buildTmpler: function(tmpl, level) {
            var self = this;
            if(!self.get('isBuidTmpler')) {
                self.set('isBuidTmpler', true);
                var tmpler = new Tmpler(tmpl, level);
                self.set('tmpler', tmpler);
            }
        },
        /**
         * 构建数据管理器
         * @param {Object} data 数据集合
         * @private
         */
        _buildDataset: function(data) {
            var self = this;
            if(!self.get('isBuidDataset')) {
                self.set('isBuidDataset', true);
                data = data || {}; //原始数据
                data = S.clone(data); //数据深度克隆
                var dataset = new Dataset({
                    data: data
                });
                self.set('dataset', dataset); //设置最新的数据集合
                dataset.on('afterDataChange', function(e) {
                    self._render(e.subAttrName, e.newVal);
                });
            }
        },
        /**
         * 销毁tmpler和dataset
         */
        destructor: function() {
            var self = this,
                tmpler = self.get('tmpler'),
                dataset = self.get('dataset');
            if(tmpler) {
                self.set('tmpler', null);
                delete tmpler.tmpls;
            }
            if(dataset) {
                self.set('dataset', null);
                dataset.detach();
            }
        },
        /**
         * For overridden. Render logic of subclass component.
         * @protected
         * @method
         */
        renderUI: noop,

        /**
         * For overridden. Bind logic for subclass component.
         * @protected
         * @method
         */
        bindUI: noop,

        /**
         * For overridden. Sync attribute with ui.
         * @protected
         * @method
         */
        syncUI: noop,

        /**
         * 添加子模板
         * @param {String} name    模板名称
         * @param {String} datakey 模板对应的数据key
         * @param {String} tmpl    子模板
         */
        addTmpl: function(name, datakey, tmpl) {
            var self = this;
            self._buildTmpler('', false);
            self._buildDataset();
            if(name) {
                var tmpler = self.get('tmpler');
                tmpler.addTmpl(name, datakey, tmpl);
            }
        },

        /**
         * 设置数据，并刷新模板数据
         * @param {String} datakey 需要更新的数据对象key
         * @param {Object} data    数据对象
         * @param {Object} [opts]    控制对象，包括以下控制选项
         * @param {Boolean} [opts.silent] 是否触发change事件
         */
        setChunkData: function(datakey, data, opts) {
            var self = this,
                dataset = self.get('dataset');
            if(dataset) {
                data = S.clone(data);
                dataset.set('data.' + datakey, data, opts);
            }
        },
        /**
         * 将模板渲染到页面
         */
        render: function() {
            var self = this;
            if(!self.get("rendered")) {
                /**
                 * @event beforeRenderUI
                 * fired when root node is ready
                 * @param {KISSY.Event.CustomEventObject} e
                 */

                self.fire('beforeRenderUI');
                var dataset = self.get('dataset');
                if(dataset) {
                    self._render('data', dataset.get('data'));
                }

                /**
                 * @event afterRenderUI
                 * fired after root node is rendered into dom
                 * @param {KISSY.Event.CustomEventObject} e
                 */
                self.fire('afterRenderUI');


                self.setInternal("rendered", true);

                /**
                 * @event beforeBindUI
                 * fired before component 's internal event is bind.
                 * @param {KISSY.Event.CustomEventObject} e
                 */

                self.fire('beforeBindUI');
                Chunk.superclass.bindInternal.call(self);
                self.callMethodByHierarchy("bindUI", "__bindUI");
                
                //兼容老的brix render后的初始化函数
                self.callMethodByHierarchy("initialize", "constructor");

                /**
                 * @event afterBindUI
                 * fired when component 's internal event is bind.
                 * @param {KISSY.Event.CustomEventObject} e
                 */

                self.fire('afterBindUI');

                /**
                 * @event beforeSyncUI
                 * fired before component 's internal state is synchronized.
                 * @param {KISSY.Event.CustomEventObject} e
                 */

                self.fire('beforeSyncUI');

                Chunk.superclass.syncInternal.call(self);
                self.callMethodByHierarchy("syncUI", "__syncUI");

                /**
                 * @event afterSyncUI
                 * fired after component 's internal state is synchronized.
                 * @param {KISSY.Event.CustomEventObject} e
                 */

                self.fire('afterSyncUI');

            }
            return self;
        },
        /**
         * 将模板渲染到页面
         * @param  {String} key  更新的数据对象key
         * @param  {Object} data 数据
         * @private
         */
        _render: function(key, data) {
            var self = this,
                tmpler = self.get('tmpler');
            if(tmpler) {
                if(key.split('.').length > 1) {
                    if(self.get("rendered")) {
                        //已经渲染，才能局部刷新
                        key = key.replace(/^data\./, '');
                        self._renderTmpl(tmpler.tmpls, key, data);
                    }
                } else {
                    if(!tmpler.inDom) {
                        var container = self.get('container');
                        var el = self.get('el');
                        var html = S.trim(tmpler.render(data));
                        var node;
                        if((!el || el.length === 0)) {
                            var elID = 'brix_' + S.guid();
                            if(UA.ie <= 8) {
                                node = new Node('<div />');
                                container.append(node);
                                node.html(html);
                                var childs = node[0].childNodes;
                                if(childs.length > 1) {
                                    node.attr('id', elID);
                                } else {
                                    elID = childs[0].id || elID;
                                    childs[0].id = elID;
                                    while(childs.length > 0) {
                                        container[0].appendChild(childs[0]);
                                    }
                                    node.remove();
                                    node = null;
                                }
                            } else {
                                node = new Node(html);
                                if(node.length > 1) {
                                    node = $('<div id="' + elID + '"></div>').append(node);
                                } else {
                                    elID = node.attr('id') || elID;
                                    node.attr('id', elID);
                                }
                                container.append(node);
                            }
                            self.set('el', '#' + elID);
                        } else {
                            if(UA.ie <= 8) {
                                node = new Node('<div />');
                                container.append(node);
                                node.html(html);
                                while(node[0].childNodes.length > 0) {
                                    container[0].appendChild(node[0].childNodes[0]);
                                }
                                node.remove();
                                node = null;
                            } else {
                                container.append(html);
                            }
                        }
                    }
                }
            }
        },
        /**
         * 渲染模板
         * @param  {Array} tmpls  tmpls集合
         * @param  {String} key   更新的数据对象key
         * @param  {Object} data 数据
         * @private
         */
        _renderTmpl: function(tmpls, key, data) {
            var self = this,
                el = self.get('el');
            S.each(tmpls, function(o) {
                if((',' + o.datakey + ',').indexOf(',' + key + ',') >= 0) {
                    var nodes = el.all('[bx-tmpl=' + o.name + ']');
                    //如果el本身也是tmpl，则加上自己
                    if(el.attr('bx-tmpl') == o.name) {
                        nodes = el.add(nodes);
                    }
                    nodes.each(function(node) {
                        if(node.attr('bx-datakey') == o.datakey) {
                            var newData = {};
                            S.each(o.datakey.split(','), function(item) {
                                var tempdata = data,
                                    temparr = item.split('.'),
                                    length = temparr.length,
                                    i = 0;
                                while(i !== length) {
                                    tempdata = tempdata[temparr[i]];
                                    i++;
                                }
                                newData[temparr[length - 1]] = tempdata;
                                tempdata = null;
                            });
                            S.each(data, function(d, k) {
                                if(S.isFunction(d)) {
                                    newData[k] = d;
                                }
                            });
                            /**
                             * @event beforeRefreshTmpl
                             * 局部刷新前触发
                             * @param {KISSY.Event.CustomEventObject} e
                             */
                            self.fire('beforeRefreshTmpl', {
                                node: node
                            });
                            node.html(S.trim(o.tmpler.render(newData)));
                            /**
                             * @event beforeRefreshTmpl
                             * 局部刷新后触发
                             * @param {KISSY.Event.CustomEventObject} e
                             */
                            self.fire('afterRefreshTmpl', {
                                node: node
                            });
                            newData = null;
                        }
                    });
                    nodes = null;
                }
            });
        }
    }, {
        ATTRS: {
            /**
             * 组件节点
             * @cfg {String}
             */
            el: {
                getter: function(s) {
                    if(S.isString(s)) {
                        s = $(s);
                    }
                    return s;
                }
            },
            /**
             * 销毁操作时候的动作，默认remove。
             * 可选none:什么都不做，empty:清空内部html
             * @cfg {String}
             */
            destroyAction:{
                value:'remove'
            },
            /**
             * 容器节点
             * @cfg {String}
             */
            container: {
                value: 'body',
                getter: function(s) {
                    if(S.isString(s)) {
                        s = $(s);
                    }
                    return s;
                }
            },
            /**
             * 模板代码，如果是已经渲染的html元素，则提供渲染html容器节点选择器
             * @cfg {String}
             */
            tmpl: {
                value: false
            },
            /**
             * 解析后的模板对象
             * @type {Brix.Tmpler}
             */
            tmpler: {
                value: false
            },
            /**
             * 是否已经渲染
             * @type {Boolean}
             */
            rendered: {
                value: false
            },
            /**
             * 是否自动渲染
             * @cfg {Boolean}
             */
            autoRender: {
                value: true
            },
            /**
             * 模板数据
             * @cfg {Object}
             */
            data: {
                value: false
            },
            /**
             * 解析后的数据对象
             * @type {Brix.Dataset}
             */
            dataset: {
                value: false
            },
            /**
             * 子模板解析的层级
             * @cfg {Number}
             */
            level: {
                value: 3
            }
        }
    });
    return Chunk;
}, {
    requires: ["node", 'ua', "rich-base", "./dataset", "./tmpler"]
});
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
                var action = self.get('destroyAction');
                var el = self.get('el');
                switch(action){
                    case 'remove':
                        el.remove();
                        break;
                    case 'empty':
                        el.empty();
                        break;
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
KISSY.add("brix/core/pagelet", function(S, Chunk) {
    /**
     * 用以给brick打上id的标记,brick有id则返回
     * @method _stamp
     * @param el
     * @return {string}
     * @ignore
     */

    function _stamp(el) {
        if(!el.attr('id')) {
            var id;
            while((id =  S.guid('brix_brick_'))&&S.one('#' + id)) {

            }
            el.attr('id',id);
        }
        return el.attr('id');
    }
    /**
     * Brix Pagelet 是组件的管理器，实现组件的层次化渲染。
     * 一个页面由多个组件和非组件的HTML片段组成，实际创建过程中需要一个个动态创建，
     * 基于约定为大的原则，采用“钩子”和Mustache，自动化的完成组件渲染和行为附加
     * @extends Brix.Chunk
     * @class Brix.Pagelet
     */
    var Pagelet = Chunk.extend({
        initializer: function() {
            var self = this;
            //初始化属性
            self.isReady = false;
            self.readyList = [];
            self.bricks = [];
            self.isAddBehavior = false;
        },
        bindUI: function() {
            //增加参数回调
            var self = this;
            var callback = self.get('callback');
            if(callback && typeof callback === 'function') {
                self.ready(callback);
            }
            //自动添加行为渲染
            if(self.get('autoBehavior')) {
                self.addBehavior();
            }
        },
        /**
         * 获取brick的实例
         * @param  {String} id     brick的id
         * @return {Object}        组件实例
         */
        getBrick: function(id) {
            var self = this,
                brick;
            S.each(self.bricks, function(b) {
                if(b.id === id) {
                    brick = b.brick;
                    return false;
                }
            });
            return brick || null;
        },
        destroyBrick: function(id) {
            var self = this;
            for(var i = 0; i < self.bricks.length; i++) {
                var o = self.bricks[i];
                if(id === o.id) {
                    self._destroyBrick(o);
                    self.bricks.splice(i, 1);
                    return false;
                }
            }
        },
        /**
         * 销毁brick引用
         * @param  {Object} o 需要销毁的对象
         * @private
         */
        _destroyBrick: function(o) {
            if(o.brick) {
                o.brick.destroy && o.brick.destroy();
                o.brick = null;
            }
        },
        /**
         * 给组件添加行为
         */
        addBehavior: function() {
            var self = this;
            if(self.get('rendered') && !self.isAddBehavior) {
                self.isAddBehavior = true;
                var el = self.get('el');
                var brickNodes = el.all('[bx-name]');
                if(el.hasAttr('bx-name')) {
                    brickNodes = el.add(brickNodes);
                }
                self._addBehavior(brickNodes, function(bricks) {
                    self.bricks = bricks;
                    self._fireReady();
                    self.on('beforeRefreshTmpl', function(e) {
                        e.node.all('[bx-name]').each(function(node) {
                            self.destroyBrick(node.attr('id'));
                        });
                    });
                    self.on('afterRefreshTmpl', function(e) {
                        self._addBehavior(e.node.all('[bx-name]'), function(newBricks) {
                            if(newBricks.length > 0) {
                                self.bricks = self.bricks.concat(newBricks);
                            }
                        });
                    });
                });
            }
        },

        /**
         * 给组件添加行为
         * @param {NodeList}   brickNodes 组件node对象集合
         * @param {Function} fn     实例化完成后的回调事件
         */
        _addBehavior: function(brickNodes, fn) {
            var self = this,
                bxConfig = self.get('config'),
                bricks = [];
            brickNodes.each(function(brickNode) {
                var id = _stamp(brickNode),
                    name = brickNode.attr('bx-name'),
                    path = brickNode.attr('bx-path'),
                    config = brickNode.attr('bx-config');
                config = config ? (new Function("return " + config))() : {};
                if(bxConfig&&bxConfig[id]){
                    S.mix(config,bxConfig[id]);
                }
                bricks.push({
                    id: id,
                    name: name,
                    path: path,
                    config: config
                });
            });

            //构建pagelet需要引用组件js
            if(bricks.length > 0) {
                var useList = [];
                S.each(bricks, function(o) {
                    if(!o.path) {
                        o.path = 'brix/gallery/' + o.name + '/';
                    }
                    if(!S.inArray(useList, o.path)) {
                        useList.push(o.path);
                    }
                });
                self.fire('beforeAddBehavior',{useList:useList});
                //实例化pagelet所有组件
                S.use(useList.join(','), function(S) {
                    var useClassList = arguments;
                    S.each(bricks, function(o) {
                        var id = o.id;
                        var config = S.merge({
                            container: '#' + id,
                            el: '#' + id,
                            pagelet: self
                        }, o.config);
                        var TheBrick = useClassList[S.indexOf(o.path, useList) + 1];
                        var myBrick = new TheBrick(config);
                        o.brick = myBrick;
                    });
                    useClassList = null;
                    fn(bricks);
                });
            } else {
                fn(bricks);
            }

        },

        /**
         * 渲染完成后需要执行的函数
         * @param {Function} fn 执行的函数
         */
        ready: function(fn) {
            if(this.isReady) {
                fn.call(window, this);
            } else {
                this.readyList.push(fn);
            }
        },
        /**
         * 触发ready添加的方法
         * @private
         */
        _fireReady: function() {
            var self = this;
            if(self.isReady) {
                return;
            }
            self.isReady = true;
            if(self.readyList) {
                var fn, i = 0;
                while(fn = self.readyList[i++]) {
                    fn.call(self);
                }
                self.readyList = null;
            }
        },
        /**
         * 销毁组件或者pagelet
         * @param  {String} id 组件id,如果带了id，销毁组件
         */
        destructor: function() {
            var self = this;
            S.each(self.bricks, function(o, i) {
                self._destroyBrick(o);
            });
            self.bricks = null;
            if(self.get('rendered')) {
                var action = self.get('destroyAction');
                var el = self.get('el');
                switch(action){
                    case 'remove':
                        el.remove();
                        break;
                    case 'empty':
                        el.empty();
                        break;
                }
                el = null;
            }
        }
    }, {
        ATTRS: {
            /**
             * 自动添加组件行为
             * @cfg {Boolean}
             */
            autoBehavior: {
                value: true
            },
            /**
             * 行为添加完成后的回调方法
             * @cfg {Function}
             */
            callback: {
                value: null
            },
            /**
             * 增加pagelet对brick组件的配置增强,示例：{id:{xx:{},yy:{}}}
             * @cfg {Object}
             */
            config:{
                value:{}
            }
        }
    },'Pagelet');
    return Pagelet;
}, {
    requires: ['./chunk']
});
KISSY.add("brix/core/demolet", function(S, Pagelet, IO, Node) {
    var $ = Node.all;

    //存储已经加载的CSS
    var hasLoadCSS = {};
    /**
     * 同步载入样式，保证串行加载
     * @param  {String} path css路径
     * @ignore
     */

    function loadCSS(path) {
        if(hasLoadCSS[path]) {
            return false;
        }
        hasLoadCSS[path] = true;
        IO({
            url: path,
            dataType: 'text',
            async: false,
            complete: function(d, textStatus, xhrObj) {
                if(textStatus == 'success') {
                    $('<style>' + d + '</style>').appendTo('head');
                }
            }
        });
    }

    /**
     * 同步获取默认模板和数据，多在demo页构建中使用
     * @param  {String} tmpl 模板文件
     * @param  {Object} data 数据对象
     * @param  {String} s    分割符号，默认‘@’
     * @return {Object}      模板和数据的对象{tmpl:tmpl,data:data}
     * @ignore
     */

    function getTmplData(tmpl, data, s) {
        s = s || '@';
        data = data || {};
        var reg = new RegExp('\\{\\{' + s + '(.+)?\\}\\}', "ig");
        tmpl = tmpl.replace(reg, function($1, $2) {
            S.log($2);
            var str = '';
            var p = $2.replace(/\//ig, '_').replace(/\./ig, '_');
            data[p] = data[p] || {};
            IO({
                url: $2 + 'template.html',
                dataType: 'html',
                async: false,
                success: function(d, textStatus, xhrObj) {
                    str = '{{#' + p + '}}' + d + '{{/' + p + '}}';
                }
            });
            IO({
                url: $2 + 'data.json',
                async: false,
                dataType: 'json',
                success: function(d, textStatus, xhrObj) {
                    for(var k in d) {
                        data[p][k] = d[k];
                    }
                }
            });
            return str;
        });
        return {
            tmpl: tmpl,
            data: data
        };
    }

    /**
     * Brix Demolet 用来构建约定的template.html和data.json的占坑demo页面
     * @extends Brix.Pagelet
     * @class Brix.Demolet
     */
    var Demolet = Pagelet.extend({
        initializer: function() {
            var self = this;
            //在组件渲染前，加载所有的css
            self.on('beforeAddBehavior', function(ev) {
                S.each(self.get('projectCSS'), function(path) {
                    loadCSS(path);
                });
                var useList = ev.useList;
                S.each(useList, function(path) {
                    if(S.startsWith(path,'brix/')) {
                        S.use(path + 'index.css');//核心组件采用模块方式加载
                    } else {
                        var length = 3;
                        if(S.startsWith(path,'imports/')) {
                            //imports有5个层级imports/namespace/componentname/version/index.js
                            length = 5;
                        }
                        var arr = path.split('/');
                        if(arr.length > length) {
                            arr.splice(arr.length - 2);
                            loadCSS(arr.join('/') + '/index.css');
                        }
                        loadCSS(path.substring(0,path.lastIndexOf('/')) + '/index.css');
                    }
                });

            });
        }
    }, {
        ATTRS: {
            /**
             * 项目的样式
             * @cfg {Array}
             */
            projectCSS: {
                value: [],
                setter:function(v){
                    if(S.isArray(v)){
                        return v;
                    }else{
                        return [v];
                    }
                }
            },
            /**
             * 分割符号
             * @cfg {String}
             */
            s: {
                value: '@'
            },
            /**
             * 模板,如果外部需要传入data，请把data属性设置在前，因为这个内部会会对data进行处理
             * @cfg {String}
             */
            tmpl: {
                setter: function(v) {
                    var self = this,
                        data = self.get('data') || {};
                    var tmplData = getTmplData(v, data, self.get('s'));
                    self.set('data', tmplData.data);
                    return tmplData.tmpl;
                }
            }
        }
    }, 'Demolet');
    return Demolet;
}, {
    requires: ['./pagelet', 'ajax', 'node']
});
/**
 * Brix配置类 组件框架入口类，在调用Brix组件的时候可以配置cdn地址，组件版本号等
 * <br><a href="../demo/core/brix.html" target="_blank">Demo</a>
 * <br>
 * 引用：
 *
 *     <script type="text/javascript" src="brix.js" bx-config="{autoConfig:true,autoPagelet:true}"></script>
 *
 * bx-config节点说明：<br>
 *     autoConfig：自动配置包和map
 *     autoPagelet：自动渲染body节点下的所有bx-name组件
 *     componentsPath：项目组件包路径
 *     componentsTag：项目组件时间戳
 *     importsPath：项目公用组件包路径
 *     importsTag：项目公用组件时间戳
 *     gallery：组件版本配置
 *     tag：核心组件的时间戳
 *     debug:是否启用非压缩版本
 *
 * bx-config高级配置：<br>
 *     fixed：对包路径的重写（不清楚的不要配）
 * @class Brix
 */
(function(S, Brix) {
    var isReady = false,
        readyList = [],
        win = window,
        loc = win.location,
        startsWith = S.startsWith,
        __pagePath = loc.href.replace(loc.hash, "").replace(/[^\/]*$/i, "");
    Brix = win[Brix] = win[Brix] || {};

    //从KISSY源代码提取并改动适合brix的
    /**
     * 相对路径文件名转换为绝对路径
     * @param path
     * @ignore
     */

    function absoluteFilePath(path) {
        path = S.trim(path);

        // path 为空时，不能变成 "/"
        if(path && path.charAt(path.length - 1) != '/') {
            path += "/";
        }

        /**
         * 一定要正则化，防止出现 ../ 等相对路径
         * 考虑本地路径
         * @ignore
         */
        if(!path.match(/^(http(s)?)|(file):/i) && !startsWith(path, "/")) {
            path = __pagePath + path;
        }

        if(startsWith(path, "/")) {
            var loc = win.location;
            path = loc.protocol + "//" + loc.host + path;
        }
        var paths = path.split("/"),
            re = [],
            p;
        for(var i = 0; i < paths.length; i++) {
            p = paths[i];
            if(p == ".") {} else if(p == "..") {
                re.pop();
            } else {
                re.push(p);
            }
        }
        path = re.join("/");
        return path.substring(0, path.length - 1);
    }

    function getBaseInfo() {
        // get path from current script file path
        // notice: timestamp
        var pathReg = /^(.*)brix(-min)?\.js[^\/]*/i,
            pathTestReg = /brix(-min)?\.js/i,
            scripts = win.document.getElementsByTagName('script'),
            script = scripts[scripts.length - 1],
            src = absoluteFilePath(script.src),
            pathInfo = script.getAttribute("bx-config");
        if(pathInfo) {
            pathInfo = (new Function("return " + pathInfo))();
        } else {
            pathInfo = {};
        }
        pathInfo.comboPrefix = pathInfo.comboPrefix || '??';
        pathInfo.comboSep = pathInfo.comboSep || ',';

        var comboPrefix = pathInfo.comboPrefix,
            comboSep = pathInfo.comboSep,
            parts = src.split(comboSep),
            path, part0 = parts[0],
            part01, index = part0.indexOf(comboPrefix);

        // no combo
        if(index == -1) {
            path = src.replace(pathReg, '$1');
        } else {
            path = part0.substring(0, index);
            part01 = part0.substring(index + 2, part0.length);
            // combo first
            // notice use match better than test
            if(part01.match(pathTestReg)) {
                path += part01.replace(pathReg, '$1');
            }
            // combo after first
            else {
                S.each(parts, function(part) {
                    if(part.match(pathTestReg)) {
                        path += part.replace(pathReg, '$1');
                        return false;
                    }
                });
            }
        }
        path = path.substring(0, path.lastIndexOf('brix'));
        return S.mix({
            autoConfig: true,
            path: path,
            componentsPath: './',
            importsPath: './'
        }, pathInfo);
    }
    var defaultOptions = getBaseInfo();
    var debug = ''; //区分src还是dist版本
    var tag = '20121226'; //KISSY包时间戳
    var version = '2.0'; //版本号
    var isConfig = false; //是否已经配置过
    S.mix(Brix, {
        /**
         * 配置路径
         * @param  {Object} options 配置对象，详见bx-config配置节点
         */
        config: function(options) {
            if(isConfig) {
                return;
            }
            isConfig = true;
            options = S.merge({
                debug: debug == '@DEBUG@' ? true : false,
                tag: tag == '@TAG@' ? '' : tag,
                fixed: version == '@VERSION@' ? '' : version + '/',
                //路径修正，brix路劲下存在其他文件夹
                gallery: {
                    //配置组件版本信息
                    //dropdown:'1.0'
                }
            }, defaultOptions, options);
            if(options.fixed == '@VERSION@') {
                options.fixed = '';
            }
            Brix.basePath = options.path;
            Brix.fixed = options.fixed;
            S.config({
                packages: [{
                    name: "brix",
                    path: options.path,
                    tag: options.tag,
                    charset: "utf-8"
                }, {
                    name: "components",
                    path: options.componentsPath,
                    tag: options.componentsTag || options.tag,
                    charset: "utf-8"
                }, {
                    name: "imports",
                    path: options.importsPath,
                    tag: options.importsTag || options.tag,
                    charset: "utf-8"
                }]
            });
            S.config({
                map: [
                    [/(.+brix\/)(gallery\/)(.+?)(\/.+?(?:-min)?\.(?:js|css))(\?[^?]+)?$/, function($0, $1, $2, $3, $4, $5) {
                        var str = $1 + options.fixed + $2 + $3;
                        if(options.gallery[$3]) {
                            str += '/' + options.gallery[$3];
                        }
                        if(options.debug) {
                            $4 = $4.replace('-min', '');
                        }
                        str += $4 + ($5 ? $5 : '');
                        return str;
                    }],
                    [/(.+brix\/)(core.+?)((?:-min)?\.js)(\?[^?]+)?$/, function($0, $1, $2, $3, $4) {
                        var str = $1 + options.fixed;
                        if(options.debug) {
                            $3 = $3.replace('-min', '');
                        }
                        str += $2 + $3 + ($4 ? $4 : '');
                        return str;
                    }]
                ]
            });
        },
        /**
         * 渲染完成后需要执行的函数
         * @param {Function} fn 执行的函数
         */
        ready: function(fn) {
            if(isReady) {
                fn.call(Brix);
            } else {
                readyList.push(fn);
            }
        },
        /**
         * 触发ready添加的方法
         * @private
         */
        _fireReady: function() {
            if(isReady) {
                return;
            }
            isReady = true;
            if(readyList) {
                var fn, i = 0;
                while(fn = readyList[i++]) {
                    fn.call(Brix);
                }
                readyList = null;
            }
        }
    });
    if(defaultOptions.autoConfig) {
        //自动配置
        Brix.config({});
        //自动实例化pagelet
        //外部调用的S.ready注册的方法中可以直接用Brix.pagelet实例书写业务逻辑
        if(defaultOptions.autoPagelet) {
            S.use('brix/core/pagelet', function(S, Pagelet) {
                S.ready(function() {
                    Brix.pagelet = new Pagelet({
                        tmpl: 'body'
                    });
                    Brix._fireReady();
                });
            });
            return;
        }
    }
    S.ready(function() {
        Brix._fireReady();
    });
}(KISSY, 'Brix'));