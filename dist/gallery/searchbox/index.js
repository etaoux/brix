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
        menuItems:{
            value:{}
        },
        menuItemsCount:{
            value:{}
        },
        prex: {
            value: 'bx-searchbox-'
        },
        el:{
            value:'body'
        }

    };

    Searchbox.DOCATTACH = {

        '.searchbox-menu':{
            mouseenter:function (e) {
                e.preventDefault();
                var self = this;
                var target = e.currentTarget;
                var searchbox = D.parent(target, ".J_searchbox");
                var menuContainer = D.get(".s-menu-container", target);
                var menuList = D.get(".s-menu-list", target);
                var searchboxid = searchbox.id;
                var menuItemCount = self.get("menuItemsCount")[searchboxid];
                D.addClass(target, 'expand');
                D.height(menuContainer, 24 * menuItemCount + 13);
                D.height(menuList, 24 * menuItemCount + 10);
                D.addClass(D.get('.searchbox-inner', searchbox), 'expandmenu');
                var searchboxOuter = D.get('.searchbox-outer', searchbox);
                if (!D.hasClass(searchboxOuter, 'focus')) {
                    D.addClass(searchboxOuter, 'focus');
                }
            },
            mouseleave:function (e) {

                e.preventDefault();
                /*
                 self.searchInput.focus();
                 */
                var self = this;
                var target = e.currentTarget;
                self._collapse(target);
            }

        },
        '.searchbox-input':{
            focus:function (e) {
                var target = e.currentTarget;
                var searchbox = D.parent(target, ".J_searchbox");
                var searchboxOuter = D.get('.searchbox-outer', searchbox);
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
                var searchbox = D.parent(target, ".J_searchbox");
                var searchboxOuter = D.get('.searchbox-outer', searchbox);
                var menu = D.get('.searchbox-menu', searchbox);
                if (D.hasClass(searchboxOuter, 'focus') && !D.hasClass(menu, 'expand')) {
                    D.removeClass(searchboxOuter, 'focus');
                }
            },
            keyup: function(e) {
                console.log(1);
                var self = this;
                var target = e.currentTarget;
                var searchbox = D.parent(target, ".J_searchbox");
                self._dealClearBtn(target, searchbox);
            },
            keydown: function(e) {
                if(e.keyCode == 13){
                    e.halt(true);
                    //TODO:
                    //self.fireEvent(self.searchForm, 'submit');
                }
            }
        },
        '.search-label':{
            click:function (e) {
                var target = e.currentTarget;
                E.fire(D.next(target), 'focus');
            }
        },
        '.s-btn-clear': {
            click: function(e) {
                var self =  this;
                var target = e.currentTarget;
                var searchbox = D.parent(target, ".J_searchbox");
                var ipt = D.get(".searchbox-input", searchbox);
                D.val(ipt, '');
                //D.hide(self.btnClear);
                self._hideBtn(target);
                ipt.focus();
            }
        }

    };

    Searchbox.METHOD = {
        _collapse:function (target) {
            var searchbox = D.parent(target, ".J_searchbox");
            var menuContainer = D.get(".s-menu-container", target);
            var menuList = D.get(".s-menu-list", target);
            D.removeClass(target, 'expand');
            D.height(menuContainer, 0);
            D.height(menuList, 0);
            D.removeClass(D.get('.searchbox-inner', searchbox), 'expandmenu');
        },
        _dealClearBtn: function(ipt, searchbox) {
            var btnClear = D.get(".s-btn-clear", searchbox);
            if (ipt.value !== '') {
                //D.show(btnClear);
                this._showBtn(btnClear);
            } else {
                //D.hide(btnClear);
                this._hideBtn(btnClear);
            }
        },
        _dealLabel: function(ipt) {
            var label = D.prev(ipt);
            if (ipt.value === '') {
                D.removeClass(label, 'hide');
            } else {
                D.addClass(label, 'hide');
            }
        },
        _hideBtn:function (btn) {
            D.removeClass(btn, "btn-show");
            D.addClass(btn, "btn-hide");
        },

        _showBtn:function (btn) {
            D.removeClass(btn, "btn-hide");
            D.addClass(btn, "btn-show");
        },
        _createSearchboxId:function () {
            return this.get('prex') + ++count;
        }
    };
    S.extend(Searchbox, Brick, {
        initialize:function () {
            var self = this;
            var searchboxs = D.query(".J_searchbox");
            for (var i = 0; i < searchboxs.length; i++) {
                var item = searchboxs[i];
                item.id = self._createSearchboxId();
                var menu = D.get(".searchbox-menu", item);
                var count = D.query('li', menu).length;
                self.get("menuItemsCount")[item.id] = count;
                ////
                var ipt = D.get(".searchbox-input", item);
                self._dealClearBtn(ipt, item);
                self._dealLabel(ipt);
            }
            console.log(self.get("menuItemsCount"));

            if (S.UA.ie && S.UA.ie == 6) {
                E.delegate('html', 'mouseenter mouseleave', '.bx-tips-close', function (e) {
                    if (e.type === 'mouseenter') {
                        D.addClass(e.currentTarget, 'hover');
                    } else {
                        D.removeClass(e.currentTarget, 'hover');
                    }
                });
            }
        },
        destructor:function () {

        }
    });

    S.augment(Searchbox, Searchbox.METHOD);
    return Searchbox;


}, {
    requires:["brix/core/brick", "node"]
});