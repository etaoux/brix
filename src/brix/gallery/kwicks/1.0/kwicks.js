KISSY.add("brix/gallery/kwicks/1.0/kwicks", function(S, Brick) {
    function Kwicks(config) {
        var self = this;
        self.on('rendered', function() {
            self.initialize();
        });
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
        defaultKwick: {
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

        }
    };

    S.extend(Kwicks, Brick, {
        initialize: function() {
            var self = this,
                isVertical = self.get('isVertical'),
                sticky = self.get('sticky'),
                defaultKwick = self.get('defaultKwick'),
                triggerType = self.get('triggerType'),
                activeCls = self.get('activeCls'),
                spacing = self.get('spacing'),
                duration = self.get('duration'),
                easing = self.get('easing'),
                max = self.get('max'),
                min = self.get('min');

            var WoH = (isVertical ? 'height' : 'width'); // WoH = Width or Height
            var LoT = (isVertical ? 'top' : 'left'); // LoT = Left or Top
            var container = self.get('el');
            var kwicks = container.all('li');
            var length = kwicks.length;
            var normWoH = kwicks.item(0).css(WoH).replace(/px/, ''); // normWoH = Normal Width or Height
            if (!max) {
                max = (normWoH * length) - (min * (length - 1));
            } else {
                min = ((normWoH * length) - max) / (length - 1);
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
            var preCalcLoTs = []; // preCalcLoTs = pre-calculated Left or Top's
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
                        kwick.css(LoT, preCalcLoTs[defaultKwick][i]);
                    } else {
                        kwick.css(LoT, (i * normWoH) + (i * spacing));
                    }
                }
                // correct size in sticky mode
                if (sticky) {
                    if (defaultKwick == i) {
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
                });
            });
            if (!sticky) {
                container.on("mouseleave", function() {
                    kwicks.stop().removeClass(activeCls);
                    kwicks.each(function(k, j) {
                        var animObj = {};
                        animObj[WoH] = normWoH;
                        if (j < length - 1) {
                            animObj[LoT] = (j * normWoH) + (j * spacing);
                        }
                        k.animate(animObj, duration, easing);
                    });
                });
            }
        }
    });
    return Kwicks;
}, {
    requires: ["brix/brick"]
});