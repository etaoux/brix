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

    function _css(width, minWidth, maxWidth) {
        var css = prefix = suffix = '';

        var isBase = width === App.resolution.base;
        if (isBase) {
            css = '.row{margin-left: -' + App.grid.g + 'px}';
        } else {
            suffix = '_' + width;
        }

        var mediaQuery = true;
        if (minWidth && maxWidth) {
            css += '@media (min-width: ' + minWidth + 'px) and (max-width: ' + maxWidth + 'px) {';
        } else if (minWidth && !maxWidth) {
            css += '@media (min-width: ' + minWidth + 'px) {';
        } else if (!minWidth && maxWidth) {
            css += '@media (max-width: ' + maxWidth + 'px) {';
        } else {
            mediaQuery = false;
            if (!isBase) {
                prefix = '.w' + width + ' ';
            }
            css += '.w' + width + '{width: ' + width + 'px}';
        }

        if (mediaQuery) {
            css += '#r-content' + '{width: ' + width + 'px}';
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
        var all = App.resolution.all;
        var base = App.resolution.base;

        var css = _css(base);

        if (!mediaQuery) {
            for (var i=0; i<all.length; ) {
                if (all[i] !== base) {
                    css += _css(all[i]);
                }
                i += 2;
            }
            return css;
        }

        for (var i=0; i<all.length; ) {
            if (all[i] !== base) {
                css += _css(all[i], all[i-1], all[i+1]);
            }
            i += 2;
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
