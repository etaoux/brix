KISSY.add("brix/gallery/form/index", function(S, Brick) {
    var KeyCodes = {
        ENTER: 13,
        SPACE: 32
    };

    function Form() {
        Form.superclass.constructor.apply(this, arguments);
    }
    
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
            node.prepend('<span class="' + className + '"></span>');
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
            // 3. 更好地支持无障碍访问 input必须和label通过for关联add by miaojing
            //    ref: http://lucassmith.name/2008/04/label-checkbox-concerns.html
            // 这里统一隐藏掉input
            // 不可以隐藏input, 隐藏了读屏软件无法正常读取radio checkbox 该有的状态提示 add by miaojing
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
