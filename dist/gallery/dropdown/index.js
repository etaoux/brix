KISSY.add("brix/gallery/dropdown/index", function(S, Brick) {
    /**
     * 下拉选择
     * @class Brix.Gallery.Dropdown
     * @extends Brix.Brick
     */
    function Dropdown() {
        Dropdown.superclass.constructor.apply(this, arguments);
    }
    Dropdown.ATTRS = {
        /**
         * 触发模式，默认是1，点击触发，面包屑用2或其他
         * @cfg {Number}
         */
        mode:{
            value:1
        },
        /**
         * 是否自动修改.dropdown-list的宽度
         * @type {Boolean}
         */
        autoResize:{
            value:true
        }
    }
    Dropdown.FIRES = {
        /**
         * @event beforeFocus
         * 显示前触发
         */
        beforeFocus:'beforeFocus',
        /**
         * @event focus
         * 显示触发
         */
        focus:'focus',
        /**
         * @event beforeBlur
         * 隐藏前触发
         */
        beforeBlur:'beforeBlur',
        /**
         * @event blur
         * 隐藏触发
         */
        blur:'blur',
        /**
         * @event selected
         * 选择触发
         * @param {Object} e 
         * @param {String} e.value 值
         * @param {String} e.text 文本
         */
        selected:'selected'
    }
    Dropdown.METHODS = {
        /**
         * 显示
         */
        focus: function() {
            var mode = this.get('mode'),
                el = this.get('el');
            this.fire(Dropdown.FIRES.beforeFocus);
            if(mode==1){
                el.one('.dropdown-hd').addClass("dropdown-hd-active");
            }
            el.one('.dropdown-list').css({'display':'block'});
            if(this.get('autoResize')){
                var w = el.one('.dropdown-hd').outerWidth();
                el.one('.dropdown-list').css({width:w+'px'});  
            }
            this.fire(Dropdown.FIRES.focus);
        },
        /**
         * 隐藏
         */
        blur: function() {
            var mode = this.get('mode'),
                el = this.get('el');
            this.fire(Dropdown.FIRES.beforeBlur);
            if(mode==1){
                el.one('.dropdown-hd').removeClass("dropdown-hd-active");
            }
            el.one('.dropdown-list').css('display', 'none');
            this.fire(Dropdown.FIRES.blur);
        }
    }

    Dropdown.DOCEVENTS = {
        "":{//空选择器，表示将事件直接绑定在document上
            click:function(e){
                var self = this,
                    el = self.get('el');
                if (!self.__show&&!el.contains(e.target)) {
                    el.all('.dropdown-list').css('display', 'none');
                    el.all('.dropdown-hd').removeClass("dropdown-hd-active");
                }
                self.__show = false;
            }
        }
    }
    Dropdown.EVENTS = {
        "":{
            mouseleave:function(){
                var mode = this.get('mode');
                if(mode!=1){
                    this.blur()
                }
            }
        },
        ".dropdown-hd": {
            click: function(e) {
                var mode = this.get('mode');
                if(mode==1){
                    el = this.get('el').one('.dropdown-list');
                    this.__show = true;
                    if (el.css('display') == 'block') {
                        this.blur();
                    } else {
                        this.focus();
                    }
                }
            },
            mouseenter:function(){
                var mode = this.get('mode');
                if(mode!=1){
                    this.focus()
                }
            }
        },
        ".dropdown-item": {
            click: function(e) {
                this.__show = true;
                this.blur();
                var el = this.get('el');
                var currentTarget = S.one(e.currentTarget);
                if(currentTarget.hasClass('dropdown-itemselected')){
                    return;
                }
                el.all('.dropdown-itemselected').removeClass('dropdown-itemselected');
                currentTarget.addClass('dropdown-itemselected');
                var dropdownTextNode = el.one('.dropdown-text');
                var selectNode = currentTarget.one('span');
                var data = {
                    value: selectNode.attr('value')||'',
                    text: selectNode.text()
                }


                //隐藏提交的表单字段，如果存在，赋值
                var inputNode = el.one('input');
                if(inputNode){
                    inputNode.val(data.value);
                }
                dropdownTextNode.attr('value', data.value);
                dropdownTextNode.text(data.text);
                this.fire(Dropdown.FIRES.selected, data);
            },
            mouseenter: function(e) {
                var currentTarget = S.one(e.currentTarget);
                currentTarget.addClass('dropdown-itemover');
            },
            mouseleave: function(e) {
                var currentTarget = S.one(e.currentTarget);
                currentTarget.removeClass('dropdown-itemover');
            }
        }
    };

    S.extend(Dropdown, Brick, {
    });

    S.augment(Dropdown,Dropdown.METHODS);
    return Dropdown;
}, {
    requires: ["brix/core/brick"]
});
