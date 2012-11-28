KISSY.add('modules/preview', function (S, Utils) {
    function page() {
        var html = new Blob(['<!doctype html>\n',
                '<meta charset="utf-8">\n',
                '<title>page title</title>\n',
                '<link rel="stylesheet" href="http://xthsky.github.com/layout/style-min.css">\n',
                '<style>#r-content{margin: 0 auto}</style>\n',
                '<style>#r-add-section,.r-div:hover .r-div-panel,.r-section-panel{display: none}</style>\n',
                '<style>' + Utils.cssGen(true) + '</style>\n',
                S.one('#r-content').outerHTML() + '\n' +
                ''
            ], {type: 'text/html'});

        return html;
    }
    return function () {
        S.one('#r-preview').on('click', function(e) {
            this.href = webkitURL.createObjectURL(page());
            //window.open('data:text/html;charset=utf-8,' + encodeURIComponent(html()));
        });
    };
}, {
    requires: ['modules/utils']
});
