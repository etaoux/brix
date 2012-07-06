KISSY.add("brix/gallery/kwicks/index", function(S, Brick) {
    function Kwicks() {
        Kwicks.superclass.constructor.apply(this, arguments);
    }
    Kwicks.ATTRS = {
        //默认横向
        isVertical: {
            value: false
        },
        //是否始终激活一个
        sticky: {
            value: false
        },
        //默认激活的位置，只有当sticky为true时有效
        activeIndex: {
            value: 0
        },
        //事件类型
        triggerType: {
            value: 'mouseenter'
        },
        //激活样式
        activeCls: {
            value: 'active'
        },
        //间距
        spacing: {
            value: 0
        },
        //动画持续时间
        duration: {
            value: 0.3
        },
        //动画效果
        easing: {
            value: 'easeNone'
        },
        //最大值
        max: {

        },
        //最小值
        min: {

        },
        //自动播放
        autoplay: {
            value: false
        },
        //自动播放间隔
        interval: {
            value: 3000
        }
    };
    Kwicks.ATTACH = {
        '': {
            'mouseenter': function() {
                var self = this,
                    autoplay = self.get('autoplay');
                if (autoplay) {
                    self.stop();
                }
            },
            'mouseleave': function() {
                var self = this,
                    autoplay = self.get('autoplay'),
                    sticky = self.get('sticky');
                if (autoplay) {
                    self.start();
                } else if (!sticky) {
                    var kwicks = self.kwicks,
                        length = kwicks.length,
                        activeCls = self.get('activeCls'),
                        spacing = self.get('spacing'),
                        duration = self.get('duration'),
                        easing = self.get('easing'),
                        LoT = self.LoT,
                        WoH = self.WoH,
                        normWoH = self.normWoH;
                    kwicks.stop().removeClass(activeCls);
                    kwicks.each(function(k, j) {
                        var animObj = {};
                        animObj[WoH] = normWoH;
                        if (j < length - 1) {
                            animObj[LoT] = (j * normWoH) + (j * spacing);
                        }
                        k.animate(animObj, duration, easing);
                    });
                }
            }
        }
    };

    Kwicks.METHOD = {
        /**
         *  切换到某个视图
         * @param  {Number} i 要切换的项
         */
        switchTo: function(i) {
            var self = this,
                kwicks = self.kwicks,
                length = kwicks.length,
                preCalcLoTs = self.preCalcLoTs,
                activeCls = self.get('activeCls'),
                duration = self.get('duration'),
                easing = self.get('easing'),
                LoT = self.LoT,
                WoH = self.WoH,
                max = self.max,
                min = self.min;

            if (i >= length || i < 0) {
                i = 0;
                self.set('activeIndex', 0);
            } else {
                self.set('activeIndex', i);
            }
            var kwick = kwicks.item(i);
            kwicks.stop().removeClass(activeCls);
            kwick.addClass(activeCls);
            kwicks.each(function(k, j) {
                var animObj = {};
                if (kwick[0] == k[0]) {
                    animObj[WoH] = max;
                    if (j > 0 && j < length - 1) {
                        animObj[LoT] = preCalcLoTs[i][j];
                    }
                } else {
                    animObj[WoH] = min;
                    if (j > 0 && j < length - 1) {
                        animObj[LoT] = preCalcLoTs[i][j];
                    }

                }
                k.animate(animObj, duration, easing);
            });
        },
        /**
         * 开始自动切换
         */
        start: function() {
            var self = this,
                autoplay = self.get('autoplay'),
                interval = self.get('interval');
            if (autoplay) {
                self.stop();
                self.timer = S.later(function() {
                    var i = self.get('activeIndex');
                    self.switchTo(i + 1);
                }, interval, true, self);
            }
        },
        /**
         * 停止自动切换
         */
        stop: function() {
            var self = this;
            if (self.timer) {
                self.timer.cancel();
                self.timer = null;
            }
        }
    };

    S.extend(Kwicks, Brick, {
        initialize: function() {
            var self = this,
                isVertical = self.get('isVertical'),
                sticky = self.get('sticky'),
                activeIndex = self.get('activeIndex'),
                triggerType = self.get('triggerType'),
                activeCls = self.get('activeCls'),
                spacing = self.get('spacing'),
                duration = self.get('duration'),
                easing = self.get('easing'),
                max = self.max = self.get('max'),
                min = self.min = self.get('min'),
                autoplay = self.get('autoplay');

            var WoH = self.WoH = (isVertical ? 'height' : 'width'); // WoH = Width or Height
            var LoT = self.LoT = (isVertical ? 'top' : 'left'); // LoT = Left or Top
            var container = self.get('el');
            var kwicks = self.kwicks = container.all('li');
            var length = kwicks.length;
            var normWoH = self.normWoH = kwicks.item(0).css(WoH).replace(/px/, ''); // normWoH = Normal Width or Height
            if (!max) {
                max = self.max = (normWoH * length) - (min * (length - 1));
            } else {
                min = self.min = ((normWoH * length) - max) / (length - 1);
            }
            // set width of container ul
            if (isVertical) {
                container.css({
                    width: kwicks.item(0).css('width'),
                    height: (normWoH * length) + (spacing * (length - 1)) + 'px'
                });
            } else {
                container.css({
                    width: (normWoH * length) + (spacing * (length - 1)) + 'px',
                    height: kwicks.item(0).css('height')
                });
            }

            // pre calculate left or top values for all kwicks but the first and last
            // i = index of currently hovered kwick, j = index of kwick we're calculating
            var preCalcLoTs = self.preCalcLoTs = []; // preCalcLoTs = pre-calculated Left or Top's
            for (i = 0; i < length; i++) {
                preCalcLoTs[i] = [];
                // don't need to calculate values for first or last kwick
                for (j = 1; j < length - 1; j++) {
                    if (i == j) {
                        preCalcLoTs[i][j] = isVertical ? j * min + (j * spacing) : j * min + (j * spacing);
                    } else {
                        preCalcLoTs[i][j] = (j <= i ? (j * min) : (j - 1) * min + max) + (j * spacing);
                    }
                }
            }

            // loop through all kwick elements
            kwicks.each(function(kwick, i) {
                // set initial width or height and left or top values
                // set first kwick
                if (i === 0) {
                    kwick.css(LoT, '0px');
                }
                // set last kwick
                else if (i == length - 1) {
                    kwick.css(isVertical ? 'bottom' : 'right', '0px');
                }
                // set all other kwicks
                else {
                    if (sticky) {
                        kwick.css(LoT, preCalcLoTs[activeIndex][i]);
                    } else {
                        kwick.css(LoT, (i * normWoH) + (i * spacing));
                    }
                }
                // correct size in sticky mode
                if (sticky) {
                    if (activeIndex == i) {
                        kwick.css(WoH, max + 'px');
                        kwick.addClass(activeCls);
                    } else {
                        kwick.css(WoH, min + 'px');
                    }
                }
                kwick.css({
                    margin: 0,
                    position: 'absolute'
                });

                kwick.on(triggerType, function() {
                    self.switchTo(i);
                });
            });
            self.start();
        },
        destructor:function(){
            if(self.timer){
                self.timer.cancel();
                self.timer = null;
                self.kwicks = null;
            }
        }
    });
    S.augment(Kwicks, Kwicks.METHOD);
    return Kwicks;
}, {
    requires: ["brix/core/brick"]
});