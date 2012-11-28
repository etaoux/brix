KISSY.add('brix/gallery/tables/index', function(S, Brick) {
    var $ = S.all;
    /**
     * Tables
     * <br><a href="../demo/gallery/tables/tables.html" target="_blank">Demo</a>
     * @class Brix.Gallery.Tables
     * @extends Brix.Brick
     */
    function Tables() {
        Tables.superclass.constructor.apply(this, arguments);
    }
    Tables.ATTRS = {
        // cb: {
        //     value: '.checkbox'
        // }
    };

    Tables.EVENTS = {
        '.selectLine': {
            click: function(e) {
                var _this = $(e.currentTarget);
                var _tr = _this.parent('tr');

                _this.prop('checked') ? _tr.addClass('selected') : _tr.removeClass('selected');
            }
        },
        '.J_expendCollapse': {
            click: function(e) {
                var _this = e.target;
                var child = $(_this).parent('tr').next('.table-child-tr');

                if (!child) return;

                if ($(_this).hasClass('icon-expend')) {
                    $(_this).replaceClass('icon-expend', 'icon-collapse');
                    child.hide();
                } else {
                    $(_this).replaceClass('icon-collapse', 'icon-expend');
                    child.show();
                }
            }
        },
        '.table-handle': {
            mouseenter: function(e) {
                $(e.currentTarget).css('z-index', 9996).all('.table-change').show();
            },

            mouseleave: function(e) {
                $(e.currentTarget).css('z-index', '').all('.table-change').hide();
            }
        },
        '.table-more': {
            mouseenter: function(e) {
                $(e.currentTarget).css('z-index', 9996).all('.table-info').show();
            },

            mouseleave: function(e) {
                $(e.currentTarget).css('z-index', '').all('.table-info').hide();
            }
        },
        'tbody > tr': {
            mouseenter: function(e) {
                var t = $(e.currentTarget);

                if (!t.hasClass('table-child-tr') && !t.hasClass('none')) {
                    this.curTr.removeClass('hover');
                    t.addClass('hover');
                    this.curTr = t;
                }
            }
        }

    };


    S.extend(Tables, Brick, {
        initialize: function() {
            //默认第一个tr高亮
            this.curTr = this.get('el').all('tbody > tr:first');
            this.curTr.addClass('hover');
        }
    });

    return Tables;
}, {
    requires: ["brix/core/brick"]
});