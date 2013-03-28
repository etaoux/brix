KISSY.add("brix/core/tmpler", function(S, XTemplate, Node, IO) {
    var $ = Node.all;
    //用于缓存xhr获取的模板
    var xhr_templates = {};
    //子模板主正则
    var SUBTMPLREGEXP = '<([\\w]+)\\s+[^>]*?bx-tmpl=["\']([^"\']+)["\']\\s+[^>]*?bx-datakey=["\']([^"\']+)["\']\\s*[^>]*?>(@brix@)</\\1>';
    //不解析模板存储正则
    var STORETMPLREGEXP = /\{\{#bx\-tmpl\-(.*)\}\}([\s\S]*?)\{\{\/bx\-tmpl\}\}/ig;
    //xhr的模板解析正则
    var XHRTMPLREGEXP = /@TEMPLATE\|(.*?)\|TEMPLATE@/g;
    /**
     * 模板解析器，对传入的模板通过钩子进行分析，结合 XTemplate 和数据给出 html 片段。
     * @class Brix.Tmpler
     * @param {String} tmpl     模板字符串
     * @param {Number} level    对模板进行解析的层级，false表示不解析
     */

    function Tmpler(tmpl, level) {
        if (tmpl && (level !== false)) {
            //子模板数组
            this.subTmpls = [];
            //存储的模板，不解析，供后期使用
            this.storeTmpls = {};
            this._bx_praseTmpl(tmpl, level);
        } else {
            this.tmpl = tmpl;
        }
    }

    S.augment(Tmpler, {
        /**
         * 解析模板
         * @param  {String} tmpl  模板字符串
         * @param  {Number} level 对模板进行解析的层级，false表示不解析
         * @private
         */
        _bx_praseTmpl: function(tmpl, level) {
            var self = this,
                inDom = false,
                node, tmplNode;
            if (typeof tmpl === 'string') {
                if (tmpl.charAt(0) === '.' || tmpl.charAt(0) === '#' || tmpl === 'body') {
                    node = $(tmpl);
                } else {
                    tmpl = tmpl.replace(XHRTMPLREGEXP, function($1, $2) {
                        S.log($2)
                        if (!xhr_templates[$2]) {
                            IO({
                                url: $2,
                                dataType: 'html',
                                async: false,
                                success: function(d, textStatus, xhrObj) {
                                    xhr_templates[$2] = d;
                                }
                            });
                        }
                        return xhr_templates[$2] || '';
                    });
                }
            } else {
                node = tmpl;
            }

            if (node) {
                if (node.item(0)[0].nodeName.toUpperCase() == 'SCRIPT') {
                    //如果是script节点，则直接取html
                    tmpl = node.item(0).html();
                } else {
                    //解析script是text/tmpl的模板，看是否是subTmpl或者storeTmpl
                    $('[type="text/tmpl"]').each(function(el) {
                        var html = el.html();
                        html = self._bx_buildStoreTmpls(html);
                        self._bx_buildSubTmpls(html, false, level);
                    });
                    inDom = true;
                }
            }

            if (!inDom) {
                tmpl = self._bx_buildStoreTmpls(tmpl);
                self._bx_buildSubTmpls(tmpl, false, level);
                self.tmpl = tmpl;
            }
            self.inDom = inDom;
        },
        /**
         * 构建{{#bx-tmpl-id}}……{{/bx-tmpl}}的存储
         * @param  {String} tmpl 需要解析的模板
         * @return {String}      解析后的模板
         */
        _bx_buildStoreTmpls: function(tmpl) {
            var self = this;
            tmpl = tmpl.replace(STORETMPLREGEXP, function(g, id, html) {
                self.storeTmpls[id] = html;
                return '';
            });
            return tmpl;
        },
        /**
         * 对节点中的bx-tmpl和bx-datakey解析，构建模板和数据配置
         * @param {String} tmpl  需要解析的模板
         * @param {String} r 正则
         * @param {Number} level  嵌套层级
         * @private
         */
        _bx_buildSubTmpls: function(tmpl, r, level) {
            var self = this;
            var r = r;
            if (!r) {
                r = SUBTMPLREGEXP;
                while (level--) {
                    r = r.replace('@brix@', '(?:<\\1[^>]*>@brix@</\\1>|[\\s\\S])*?');
                }
                r = r.replace('@brix@', '(?:[\\s\\S]*?)');
            }
            var reg = new RegExp(r, "ig");
            var m;
            while ((m = reg.exec(tmpl)) !== null) {
                self.subTmpls.push({
                    name: m[2],
                    datakey: m[3],
                    tmpler: new Tmpler(m[4], false)
                });
                self._bx_buildSubTmpls(m[4], r);
            }
        },
        /**
         * 添加子模板
         * @param {String} name    模板名称
         * @param {String} datakey 模板对应的数据key
         * @param {String} tmpl    子模板
         */
        addSubTmpl: function(name, datakey, tmpl) {
            var self = this;
            self.subTmpls = self.subTmpls || [];
            self.subTmpls.push({
                name: name,
                datakey: datakey,
                tmpler: new Tmpler(tmpl, false)
            });
        },

        /**
         * 获取存储的模板字符串
         * @param {String} id 模板标识，在{{#bx-tmpl-id}}指定的id
         * @return {String} 模板字符串
         */
        getStoreTmpl: function(id) {
            var storeTmpls = this.storeTmpls;
            if (storeTmpls) {
                return storeTmpls[id] || '';
            }
        },
        /**
         * 模板和数据渲染成字符串
         * @param  {Object} data 数据
         * @return {String} html片段
         */
        render: function(data) {
            var tmpl = this.tmpl;
            if (typeof XTemplate === 'function') {
                return new XTemplate(tmpl).render(data);
            } else {
                return XTemplate.render(tmpl, data);
            }
        }
    });
    return Tmpler;
}, {
    requires: [Brix.templateEngine, 'node', 'ajax', 'sizzle']
});