KISSY.add("brix/chunk", function(S, Node, Base, Dataset, Tmpler) {
    var $ = Node.all;

    function Chunk() {
        Chunk.superclass.constructor.apply(this, arguments);
        var self = this;
        var tmpl = self.get('tmpl');
        if (tmpl) {
            var data = arguments[0].data;
            self._buildTmpler(tmpl,data);
        }
    }
    Chunk.ATTRS = {
        //容器节点
        el: {
            value: 'body',
            getter: function(s) {
                if (S.isString(s)) {
                    s = $(s);
                    //el节点考虑性能，不缓存，以免对dom节点的引用，引起内存泄漏
                    // this.__set("el", s);
                }
                return s;
            }
        },
        tmpl: {
            value: null
        },
        rendered:{
            value :false
        }
    };
    S.extend(Chunk, Base, {
        _buildTmpler: function(tmpl,data) {
            var self = this;
            self.tmpler = new Tmpler(tmpl);
            data = data ||{};
            self._buildDataset(data);
            if(self.tmpler.inDom){
                self.__set("rendered", true);
            }
        },
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
        addTmpl:function(id,arr){
            var self = this.pagelet?this.pagelet:this;
            self.tmpler.addTmpl(id,arr);
        },
        setChunkData: function(datakey, data) {
            var self = this.pagelet?this.pagelet:this;
            //可能要提供多个datakey的更新
            data = S.clone(data);
            self.dataset.set('data.' + datakey, data);
        },
        render: function() {
            var self = this;
            if(!self.get("rendered")){
                self._render('data', self.dataset.get('data'));
                self.__set("rendered", true);
            }
        },
        _render: function(key, newData) {
            var self = this.pagelet?this.pagelet:this;
            if (key.split('.').length > 1) {
                //部分数据更新
                key = key.replace(/^data\./, '');
                self._renderTmpl(self.tmpler.bricks, key, newData);
            } else {
                var node = new Node(self.tmpler.to_html(newData));
                var el = self.get('el');
                var containerNode;
                if(node.length>1){//如果是多个节点，则创建容器节点
                    containerNode = new Node('<div id="brick_container'+S.guid()+'"></div>');
                    containerNode.append(node);
                }
                else{
                    containerNode = node;
                }
                el.append(containerNode);
                //将节点的引用设置为容器节点，为后期的destroy等方法提供引用
                self.__set('el','#'+containerNode.attr('id'));
                node = null;
                containerNode = null;
            }
        },
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
        destroy: function() {
            var self = this;
            //todo 如果是调用的brick的destroy，需要查找移除引用
            if(this.pagelet){
                var el = this.get("el");
                id = this.get("el").attr('id');
                S.each(this.pagelet.tmpler.bricks,function(o,k) {
                    if(k==id){
                        self._destroyBrick(o);
                        return false;
                    }
                });
            }
            else{
                if (this.tmpler && this.tmpler.bricks) {
                    this._destroyBricks(this.tmpler.bricks);
                    this.tmpler.bricks = null;
                }3
            }
            this.get("el").remove();
        },


        //齐活了，对各种引用都断开了链接
        _destroyBricks: function(bricks) {
            var self = this;
            S.each(bricks, function(o) {
                self._destroyBrick(o);
                /*if (o.brick) {
                    var events = o.brick.events;
                    var node = o.brick.get('el');
                    for (var type in events) {
                        node[0]["on" + type] = null; //移除事件监听函数
                    }
                    node.detach();
                    //node.remove();
                    //移除实例的引用，减少内存泄漏的可能
                    node = null;
                    o.brick = null;
                    self._destroyBricks(o.bricks);
                }*/
            });
        },
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
                o.brick = null;
                self._destroyBricks(o.bricks);
            }
        }
    });
    return Chunk;
}, {
    requires: ["node", "base", "brix/dataset", "brix/tmpler"]
});
