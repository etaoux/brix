KISSY.add('brix/gallery/calendar/time', function(S, Brick) {
    var LIST = {
        h: ['00','01','02','03','04','05','06','07','08','09','10','11','12','13','14','15','16','17','18','19','20','21','22','23'],
        m: ['00','10','20','30','40','50'],
        s: ['00','10','20','30','40','50']
    }
    function Time() {
        Time.superclass.constructor.apply(this, arguments);
    }
    Time.ATTRS = {
        time:{
            value:new Date()
        },
        status:{
            value:'s'
        },
        autoRender:{
            value:true
        },
        tmpl:{
            value:'<div bx-name="time" class="calendar-time">'+
                        '时间：<span class="h">{{h}}</span>:<span class="m">{{m}}</span>:<span class="s">{{s}}</span>'+
                        '<div class="calendar-time-updown">'+
                            '<i class="iconfont u">&#456</i><i class="iconfont d">&#459</i>'+
                        '</div>'+
                    '</div>'+
                    '<div class="calendar-time-popup">'+
                        '<div bx-tmpl="time" bx-datakey="list" class="calendar-time-popup-bd">'+
                            '{{#list}}'+
                            '<a class="item">{{.}}</a>'+
                            '{{/list}}'+
                        '</div>'+
                        '<i class="iconfont icon-close">&#223</i>'+
                    '</div>'
        },
        data:{
            valueFn: function() {
                var self = this,
                    date = self.get('time');
                return {
                    h: date.getHours(),
                    m:date.getMinutes(),
                    s:date.getSeconds()
                };
            }
        }
    };

    Time.ATTACH = {
        'span':{
            click:function(e){
                var self = this, node = S.one(e.currentTarget);
                node.parent().all('span').removeClass('on');
                node.addClass('on');
                if(node.hasClass('h')){
                    self.set('status','h');
                }
                else if(node.hasClass('m')){
                    self.set('status','m');
                }
                else{
                    self.set('status','s');
                }
                var status = self.get('status');
                self.setChunkData('list',LIST[status]);
                self.get('el').one('.calendar-time-popup').css({display:'block'});
            }
        },
        '.icon-close':{
            click:function(e){
                var self = this;
                self._hideTimePopup();
            }
        },
        '.item':{
            click:function(e){
                var self = this, 
                    node = S.one(e.currentTarget),
                    status = self.get('status');
                self._setTime(status,node.html());
                self._hideTimePopup();
            }
        },
        '.u':{
            click:function(e){
                var self = this, 
                    status = self.get('status'),
                    v = self._getTime(status);
                v++;
                self._setTime(status,v);
            }
        },
        '.d':{
            click:function(e){
                var self = this, 
                    status = self.get('status'),
                    v = self._getTime(status);
                v--;
                self._setTime(status,v);
            }
        },
        '':{
            keyup:function(e){
                var self = this, 
                    status = self.get('status'),
                    v = self._getTime(status);
                if (e.keyCode == 38 || e.keyCode == 37) {//up or left
                        e.preventDefault();
                        v++;
                        self._setTime(status,v);
                    }
                    if (e.keyCode == 40 || e.keyCode == 39) {//down or right
                        //e.stopPropagation();
                        e.preventDefault();
                        v--;
                        self._setTime(status,v);
                    }
            }
        }
    };

    Time.METHOD = {

    };

    Time.FIRES = {
        timeSelect: 'timeSelect'
    };
    S.extend(Time, Brick, {
        initialize: function() {
            var self = this;
        },

        _setTime : function(status, v) {
            var self = this,
                time = self.get('time'),el = self.get('el');
            v = Number(v);
            switch (status) {
                case 'h':
                    time.setHours(v);
                    break;
                case 'm':
                    time.setMinutes(v);
                    break;
                case 's':
                    time.setSeconds(v);
                    break;
            }
            el.one('.h').html(time.getHours());
            el.one('.m').html(time.getMinutes());
            el.one('.s').html(time.getSeconds());
        },
        _getTime:function(status){
            var self = this,
                time = self.get('time');
                switch (status) {
                    case 'h':
                        return time.getHours();
                    case 'm':
                        return time.getMinutes();
                    case 's':
                        return time.getSeconds();
                }
        },
        _hideTimePopup:function(){
            var self = this,el = self.get('el');
            el.one('.calendar-time-popup').css({display:'none'});
        },
        destructor: function() {
            var self = this;
            self.overlay.destroy();
        }
    });
    S.augment(Time, Time.METHOD);
    return Time;
}, {
    requires: ["brix/core/brick"]
});