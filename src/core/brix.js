/**
 * Brix配置类 组件框架入口类，在调用Brix组件的时候可以配置cdn地址，组件版本号等
 * <br><a href="../demo/core/brix.html" target="_blank">Demo</a>
 * <br>
 * 引用：
 *
 *     <script type="text/javascript" src="brix.js" bx-config="{autoConfig:true,autoPagelet:true}"></script>
 *
 * bx-config节点说明：<br>
 *     autoConfig：自动配置包和map
 *     autoPagelet：自动渲染body节点下的所有bx-name组件
 *     componentsPath：项目组件包路径
 *     componentsTag：项目组件时间戳
 *     importsPath：项目公用组件包路径
 *     importsTag：项目公用组件时间戳
 *     templateEngine: 模板引擎的包路径，brix内置mustache引擎，并做了扩展，详细看mu.js
 *     gallery：组件版本配置
 *     tag：核心组件的时间戳
 *     debug:是否启用非压缩版本
 *     combine:是否启用combo功能
 *
 * bx-config高级配置：<br>
 *     fixed：对包路径的重写，多用在内部的版本管理（不清楚的不要配）
 * @class Brix
 */
(function(S, Brix) {
    var isReady = false,
        readyList = [],
        win = window,
        loc = win.location,
        startsWith = S.startsWith,
        __pagePath = loc.href.replace(loc.hash, "").replace(/[^\/]*$/i, "");
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
        if(path && path.charAt(path.length - 1) != '/') {
            path += "/";
        }

        /**
         * 一定要正则化，防止出现 ../ 等相对路径
         * 考虑本地路径
         * @ignore
         */
        if(!path.match(/^(http(s)?)|(file):/i) && !startsWith(path, "/")) {
            path = __pagePath + path;
        }

        if(startsWith(path, "/")) {
            var loc = win.location;
            path = loc.protocol + "//" + loc.host + path;
        }
        var paths = path.split("/"),
            re = [],
            p;
        for(var i = 0; i < paths.length; i++) {
            p = paths[i];
            if(p == ".") {} else if(p == "..") {
                re.pop();
            } else {
                re.push(p);
            }
        }
        path = re.join("/");
        return path.substring(0, path.length - 1);
    }

    function getBaseInfo() {
        // get path from current script file path
        // notice: timestamp
        var pathReg = /^(.*)brix(-min)?\.js[^\/]*/i,
            pathTestReg = /brix(-min)?\.js/i,
            scripts = win.document.getElementsByTagName('script'),
            script = scripts[scripts.length - 1],
            src = absoluteFilePath(script.src),
            pathInfo = script.getAttribute("bx-config");
        if(pathInfo) {
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
        if(index == -1) {
            path = src.replace(pathReg, '$1');
        } else {
            path = part0.substring(0, index);
            part01 = part0.substring(index + 2, part0.length);
            // combo first
            // notice use match better than test
            if(part01.match(pathTestReg)) {
                path += part01.replace(pathReg, '$1');
            }
            // combo after first
            else {
                S.each(parts, function(part) {
                    if(part.match(pathTestReg)) {
                        path += part.replace(pathReg, '$1');
                        return false;
                    }
                });
            }
        }
        path = path.substring(0, path.lastIndexOf('brix'));
        return S.mix({
            autoConfig: true,
            path: path,
            componentsPath: './',
            importsPath: './',
            templateEngine:'./mu'
        }, pathInfo);
    }
    var defaultOptions = getBaseInfo();
    var debug = '@DEBUG@'; //区分src还是dist版本
    var tag = '@TAG@'; //KISSY包时间戳
    var version = '@VERSION@'; //版本号
    var isConfig = false; //是否已经配置过
    S.mix(Brix, {
        /**
         * 初始化配置
         * @param  {Object} options 配置对象，详见bx-config配置节点
         */
        config: function(options) {
            if(isConfig) {
                return;
            }
            isConfig = true;
            options = S.merge({
                debug: debug == '@DEBUG@' ? true : false,
                combine:true,//默认开始combine
                tag: tag == '@TAG@' ? '' : tag,
                //路径修正，brix路径下存在其他文件夹
                fixed: version == '@VERSION@' ? '' : version + '/',
                gallery: {
                    //配置组件版本信息
                    //dropdown:'1.0'
                }
            }, defaultOptions, options);
            if(options.fixed == '@VERSION@') {
                options.fixed = '';
            }
            /**
             * brix 的基础路径
             * @type {String}
             */
            Brix.basePath = options.path;
            /**
             * 对包路径的重写
             * @type {String}
             */
            Brix.fixed = options.fixed;
            /**
             * 模板引擎的包路径，内部使用
             * @type {String}
             */
            Brix.templateEngine = options.templateEngine;
            S.config({
                packages: [{
                    name: "brix",
                    path: options.path,
                    combine:options.combine,
                    tag: options.tag,
                    charset: "utf-8"
                }, {
                    name: "components",
                    path: options.componentsPath,
                    combine:options.combine,
                    debug:options.debug,
                    tag: options.componentsTag || options.tag,
                    charset: "utf-8"
                }, {
                    name: "imports",
                    path: options.importsPath,
                    combine:options.combine,
                    debug:options.debug,
                    tag: options.importsTag || options.tag,
                    charset: "utf-8"
                }]
            });
            S.config({
                map: [
                    [/(.+brix\/)(gallery\/)(.+?)(\/.+?(?:-min)?\.(?:js|css))(\?[^?]+)?$/, function($0, $1, $2, $3, $4, $5) {
                        var str = $1 + options.fixed + $2 + $3;
                        if(options.gallery[$3]) {
                            str += '/' + options.gallery[$3];
                        }
                        if(options.debug) {
                            $4 = $4.replace('-min', '');
                        }
                        str += $4 + ($5 ? $5 : '');
                        return str;
                    }],
                    [/(.+brix\/)(core.+?)((?:-min)?\.js)(\?[^?]+)?$/, function($0, $1, $2, $3, $4) {
                        var str = $1 + options.fixed;
                        if(options.debug) {
                            $3 = $3.replace('-min', '');
                        }
                        str += $2 + $3 + ($4 ? $4 : '');
                        return str;
                    }]
                ]
            });
        },
        /**
         * 渲染完成后需要执行的函数
         * @param {Function} fn 执行的函数
         */
        ready: function(fn) {
            if(isReady) {
                fn.call(Brix);
            } else {
                readyList.push(fn);
            }
        },
        /**
         * 触发ready添加的方法
         * @private
         */
        _bx_fireReady: function() {
            if(isReady) {
                return;
            }
            isReady = true;
            if(readyList) {
                var fn, i = 0;
                while(fn = readyList[i++]) {
                    fn.call(Brix);
                }
                readyList = null;
            }
        }
    });
    if(defaultOptions.autoConfig) {
        //自动配置
        Brix.config({});
        //自动实例化pagelet
        //外部调用的S.ready注册的方法中可以直接用Brix.pagelet实例书写业务逻辑
        if(defaultOptions.autoPagelet) {
            //延时执行，在打包后的能保证后面的模块已经载入
            S.later(function(){
                S.use('brix/core/pagelet', function(S, Pagelet) {
                    S.ready(function() {
                        /**
                         * 配置autoPagelet时候，会在Brix的全局对象上挂载Pagelet的实例对象，模板为body
                         * @type {Brix.Pagelet}
                         */
                        Brix.pagelet = new Pagelet({
                            tmpl: 'body'
                        });
                        Brix._bx_fireReady();
                    });
                });
            },1);
            return;
        }
    }
    S.ready(function() {
        Brix._bx_fireReady();
    });
}(KISSY, 'Brix'));