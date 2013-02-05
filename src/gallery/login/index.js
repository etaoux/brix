(function () {
    if (top !== self && !top.ETao.needRefresh) {
        try {
            top.ETao.loginSuccess && top.ETao.loginSuccess();
        } catch (e) {
        }

    }
})();
KISSY.add('brix/gallery/login/index', function (S, Cookie, Overlay, Brick) {
    var D = S.DOM, E = S.Event;

    function EtaoLogin() {
        var self = this;
        EtaoLogin.superclass.constructor.apply(self, arguments);
        //self.init()
    }

    EtaoLogin.ATTRS = {
        trigger:{
            value:'.J-EtaoLogin'
        },
        triggerType:{
            value:'click'
        },
        panel:{
            value:'body'
        },
        redirect_url:{
            value:window.location.href
        },
        loginType:{
            value:'taobao'
        },
        isRedirectToA:{
            value:false
        },
        isCheckLongOrTrueLogin:{
            value:true
        },
        needRefresh:{
            value:true
        },
        mask:{
            value:true
        }
    };

    EtaoLogin.EVENTS = {
    };
    EtaoLogin.METHODS = {
        checkTrueLogin:function () {
            var login = Cookie.get('login') == 'true',
                nick = Cookie.get('_nk_'),
                aNick = Cookie.get('a_nk');
            //return login && nick || login && aNick;
            return login && (nick || aNick);
        },
        checkLongOrTrueLogin:function () {
            var self = this;
            var trackNick = Cookie.get('tracknick');
            var ck1 = Cookie.get('ck1');
            return self.checkTrueLogin() || trackNick && ck1;
        },

        eHandler:function (th, e) {

        },
        show:function (cfg) {
            var self = this;
            var loginType = self.get('loginType');
            var redirect_url = self.get('redirect_url');
            var needRefresh = self.get('needRefresh');
            //config = S.merge(config, cfg);
            /*if (!cfg.full_redirect) {
             config.redirect_url = cfg.redirect_url || window.location.href;
             }*/

            if (self.login) {
                KISSY.ChangeIframeSrc(redirect_url, loginType);
                var top = D.viewportHeight() / 2 - 200 + D.scrollTop();
                var left = D.viewportWidth() / 2 - 171 + D.scrollLeft();
                D.css(".etaologin-overlay", {
                    "top":top < 0 ? 0 : top,
                    "left":left < 0 ? 0 : left
                });
                self.login.show();

                if (S.Stat)
                    S.Stat('click=' + D.attr("#J_LoginPopup", "login-stat") + pre);
            } else {
                var host = (window.location.href.indexOf('etao.net') === -1) ? 'login.etao.com' : 'i.daily.etao.net',
                //scriptUrl = '//' + host + '/loginpopup.html?full_redirect=' + needRefresh + '&logintype=' + loginType + '&redirect_url=' + encodeURIComponent(redirect_url);
                scriptUrl = 'http://zixi.etao.com/brix/demo/gallery/login/popup.php';

                S.getScript(scriptUrl, function () {
                    var login = new Overlay({
                        prefixCls:'etaologin-',
                        width:342,
                        height:500,
                        mask:self.get('mask'),
                        zIndex:10001
                    });
                    login.render();
                    //login.get("contentEl").html('111', true);
                    //console.log(window.LoginPopupHtml);
                    login.get("contentEl").html(window.LoginPopupHtml, true);
                    //loginFormPopup.center();
                    var top = D.viewportHeight() / 2 - 200 + D.scrollTop();
                    var left = D.viewportWidth() / 2 - 171 + D.scrollLeft();
                    D.css(".etaologin-overlay", {
                        "top":top < 0 ? 0 : top,
                        "left":left < 0 ? 0 : left
                    });
                    login.show();
                    //window.loginFormPopup = loginFormPopup;
                    self.login = login;
                    var id = S.guid();
                    self.id = id;
                    login.get('el')[0].id = id;
                    E.on('.J_CloseLoginBtn', 'click', function () {
                        login.hide();
                        D.css(".etaologin-overlay", {'top':'-9999px'});
                    });
                    if (S.Stat) {
                        S.Stat('click=' + D.attr("#J_LoginPopup", "login-stat") + pre);
                    }
                    E.delegate("#" + id, 'click', "a", function (e) {
                        e.preventDefault();
                        var target = e.currentTarget;
                        S.LoginChange(target);
                        if (S.Stat) {
                            if (target.id === 'J_TaobaoMember') {

                                S.Stat('click=' + D.attr("#J_TaobaoMember", "login-stat") + pre);
                            } else {
                                S.Stat('click=' + D.attr("#J_AlipayMember", "login-stat") + pre);
                            }
                        }

                    });

                },'utf-8');
            }
        }

    };
    S.extend(EtaoLogin, Brick, {
        initialize:function () {
            var self = this;
            var panel = self.get('panel');
            //E.on(self.get('trigger'), self.get('triggerType'), function (e) {
            E.delegate(panel ? panel : 'body', self.get('triggerType'), self.get('trigger'), function(e) {
                var redirect_url = self.get('redirect_url');
                var needRefresh = self.get('needRefresh');
                if (self.checkTrueLogin()) return;
                if (self.get('isCheckLongOrTrueLogin') && self.checkLongOrTrueLogin()) return;
                e.preventDefault();
                var redirect = (self.get('isRedirectToA')) ? e.currentTarget.href : redirect_url;
                self.show({redirect_url:redirect, needRefresh:needRefresh});
            });
        },
        destructor:function () {
            /*var self = this,
             trigger = S.one(self.get('trigger'));
             if (trigger) {
             var triggerType = self.get('triggerType');
             S.each(triggerType, function (v) {
             trigger.detach(v, self.toggle, self);
             });
             }
             if (self.calendar) {
             self.calendar.destroy();
             self.calendar = null;
             }
             if (self.overlay) {
             self.overlay.destroy();
             self.overlay = null;
             }*/
        }

    });
    S.augment(EtaoLogin, EtaoLogin.METHODS);
    //window.EtaoLogin = EtaoLogin;
    return EtaoLogin;

}, {
    requires:['cookie', 'overlay', 'brix/core/brick']
});
/*KISSY.LoginChange = function (active) {
    var parent = D.parent(active, '.login-type');
    D.removeClass(D.('.login-item', parent), 'current');
    D.addClass(active, 'current');
    if (active.id == 'J_TaobaoMember') {
        iframe.src = taobaoIframeSrc;
    } else {
        iframe.src = alipayIframeSrc;
    }
}; */
