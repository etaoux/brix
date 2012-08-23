KISSY.add("brix/gallery/breadcrumbs/index", function(S, Brick) {
    function Breadcrumbs() {
        Breadcrumbs.superclass.constructor.apply(this, arguments);
        /*var self = this;
        S.one(document).on('click', function() {
                if (!self.__show) {
                    var el = self.get('el');
                    el.all('.dropdown-list').css('display', 'none');
                    el.all('.dropdown-a').removeClass('dropdown-aactive');
                }
                self.__show = false;
        });*/
    }
    Breadcrumbs.ATTRS = {

    }
    Breadcrumbs.ATTACH = {
        ".dropdown": {
            mouseenter: function(e) {
                S.one(e.currentTarget).addClass('dropdownfocus');
            },
            mouseleave: function(e) {
                if(!this.__show&&S.one(e.currentTarget).one('.dropdown-list').css('display')=='none'){
                    S.one(e.currentTarget).removeClass('dropdownfocus');
                }
            },
            click: function(e) {
                this.__show = true;
                S.one(e.currentTarget).addClass('dropdownfocus');
            }

        }
    };
    Breadcrumbs.DOCATTACH = {
        "":{//空选择器，表示将事件直接绑定在document上
            click:function(e){
                if (!this.__show) {
                    this.get('el').all('.dropdown').removeClass('dropdownfocus');
                }
                this.__show = false;
            }
        }
    }
    S.extend(Breadcrumbs, Brick, {
        
    });







    return Breadcrumbs;
}, {
    requires: ["brix/core/brick"]
});
