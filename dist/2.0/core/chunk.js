KISSY.add("brix/core/chunk", function(S, Node, UA, RichBase, Dataset, Tmpler) {
    var $ = Node.all;
    var noop = S.noop;

    /**
     * 判断两个数组数否有重复值
     * @param  {Array}  arr1 数组1
     * @param  {Array}  arr2 数组2
     * @return {Boolean}     是否有重复
     * @ignore
     */

    function isDitto(arr1, arr2) {
        for (var i = 0; i < arr1.length; i++) {
            for (var j = 0; j < arr2.length; j++) {
                if (arr1[i] == arr2[j]) {
                    return true;
                }
            }
        }
        return false;
    }
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
     * <a href="http://docs.kissyui.com/1.3/api/#!/api/KISSY.RichBase">RichBase</a>
     *
     * @property ATTRS
     * @member KISSY.RichBase
     * @static
     * @type {Object}
     */


    /**
     * 实例销毁,会依次调用类的destructor函数
     * @method destroy
     * @member KISSY.RichBase
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
            if (self.get('autoRender') || !tmpler || tmpler.inDom) {
                self.render();
            }
        },

        // change routine from rich-base for uibase
        bindInternal: noop,

        // change routine from rich-base for uibase
        syncInternal: noop,
        /**
         * 初始化,在实例化对象时调用
         * @protected
         */
        initializer: function() {
            var self = this;
            var tmpl = self.get('tmpl');
            if (tmpl) {
                self._bx_buildTmpler(tmpl, self.get('level'));
                var tmpler = self.get('tmpler');
                if (tmpler) {
                    self._bx_buildDataset(self.get('data'));
                    if (tmpler.inDom) {
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
        _bx_buildTmpler: function(tmpl, level) {
            var self = this;
            if (!self.get('isBuidTmpler')) {
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
        _bx_buildDataset: function(data) {
            var self = this;
            if (!self.get('isBuidDataset')) {
                self.set('isBuidDataset', true);
                data = S.clone(data || {}); //原始数据深度克隆
                var dataset = new Dataset({
                    data: data
                });
                var renderer = self.get('renderer');
                if(renderer){
                    dataset.setRenderer(renderer, self);
                }
                self.set('dataset', dataset); //设置最新的数据集合
                dataset.on('*Change', function(e) {
                    var flg = false; //是否data数据变化
                    var keys = S.map(e.subAttrName, function(str) {
                        if (/^data\./g.test(str)) {
                            flg = true;
                            return str.replace(/^data\./, '');
                        }
                        return 'zuomo.xb@taobao.com'; //彩蛋，哈哈。
                    });
                    if (flg) {
                        self._bx_renderTmpl(keys, dataset.get('data'));
                    }
                });
            }
        },
        /**
         * 销毁（destroy）时候调用
         * @protected
         */
        destructor: function() {
            var self = this;
            var tmpler = self.get('tmpler');
            var dataset = self.get('dataset');
            if (tmpler) {
                self.set('tmpler', null);
            }
            if (dataset) {
                self.set('dataset', null);
                dataset.detach();
            }
            self.detach();
        },

        /**
         * 为子类组件的绑定逻辑，替代1.0版本brix的initialize方法
         * @protected
         * @method
         */
        bindUI: noop,

        /**
         * 同步属性与用户界面
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
        addSubTmpl: function(name, datakey, tmpl) {
            var self = this;
            self._bx_buildTmpler('', false);
            self._bx_buildDataset();
            if (name) {
                var tmpler = self.get('tmpler');
                tmpler.addSubTmpl(name, datakey, tmpl);
            }
        },
        /**
         * 获取存储的模板字符串
         * @param {String} id 模板标识，在{{#bx-tmpl-id}}指定的id
         * @return {String} 模板字符串
         */
        getStoreTmpl: function(id) {
            var self = this;
            var tmpler = self.get('tmpler');
            if(tmpler){
                return tmpler.getStoreTmpl(id);
            }
            return '';
        },

        /**
         * 设置数据，并刷新模板数据
         * @param {String} datakey 需要更新的数据对象key
         * @param {Object} data    数据对象
         * @param {Object} [opts]    控制对象，包括以下控制选项
         * @param {Boolean} [opts.silent] 是否触发change事件
         * @param {Function} [opts.error] 验证失败的回调，包括失败原因
         * @param {String} [opts.renderType] 渲染类型，目前支持html，append，prepend
         */
        setChunkData: function(datakey, data, opts) {
            var self = this;
            var dataset = self.get('dataset');
            if (dataset) {
                if (S.isObject(datakey)) {
                    datakey = S.clone(datakey);
                    var newData = {};
                    for (var key in datakey) {
                        newData['data.' + key] = datakey[key];
                    }
                    datakey = newData;
                    opts = data;
                } else {
                    datakey = 'data.' + datakey;
                    data = S.clone(data);
                }

                //根据传入的opts,设置renderType
                var renderType = 'html';
                if (opts) {
                    if (opts.renderType) {
                        renderType = opts.renderType;
                        delete opts.renderType;
                    }
                }
                self.set('renderType', renderType);

                dataset.set.apply(dataset, arguments);
            }
        },
        /**
         * 将模板渲染到页面
         */
        render: function() {
            var self = this;
            if (!self.get("rendered")) {
                /**
                 * @event beforeRenderUI
                 * fired when root node is ready
                 * @param {KISSY.Event.CustomEventObject} e
                 */

                self.fire('beforeRenderUI');
                var dataset = self.get('dataset');
                if (dataset) {
                    self._bx_render(dataset.get('data'));
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
         * @param  {Object} data 数据
         * @private
         */
        _bx_render: function(data) {
            var self = this;
            var tmpler = self.get('tmpler');
            if (tmpler && !tmpler.inDom) {
                var container = self.get('container');
                var el = self.get('el');
                var html = S.trim(tmpler.render(data));
                var node;
                //下面增加浏览器的判断，
                //是因为创建dom时候，不同浏览器对自定义标签（比如：vframe）的支持不同。
                if ((!el || el.length === 0)) {
                    var elID = 'brix_' + S.guid();
                    if (UA.ie <= 8) {
                        node = new Node('<div />');
                        container.append(node);
                        node.html(html);
                        var childs = node[0].childNodes;
                        if (childs.length > 1) {
                            node.attr('id', elID);
                        } else {
                            elID = childs[0].id || elID;
                            childs[0].id = elID;
                            while (childs.length > 0) {
                                container[0].appendChild(childs[0]);
                            }
                            node.remove();
                            node = null;
                        }
                    } else {
                        node = new Node(html);
                        if (node.length > 1) {
                            node = $('<div id="' + elID + '"></div>').append(node);
                        } else {
                            elID = node.attr('id') || elID;
                            node.attr('id', elID);
                        }
                        container.append(node);
                    }
                    self.set('el', '#' + elID);
                } else {
                    if (UA.ie <= 8) {
                        node = new Node('<div />');
                        container.append(node);
                        node.html(html);
                        while (node[0].childNodes.length > 0) {
                            container[0].appendChild(node[0].childNodes[0]);
                        }
                        node.remove();
                        node = null;
                    } else {
                        container.append(html);
                    }
                }
            }
        },
        /**
         * 渲染局部模板
         * @param  {Array} keys  更新的数据对象key
         * @param  {Object} data 数据
         * @private
         */
        _bx_renderTmpl: function(keys, data) {
            var self = this;
            var tmpler = self.get('tmpler');
            if (tmpler && self.get('rendered')) {
                var el = self.get('el');
                var subTmpls = tmpler.subTmpls;
                S.each(subTmpls, function(o) {
                    var datakeys = S.map(o.datakey.split(','), function(str) {
                        return S.trim(str); //修复编辑器格式化造成的问题
                    });
                    if (isDitto(datakeys, keys)) {
                        var nodes = el.all('[bx-tmpl=' + o.name + ']');
                        //如果el本身也是tmpl，则加上自己
                        if (el.attr('bx-tmpl') == o.name) {
                            nodes = el.add(nodes);
                        }
                        nodes.each(function(node) {
                            if (node.attr('bx-datakey') == o.datakey) {
                                var newData = {};
                                S.each(datakeys, function(item) {
                                    var tempdata = data,
                                        temparr = item.split('.'),
                                        length = temparr.length,
                                        i = 0;
                                    while (i !== length) {
                                        tempdata = tempdata[temparr[i]];
                                        i++;
                                    }
                                    newData[temparr[length - 1]] = tempdata;
                                    tempdata = null;
                                });
                                S.each(data, function(d, k) {
                                    if (S.isFunction(d)) {
                                        newData[k] = d;
                                    }
                                });
                                var renderType = self.get('renderType') || 'html';
                                /**
                                 * @event beforeRefreshTmpl
                                 * 局部刷新前触发
                                 * @param {KISSY.Event.CustomEventObject} e
                                 */
                                self.fire('beforeRefreshTmpl', {
                                    node: node,
                                    renderType: renderType
                                });
                                node[renderType](S.trim(o.tmpler.render(newData)));
                                /**
                                 * @event afterRefreshTmpl
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
        }
    }, {
        ATTRS: {
            /**
             * 组件节点
             * @cfg {String}
             */
            el: {
                getter: function(s) {
                    if (S.isString(s)) {
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
            destroyAction: {
                value: 'remove'
            },
            /**
             * 容器节点
             * @cfg {String}
             */
            container: {
                value: 'body',
                getter: function(s) {
                    if (S.isString(s)) {
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
             * 数据扩展
             * @cfg {Object}
             */
            renderer:{
                value:false
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