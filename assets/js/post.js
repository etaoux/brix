KISSY.ready(function(S) {
    S.all('.j-demo').on('load', function(e) {
        var DOM = S.DOM;
        var iframe = e.currentTarget,
            win = iframe.contentWindow,
            doc = win.document;

        iframe.height = DOM.height(doc);
        iframe.width = DOM.width(doc);
    });
	var log = log4javascript.getLogger("main");
	var appender = new log4javascript.InPageAppender('J_log',true);
	var logdivNode = S.one('#J_log');
	var closeNode = S.one('#J_close')
	log.addAppender(appender);
    closeNode.on('click',function (e) {
        e.halt();
        if(appender.isVisible()){
        	logdivNode.animate({width:'28px',height:'18px'},0.3);
            appender.hide();
            closeNode.html('显示');
        }
        else{
            appender.show();
            logdivNode.animate({width:'600px',height:'225px'},0.3);
            closeNode.html('隐藏');
        }
    });
    log.info('调试信息将在这里显示。');
	console = window.console || {};
	console.log=function(){log.info.apply(log,arguments)};
});