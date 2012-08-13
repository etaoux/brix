KISSY.add('libs/data', function (S) {
    var Data = {
        save: function () {
            var data = {
                struct: [],
                grid: {
                    // 列宽
                    c: 10,
                    // 槽宽
                    g: 10
                },
                resolution: {
                    base: 960,
                    other: [720, 1200, 1440, 1680]
                },
                appVer: '0.0.1'
            };

            S.all('.r-section').each(function(section) {
                var divs = [];
                section.all('.r-div').each(function(div) {
                    divs.push(div.attr('class'));
                });
                data.struct.push(divs);
            });

            return data;
        },
        load: function () {
            S.mix(App, JSON.parse(location.hash.slice(1)));
        }
    };

    S.one(document).delegate('click', '#r-save', function(e) {
        e.currentTarget.href = '#' + JSON.stringify(Data.save());
    });

    return Data;
});
