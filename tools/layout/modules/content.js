KISSY.add('modules/content', function(S, Node, Utils) {
    var sectionTmpl = S.one('#r-tmpl-section').html();
    var divTmpl = S.one('#r-tmpl-div').html();

    function render() {
        var html = '';
        var rows = App.struct;
        var row;
        var str;
        var i, j;

        for (i=0; i<rows.length; i++) {
            row = rows[i];
            str = '';
            for (j=0; j<row.length; j++) {
                str += S.substitute(divTmpl, {
                    id: Utils.idGen(),
                    cls: row[j]
                });
            }

            html += S.substitute(sectionTmpl, {divs: str});
        }

        S.one('#r-add-section').before(html);
    }
    
    return function () {
        S.one('#r-content')
            .delegate('click', '#r-add-section', function(e) {
                S.one(e.currentTarget).before( S.substitute(sectionTmpl, {divs: ''}) );
            })
            .delegate('click', '.r-add-div', function(e) {
                S.one(e.currentTarget).parent('.r-section').one('.row').append( S.substitute(divTmpl, {
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

        render();
    };
}, {
    requires: ['node', 'modules/utils']
});
