KISSY.add('brix/gallery/searchbox/index', function (S, Brick, Node) {
    var $ = Node.all;
    var D = S.DOM;//这三行为了修复淘吧编辑器引入kissy1.1.7 重新覆盖DOM和Event
    var E = S.Event;

    //TODO:
    var count = 0;

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
        }

    };

    Searchbox.ATTACH = {

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
                var target = e.currentTarget;
                var searchboxOuter = this.searchObj.searchboxOuter;
                if (!D.hasClass(searchboxOuter, 'focus')) {
                    D.addClass(searchboxOuter, 'focus');
                }
                D.addClass(D.prev(target), 'hide');
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
                self._focusInput();

            }
        }

    };

    Searchbox.METHOD = {
        _focusInput:function () {
            var self = this;
            var s = self.searchObj;
            var ipt = s.input;
            D.val(ipt, '');
            //D.hide(self.btnClear);
            self._hideBtn();
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
            /*if (self.suggest) {
                self.suggest.on('beforeStart', function() {
                    return false;
                });
                self.suggest = undefined;
            }*/

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
                self.parseAction(this.action);
                var stat = D.attr(currentTabA, self.get("stat"));

                //给atpanel发送埋点
                if (S.trim(stat)) {
                    //TODO
                    //S.Stat(stat, true);
                }
                //return self.submited();
                s.searchForm.submit();
            }
        }
    };
    S.extend(Searchbox, Brick, {
        initialize:function () {
            var self = this;
            var searchbox = D.get(self.get("el"));
            var menu = D.get('.searchbox-menu', searchbox);
            var ipt =  D.get(".searchbox-input", searchbox);
            self.searchObj = {
                searchbox:searchbox,
                searchForm:D.get('form', searchbox),
                menu:menu,
                menuSelected:D.get(".s-menu-selected", menu),
                menuContainer:D.get(".s-menu-container", menu),
                menuList:D.get(".s-menu-list", menu),
                menuItems :D.query('li', menu),
                searchboxOuter:D.get('.searchbox-outer', searchbox),
                searchboxInner:D.get('.searchbox-inner', searchbox),
                input:ipt,
                btnClear:D.get(".s-btn-clear", searchbox),
                menuItemCount:D.query('li', menu).length
            };
            self._dealClearBtn();
            self._dealLabel();

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

    S.augment(Searchbox, Searchbox.METHOD);
    return Searchbox;


}, {
    requires:["brix/core/brick", "node"]
});