KISSY.add('brix/gallery/timer/index', function(S, Brick, IO) {
    /**
     * 定时器
     * <br><a href="../demo/gallery/timer/timer.html" target="_blank">Demo</a>
     * @extends Brix.Brick
     * @class Brix.Gallery.Timer
     */
    function Timer() {
        Timer.superclass.constructor.apply(this, arguments);
    }
    Timer.ATTRS = {
        /**
         * 模式，down：倒计时，up：过去多少时间
         * @cfg {String}
         */
        mode: {
            value: 'down'
        },
        /**
         * 倒计时时间，或者更新时间，根据mode配置来，单位ms
         * @cfg {Number}
         */
        updateTime: {
            value: 10000
        },
        /**
         * 格式时间类型，y/M/d/h/m/s/hs
         * @cfg {String}
         */
        units: {
            value: 's'
        },
        /**
         * 是否需要和服务器时间同步
         * @cfg {Boolean}
         */
        isServer: {
            value: false
        },
        /**
         * 是否需要计时器进行校正
         * @cfg {Boolean}
         */
        ajusted: {
            value: false
        },
        /**
         * 校验的时间间隔,单位ms
         * @cfg {Number}
         */
        ajustInterval: {
            value: 5000
        },
        /**
         * 定时器时间间隔,单位ms
         * @cfg {Number}
         */
        interval: {
            value: 100
        },
        data: {
            valueFn: function() {
                //初始化时间
                return this._getUnitsData(0);
            }
        }
    };

    Timer.FIRES = {
        /**
         * @event notify
         * 类型为down，倒计时完成后的回调
         * @param {Object} e 
         * @param {Number} e.size 记录数
         * @type {String}
         */
        notify:'notify'
    };
    /**
     * 获取服务器时间
     * @param  {Function} fn       回调函数
     * @param  {Boolean}  isServer 是否服务器时间
     * @static
     */
    Timer.getServerTime = function(fn, isServer) {
        if(isServer) {
            var url = window.location.protocol + '//' + window.location.host + '?t=' + (+new Date());
            IO({
                type: 'head',
                url: url,
                success: function(data, textStatus, xhr) {
                    var serverTime = new Date(xhr.getResponseHeader('Date')).getTime();
                    fn(serverTime);
                }
            });
        } else {
            fn(S.now());
        }
    }
    S.extend(Timer, Brick, {
        initialize: function() {
            var self = this;
            Timer.getServerTime(function(serverTime) {
                self._start(serverTime);
            }, self.get('isServer'));
        },
        /**
         * 开始计时
         * @param  {Number} serverTime 时间
         * @private
         */
        _start: function(serverTime) {
            var self = this,
                mode = self.get('mode'),
                interval = self.get('interval'),
                ajustInterval = self.get('ajustInterval'),
                updateTime = self.get('updateTime'),
                _currentTime;
            switch(mode) {
            case 'up':
                _currentTime = serverTime - updateTime;
                break;
            case 'down':
                _currentTime = updateTime;
                break;
            }
            self._currentTime = _currentTime;
            self._startCurrentTime = _currentTime;
            self._startBaseTime = serverTime;
            self._diffTime = 0;
            self._timerHandler = S.later(self._timerInterval, interval, false, self, [interval, mode]);
            if(self.get('ajusted')) {
                self._ajustHandler = S.later(self._ajustInterval, ajustInterval, false, self, [ajustInterval, mode]);
            }
        },
        /**
         * 校验定时器
         * @param  {Number} ajustInterval 时间间隔
         * @param  {String} mode          类型
         * @private
         */
        _ajustInterval: function(ajustInterval, mode) {
            var self = this;
            Timer.getServerTime(function(endBaseTime) {
                self._diffTime = endBaseTime - self._startBaseTime;
                switch(mode) {
                case 'up':
                    self._diffTime -= (self._currentTime - self._startCurrentTime);
                    break;
                case 'down':
                    self._diffTime -= (self._startCurrentTime - self._currentTime);
                    break;
                }
                if(self._diffTime > 500) {
                    switch(mode) {
                    case 'up':
                        self._currentTime += self._diffTime;
                        break;
                    case 'down':
                        self._currentTime -= self._diffTime;
                        //这里是干什么的？
                        if(self._currentTime <= 0) {
                            self._currentTime = 0;
                        }
                        break;
                    }
                    self._diffTime = 0;
                }
                self._ajustHandler = S.later(self._ajustInterval, ajustInterval, false, self, [ajustInterval, mode]);
            }, self.get('isServer'));
        },
        /**
         * 定时器
         * @param  {Number} ajustInterval 时间间隔
         * @param  {String} mode          类型
         * @private
         */
        _timerInterval: function(interval, mode) {
            var self = this,
                _currentTime = self._currentTime;
            switch(mode) {
            case 'up':
                _currentTime += interval;
                break;
            case 'down':
                _currentTime -= interval;
                break;
            }
            self._currentTime = _currentTime;
            var obj = self._getUnitsData(_currentTime);
            S.each(obj, function(d, k) {
                self.setChunkData(k, d);
            });

            if(_currentTime <= 0) {
                if(self._ajustHandler) {
                    self._ajustHandler.cancel();
                }
                self.fire(Timer.FIRES.notify);
                return;
            }
            self._timerHandler = S.later(self._timerInterval, interval, false, self, [interval, mode]);
        },
        /**
         * 时间格式化
         * @param  {Number} _currentTime 时间
         * @private
         */
        _getUnitsData: function(_currentTime) {
            var self = this,
                obj = {};
            switch(self.get('units')) {
            case 'y':
                obj = {
                    y: Math.floor(_currentTime / (365 * 24 * 60 * 60 * 1000)),
                    M: Math.floor(_currentTime / (30 * 24 * 60 * 60 * 1000)) % 12,
                    d: Math.floor(_currentTime / (24 * 60 * 60 * 1000)) % 30,
                    h: Math.floor(_currentTime / (60 * 60 * 1000)) % 24,
                    m: Math.floor(_currentTime / (60 * 1000)) % 60,
                    s: Math.floor(_currentTime / 1000) % 60,
                    hs: Math.floor(_currentTime / 100) % 10
                }
                break;
            case 'M':
                obj = {
                    M: Math.floor(_currentTime / (30 * 24 * 60 * 60 * 1000)),
                    d: Math.floor(_currentTime / (24 * 60 * 60 * 1000)) % 30,
                    h: Math.floor(_currentTime / (60 * 60 * 1000)) % 24,
                    m: Math.floor(_currentTime / (60 * 1000)) % 60,
                    s: Math.floor(_currentTime / 1000) % 60,
                    hs: Math.floor(_currentTime / 100) % 10
                }
                break;
            case 'd':
                obj = {
                    d: Math.floor(_currentTime / (24 * 60 * 60 * 1000)),
                    h: Math.floor(_currentTime / (60 * 60 * 1000)) % 24,
                    m: Math.floor(_currentTime / (60 * 1000)) % 60,
                    s: Math.floor(_currentTime / 1000) % 60,
                    hs: Math.floor(_currentTime / 100) % 10
                }
                break;
            case 'h':
                obj = {
                    h: Math.floor(_currentTime / (60 * 60 * 1000)),
                    m: Math.floor(_currentTime / (60 * 1000)) % 60,
                    s: Math.floor(_currentTime / 1000) % 60,
                    hs: Math.floor(_currentTime / 100) % 10
                }
                break;
            case 'm':
                var obj = {
                    m: Math.floor(_currentTime / (60 * 1000)),
                    s: Math.floor(_currentTime / 1000) % 60,
                    hs: Math.floor(_currentTime / 100) % 10
                }
                break;
            case 's':
                obj = {
                    s: Math.floor(_currentTime / 1000),
                    hs: Math.floor(_currentTime / 100) % 10
                }
                break;
            case 'hs':
                obj = {
                    hs: Math.floor(_currentTime / 100)
                }
                break;
            }
            S.each(obj, function(d, k) {
                if(S.inArray(k, ['h', 'm', 's'])) {
                    if(d < 10) {
                        obj[k] = ('0' + d).toString();
                    }
                }
                obj[k] = obj[k].toString();
            });
            if(self.get('interval') >= 1000) {
                delete obj['hs'];
            }
            return obj;
        },
        destructor: function() {
            if(this._ajustHandler){
                this._ajustHandler.cancel();
                this._ajustHandler = null;
            }
            if(this._timerHandler){
                this._timerHandler.cancel();
                this._timerHandler = null;
            }
        }
    });
    return Timer;
}, {
    requires: ["brix/core/brick", 'ajax']
});