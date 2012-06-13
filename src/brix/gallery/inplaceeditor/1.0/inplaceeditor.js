KISSY.add("brix/gallery/inplaceeditor/1.0/inplaceeditor", function(S, Brick) {
    function InplaceEditor() {
        InplaceEditor.superclass.constructor.apply(this, arguments);
    }
    InplaceEditor.ATTACH = {
        "input": {
            focusout: function(e) {
                this.hide();
            },
            keydown: function(e) {
                if (e.keyCode == 13) {
                    this.hide();
                }
            }
        }
    };

    S.extend(InplaceEditor, Brick, {
        _v: null,//记录编辑原始值
        show: function(x, y, v) {
            var el = this.get('el');
            el.css({
                visibility: 'visible',
                left: x,
                top: y
            });
            this._v = v;
            el.one('input')[0].focus();
            el.one('input').val(v);
        },
        hide: function() {
            var el = this.get('el');
            el.css({
                visibility: 'hidden',
                left: '-9999px',
                top: '-9999px'
            });
            var v = this.getValue();
            if (this._v != v) {//值不相等时候出发valueChange事件
                this.fire('valueChange', {
                    value: v
                });
            }
        },
        getValue: function() {
            var el = this.get('el');
            return el.one('input').val();
        }
    });
    return InplaceEditor;
}, {
    requires: ["brix/brick"]
});