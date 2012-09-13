KISSY.add('modules/section', function(S, Brick, Resizable, Utils) {
    function Section() {
        Section.superclass.constructor.apply(this, arguments);
    }
    Section.ATTACH = {
        '.r-add-div': {
            'click': function(e) {
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
            }
        },
        '.r-remove-section': {
            'click': function(e) {
                S.one(e.currentTarget).parent('.r-section').remove();
            }
        }
    };

    S.extend(Section, Brick);
    return Section;
}, {
    requires: ['brix/core/brick', 'resizable', 'modules/utils']
});
