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
        others: [720, 1200, 1440, 1680]
    },
    struct: [[]],
};

KISSY.config({
    packages: {
        modules: {
            base: '.',
            debug: true,
            tag: '20120813'
        }
    }
});

KISSY.use('modules/boot, modules/pagelet', function(S, Boot, Pagelet) {
    Boot();

    Pagelet.init();
});
