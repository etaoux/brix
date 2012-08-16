KISSY.add("brix/core/chunk", function(S, Node, Base, Dataset, Tmpler) {
    var $ = Node.all;
    /**
     * brick和pagelet类的基类
     */

    function Chunk() {
        Chunk.superclass.constructor.apply(this, arguments);
        var self = this;

        //现在是串行执行
        self._buildTmpler();
        var tmpler = self.get('tmpler');
        if (tmpler) {
            self.set('id',tmpler.id);
            self.set('el','#'+tmpler.id);
            if (!tmpler.inDom) {
                if (self.get('autoRender')) {
                    self.render();
                }
            } else {
                self.__set("rendered", true);
            }
        }
        else if(!self.pagelet){
            self.__set("rendered", true);
        }
    }

    Chunk.ATTRS = {
        /*当前pagelet或者brick的唯一标识*/
        id:{
            value:false
        },
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
        container: {
            value: 'body',
            getter: function(s) {
                if (S.isString(s)) {
                    s = $(s);
                }
                return s;
            }
        },
        tmpl: { //模板代码，如果是已经渲染的html元素，则提供渲染html容器节点选择器
            value: false
        },
        tmpler:{
            value:false
        },
        rendered: {
            value: false
        },
        //是否自动渲染
        autoRender: {
            value: false
        },
        data:{
            value:false
        },
        //如果提供dataset，则忽略data
        dataset:{
            value:false
        }
    };

    S.extend(Chunk, Base, {
        /**
         * 构建模板解析器
         */
        _buildTmpler: function() {
            var self = this;
            var tmpler = self.get('tmpler');
            if(!tmpler&&!self.pagelet){
                var tmpl = self.get('tmpl');
                if(tmpl){
                    tmpler = new Tmpler(tmpl);
                    self.set('tmpler',tmpler);
                    self._buildDataset();
                }
            }
        },
        /**
         * 构建数据管理器
         */
        _buildDataset: function() {
            var self = this;
            var dataset = self.get('dataset');
            if(!dataset&&!self.pagelet){
                var data = self.get('data') || {};//原始数据
                data = S.clone(data); //数据深度克隆
                dataset = new Dataset({
                    data: data
                });
                self.set('dataset',dataset);//设置最新的数据集合
            }
            if(dataset){
                dataset.on('afterDataChange', function(e) {
                    self._render(e.subAttrName, e.newVal);
                });
            }
        },

        /**
         * 给brick添加模板
         * @param {string} id  brick的id
         * @param {array} arr 模板数组
         * @return {Boolen} 是否添加成功
         */
        addTmpl: function(id, arr) {
            var self = this.pagelet ? this.pagelet : this;
            return self.get('tmpler').addTmpl(id, arr);
        },

        /**
         * 设置数据，并刷新模板数据
         * @param {string} datakey 需要更新的数据对象key
         * @param {object} data    数据对象
         */
        setChunkData: function(datakey, data) {
            var self = this.pagelet ? this.pagelet : this,
                dataset = self.get('dataset');
            //可能要提供多个datakey的更新
            data = S.clone(data);
            dataset.set('data.' + datakey, data);
        },
        /**
         * 将模板渲染到页面
         */
        render: function() {
            var self = this;
            if (!self.get("rendered")) {
                self._render('data', self.get('dataset').get('data'));
                self.__set("rendered", true);
                self.fire('rendered');
            }
        },
        /**
         * 将模板渲染到页面
         * @param  {string} key     更新的数据对象key
         * @param  {object} newData 数据
         */
        _render: function(key, newData) {
            var self = this.pagelet ? this.pagelet : this,tmpler = self.get('tmpler');
            if (key.split('.').length > 1) {
                //部分数据更新
                key = key.replace(/^data\./, '');
                self._renderTmpl(tmpler.bricks, key, newData);
            } else {
                var container = self.get('container');
                container.append(tmpler.to_html(newData));
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
                        //这里数据是否需要拼装，还是传入完整的数据，待考虑
                        var data = {};
                        S.each(o.datakey, function(item) {
                            var tempdata = newData,
                                temparr = item.split('.'),
                                length = temparr.length,
                                i = 0;
                            while (i !== length) {
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
            var self = this,el = self.get('el');
            var context = self.pagelet?self.pagelet:this;
            var tmpler = context.get('tmpler');
            if (tmpler && !S.isEmptyObject(tmpler.bricks)) {
                var id=false;
                if (self.pagelet) { //如果是pagelet实例化出来的brick调用
                    id = el.attr('id');
                } 
                context._destroyBricks(tmpler.bricks,id);
            }
            else{
                self._detachEvent&&self._detachEvent();
            }
            el.remove();
        },

        /**
         * 销毁brick引用
         * @param  {object} bricks 需要销毁的对象集合
         */
        _destroyBricks: function(bricks,id) {
            var self = this;
            S.each(bricks, function(o,k) {
                if(id){
                    if(id===k){
                        self._destroyBrick(o);
                        delete bricks[k];
                        return false;
                    }
                    else{
                        self._destroyBricks(o.bricks);
                    }
                }
                else{
                    self._destroyBrick(o);
                    delete bricks[k];
                }
            });
        },
        /**
         * 销毁brick引用
         * @param  {object} o 需要销毁的对象
         */
        _destroyBrick: function(o) {
            var self = this;
            if (o.brick) {
                o.brick._detachEvent();
                //递归调用
                self._destroyBricks(o.bricks);
                o.brick.pagelet = null;
                o.brick = null;
                delete o;
                //齐活了，对各种引用都断开了链接
            }
        }
    });
    return Chunk;
}, {
    requires: ["node", "base", "./dataset", "./tmpler"]
});
