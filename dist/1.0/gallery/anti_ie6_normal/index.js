;(function(doc, undefined) {

    var anti_ie6 = {

        //template
        template: ['<div class="fuck-ie6-info fuck-ie6-info{r}">',
                    '<div class="fuck-ie6-container" id="fieContainer">',
                        '<div class="fuck-ie6-why" id="fieWhy" ><span class="sp1">您使用的浏览器版本过低，请更新高版本浏览器！</span> <a href="javascript:;" class="sp2">查看原因&#62;&#62;</a></div>',
                        '<div class="fuck-ie6-show" id="fieWhyBack">',
                            '<span class="sp1">您使用的IE6版本浏览器，不仅存在较多的安全漏洞，也无法完美支持最新的web技术和标准，出于安全和体验的考虑，建议您使用以下高版本浏览器。</span>',
                            '<a href="javascript:;" class="sp2">&#60;&#60;返回</a>',
                        '</div>',
                    '</div>',
                '</div>',
                '<div class="fuck-ie6-update">',
                    '<ul id="fieUpdates" style="padding-left:120px;">',
                        '<li style="margin-right: 35px;"><a target="_blank" href="http://windows.microsoft.com/zh-CN/internet-explorer/downloads/ie"><i class="b-ie"></i>升级IE</a>',
                        '</li>',
                        '<li><a href="http://download.taobaocdn.com/client/browser/download.php?pid=0080_2010"><i class="b-taobao"></i>下载淘宝浏览器</a>',
                        '</li>',
                        // '<li><a target="_blank" href="http://www.google.cn/intl/zh-CN/chrome/browser/"><i class="b-chrome"></i>下载chrome</a>',
                        // '</li>',
                        // '<li><a target="_blank"  href="http://dl.360safe.com/se/360se_taobao.exe"><i class="b-browser360"></i>下载360浏览器</a>',
                        // '</li>',
                    '</ul>',
                    '<div class="fuck-ie6-keep"><a href="javascript:;" id="fieKeepIE6" >不再提示</a></div>',
                '</div>',
                '<a href="javascript:;" class="fuck-ie6-close" id="fieClose" title="close"></a>'].join(''),

        //css
        style: ".fuck-ie6-close,.fuck-ie6-update li a i{background:url(http://img04.taobaocdn.com/tps/i4/T1yTvUXbFlXXc8DhIo-320-101.png) no-repeat 0 0}.fuck-ie6{background-position:0 -1262px;position:absolute;border:1px solid #d9d9d9;background-color:#fafafa;width:576px;height:376px;top:100px;left:25%;overflow:hidden;font-size:14px;z-index:999999}.fuck-ie6-close{position:absolute;top:25px;right:25px;width:21px;height:21px;background-position:0 0;cursor:pointer}.fuck-ie6-close:hover{background-position:-21px 0}.fuck-ie6-info{position:absolute;width:520px;height:150px;left:30px;top:20px;overflow:hidden}.fuck-ie6-container{width:1040px;position:relative}.fuck-ie6-container a{text-decoration:none}.fuck-ie6-container a:hover{text-decoration:underline}.fuck-ie6-why,.fuck-ie6-show{float:left;width:520px;height:150px;cursor:pointer;position:relative}.fuck-ie6-why .sp1{font-size:26px;display:block;padding-top:50px}.fuck-ie6-why .sp2{position:absolute;right:0;top:100px;font-weight:bold;color:#06c}.fuck-ie6-show .sp1{font-size:18px;display:block;padding-top:30px;line-height:1.7;padding-bottom:10px}.fuck-ie6-show .sp2{display:block;color:#06c;font-weight:bold}.fuck-ie6-update{position:absolute;top:200px;left:30px}.fuck-ie6-update ul{padding:0;list-style:none;overflow:hidden;zoom:1;margin:0}.fuck-ie6-update li{float:left;padding:0;list-style:none}.fuck-ie6-update li a{display:block;text-align:center;width:120px;height:110px;color:#06c;font-weight:bold;text-decoration:none;font-size:13px}.fuck-ie6-update li a:hover{text-decoration:underline}.fuck-ie6-update li a i{display:block;width:80px;height:80px;margin:0 auto;background-position:0 -21px}.fuck-ie6-update li a i.b-taobao{background-position:-160px -21px}.fuck-ie6-update li a i.b-chrome{background-position:-80px -21px}.fuck-ie6-update li a i.b-browser360{background-position:-240px -21px}.fuck-ie6-keep{padding-top:15px}.fuck-ie6-keep a{color:black;font-weight:bold}.fuck-ie6-keep a:hover{color:#06c}",

        init: function() {

            //非ie6退出
            if (!this.isIE6()) {
                return;
            }

            //cookie检测
            if (document.cookie.indexOf('anti_ie6') > -1) {
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
            this.div.className = 'fuck-ie6';
            this.div.style.left = (docWidth - 580)/2 + 'px';//居中
            tmpl = tmpl.replace('{r}', ran);
            this.div.innerHTML = tmpl;
            body.appendChild(this.div);

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
                _this.div.parentNode.removeChild(_this.div);
            };

            //
            // for (var i = 0, len = lis.length; i < len; i++) {

            //     lis[i].onmouseover = function(e) {
            //         var prev = this.nextSibling;
            //         prev.isOver = true;
            //         prev.isOut = false;

            //         this.parentNode.className = 'fie-hover';

            //         if (!prev.animRunningRise && !prev.animRunningFall) {
            //             _this.riseBrowser(prev, function() {
            //                 if (prev.isOut) {
            //                     _this.fallBrowser(prev);
            //                 }
            //             });
            //         }
            //     };

            //     lis[i].onmouseout = function(e) {
            //         var prev = this.nextSibling;
            //         prev.isOver = false;
            //         prev.isOut = true;

            //         this.parentNode.className = '';

            //         if (!prev.animRunningRise && !prev.animRunningFall) {
            //             _this.fallBrowser(prev);
            //         }
            //     };

            // }

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

                document.cookie = 'anti_ie6=1; path=/; expires=' + d.toGMTString();
                _this.div.parentNode.removeChild(_this.div);
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
    }

})(document);
