KISSY.add("brix/gallery/dropdown/1.0/dropdown", function(S, Brick) {
    function Dropdown() {
        Dropdown.superclass.constructor.apply(this, arguments);
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

    Dropdown.ATTRS = {

    }

    Dropdown.MOTHED = {
        focus: function() {
            var el = this.get('el');
            el.one('.dropdown-list').css('display', 'block');
            el.one('.dropdown-a').addClass('dropdown-aactive');
        },
        blur: function() {
            var el = this.get('el');
            el.one('.dropdown-list').css('display', 'none');
            el.one('.dropdown-a').removeClass('dropdown-aactive');
        }
    }

    Dropdown.DOCATTACH = {
        "body":{
            click:function(e){
                var self = this;
                if (!self.__show) {
                    var el = self.get('el');
                    el.all('.dropdown-list').css('display', 'none');
                    el.all('.dropdown-a').removeClass('dropdown-aactive');
                }
                self.__show = false;
            }
        }
    }
    Dropdown.ATTACH = {
        ".dropdown-a": {
            click: function(e) {
                var el = this.get('el').one('.dropdown-list');
                this.__show = true;
                if (el.css('display') == 'block') {
                    this.blur();
                } else {
                    this.focus();
                }
            },
            mouseenter: function(e) {
                var currentTarget = S.one(e.currentTarget);
                currentTarget.addClass('dropdown-ahover');
            },
            mouseleave: function(e) {
                var currentTarget = S.one(e.currentTarget);
                currentTarget.removeClass('dropdown-ahover');
            }
        },
        ".dropdown-item": {
            click: function(e) {
                this.__show = true;
                var el = this.get('el');
                el.all('.dropdown-itemselected').removeClass('dropdown-itemselected');
                var currentTarget = S.one(e.currentTarget);
                currentTarget.addClass('dropdown-itemselected');
                var spanNode = el.one('.dropdown-span');
                var data = {
                    value: currentTarget.attr('value'),
                    text: currentTarget.text()
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
        events: {
            click: {
                xxClick: function() {
                }
            }
        }
    });

    S.augment(Dropdown,Dropdown.MOTHED);
    return Dropdown;
}, {
    requires: ["brix/brick","./dropdown.css"]
});
