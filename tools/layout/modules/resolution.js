KISSY.add('modules/resolution', function(S, D, E, Node) {
    return function () {
        var html = '<ol>';
        var base = App.resolution.base;
        var others = App.resolution.others;
        for (var i=0; i<others.length; i++) {
            if (base < others[i]) {
                html += '<li class="active base">' + base + 'px</li>';
                base = undefined;
            }
            html += '<li>' + others[i] + 'px</li>';
        }
        html += '</ol>';
        S.one('#r-resolution').append(html);

        S.one('#r-resolution').delegate('click', 'li', function(e) {
            var el = S.one(e.currentTarget);
            
            if (el.hasClass('active')) return;

            el.addClass('active');
            el.siblings('.active').removeClass('active');

            App.msg.set('pageWidth', parseInt(el.html(), 10));
        });
    };
}, {
    requires: ['dom', 'event', 'node']
});
