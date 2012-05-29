KISSY.add("brix/tmpler", function(S, Node) {
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
            el.attr('id', S.guid('brix_'+prefix));
        }
        return el.attr('id');
    }
    //isParse 是否需要对模板进行解析
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
        _buildBricks: function(tmpl) {
            var self = this;
            var node = $(tmpl);
            var tmplNode =null;
            var inDom = node.parent()?true:false;//判断是否已经添加到dom中
            if(!inDom){
                node.remove();
                //牛逼的正则啊
                var reg = /(\{\{\#(.+)?\}\})\s*([\s\S]*)?\s*(\{\{\/\2\}\})/g;
                while (reg.test(tmpl)) {
                    tmpl = tmpl.replace(reg, ' $1$3\{\{~$2\}\} ');
                    //console.log(reg.lastIndex);
                    //不重置位置，我了个去，ie7，8有问题
                    reg.lastIndex = 0;
                }
                tmplNode = $('<div></div>').append(tmpl);
            }
            else{
                tmplNode =node;
            }
            var bks = tmplNode.all('[bx-brick]:not([bx-parent])');
            bks.each(function(el) {
                self._buildBrick(el, tmplNode, self.bricks);
            });

            if(!inDom){
                //模板一定要在解析完成后赋值，因为在解析过程中会给模板加id
                self.tmpl = tmplNode.html().replace(/((\{\{\#(.+)?\}\})([\s\S]*)?\s*(\{\{~\3\}\}))\=\"\"/g, '$1').replace(/\{\{~/g, '{{/');
                tmplNode.remove();
            }
            tmplNode = null;
            node = null;
            this.inDom = inDom;
        },

        _buildBrick: function(el, container, bricks) {
            var self = this,
                id = _stamp(el),
                name = el.attr('bx-brick'),
                path = el.attr('bx-path'),
                tmplNodes = el.all('[bx-tmpl=' + name + ']');
            if (el.hasAttr('bx-tmpl')) {
                tmplNodes = tmplNodes.add(el[0]);
            }
            bricks[id] = {
                path: path,
                tmpls: [],
                bricks: {}
            };
            var tmpls = bricks[id].tmpls;
            tmplNodes.each(function(tmplNode) {
                var tmplId = _stamp(tmplNode, 'tmpl_'),
                    datakey = tmplNode.attr('bx-datakey'),
                    //去掉="",将~符号替换回/，完美了。
                    tmpl = tmplNode.html().replace(/((\{\{\#(.+)?\}\})([\s\S]*)?\s*(\{\{~\3\}\}))\=\"\"/g, '$1').replace(/\{\{~/g, '{{/');
                tmpls.push({
                    id: tmplId,
                    datakey: datakey ? datakey.split(',') : [],
                    tmpler: new Tmpler(tmpl, false)
                });
            });
            tmplNodes = null;
            //递归调用
            container.all('[bx-parent=' + name + ']').each(function(subBrick) {
                self._buildBrick(subBrick, container, bricks[id].bricks);
            });
        },
        /**
        * 给brick添加模板
        * @method addTmpl
        * @param id brick的id
        * @param arr 子模板对象数组
        * @return {blooen}
        * @public
        */
        addTmpl:function(id,arr){
            var self = this;
            ret = false;
            S.each(self.bricks, function(b,k) {
                if(k==id){
                    S.each(arr,function(m){
                        b.tmpls.push({
                            id:m.id,
                            datakey:m.datakey.split(','),
                            tmpler:new Tmpler(m.tmpl, false)
                        })
                    });
                    ret = true;
                    return false;
                }
            });
            return ret;
        },
        /**
        * 获取模板字符串
        * @method getTmpl
        * @return {string}
        * @public
        */
        getTmpl: function() {
            return this.tmpl;
        },
        /**
        * 模板和数据渲染成字符串
        * @method to_html
        * @return {string}
        * @public
        */
        to_html: function(data) {
            return Mustache.to_html(this.getTmpl(), data);
        }
    });
    return Tmpler;
}, {
    requires: ['node','sizzle']
});
