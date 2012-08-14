KISSY.add('modules/content-operate', function(S, Node, Utils) {
    return {
        init: function () {
            S.one('#r-content')
                .delegate('click', '#r-add-section', function(e) {
                    S.one(e.currentTarget).before( S.substitute(App.tmpl.section, {divs: ''}) );
                })
                .delegate('click', '.r-add-div', function(e) {
                    S.one(e.currentTarget).parent('.r-section').one('.row').append( S.substitute(App.tmpl.div, {
                        id: Utils.idGen(),
                        cls: 'r-div span10'
                    }) );
                })
                .delegate('click', '.r-clear-section', function(e) {
                    S.one(e.currentTarget).parent('.r-section').one('.row').empty();
                })
                .delegate('click', '.r-remove-section', function(e) {
                    S.one(e.currentTarget).parent('.r-section').remove();
                })
                .delegate('change', '.r-resize-div', function(e) {
                    var el = S.one(e.currentTarget);
                    var val = el.val();
                    var matches = val.match(/(\d+)x(\d+)/);
                    if (!matches) return;

                    var width = matches[1];
                    var height = matches[2];
                    var pageWidth = App.msg.get('pageWidth');
                    el = el.parent('.r-div');
                    el.height(height);

                    var cls = el.attr('class');
                    var suf = pageWidth === App.resolution.base ? '' : '_' + pageWidth;
                    var reg = new RegExp('^span\\d+' + suf + '$');
                    cls = Utils.clsReplace(cls, reg, 'span' + Math.ceil(width/20) + suf);
                    el.attr('class', cls);
                })
                .delegate('click', '.r-remove-div', function(e) {
                    S.one(e.currentTarget).parent('.r-div').remove();
                });

        }
    };
}, {
    requires: ['node', 'modules/utils']
});
