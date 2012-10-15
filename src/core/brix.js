/**
 * Brix配置类 组件框架入口类，在调用Brix组件的时候可以配置cdn地址，组件版本号等
 * @class Brix.Brix
 */
(function(S, Brix) {
    var win = window,
        loc = win.location,
        startsWith = S.startsWith, 
        __pagePath = loc.href.replace(loc.hash, "").replace(/[^/]*$/i, "");
    Brix = win[Brix] = win[Brix] || {};

    //从KISSY源代码提取并改动适合brix的
    /**
     * 相对路径文件名转换为绝对路径
     * @param path
     * @ignore
     */

    function absoluteFilePath(path) {
        path = S.trim(path);

        // path 为空时，不能变成 "/"
        if (path && path.charAt(path.length - 1) != '/') {
            path += "/";
        }

        /**
         * 一定要正则化，防止出现 ../ 等相对路径
         * 考虑本地路径
         * @ignore
         */
        if (!path.match(/^(http(s)?)|(file):/i) && !startsWith(path, "/")) {
            path = __pagePath + path;
        }

        if (startsWith(path, "/")) {
            var loc = win.location;
            path = loc.protocol + "//" + loc.host + path;
        }
        var paths = path.split("/"),
            re = [],
            p;
        for (var i = 0; i < paths.length; i++) {
            p = paths[i];
            if (p == ".") {} else if (p == "..") {
                re.pop();
            } else {
                re.push(p);
            }
        }
        path = re.join("/");
        return path.substring(0, path.length - 1);
    };

    function getBaseInfo() {
        // get path from current script file path
        // notice: timestamp
        var pathReg = /^(.*)brix(-min)?\.js[^/]*/i,
            pathTestReg = /brix(-min)?\.js/i,
            scripts = win.document.getElementsByTagName('script'),
            script = scripts[scripts.length - 1],
            src = absoluteFilePath(script.src),
            pathInfo = script.getAttribute("bx-config");
        if (pathInfo) {
            pathInfo = (new Function("return " + pathInfo))();
        } else {
            pathInfo = {};
        }
        pathInfo.comboPrefix = pathInfo.comboPrefix || '??';
        pathInfo.comboSep = pathInfo.comboSep || ',';

        var comboPrefix = pathInfo.comboPrefix,
            comboSep = pathInfo.comboSep,
            parts = src.split(comboSep),
            path, part0 = parts[0],
            part01, index = part0.indexOf(comboPrefix);

        // no combo
        if (index == -1) {
            path = src.replace(pathReg, '$1');
        } else {
            path = part0.substring(0, index);
            part01 = part0.substring(index + 2, part0.length);
            // combo first
            // notice use match better than test
            if (part01.match(pathTestReg)) {
                path += part01.replace(pathReg, '$1');
            }
            // combo after first
            else {
                S.each(parts, function(part) {
                    if (part.match(pathTestReg)) {
                        path += part.replace(pathReg, '$1');
                        return false;
                    }
                });
            }
        }
        path = path.substring(0, path.lastIndexOf('brix'));
        return S.mix({
            path: path,
            componentsPath:'./',
            importsPath:'./'
        }, pathInfo);
    }
    var defaultOptions = getBaseInfo();
    var debug = '@DEBUG@'; //区分src还是dist版本
    var isConfig = false; //是否已经配置过
    S.mix(Brix, {
        /**
         * 配置路径
         * @param  {Object} options [配置对象]
         */
        config: function(options) {
            if (isConfig) {
                return;
            }
            isConfig = true;
            options = KISSY.merge({
                fixed: '',
                //路径修正，brix路劲下存在其他文件夹
                gallery: {
                    //配置组件版本信息
                    //dropdown:'1.0'
                }
            }, defaultOptions, options);
            KISSY.config({
                packages: [{
                    name: "brix",
                    path: options.path,
                    charset: "utf-8"
                },{
                    name: "components",
                    path: options.componentsPath,
                    charset: "utf-8"
                },{
                    name: "imports",
                    path: options.importsPath,
                    charset: "utf-8"
                }]
            });
            KISSY.config({
                map: [
                    [/(.+brix\/)(gallery\/)(.+?)(\/.+?(?:-min)?\.(?:js|css))(\?[^?]+)?$/, function($0, $1, $2, $3, $4, $5) {
                        var str = $1 + options.fixed + $2 + $3;
                        if (options.gallery[$3]) {
                            str += '/' + options.gallery[$3]
                        }
                        if (debug) {
                            $4 = $4.replace('-min', '');
                        }
                        str += $4 + ($5 ? $5 : '');
                        return str;
                    }],
                    [/(.+brix\/)(core.+?)((?:-min)?\.js)(\?[^?]+)?$/, function($0, $1, $2, $3, $4) {
                        var str = $1 + options.fixed;
                        if (debug) {
                            $3 = $3.replace('-min', '');
                        }
                        str += $2 + $3 + ($4 ? $4 : '');
                        return str;
                    }]
                ]
            });
        }
    });
    if (defaultOptions.autoConfig) {
        //自动配置
        Brix.config({});
        //自动实例化pagelet
        //外部调用的S.ready注册的方法中可以直接用Brix.pagelet实例书写业务逻辑
        if (defaultOptions.autoPagelet) {
            S.use('brix/core/pagelet',function(S,Pagelet){
                S.ready(function(){
                    Brix.pagelet = new Pagelet({tmpl:'body'});
                });
            })
        }
    }
})(KISSY, 'Brix');