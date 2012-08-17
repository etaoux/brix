KISSY.add("brix/core/chunk", function(S, Node, Base, Dataset, Tmpler) {
    var $ = Node.all;
    /**
     * brick和pagelet类的基类
     */

    function Chunk() {
        Chunk.superclass.constructor.apply(this, arguments);
        this._buildTmpler();
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
            var self = this,
                tmpler = self.get('tmpler');
            if(!tmpler){
                var tmpl = self.get('tmpl');
                if(tmpl){
                    tmpler = new Tmpler(tmpl);
                    self.set('tmpler',tmpler);
                    var id = self.get('id');
                    if(!id){
                        self.set('id',tmpler.id);
                        self.set('el','#'+tmpler.id);
                    }
                    else{
                        self.set('el','#'+id);
                    }
                }
            }
            if(tmpler){
                self._buildDataset();
            }
        },
        /**
         * 构建数据管理器
         */
        _buildDataset: function() {
            var self = this;
            var dataset = self.get('dataset');
            if(!dataset){
                var data = self.get('data') || {};//原始数据
                data = S.clone(data); //数据深度克隆
                dataset = new Dataset({
                    data: data
                });
                self.set('dataset',dataset);//设置最新的数据集合
            }
            dataset.on('afterDataChange', function(e) {
                self._render(e.subAttrName, e.newVal);
            });
        },

        /**
         * 给brick添加模板
         * @param {string} id  brick的id
         * @param {array} arr 模板数组
         * @return {Boolen} 是否添加成功
         */
        addTmpl: function(id, arr) {
            var self =  this,tmpler = self.get('tmpler');
            if(tmpler){
                return tmpler.addTmpl(id, arr);
            }
            else{
                return false;
            }
        },

        /**
         * 设置数据，并刷新模板数据
         * @param {string} datakey 需要更新的数据对象key
         * @param {object} data    数据对象
         */
        setChunkData: function(datakey, data) {
            var self = this,
                dataset = self.get('dataset');
            if(dataset){
                data = S.clone(data);
                dataset.set('data.' + datakey, data);
            }
        },
        /**
         * 将模板渲染到页面
         */
        render: function() {
            var self = this;
            if (!self.get("rendered")) {
                var dataset = self.get('dataset');
                if(dataset){
                    self._render('data', dataset.get('data'));
                }
                self.__set("rendered", true);
                self.fire('rendered');
            }
        },
        /**
         * 将模板渲染到页面
         * @param  {string} key     更新的数据对象key
         * @param  {object} data 数据
         */
        _render: function(key, data) {
            var self = this,tmpler = self.get('tmpler');
            if(tmpler){
               if (key.split('.').length > 1) {
                    //部分数据更新
                    key = key.replace(/^data\./, '');
                    self._renderTmpl(tmpler.bricks, key, data);
                } else {
                    if(!tmpler.inDom){
                        var container = self.get('container');
                        container.append(tmpler.to_html(data));
                    }
                } 
            }
        },
        /**
         * 渲染模板
         * @param  {object} bricks  brick对象集合
         * @param  {string} key     更新的数据对象key
         * @param  {object} data 数据
         */
        _renderTmpl: function(bricks, key, data) {
            S.each(bricks, function(b) {
                S.each(b.tmpls, function(o, id) {
                    if (S.inArray(key, o.datakey)) {
                        //这里数据是否需要拼装，还是传入完整的数据，待考虑
                        var newData = {};
                        S.each(o.datakey, function(item) {
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
                        S.one('#' + o.id).html(o.tmpler.to_html(newData));
                        newData = null;
                    }
                });
                this._renderTmpl(b.bricks, key, data);
            }, this);
        }
    });
    return Chunk;
}, {
    requires: ["node", "base", "./dataset", "./tmpler"]
});
