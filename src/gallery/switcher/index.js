KISSY.add("brix/gallery/switcher/index", function(S, Brick) {
    function Switcher() {
        Switcher.superclass.constructor.apply(this, arguments);
    }
    Switcher.ATTRS = {
        switchOn: {
            value: true
        },
        switchNoStatus: {
            value: false
        }
    };

    Switcher.METHOD = {

    };

    Switcher.ATTACH = {
        '': {
            click: function(e) {
                var el = this.get('el');

                this._switchTo(el.hasClass('switcher-on'));
            }
        }
    };

    S.extend(Switcher, Brick, {
        initializer: function() {
            var self = this;
            //渲染模板内容
            self.on('afterRenderUI', function() {
                var el = self.get('el');

                if (self.get("switcheOn")) {
                    self._switchTo(true);
                }
                else {
                    self._switchTo(false);
                }
                if (self.get('tmpl')) {
                    self.pagelet = new Pagelet({
                        container: self.get('contentEl'),
                        autoRender: true,
                        tmpl: self.get('tmpl')
                    });
                    self.pagelet.addBehavior();
                }
            });
        },
        _switchTo: function(on) {
            var self = this,
                el = self.get('el');

            if (!on) {
                el.addClass('switcher-on');
                if (self.get('switchNoStatus')) {
                    el.addClass('switcher-no-status');
                }
            }
            else {
                el.removeClass('switcher-on');
                if (self.get('switchNoStatus')) {
                    el.removeClass('switcher-no-status');
                }
            }

            data = {
                value: el.hasClass('switcher-on')
            };
            this.fire('switch', data);
        }
    });

    S.augment(Switcher,Switcher.METHOD);
    return Switcher;
}, {
    requires: ["brix/core/brick"]
});
