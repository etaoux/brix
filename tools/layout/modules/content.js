KISSY.add('modules/content', function(S, Node, Utils, ContentOperate, ContentAnim) {
    function render() {
        var html = '';
        var rows = App.struct;
        var row;
        var str;
        var i, j;

        var count = Math.floor(1920 / (App.grid.c + App.grid.g));
        var bgs = '';
        for (i=0; i<count; i++) {
            bgs += '<div class="span1"></div>';
        }

        for (i=0; i<rows.length; i++) {
            row = rows[i];
            str = '';
            for (j=0; j<row.length; j++) {
                str += S.substitute(App.tmpl.div, {
                    id: row[j++],
                    cls: 'r-div' + row[j].replace(/^|\s/g, ' span')
                });
            }

            html += S.substitute(App.tmpl.section, {
                bgs: bgs,
                divs: str
            });
        }

        S.one('#r-add-section').before(html);
    }
    
    return function () {
        S.DOM.addStyleSheet(Utils.cssGen());

        App.msg.on('afterPageWidthChange', function(e) {
            document.getElementById('r-content').className = 'w' + e.newVal;
        });
        App.msg.set('pageWidth', App.resolution.base);

        render();
        ContentOperate.init();
        ContentAnim.init();
    };
}, {
    requires: ['node', 'modules/utils', 'modules/content-operate', 'modules/content-anim']
});
