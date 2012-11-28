KISSY.add('modules/output', function (S, Brick) {
    var _html = 'body{cursor: pointer}';

    function Output() {
        Output.superclass.constructor.apply(this, arguments);
    }
    Output.ATTACH = {
        '': {
            'click': function(e) {
                e.currentTarget.download = 'a.html';
                e.currentTarget.href = 'data:text/html;charset=utf-8,' + encodeURIComponent(_html);
            }
        }
    };

    S.extend(Output, Brick);
    return Output;
}, {
    requires: ['brix/core/brick']
});
