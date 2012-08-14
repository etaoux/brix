KISSY.add('modules/save', function (S, E) {
    function save() {
        var data = {
            struct: [],
            grid: App.grid,
            resolution: {
                base: 960,
                others: [720, 1200, 1440, 1680]
            },
            appVer: App.appVer
        };

        S.all('.r-section').each(function(section) {
            var cols = [];
            section.all('.r-div').each(function(div) {
                var clsList = div.attr('class').split(/\s+/);

                for (var i=0; i<clsList.length; ) {
                    if (/^span[0-9_]+$/.test(clsList[i])) {
                        clsList[i] = clsList[i].slice(4);
                        ++i;
                    } else {
                        clsList.splice(i, 1);
                    }
                }

                // div name
                cols.push(div.one('.r-div-name').html());
                // div cls
                cols.push(clsList.join(' '));
            });
            data.struct.push(cols);
        });

        return data;
    }

    return function () {
        E.delegate(document, 'click', '#r-save', function(e) {
            e.currentTarget.href = '#' + JSON.stringify(save());
        });
    };
}, {
    requires: ['event']
});
