KISSY.add('brix/gallery/keystone/index', function(S, Brick) {

    function Keystone() {
        Keystone.superclass.constructor.apply(this, arguments);
    }

    Keystone.ATTRS = {
        backgroundColor: {
            // 默认值
            value: '#F50',
            // this.set('backgroundColor', '#ddd'); 的时候会调用的方法
            setter: function(v) {
                if (/^\#[0-9a-f]{6}$/i.test(v) || /^\#[0-9a-f]{3}/i.test(v)) {
                    return v;
                }
                else {
                    return '#F50';
                }
            },
            // this.get('backgroundColor') 时会调用的方法
            getter: function(v) {
                if (v.length === 4) {
                    return '#' + v.substr(1).replace(/\w/ig, function(c) {
                        return c.toUpperCase() + c.toUpperCase();
                    })
                }
                else {
                    return v.toUpperCase();
                }
            }
        }
    };

    S.extend(Keystone, Brick, {
        initialize: function() {
            var el = this.get('el'),
                cfg;

            cfg = {
                duration: 2,
                queue: 'keystone' + this.get('id')
            };
            el.all('p').animate({
                backgroundColor: '#f50'
            }, cfg).animate({
                backgroundColor: '#fff'
            }, cfg);
        }
    });

    return Keystone;
}, {
    requires: ["brix/core/brick"]
});