KISSY.add("brix/gallery/dialog/1.0/dialog", function(S, Pagelet, Overlay) {
    function _getContent(v, dir) {
        var wrapper = {
            'up': ['<div class="popup popup-up">', '<div class="popup-left"></div>', '<div class="popup-center">', '<div class="popup-content">' + v + '</div>', '</div>', '<div class="popup-right"></div>', '<div class="popup-bottom">', '<div class="popup-bottom-left"></div>', '<div class="popup-bottom-center">&nbsp;</div>', '<div class="popup-bottom-right"></div>', '</div>', '</div>'],
            'right': ['<div class="popup-h popup-h-right">', '<div class="popup-h-top"></div>', '<div class="popup-h-center">', '<div class="popup-h-body">', '<div class="popup-content">' + v + '</div>', '</div>', '</div>', '<div class="popup-h-bottom"></div>', '</div>']
        };
        wrapper['down'] = wrapper['up'].slice(0);
        wrapper['down'][0] = wrapper['down'][0].replace('popup-up', '');
        wrapper['left'] = wrapper['right'].slice(0);
        wrapper['left'][0] = wrapper['left'][0].replace('popup-h-right', '');
        return wrapper[dir].join('');
    }

    function _setWidth(v, dir) {
        switch (dir) {
        case 'up':
        case 'down':
            if (v < 320) {
                return 320;
            }
            break;
        case 'left':
        case 'right':
            if (v < 145) {
                return 145;
            }
            break;
        }
        return v;
    }

    function Dialog(config) {
        var self = this;
        Dialog.superclass.constructor.apply(this, arguments);
    }
    Dialog.ATTRS = {
        start: {
            value: {
                left: 600,
                top: 100,
                opacity: 0
            }
        },
        end: {
            value: {
                left: 100,
                top: 100,
                opacity: 1
            }
        },
        x: {
            getter: function() {
                var self = this;
                return self.get('start').left;
            }
        },
        y: {
            getter: function() {
                var self = this;
                return self.get('start').top;
            }
        },
        dir: {
            getter: function() {
                var self = this;
                var dir = '',
                    start = self.get('start'),
                    end = self.get('end');
                dir = start.left === end.left && (start.top < end.top ? 'down' : 'up') || start.top === end.top && (start.left < end.left ? 'right' : 'left') || 'left';
                return dir;
            }
        },
        width: {
            valueFn: function(v) {
                if (!v) {
                    return v;
                }
                var self = this;
                var dir = self.get('dir');
                return _setWidth(v, dir);
            },
            setter: function(v) {
                var self = this;
                var dir = self.get('dir');
                return _setWidth(v, dir);
            }
        },
        elCls: {
            valueFn: function() {
                return 'dialog-' + this.get('dir');
            }
        },
        prefixCls: {
            value: 'ux-'
        },
        duration: {
            value: 0.3
        },
        easing: {
            value: 'easeOut'
        },
        closable: {
            value: true
        },
        mask: {
            value: false
        },
        content: {
            valueFn: function(v) {
                return _getContent('', this.get('dir'));
            },
            setter: function(v) {
                return _getContent(v, this.get('dir'));
            }
        },
        tmpl: {
            value: null
        },
        data: {

        }
    };

    S.extend(Dialog, Overlay, {
        initializer: function() {
            var self = this;
            self.on('beforeVisibleChange', function(ev) {
                if (!ev.newVal) {
                    var el = self.get('el');
                    el.css(self.get('end'));
                    el.animate(self.get('start'), self.get('duration'), self.get('easing'), function() {
                        // 隐藏
                        self.fire('hide');

                    });
                    return false;
                }
            });
            self.on('afterVisibleChange', function(ev) {
                if (ev.newVal) {
                    var el = self.get('el');
                    el.css(self.get('start'));
                    el.animate(self.get('end'), self.get('duration'), self.get('easing'), function() {

                    });
                }
            });
            //渲染模板内容
            self.on('afterRenderUI', function() {
                if (self.get('tmpl')) {
                    self.pagelet = new Pagelet({
                        render: self.get('contentEl').one('.popup-content'),
                        autoRender: true,
                        tmpl: self.get('tmpl'),
                        data: self.get('data')
                    });
                    self.pagelet.addBehavior();
                }
            });
        }
    });
    return Dialog;
}, {
    requires: ["brix/pagelet", "overlay", "./dialog.css"]
});