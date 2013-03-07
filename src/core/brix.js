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
        host = S.Env.host,
        simulatedLocation;
    Brix = host[Brix] = host[Brix] || {};

    //从KISSY源代码提取并改动适合brix的
    simulatedLocation = new S.Uri(host.location.href);
    function returnJSON(s){
        if(s){
            return (new Function('return ' + s))();
        }
        else{
            return {};
        }
    }
    function getBaseInfo() {
        // get base from current script file path
        // notice: timestamp
        var baseReg = /^(.*)(brix)(?:-min)?\.js[^\/]*/i,
            baseTestReg = /(brix)(?:-min)?\.js/i,
            comboPrefix,
            comboSep,
            scripts = host.document.getElementsByTagName('script'),
            script = scripts[scripts.length - 1],
        // can not use KISSY.Uri
        // /??x.js,dom.js for tbcdn
            src = script.src,
            baseInfo = returnJSON(script.getAttribute('bx-config'));

        comboPrefix = baseInfo.comboPrefix = baseInfo.comboPrefix || '??';
        comboSep = baseInfo.comboSep = baseInfo.comboSep || ',';

        var parts ,
            base,
            index = src.indexOf(comboPrefix);

        // no combo
        if (index == -1) {
            base = src.replace(baseReg, '$1');
        } else {
            base = src.substring(0, index);
            // a.tbcdn.cn??y.js, ie does not insert / after host
            // a.tbcdn.cn/combo? comboPrefix=/combo?
            if (base.charAt(base.length - 1) != '/') {
                base += '/';
            }
            parts = src.substring(index + comboPrefix.length).split(comboSep);
            S.each(parts, function (part) {
                if (part.match(baseTestReg)) {
                    base += part.replace(baseReg, '$1');
                    return false;
                }
                return undefined;
            });
        }
        //转换成绝对路径
        base = simulatedLocation.resolve(base).toString();
        //获取brix包base对应的路径
        base = base.substring(0, base.lastIndexOf('brix'));

        return S.mix({
            autoConfig: true,
            base: base,
            componentsPath: './',
            importsPath: './',
            templateEngine:'./mu'
        }, baseInfo);
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
                debug: debug === '' ? false : true,
                combine:false,//默认不开启combine
                tag: tag == '@TAG@' ? '' : tag,
                //路径修正，brix路径下存在其他文件夹
                fixed: version == '@VERSION@' ? 'src/' : version + '/',
                gallery: {
                    //配置组件版本信息
                    //dropdown:'1.0'
                }
            }, defaultOptions, options);
            /**
             * brix 的基础路径
             * @type {String}
             */
            Brix.basePath = options.base;
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
                    base: options.base,
                    combine:options.combine,
                    debug:options.debug,
                    tag: options.tag,
                    charset: "utf-8"
                }, {
                    name: "components",
                    base: options.componentsPath,
                    combine:options.combine,
                    debug:options.debug,
                    tag: options.componentsTag || options.tag,
                    charset: "utf-8"
                }, {
                    name: "imports",
                    base: options.importsPath,
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
                        str += $4 + ($5 ? $5 : '');
                        return str;
                    }],
                    [/(.+brix\/)(core.+?)((?:-min)?\.js)(\?[^?]+)?$/, function($0, $1, $2, $3, $4) {
                        var str = $1 + options.fixed;
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
        },
        /**
         * 将bx-config节点转换成JSON格式
         * @param  {String} s JSON字符串
         * @return {Object}   JSON对象
         */
        returnJSON:function(s) {
            return returnJSON(s);
        },
        /**
         * 根据模块相对路径获取绝对路径
         * @param  {Object} module 模块的this
         * @param  {String} path   相对路径
         * @return {String}        绝对路径
         */
        absoluteFilePath:function(module,path){
            return new S.Uri(module.getFullPath()).resolve(path).toString(); 
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