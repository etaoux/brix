KISSY.add('modules/preview', function (S, Brick, Utils) {
    function _page() {
        var html = new Blob(['<!doctype html>\n',
                '<meta charset="utf-8">\n',
                '<title>page title</title>\n',
                '<link rel="stylesheet" href="http://xthsky.github.com/layout/style-min.css">\n',
                '<style>#r-content{margin: 0 auto}</style>\n',
                '<style>#r-add-section,.r-div:hover .r-div-panel,.r-section-panel{display: none}</style>\n',
                '<style>' + Utils.cssGen(true) + '</style>\n',
                document.getElementById('r-content').outerHTML + '\n' +
                ''
            ], {type: 'text/html'});

        return html;
    }

    function Preview() {
        Preview.superclass.constructor.apply(this, arguments);
    }
    Preview.ATTACH = {
        '': {
            'click': function(e) {
                e.currentTarget.href = webkitURL.createObjectURL(_page());
                //window.open('data:text/html;charset=utf-8,' + encodeURIComponent(html()));
            }
        }
    };

    S.extend(Preview, Brick);
    return Preview;
}, {
    requires: ['brix/core/brick', 'modules/utils']
});
