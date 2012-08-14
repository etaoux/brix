KISSY.add('modules/boot', function (S, Utils) {
    var fns = [];

    function Boot() {
        for (var i=0; i<fns.length; i++) {
            fns[i]();
        }
    }

    fns.push(function load() {
        if (location.hash) {
            S.mix(App, JSON.parse(location.hash.slice(1)));
        }
    });

    fns.push(function pageWidth() {
        App.msg.on('afterPageWidthChange', function(e) {
            var width = e.newVal;
            document.getElementById('r-content').className = 'w' + width;
            Utils.cssGen(width);
        });

        App.msg.set('pageWidth', App.resolution.base);
    });

    return Boot;
}, {
    requires: ['modules/utils']
});
