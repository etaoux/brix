KISSY.add("brix/core/pagelet", function(S, Chunk) {
    function Pagelet() {
        Pagelet.superclass.constructor.apply(this, arguments);
        //初始化属性
        this.isReady = false;
        this.brickCount = 0;
        this.readyList = [];
        this.isAddBehavior = false;
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
        }
    });
    return Pagelet;
}, {
    requires: ['./chunk']
});