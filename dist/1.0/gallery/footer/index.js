KISSY.add("brix/gallery/footer/index", function(S, Brick, IO) {
    function Footer() {
        Footer.superclass.constructor.apply(this, arguments);
    }

    Footer.ATTRS = {
        /**
         * 页脚模式，默认前台模式: simple:后台模式
         * @cfg {String}
         */
        mode: {
            value: ''
        }
    }
    S.extend(Footer, Brick, {
        /**
         * 重写render方法，jsonp方式获取数据
         */
        render: function() {
            var self = this;
            IO.jsonp('http://www.taobao.com/go/rgn/mm/footer.php', {
                mode: self.get('mode')
            }, function(res) {
                self.get('el').html(S.one('<textarea />').html(res).val());
            });
        }
    });
    return Footer;
}, {
    requires: ["brix/core/brick", "ajax"]
});