KISSY.add("brix/core/pagelet", function(S, Chunk) {
    function Pagelet() {
        Pagelet.superclass.constructor.apply(this, arguments);
        var self = this;
        //初始化属性
        self.isReady = false;
        self.brickCount = 0;
        self.readyList = [];
        self.isAddBehavior = false;
        //如果是自动渲染，或者已经在dom中，则触发rendered事件
        if (self.get('autoRender')||self.get('tmpler').inDom) {
            self.ready(function(){
                self.render();
            });
        }
    }

    S.extend(Pagelet, Chunk, {
        /**
         * 获取brick的实例
         * @param  {String} id brick的id
         * @return {Object} 组件实例
         */
        getBrick: function(id) {
            return this._getBrick(id, this.get('tmpler').bricks);
        },

        /**
         * 获取brick的实例
         * @param  {String} id     brick的id
         * @param  {Object} bricks 需要渲染的brick集合
         * @return {Object}        组件实例
         */
        _getBrick: function(id, bricks) {
            var self = this,
                brick;
            S.each(bricks, function(b, k) {
                if (k === id) {
                    brick = b.brick;
                    return false;
                } else {
                    brick = self._getBrick(id, b.bricks);
                }
            });
            return brick || null;
        },
        /**
         * 给组件添加行为
         */
        addBehavior: function() {
            if (!this.isAddBehavior) {
                this._addBehavior(this.get('tmpler').bricks);
                this.isAddBehavior = true;
            }
        },
        /**
         * 分层次的渲染brick
         * @param {Object} bricks 需要渲染的brick集合
         */
        _addBehavior: function(bricks) {
            var self = this;
            var foo = function(o,k){
                self.brickCount++;
                if(!o.path){
                    o.path = 'brix/gallery/'+o.name+'/';
                }
                S.use(o.path, function(S, TheBrick) {
                    var config = S.merge({
                        container:'#'+k,
                        id: k,
                        el: '#' + k,
                        pagelet: self
                    }, o.config);
                    var myBrick = new TheBrick(config);
                    o.brick = myBrick;
                    self._addBehavior(o.bricks);
                    self.brickCount--;
                    if (self.brickCount === 0) {
                        self._fireReady();
                    }
                });
            };
            S.each(bricks, function(brick, key) {
                foo(brick, key);
            });
            if (self.brickCount === 0) {
                self._fireReady();
            }
        },
        /**
         * pagelet 渲染完成后需要执行的函数
         * @param {Function} fn 执行的函数
         */
        ready: function(fn) {
            if (this.isReady) {
                fn.call(window, this);
            } else {
                this.readyList.push(fn);
            }
            return this;
        },
        /**
         * 触发ready添加的方法
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
            var self = this,el = self.get('el'),tmpler = self.get('tmpler');
            if (tmpler && !S.isEmptyObject(tmpler.bricks)) {
                context._destroyBricks(tmpler.bricks,id);
            }
            if(!id){
                el.remove();
            }
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
                o.brick.get('el').remove();
                o.brick.pagelet = null;
                o.brick = null;
                delete o;
            }
        }
    });
    return Pagelet;
}, {
    requires: ['./chunk']
});