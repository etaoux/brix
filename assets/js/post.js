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

    function adjustHeight(iframe) {
        var DOM = KISSY.DOM,
            win = iframe.contentWindow,
            doc = win.document,
            height;

        try {
            height = DOM.outerHeight(doc, true);
            if (iframe.height !== height) {
                iframe.height = height;
                iframe.width ='100%';
            }
        }
        catch (e) {
            if (window.console && console.log) {
                console.log(e.message);
            }
        }
    }

    (function() {
        var demos = S.all('.j-demo');

        demos.each(function(iframe) {
            adjustHeight(iframe[0]);
        });
        demos.on('load', function(e) {
            adjustHeight(e.currentTarget);
        });
        demos = null;

        var timer = setInterval(function() {
            S.all('.j-demo').each(function(iframe) {
                adjustHeight(iframe[0]);
            });
        }, 200);
        window.onbeforeunload = function() {
            clearInterval(timer);
        }
    })();

    KISSY.use('sizzle', function(S) {
        var aside = S.one('#aside');

        aside.delegate('click', 'section:not(.current)', function(e) {
            var cat = S.Node(e.currentTarget);

            cat.toggleClass('collapsed');
        })
    });

    KISSY.use('brix/gallery/toc/,brix/gallery/affix/', function(S, ToC, Affix) {
        var toc = new ToC({
            essay: '#page',
            tmpl: S.one('#J_tocTemplate').html(),
            container: '#J_tocBox',
            offsetTop: S.one('#site-nav').outerHeight()
        });
        toc.setChunkData('tree', toc.parse());
        toc.render();
        var affix = new Affix({
            el: '#J_toc',
            scrollOffset: 20,
            countHeight: false
        });
    });
});
