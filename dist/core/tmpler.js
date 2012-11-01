KISSY.add("brix/core/tmpler", function(S, Mustache, Node,UA) {
    var $ = Node.all;
    /**
     * 用以给brick打上id的标记,brick有id则返回
     * @method _stamp
     * @param el
     * @return {string}
     * @ignore
     */

    function _stamp(el, prefix) {
        prefix = prefix || 'brick_';
        if (!el.attr('id')) {
            el.attr('id', S.guid('brix_' + prefix));
        }
        return el.attr('id');
    }

    /**
     * 复原替换的模板
     * @param  {string} html 原html
     * @param  {Array} arr  保存数据的数组
     * @return {string}      替换后的html
     * @ignore
     */

    function _recovery(html) {
        html = html.replace(/(?:<|&lt;)!--({{[^}]+}})--(?:>|&gt;)/g, '$1').replace(/\s(src|href)\s*=\s*(['"])(.*?\{.+?)\2/g,' data-templatable-$1=$2$3$2');
        //去掉attr=""
        /*html = html.replace(/(\{{2,3}[\^#~](.+?)\}{2,3})\=\"\"/g, '$1');

        //对if语句的还原处理
        html = html.replace(/(\{{2,3}[\^#~]?)iftmplbrick\_(\d+)(\}{2,3})/g, function(w, i, j, k) {
            return i + arr[parseInt(j,10)] + k;
        });*/
        //对href和src语句的还原处理
        /*html = html.replace(/(href|src|style)=("|')("|')/ig,"");
        html = html.replace(/(\{{2,3}[\^#~]?)href\_src\_style\_tmplbrick\_(\d+)(\}{2,3})/g, function(w, i, j, k) {
            return arr[parseInt(j,10)];
        });*/
        //将~符号替换回/，完美了。
        //html = html.replace(/(\{{2,3})~/g, '$1/');


        
        return html;
    }

    /**
     * 模板解析器，对传入的模板通过钩子进行分析，结合 Mustache 和数据给出 html 片段。
     * @class Brix.Tmpler
     * @param {String}  tmpl    模板字符串
     * @param {Boolean} isParse 是否需要对模板进行解析
     * @requires Brix.Mu
     */

    function Tmpler(tmpl, isParse) {
        if (tmpl && (isParse !== false)) {
            this.tmpls = [];
            this._praseTmpl(tmpl);
        } else {
            this.tmpl = tmpl;
        }
    }

    S.extend(Tmpler, Object, {
        /**
         * 解析模板
         * @param  {String} tmpl 模板字符串
         * @private
         */
        _praseTmpl: function(tmpl) {
            var self = this,inDom = false,node,tmplNode;
            if(typeof tmpl === 'string'){
                if(tmpl.charAt(0)==='.'||tmpl.charAt(0)==='#'||tmpl==='body'){
                    node = $(tmpl);
                }
            }
            else{
                node = tmpl;
            }

            if(node){
                if(node.item(0)[0].nodeName.toUpperCase()=='SCRIPT'){
                    //如果是script节点，则直接取html
                    tmpl= node.item(0).html()
                }
                else{
                    inDom = true;
                }
            }
            
            if (!inDom) {
                //牛逼的正则啊
                /*var reg = /(\{{2,3}\#(.+?)\}{2,3})\s*([\s\S]*)?\s*((\{{2,3})\/\2(\}{2,3}))/g;
                while (reg.test(tmpl)) {
                    //这里为什么要前后加空格
                    tmpl = tmpl.replace(reg, '$1$3$5~$2$6');
                    //console.log(reg.lastIndex);
                    //不重置位置，我了个去，ie7，8有问题
                    reg.lastIndex = 0;
                }
                //对if语句的处理
                var arr = [];
                tmpl = tmpl.replace(/(\{{2,3}[\^#~])?(if\(.*?\))(\}{2,3})?/ig, function(w, i, j, k, m, n) {
                    var index = S.indexOf(j, arr),
                        name = 'iftmplbrick_';
                    if (index < 0) {
                        name += arr.length;
                        arr.push(j);
                    } else {
                        name += index;
                    }
                    return i + name + k;
                });*/


                //对href、src style的处理
                /*tmpl = tmpl.replace(/((href|src|style)=("|')(.*?)("|'))/ig,function(w,i){
                    var index = S.indexOf(i, arr),
                        name = 'href_src_style_tmplbrick_';
                    if (index < 0) {
                        name += arr.length;
                        arr.push(i);
                    } else {
                        name += index;
                    }
                    return "{{#"+name+"}}"  ;
                });*/


                tmpl = tmpl.replace(/({[^}]+}})/g, '<!--$1-->').replace(/\s(src|href)\s*=\s*(['"])(.*?\{.+?)\2/g,' data-templatable-$1=$2$3$2');

                node = new Node(tmpl);

                tmplNode = $('<div></div>').append(node);
                if(node.length>1){
                    this.id = _stamp(tmplNode);
                }
                else{
                    this.id = _stamp(node);
                }
                
            } else {
                tmplNode = node;
                this.id = _stamp(tmplNode);
            }
            
            var tmplTargetNodes = tmplNode.all('[bx-tmpl-source]');
            tmplTargetNodes.each(function(node) {
                var selector = node.attr('bx-tmpl-source'),
                    id= _stamp(node,'tmpl_'),
                    temptmplNode = tmplNode.one(selector).clone(true);
                temptmplNode.removeAttr('id');
                temptmplNode.insertBefore(node);
                node.remove();
                temptmplNode.attr('id',id);
            });
            if (!inDom) {
                self._buildTmpls(tmplNode);
                self.tmpl = _recovery(tmplNode.html());
                node.remove();
                tmplNode.remove();
            }
            tmplNode = null;
            node = null;
            this.inDom = inDom;
        },
        /**
         * 对节点中的bx-tmpl解析，构建模板和数据配置
         * @param  {Node} el 容器节点
         * @private
         */
        _buildTmpls:function(el){
            var self = this,
                tmplNodes = el.all('[bx-tmpl]');
            if (el.hasAttr('bx-tmpl')) {
                tmplNodes = tmplNodes.add(el[0]);
            }
            tmplNodes.each(function(tmplNode) {
                var tmplId = _stamp(tmplNode, 'tmpl_'),
                    datakey = tmplNode.attr('bx-datakey'),
                    tmpl = _recovery(tmplNode.html());
                self.tmpls.push({
                    id: tmplId,
                    datakey: datakey ? datakey.split(',') : [],
                    tmpler: new Tmpler(tmpl, false)
                });
            });
            tmplNodes = null;
        },

        /**
         * 给brick添加模板
         * @param {Array} arr 模板数组
         * @return {Boolean} 是否添加成功
         */
        addTmpl: function(arr) {
            var self = this;
            S.each(arr, function(m) {
                self.tmpls.push({
                    id: m.id,
                    datakey: m.datakey.split(','),
                    tmpler: new Tmpler(m.tmpl, false)
                });
            });
            return true;
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
    requires: ['./mu', 'node','ua', 'sizzle']
});
