/*
 * @module placeholder新版 
 * @description focus后value为空时出现placeholder 
 *   表单提交时，input的值这里不考虑
 * @param {HTMLElement} input element
 * @param {String} labelShowCls:显示placeholder的class
*/
KISSY.add('brix/gallery/placeholder/index', function(S, Brick) {

    function Placeholder() {
        Placeholder.superclass.constructor.apply(this, arguments);
    }

    Placeholder.ATTRS = {
        /**
         * input
         * @cfg {Element}
         */
         ipt: {

         },

        /**
         * input
         * @cfg {String}
         */
         labelShowCls: {
            value: 'labelshow'
         }
    };

    S.extend(Placeholder, Brick, {
        initialize: function() {
            var self = this,
                Dom = S.DOM;
                ipt = self.get('ipt'),
                labelShowCls = self.get('labelShowCls');

            if (!ipt) return;
            //是否支持placeholder属性
            if ('placeholder' in document.createElement('input')) return;

            var placeholder = ipt.attr('placeholder'),
                label = S.one(DOM.create('<label for="' + ipt.id + '">' + placeholder + '</label>'));

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

  