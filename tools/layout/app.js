var App = {
    appVer: '0.0.1',
    grid: {
        // 列宽
        c: 10,
        // 槽宽
        g: 10
    },
    resolution: {
        base: 960,
        other: [720, 1200, 1440, 1680]
    },
    struct: [[]],
};
App.msg = new KISSY.Base();

KISSY.config({
    packages: {
        libs: {
            base: '.',
            tag: '20120813'
        }
    }
});

KISSY.use('libs/data, libs/render', function(S, Data, Render) {
    if (location.hash) {
        Data.load();
    }

    App.msg.set('pageWidth', App.resolution.base, {slient: true});

    KISSY.ready(Render.init());
});
