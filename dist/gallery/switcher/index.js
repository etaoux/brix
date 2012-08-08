KISSY.add("brix/gallery/switcher/index", function(S, Brick) {
    function Switcher() {
        Switcher.superclass.constructor.apply(this, arguments);
    }
    Switcher.ATTRS = {
        switchTo: true
    };

    Switcher.METHOD = {

    };

    Switcher.ATTACH = {
        '': {
            click: function(e) {
                var el = this.get('el'), data;

                el.toggleClass('switcher-on');
                data = {
                    value: el.hasClass('switcher-on')
                };

                this.fire('switch', data);
            }
        }
    };

    S.extend(Switcher, Brick, {
    });

    S.augment(Switcher,Switcher.METHOD);
    return Switcher;
}, {
    requires: ["brix/core/brick"]
});
