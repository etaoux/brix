KISSY.add("brix/gallery/affix/index", function(S, Brick) {

    function Affix() {
        Affix.superclass.constructor.apply(this, arguments);
    }

    Affix.ATTRS = {
        scrollOffset: {
            value: 0
        },
        edge: {
            value: 0
        },
        countHeight: {
            value: true
        },
        tabEdges: {
            value: []
        }
    };

    Affix.DOCEVENTS = {
        '': { // listen on the document event
            'scroll': function() {
                this.check();
            }
        }
    };

    Affix.METHODS = {
        check: function() {
            var body = S.one(window),
                el = this.get('el'),
                edge = this.get('edge'),
                tabEdges = this.get('tabEdges'),
                scrollTop = body.scrollTop(),
                scrollOffset = this.get('scrollOffset'),
                countHeight = this.get('countHeight'),
                tab,
                matched = false;

            if (scrollTop + scrollOffset >= edge) {
                el.addClass('affix');
            }
            else {
                el.removeClass('affix');
            }
            if (countHeight) {
                scrollTop += el.outerHeight();
            }
            for (var i = tabEdges.length - 1; i >= 0; i--) {
                tab = tabEdges[i];
                if (scrollTop + 1 >= tab.edge) {    // some offset().top might differs in less than 1.
                    el.all('a').removeClass('current');
                    el.all('a[href="#' + tab.id + '"]').addClass('current');
                    matched = true;
                    break;
                }
            }
            if (!matched) {
                el.all('a').removeClass('current');
            }
        }
    };

    S.extend(Affix, Brick, {
        initialize: function() {
            var node = this.get('el'),
                offset = node.offset(),
                tabEdges = [],
                Node = S.Node,
                $ = Node.all;

            node.all('a').each(function(a, i) {
                var id = a.attr('href').split('#')[1];

                if (!id) {
                    return;
                }
                tabEdges.push({
                    id: id,
                    edge: $('#' + id).offset().top
                });
            });
            this.set('edge', offset.top);
            this.set('tabEdges', tabEdges);

            // might have scrolled already
            this.check();
        }
    });

    S.augment(Affix, Affix.METHODS);

    return Affix;
}, {
    requires: ['brix/core/brick']
});