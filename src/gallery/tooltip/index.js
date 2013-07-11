KISSY.add("brix/gallery/tooltip/index", function(S, Pagelet, Overlay) {
    /**
     * ToolTip组件
     * <br><a href="../demo/gallery/tooltip/tooltip.html" target="_blank">Demo</a>
     * @class Brix.Gallery.ToolTip
     * @extends KISSY.Overlay
     *
     * <br>see:
     * <a href="http://docs.kissyui.com/docs/html/api/component/overlay/overlay.html">http://docs.kissyui.com/docs/html/api/component/overlay/overlay.html</a>
     *
     */

    function ToolTip(config) {
        var self = this;
        //对传入的配置处理
        if(config.el) {
            self.set('trigger', config.el);
            delete config.el;
        }
        ToolTip.superclass.constructor.apply(this, arguments);
    }
    ToolTip.ATTRS = {
        /**
         * 触发ToolTip显示隐藏的对象
         * @cfg {Element}
         */
        trigger: {
            value: false
        },
        /**
         * 触发弹出ToolTip的事件类型,
         * 例如：‘click’,’mouse’,默认mouse
         * @cfg {String}
         */
        triggerType: {
            value: 'mouse'
        },
        /**
         * 延迟隐藏tooltip的时间，单位s，默认为1。
         * 如果需要不隐藏，设置成false
         * @cfg {Number} mouseDelay
         */
        mouseDelay: {
            value: 1
        },
        /**
         * 当trigger是 click, 是否支持toggle.，默认false
         * @cfg {Boolean} toggle
         */
        toggle: {
            value: false
        },
        /**
         * 宽度
         * @cfg {Number} width
         */
        width:{
            value:200
        },
        /**
         * 对齐方式
         * @cfg {Object} align
         * @cfg {Element} align.node 对其的节点
         * @cfg {Array} align.points   对其方式
         * @cfg {Array} align.offset   对其偏移量
         */
        align: {
            setter: function(v) {
                if(!v.offset) {
                    if((v.points[0] == 'tl' && v.points[1] == 'bl') || (v.points[0] == 'tr' && v.points[1] == 'br')) {
                        v.offset = [0, -8];
                    } else if((v.points[0] == 'bl' && v.points[1] == 'tl') || (v.points[0] == 'br' && v.points[1] == 'tr')) {
                        v.offset = [0, 8];
                    } else if((v.points[0] == 'tr' && v.points[1] == 'tl') || (v.points[0] == 'br' && v.points[1] == 'bl')) {
                        v.offset = [8, 0];
                    } else if((v.points[0] == 'tl' && v.points[1] == 'tr') || (v.points[0] == 'bl' && v.points[1] == 'br')) {
                        v.offset = [-8, 0];
                    }
                }
                return v;
            },
            getter: function(v) {
                if(!v) {
                    v = {
                        node: false,
                        points: ['bl', 'tl'],
                        offset: [0, 0]
                    };
                }
                return v;
            }
        },
        /**
         * 填充的内容
         * @cfg {String}
         */
        content: {
            setter: function(v) {
                var self = this;
                var content = v || '';
                var align = self.get('align') || {};
                if(!align.points) {
                    align.points = ['br', 'tl'];
                }
                content = '<div class="arrow arrow-' + align.points[0] + '-' + align.points[1] + '"><div></div></div><div class="tooltip-bd">' + content + '</div>'
                return content;
            }
        },
        elCls: {
            value: 'tooltip'
        },
        prefixCls: {
            value: 'tooltip-'
        },
        /**
         * 是否需要关闭按钮
         * @cfg {Boolean}
         */
        closable: {
            value: true
        },
        mask: {
            value: false
        },
        /**
         * 模板，如果设置此项，将content设置成''，但是会调用brix的pagelet实例化
         * @cfg {String}
         */
        tmpl: {
            value: null
        },
        /**
         * 模板数据，和tmpl配合使用
         * @cfg {Object}
         */
        data: {

        }
    };

    S.extend(ToolTip, Overlay, {
        initializer: function() {
            var self = this,
                align = self.get('align'),
                trigger = self.get('trigger');

            if(!align.node && trigger) {
                align.node = trigger;
                self.set('align', align);
            }
            self.on('hide', function() {
                self._clearHiddenTimer();
            });
            if(trigger) {
                var triggerType = self.get('triggerType');
                var type = 'click'
                if(triggerType == 'mouse') {
                    type = 'mouseenter';
                    S.all(trigger).on('mouseenter', function(e) {
                        e.preventDefault();
                        self._clearHiddenTimer();
                        self.show();
                    });
                } else {
                    if(self.get('toggle')) {
                        S.all(trigger).on(type, function(e) {
                            e.preventDefault();
                            self.toggle();
                        });
                    } else {
                        S.all(trigger).on(type, function(e) {
                            e.preventDefault();
                            self.show();
                        });
                    }
                }
                S.all(trigger).on('mouseleave', function(e) {
                    e.preventDefault();
                    self._setHiddenTimer();
                });
            }

            //渲染模板内容
            self.on('afterRenderUI', function() {
                self.get('el').on('mouseleave', self._setHiddenTimer, self).on('mouseenter', self._clearHiddenTimer, self);
                var closeBtn = self.get('el').one('.tooltip-ext-close');
                if(closeBtn){
                    closeBtn.one('.tooltip-ext-close-x').html('&#223');
                }
                if(self.get('tmpl')) {
                    var container = self.get('contentEl');
                    if(self.get('content')){
                        container = container.one('.tooltip-bd');
                    }
                    self.pagelet = new Pagelet({
                        container: container,
                        tmpl: self.get('tmpl'),
                        data: self.get('data')
                    });
                }
            });
        },
        destructor: function() {
            var self = this;
            if(self.pagelet) {
                self.pagelet.destroy();
                self.pagelet = null;
            }
        },
        /**
         * 切换显示隐藏
         */
        toggle: function() {
            var self = this,
                el = self.get('el');
            if(el && !S.isString(el)) {
                if(el.css('visibility') == 'hidden') {
                    self.show();
                } else {
                    self.hide();
                }
            } else {
                self.show();
            }
        },
        _setHiddenTimer: function() {
            var self = this,
                mouseDelay = self.get('mouseDelay');
            if(mouseDelay) {
                self._clearHiddenTimer();
                self._hiddenTimer = S.later(function() {
                    self.hide();
                }, self.get('mouseDelay') * 1000);
            }
        },

        _clearHiddenTimer: function() {
            var self = this;
            if(self._hiddenTimer) {
                self._hiddenTimer.cancel();
                self._hiddenTimer = undefined;
            }
        }
    });
    return ToolTip;
}, {
    requires: ["brix/core/pagelet", "overlay"]
});