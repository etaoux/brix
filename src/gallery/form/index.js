KISSY.add("brix/gallery/form/index", function(S, Brick) {
    var KeyCodes = {
        ENTER: 13,
        SPACE: 32
    };

    function Form() {
        Form.superclass.constructor.apply(this, arguments);
    }
    Form.ATTACH = {
        '.checkbox, .radio': {
            'keyup': function (e) {
                if (e.keyCode === KeyCodes.ENTER ||
                    e.keyCode === KeyCodes.SPACE) {
                    S.one(e.target).fire('click');

                    // 空格键会触发页面滚动.
                    e.preventDefault();
                }
            }
        }
    };

    function handleStat(node, checkSiblings) {
        var input = node.one('.input');
        var _input = node.one('input');
        var isChecked = _input.prop('checked');
        var isDisabled = _input.prop('disabled');

        // patch for radio
        if (checkSiblings && node.hasClass('radio')) {
            node.siblings('.radio').each(handleStat);
        }

        var className = 'input' +
                (isChecked ? ' checked' : '') +
                (isDisabled ? ' disabled' : '') +
                (isChecked && isDisabled ? ' checked-disabled' : '');

        if (input) {
            input.attr('class', className);
        } else {
            node.prepend('<span class="' + className + '" tabindex="0"></span>');
        }
    }

    S.extend(Form, Brick, {
        initialize: function () {
            var el = this.get('el');

            el.addClass('bx-controls');
            el.all('.checkbox, .radio').each(handleStat);
            // 思路：不直接处理click事件，监听input状态变化来相应span的状态.
            el.all('input').on('change', function (e) {
                handleStat(S.one(e.currentTarget.parentNode), true);
            });
            // 1. 坑爹的IE6/7/8只能在input被渲染时click可以从label传递到input
            // 2. 坑爹的IE6/7只能在label有对应for属性时click才能传递到input，嵌套都不行
            //    ref: http://lucassmith.name/2008/04/label-checkbox-concerns.html
            // 这里统一隐藏掉input
            if (S.UA.ie < 9) {
                el.all('.checkbox, .radio').on('click', function (e) {
                    // 避免循环触发.
                    if (e.target.nodeName === 'INPUT') { return; }

                    S.one(e.currentTarget).one('input')[0].click();
                });
            }
        }
    });
    return Form;
}, {
    requires: ["brix/core/brick", "./form.css"]
});
