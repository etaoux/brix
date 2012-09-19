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
            iframe.height = height;
            iframe.width ='100%';
        }
        catch (e) {
            if (window.console && console.log) {
                console.log(e.message);
            }
        }
    }

    var demos = KISSY.all('.j-demo');

    demos.each(function(iframe) {
        adjustHeight(iframe[0]);
    });
    demos.on('load', function(e) {
        adjustHeight(e.currentTarget);
    });

    function initLog() {
        if (!window.log4javascript) {
            return;
        }
        var log = log4javascript.getLogger("main");
        var appender = new log4javascript.InPageAppender('J_log',true);
        var logdivNode = S.one('#J_log');
        var closeNode = S.one('#J_close')
        log.addAppender(appender);
        closeNode.on('click',function (e) {
            e.halt();
            if(closeNode.html()!='显示调试窗口'){
                log.info('隐藏调试窗口');
                logdivNode.animate({width:'88px',height:'18px'},0.3,'easeNone',function(){
                    appender.hide();
                    closeNode.html('显示调试窗口');
                });

            }
            else{
                log.info('显示调试窗口');
                appender.show();
                logdivNode.animate({width:'600px',height:'225px'},0.3,'easeNone',function(){
                    closeNode.html('隐藏调试窗口');
                });
            }
        });

        console = window.console || {};
        console.log = function() {
            log.info.apply(log,arguments);
        };
    }

    initLog();

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
            container: '#J_tocBox'
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
