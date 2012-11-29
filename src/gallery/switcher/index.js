KISSY.add("brix/gallery/switcher/index", function(S, Brick) {
    /**
     * Switcher
     * <br><a href="../demo/gallery/switcher/switcher.html" target="_blank">Demo</a>
     * @class Brix.Gallery.Switcher
     * @extends Brix.Brick
     */
    function Switcher() {
        Switcher.superclass.constructor.apply(this, arguments);
    }
    Switcher.ATTRS = {
        switchOn: {
            value: false
        },
        switchStatus: {
            value: true
        }
    };

    Switcher.METHODS = {
        switchTo: function(on) {
            var self = this;
            self._switchTo(on);
        }
    };

    Switcher.FIRES = {
        switched: 'switched'
    };

    Switcher.EVENTS = {
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
                if (!self.get('switchStatus')) {
                    el.addClass('switcher-no-status');
                }
            }
            else {
                el.removeClass('switcher-on');
                if (!self.get('switchStatus')) {
                    el.removeClass('switcher-no-status');
                }
            }

            data = {
                value: el.hasClass('switcher-on')
            };
            self.fire(Switcher.FIRES.switched, data);
        }
    });

    S.augment(Switcher,Switcher.METHODS);
    return Switcher;
}, {
    requires: ["brix/core/brick"]
});
