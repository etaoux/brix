KISSY.add('modules/utils', function(S) {
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

    function _css(width, maxWidth) {
        var css = prefix = suffix = '';

        var isBase = width === App.resolution.base;
        if (isBase) {
            css = '.row{margin-left: -' + App.grid.g + 'px}';
        } else {
            suffix = '_' + width;
        }

        var mediaQuery = undefined !== maxWidth;
        if (mediaQuery) {
            css += '@media (';

            switch (maxWidth) {
            case -1: 
                css += 'max-width: ' + width;
                break;
            case 0:
                css += 'min-width: ' + width;
                break;
            default:
                css += 'min-width: ' + width + 'px) and (max-width: ' + maxWidth;
            }

            css += 'px) {';
        } else {
            css += '.w' + width + '{width: ' + width + 'px}';
            if (!isBase) {
                prefix = '.w' + width + ' ';
            }
        }

        css += prefix + '.span0' + suffix + '{display: none}';

        var total = Math.ceil((isBase ? 1920 : width) / (App.grid.c + App.grid.g));
        for (var i=0; i++<total; ) {
            css += prefix + '.span' + i + suffix +
                '{width: ' + ((App.grid.c + App.grid.g) * i - App.grid.g) + 'px;' +
                'margin-left: ' + App.grid.g + 'px}';
        }

        if (mediaQuery) {
            css += '}';
        }

        return css;
    }
    function cssGen(mediaQuery) {
        var base = App.resolution.base;
        var res = App.resolution.others;

        var css = _css(base);

        if (!mediaQuery) {
            for (var i=0; i<res.length; i++) {
                css += _css(res[i]);
            }
            return css;
        }

        var maxWidth;
        for (var i=0; i<res.length; i++) {
            if (res[i] < base) {
                maxWidth = res[i+1] < base ? res[i+1] : base;
            } else {
                maxWidth = res[i+1] || 0;
            }
            css += _css(res[i], maxWidth);
        }
        return css;
    }

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
});
