KISSY.add("brix/gallery/dropdown/index", function(S, Brick) {
    function Dropdown() {
        Dropdown.superclass.constructor.apply(this, arguments);
    }
    Dropdown.ATTRS = {

    }

    Dropdown.METHOD = {
        focus: function() {
            var el = this.get('el');
            var w = el.one('.dropdown-hd').outerWidth();
            el.one('.dropdown-list').css({'display':'block',width:w+'px'});
        },
        blur: function() {
            var el = this.get('el');
            el.one('.dropdown-list').css('display', 'none');
        }
    }

    Dropdown.DOCATTACH = {
        "":{//空选择器，表示将事件直接绑定在document上
            click:function(e){
                var self = this;
                if (!self.__show) {
                    var el = self.get('el');
                    el.all('.dropdown-list').css('display', 'none');
                }
                self.__show = false;
            }
        }
    }
    Dropdown.ATTACH = {
        ".dropdown-hd": {
            click: function(e) {
                var el = this.get('el').one('.dropdown-list');
                this.__show = true;
                if (el.css('display') == 'block') {
                    this.blur();
                } else {
                    this.focus();
                }
            }
        },
        ".dropdown-item": {
            click: function(e) {
                this.__show = true;
                var el = this.get('el');
                el.all('.dropdown-itemselected').removeClass('dropdown-itemselected');
                var currentTarget = S.one(e.currentTarget);
                currentTarget.addClass('dropdown-itemselected');
                var spanNode = el.one('.dropdown-text');
                var data = {
                    value: currentTarget.attr('value'),
                    text: currentTarget.one('span').text()
                }
                spanNode.attr('value', data.value);
                spanNode.text(data.text);
                this.blur();
                this.fire('selected', data);
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

    S.augment(Dropdown,Dropdown.METHOD);
    return Dropdown;
}, {
    requires: ["brix/core/brick","./dropdown.css"]
});
