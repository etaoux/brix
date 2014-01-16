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
        
    /**
     * 时间段选择器
     * <br><a href="../demo/gallery/datepicker/datepicker.html" target="_blank">Demo</a>
     * @class Brix.Gallery.DatePicker
     * @extends Brix.Brick
     */
    function DatePicker() {
        DatePicker.superclass.constructor.apply(this, arguments);
        //绑定触发事件
        var self = this,
            trigger = S.one(self.get('trigger'));
        if(trigger){
            var triggerType = self.get('triggerType');
            S.each(triggerType, function(v) {
                trigger.on(v, self.toggle,self);
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
        id:{
            getter:function(v){
                if(!v){
                    v = 'brix_datepicker_' + S.guid();
                    this.__set('id',v);
                }
                return v
            }
        },
        /**
         * 触发时间选择的对象
         * @cfg {Element}
         */
        trigger:{
            value: false
        },
        /**
         * 触发弹出时间选择的事件类型, 
         * 例如：[‘click’,’focus’],也可以直接传入’focus’, 默认为[‘click’]
         * @cfg {String|Array}
         */
        triggerType:{
            value:['click']
        },
        /**
         * 快捷日期组
         * @cfg {Object}
         *
         * @example
         *     {
         *          'today': {
         *               text: '今天',
         *               dateRange: [date, date]
         *           },
         *           'yestoday': {
         *               text: '昨天',
         *               dateRange: [yestoday, yestoday]
         *           },
         *           'days7before': {
         *               text: '过去7天',
         *               dateRange: [getRecentlyDate(-7), yestoday]
         *           },
         *           'days14before': {
         *               text: '过去15天',
         *               dateRange: [getRecentlyDate(-15), yestoday]
         *           }
         *       };
         *  
         */
        quickDates:{
            value:quickDates //快捷日期
        },
        /**
         * 已选择的时间段
         * @cfg {Object} dates
         * @cfg {Date} dates.start 开始时间
         * @cfg {Date} dates.end   结束时间
         *
         * 
         *      {start:new Date(),end:new Date(2014,11,26)}
         */
        dates:{
            value:{
                start:null,//开始日期
                end:null//结束日期
            }
        },
        /**
         * 是否快捷日期
         * @cfg {Boolean}
         */
        isQuick:{
            value:true
        },
        /**
         * 是否是比较
         * @cfg {Boolean}
         */
        isCompare:{
            value:false
        },
        /**
         * 比较的日期
         * @cfg {String}
         */
        compareText:{
            value:'过去7天'
        },
        /**
         * 对齐方式
         * @cfg {Object} align
         * @cfg {Element} align.node 对其的节点
         * @cfg {Array} align.points   对其方式
         * @cfg {Array} align.offset   对其偏移量
         */
        align:{
            value:{
                node:false,
                points : ['bl', 'tl'],
                offset : [0, 0]
            } //设置对其方式
        },
        /**
         * 是否出现不限的按钮
         * @cfg {Boolean}
         */
        notLimited:{
            value:false
        },
        /**
         * 日历的页数, 默认为2
         * @cfg {Number}
         */
        pages:{
            value:2
        },
        /**
         * 日历开始可选择的最小日期
         * @cfg {Date}
         */
        minDateStart: {
            value: false
        },
        /**
         * 日历结束可选择的最小日期
         * @cfg {Date}
         */
        minDateEnd: {
            value: false
        },

        /**
         * 日历开始可选择的最大日期
         * @cfg {Date}
         */
        maxDateStart: {
            value: false
        },
        /**
         * 日历结束可选择的最大日期
         * @cfg {Date}
         */
        maxDateEnd: {
            value: false
        },
        /**
         * 开始禁止点击的日期数组
         * @cfg {Array}
         *
         *      [new Date(),new Date(2011,11,26)]
         */
        disabledStart: {
            value: false
        },
        /**
         * 结束禁止点击的日期数组
         * @cfg {Array}
         *
         *      [new Date(),new Date(2011,11,26)]
         */
        disabledEnd: {
            value: false
        },
        tmpl:{
            valueFn:function(){
                var self = this;
                var html ='<div class="datepicker-bd">'+
                                '{{^isCompare}}'+
                                '<label>日期范围：</label>'+
                                '<div class="range">'+
                                    '<input class="input" input_type="Start" value="{{start}}">'+
                                    '<span class="input-split">-</span>'+
                                    '<input class="input" input_type="End" value="{{end}}">'+
                                '</div>'+
                                '{{/isCompare}}'+
                                '{{#isCompare}}'+
                                '<label>当前日期：</label>'+
                                '<div bx-tmpl="datepicker" bx-datakey="compareText" class="range">{{compareText}}'+
                                '</div>'+
                                '<label>与其他日期比较：(须同样天数)</label>'+
                                '<div class="range">'+
                                    '<input class="input" input_type="Start" value="{{start}}">'+
                                    '<span class="input-split">-</span>'+
                                    '<input class="input" input_type="End" value="{{end}}">'+
                                '</div>'+
                                '{{/isCompare}}'+
                                '{{#isQuick}}'+
                                '{{{quick_html}}}'+
                                '{{/isQuick}}'+
                                '<div class="operator">'+
                                    '<a class="btn btn-size25 btn-confirm" href="#">确定</a><a class="btn-cancel" href="#">取消</a>'+
                                '</div>'+
                            '</div>';
                if(!self.get('el')){
                    html = '<div class="datepicker">' +html+ '</div>';
                }
                return html;
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
        },
        autoRender:{
            value:false
        }
    };
    DatePicker.RENDERERS = {
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
    DatePicker.DOCEVENTS = {
        '': {
            click: function(e) {
                var self = this,
                    el = self.get('el'),
                    node = S.one(e.target),
                    trigger = S.one(self.get('trigger'));
                if (!el.equals(node)&&!el.contains(node) && trigger &&!trigger.contains(node) && node[0] != trigger[0]&&(!self.calendar || !self.calendar.get('el').contains(node))) {
                    self.hide();
                }
            }
        }
    };
    DatePicker.EVENTS = {
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
                var input_type = node.attr('input_type');
                self.calendar.set('minDate',self.get('minDate'+input_type));
                self.calendar.set('maxDate',self.get('maxDate'+input_type));
                self.calendar.set('disabled',self.get('disabled'+input_type));
                self.fire(DatePicker.FIRES.inputClick,{type:input_type});
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
                if(self.fire(DatePicker.FIRES.selected,dates)===false){
                    return;
                }
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

    DatePicker.METHODS = {
        /**
         * 显示日历
         */
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
        /**
         * 隐藏日历
         */
        hide: function() {
            var self = this;
            if (self.overlay) {
                self.overlay.hide();
                self.fire(DatePicker.FIRES.hide);
            }
        },
        /**
         * 显示隐藏切换
         * @param {Event} e 事件
         */
        toggle: function(e) {
            var self = this;
            if(e){
                e.preventDefault();
            }
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
         * @event selected
         * 日期选择触发
         * @param {Object} e 
         * @param {Boolean} e.isQuick 是否快捷日期
         * @param {Object} e.quickDate 如果是快捷日期，则返回快捷日期对象
         * @param {Date} e.start 开始日期
         * @param {Date} e.end 开始日期
         */
        selected:'selected',
        /**
         * @event inputClick
         * 日期选择触发
         * @param {Object} e 
         * @param {String} e.type 点击的是那个input：Start|End
         */
        inputClick:'inputClick',
        /**
         * @event show
         * 显示
         */
        show: 'show',
        /**
         * @event hide
         * 隐藏
         */
        hide: 'hide'
    };
    S.extend(DatePicker, Brick, {
        initialize: function() {
            var self = this;
            self.overlay = new Overlay({
                srcNode: self.get('el')
            });
            self.overlay.render();
        },
        destructor: function() {
            var self = this,
            trigger = S.one(self.get('trigger'));
            if(trigger){
                var triggerType = self.get('triggerType');
                S.each(triggerType, function(v) {
                    trigger.detach(v, self.toggle,self);
                });
            }
            if(self.calendar){
                self.calendar.destroy();
                self.calendar = null;
            }
            if (self.overlay) {
                self.overlay.destroy();
                self.overlay = null;
            }
        }
                
    });
    S.augment(DatePicker, DatePicker.METHODS);
    return DatePicker;
}, {
    requires: ["brix/core/brick", "overlay","../calendar/index"]
});
