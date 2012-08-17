KISSY.add('modules/boot', function (S, Base) {
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

    fns.push(function msg() {
        App.msg = new Base();
    });

    fns.push(function pageWidth() {
        App.msg.on('afterPageWidthChange', function(e) {
            var width = e.newVal;
            document.getElementById('r-content').className = 'w' + width;
        });

        App.msg.set('pageWidth', App.resolution.base);
    });

    fns.push(function tmpl() {
        App.tmpl = {};
        var nodes = document.querySelectorAll('[id^="r-tmpl-"]');
        for (var i=0; i<nodes.length; i++) {
            App.tmpl[nodes[i].id.slice(7)] = nodes[i].innerHTML;
        }
    });

    return Boot;
}, {
    requires: ['base']
});
