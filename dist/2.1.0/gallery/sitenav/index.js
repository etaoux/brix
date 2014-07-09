KISSY.add("brix/gallery/sitenav/index", function(S, Brick, IO) {
    
    var _insertScript = function (src){
        var headNode = document.getElementsByTagName('head')[0];
        var newScript = document.createElement('script');
        newScript.type = 'text/javascript';
        newScript.src = src;
        headNode.appendChild(newScript);
    }
    function SiteNav() {
        SiteNav.superclass.constructor.apply(this, arguments);
    }

    SiteNav.ATTRS = {
        /**
         * 页头模式，默认前台模式normal， simple:后台模式
         * @cfg {String}
         */
        mode: {
            value: ''
        },
        /**
         * hover颜色值，默认ff6600;
         * 用于设置a标记的hover色。
         * @cfg {String}
         */
        hovercolor: {
            value: ''
        }
    }
    S.extend(SiteNav, Brick, {
        /**
         * 重写render方法，jsonp方式获取数据
         */
        render: function() {
            var self = this;
            IO.jsonp('http://www.taobao.com/go/rgn/mm/mm_nav_back.php', {
                mode: self.get('mode'),
				hovercolor: self.get('hovercolor')
            }, function(res) {
				var tbcdn = "http://g.tbcdn.cn/";
                var version = "";
                var jsSrc = "";
                // 获取到的模版是被转义过的字符串的版模，所以在使用模板前
                // 需要替换下被转义的字符
                self.get('el').html(S.one('<textarea />').html(res).val());
                //异步插入相应的js，版本号从当前的dom上取
                version = self.get('el').one('.J_alimama_nav').attr("data-v");
                jsSrc = tbcdn + '/mm/alimama-brand/' + version + '/app/components/nav/mmnav-min.js';
                _insertScript(jsSrc);
            });
        }
    });
    return SiteNav;
}, {
    requires: ["brix/core/brick", "ajax"]
});