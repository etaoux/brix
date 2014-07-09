KISSY.add('brix/gallery/searchbox/index', function (S, Brick) {
    /**
     * 搜索框
     * <br><a href="../demo/gallery/searchbox/searchbox.html" target="_blank">Demo</a>
     * @class Brix.Gallery.Searchbox
     * @extends Brix.Brick
     */
    var Searchbox = Brick.extend({
        bindUI:function () {
            var self = this;
            self.menu = self.get('el').one('.s-menu');
            self.form = self.get('el').one('form');
            self.ipt = self.get('el').one('.searchbox-input');
            self.fire('afterLoad');
        },
        destructor:function () {

        },
        //解析action值，根据指定href创建需要的input hidden串
        _parseAction: function(form, action) {//{{{
            if (action.indexOf('?') !== -1) {
                var search = action.substring(action.indexOf('?') + 1, action.length).split('&');
                for (var i = 0, l = search.length; i < l; i++) {
                    if (S.trim(search[i]) === '') continue;
                    var kv = search[i].split('=');
                    this._writeHiddenInput(form, kv[0], kv[1]);
                }
            }
        },
        //写入input hidden串
        _writeHiddenInput: function(form, key, value) {//{{{
            var hiddenInput = form[key];
            if (hiddenInput) {
                hiddenInput.value = value;
            } else {
                hiddenInput = S.DOM.create('<input type="hidden" name="' + key + '" value="' + value + '" />');
                form.appendChild(hiddenInput);
            }
            return hiddenInput;
        },
        //初始化搜索下拉
        _initSuggest: function(ipt, suggestApi) {
            var self = this;
            self.suggest = new S.Suggest(ipt, suggestApi, {
                resultFormat: '%result%',
                offset: 0
            });

            self.suggest.on('beforeShow', function() {//{{{
                self._keyword();
            });//}}}

            self.suggest.on('itemSelect', function() {//{{{
                //对下拉埋点 透传suggest=0_N & wq=xx到srp中
                var D = S.DOM;
                var selectedItem = this.selectedItem,
                    items = D.query('li', this.containers),
                    searchForm = S.get('form', self.get('el'));
                self._writeHiddenInput(searchForm, 'wq', D.attr(selectedItem, 'key'));
                self._writeHiddenInput(searchForm, 'suggest', '0_' + S.indexOf(selectedItem, items));
            });//}}}
            //空query不提交表单
            self.suggest.on('beforeSubmit', function() {
                if (ipt.value === '') {
                    return false;
                };
            });
        },//}}}
        /**
         * 关键词后缀加粗显示
         * @private
         */
        _keyword: function() {//{{{
            var D = S.DOM,
                self = this,
                sug = self.suggest,
                ori = sug.query,
                idx = ori.length;

            S.each(D.query('li', sug.content), function(obj) {
                var k = D.get('.ks-suggest-key', obj), s = D.html(k);
                if (s.indexOf(ori) === 0) {
                    D.html(k, s.substring(0, idx) + '<b>' + s.substring(idx, s.length) + '</b>');
                }
            });
        },
        /**
         * 兼容多浏览器的事件触发器
         * @param {Object} element 触发事件的元素.
         * @param {String} event 事件名.
         */           
        _fireEvent: function(element, event) {
            if (document.createEvent){
                // 标准浏览器使用dispatchEvent方法
                var evt = document.createEvent( 'HTMLEvents' );
                // initEvent接受3个参数：
                // 事件类型，是否冒泡，是否阻止浏览器的默认行为
                evt.initEvent(event, true, true); 
                element.dispatchEvent(evt);
            } else if (document.createEventObject) {
                // IE浏览器支持fireEvent方法
                var evt = document.createEventObject();
                element.fireEvent('on'+event,evt);
            }
        }
    });
    Searchbox.ATTRS = {
        /**
         * 搜索框容器id 默认 #J_searchbox
         * @cfg {String}
         */
        el:{
            value:'#J_searchbox'
        },
        /**
         * 当前选中的tab class 默认selected
         * @cfg {String}
         */
        currentCls: {
            value:'selected'
        },
        /**
         * 搜索下拉api 默认为每个tab的data-suggest-api属性
         * @cfg {String}
         */
        suggestApi: {
            value: 'data-suggest-api'
        },
        /**
         * 当前选中的tab el
         * @type {Object}
         */
        curItem : {
            value: {},
            getter: function() {
                return S.one(this.get('el')).one('.' + this.get('currentCls'));
            }
        },
        /**
         * 下拉菜单容器
         * @type {Object}
         */
        menu : {
            value: {}
        },
        /**
         * 搜索框表单
         * @type {Object}
         */
        form : {
            value: {}
        },
        /**
         * 当前suggest
         * @type {Object}
         */
        suggest: {
            value: {}
        }
    };

    Searchbox.DOCEVENTS = {
        "": { // 空表示事件直接绑定在document上
            click: function(e) {
                var self = this,
                    tar = S.one(e.target);
                //点在搜索框以外
                if(!self.get('el').contains(tar)) {
                    self.hideTabs();
                    self.fire('afterBlur');
                }            
            }
        }
    };

    Searchbox.EVENTS = {
        '.s-menu': {
            mouseenter:function (e) {
                e.preventDefault();
                var self = this,
                    tar = S.one(e.currentTarget),
                    menuList = tar.one('.s-menu-list');
                tar.addClass('expand');
                //height auto 不支持css animation 所以取height value
                /*var h = menuList.height();
                if (!self.menu.h) {
                    self.menu.h = h;
                } */
                //menuList.height(self.menu.h);
            },
            mouseleave:function (e) {
                e.preventDefault();
                var self = this,
                    tar = S.one(e.currentTarget),
                    menuList = tar.one('.s-menu-list');
                tar.removeClass('expand');
                //menuList.height(0);
            }
        },
        '.s-menu-list li' : {
            click: function(e) {
                var self = this, 
                    tar = S.one(e.currentTarget),
                    curCls = self.get("currentCls");

                self.fire('beforeTabChange', {'eventData' : e.currentTarget});                

                //点击本身
                if (tar.hasClass(curCls)) { return; }
                var menuItems = self.get('el').all('li'),
                    menuSelected = self.get('el').one('.s-menu-selected span');
                //点击选中
                menuItems.removeClass(curCls);
                tar.addClass(curCls);
                menuSelected.html(tar.one('a').html());

                self.menu.removeClass('expand');

                if (self.ipt.getDOMNode().value !== '') {
                    self._fireEvent(self.form.getDOMNode(), 'submit');
                } 
            }           
        },
        '.searchbox-input': {
            focus:function (e) {
                var self = this;
                var target = e.currentTarget;
                var suggestApi = self.get('curItem').attr(self.get("suggestApi"));
                //和上次focus使用的suggesetapi缓存对比
                if(self.suggestApi && self.suggestApi !== suggestApi) {
                    self.detach(e.type, arguments.callee);
                    self.suggest.on('beforeStart', function() {
                        return false;
                    });
                    self.suggest = undefined;
                }

                if(suggestApi && (!self.suggestApi || self.suggestApi !== suggestApi)) {
                    S.use('suggest', function() {
                        self._initSuggest(target, suggestApi);
                        //console.log('hastriggler');
                    });
                }
                self.suggestApi = suggestApi;
                self.showTabs();
                self.fire('afterFocus', {'eventData' : target});
            }
        },
        'form': {
            submit: function(e) {
                var self = this;
                self.fire('beforeSubmit', {'eventData' : e.target});

                var currentTabA = self.get('curItem').one('a');
                if (self.ipt.getDOMNode().value === '') {
                    e.halt(true);
                    self.focusInput();
                } else {
                    var action = currentTabA.attr('href'),
                        form = e.target;
                        form.action = action;
                    //不同tab传递不一样的参数，通过a中的href后面的？来配置要传递的参数
                    self._parseAction(form, action);
                }
            }
        }
    };

    Searchbox.METHODS = {
        /**
         * 显示tabs
         * @public
         */
        showTabs: function() {
            var self = this;
            self.form.addClass('s-focus');
        },
        /**
         * 隐藏tabs
         * @public
         */
        hideTabs: function() {
            var self = this;
            self.form.removeClass('s-focus');
        },
        /**
         * 聚焦搜索框
         * @public
         */
        focusInput:function () {
            var self = this;
            self.ipt.getDOMNode().focus();
        }
    };

    Searchbox.FIRES = {
        afterLoad: 'afterLoad', //初始化完成后
        beforeTabChange: 'beforeTabChange', //切换tab后
        beforeSubmit: 'beforeSubmit', //提交表单之前
        afterFocus: 'aferFocus', //focus后 
        afterBlur: 'afterBlur' //失焦后 
    };

    
    S.augment(Searchbox, Searchbox.METHODS);
    return Searchbox;
}, {
    requires:["brix/core/brick"]
});