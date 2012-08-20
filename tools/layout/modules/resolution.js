KISSY.add('modules/resolution', function(S, D, E, Node) {
    return function () {
        var html = '<div class="list">';
        var all = App.resolution.all;
        for (var i=0; i<all.length; i++) {
            if (i % 2) {
                html += '<span class="split">' + all[i] + 'px</span>';
                continue;
            }

            if (all[i] === App.resolution.base) {
                html += '<a class="tab active base">' + all[i] + 'px</a>';
            } else {
                html += '<a class="tab">' + all[i] + 'px</a>';
            }
        }
        html += '</div>';
        S.one('#r-resolution').append(html);

        S.one('#r-resolution').delegate('click', '.tab', function(e) {
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
