KISSY.config({
    packages: [{
        name: "brix",
        tag: "20120419",
        path: "/",     // 这里可以配置cdn的路径
        charset: "utf-8"
    }],
    map: [
        [/(.+brix)\/(.+?)(?:-min)?.js(\?[^?]+)?$/, "$1/src/$2.js$3"],
        [/(.+brix)\/(.+?)(?:-min)?.css(\?[^?]+)?$/, "$1/src/$2.css$3"]
    ]
});

KISSY.ready(function(S) {

    var affix = '#page-nav',
        threshold = getThreshold(affix);

    S.Event.on(window, 'scroll', function(ev) {
        var body = S.one(window);

        if (body.scrollTop() > threshold) {
            S.one(affix).addClass('fixed');
        }
        else {
            S.one(affix).removeClass('fixed');
        }
    });

    function getThreshold(selector) {
        var node = S.one(selector),
            offset = node.offset();

        return offset.top - node.outerHeight();
    }
});

KISSY.use('brix/core/pagelet', function(S, Pagelet) {
    var pagelet = new Pagelet({
        tmpl: '#page' // 模板(容器节点)
    });

    pagelet.addBehavior();
    pagelet.ready(function() {
        pagelet.render();
    });
});