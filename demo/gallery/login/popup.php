<?php
header('Content-Type: text/javascript; charset=utf-8');

$MYETAO_ROOT = dirname(dirname(__FILE__));
#include($MYETAO_ROOT.'/conf/env.inc.php');
#include($MYETAO_ROOT . '/conf/config.inc.php');

$taobao_login_server = 'https://login.taobao.com';
if ($CONF_ENV == 'dev') {
    $taobao_login_server = 'https://login.daily.taobao.net';
} elseif ($CONF_ENV == 'staging') {
    $taobao_login_server = 'https://login.daily.taobao.net';
} else {
    ;
}

if ($CONFIG['LOGIN_UNS_SWITCH']) {
    if ($CONF_ENV == 'dev' || $CONF_ENV == 'staging') {
        $taobao_login_server = 'http://login.daily.taobao.net';
    } else {
        $taobao_login_server = 'http://login.taobao.com';
    }
}

$alipay_authcenter_server = 'https://auth.alipay.com';
if ($CONF_ENV == 'dev') {
    $alipay_authcenter_server = 'http://authcenter.alipay.net';
} elseif ($CONF_ENV == 'staging') {
    $alipay_authcenter_server = 'http://authcenter.alipay.net';
} else {
    ;
}

$d_url = 'http://login.etao.com';

$redirect_url = $_GET['redirect_url'] ? strip_tags($_GET['redirect_url']) : 'http://www.etao.com';
$full_redirect = $_GET['full_redirect'] == 'true' ? 'true' : 'false';
$l_l_t = isset($_COOKIE['l_l_t']) && !empty($_COOKIE['l_l_t']) ? $_COOKIE['l_l_t'] : '';

$taobao_login_current = '';
$alipay_login_current = '';
$iframe_src = 'alipayIframeSrc';
$login_stat = 'etao.etao_fc.tb_member';
if ($l_l_t == 'taobao') {
    $taobao_login_current = 'current';
    $alipay_login_current = '';
    $iframe_src = 'taobaoIframeSrc';
} else {
    $taobao_login_current = '';
    $alipay_login_current = 'current';
    $iframe_src = 'alipayIframeSrc';
    $login_stat = 'etao.etao_fc.zfb_member';
}
$alipayIframeSrc =  $alipay_authcenter_server .'/login/etao.htm?goto=';
if ($full_redirect != 'true') {
    $alipayIframeSrc = 'http://login.etao.com/alipaypopup.html?goto=';
}

echo <<<EOB
window.LoginPopupHtml = '<div class="login-popup" id="J_LoginPopup" login-stat="{$login_stat}">'+
        '<h2>立即登录</h2><span class="close-login-btn J_CloseLoginBtn" title="关闭">关闭</span>'+
        '<ul class="login-type" id="J_LoginType">'+ 
            '<li><a hidefocus="true" class="login-item login-taobao {$taobao_login_current}" id="J_TaobaoMember" login-stat="etao.etao_fc.tb_member" href="#J_TaobaoMember">淘宝会员</a></li>'+
            '<li><a hidefocus="true" class="login-item login-alipay {$alipay_login_current}" id="J_AlipayMember" login-stat="etao.etao_fc.zfb_member" href="#J_AlipayMember">支付宝会员</a></li>'+
        '</ul>'+
        '<script>'+ 
        '(function() {'+
            "var redirect_url = '{$redirect_url}';"+
            "var taobaoIframeSrc = '{$taobao_login_server}/member/login.jhtml?style=miniall&css_style=etao&full_redirect={$full_redirect}&default_long_login=1&from=etao&tpl_redirect_url=' + encodeURIComponent('{$d_url}/loginmid.html?redirect_url=' + encodeURIComponent(redirect_url));"+
            "var target = '{$taobao_login_server}/member/alipay_sign_dispatcher.jhtml?tg=' + encodeURIComponent('{$d_url}/loginmid.html?login_type=alipay&redirect_url=' + encodeURIComponent(redirect_url));"+
            "var alipayIframeSrc = '{$alipayIframeSrc}' + encodeURIComponent('{$alipay_authcenter_server}/login/taobao_trust_login.htm?target=' + encodeURIComponent(target));"+
            
            "var iframe = document.createElement('iframe');"+
                "iframe.setAttribute('scrolling', 'no');"+
                "iframe.setAttribute('frameBorder', '0');"+
                "iframe.setAttribute('allowTransparency', 'true');"+
                "iframe.setAttribute('border', '0');"+
                "iframe.style.overflow = 'hidden';"+
                "iframe.width = '342';"+
                "iframe.height = '500';"+
		"iframe.src = {$iframe_src};"+

           "var loginpopup = document.getElementById('J_LoginPopup');"+ 
               "loginpopup.appendChild(iframe);"+

           "var S = KISSY, D = KISSY.DOM, E = S.Event, loginTypes = S.query('#J_LoginType a');"+
               "if (!loginTypes.length) return;"+

            "KISSY.ChangeIframeSrc = function (redirect_url, type) {"+
                "redirect_url = redirect_url;"+
                "var taobaoNode = S.one('#J_TaobaoMember'),"+
                    "alipayNode = S.one('#J_AlipayMember');"+

                "if (type == 'taobao') {"+
                    "iframe.src = taobaoIframeSrc;"+
                    "if (!taobaoNode.hasClass('current')) {"+
                        "taobaoNode.addClass('current');"+
                    "}"+ 
                    "if (alipayNode.hasClass('current')) {"+
                        "alipayNode.removeClass('current');"+
                    "}"+
                "} else {"+
                   "iframe.src = alipayIframeSrc;"+
                    "if (taobaoNode.hasClass('current')) {"+
                        "taobaoNode.removeClass('current');"+
                    "}"+ 
                    "if (!alipayNode.hasClass('current')) {"+
                        "alipayNode.addClass('current');"+
                    "}"+
                "}"+    
            "};"+

            "KISSY.LoginChange = function (active) {"+
                "var parent = D.parent(active, '.login-type');"+
                "D.removeClass(D.query('.login-item', parent), 'current');"+
                "D.addClass(active, 'current');"+
                "if (active.id == 'J_TaobaoMember') {"+
                    "iframe.src = taobaoIframeSrc;"+
                "} else {"+
                    "iframe.src = alipayIframeSrc;"+
                "} "+
            "};"+
        "})();"+
        '</script>'+ 
'</div>';
EOB;
?>