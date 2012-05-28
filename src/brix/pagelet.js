KISSY.add("brix/pagelet", function(S, Chunk) {
    function Pagelet() {

        Pagelet.superclass.constructor.apply(this, arguments);
        this.initialize();
    }

    S.extend(Pagelet, Chunk, {
        initialize: function() {
            this.isReady = false;
            this.brickCount = 0;
            this.readyList = [];
            this.isAddBehavior = false;
        },
        //获取brick的实例
        getBrick: function(id) {
            return this._getBrick(id, this.tmpler.bricks);
        },
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
        addBehavior: function() {
            if(!this.isAddBehavior){
                this._addBehavior(this.tmpler.bricks);
                this.isAddBehavior = true;
            }
        },
        //分层次的渲染brick
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
        ready: function(fn) {
            if (this.isReady) {
                fn.call(window, this);
            } else {
                this.readyList.push(fn);
            }
            return this;
        },
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
