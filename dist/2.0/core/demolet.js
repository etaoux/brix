KISSY.add("brix/core/demolet", function(S, Pagelet, IO, Node) {
    var $ = Node.all;

    //存储已经加载的CSS
    var hasLoadCSS = {};
    /**
     * 同步载入样式，保证串行加载
     * @param  {String} path css路径
     * @ignore
     */

    function loadCSS(path) {
        if(hasLoadCSS[path]) {
            return false;
        }
        hasLoadCSS[path] = true;
        IO({
            url: path,
            dataType: 'text',
            async: false,
            complete: function(d, textStatus, xhrObj) {
                if(textStatus == 'success') {
                    $('<style>' + d + '</style>').appendTo('head');
                }
            }
        });
    }

    /**
     * 同步获取默认模板和数据，多在demo页构建中使用
     * @param  {String} tmpl 模板文件
     * @param  {Object} data 数据对象
     * @param  {String} s    分割符号，默认‘@’
     * @return {Object}      模板和数据的对象{tmpl:tmpl,data:data}
     * @ignore
     */

    function getTmplData(tmpl, data, s) {
        s = s || '@';
        data = data || {};
        var reg = new RegExp('\\{\\{' + s + '(.+)?\\}\\}', "ig");
        tmpl = tmpl.replace(reg, function($1, $2) {
            S.log($2);
            var str = '';
            var p = $2.replace(/\//ig, '_').replace(/\./ig, '_');
            data[p] = data[p] || {};
            IO({
                url: $2 + 'template.html',
                dataType: 'html',
                async: false,
                success: function(d, textStatus, xhrObj) {
                    str = '{{#' + p + '}}' + d + '{{/' + p + '}}';
                }
            });
            IO({
                url: $2 + 'data.json',
                async: false,
                dataType: 'json',
                success: function(d, textStatus, xhrObj) {
                    for(var k in d) {
                        data[p][k] = d[k];
                    }
                }
            });
            return str;
        });
        return {
            tmpl: tmpl,
            data: data
        };
    }

    /**
     * Brix Demolet 用来构建约定的template.html和data.json的占坑demo页面
     * @extends Brix.Pagelet
     * @class Brix.Demolet
     */
    var Demolet = Pagelet.extend({
        initializer: function() {
            var self = this;
            //在组件渲染前，加载所有的css
            self.on('beforeAddBehavior', function(ev) {
                S.each(self.get('projectCss'), function(path) {
                    loadCSS(path);
                });
                var useList = ev.useList;
                S.each(useList, function(path) {
                    if(S.startsWith(path,'brix/')) {
                        S.use(path + 'index.css');//核心组件采用模块方式加载
                    } else {
                        var length = 3;
                        if(S.startsWith(path,'imports/')) {
                            //imports有5个层级imports/namespace/componentname/version/index.js
                            length = 5;
                        }
                        var arr = path.split('/');
                        if(arr.length > length) {
                            arr.splice(arr.length - 2);
                            loadCSS(arr.join('/') + '/index.css');
                        }
                        loadCSS(path.substring(0,path.lastIndexOf('/')) + '/index.css');
                    }
                });

            });
        }
    }, {
        ATTRS: {
            /**
             * 项目的样式
             * @cfg {Array}
             */
            projectCss: {
                value: [],
                setter:function(v){
                    if(S.isArray(v)){
                        return v;
                    }else{
                        return [v];
                    }
                }
            },
            /**
             * 分割符号
             * @cfg {String}
             */
            s: {
                value: '@'
            },
            /**
             * 模板,如果外部需要传入data，请把data属性设置在前，因为这个内部会会对data进行处理
             * @cfg {String}
             */
            tmpl: {
                setter: function(v) {
                    var self = this,
                        data = self.get('data') || {};
                    var tmplData = getTmplData(v, data, self.get('s'));
                    self.set('data', tmplData.data);
                    return tmplData.tmpl;
                }
            }
        }
    }, 'Demolet');
    return Demolet;
}, {
    requires: ['./pagelet', 'ajax', 'node']
});