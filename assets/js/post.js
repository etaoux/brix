KISSY.ready(function(S) {
    S.all('.j-demo').on('load', function(e) {
        var DOM = S.DOM;
        var iframe = e.currentTarget,
            win = iframe.contentWindow,
            doc = win.document;
        var height = DOM.height(doc);
        iframe.height = height<300?300:height;
        var width = DOM.width(doc);
        iframe.width = width<800?800:width;
    });
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
	console.log=function(){log.info.apply(log,arguments)};
});