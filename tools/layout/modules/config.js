KISSY.add('modules/config', function (S, Brick) {
    function Config() {
        Config.superclass.constructor.apply(this, arguments);
    }
    Config.ATTACH = {
        '': {
            'click': function(e) {
                e.currentTarget.href = webkitURL.createObjectURL(_page());
            }
        }
    };

    S.extend(Config, Brick);
    return Config;
}, {
    requires: ['brix/core/brick']
});
