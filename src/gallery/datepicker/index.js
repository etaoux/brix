KISSY.add('brix/gallery/datepicker/index', function(S, Brick, Overlay,Calendar) {

    function getRecentlyDate(n) {
        var dt = 1000 * 60 * 60 * 24; //一天的毫秒数
        var d = new Date();
        var ct = d.getTime();

        d.setTime(ct + dt * n)
        return d;
    };
    var date=new Date(),
        yestoday = getRecentlyDate(-1),
        quickDates = { //快捷日期组
            'today': {
                text: '今天',
                dateRange: [date, date]
            },
            'yestoday': {
                text: '昨天',
                dateRange: [yestoday, yestoday]
            },
            'days7before': {
                text: '过去7天',
                dateRange: [getRecentlyDate(-7), yestoday]
            },
            'days14before': {
                text: '过去15天',
                dateRange: [getRecentlyDate(-15), yestoday]
            }
        };
    var NOTLIMITEDTEXT = '不限';
        
    function DatePicker() {
        DatePicker.superclass.constructor.apply(this, arguments);
        //绑定触发事件
        var self = this,
            trigger = S.one(self.get('trigger'));
        if(trigger){
            var triggerType = self.get('triggerType');
            S.each(triggerType, function(v) {
                trigger.on(v, function(e) {
                    e.preventDefault();
                    self.toggle();
                })
            });
        }

        var isCompare = self.get('isCompare');
        if(isCompare){
            self.on('afterCompareTextChange',function(ev){
                self.setChunkData('compareText',self.get('compareText'));
            })
        }
    }
    DatePicker.Date = Calendar.Date;
    DatePicker.ATTRS = {
        trigger:{
            value: false
        },
        triggerType:{
            value:['click']
        },
        quickDates:{
                value:quickDates //快捷日期
        },
        dates:{
            value:{
                start:null,//开始日期
                end:null//结束日期
            }
        },
        isQuick:{
            value:true
        },
        isCompare:{
            value:false
        },
        compareText:{
            value:'过去7天'
        },
        align:{
            value:{
                node:false,
                points : ['bl', 'tl'],
                offset : [0, 0]
            } //设置对其方式
        },
        notLimited:{
            value:false
        },
        pages:{
            value:2
        },
        tmpl:{
            valueFn:function(){
                var self = this,
                    id = self.get('id') || 'brix_datepicker_' + S.guid();
                return '<div id="'+id+'" bx-name="datepicker" class="datepicker">'+
                            '<div class="datepicker-bd">'+
                                '{{^isCompare}}'+
                                '<label>日期范围：</label>'+
                                '<div class="range">'+
                                    '<input value="{{start}}">'+
                                    '<span class="input-split">-</span>'+
                                    '<input value="{{end}}">'+
                                '</div>'+
                                '{{/isCompare}}'+
                                '{{#isCompare}}'+
                                '<label>当前日期：</label>'+
                                '<div bx-tmpl="datepicker" bx-datakey="compareText" class="range">{{compareText}}'+
                                '</div>'+
                                '<label>与其他日期比较：(须同样天数)</label>'+
                                '<div class="range">'+
                                    '<input value="{{start}}">'+
                                    '<span class="input-split">-</span>'+
                                    '<input value="{{end}}">'+
                                '</div>'+
                                '{{/isCompare}}'+
                                '{{#isQuick}}'+
                                '{{{'+id+'_quick_html}}}'+
                                '{{/isQuick}}'+
                                '<div class="operator">'+
                                    '<a class="btn btn-size25 btn-confirm" href="#">确定</a><a class="btn-cancel" href="#">取消</a>'+
                                '</div>'+
                            '</div>'+
                        '</div>';
            }
        },
        data:{
            valueFn:function(){
                var self = this,
                isQuick = self.get('isQuick'),
                isCompare = self.get('isCompare'),
                compareText = self.get('compareText'),
                dates = self.get('dates'),
                start = dates.start?Calendar.Date.format(dates.start,'isoDate'):NOTLIMITEDTEXT,
                end = dates.end?Calendar.Date.format(dates.end,'isoDate'):NOTLIMITEDTEXT;
                return {
                    start:start,
                    end:end,
                    isQuick:isQuick,
                    isCompare:isCompare,
                    compareText:compareText
                }

            }
        }
    };
    DatePicker.RENDERER = {
        quick:{
            html:function(context){
                var quickDates = context.get('quickDates');
                var html = '<label>快捷日期:</label><ul class="quick-list">';
                for(var quick in quickDates){
                    html+='<li><a class="quick-item" key="'+quick+'" href="#">'+quickDates[quick].text+'</a></li>';
                }
                html+='</ul>';
                return html;
            }
        }
    };
    DatePicker.DOCATTACH = {
        '': {
            click: function(e) {
                var self = this,
                    el = self.get('el'),
                    node = S.one(e.target),
                    trigger = S.one(self.get('trigger'));
                if (!el.contains(node) && trigger && node[0] != trigger[0]&&(!self.calendar || !self.calendar.get('el').contains(node))) {
                    self.hide();
                }
            }
        }
    };
    DatePicker.ATTACH = {
        'input':{
            click:function(e){
                var self = this,
                    node = S.one(e.currentTarget),
                    date = Calendar.Date.parse(node.val())||new Date(),
                    selected = Calendar.Date.parse(node.val()),
                    align = S.clone(self.get('align'));
                    align.node = node[0];
                if(!self.calendar){
                    self.calendar = new Calendar({
                        date:date,
                        selected:selected,
                        popup:true,
                        closable:true,
                        notLimited:self.get('notLimited'),
                        pages:self.get('pages'),
                        align:align
                    });
                    self.calendar.on('select',function(ev){
                        var t = self.calendar.get('trigger');
                        if(ev.date){
                            t.val(Calendar.Date.format(ev.date,'isoDate'));
                        }
                        else{
                            t.val(NOTLIMITEDTEXT);
                        }
                    });
                }
                self.calendar.set('date',date);
                self.calendar.set('selected',selected); 
                self.calendar.set('trigger',node);
                self.calendar.set('align',align);
                self.calendar.show();
            }
        },
        '.btn-confirm':{
            click:function(e){
                e.preventDefault();
                var self = this,
                el = self.get('el'),
                quickListNode = el.one('.quick-list');
                dates = {
                    isQuick : false
                },
                inputs = el.all('input');
                if(quickListNode){
                    quickListNode.all('a').removeClass('quick-current');
                }
                dates.start = Calendar.Date.parse(inputs.item(0).val());
                dates.end = Calendar.Date.parse(inputs.item(1).val());
                S.log(dates);
                self.fire(DatePicker.FIRES.selected,dates);
                self.hide();
            }
        },
        '.btn-cancel':{
            click:function(e){
                e.preventDefault();
                this.hide();
            }
        },
        '.quick-item':{
            click:function(e){
                e.preventDefault();
                var self = this,
                    node = S.one(e.currentTarget),
                    el = self.get('el'),
                    quickDates = self.get('quickDates'),
                    key = S.one(e.currentTarget).attr('key'),
                    quick = quickDates[key],
                    dates = {
                        isQuick : true
                    };
                el.one('.quick-list').all('a').removeClass('quick-current');
                node.addClass('quick-current');
                dates.start = quick.dateRange[0];
                dates.end = quick.dateRange[1];
                dates.quickDate = quick;
                S.log(dates);
                self.fire(DatePicker.FIRES.selected,dates);
                self.hide();
            }
        }
    };

    DatePicker.METHOD = {
        show: function() {
            var self = this;
            if(!self.get('rendered')){
                self.render();
            }
            if (self.overlay) {
                var align = S.clone(self.get('align'));
                if(!align.node){
                    align.node = self.get('trigger');
                }
                self.overlay.set('align', align);
                self.overlay.show();
                self.fire(DatePicker.FIRES.show);
            }

        },
        hide: function() {
            var self = this;
            if (self.overlay) {
                self.overlay.hide();
                self.fire(DatePicker.FIRES.hide);
            }
        },
        toggle: function() {
            var self = this;
            if (self.overlay) {
                if (self.overlay.get('el').css('visibility') == 'hidden') {
                    self.show();
                } else {
                    self.hide();
                }
            }
            else{
                self.show();
            }
        }
    };

    DatePicker.FIRES = {
        /**
         * selected 事件，在点击确定后触发
         * @type {String}
         */
        selected:'selected',
        show: 'show',
        hide: 'hide'
    };
    S.extend(DatePicker, Brick, {
        initialize: function() {
            var self = this;
            self.overlay = new Overlay({
                srcNode: '#' + self.get('id')
            });
            self.overlay.render();
        },
        destructor: function() {
            var self = this;
            if(self.calender){
                self.calender.destroy();
                self.calender = null;
            }
            if (self.overlay) {
                self.overlay.destroy();
                self.overlay = null;
            }
        }
                
    });
    S.augment(DatePicker, DatePicker.METHOD);
    return DatePicker;
}, {
    requires: ["brix/core/brick", "overlay","../calendar/index"]
});