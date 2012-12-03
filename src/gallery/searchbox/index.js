/*
 * @module placeholder新版 
 * @description 输入框占位符，失焦灰色显示，聚焦空白 
 *   表单提交时，input的值这里不考虑
 * @param {HTMLElement} input element
 * @param {String} labelShowCls:显示placeholder的class
*/
KISSY.add('placeholder', function(S, undefined) {
    var D = S.DOM, E = S.Event,
        placeholder = function(ipt, labelShowCls) {
            if (!ipt) return;
            //判断是否支持placeholder属性
            if ('placeholder' in document.createElement('input')) return;
            var placeholder = D.attr(ipt, 'placeholder'),
                labelShowCls = labelShowCls ? labelShowCls : 'labelshow';
            
            var label = D.create('<label for="' + ipt.id + '">' + placeholder + '</label>');
            D.insertBefore(label, ipt);            

            if (ipt.value === '') {
                D.addClass(label, labelShowCls);
            }

            E.on(ipt, 'keyup', function() {
                if (this.value === '') {
                    D.addClass(label, labelShowCls);
                } else {
                    D.removeClass(label, labelShowCls);
                }
            });
        };
    S.placeholder = placeholder;
});

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
        isSuggest: {
            value: true
        },
        suggestApi: {
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

    Searchbox.FIRES = {
        loaded: 'loaded', //初始化完成后
        tabChange: 'tabChange', //切换tab后
        beforeSubmit: 'beforeSubmit' //提交表单之前
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
        },
        destructor:function () {

        }
    });
    S.augment(Searchbox, Searchbox.METHODS);
    return Searchbox;
}, {
    requires:["brix/core/brick", "node"]
});

/*
 * @module 搜索框组件
 * @description 内部封装了搜索框组件的基本行为/
 *     1.点击各个tab是否直接跳转，由data-redirect属性决定
 *      1.1有query进入相应tab的href进行搜索
 *      1.2空query进入相应tab的data-empty-action页面,如果没有data-empty-action属性则只切换tab停留在页面中，如电影票tab希望空query进入电影票的首页,导购tab进入etao首页,空query商品只是切换tab
 *    2.首页(etao或tba)搜索框需要自动聚焦
 *    3.不同tab需要支持不同数据来源的搜索下拉提示，如导购需要有自己suggestion，淘吧也有计划需要自己的suggestion这个都和商品的suggestion不同。
 *    4.需要统计搜索框检索量（包括点击tab提交+点击淘一淘提交）
 *    5.选择不同tab时提交表单需要传递不同的参数
 */
 

