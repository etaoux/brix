;(function(doc, undefined) {

    var anti_ie6 = {

        //template
        template: ['<div class="fuck-ie6-info fuck-ie6-info{r}">',
                    '<div class="fuck-ie6-container" id="fieContainer">',
                        '<div class="fuck-ie6-why" id="fieWhy" ></div>',
                        '<div class="fuck-ie6-show" id="fieWhyBack"></div>',
                    '</div>',
                '</div>',
                '<div class="fuck-ie6-update">',
                    '<div class="fuck-ie6-suggest">建议您...</div>',
                    '<ul id="fieUpdates" style="padding-left: 120px;">',
                        '<li><a target="_blank" href="http://windows.microsoft.com/zh-CN/internet-explorer/downloads/ie"></a>',
                            '<i class="b-ie"></i>',
                            '<span>升级到IE新版本</span>',
                        '</li>',
                        '<li class="fie-or">或者</li>',
                        '<li><a href="http://download.taobaocdn.com/client/browser/download.php?pid=0080_2010"></a>',
                            '<i class="b-taobao"></i>',
                            '<span>下载淘宝浏览器</span>',
                        '</li>',
                        // '<li><a target="_blank" href="http://www.google.cn/intl/zh-CN/chrome/browser/"></a>',
                        //     '<i class="b-chrome"></i>',
                        //     '<span>下载chrome</span>',
                        // '</li>',
                        // '<li><a target="_blank"  href="http://dl.360safe.com/se/360se_taobao.exe"></a>',
                        //     '<i class="b-browser360"></i>',
                        //     '<span>下载360浏览器</span>',
                        // '</li>',
                    '</ul>',
                    '<div class="fuck-ie6-keep"><a href="javascript:;" id="fieKeepIE6" >不，我要继续用这个悲催的方式浏览</a></div>',
                '</div>',
                '<a href="javascript:;" class="fuck-ie6-close" id="fieClose" title="close"></a>'].join(''),

        //css
        style: ".fuck-ie6-why,.fuck-ie6-show,.fuck-ie6-update ul li.fie-or,.fuck-ie6-update ul li span,.fuck-ie6-update ul li i,.fuck-ie6-suggest,.fuck-ie6-keep a,.fuck-ie6-close,.fuck-ie6{background:url(http://img02.taobaocdn.com/tps/i2/T1RwDWXnNXXXbXZK.q-576-1660.png) no-repeat 0 0}.fuck-ie6{background-position:0 -1262px;position:absolute;width:576px;height:376px;top:0;left:0;overflow:hidden;z-index:999999}.fuck-ie6-update{position:absolute;width:540px;left:30px;bottom:20px;height:187px}.fuck-ie6-update ul{margin:0 0 15px;padding:0;list-style:none;zoom:1;overflow:hidden}.fuck-ie6-update ul li{float:left;width:110px;height:115px;position:relative;margin:0 6px;display:inline}.fuck-ie6-update ul li.fie-or{width:45px;height:30px;background-position:0 -1182px;text-indent:-9999px;margin:40px 0 0}.fuck-ie6-update ul li span{font-family:'Microsoft YaHei';position:absolute;width:110px;height:25px;background-position:0 -1090px;font-size:14px;text-align:center;padding-top:20px;font-weight:bold;left:0;bottom:0;color:#06c}.fuck-ie6-update ul li a{display:block;width:110px;height:115px;cursor:pointer;color:#06c;text-decoration:none;position:absolute;z-index:10;left:0;top:0;background-color:white;filter:alpha(opacity=0);opacity:0}.fuck-ie6-update ul li a span{text-decoration:none}.fuck-ie6-update ul li a:hover span{text-decoration:underline}.fuck-ie6-update ul li i{position:absolute;width:110px;height:80px;background-position:0 -1010px;left:0;bottom:0}.fuck-ie6-update ul li.fie-hover span{text-decoration:underline}.fuck-ie6-update ul li i.b-ie{background-position:-110px -1010px}.fuck-ie6-update ul li i.b-browser360{background-position:-220px -1010px}.fuck-ie6-update ul li i.b-chrome{background-position:-330px -1010px}.fuck-ie6-suggest{background-position:0 -1150px;width:82px;height:32px;text-indent:-9999px}.fuck-ie6-keep{height:25px}.fuck-ie6-keep a{display:block;text-indent:-9999px;height:25px;width:325px;zoom:1;background-position:0 -1212px}.fuck-ie6-keep a:hover{background-position:0 -1237px}.fuck-ie6-close{position:absolute;top:25px;right:25px;width:26px;height:24px;background-position:0 -21px;cursor:pointer}.fuck-ie6-close:hover{background-position:-26px -21px}.fuck-ie6-info{position:absolute;width:520px;height:150px;left:30px;top:20px;overflow:hidden}.fuck-ie6-container{width:1040px;position:relative}.fuck-ie6-why,.fuck-ie6-show{float:left;width:520px;height:150px;cursor:pointer}.fuck-ie6-why{background-position:0 -97px;cursor:pointer}.fuck-ie6-show{background-position:0 -247px}.fuck-ie6-info2 .fuck-ie6-why{background-position:0 -397px}.fuck-ie6-info2 .fuck-ie6-show{background-position:0 -547px}.fuck-ie6-info3 .fuck-ie6-why{background-position:0 -697px}.fuck-ie6-info3 .fuck-ie6-show{background-position:0 -847px}",

        init: function() {

            //非ie6退出
            if (!this.isIE6()) {
                return;
            }

            //cookie检测
            if (doc.cookie.indexOf('anti_ie6') > -1) {
                return;
            }

            var tmpl = this.template;
            var styleString = this.style;
            var ran = (Math.round(Math.random()*10)%3+1).toString();
            var body = doc.body;
            var head = doc.getElementsByTagName('head')[0];
            var docWidth = body.offsetWidth;


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
            this.wrapDiv = doc.createElement('div');
            this.wrapDiv.style.cssText = 'position:absolute;top:100px;';
            this.div.className = 'fuck-ie6';
            this.wrapDiv.style.left = (docWidth - 580)/2 + 'px';//居中
            tmpl = tmpl.replace('{r}', ran);
            this.div.innerHTML = tmpl;
            this.wrapDiv.appendChild(this.div);

            //add iframe
            var ifr = doc.createElement('iframe');
            var styleText = 'z-index: 0; position: absolute; border:0; width: 576px; height:376px;left:0;top:0;';
            ifr.style.cssText = styleText;
            this.wrapDiv.appendChild(ifr);

            //
            body.appendChild(this.wrapDiv);

            //bind events
            this.bindEvents();
        },

        bindEvents: function () {
            var fieWhy = doc.getElementById('fieWhy');
            var fieContainer = doc.getElementById('fieContainer');
            var fieClose = doc.getElementById('fieClose');
            var _this = this;
            var updates = doc.getElementById('fieUpdates');
            var fieKeepIE6 = doc.getElementById('fieKeepIE6');
            var lis = updates.getElementsByTagName('a');
            var fieWhyBack = doc.getElementById('fieWhyBack');


            fieWhy.onclick = function() {
                _this.whyNoIe6Anim(0, -520, 30);
            };

            fieWhyBack.onclick = function() {
                _this.whyNoIe6Anim(-520, 520, 30);
            };

            fieClose.onclick = function () {
                _this.wrapDiv.parentNode.removeChild(_this.wrapDiv);
            };

            //
            for (var i = 0, len = lis.length; i < len; i++) {

                lis[i].onmouseover = function(e) {
                    var prev = this.nextSibling;
                    prev.isOver = true;
                    prev.isOut = false;

                    this.parentNode.className = 'fie-hover';

                    if (!prev.animRunningRise && !prev.animRunningFall) {
                        _this.riseBrowser(prev, function() {
                            if (prev.isOut) {
                                _this.fallBrowser(prev);
                            }
                        });
                    }
                };

                lis[i].onmouseout = function(e) {
                    var prev = this.nextSibling;
                    prev.isOver = false;
                    prev.isOut = true;

                    this.parentNode.className = '';

                    if (!prev.animRunningRise && !prev.animRunningFall) {
                        _this.fallBrowser(prev);
                    }
                };

            }

            // updates.onmouseover = function(e) {
            //     var evt = e || event;
            //     var t = evt.target || evt.srcElement;
            //     var prev;

            //     if (t.tagName.toLowerCase() === 'li') {
            //         prev = t.firstChild;
            //         alert(prev.nodeType);
            //         prev.isOver = true;
            //         prev.isOut = false;

            //         if (!prev.animRunningRise && !prev.animRunningFall) {
            //             _this.riseBrowser(prev, function() {
            //                 if (prev.isOut) {
            //                     _this.fallBrowser(prev);
            //                 }
            //             });
            //         }
            //     }
            // };

            // updates.onmouseout = function(e) {

            //     var evt = e || event;
            //     var t = evt.target || evt.srcElement;
            //     var prev;

            //     if (t.tagName.toLowerCase() === 'a') {
            //         prev = t.previousSibling;
            //         prev.isOver = false;
            //         prev.isOut = true;

            //         if (!prev.animRunningRise && !prev.animRunningFall) {
            //             _this.fallBrowser(prev);
            //         }
            //     }
            // };

            fieKeepIE6.onclick = function(e) {
                var d = new Date();
                d.setTime(d.getTime() + 7*60*60*24*1000); //十天后过期

                doc.cookie = 'anti_ie6=1; path=/; expires=' + d.toGMTString();
                _this.wrapDiv.parentNode.removeChild(_this.wrapDiv);
            };

        },

        whyNoIe6Anim: function(b, c, d, callback, _t) {
            var t = _t || 0;
            // var b = 0, c = -520, d = 30;
            var fn = arguments.callee;
            var fieContainer = doc.getElementById('fieContainer');
            var _this = this;

            fieContainer.style.left = _this.easeOut(t, b, c, d) + 'px';
            if (t < d) {
                t++;
                setTimeout(function() {
                    fn.call(_this, b, c, d, callback, t);
                }, 10);
            } else {
                callback && callback();
            }
        },



        // animBrowser: function(el, _b, _c, _d, direction, callback, _t) {
        //     var t = _t || 0;
        //     var b = _b, c = _c, d = _d;
        //     var fn = arguments.callee;
        //     var _this = this;

        //     //动画中不执行
        //     if ( t === 0 && el['animRunning' + direction]) return;

        //     //设动画进行中标识
        //     (t === 0) && (el['animRunning' + direction] = true);

        //     el.style.bottom = _this.backOut(t, b, c, d) + 'px';
        //     if (t < d) {
        //         t++;
        //         setTimeout(function() {
        //             fn.call(_this, el, _b, _c, _d, direction, callback, t);
        //         }, 10);
        //     } else {
        //         callback && callback();
        //         el['animRunning' + direction] = false; //动画结束
        //     }
        // },

        riseBrowser: function(el, callback, _t) {
            var t = _t || 0;
            var b = 0, c = 35, d = 25;
            var fn = arguments.callee;
            var _this = this;

            //动画中不执行
            // if ( t === 0 && (el['animRunningRise'] || el['animRunningFall']) ) return;

            //设动画进行中标识
            (t === 0) && (el['animRunningRise'] = true);

            el.style.bottom = _this.backOut(t, b, c, d, 2) + 'px';
            if (t < d) {
                t++;
                setTimeout(function() {
                    fn.call(_this, el, callback, t);
                }, 10);
            } else {
                callback && callback();
                el['animRunningRise'] = false; //动画结束
            }


        },

        fallBrowser: function(el, callback, _t) {
            var t = _t || 0;
            var b = 35, c = -35, d = 20;
            var fn = arguments.callee;
            var _this = this;

            //动画中不执行
            // if ( t === 0 && (el['animRunningRise'] || el['animRunningFall']) ) return;

            //设动画进行中标识
            (t === 0) && (el['animRunningFall'] = true);

            el.style.bottom = _this.easeOut(t, b, c, d) + 'px';
            if (t < d) {
                t++;
                setTimeout(function() {
                    fn.call(_this, el, callback, t);
                }, 10);
            } else {
                callback && callback();
                el['animRunningFall'] = false; //动画结束
            }
        },

        easeOut: function(t,b,c,d){
            return -c *(t/=d)*(t-2) + b;
        },

        backOut: function(t,b,c,d,s){
            if (s == undefined) s = 1.70158;
            return c*((t=t/d-1)*t*((s+1)*t + s) + 1) + b;
        },

        // bounceOut: function(t,b,c,d){
        //     if ((t/=d) < (1/2.75)) {
        //         return c*(7.5625*t*t) + b;
        //     } else if (t < (2/2.75)) {
        //         return c*(7.5625*(t-=(1.5/2.75))*t + .75) + b;
        //     } else if (t < (2.5/2.75)) {
        //         return c*(7.5625*(t-=(2.25/2.75))*t + .9375) + b;
        //     } else {
        //         return c*(7.5625*(t-=(2.625/2.75))*t + .984375) + b;
        //     }
        // },

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
