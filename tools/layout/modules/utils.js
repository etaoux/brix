KISSY.add('modules/utils', function(S, D) {
    var next = ['A', 0];
    function idGen() {
        var id = next.join('');

        var i = next[0];
        var j = next[1];
        if (j === 9) {
            i = String.fromCharCode(i.charCodeAt(0) + 1);
            j = 0;
        } else {
            ++j;
        }
        next = [i, j];

        return id;
    }

    var all = {};
    function cssGen(width) {
        if (all[width]) return;
        all[width] = true;

        var isBase = width === App.resolution.base;
        var total = Math.ceil((isBase ? 1920 : width) / (App.grid.c + App.grid.g));
        var css = '.w' + width + '{width: ' + width + 'px}' +
                '.row{margin-left: -' + App.grid.g + 'px}' +
                (isBase ? '' : '.w' + width + ' ') +
                '.span0' + (isBase ? '' : '_' + width) +
                '{display: none}';

        for (var i=0; i<total; ) {
            ++i;
            css += (isBase ? '' : '.w' + width + ' ') +
                '.span' + i + (isBase ? '' : '_' + width) +
                '{width: ' + ((App.grid.c + App.grid.g) * i - App.grid.g) + 'px;' +
                'margin-left: ' + App.grid.g + 'px}';
        }

        D.addStyleSheet(css);
    }
    //all[App.resolution.base] = true;

    function clsReplace(cls, reg, val) {
        cls = cls.split(/\s+/);

        for (var i=0; i<cls.length; ) {
            if (cls[i].match(reg)) {
                cls.splice(i, 1);
            } else {
                ++i;
            }
        }
        cls.push(val);

        return cls.join(' ');
    }

    return {
        idGen: idGen,
        cssGen: cssGen,
        clsReplace: clsReplace
    };
}, {
    requires: ['dom']
});
