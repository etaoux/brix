KISSY.add("brix/core/tmpler", function(S, Mustache, Node,UA) {
    var $ = Node.all;
    /**
     * 用以给brick打上id的标记,brick有id则返回
     * @method _stamp
     * @param el
     * @return {string}
     * @private
     */

    function _stamp(el, prefix) {
        prefix = prefix || 'brick_';
        if (!el.attr('id')) {
            el.attr('id', S.guid('brix_' + prefix));
        }
        return el.attr('id');
    }
    /**
     * 判断节点是否已经在dom中
     * @param  {HTMLElement} el 检测节点
     * @return {Boolen}      是否包含 el 节点
     */

    function _inDom(el) {
        return el.parentNode && el.parentNode.nodeType!=11;
    }

    /**
     * 复原替换的模板
     * @param  {string} html 原html
     * @param  {Array} arr  保存数据的数组
     * @return {string}      替换后的html
     */

    function _recovery(html, arr) {
        //去掉attr=""
        html = html.replace(/(\{{2,3}[\^#~](.+?)\}{2,3})\=\"\"/g, '$1');

        //对if语句的还原处理
        html = html.replace(/(\{{2,3}[\^#~]?)iftmplbrick\_(\d+)(\}{2,3})/g, function(w, i, j, k) {
            return i + arr[parseInt(j,10)] + k;
        });
        //对href和src语句的还原处理
        html = html.replace(/(href|src|style)=("|')("|')/ig,"");
        html = html.replace(/(\{{2,3}[\^#~]?)href\_src\_style\_tmplbrick\_(\d+)(\}{2,3})/g, function(w, i, j, k) {
            return arr[parseInt(j,10)];
        });
        //将~符号替换回/，完美了。
        html = html.replace(/(\{{2,3})~/g, '$1/');
        return html;
    }

    /**
     * 模板解析器
     * @param {String}  tmpl    模板字符串
     * @param {Boolean} isParse 是否需要对模板进行解析
     */

    function Tmpler(tmpl, isParse) {
        if (tmpl && (isParse !== false)) {
            this.bricks = {};
            this._praseTmpl(tmpl);
        } else {
            this.tmpl = tmpl;
        }
    }

    S.extend(Tmpler, Object, {
        _praseTmpl: function(tmpl) {
            this._buildBricks(tmpl);
        },
        /**
         * 对模板中的brick的解析
         * @param  {String} tmpl 模板字符串
         */
        _buildBricks: function(tmpl) {
            var self = this;
            var node = $(tmpl);
            var tmplNode = null;
            var inDom = _inDom(node[0]); //判断是否已经添加到dom中
            if (!inDom) {
                node.remove();
                //牛逼的正则啊
                var reg = /(\{{2,3}\#(.+?)\}{2,3})\s*([\s\S]*)?\s*((\{{2,3})\/\2(\}{2,3}))/g;
                while (reg.test(tmpl)) {
                    tmpl = tmpl.replace(reg, ' $1$3$5~$2$6 ');
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
                });


                //对href、src style的处理
                tmpl = tmpl.replace(/((href|src|style)=("|')(.*?)("|'))/ig,function(w,i){
                    var index = S.indexOf(i, arr),
                        name = 'href_src_style_tmplbrick_';
                    if (index < 0) {
                        name += arr.length;
                        arr.push(i);
                    } else {
                        name += index;
                    }
                    return "{{#"+name+"}}"  ;
                });

                node = $(tmpl);
                if (node.length > 1) { //如果是多个节点，则创建容器节点
                    node = $('<div></div>').append(node);
                }
                tmplNode = $('<div></div>').append(node);
            } else {
                tmplNode = node;
            }
            this.id = _stamp(node);
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

            var bks = tmplNode.all('[bx-name]:not([bx-parent])');
            bks.each(function(el) {
                self._buildBrick(el, tmplNode, self.bricks, arr);
            });

            if (!inDom) {
                self.tmpl = _recovery(tmplNode.html(), arr);
                node.remove();
                tmplNode.remove();
            }
            tmplNode = null;
            node = null;
            this.inDom = inDom;
        },

        _buildBrick: function(el, container, bricks, arr) {
            var self = this,
                id = _stamp(el),
                name = el.attr('bx-name'),
                path = el.attr('bx-path'),
                config = el.attr('bx-config'),
                tmplNodes = container.all('[bx-tmpl=' + name + ']');
            if (el.hasAttr('bx-tmpl')) {
                tmplNodes = tmplNodes.add(el[0]);
            }
            config = config ? eval("config=" + config) : {};
            bricks[id] = {
                name:name,
                path: path,
                config: config,
                tmpls: [],
                bricks: {}
            };
            var tmpls = bricks[id].tmpls;
            tmplNodes.each(function(tmplNode) {
                var tmplId = _stamp(tmplNode, 'tmpl_'),
                    datakey = tmplNode.attr('bx-datakey'),
                    tmpl = _recovery(tmplNode.html(), arr);
                tmpls.push({
                    id: tmplId,
                    datakey: datakey ? datakey.split(',') : [],
                    tmpler: new Tmpler(tmpl, false)
                });
            });
            tmplNodes = null;
            //递归调用获取子brick
            container.all('[bx-parent=' + name + ']').each(function(subBrick) {
                self._buildBrick(subBrick, container, bricks[id].bricks);
            });
        },

        /**
         * 给brick添加模板
         * @param {string} id  brick的id
         * @param {array} arr 模板数组
         * @return {Boolen} 是否添加成功
         */
        addTmpl: function(id, arr) {
            var self = this,
                ret = false;
            S.each(self.bricks, function(b, k) {
                if (k === id) {
                    S.each(arr, function(m) {
                        b.tmpls.push({
                            id: m.id,
                            datakey: m.datakey.split(','),
                            tmpler: new Tmpler(m.tmpl, false)
                        });
                    });
                    ret = true;
                    return false;
                }
            });
            return ret;
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
