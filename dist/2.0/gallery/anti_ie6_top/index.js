;(function(doc, undefined) {

    var anti_ie6 = {

        //template
        template: [ '亲~您还在使用十几年前的浏览器IE6，享受更棒的购物体验建议您更新',
                    '<a class="anti-ie6-top-ie8" href="http://windows.microsoft.com/zh-CN/internet-explorer/downloads/ie" target="_blank">ie8浏览器</a>',
                    '<a class="anti-ie6-top-taobao" href="http://download.taobaocdn.com/client/browser/download.php?pid=0080_2022">淘宝浏览器</a>',
                    '<i class="anti-ie6-top-close" id="fieKeepIE6"></i>'].join(''),

        //css
        style: ".anti-ie6-top{zoom:1;position:relative;height:35px;text-align:center;padding-top:15px;background:#49e;color:white;font-size:14px}.anti-ie6-top a{color:white;text-decoration:none}.anti-ie6-top a:hover{text-decoration:underline}.anti-ie6-top-taobao,.anti-ie6-top-close,.anti-ie6-top-ie8{background:url(http://img02.taobaocdn.com/tps/i2/T13kMHXkBeXXcsc8fa-19-71.png) no-repeat}.anti-ie6-top-close{position:absolute;top:16px;right:12px;width:20px;height:20px;background-position:0 -50px;cursor:pointer}.anti-ie6-top-taobao{padding-left:22px;margin-left:25px;background-position:0 -25px}.anti-ie6-top-ie8{padding-left:22px;margin-left:30px;background-position:0 0}",

        init: function() {

            //非ie6退出
            if (!this.isIE6()) {
                return;
            }
            //cookie检测
            if (doc.cookie.indexOf('anti_ie6') > -1) {
                // return;
            }

            var tmpl = this.template;
            var styleString = this.style;
            var body = doc.body;
            var head = doc.getElementsByTagName('head')[0];

            //create style
            var style = doc.createElement('style');
            style.type = "text/css";
            style.media = "screen";

            if (style.styleSheet) { //for ie
                style.styleSheet.cssText = styleString;
            } else {
                style.appendChild(doc.createTextNode(styleString));
            }
            head.appendChild(style);

            //create wrapper
            this.div = doc.createElement('div');
            this.div.className = 'anti-ie6-top';
            this.div.innerHTML = tmpl;
            body.insertBefore(this.div, body.firstChild);

            //bind events
            this.bindEvents();
        },

        bindEvents: function () {
            // var fieClose = doc.getElementById('fieClose');
            var _this = this;
            var fieKeepIE6 = doc.getElementById('fieKeepIE6');

            // fieClose.onclick = function () {
            //     _this.div.parentNode.removeChild(_this.div);
            // };

            fieKeepIE6.onclick = function(e) {
                var d = new Date();
                d.setTime(d.getTime() + 7*60*60*24*1000); //十天后过期

                doc.cookie = 'anti_ie6=1; path=/; expires=' + d.toGMTString();
                _this.div.parentNode.removeChild(_this.div);
            };
        },


        isIE6: function() {
            return /msie 6/i.test(navigator.userAgent);
        }
    };

    //excute
    //增加window onload之后才执行
    if (window.attachEvent) {
        window.attachEvent('onload', function() {
            anti_ie6.init();
        });
    } else {
        window.addEventListener('load', function() {
            anti_ie6.init();
        }, false);
    }
})(document);
