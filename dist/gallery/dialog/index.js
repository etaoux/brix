KISSY.add("brix/gallery/dialog/index", function(S, Pagelet, Overlay) {
    function Dialog(config) {
        var self = this;
        Dialog.superclass.constructor.apply(this, arguments);
        //绑定触发事件
        var self = this,
            trigger = S.one(self.get('trigger'));
        if(trigger){
            var triggerType = self.get('triggerType');
            S.each(triggerType, function(v) {
                trigger.on(v, function(e) {
                    e.preventDefault();
                    self.toggle();
                })
            });
        }
    }
    Dialog.ATTRS = {
        trigger:{
            value:false
        },
        triggerType:{
            value:['click']
        },
        start: {
            value: {
                left: 600,
                top: 100,
                opacity: 0
            }
        },
        end: {
            value: {
                left: 100,
                top: 100,
                opacity: 1
            }
        },
        x: {
            getter: function() {
                var self = this;
                return self.get('start').left;
            }
        },
        y: {
            getter: function() {
                var self = this;
                return self.get('start').top;
            }
        },
        dir: {
            getter: function() {
                var self = this;
                var dir = '',
                    start = self.get('start'),
                    end = self.get('end');
                if(start.left===end.left&&start.top===end.top){
                    return false;
                }
                dir = start.left === end.left && (start.top < end.top ? 'down' : 'up') || start.top === end.top && (start.left < end.left ? 'right' : 'left') || 'left';
                return dir;
            }
        },
        elCls:{
            value:'dialog'
        },
        prefixCls: {
            value: 'dialog-'
        },
        duration: {
            value: 0.3
        },
        easing: {
            value: 'easeNone'
        },
        closable: {
            value: true
        },
        mask: {
            value: false
        },
        tmpl: {
            value: null
        },
        data: {

        }
    };

    S.extend(Dialog, Overlay, {
        initializer: function() {
            var self = this;
            //渲染模板内容
            self.on('afterRenderUI', function() {
                var closeBtn = self.get('el').one('.dialog-ext-close');
                closeBtn.one('.dialog-ext-close-x').html('&#223');
                closeBtn.on('mouseenter',function(e){
                    closeBtn.one('.dialog-ext-close-x').html('&#378');
                });
                closeBtn.on('mouseleave',function(e){
                    closeBtn.one('.dialog-ext-close-x').html('&#223');
                });
                if (self.get('tmpl')) {
                    self.pagelet = new Pagelet({
                        container: self.get('contentEl'),
                        autoRender: true,
                        tmpl: self.get('tmpl'),
                        data: self.get('data')
                    });
                    self.pagelet.addBehavior();
                }
            });
        },
        _visibilityChange:function(v,fn){
            var self = this;
            var el = self.get('el'),
                body = S.one('body'),
                html = S.one('html'),
                s = 'start',
                dir = self.get('dir');
            //移除动画队列，设置显示，为动画增加效果
            el.stop();
            el.css('visibility', 'visible');
            if (v) {//如果显示
                el.css(self.get('start'));
                s = 'end';
                
            }
            else{
                el.css(self.get('end'));
                s = 'start';
            }
            //为防止出现滚动条
            body.css({width:body.width(),height:body.height(),overflow:'hidden'});
            html.css({width:body.width(),height:body.height(),overflow:'hidden'});
            el.animate(self.get(s), self.get('duration'), self.get('easing'), function() {
                el.css('visibility', v?'visible':"hidden");
                if(!v){
                    el.css({left:'-99999px',top:'-99999px'});
                }
                body.css({width:'',height:'',overflow:''});
                html.css({width:'',height:'',overflow:''});
                fn&&fn.call(self);
            });
        },
        bindUI:function(){
            var self = this,el = self.get('el');
            self.on('beforeVisibleChange', function(ev) {
                var v = ev.newVal,dir = self.get('dir');
                el.removeClass('dialog-left').removeClass('dialog-right').removeClass('dialog-up').removeClass('dialog-down');
                if(dir){
                    el.addClass('dialog-'+dir)
                }
                if(!v){
                    self._visibilityChange(v,function(){
                        el.css('visibility', 'hidden');
                        self.set('visible',false,{silent:true});
                        self.fire('hide');
                    });
                    return false;
                }

            });
            self.on('afterVisibleChange', function(ev) {
                var v = ev.newVal;
                if(v){
                    self._visibilityChange(v);
                }
            });
        },
        destructor:function(){
            var self = this;
            if(self.pagelet){
                self.pagelet.destroy();
                self.pagelet = null;
            }
        },
        toggle: function() {
            var self = this,el = self.get('el');
            if(el){
                if (el.css('visibility') == 'hidden') {
                    self.show();
                } else {
                    self.hide();
                }
            }
            else{
                self.show();
            }
        }
    });
    return Dialog;
}, {
    requires: ["brix/core/pagelet", "overlay", "./dialog.css"]
});