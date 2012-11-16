KISSY.add('brix/gallery/searchbox/index', function (S, Brick, Node) {
    var $ = Node.all;
    var D = S.DOM;//这三行为了修复淘吧编辑器引入kissy1.1.7 重新覆盖DOM和Event
    var E = S.Event;

    //TODO:
    var count = 0;

    /**
     * 搜索框
     * <br><a href="../demo/gallery/searchbox/searchbox.html" target="_blank">Demo</a>
     * @class Brix.Gallery.Searchbox
     * @extends Brix.Brick
     */
    function Searchbox() {
        Searchbox.superclass.constructor.apply(this, arguments);
    }

    Searchbox.ATTRS = {
        el:{
            value:'#J_searchbox'
        },
        currentCls: {
            value:'selected'
        },
        redirect: {
            value: 'data-redirect'
        },
        emptyAction: {
            value: 'data-empty-action'
        },
        curItem : {
            value: {}
        },
        stat: {
            value: 'data-stat-submit'
        },
        isSuggest: {
            value: true
        },
        autosuggest: {
            value: 'data-suggest-api'
        }

    };

    Searchbox.EVENTS = {

        '.searchbox-menu':{
            mouseenter:function (e) {
                e.preventDefault();
                var self = this;
                var s = self.searchObj;
                var target = e.currentTarget;
                D.addClass(target, 'expand');
                D.height(s.menuContainer, 24 * s.menuItemCount + 13);
                D.height(s.menuList, 24 * s.menuItemCount + 10);
                D.addClass(s.searchboxInner, 'expandmenu');
                var searchboxOuter = s.searchboxOuter;
                if (!D.hasClass(searchboxOuter, 'focus')) {
                    D.addClass(searchboxOuter, 'focus');
                }
            },
            mouseleave:function (e) {
                e.preventDefault();
                var self = this;
                var target = e.currentTarget;
                self._collapse();
                self._focusInput();
            }

        },
        'li' : {
            'click': function(e) {
                this.tabChange(e);
            }
        },
        '.searchbox-input':{
            focus:function (e) {
                var self = this;
                var target = e.currentTarget;
                var searchboxOuter = this.searchObj.searchboxOuter;
                if (!D.hasClass(searchboxOuter, 'focus')) {
                    D.addClass(searchboxOuter, 'focus');
                }
                D.addClass(D.prev(target), 'hide');
                if(self.get("isSuggest")) {
                    if (self.suggest) {
                        self.detach(e.type, arguments.callee);
                        return;
                    }
                    var suggestApi = D.attr(self.curItem, self.get("autosuggest"));
                    console.log(suggestApi);
                    if (suggestApi && suggestApi.indexOf('area=etao') > 0) {
                        S.use('suggest', function() {
                            self._initSuggest(suggestApi);
                        });
                    }
                }
            },
            blur:function (e) {
                var target = e.currentTarget;
                if (target.value === '') {
                    D.removeClass(D.prev(target), 'hide');
                }
                var searchboxOuter = this.searchObj.searchboxOuter;
                var menu = this.searchObj.menu;
                if (D.hasClass(searchboxOuter, 'focus') && !D.hasClass(menu, 'expand')) {
                    D.removeClass(searchboxOuter, 'focus');
                }
            },
            keyup:function (e) {
                var self = this;
                self._dealClearBtn();
            },
            keydown:function (e) {
                if (e.keyCode == 13) {
                    e.halt(true);
                    //TODO:
                    //self.fireEvent(self.searchForm, 'submit');
                    self.submit();
                }
            }
        },
        '.search-label':{
            click:function (e) {
                var target = e.currentTarget;
                E.fire(D.next(target), 'focus');
            }
        },
        '.s-btn-clear':{
            click:function (e) {
                var self = this;
                var s = self.searchObj;
                var ipt = s.input;
                D.val(ipt, '');
                self._hideBtn();
                self._focusInput();

            }
        },
        '.search-form': {
            submit: function(e) {
                //e.halt(true);
                var self = this;
                self.submit(e);
            }
        }

    };

    Searchbox.METHODS = {
        _focusInput:function () {
            var self = this;
            var s = self.searchObj;
            var ipt = s.input;
            //D.hide(self.btnClear);
            ipt.focus();
        },
        _collapse:function () {
            var s = this.searchObj;
            D.removeClass(s.menu, 'expand');
            D.height(s.menuContainer, 0);
            D.height(s.menuList, 0);
            D.removeClass(s.searchboxInner, 'expandmenu');
        },
        _dealClearBtn:function () {
            var ipt = this.searchObj.input;
            if (ipt.value !== '') {
                //D.show(btnClear);
                this._showBtn();
            } else {
                //D.hide(btnClear);
                this._hideBtn();
            }
        },
        _dealLabel:function () {
            var ipt = this.searchObj.input;
            var label = D.prev(ipt);
            if (ipt.value === '') {
                D.removeClass(label, 'hide');
            } else {
                D.addClass(label, 'hide');
            }
        },
        _hideBtn:function () {
            var btn = this.searchObj.btnClear;
            D.removeClass(btn, "btn-show");
            D.addClass(btn, "btn-hide");
        },

        _showBtn:function () {
            var btn = this.searchObj.btnClear;
            D.removeClass(btn, "btn-hide");
            D.addClass(btn, "btn-show");
        },
        tabChange:function(e) {
            var self = this;
            var s = self.searchObj,

            //单击触发tabChange的具体的那个li
                tar = e.currentTarget;
            var curCls = self.get("currentCls");
            //点击本身 跳出
            if (D.hasClass(tar, curCls)) {
                //阻止a链接默认跳转页面
                e.halt(true);
                return;
            }

            //点击加选中背景
            S.each(s.menuItems, function(tab) {
                D.removeClass(tab, curCls);
            });
            D.addClass(tar, curCls);

            self._collapse();

            D.html(s.menuSelected, D.html(D.get('a', tar)) + '<i></i>');
            s.input.focus();

            //切换tab时，销毁suggest //TODO:
            if (self.suggest) {
                self.suggest.on('beforeStart', function() {
                    return false;
                });
                self.suggest = undefined;
            }

            self.curItem = tar;

            //self.fire(self.event.tabChanged, {'eventData' : tar});

            //点击tab是否直接提交表单
            var isRedirect = S.trim(D.attr(D.get(s.menuList), self.get("redirect"))) !== 'false';
            if (!isRedirect) {
                e.halt(true);
                return;
            }

            var currentTabA = D.get('a', self.curItem),
                emptyAction = S.trim(D.attr(currentTabA, self.get("emptyAction")));

            if (s.input.value !== '') {
                e.halt(true);
                //有query提交表单 TODO:
                //self.fireEvent(self.searchForm, 'submit');
                self.submit();
            } else {
                //空query看是否有data-empty-action属性,无此属性不提交
                if (emptyAction) {
                    D.get('a', self.curItem).href = emptyAction;
                } else {
                    //阻止a链接click触发的跳转
                    e.halt(true);
                }
            }
        },
        submit: function(e) {
            //e.halt(true);
            var self = this;
            var s = self.searchObj;
            var currentTabA = D.get('a', self.curItem),
                emptyAction = S.trim(D.attr(currentTabA, self.get("emptyAction")));

            if (s.input.value === '') {
                //如果配置了data-emptyAction则空query跳转至emptyAction,否则空query不提交表单
                if (emptyAction) {
                    s.input.value = '';
                    self.action = emptyAction;

                    //D.addClass(s.btnSubmit, 'loading'); TODO:
                    //return self.submited();
                    s.searchForm.submit();
                } else {
                    e.halt(true);
                    s.input.focus();
                }

            } else {
                //D.addClass(s.btnSubmit, 'loading'); TODO:
                self.action = D.attr(currentTabA, 'href');
                //不同tab传递不一样的参数，通过a中的href后面的？来配置要传递的参数
                self._parseAction(self.action);
                var stat = D.attr(currentTabA, self.get("stat"));

                //给atpanel发送埋点
                if (S.trim(stat)) {
                    //TODO
                    //S.Stat(stat, true);
                }
                //return self.submited();
                s.searchForm.submit();
            }
        },
        //解析action值，根据指定href创建需要的input hidden串
        _parseAction: function(action) {//{{{
            if (action.indexOf('?') !== -1) {
                var search = action.substring(action.indexOf('?') + 1, action.length).split('&');
                for (var i = 0, l = search.length; i < l; i++) {
                    if (S.trim(search[i]) === '') continue;
                    var kv = search[i].split('=');
                    this._writeHiddenInput(this.searchObj.searchForm, kv[0], kv[1]);
                }
            }
        },
        //写入input hidden串
        _writeHiddenInput: function(form, key, value) {//{{{
            var hiddenInput = form[key];
            if (hiddenInput) {
                hiddenInput.value = value;
            } else {
                hiddenInput = D.create('<input type="hidden" name="' + key + '" value="' + value + '" />');
                form.appendChild(hiddenInput);
            }
            return hiddenInput;
        },
        //初始化搜索下拉
        _initSuggest: function(suggestApi) {
            var self = this;
            var s = self.searchObj;
            var stat = self.get("stat");
            self.suggest = new S.Suggest(s.input, suggestApi, {
                resultFormat: '%result%',
                offset: 0
            });

            self.suggest.on('dataReturn', function(ev) {
                self.suggest.etaobook = ev.data.etaobook;
                self.suggest.results = ev.data.result;
            });

            self.suggest.on('beforeShow', function() {//{{{
                var etaoBook = self.suggest.etaobook, bookString = '';
                if (etaoBook && etaoBook.length > 0) {
                    S.each(etaoBook, function(book, i) {
                        bookString += '<li class="ks-suggest-extra" key="' + etaoBook[i][0] + '" data-epid="' + etaoBook[i][1] +
                            '"><span class="ks-suggest-key">' + etaoBook[i][0] +
                            '</span><span class="suggest-star">★</span><span class="suggest-author">' + etaoBook[i][2] +
                            '</span><span class="suggest-pub">' + etaoBook[i][3] +
                            '</span><span class="suggest-time">' + etaoBook[i][4] + '</span></li>';
                    });

                    if (self.suggest.results.length === 0) {
                        D.html(self.suggest.content, '<ol></ol>');
                    }

                    if (bookString) {
                        D.append(D.create(bookString), self.suggest.content.firstChild);
                    }
                }
                //和query不相同的字符加粗
                self._keyword();
            });//}}}

            self.suggest.on('itemSelect', function() {//{{{
                //对下拉埋点
                var selectedItem = this.selectedItem,
                    items = D.query('li', this.containers),
                    itemStatObj = {};

                itemStatObj['q'] = this.query;//用户输入
                itemStatObj['wq'] = D.attr(selectedItem, 'key'); //用户输入的query
                itemStatObj['n'] = S.indexOf(selectedItem, items);//第几个query
                var currentTabA = D.get('a', self.curItem);
                D.attr(currentTabA, stat, D.attr(currentTabA, stat) + '&' + S.param(itemStatObj));

                //etaobook类目直达比价页面 需要传参数 epid=xx&v=product&p=detail
                var epid = D.attr(selectedItem, 'data-epid');
                if (epid) {
                    self._writeHiddenInput(s.searchForm, 'epid', epid);
                    self._writeHiddenInput(s.searchForm, 'v', 'product');
                    self._writeHiddenInput(s.searchForm, 'p', 'detail');
                }
            });//}}}
        },
        /**
         * 关键词后缀加粗显示
         * @private
         */
        _keyword: function() {//{{{
            var self = this,
                sug = self.suggest,
                ori = sug.query,
                idx = ori.length;

            S.each(D.query('li', sug.content), function(obj) {
                var k = D.get('.ks-suggest-key', obj), s = D.html(k);
                if (s.indexOf(ori) === 0) {
                    D.html(k, s.substring(0, idx) + '<b>' + s.substring(idx, s.length) + '</b>');
                }
            });
        }
    };
    S.extend(Searchbox, Brick, {
        initialize:function () {
            var self = this;
            var searchbox = D.get(self.get("el"));
            var menu = D.get('.searchbox-menu', searchbox);
            var ipt =  D.get(".searchbox-input", searchbox);
            var menuItems = D.query('li', menu);
            self.searchObj = {
                searchbox:searchbox,
                searchForm:D.get('form', searchbox),
                menu:menu,
                menuSelected:D.get(".s-menu-selected", menu),
                menuContainer:D.get(".s-menu-container", menu),
                menuList:D.get(".s-menu-list", menu),
                menuItems :menuItems,
                searchboxOuter:D.get('.searchbox-outer', searchbox),
                searchboxInner:D.get('.searchbox-inner', searchbox),
                input:ipt,
                btnClear:D.get(".s-btn-clear", searchbox),
                menuItemCount:D.query('li', menu).length
            };
            self.curItem = D.filter(menuItems, '.' + self.get("currentCls"))[0];
            self._dealClearBtn();
            //self._dealLabel();
            //兼容 autofocus html5属性
            var isSupport = 'autofocus' in document.createElement('input'),
                autofoucsData = D.attr(ipt, 'data-autofocus'),
                isAutofocus = (autofoucsData == 'autofocus') || (autofoucsData == true);

            if (!isSupport || !isAutofocus) {
                self._dealLabel();
            }

            if (isAutofocus) {
                ipt.focus();
            }

            /*if (S.UA.ie && S.UA.ie == 6) {
             E.delegate('html', 'mouseenter mouseleave', '.bx-tips-close', function (e) {
             if (e.type === 'mouseenter') {
             D.addClass(e.currentTarget, 'hover');
             } else {
             D.removeClass(e.currentTarget, 'hover');
             }
             });
             }*/
        },
        destructor:function () {

        }
    });

    S.augment(Searchbox, Searchbox.METHODS);
    return Searchbox;


}, {
    requires:["brix/core/brick", "node"]
});