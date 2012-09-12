KISSY.add('modules/content-operate', function(S, Resizable, Utils) {
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
                var section = S.one(e.currentTarget).parent('.r-section');

                section.one('.r-section-bd').append( S.substitute(App.tmpl.div, {
                    id: Utils.idGen(),
                    cls: 'r-div span' + num
                }) );

                var node = section.all('.r-div').slice(-1);
                var r = new Resizable({
                    node: node,
                    handlers: ['br'],
                    minWidth: App.grid.c,
                    minHeight: 30,
                    maxWidth: App.msg.get('pageWidth')
                });
                r.dds.br.on('dragstart', function(e) {
                    node.addClass('drag');
                });
                r.dds.br.on('drag', function(e) {
                    var width = node.width();

                    width -= width % (App.grid.c + App.grid.g);

                    node.one('.r-div-size').html(width + 'x' + node.height());
                });
                r.dds.br.on('dragend', function(e) {
                    node.removeClass('drag');

                    var pageWidth = App.msg.get('pageWidth');

                    var cls = node.attr('class');
                    var suf = pageWidth === App.resolution.base ? '' : '_' + pageWidth;
                    var reg = new RegExp('^span\\d+' + suf + '$');
                    cls = Utils.clsReplace(cls, reg, 'span' + Math.ceil(node.width() / (App.grid.c + App.grid.g)) + suf);
                    node.attr('class', cls);

                    node.css('width', '');
                });
            })
            .delegate('click', '.r-clear-section', function(e) {
                S.one(e.currentTarget).parent('.r-section').one('.r-section-bd').empty();
            })
            .delegate('click', '.r-remove-section', function(e) {
                S.one(e.currentTarget).parent('.r-section').remove();
            })
            .delegate('change', '.r-div-size', function(e) {
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
        S.all('.r-div').each(function(node) {
            var r = new Resizable({
                node: node,
                handlers: ['br'],
                minWidth: App.grid.c,
                minHeight: 30,
                maxWidth: App.msg.get('pageWidth')
            });
        });
    }

    return {
        init: function () {
            delegate();
            resize();
        }
    };
}, {
    requires: ['resizable', 'modules/utils']
});
