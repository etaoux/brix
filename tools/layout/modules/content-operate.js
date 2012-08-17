KISSY.add('modules/content-operate', function(S, Node, Utils) {
    function delegate() {
        S.one('#r-content')
            .delegate('click', '#r-add-section', function(e) {
                var count = Math.floor(1920 / (App.grid.c + App.grid.g));
                var bgs = '';
                for (var i=0; i<count; i++) {
                    bgs += '<div class="span1"></div>';
                }
                S.one(e.currentTarget).before( S.substitute(App.tmpl.section, {
                    bgs: bgs,
                    divs: ''
                }) );
            })
            .delegate('click', '.r-add-div', function(e) {
                var num = Math.ceil((180 + App.grid.g) / (App.grid.c + App.grid.g));

                S.one(e.currentTarget).parent('.r-section').one('.r-section-bd').append( S.substitute(App.tmpl.div, {
                    id: Utils.idGen(),
                    cls: 'r-div span' + num
                }) );
            })
            .delegate('click', '.r-clear-section', function(e) {
                S.one(e.currentTarget).parent('.r-section').one('.r-section-bd').empty();
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
                cls = Utils.clsReplace(cls, reg, 'span' + Math.ceil(width / (App.grid.c + App.grid.g)) + suf);
                el.attr('class', cls);
            })
            .delegate('click', '.r-remove-div', function(e) {
                S.one(e.currentTarget).parent('.r-div').remove();
            });

    }

    function resize() {
        S.all('.r-div').on('resize', function(e) {
            console.log(e);
        });
    }

    return {
        init: function () {
            delegate();
            resize();
        }
    };
}, {
    requires: ['node', 'modules/utils']
});
