KISSY.add('modules/output', function (S) {
    var html = 'body{cursor: pointer}';

    return function () {
        S.one('#r-output').on('click', function(e) {
            this.download = 'a.html';
            this.href = 'data:text/html;charset=utf-8,' + encodeURIComponent(html);
        });
    };
});
