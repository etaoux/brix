KISSY.add("brix/chunk", function(S, Node, Base, Dataset, Tmpler) {
    var $ = Node.all;
    /**
     * brick和pagelet类的基类
     */
    function Chunk() {
        Chunk.superclass.constructor.apply(this, arguments);
        var self = this;
        var tmpl = self.get('tmpl');
        if (tmpl) {
            var data = arguments[0].data;
            self._buildTmpler(tmpl,data);
        }
        if(self.tmpler){
            if(!self.tmpler.inDom){
                self.render();
            }
            else{
                self.__set('el',tmpl);//如果已经在dom中，则把当前节点设置为模板容器节点
            }

        }
        else{
            self.__set("rendered", true);
        }
    }

    Chunk.ATTRS = {
        //组件节点
        el: {
            getter: function(s) {
                if (S.isString(s)) {
                    s = $(s);
                    //el节点考虑性能，不缓存，以免对dom节点的引用，引起内存泄漏
                    // this.__set("el", s);
                }
                return s;
            }
        },
        //容器节点
        render:{
            value:'body',
            getter:function(s) {
                if (S.isString(s)) {
                    s = $(s);
                }
                return s;
            }
        },
        tmpl: {//模板代码，如果是已经渲染的html元素，则提供渲染html容器节点选择器
            value: null
        },
        rendered:{
            value :false
        }
    };

    S.extend(Chunk, Base, {
        /**
         * 构建模板解析器
         * @param  {string} tmpl 模板字符串
         * @param  {object} data 数据对象
         */
        _buildTmpler: function(tmpl,data) {
            var self = this;
            self.tmpler = new Tmpler(tmpl);
            data = data ||{};
            self._buildDataset(data);
        },
        /**
         * 构建数据管理器
         * @param  {object} data 数据对象
         */
        _buildDataset: function(data) {
            var self = this;
            data = S.clone(data); //数据深度克隆
            self.dataset = new Dataset({
                data: data
            });
            self.dataset.on('afterDataChange', function(e) {
                self._render(e.subAttrName, e.newVal);
            });
        },
        /**
        * 给brick添加模板
        * @param {string} id  brick的id
        * @param {array} arr 模板数组
        */
        addTmpl:function(id,arr){
            var self = this.pagelet?this.pagelet:this;
            return self.tmpler.addTmpl(id,arr);
        },

        /**
         * 设置数据，并刷新模板数据
         * @param {string} datakey 需要更新的数据对象key
         * @param {object} data    数据对象
         */
        setChunkData: function(datakey, data) {
            var self = this.pagelet?this.pagelet:this;
            //可能要提供多个datakey的更新
            data = S.clone(data);
            self.dataset.set('data.' + datakey, data);
        },
        /**
         * 将模板渲染到页面
         */
        render: function() {
            var self = this;
            if(!self.get("rendered")){
                self._render('data', self.dataset.get('data'));
                self.__set("rendered", true);
            }
        },
        /**
         * 将模板渲染到页面
         * @param  {string} key     更新的数据对象key
         * @param  {object} newData 数据
         */
        _render: function(key, newData) {
            var self = this.pagelet?this.pagelet:this;
            if (key.split('.').length > 1) {
                //部分数据更新
                key = key.replace(/^data\./, '');
                self._renderTmpl(self.tmpler.bricks, key, newData);
            } else {
                var node = new Node(self.tmpler.to_html(newData));
                var render = self.get('render');
                var containerNode;
                if(node.length>1){//如果是多个节点，则创建容器节点
                    containerNode = new Node('<div id="'+S.guid("brick_container")+'"></div>');
                    containerNode.append(node);
                }
                else{
                    if (!node.attr('id')) {
                        node.attr('id', S.guid('brick_container'));
                    }
                    containerNode = node;
                }
                render.append(containerNode);
                //将节点的引用设置为容器节点，为后期的destroy等方法提供引用
                self.__set('el','#'+containerNode.attr('id'));
                node = null;
                containerNode = null;
            }
        },
        /**
         * 渲染模板
         * @param  {object} bricks  brick对象集合
         * @param  {string} key     更新的数据对象key
         * @param  {object} newData 数据
         */
        _renderTmpl: function(bricks, key, newData) {
            S.each(bricks, function(b) {
                S.each(b.tmpls, function(o, id) {
                    if (S.inArray(key, o.datakey)) {
                        var data = {};
                        S.each(o.datakey, function(item) {
                            var tempdata = newData,
                                temparr = item.split('.'),
                                length = temparr.length,
                                i = 0;
                            while (i != length) {
                                tempdata = tempdata[temparr[i]];
                                i++;
                            }
                            data[temparr[length - 1]] = tempdata;
                            tempdata = null;
                        });
                        S.one('#' + o.id).html(o.tmpler.to_html(data));
                        data = null;
                    }
                });
                this._renderTmpl(b.bricks, key, newData);
            }, this);
        },
        /**
         * 销毁组件或者pagelet
         */
        destroy: function() {
            var self = this;
            //todo 如果是调用的brick的destroy，需要查找移除引用
            var el = self.get('el');
            if(self.pagelet){//如果是pagelet实例化出来的brick调用
                var id = el.attr('id');
                S.each(self.pagelet.tmpler.bricks,function(o,k) {
                    if(k==id){
                        self._destroyBrick(o);
                        return false;
                    }
                });
            }
            else{
                if (self.tmpler && self.tmpler.bricks) {
                    self._destroyBricks(self.tmpler.bricks);
                    self.tmpler.bricks = null;
                }
            }
            el.remove();
        },

        /**
         * 销毁brick引用
         * @param  {object} bricks 需要销毁的对象集合
         */
        _destroyBricks: function(bricks) {
            var self = this;
            S.each(bricks, function(o) {
                self._destroyBrick(o);
            });
        },
        /**
         * 销毁brick引用
         * @param  {object} o 需要销毁的对象
         */
        _destroyBrick:function(o){
            var self = this;
            if(o.brick) {
                var events = o.brick.events;
                var node = o.brick.get('el');
                for (var type in events) {
                    node[0]["on" + type] = null; //移除事件监听函数
                }
                node.detach();
                //node.remove();
                //移除实例的引用，减少内存泄漏的可能
                node = null;
                o.brick.pagelet = null;
                o.brick = null;
                //递归调用
                self._destroyBricks(o.bricks);
                //齐活了，对各种引用都断开了链接
            }
        }
    });
    return Chunk;
}, {
    requires: ["node", "base", "brix/dataset", "brix/tmpler"]
});
