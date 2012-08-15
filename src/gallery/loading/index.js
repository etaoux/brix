KISSY.add('brix/gallery/loading/index', function(S, Brick) {
    function Loading() {
        Loading.superclass.constructor.apply(this, arguments);
    }
    
    Loading.ATTRS = {
        loadingStyle: {
            value: 0
        }
    };

    Loading.METHOD = {};

    Loading.ATTACH = {};

    S.extend(Loading, Brick, {
        initialize: function() {
            var self = this;
                el = self.get('el'),
                img = S.one(el.children('img')[0]);

            var styles = [
                    'http://img01.taobaocdn.com/tps/i1/T1Z6DDXllbXXbb3zDj-60-24.gif',
                    'http://img04.taobaocdn.com/tps/i4/T1h7YDXdddXXcntf6c-30-12.gif',
                    'http://img03.taobaocdn.com/tps/i3/T1cN_yXgBnXXc.LCDe-40-18.gif',
                    'http://img02.taobaocdn.com/tps/i2/T19ZHDXf4fXXc.LCDe-40-18.gif'
                ];

            if (self.get('loadingStyle')) {
                img.attr('src', styles[self.get('loadingStyle')]);
            }
            else {
                img.attr('src', styles[0]);
            }
        },
        show: function() {
            var self = this;
                el = self.get('el');

            el.css('display', 'block');
            self.fire('show');
        },
        hide: function() {
            var self = this,
                el = self.get('el');
            
            el.css('display', 'none');
            self.fire('hide');
        }
    });

    S.augment(Loading, Loading.METHOD);
    return Loading;
}, {
    requires: ["brix/core/brick"]
});