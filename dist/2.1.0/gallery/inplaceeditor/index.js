KISSY.add("brix/gallery/inplaceeditor/index", function(S, Brick) {
    /**
     * 就地编辑
     * <br><a href="../demo/gallery/inplaceeditor/inplaceeditor.html" target="_blank">Demo</a>
     * @class Brix.Gallery.InplaceEditor
     * @extends Brix.Brick
     */
    var InplaceEditor = Brick.extend({
        constructor:function(){
           InplaceEditor.superclass.constructor.apply(this, arguments);
            this._v = null; //记录编辑原始值
            this._x = 0;
            this._y = 0; 
        }
    });
    InplaceEditor.ATTRS = {
        autoRender: {
            value: true
        },
        tmpl: {
            value: '<div class="inplaceeditor-popup"><input class="input" type="text" value=""></div>'
        }
    };
    InplaceEditor.EVENTS = {
        "input": {
            focusout: function(e) {
                this.hide();
            },
            keydown: function(e) {
                if (e.keyCode == 13) {
                    try{
                        e.target.blur();
                    }
                    catch(e){
                        
                    }
                }
            }
        }
    };
    InplaceEditor.FIRES = {
        /**
         * @event show
         * 显示
         */
        show:'show',
        /**
         * @event hide
         * 隐藏
         */
        hide:'hide',
        /**
         * @event valueChange
         * 选择触发
         * @param {Object} e 
         * @param {String} e.value 值
         */
        valueChange:'valueChange'

    }
    InplaceEditor.METHODS = {
        /**
         * 显示就地编辑
         * @param {Number} x 显示的X坐标
         * @param {Number} y 显示的Y坐标
         * @param {String} v 文本框的值
         * @param {String} css 文本框的样式
         */
        show: function(x, y, v, css) {
            var el = this.get('el'),
                inputNode = el.one('input');
            el.css({
                visibility: 'visible'
            });
            if (x !== undefined) {
                this._x = x;
            }
            if (y !== undefined) {
                this._y = y;
            }
            el.css({
                left: this._x,
                top: this._y
            });

            if (css) {
                inputNode.css(css);
            }

            inputNode[0].focus();
            if (v !== undefined) {
                this._v = v;
                inputNode.val(v);
            }
            this.fire(InplaceEditor.FIRES.show);
        },
        /**
         *  隐藏就地编辑
         */
        hide: function() {
            var v = this.getValue();
            var el = this.get('el');
            if (this._v != v) { //值不相等时候触发valueChange事件
                if (this.fire(InplaceEditor.FIRES.valueChange, {
                    value: v
                }) === false) {
                    this._v = v;
                    S.later(function(){
                        try{
                            //防止input隐藏
                            el.one('input')[0].focus();
                        }
                        catch(e){
                            
                        }
                        
                    },50);
                    return; //如果值验证不通过，则直接跳出
                }
            }
            el.css({
                visibility: 'hidden',
                left: '-9999px',
                top: '-9999px'
            });
            this.fire(InplaceEditor.FIRES.hide);
        },
        /**
         * 获取当前值
         */
        getValue: function() {
            var el = this.get('el');
            return el.one('input').val();
        }
    };

    

    S.augment(InplaceEditor, InplaceEditor.METHODS);

    return InplaceEditor;
}, {
    requires: ["brix/core/brick"]
});