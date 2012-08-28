
KISSY.add('brix/gallery/starrating/index', function(S, Brick, Node,UA) {
    var $ = Node.all;
    if(UA.ie==6){
        try { document.execCommand("BackgroundImageCache", false, true)} catch(e) { };
    }
    function StarRating() {
        StarRating.superclass.constructor.apply(this, arguments);
    }
    StarRating.ATTRS = {
        //每个星星分割成几个
        split: {
            value: 2
        },
        //最大值
        maxValue:{
            value:5
        },
        //份数
        length:{
            value:10
        },
        //默认值
        defaultValue:{
            value:false
        },
        //是否只读
        readOnly: {
            value: false
        },
        starWidth: {
            value: 18
        },
        inputs: {

        },
        current: {
            //当前选中的
        },
        mode:{
            value:true
        }
    };

    StarRating.ATTACH = {
        '.starrating-star': {
            mouseenter: function(e) {
                if (!this.get('readOnly')) {
                    var val, node = S.one(e.currentTarget);
                    this._fill(node);
                    if(this.get('mode')){
                        val = node.data('input').val();
                    }else{
                        val= node.data('input');
                    }
                    this.fire('focus', {
                        value: val
                    });
                }
            },
            mouseleave: function(e) {
                if (!this.get('readOnly')) {
                    var val, node = S.one(e.currentTarget);
                    this._draw();
                    if(this.get('mode')){
                        val = node.data('input').val();
                    }else{
                        val= node.data('input');
                    }
                    this.fire('blur', {
                        value: val
                    });
                }
            },
            click: function(e) {
                if (!this.get('readOnly')) {
                    var node = S.one(e.currentTarget);
                    this.select(node);
                }
            }
        }
    };

    StarRating.METHOD = {
        select: function(node) {
            var self = this;
            if (typeof node == 'number') {
                node = self.get('el').all('.starrating-star').item(node);
                if (node) {
                    return self.select(node);
                } else {
                    throw '没有找到节点';
                }

            } else if (typeof node == 'string') {
                if(self.get('mode')){
                    self.get('inputs').each(function(input, i) {
                        if (input.val() == node) {
                            node = self.get('el').all('.starrating-star').item(i);
                            return false;
                        }
                    });
                }
                else{
                    var i = S.indexOf(node,self.get('inputs'));
                    node = self.get('el').all('.starrating-star').item(i);
                }
                return self.select(node);
            }
            self.set('current', node);
            self._draw();
            var val;
            if(self.get('mode')){
                val = node.data('input').val();
            }else{
                val= node.data('input');
            }
            self.fire('selected', {
                value: val
            });
        },
        readOnly: function(toggle, disable) {
            var self = this;
            self.set('readOnly', toggle || toggle == undefined ? true : false);
            var readOnly = self.get('readOnly');
            if(readOnly){
                self.get('el').all('.starrating-star').addClass('starrating-star-readonly');
            }
            else{
                self.get('el').all('.starrating-star').removeClass('starrating-star-readonly');
            }
            if(self.get('mode')){
                if (disable) {
                    self.get('inputs').attr("disabled", "disabled");
                } else {
                    self.get('inputs').removeAttr("disabled");
                }
            }
            self._draw();
        },
        disable: function() { 
            this.readOnly(true,true);
        },
        enable: function() { 
            this.readOnly(false,false);
        } 
    };

    S.extend(StarRating, Brick, {
        initialize: function() {
            var self = this,
                inputs = self.get('inputs');
            if (!inputs) {
                inputs = self.get('el').all('input[type=radio].star');
            }
            if (inputs.length == 0) {
                self.set('mode',false);
                var length = self.get('length'),
                maxValue = self.get('maxValue');
                inputs = [];
                flg = maxValue/length;
                for (var i = 1; i <= length; i++) {
                    var val = i*maxValue/length;
                    if(flg>=1){
                        inputs.push(Math.round(val).toString());
                    }
                    else if(flg>0.1){
                        inputs.push(val.toFixed(1).toString());
                    }
                    else{
                        inputs.push(val.toFixed(2).toString());
                    }
                    
                };
            }

            self.set('inputs',inputs);
            
            if(self.get('mode')){
                inputs.each(function(input, i) {
                    var val = input.val(),title = input.attr('title') || val;
                    self._creat(val,title,input,i);
                });
            }
            else{
                S.each(inputs,function(val,i){
                    self._creat(val,val,val,i);
                });
            }
            rater = null;

            var defaultValue = self.get('defaultValue');
            if(defaultValue){
                self.select(defaultValue);
            }
        },
        _creat:function(val,title,input,i){
            var self = this,
                el = self.get('el'),
                split = self.get('split'),
                readOnly = self.get('readOnly'),
                starWidth = self.get('starWidth'),
                star = $('<div class="starrating-star"><a title="' + title + '">' + val + '</a></div>');
            el.append(star);
            if (split > 1) {
                var stw = star.width() || starWidth;
                var spi = (i % split),
                    spw = Math.floor(stw / split);
                star.css({
                    width: spw
                }).one('a').css({
                    'margin-left': '-' + (spi * spw) + 'px'
                });
            }
            star.data('input', input);
            if(readOnly){
                star.addClass('starrating-star-readonly');
            }
            if(self.get('mode')){
                input.hide();
            }
        },
        _fill: function(node) { 
            this._drain();
            node.addClass('starrating-star-hover');
            var temp = node;
            while (temp.prev()) {
                temp.prev().addClass('starrating-star-hover');
                temp = temp.prev();
            }
        },
        _drain: function() { 
            this.get('el').all('.starrating-star').removeClass('starrating-star-hover').removeClass('starrating-star-on');
        },
        _draw: function() { 
            this._drain();
            if(this.get('mode')){
                this.get('inputs').removeAttr('checked');
            }
            var current = this.get('current');
            if (current) {
                if(this.get('mode')){
                    current.data('input').attr('checked', 'checked');
                }
                current.addClass('starrating-star-on');
                var temp = current;
                while (temp.prev()) {
                    temp.prev().addClass('starrating-star-on');
                    temp = temp.prev()
                }
            }
        },
        destructor: function() {
            
        }
    });
    S.augment(StarRating, StarRating.METHOD);
    return StarRating;
}, {
    requires: ["brix/core/brick", "node","ua"]
});