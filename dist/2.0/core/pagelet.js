KISSY.add("brix/core/pagelet", function(S, Chunk) {
    /**
     * 用以给brick打上id的标记,brick有id则返回
     * @method _stamp
     * @param el
     * @return {string}
     * @ignore
     */

    function _stamp(el) {
        if (!el.attr('id')) {
            var id;
            //判断页面id是否存在，如果存在继续随机。
            while ((id = S.guid('brix_brick_')) && S.one('#' + id)) {}
            el.attr('id', id);
        }
        return el.attr('id');
    }
    /**
     * Brix Pagelet 是组件的管理器，实现组件的渲染。
     * 一个页面由多个组件和非组件的HTML片段组成，实际创建过程中需要一个个动态创建，
     * 基于约定为大的原则，采用“钩子”和模板引擎，自动化的完成组件渲染和行为附加
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
            self.destroyed = false; //是否销毁的标志位。
            self.bxCounter = 0;
        },
        bindUI: function() {
            //增加参数回调
            var self = this;
            var callback = self.get('callback');
            if (callback && typeof callback === 'function') {
                self.ready(callback);
            }
            //自动添加行为渲染
            if (self.get('autoBehavior')) {
                self.addBehavior();
            }
        },
        /**
         * 根据dom id，获取brick的实例
         * @param  {String} id     brick的id
         * @return {Object}        组件实例
         */
        getBrick: function(id) {
            var self = this;
            var brick = null;
            S.each(self.bricks, function(b) {
                if (b.id === id) {
                    brick = b.brick;
                    return false;
                }
            });
            return brick;
        },
        /**
         * 根据bx-name，获取brick的实例数组
         * @param  {String} name     brick的bx-name
         * @return {Array}           组件实例数组
         */
        getBricks: function(name) {
            var self = this;
            var bricks = [];
            S.each(self.bricks, function(b) {
                if (b.name === name) {
                    bricks.push(b.brick);
                }
            });
            return bricks;
        },
        /**
         * 销毁组件
         * @param {String} id 组件id
         */
        destroyBrick: function(id) {
            var self = this;
            for (var i = 0; i < self.bricks.length; i++) {
                var o = self.bricks[i];
                if (id === o.id) {
                    self._bx_destroyBrick(o);
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
        _bx_destroyBrick: function(o) {
            o.destroyed = true;
            if (o.brick) {
                o.brick.destroy && o.brick.destroy();
                o.brick = null;
            }
        },
        /**
         * 给组件添加行为
         */
        addBehavior: function() {
            var self = this;
            if (self.get('rendered') && !self.isAddBehavior) {
                self.isAddBehavior = true;
                var el = self.get('el');
                var brickNodes = el.all('[bx-name]');
                if (el.hasAttr('bx-name')) {
                    brickNodes = el.add(brickNodes);
                }
                self._bx_addBehavior(brickNodes, function(bricks) {
                    self.bricks = bricks;
                }, function() {
                    self.on('beforeRefreshTmpl', function(e) {
                        self.bxCounter++;
                        if (e.renderType === 'html') {
                            e.node.all('[bx-name]').each(function(node) {
                                self.destroyBrick(node.attr('id'));
                            });
                        }
                    });
                    self.on('afterRefreshTmpl', function(e) {
                        self._bx_addBehavior(e.node.all('[bx-name]'), function(newBricks) {
                            if (newBricks.length > 0) {
                                self.bricks = self.bricks.concat(newBricks);
                            }
                        }, function() {
                            self.bxCounter--;
                            if(self.bxCounter===0){
                                self._bx_fireReady();
                            }
                        });
                    });
                    self._bx_fireReady();
                });
            }
        },

        /**
         * 给组件添加行为
         * @param {NodeList} brickNodes 组件node对象集合
         * @param {Function} fn 页面元素解析完成执行的方法,同步执行
         * @param {Function} callback 实例化完成后的回调事件，异步执行
         * @private
         */
        _bx_addBehavior: function(brickNodes, fn, callback) {
            var self = this;
            var bxConfig = self.get('config');
            var bricks = [];
            self.isReady = false;
            brickNodes.each(function(brickNode) {
                if (brickNode.attr('bx-behavior') != 'true') {
                    var id = _stamp(brickNode),
                        name = brickNode.attr('bx-name'),
                        path = brickNode.attr('bx-path'),
                        config = Brix.returnJSON(brickNode.attr('bx-config'));
                    if (bxConfig && bxConfig[id]) {
                        S.mix(config, bxConfig[id]);
                    }
                    brickNode.attr('bx-behavior', 'true');
                    bricks.push({
                        id: id,
                        name: name,
                        path: path,
                        config: config
                    });
                }
            });

            //构建pagelet需要引用组件js
            if (bricks.length > 0) {
                var useList = [];
                S.each(bricks, function(o) {
                    if (!o.path) {
                        o.path = 'brix/gallery/' + o.name + '/';
                    }
                    if (!S.inArray(useList, o.path) && !o.config.autoBrick) {
                        useList.push(o.path);
                    }
                });
                /**
                 * @event beforeAddBehavior
                 * fired before component is instantiated
                 * @param {KISSY.Event.CustomEventObject} e
                 */
                self.fire('beforeAddBehavior', {
                    useList: useList
                });
                fn && fn(bricks);
                //实例化pagelet所有组件
                S.use(useList.join(','), function(S) {
                    if (self.destroyed) {
                        return;
                    }
                    var useClassList = arguments;
                    S.each(bricks, function(o) {
                        if (!o.destroyed && !o.config.autoBrick) {
                            var id = o.id;
                            var config = S.merge({
                                container: '#' + id,
                                el: '#' + id,
                                pagelet: self
                            }, o.config);
                            var TheBrick = useClassList[S.indexOf(o.path, useList) + 1];
                            var myBrick = new TheBrick(config);
                            o.brick = myBrick;
                        }
                    });
                    /**
                     * @event afterAddBehavior
                     * fired after component is instantiated
                     * @param {KISSY.Event.CustomEventObject} e
                     */
                    self.fire('afterAddBehavior', {
                        useList: useList,
                        bricks: bricks
                    });
                    useList = null;
                    useClassList = null;
                    callback && callback();
                });
            } else {
                fn && fn(bricks);
                callback && callback();
            }

        },

        /**
         * 渲染完成后需要执行的函数
         * @param {Function} fn 执行的函数
         */
        ready: function(fn) {
            if (this.isReady) {
                fn.call(window, this);
            } else {
                this.readyList.push(fn);
            }
        },
        /**
         * 触发ready添加的方法
         * @private
         */
        _bx_fireReady: function() {
            var self = this;
            if (self.isReady) {
                return;
            }
            self.isReady = true;
            //局部变量，保证所有注册方法只执行一次
            var readyList = self.readyList;
            self.readyList = [];
            if (readyList.length > 0) {
                var fn, i = 0;
                while (fn = readyList[i++]) {
                    fn.call(self);
                }
            }
            readyList = null;
        },
        destructor: function() {
            var self = this;
            S.each(self.bricks, function(o, i) {
                self._bx_destroyBrick(o);
            });
            self.bricks = null;
            if (self.get('rendered')) {
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
                el = null;
            }
            self.destroyed = true;
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
            config: {
                value: {}
            }
        }
    }, 'Pagelet');
    return Pagelet;
}, {
    requires: ['./chunk']
});