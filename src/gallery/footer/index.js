KISSY.add("brix/gallery/footer/index", function(S, Brick, Ajax) {
    function Footer() {
        Footer.superclass.constructor.apply(this, arguments);
    }

    S.extend(Footer, Brick, {
        render: function () {
            var el = this.get('el');
            var url = 'http://www.taobao.com/go/rgn/mm/footer.php';

            new Ajax({
                url: url,
                dataType: 'jsonp',
                data: {
                    mode: this.userConfig.mode || ''
                },
                success: function(res) {
                  el.html(S.one('<textarea />').html(res).val())
                }
            })
        }
    });
    return Footer;
}, {
    requires: ["brix/core/brick", "ajax"]
});
