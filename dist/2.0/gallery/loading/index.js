KISSY.add('brix/gallery/loading/index', function(S, Brick) {
    /**
     * Loading
     * <br><a href="../demo/gallery/loading/loading.html" target="_blank">Demo</a>
     * @class Brix.Gallery.Loading
     * @extends Brix.Brick
     */
    function Loading() {
        Loading.superclass.constructor.apply(this, arguments);
    }
    
    Loading.ATTRS = {
        /**
         * 样式配置，默认0
         * @cfg {Number}
         */
        loadingStyle: {
            value: 0
        }
    };
    
    Loading.METHODS = {
        /**
         * 显示
         */
        show: function() {
            var self = this;
                el = self.get('el');

            el.css('display', 'block');
            self.fire(Loading.FIRES.show);
        },
        /**
         * 隐藏
         */
        hide: function() {
            var self = this,
                el = self.get('el');
            
            el.css('display', 'none');
            self.fire(Loading.FIRES.hide);
        }
    };

    Loading.FIRES= {
        /**
         * @event show
         * 显示
         */
        show:'show', //显示loading
        /**
         * @event hide
         * 隐藏
         */
        hide:'hide' //隐藏loading
    };

    S.extend(Loading, Brick, {
        initialize: function() {
            var self = this,
                el = self.get('el');

            var styles = [
                    'http://img01.taobaocdn.com/tps/i1/T1Z6DDXllbXXbb3zDj-60-24.gif',
                    'http://img04.taobaocdn.com/tps/i4/T1h7YDXdddXXcntf6c-30-12.gif',
                    'http://img03.taobaocdn.com/tps/i3/T1cN_yXgBnXXc.LCDe-40-18.gif',
                    'http://img02.taobaocdn.com/tps/i2/T19ZHDXf4fXXc.LCDe-40-18.gif'
                ];

            if (self.get('loadingStyle')) {
                el.css('background-image', styles[self.get('loadingStyle')]);
            }
            else {
                el.attr('src', styles[0]);
            }

            self.show();
        }
    });

    S.augment(Loading, Loading.METHODS);
    return Loading;
}, {
    requires: ["brix/core/brick"]
});