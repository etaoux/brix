KISSY.add("brix/gallery/dropdown/index", function(S, Brick) {
    /**
     * 下拉选择
     * <br><a href="../demo/gallery/dropdown/dropdown.html" target="_blank">Demo</a>
     * @class Brix.Gallery.Dropdown
     * @extends Brix.Brick
     */
    var Dropdown = Brick.extend({
        bindUI: function() {
            var self = this,
                el = this.get('el');
            el.attr('tabindex',0);
            if(self.get('setDefault')){
                var selectedItem = el.one('.dropdown-itemselected')||el.one('.dropdown-item');
                self._select(selectedItem,true);
            }
        },
        _select:function(selectedItem,flg){
            var self = this,
                el = this.get('el');
            el.all('.dropdown-item').removeClass('.dropdown-itemover').removeClass('dropdown-itemselected');
            selectedItem.addClass('dropdown-itemselected');
            var dropdownTextNode = el.one('.dropdown-text');
            var selectNode = selectedItem.one('span');
            var data = {
                value: selectNode.attr('value')||'',
                text: selectNode.text()
            }
            var inputNode = el.one('input');
            if(inputNode){
                inputNode.val(data.value);
            }
            var v = dropdownTextNode.attr('value') || '';
            if(v==data.value){
                return;
            }
            dropdownTextNode.attr('value', data.value);
            dropdownTextNode.text(data.text);
            if(!flg){
               self.fire(Dropdown.FIRES.selected, data); 
            }
        },
        _hover:function(item,isScroll){
            var self = this,
                el = this.get('el');
            el.all('.dropdown-item').removeClass('.dropdown-itemover');
            item.addClass('.dropdown-itemover');
            if(isScroll){
                item.scrollIntoView(el.one('.dropdown-list'));
            }
        }
    });
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
         * @cfg {Boolean}
         */
        autoResize:{
            value:true
        },
        /**
         * 是否初始化的时候设置默认值
         * @cfg {Boolean}
         */
        setDefault:{
            value:false
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
                el = this.get('el'),
                ul = el.one('.dropdown-list');
            if(ul.css('display')!=='none'){
                return;
            }
            this.fire(Dropdown.FIRES.beforeFocus);
            if(mode==1){
                el.one('.dropdown-hd').addClass("dropdown-hd-active");
            }
            ul.css({'display':'block'});
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
                el = this.get('el'),
                ul = el.one('.dropdown-list');
            if(ul.css('display')==='none'){
                return;
            }   
            el.all('.dropdown-item').removeClass('.dropdown-itemover');
            this.fire(Dropdown.FIRES.beforeBlur);
            if(mode==1){
                el.one('.dropdown-hd').removeClass("dropdown-hd-active");
            }
            ul.css('display', 'none');
            this.fire(Dropdown.FIRES.blur);
        },
        /**
         * 选中对应值的项
         * @param  {String} v 值
         */
        select:function(v){
            var self = this,
                el = this.get('el'),
                items = el.all('.dropdown-item'),
                selectedItem;

            if(typeof v == 'undefined'){
                var data = {};
                items.each(function(item){
                    if(item.hasClass('dropdown-itemselected')){
                        var dropdownTextNode = el.one('.dropdown-text');
                        var selectNode = item.one('span');
                        data = {
                            value: selectNode.attr('value')||'',
                            text: selectNode.text()
                        }
                    }
                });
                return data;
            }    
            items.each(function(item){
                var selectNode = item.one('span');
                var value=selectNode.attr('value')||'';
                if(value==v){
                    selectedItem = item;
                    return false;
                }
            });
            if(selectedItem){
                self._select(selectedItem);
            }
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
            },
            keydown:function(e){
                var self = this,
                    el = self.get('el');
                switch (e.keyCode) {
                    case 9:
                    case 27:
                        self.blur();
                        break;
                    case 13:
                        self.__show = true;
                        var selectedItem = el.one('.dropdown-itemover');
                        self.blur();
                        if(!selectedItem||selectedItem.hasClass('dropdown-itemselected')){
                            return;
                        }
                        self._select(selectedItem);
                        break;
                    case 38:
                        //up
                        e.preventDefault();
                        self.focus();
                        var item = el.one('.dropdown-itemover')||el.one('.dropdown-itemselected')||el.one('.dropdown-item');
                        var hoverItem;
                        if(item.prev()){
                            hoverItem = item.prev();
                        }
                        else{
                            var items = el.all('.dropdown-item');
                            hoverItem = items.item(items.length-1)
                        }
                        self._hover(hoverItem,true);
                        break;
                    case 40:
                        //down
                        e.preventDefault();
                        self.focus();
                        var item = el.one('.dropdown-itemover')||el.one('.dropdown-itemselected')||el.one('.dropdown-item');
                        var hoverItem;
                        if(item.next()){
                            hoverItem = item.next();
                        }
                        else{
                            hoverItem = el.one('.dropdown-item')
                        }
                        self._hover(hoverItem,true);
                    break;
                    default:
                        var code = e.keyCode;
                        if((code>=48&&code<=57)||(code>=65&&code<=90)){
                            var c = String.fromCharCode(code).toLowerCase();
                            e.preventDefault();
                            self.focus();
                            var hoverItem;
                            var item = el.one('.dropdown-itemover')||el.one('.dropdown-itemselected');
                            if(item&&item.one('span').text().charAt(0).toLowerCase()==c){
                                item = item.next();
                                if(item&&item.one('span').text().charAt(0).toLowerCase()==c){
                                    hoverItem = item;
                                }
                            }
                            if(!hoverItem){
                                el.all('.dropdown-item').each(function(item){
                                    if(item&&!item.hasClass('.dropdown-itemover')&&!item.hasClass('.dropdown-itemselected')
&&item.one('span').text().charAt(0).toLowerCase()==c){
                                        hoverItem = item;
                                        return false;
                                    }
                                })
                            }
                            if(hoverItem){
                                self._hover(hoverItem,true);
                            }
                        }
                    break;

                }
            }
        },
        ".dropdown-hd": {
            click: function(e) {
                var mode = this.get('mode');
                if(mode==1){
                    var el = this.get('el').one('.dropdown-list');
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
                var self = this;
                self.__show = true;
                var el = self.get('el');
                var selectedItem = S.one(e.currentTarget);
                self.blur();
                if(selectedItem.hasClass('dropdown-itemselected')){
                    return;
                }
                
                self._select(selectedItem);
            },
            mouseenter: function(e) {
                var currentTarget = S.one(e.currentTarget);
                this._hover(currentTarget);
            },
            mouseleave: function(e) {
                var currentTarget = S.one(e.currentTarget);
                currentTarget.removeClass('dropdown-itemover');
            }
        }
    };

    

    S.augment(Dropdown,Dropdown.METHODS);
    return Dropdown;
}, {
    requires: ["brix/core/brick"]
});
