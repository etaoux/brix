KISSY.ready(function(S) {
    S.all('.j-demo').on('load', function(e) {
        var DOM = S.DOM;
        var iframe = e.currentTarget,
            win = iframe.contentWindow,
            doc = win.document;

        iframe.height = DOM.height(doc);
        iframe.width = DOM.width(doc);
    });
});