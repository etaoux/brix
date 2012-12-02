KISSY.add('brix/gallery/placeholder/index', function(S, Brick) {
    /**
     * Placeholder 仿win7登录框placeholder效果 focus后value为空时placeholder不消失
     * <br><a href="../demo/gallery/placeholder/placeholder.html" target="_blank">Demo</a>
     * @class Brix.Gallery.Placeholder
     * @extends Brix.Brick
     */

    function Placeholder() {
        Placeholder.superclass.constructor.apply(this, arguments);
    }

    Placeholder.ATTRS = {
        /**
         * input
         * @cfg {String}
         */
         labelShowCls: {
            value: 's-placeholder'
         }
    };

    S.extend(Placeholder, Brick, {
        initialize: function() {
            var self = this,
                DOM = S.DOM;
                ipt = self.get('el'),
                iptDom = ipt.getDOMNode(),
                labelShowCls = self.get('labelShowCls');

            if (iptDom.tagName.toUpperCase() !== 'INPUT') return;
            if ('placeholder' in document.createElement('input')) return;

            var placeholder = ipt.attr('placeholder'),
                label = S.one(DOM.create('<label class="' + labelShowCls + '" for="' + iptDom.id + '">' + placeholder + '</label>'));
            label.insertBefore(ipt);

            if (ipt.value === '') {
                label.addClass(labelShowCls);
            }

            ipt.on('keyup', function() {
                if (this.value === '') {
                    label.addClass(labelShowCls);
                } else {
                    label.removeClass(labelShowCls);
                }
            });
        }
    });
    return Placeholder;
}, {
    requires: ["brix/core/brick"]
});

  