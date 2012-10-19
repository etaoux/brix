KISSY.add("brix/core/pagelet", function(S, Chunk) {
    /**
     * Brix Pagelet 是组件的管理器，实现组件的层次化渲染。
     * 一个页面由多个组件和非组件的HTML片段组成，实际创建过程中需要一个个动态创建，
     * 基于约定为大的原则，采用“钩子”和Mustache，自动化的完成组件渲染和行为附加
     * @extends Brix.Chunk
     * @class Brix.Pagelet
     */
    function Pagelet() {
        Pagelet.superclass.constructor.apply(this, arguments);
        var self = this;
        //初始化属性
        self.isReady = false;
        self.readyList = [];
        self.brickList = [];
        self.isAddBehavior = false;
        //如果是自动渲染，或者已经在dom中，则触发rendered事件
        if (self.get('autoRender')||self.get('tmpler').inDom) {
            self.ready(function(){
                self.render();
            });
        }

        //增加参数回调
        var callback = self.get('callback');
        if(callback&&typeof callback === 'function'){
            self.ready(callback);
        }

        //自动添加行为渲染
        if(self.get('behavior')){
            self.addBehavior();
        }
    }
    Pagelet.ATTRS = {
        /**
         * 自动添加组件行为
         * @cfg {Boolean}
         */
        behavior:{
            value:true 
        },
        /**
         * 行为添加完成后的回调方法
         * @cfg {Function}
         */
        callback:{
            value:null
        }
    }
    S.extend(Pagelet, Chunk, {
        /**
         * 获取brick的实例
         * @param  {String} id     brick的id
         * @return {Object}        组件实例
         * @private
         */
        getBrick: function(id, bricks) {
            var self = this,
                tmpler = self.get('tmpler'),
                brick;
            if(tmpler){
                S.each(tmpler.bricks, function(b) {
                    if (b.id === id) {
                        brick = b.brick;
                        return false;
                    }
                });
            }
            return brick || null;
        },
        /**
         * 给组件添加行为
         */
        addBehavior: function() {
            var self = this;
            if (!self.isAddBehavior) {
                self.isAddBehavior = true;
                var tmpler = self.get('tmpler');
                if(tmpler){
                    var bricks = tmpler.bricks;
                    self._buildBricks(bricks);//构建当前pagelet包含的所有brick
                    if(self.brickList.length>0){
                        S.use(self.brickList.join(','),function(S){
                            self._addBehavior(bricks,arguments);
                            self._fireReady();
                        });
                        return;
                    }
                }
                self._fireReady();
            }
        },
        /**
         * 分层次的渲染brick
         * @param {Object} bricks 需要渲染的brick集合
         * @param {Array} brickClassList use回调的参数集合
         * @private
         */
        _addBehavior: function(bricks,brickClassList) {
            var self = this;
            S.each(bricks, function(o) {
                var id = o.id;
                var config = S.merge({
                    container:'#'+id,
                    id: id,
                    el: '#' + id,
                    pagelet: self
                }, o.config);
                var TheBrick = brickClassList[S.indexOf(o.path, self.brickList)+1];
                var myBrick = new TheBrick(config);
                o.brick = myBrick;
            });
        },
        /**
         * 构建页面所有bricks，提供给use使用
         * @param  {Object} bricks 
         * @private
         */
        _buildBricks:function(bricks){
            var self = this;
            S.each(bricks, function(o) {
                if(!o.path){
                    o.path = 'brix/gallery/'+o.name+'/';
                }
                if(!S.inArray(self.brickList,o.path)){
                    self.brickList.push(o.path);
                }
            });
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
        _fireReady: function() {
            var self = this;
            if (self.isReady) {
                return;
            }
            self.isReady = true;
            if (self.readyList) {
                var fn, i = 0;
                while (fn = self.readyList[i++]) {
                    fn.call(self);
                }
                self.readyList = null;
            }
        },
        /**
         * 销毁组件或者pagelet
         * @param  {String} id 组件id,如果带了id，销毁组件
         */
        destroy: function(id) {
            var self = this,
                el = self.get('el'),
                tmpler = self.get('tmpler');
            if (tmpler) {
                self._destroyBricks(tmpler.bricks,id);
            }
            if(!id){
                tmpler.tmpls = null;
                tmpler.bricks = null;
                el.remove();
            }
            el = null;
        },

        /**
         * 销毁brick引用
         * @param  {Object} bricks 需要销毁的对象集合
         * @private
         */
        _destroyBricks: function(bricks,id) {
            var self = this;
            S.each(bricks, function(o,i) {
                if(id){
                    if(id===o.id){
                        self._destroyBrick(o);
                        return false;
                    }
                }
                else{
                    self._destroyBrick(o);
                }
            });
        },
        /**
         * 销毁brick引用
         * @param  {Object} o 需要销毁的对象
         * @private
         */
        _destroyBrick: function(o) {
            var self = this;
            if (o.brick) {
                o.brick.destroy();
                o.brick = null;
            }
        }
    });
    return Pagelet;
}, {
    requires: ['./chunk']
});