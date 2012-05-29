KISSY.add("brix/pagelet", function(S, Chunk) {
    function Pagelet() {

        Pagelet.superclass.constructor.apply(this, arguments);
        this.initialize();
    }

    S.extend(Pagelet, Chunk, {
        /**
         * 初始化方法
         */
        initialize: function() {
            this.isReady = false;
            this.brickCount = 0;
            this.readyList = [];
            this.isAddBehavior = false;
        },
        /**
        * 获取brick的实例
        * @param id brick的id
        * @return {object} 组件实例
        */
        getBrick: function(id) {
            return this._getBrick(id, this.tmpler.bricks);
        },

       /**
        * 获取brick的实例
        * @param  {string} id     brick的id
        * @param  {object} bricks 需要渲染的brick集合
        * @return {object}        组件实例
        */
        _getBrick: function(id, bricks) {
            var self = this,
                brick;
            S.each(bricks, function(b, k) {
                if (k == id) {
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
            if(!this.isAddBehavior){
                this._addBehavior(this.tmpler.bricks);
                this.isAddBehavior = true;
            }
        },
        /**
         * 分层次的渲染brick
         * @param {object} bricks 需要渲染的brick集合
         */
        _addBehavior: function(bricks) {
            var self = this;
            S.each(bricks, function(o, k) {
                (function(o, k) {
                    self.brickCount++;
                    S.use(o.path, function(S, TheBrick) {
                        var myBrick = new TheBrick({
                            el: '#' + k,
                            pagelet:self
                        });
                        o.brick = myBrick;
                        self._addBehavior(o.bricks);
                        self.brickCount--;
                        if (self.brickCount == 0) {
                            self._fireReady();
                        }
                    });
                })(o, k);
            });
            if (self.brickCount == 0) {
                self._fireReady();
            }
        },
        /**
        * pagelet 渲染完成后需要执行的函数
        * @method ready
        * @param fn 执行的函数
        * @public
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
    requires: ['brix/chunk']
});
