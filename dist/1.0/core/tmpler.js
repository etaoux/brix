KISSY.add("brix/core/tmpler", function(S, Mustache,Node) {
    var $ = Node.all;
    /**
     * 模板解析器，对传入的模板通过钩子进行分析，结合 Mustache 和数据给出 html 片段。
     * @class Brix.Tmpler
     * @param {String}  tmpl    模板字符串
     * @param {Number} level    对模板进行解析的层级，false表示不解析
     * @requires Brix.Mu
     */

    function Tmpler(tmpl, level) {
        if(tmpl && (level !== false)) {
            this.tmpls = [];
            this._praseTmpl(tmpl,level);
        } else {
            this.tmpl = tmpl;
        }
    }

    S.extend(Tmpler, Object, {
        /**
         * 解析模板
         * @param  {String} tmpl  模板字符串
         * @param  {Number} level 对模板进行解析的层级，false表示不解析
         * @private
         */
        _praseTmpl: function(tmpl,level) {
            var self = this,
                inDom = false,
                node, tmplNode;
            if(typeof tmpl === 'string') {
                if(tmpl.charAt(0) === '.' || tmpl.charAt(0) === '#' || tmpl === 'body') {
                    node = $(tmpl);
                }
            } else {
                node = tmpl;
            }

            if(node) {
                if(node.item(0)[0].nodeName.toUpperCase() == 'SCRIPT') {
                    //如果是script节点，则直接取html
                    tmpl = node.item(0).html()
                } else {
                    inDom = true;
                }
            }

            if(!inDom) {
                var r = '<([\\w]+)\\s+[^>]*?bx-tmpl=["\']?([^"\'\\s]+)["\']?\\s+[^>]*?bx-datakey=["\']?([^"\'\\s]+)["\']?[^>]*?>(@brix@)</\\1>';
                while(level--){
                    r = r.replace('@brix@','(?:<\\1[^>]*>@brix@</\\1>|[\\s\\S])*?');
                }
                r = r.replace('@brix@','(?:[\\s\\S]*?)');
                self.reg = r;
                S.log(r);
                self.tmpl = self._replaceTmpl(tmpl);
                self._buildTmpls(self.tmpl);
            }
            self.inDom = inDom;
        },
        /**
         * 对节点中的bx-tmpl解析，构建模板和数据配置
         * @param  {String} tmpl  需要解析的模板
         * @private
         */
        _buildTmpls: function(tmpl) {
            var self = this;
            var r = new RegExp(self.reg,"ig");
            while((m = r.exec(tmpl)) !== null) {
                self.tmpls.push({
                    name: m[2],
                    datakey: m[3],
                    tmpler: new Tmpler(m[4], false)
                });
                self._buildTmpls(m[4]);
            }
        },
        /**
         * 移除子模板标签
         * @param  {String} tmpl 需要替换的模板
         * @return {String}      替换后的模板
         * @private
         */
        _replaceTmpl: function(tmpl) {
            //return tmpl;
            var r = /<!--bx-tmpl="([^"]+?)"\s+bx-datakey="([^"]+?)"-->(\s*([\s\S]*)?\s*)<!--bx-tmpl="\1"-->/g,
                m;
            while(r.test(tmpl)) {
                tmpl = tmpl.replace(r, function(i, j, k, l) {
                    return l;
                });
                r.lastIndex = 0;
            }
            return tmpl;
        },

        /**
         * 添加子模板
         * @param {String} name    模板名称
         * @param {String} datakey 模板对应的数据key
         * @param {String} tmpl    子模板
         */
        addTmpl: function(name, datakey, tmpl) {
            var self = this;
            self.tmpls.push({
                id: name,
                datakey: datakey,
                tmpler: new Tmpler(tmpl, false)
            });
        },

        /**
         * 获取模板字符串
         * @return {String} 模板字符串
         */
        getTmpl: function() {
            return this.tmpl;
        },
        /**
         * 模板和数据渲染成字符串
         * @param  {Object} data 数据
         * @return {String}      html片段
         */
        to_html: function(data) {
            return Mustache.to_html(this.getTmpl(), data);
        }
    });
    return Tmpler;
}, {
    requires: ['./mu','node', 'sizzle']
});