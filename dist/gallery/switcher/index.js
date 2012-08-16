KISSY.add("brix/gallery/switcher/index", function(S, Brick) {
    function Switcher() {
        Switcher.superclass.constructor.apply(this, arguments);
    }
    Switcher.ATTRS = {
        switchOn: {
            value: false
        },
        switchNoStatus: {
            value: false
        }
    };

    Switcher.METHOD = {
        switchTo: function(on) {
            var self = this;
            self._switchTo(on);
        }
    };

    Switcher.ATTACH = {
        '': {
            click: function(e) {
                var el = this.get('el');

                this._switchTo(!el.hasClass('switcher-on'));
            }
        }
    };

    S.extend(Switcher, Brick, {
        initialize: function() {
            var self = this;

            if (self.get("switchOn")) {
                self._switchTo(true);
            }
            else {
                self._switchTo(false);
            }
        },
        _switchTo: function(on) {
            var self = this,
                el = self.get('el');

            if (on) {
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
