KISSY.add("brix/core/chunk", function(S, Node, UA, Base, Dataset, Tmpler) {
    var $ = Node.all;
    /**
     * Brix Chunk,Brick和Pagelet类的基类,
     * 作为组件底层，完成渲染、数据更新、销毁操作，是模板解析器（Tmpler）和数据管理器（Dataset）的调度者。
     * @extends KISSY.Base
     * @class Brix.Chunk
     */

    function Chunk() {
        Chunk.superclass.constructor.apply(this, arguments);
        this._buildTmpler();
        if(!this.get('id')){
            this.set('id','brix_'+S.guid());
        }
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
     * <a href="http://docs.kissyui.com/kissy/docs/#!/api/KISSY.Base">http://docs.kissyui.com/kissy/docs/#!/api/KISSY.Base</a>
     *
     * @property ATTRS
     * @member KISSY.Base
     * @static
     * @type {Object}
     */

    Chunk.ATTRS = {
        /**
         * 当前pagelet或者brick的唯一标识
         * @cfg {String}
         */
        id: {
            value: false
        },
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
         * 在销毁的时候是否移除本身，默认true
         * @cfg {Object}
         */
        isRemoveEl:{
            value:true
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
        }
    };

    S.extend(Chunk, Base, {
        /**
         * 构建模板解析器
         * @private
         */
        _buildTmpler: function() {
            var self = this,
                tmpler = self.get('tmpler');
            if(!tmpler) {
                var tmpl = self.get('tmpl');
                if(tmpl) {
                    tmpler = new Tmpler(tmpl);
                    self.set('tmpler', tmpler);
                    if(tmpler.inDom) {
                        self.set('el', tmpl);
                    }
                }
            }
            if(tmpler && !tmpler.inDom) {
                self._buildDataset();
            }
        },
        /**
         * 构建数据管理器
         * @private
         */
        _buildDataset: function() {
            var self = this;
            var dataset = self.get('dataset');
            if(!dataset) {
                var data = self.get('data') || {}; //原始数据
                data = S.clone(data); //数据深度克隆
                dataset = new Dataset({
                    data: data
                });
                self.set('dataset', dataset); //设置最新的数据集合
            }
            dataset.on('afterDataChange', function(e) {
                self._render(e.subAttrName, e.newVal);
            });
        },

        /**
         * 添加子模板
         * @param {String} name    模板名称
         * @param {String} datakey 模板对应的数据key
         * @param {[type]} tmpl    子模板
         */
        addTmpl: function(name,datakey,tmpl) {
            var self = this,
                tmpler = self.get('tmpler');
            if(tmpler) {
                tmpler.addTmpl(name,datakey,tmpl);
            }
        },

        /**
         * 设置数据，并刷新模板数据
         * @param {String} datakey 需要更新的数据对象key
         * @param {Object} data    数据对象
         */
        setChunkData: function(datakey, data) {
            var self = this,
                dataset = self.get('dataset');
            if(dataset) {
                data = S.clone(data);
                dataset.set('data.' + datakey, data);
            }
        },
        /**
         * 将模板渲染到页面
         */
        render: function() {
            var self = this;
            if(!self.get("rendered")) {
                var dataset = self.get('dataset');
                if(dataset) {
                    self._render('data', dataset.get('data'));
                }
                self.set("rendered", true);
                self.fire('rendered');
            }
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
                        var html = tmpler.to_html(data);
                        if((!el || el.length == 0)) {
                            var elID = self.get('id');
                            if(UA.ie <= 8) {
                                var node = new Node('<div />');
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
                                }
                            } else {
                                var node = new Node(html);
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
                                var node = new Node('<div />');
                                container.append(node);
                                node.html(html);
                                while(node[0].childNodes.length > 0) {
                                    container[0].appendChild(node[0].childNodes[0]);
                                }
                                node.remove();
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
            key = ',' + key + ','
            var nodes = el.all('[bx-tmpl]');
            nodes.each(function(node) {
                var datakey = ',' + node.attr('bx-datakey') + ',';
                if(datakey.indexOf(key) >= 0) {
                    S.each(tmpls, function(o) {
                        if(node.attr('bx-tmpl') == o.name && node.attr('bx-datakey') == o.datakey) {
                            var arr = datakey.split(',');
                            var newData = {};
                            S.each(arr, function(item) {
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
                            node.html(o.tmpler.to_html(newData));
                            newData = null;
                        }
                    });
                }
            });
        }
    });
    return Chunk;
}, {
    requires: ["node", 'ua', "base", "./dataset", "./tmpler"]
});