KISSY.add('searchTabBox', function(S, undefined) {
    var D = S.DOM, E = S.Event,

        //搜索框默认配置
        defaultConfig = {
            searchForm: '#J_etaoForm',

            searchInput: '#J_searchIpt',
            autosuggest: 'data-suggest-api', //搜索下拉提示的api，因为接下来etao要加etao的搜索建议，淘吧有淘吧的搜索建议，故提供该api，li上面没有这个没有这个属性，则表示该tab无搜索下拉提示功能
            stat: 'data-stat-submit', //检索量埋点接口 表单提交时发送埋点请求
            emptyAction: 'data-empty-action', //空query页面如何跳转，如果该属性有地址，则跳转到该页面，无此属性则空query不跳转
            redirect: 'data-redirect', //点击tab是否直接提交表单 一般首页不直接跳转 srp页面直接跳转

            labelshowCls: 'labelshow',
            backgroundOuter: '#J_sBgOuter',

            menu: '#J_sMenu',
            menuSelectedItem: '#J_sMenuSelected',
            menuContainer: '#J_sMenuContainer',
            menuList: '#J_sMenuList',
            currentCls: 'selected',
            btnClear: '#J_sBtnClear',
            btnSubmit: '#J_sBtnSubmit',
            isSuggest: true
        },

        searchTabBox = function(cfg) {
            var self = this;
            D = KISSY.DOM;//这三行为了修复淘吧编辑器引入kissy1.1.7 重新覆盖DOM和Event
            E = KISSY.Event;
            KISSY.mix(self, KISSY.EventTarget);

            self.config = cfg = S.merge(defaultConfig, cfg);

            self.event = {
                loaded: 'loaded',
                submited: 'submited',
                tabChange: 'tabChange', //切换tab
                tabChanged: 'tabChanged', //切换tab后、个性化定制接口
                focused: 'focused'
            };

            //判断输入框是否为空
            var isInputEmpty = function() {
                return self.searchInput.value === '';
            };


            //搜索框三要素（ 搜索切换tab、搜索输入框、搜索表单）暴露出去供外部直接使用
            self.searchForm = D.get(self.config.searchForm);
            self.menu = D.get(cfg.menu);
            self.menuContainer = D.get(cfg.menuContainer);
            self.menuList = D.get(cfg.menuList);
            self.menuItems = D.query(cfg.menuList + ' li');
            self.curItem = D.filter(self.menuItems, '.' + cfg.currentCls)[0];
            self.bgOuter = D.get(cfg.backgroundOuter);
            self.searchInput = D.get(cfg.searchInput);
            self.btnClear = D.get(cfg.btnClear);
            self.btnSubmit = D.get(cfg.btnSubmit);
            self.selItem = D.get(self.config.menuSelectedItem);

            //TODO
            if (!(self.searchForm && self.bgOuter && self.searchInput)) return;

            var menuItemCount = self.menuItems.length;

            // show下拉菜单
            E.on(self.menu, 'mouseenter', function(e) {
                e.preventDefault();
                var target = e.currentTarget;
                D.addClass(target, 'expand');
                D.height(self.menuContainer, 26 * menuItemCount + 12);
                D.height(self.menuList, 26 * menuItemCount + 9);
                D.addClass(D.parent(target),'expandmenu');
                if(!D.hasClass(self.bgOuter, 'focus')) {
                    D.addClass(self.bgOuter, 'focus');
                }
            });

            // hide
            E.on(self.menu, 'mouseleave', function(e) {
                e.preventDefault();
                collapse();
                self.searchInput.focus();
            });

            var collapse = function() {
                D.removeClass(self.menu, 'expand');
                D.height(self.menuContainer, 0);
                D.height(self.menuList, 0);
                D.removeClass(D.parent(self.menu),'expandmenu');
            };
            var hideBtn = function(btn) {
                D.removeClass(btn, "btn-show");
                D.addClass(btn, "btn-hide");
            };

            var showBtn = function(btn) {
                D.removeClass(btn, "btn-hide");
                D.addClass(btn, "btn-show");
            };

            /**
             * 清除输入
             */
            E.on(self.btnClear, 'click', function(e) {
                var ipt = self.searchInput;
                D.val(ipt, '');
                hideBtn(self.btnClear);
                ipt.focus();
            });

            E.on(self.searchInput, 'keyup', function(e) {
                if (self.searchInput.value !== '') {
                    showBtn(self.btnClear);
                } else {
                    hideBtn(self.btnClear);
                }
            });

            //默认初始化下placeholder和清除按钮
            self.fireEvent(self.searchInput, 'keyup');

            E.on(self, self.event.loaded, self.config.loaded);
            //触发loaded事件
            self.loaded();

            E.on(self.menuItems, 'click', function(e) {
                self.tabChange({tar: e.currentTarget, clickE: e});
            });
            var ua = navigator.userAgent.toLowerCase();
            if (ua.match(/iPad/i) == "ipad") {
                E.on(D.prev(self.searchInput, 'label'), 'click', function(e) {
                    self.searchInput.focus();
                });
            }

            //tabChange中执行通用的切换选中tab样式，是否提交表单操作
            E.on(self, self.event.tabChange, function(e) {
                //e.halt(true);
                var isEmpty = isInputEmpty(),

                    //单击触发tabChange的具体的那个li
                    tar = e.eventData.tar;

                //点击本身 跳出
                if (D.hasClass(tar, cfg.currentCls)) {
                    //阻止a链接默认跳转页面
                    e.eventData.clickE.halt(true);
                    return;
                }

                //点击加选中背景
                S.each(self.menuItems, function(tab) {
                    D.removeClass(tab, cfg.currentCls);
                });
                D.addClass(tar, cfg.currentCls);

                collapse();

                D.html(self.selItem, D.html(D.get('a', tar)) + '<i></i>');
                self.searchInput.focus();
                
                //切换tab时，销毁suggest
                if (self.suggest) {
                    self.suggest.on('beforeStart', function() {
                        return false;
                    });
                    self.suggest = undefined;
                }

                self.curItem = tar;

                self.fire(self.event.tabChanged, {'eventData' : tar});

                //点击tab是否直接提交表单
                var isRedirect = S.trim(D.attr(D.get(cfg.menuList), self.config.redirect)) !== 'false';
                if (!isRedirect) {
                    e.eventData.clickE.halt(true);
                    return;
                }

                var currentTabA = D.get('a', self.curItem),
                    emptyAction = S.trim(D.attr(currentTabA, self.config.emptyAction));

                if (!isEmpty) {
                    e.eventData.clickE.halt(true);
                    //有query提交表单
                    self.fireEvent(self.searchForm, 'submit');
                } else {
                    //空query看是否有data-empty-action属性,无此属性不提交
                    if (emptyAction) {
                        D.get('a', self.curItem).href = emptyAction;
                    } else {
                        //阻止a链接click触发的跳转
                        e.eventData.clickE.halt(true);
                    }
                }
            });


            E.on(self.searchForm, 'submit', function(e) {//{{{
                //e.halt(true);
                var isEmpty = isInputEmpty(),
                    currentTabA = D.get('a', self.curItem),
                    emptyAction = S.trim(D.attr(currentTabA, self.config.emptyAction));

                if (isEmpty) {
                    //如果配置了data-emptyAction则空query跳转至emptyAction,否则空query不提交表单
                    if (emptyAction) {
                        self.searchInput.value = '';
                        this.action = emptyAction;
                        D.addClass(self.btnSubmit, 'loading');
                        //return self.submited();
                        self.searchForm.submit();
                    } else {
                        e.halt(true);
                        return false;
                    }

                } else {
                    D.addClass(self.btnSubmit, 'loading');
                    this.action = D.attr(currentTabA, 'href');
                    //不同tab传递不一样的参数，通过a中的href后面的？来配置要传递的参数
                    self.parseAction(this.action);
                    var stat = D.attr(currentTabA, self.config.stat);
                    self.searchForm.submit();
                }
            });//}}}

            E.on(self.searchInput, 'blur', function(e) {
                if(D.hasClass(self.bgOuter, 'focus') && !D.hasClass(self.selItem, 'expand')) {
                    D.removeClass(self.bgOuter, 'focus');
                }
            });

            //focus input时，才加载suggestion.js, 实现按需加载
            //触发suggestion的条件为当前tab存在data-suggest-api
            E.on(self.searchInput, 'focus', function(e) {//{{{
                //e.halt(true);
                if(!D.hasClass(self.bgOuter, 'focus')) {
                    D.addClass(self.bgOuter, 'focus');
                }
                //防止focus重复注册

                if(self.config.isSuggest) {
                    if (self.suggest) {
                        self.detach(e.type, arguments.callee);
                        return;
                    }

                    var suggestApi = D.attr(self.curItem, self.config.autosuggest);

                    if (suggestApi && suggestApi.indexOf('area=etao') > 0) {
                        S.use('suggest', function() {
                            self._initSuggest(suggestApi);
                        });
                    }
                }

                self.focused();
            });//}}}

            //兼容 autofocus html5属性
            var isSupport = 'autofocus' in document.createElement('input'),
                autofoucsData = D.attr(self.searchInput, 'data-autofocus'),
                isAutofocus = (autofoucsData == 'autofocus') || (autofoucsData == true);

            if (isAutofocus) {
                self.searchInput.focus();
            }
            //placeholder
            S.placeholder(self.searchInput);
        };

    S.augment(searchTabBox, {
        loaded: function() {//{{{
            this.fire(this.event.loaded);
        },//}}}

        submited: function() {//{{{
            return this.fire(this.event.submited);
        },//}}}

        tabChange: function(eventData) {//{{{
            this.fire(this.event.tabChange, {'eventData' : eventData});
        },//}}}

        focused: function() {//{{{
            this.fire(this.event.focused);
        },//}}}

        //初始化搜索下拉
        _initSuggest: function(suggestApi) {
            var self = this;
            self.suggest = new S.Suggest(this.searchInput, suggestApi, {
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
                //对下拉埋点 透传suggest=0_N & wq=xx到srp中
                var selectedItem = this.selectedItem,
                    items = D.query('li', this.containers);

                self.writeHiddenInput(self.searchForm, 'wq', D.attr(selectedItem, 'key'));
                self.writeHiddenInput(self.searchForm, 'suggest', '0_' + S.indexOf(selectedItem, items));

                //etaobook类目直达比价页面 需要传参数 epid=xx&v=product&p=detail
                var epid = D.attr(selectedItem, 'data-epid');
                if (epid) {
                    self.writeHiddenInput(self.searchForm, 'epid', epid);
                    self.writeHiddenInput(self.searchForm, 'v', 'product');
                    self.writeHiddenInput(self.searchForm, 'p', 'detail');
                }
            });//}}}

            self.suggest.on('beforeSubmit', function() {
                if (self.searchInput.value === '') {
                    return false;
                };
            });
        },

        /**
         * 关键词后缀加粗显示
         */
        _keyword: function() {//{{{
            var self = this,
                sug = this.suggest,
                ori = sug.query,
                idx = ori.length;

            S.each(D.query('li', sug.content), function(obj) {
                var k = D.get('.ks-suggest-key', obj), s = D.html(k);
                if (s.indexOf(ori) === 0) {
                    D.html(k, s.substring(0, idx) + '<b>' + s.substring(idx, s.length) + '</b>');
                }
            });
        },//}}}

        //写入input hidden串
        writeHiddenInput: function(form, key, value) {//{{{
            var hiddenInput = form[key];
            if (hiddenInput) {
                hiddenInput.value = value;
            } else {
                hiddenInput = D.create('<input type="hidden" name="' + key + '" value="' + value + '" />');
                form.appendChild(hiddenInput);
            }
            return hiddenInput;
        },//}}}

        //解析action值，根据指定href创建需要的input hidden串
        parseAction: function(action) {//{{{
            if (action.indexOf('?') !== -1) {
                var search = action.substring(action.indexOf('?') + 1, action.length).split('&');
                for (var i = 0, l = search.length; i < l; i++) {
                    if (S.trim(search[i]) === '') continue;
                    var kv = search[i].split('=');
                    this.writeHiddenInput(this.searchForm, kv[0], kv[1]);
                }
            }
        },//}}}

        /**
         * 兼容多浏览器的事件触发器
         * @param {Object} el 触发事件的元素.
         * @param {String} event 事件名.
         */           
        fireEvent: function(el, event) {
            if (document.createEvent) {
                var e = document.createEvent('HTMLEvents');
                e.initEvent(event, false, true);
                el.dispatchEvent(e);
            } else if (document.createEventObject) {
                var evt = document.createEventObject(event);
                el.fireEvent('on' + event, evt);
            }
        }

    });

    S.mix(searchTabBox.prototype, S.EventTarget);
    S.searchTabBox = searchTabBox;
}, {
    requires:["brix/core/brick", "node"]
});
