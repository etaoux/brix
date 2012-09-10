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

KISSY.use('brix/core/pagelet,brix/gallery/affix/', function(S, Pagelet, Affix) {
    var pagelet = new Pagelet({
        tmpl: '#page' // 模板(容器节点)
    });

    pagelet.addBehavior();
    pagelet.ready(function() {
        pagelet.render();
    });

    new Affix({
        el: '#page-nav'
    });
});