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
            //},
            // 思路2：不处理click事件了，改监听input状态变化.
            //'click': function (e) {
                //var el = S.one(e.currentTarget);
                //var input = el.one('.input');
                //var _input = el.one('input');

                //if (input.hasClass('disabled')) return;

                //if (input.hasClass('checked')) {
                    //input.removeClass('checked');
                    //_input.prop('checked', false);
                //} else {
                    //input.addClass('checked');
                    //_input.prop('checked', true);
                //}

                //// label的click事件会触发input的click，再冒泡到label上来.
                //e.preventDefault();
            }
        }
    };

    function handleStat(node, checkSiblings) {
        var input = node.one('.input');
        var _input = node.one('input');
        var isChecked = _input.prop('checked');
        var isDisabled = _input.prop('disabled');

        // patch for radio
        if (checkSiblings !== false && node.hasClass('radio')) {
            node.siblings('.radio').each(function(n) {
                handleStat(n, false);
            });
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
            el.all('input').on('change', function(e) {
                handleStat(S.one(e.currentTarget.parentNode));
            });
        },
    });
    return Form;
}, {
    requires: ["brix/core/brick", "./form.css"]
});
