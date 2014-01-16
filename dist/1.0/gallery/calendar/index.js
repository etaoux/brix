KISSY.add('brix/gallery/calendar/index', function(S, Brick, Overlay, Page, Brix_Date) {
    /**
     * 日历
     * <br><a href="../demo/gallery/calendar/calendar.html" target="_blank">Demo</a>
     * @class Brix.Gallery.Calendar
     * @extends Brix.Brick
     */
    function Calendar() {
        Calendar.superclass.constructor.apply(this, arguments);
        var self = this,
            popup = self.get('popup'),
            trigger = S.one(self.get('trigger'));
        if(popup&&trigger){
            var triggerType = self.get('triggerType');
            S.each(triggerType, function(v) {
                trigger.on(v, self.toggle,self);
            });
        }
    }
    Calendar.Date = Brix_Date;
    Calendar.ATTRS = {
        /**
         * 该日期所在月份, 默认为当天
         * @cfg {Date}
         */
        date: {
            value: new Date()
        },
        /**
         * 当前选中的日期
         * @cfg {Object}
         */
        selected: {
            value: null
        },
        /**
         * 日历显示星期x为起始日期, 取值范围为0到6, 默认为0,
         * 从星期日开始,若取值为1, 则从星期一开始, 若取值为7, 则从周日开始
         * @cfg {Number}
         */
        startDay: {
            value: 0
        },
        /**
         * 日历的页数, 默认为1, 包含一页日历
         * @cfg {Number}
         */
        pages: {
            value: 1
        },
        /**
         * 在弹出情况下, 点选日期后是否关闭日历, 默认为false
         * @cfg {Boolean}
         */
        closable: {
            value: false
        },
        /**
         * 是否支持时间段选择，只有开启时候才会触发rangeSelect事件
         * @cfg {Boolean}
         */
        rangeSelect: {
            value: false
        },
        /**
         * 日历可选择的最小日期
         * @cfg {Date}
         */
        minDate: {
            value: false
        },
        /**
         * 日历可选择的最大日期
         * @cfg {Date}
         */
        maxDate: {
            value: false
        },
        /**
         * 是否支持多选
         * @cfg {Boolean}
         */
        multiSelect: {
            value: false
        },
        /**
         * 多选的日期数组
         * @cfg {Object}
         *
         *      [new Date(),'2012-10-09']
         */
        multi: {
            value: null,
            setter: function(v) {
                for (var i = 0; i < v.length; i++) {
                    if (v[i] instanceof Date) {
                        v[i] = Brix_Date.format(v[i], 'isoDate');
                    }
                }
                return v;
            }
        },
        /**
         * 是否可以通过点击导航输入日期,默认开启
         * @cfg {Boolean}
         */
        navigator: {
            value: true
        },
        /**
         * 日历是否为弹出,默认为true
         * @cfg {Boolean}
         */
        popup: {
            value: true
        },
        /**
         * 是否显示时间的选择,默认为false
         * @cfg {Boolean}
         */
        showTime: {
            value: false
        },
        /**
         * 触发日历的对象
         * @cfg {Element}
         */
        trigger:{
            value:false
        },
        /**
         * 弹出状态下, 触发弹出日历的事件类型, 
         * 例如：[‘click’,’focus’],也可以直接传入’focus’, 默认为[‘click’]
         * @cfg {String|Array}
         */
        triggerType: {
            value: ['click']
        },
        /**
         * 禁止点击的日期数组
         * @cfg {Array}
         *
         *      [new Date(),new Date(2011,11,26)]
         */
        disabled: {
            value: false
        },
        /**
         * 已选择的时间段
         * @cfg {Object} range
         * @cfg {Date} range.start 开始时间
         * @cfg {Date} range.end   结束时间
         *
         * 
         *      {start:new Date(),end:new Date(2014,11,26)}
         */
        range: {
            value: false
        },
        /**
         * 多个日历是否联动
         * @cfg {Boolean}
         */
        rangeLinkage: {
            value: true
        },
        /**
         * 对齐方式
         * @cfg {Object} align
         * @cfg {Element} align.node 对其的节点
         * @cfg {Array} align.points   对其方式
         * @cfg {Array} align.offset   对其偏移量
         */
        align: {
            value: {
                node:false,
                points: ['bl', 'tl'],
                offset: [0, 0]
            }
        },
        /**
         * 是否出现不限的按钮
         * @cfg {Boolean}
         */
        notLimited: {
            value: false
        },
        tmpl: {
            getter: function(v) {
                if(!v){
                    var self = this;
                    v = '<div class="calendar-pages"></div>' + '<div bx-tmpl="calendar" bx-datakey="notLimited,multiSelect,showTime,op_html" class="calendar-operator">{{{op_html}}}</div>';
                    if(!self.get('el')){
                        v = '<div class="calendar">' +v+ '</div>'
                    }
                    this.__set('tmpl',v);
                }
                return v;
            }
        },
        autoRender:{
            value:false
        },
        prev:{
            value:true
        },
        next:{
            value:true
        },
        confirmBtn:{
            value:true
        }
    };

    Calendar.FIRES = {
        /**
         * @event select
         * 日期选择触发
         * @param {Object} e 
         * @param {Date} e.date 选择的时间
         */
        select: 'select',
        /**
         * @event monthChange
         * 年月变化触发
         * @param {Object} e 
         * @param {Date} e.date 选择的时间
         */
        monthChange: 'monthChange',
        /**
         * @event timeSelect
         * 时间选择触发
         * @param {Object} e 
         * @param {Date} e.date 选择的时间
         */
        timeSelect: 'timeSelect',
        /**
         * @event rangeSelect
         * 时间选择触发
         * @param {Object} e 
         * @param {Object} e.range
         * @param {Date} e.range.end 选择的时间段
         * @param {Date} e.range.start 选择的时间
         */
        rangeSelect: 'rangeSelect',
        /**
         * @event multiSelect
         * 多选时间触发
         * @param {Object} e 
         * @param {Array} e.multi  时间数组,已经按照时间排序
         */
        multiSelect: 'multiSelect',
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
    Calendar.RENDERERS = {
        op: {
            html: function(context) {
                var self = context,
                    notLimited = self.get('notLimited'),
                    showTime = self.get('showTime'),
                    multiSelect = self.get('multiSelect'),
                    s = '';

                if ((showTime || multiSelect)&&self.get('confirmBtn')) {
                    s += '<a class="btn btn-size25 btn-calendar-confirm">确定</a>'
                }
                if (notLimited) {
                    s += '<a class="btn btn-size25 btn-calendar-notlimited">不限</a>'
                }
                return s;
            }
        }
    }
    Calendar.DOCEVENTS = {
        '': {
            click: function(e) {
                var self = this,
                    el = self.get('el'),
                    node = S.one(e.target),
                    trigger = S.one(self.get('trigger'));
                if (!el.equals(node)&&!el.contains(node) && trigger && !trigger.contains(node)&& node[0] != trigger[0]) {
                    self.hide();
                }
            }
        }
    };
    Calendar.EVENTS = {
        ".btn-calendar-confirm": {
            click: function(e) {
                var self = this,
                    selected = self.get('selected'),
                    showTime = self.get('showTime'),
                    multiSelect = self.get('multiSelect');
                if (multiSelect) {
                    var multi = self.getMulti();
                    self.fire(Calendar.FIRES.multiSelect, {
                        multi: multi
                    });
                } else if (showTime) {
                    var date = new Date();
                    if (selected) {
                        date = selected;
                    }
                    var time = self.pageBricks[0].timeBrick.get('time');
                    date.setHours(time.getHours());
                    date.setMinutes(time.getMinutes());
                    date.setSeconds(time.getSeconds());
                    S.log(date);
                    self.fire(Calendar.FIRES.timeSelect, {
                        date: date
                    })
                }
                self.hide();
            }
        },
        ".btn-calendar-notlimited": {
            click: function(e) {
                var self = this,
                    notLimited = self.get('notLimited');
                if (notLimited) {
                    self.fire(Calendar.FIRES.select, {
                        date: null
                    });
                    self.hide();
                }
            }
        }
    };

    Calendar.METHODS = {
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
                self.fire(Calendar.FIRES.show);
            }

        },
        /**
         * 隐藏日历
         */
        hide: function() {
            var self = this;
            if (self.overlay) {
                self.overlay.hide();
                self.fire(Calendar.FIRES.hide);
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

    S.extend(Calendar, Brick, {
        initialize: function() {
            var self = this,
                popup = self.get('popup'),
                closable = self.get('closable'),
                pages = self.get('pages'),
                rangeLinkage = self.get('rangeLinkage'),
                el = self.get('el'),
                date = self.get('date'),
                month = date.getMonth(),
                year = date.getFullYear(),
                trigger = self.get('trigger');
            if (popup) {
                var align = S.clone(self.get('align'));
                if(!align.node){
                    align.node = trigger;
                }
                self.overlay = new Overlay({
                    srcNode: self.get('el'),
                    align: align
                });
                self.overlay.render();
            } else {
                el.css({
                    'position': 'static',
                    visibility: 'visible'
                });
            }
            var container = el.one('.calendar-pages');
            self.pageBricks = [];
            el.addClass('.calendar-' + pages);
            var prev, next;
            for (var i = 0; i < pages; i++) {
                if (!rangeLinkage) {
                    prev = true;
                    next = true;
                } else {
                    prev = (i == 0);
                    next = (i == (pages - 1));
                }
                (function(i) {
                    var pageBrick = new Page({
                        index: i,
                        prev:self.get('prev')?prev:false,
                        next: self.get('next')?next:false,
                        year: year,
                        month: month,
                        father: self,
                        isRemoveHTML:self.get('isRemoveHTML'),
                        isRemoveEl:self.get('isRemoveEl'),
                        container: container
                    });
                    self.pageBricks.push(pageBrick);
                    pageBrick.on('itemClick', function(ev) {
                        var rangeSelect = self.get('rangeSelect');
                        if (rangeSelect) {
                            self._handleRange(ev.date);
                        } else if (ev.date) {
                            self.set('selected', ev.date);

                            self.fire(Calendar.FIRES.select, {
                                date: ev.date
                            });
                            if (popup && closable && !self.get('showTime')) {
                                self.hide();
                            }
                        }
                    });
                    pageBrick.on('itemMouseDown', function(ev) {
                        var multiSelect = self.get('multiSelect');
                        if (multiSelect) {
                            self._handleMultiSelectStart(ev.date)
                        }

                    });
                    pageBrick.on('itemMouseUp', function(ev) {
                        var multiSelect = self.get('multiSelect');
                        if (multiSelect) {
                            self._handleMultiSelectEnd(ev.date);
                            //需要排序好的multi数组，请调用getMulti方法
                            self.fire('multiOneSelect');
                        }
                    });
                    pageBrick.on('monthChange', function(ev) {
                        self._bindDateValueChange(ev.date,ev.index);
                    });

                })(i);
                if (month == 11) {
                    year++;
                    month = 0;
                } else {
                    month++;
                }
            }
            self._bindDataChange('range');
            self._bindDataChange('multi');
            self._bindDataChange('disabled');
            self._bindDataChange('minDate');
            self._bindDataChange('maxDate');
            self._bindDataChange('selected');
            self._bindDataChange('startDay');

            self.on('afterDateChange',function(){
                self._bindDateValueChange(self.get('date'));
            });
        },
        destructor: function() {
            var self = this;
            trigger = S.one(self.get('trigger'));
            if(self.get('popup')&&trigger){
                var triggerType = self.get('triggerType');
                S.each(triggerType, function(v) {
                    trigger.detach(v, self.toggle,self);
                });
            }
            if(self.pageBricks){
                S.each(self.pageBricks, function(o,i) {
                    o.destroy();
                });
                self.pageBricks = null;
            }
            if (self.overlay) {
                self.overlay.destroy();
            }
        },
        _bindDataChange: function(key, upperCaseKey) {
            var self = this,
                upperCaseKey = key.replace(/\b(\w)|\s(\w)/g, function(m) {
                    return m.toUpperCase()
                });
            self.on('after' + upperCaseKey + 'Change', function() {
                var data = self.get(key);
                for (var i = 0; i < self.pageBricks.length; i++) {
                    self.pageBricks[i].setChunkData(key, data);
                };
            });
        },
        _bindDateValueChange:function(date,index){
            index = index || 0;
            var self = this, rangeLinkage = self.get('rangeLinkage'),
                year = date.getFullYear(), month = date.getMonth();
                if (rangeLinkage) {
                    for (var i = 0; i < self.pageBricks.length; i++) {
                        var newMonth = month - index + i,
                            newYear = year;
                        if (newMonth < 0) {
                            newYear--;
                            newMonth += 12;
                        } else if (newMonth > 11) {
                            newYear++;
                            newMonth -= 12;
                        }
                        self.pageBricks[i].set('year', newYear);
                        self.pageBricks[i].set('month', newMonth);
                    };

                    var fireYear = year,
                        fireMonth = month - index;
                    if (fireMonth < 0) {
                        fireYear--;
                        fireMonth += 12;
                    }
                    self.fire(Calendar.FIRES.monthChange, {
                        date: new Date(fireYear, fireMonth, 1)
                    });
                } else {
                    self.pageBricks[index].set('year', year);
                    self.pageBricks[index].set('month', month);
                    self.fire(Calendar.FIRES.monthChange, {
                        date: new Date(year, month, 1)
                    });
                }
        },
        //处理起始日期,d:Date类型
        _handleRange: function(d) {
            var self = this,
                range = S.clone(self.get('range')) || {},
                //克隆是为了触发afterRangeChange事件
                t;
            if ((!range.start && !range.end) || (range.start && range.end)) {
                range.start = d;
                range.end = null;
                self.set('range', range);
            } else {
                range.end = d;
                if (range.start.getTime() > range.end.getTime()) {
                    t = range.start;
                    range.start = range.end;
                    range.end = t;
                }
                self.set('range', range);
                self.fire(Calendar.FIRES.rangeSelect, range);
                var popup = self.get('popup'),
                    closable = self.get('closable');
                if (popup && closable) {
                    self.hide();
                }
            }
        },
        //开始多选
        _handleMultiSelectStart: function(d) {
            this.multiStartDate = d;
        },
        _handleMultiSelectEnd: function(d) {
            if (this.multiStartDate) {
                var self = this,
                    multi = S.clone(self.get('multi')) || [],
                    multiStartDate = self.multiStartDate,
                    multiEndDate, minDate = self.get('minDate'),
                    maxDate = self.get('maxDate'),
                    disabled = self.get('disabled');
                if (d < multiStartDate) {
                    multiEndDate = multiStartDate;
                    multiStartDate = d;
                } else {
                    multiEndDate = d;
                }
                while (multiStartDate <= multiEndDate) {
                    if (Brix_Date.isDisabled(disabled, multiStartDate)) {
                        continue;
                    }
                    var str = Brix_Date.format(multiStartDate, 'isoDate');
                    if (!S.inArray(str, multi)) {
                        multi.push(str);
                    } else {
                        multi.splice(S.indexOf(str, multi), 1);
                    }
                    multiStartDate.setDate(multiStartDate.getDate() + 1);
                }
                delete self.multiStartDate;
                self.set('multi', multi);
            }
        },
        getMulti:function(){
            var self = this;
            var multi = S.clone(self.get('multi'));
            multi.sort(function(a, b) {
                if (a > b) {
                    return 1;
                }
                return -1;
            });
            for (var i = 0; i < multi.length; i++) {
                multi[i] = Brix_Date.parse(multi[i]);
            };
            return multi
         }
    });
    S.augment(Calendar, Calendar.METHODS);
    return Calendar;
}, {
    requires: ["brix/core/brick", "overlay", "./page", "./date"]
});
/*
 * Date Format 1.2.3
 * (c) 2007-2009 Steven Levithan <stevenlevithan.com>
 * MIT license
 *
 * Includes enhancements by Scott Trenda <scott.trenda.net>
 * and Kris Kowal <cixar.com/~kris.kowal/>
 *
 * Accepts a date, a mask, or a date and a mask.
 * Returns a formatted version of the given date.
 * The date defaults to the current date/time.
 * The mask defaults to dateFormat.masks.default.
 *
 * Last modified by jayli 拔赤 2010-09-09
 * - 增加中文的支持
 * - 简单的本地化，对w（星期x）的支持
 */
KISSY.add('brix/gallery/calendar/date', function(S) {

    function dateParse(data,s) {

        var date = null;
        s = s || '-';
        //Convert to date
        if (!(data instanceof Date)) {
            date = new Date(data);
        }
        else {
            return data;
        }

        // Validate
        if (date instanceof Date && (date != "Invalid Date") && !isNaN(date)) {
            return date;
        }
        else {
            var arr = data.toString().split(s);
            if(arr.length==3){
                date = new Date(arr[0], (parseInt(arr[1], 10) - 1), arr[2]);
                if (date instanceof Date && (date != "Invalid Date") && !isNaN(date)) {
                    return date;
                }
            }
        }
        return null;
    }


    var dateFormat = function () {
        var token = /w{1}|d{1,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?|[LloSZ]|"[^"]*"|'[^']*'/g,
            timezone = /\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\d{4})?)\b/g,
            timezoneClip = /[^-+\dA-Z]/g,
            pad = function (val, len) {
                val = String(val);
                len = len || 2;
                while (val.length < len) {
                    val = "0" + val;
                }
                return val;
            },
            // Some common format strings
            masks = {
                "default":      "ddd mmm dd yyyy HH:MM:ss",
                shortDate:      "m/d/yy",
                //mediumDate:     "mmm d, yyyy",
                longDate:       "mmmm d, yyyy",
                fullDate:       "dddd, mmmm d, yyyy",
                shortTime:      "h:MM TT",
                //mediumTime:     "h:MM:ss TT",
                longTime:       "h:MM:ss TT Z",
                isoDate:        "yyyy-mm-dd",
                isoTime:        "HH:MM:ss",
                isoDateTime:    "yyyy-mm-dd'T'HH:MM:ss",
                isoUTCDateTime: "UTC:yyyy-mm-dd'T'HH:MM:ss'Z'",

                //added by jayli
                localShortDate:    "yy年mm月dd日",
                localShortDateTime:"yy年mm月dd日 hh:MM:ss TT",
                localLongDate:    "yyyy年mm月dd日",
                localLongDateTime:"yyyy年mm月dd日 hh:MM:ss TT",
                localFullDate:    "yyyy年mm月dd日 w",
                localFullDateTime:"yyyy年mm月dd日 w hh:MM:ss TT"

            },

            // Internationalization strings
            i18n = {
                dayNames: [
                    "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat",
                    "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday",
                    "星期日","星期一","星期二","星期三","星期四","星期五","星期六"
                ],
                monthNames: [
                    "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
                    "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"
                ]
            };

        // Regexes and supporting functions are cached through closure
        return function (date, mask, utc) {

            // You can't provide utc if you skip other args (use the "UTC:" mask prefix)
            if (arguments.length == 1 && Object.prototype.toString.call(date) == "[object String]" && !/\d/.test(date)) {
                mask = date;
                date = undefined;
            }

            // Passing date through Date applies Date.parse, if necessary
            date = date ? dateParse(date) : new Date();
            if (isNaN(date)) {
                throw SyntaxError("invalid date");
            }

            mask = String(masks[mask] || mask || masks["default"]);

            // Allow setting the utc argument via the mask
            if (mask.slice(0, 4) == "UTC:") {
                mask = mask.slice(4);
                utc = true;
            }

            var _ = utc ? "getUTC" : "get",
                d = date[_ + "Date"](),
                D = date[_ + "Day"](),
                m = date[_ + "Month"](),
                y = date[_ + "FullYear"](),
                H = date[_ + "Hours"](),
                M = date[_ + "Minutes"](),
                s = date[_ + "Seconds"](),
                L = date[_ + "Milliseconds"](),
                o = utc ? 0 : date.getTimezoneOffset(),
                flags = {
                    d:    d,
                    dd:   pad(d, undefined),
                    ddd:  i18n.dayNames[D],
                    dddd: i18n.dayNames[D + 7],
                    w:     i18n.dayNames[D + 14],
                    m:    m + 1,
                    mm:   pad(m + 1, undefined),
                    mmm:  i18n.monthNames[m],
                    mmmm: i18n.monthNames[m + 12],
                    yy:   String(y).slice(2),
                    yyyy: y,
                    h:    H % 12 || 12,
                    hh:   pad(H % 12 || 12, undefined),
                    H:    H,
                    HH:   pad(H, undefined),
                    M:    M,
                    MM:   pad(M, undefined),
                    s:    s,
                    ss:   pad(s, undefined),
                    l:    pad(L, 3),
                    L:    pad(L > 99 ? Math.round(L / 10) : L, undefined),
                    t:    H < 12 ? "a" : "p",
                    tt:   H < 12 ? "am" : "pm",
                    T:    H < 12 ? "A" : "P",
                    TT:   H < 12 ? "AM" : "PM",
                    Z:    utc ? "UTC" : (String(date).match(timezone) || [""]).pop().replace(timezoneClip, ""),
                    o:    (o > 0 ? "-" : "+") + pad(Math.floor(Math.abs(o) / 60) * 100 + Math.abs(o) % 60, 4),
                    S:    ["th", "st", "nd", "rd"][d % 10 > 3 ? 0 : (d % 100 - d % 10 != 10) * d % 10]
                };

            return mask.replace(token, function ($0) {
                return $0 in flags ? flags[$0] : $0.slice(1, $0.length - 1);
            });
        };
    }();

    return {
        format: function(date, mask, utc) {
            return dateFormat(date, mask, utc);
        },
        parse: function(date,s) {
            return dateParse(date,s);
        },
        isMinMax:function(minDate,maxDate,date){
            date = dateFormat(date,'isoDate');
            if(minDate){
                minDate = Brix_Date.format(minDate,'isoDate');
                if(minDate>date){
                    return false;
                }
            }
            if(maxDate){
                maxDate = Brix_Date.format(maxDate,'isoDate');
                if(maxDate<date){
                    return false;
                }
            }
            return true;
        },
        isDisabled:function(disabled,date){
            date = dateFormat(date,'isoDate');
            //是否需要提供正则
            if(disabled){
                for(var i=0;i<disabled.length;i++){
                    if(dateFormat(disabled[i],'isoDate')==date){
                        return true;
                    }
                }
            }
            return false;
        },
        isInMulit:function (mulit,date){
            date = dateFormat(date,'isoDate');
            if(mulit){
                for(var i=0;i<mulit.length;i++){
                    if(dateFormat(mulit[i],'isoDate')==date){
                        return true;
                    }
                }
            }
            return false;
        },
        isInRang:function(range,date){
            date = dateFormat(date,'isoDate');
            if(range){
                if(range.start&&range.end){
                    if(date>=dateFormat(range.start,'isoDate')&&date<=dateFormat(range.end,'isoDate')){
                        return true;
                    }
                }
                else if(range.start&&date==dateFormat(range.start,'isoDate')){
                    return true;
                }
            }
            return false;
        },
        isYear : function(n) {
            if (!/^\d+$/i.test(n)) {
                return false;
            }
            n = Number(n);
            return !(n < 100 || n > 10000);

        }
    };
});
KISSY.add('brix/gallery/calendar/page', function(S, Brick,Time,Brix_Date) {
    var days = ['日','一','二','三','四','五','六'];
    function _handleDaysOffset(startDay) {
        var a = [];
        for (var i = 0; i < 7; i++) {
            a[i] = days[(i + startDay) % 7]
        }
        return a;
    }
    function _getNumOfDays(year,month) {
            return 32 - new Date(year, month, 32).getDate();
    }

    function Page() {
        Page.superclass.constructor.apply(this, arguments);
    }
    Page.ATTRS = {
        father:{
            value:false
        },
        index:{
            value:0
        },
        year:{
            value:2012
        },
        month:{
            value:7
        },
        prev:{
            value:true
        },
        next:{
            value:true
        },
        autoRender:{
            value:true
        },
        tmpl:{
            valueFn:function(){
                var self = this;
                return '<div  class="calendar-page">'+
                        '<div class="calendar-page-hd">'+
                            '<div bx-mpl="page" bx-datakey="prev">'+
                            '{{#prev}}'+
                            '<a href="javascript:void(0);" class="calendar-prev-year"><i class="iconfont">&#403</i><i class="iconfont icon-yp">&#403</i></a>'+
                            '<a href="javascript:void(0);" class="calendar-prev-month"><i class="iconfont">&#403</i></a>'+
                            '{{/prev}}'+
                            '</div>'+
                            '<a bx-tmpl="yearmonth" bx-datakey="year,month" href="javascript:void(0);" class="calendar-year-month">{{year}}年{{month}}月</a>'+
                            '<div bx-tmpl="next" bx-datakey="next">'+
                            '{{#next}}'+
                            '<a href="javascript:void(0);" class="calendar-next-month "><i class="iconfont">&#402</i></a>'+
                            '<a href="javascript:void(0);" class="calendar-next-year "><i class="iconfont icon-yn">&#402</i><i class="iconfont">&#402</i></a>'+
                            '{{/next}}'+
                            '</div>'+
                            '<div class="calendar-year-month-pupop" >'+
                                '<p bx-tmpl="select" bx-datakey="month,select_html">{{{select_html}}}</p>'+
                                '<p bx-tmpl="year" bx-datakey="year">年:<input type="text" value="{{year}}" onfocus="this.select()"></p>'+
                                '<p><a class="btn btn-size25 btn-pupop-confirm">确定</a><a class="btn-pupop-cancel" href="#">取消</a></p>'+
                            '</div>'+
                        '</div>'+
                        '<div bx-tmpl="pagewbd" bx-datakey="startDay,days_html" class="calendar-page-wbd">'+    
                            '{{{days_html}}}'+
                        '</div>'+
                        '<div bx-tmpl="pagedbd" bx-datakey="startDay,year,month,selected,range,multi,disabled,minDate,maxDate,da_html" class="calendar-page-dbd">'+
                           '{{{da_html}}}'+
                        '</div>'+
                        '<div class="calendar-page-fd">'+
                            
                        '</div>'+
                    '</div>'
                }
        },
        data:{
            valueFn: function() {
                var self = this, 
                    father = self.get('father'),
                    year=self.get('year'),
                    month = self.get('month'),
                    prev=self.get('prev'),
                    next = self.get('next');
                return {
                    prev:prev,
                    next:next,
                    month:month+1,
                    year:year
                };
            }
        }
    };

    Page.RENDERERS = {
        da:{
            html:function(context){
                var self = context,
                    father=self.get('father'),
                    year = self.get('year'),
                    month = self.get('month'),
                    selectedDate = father.get('selected'),
                    minDate = father.get('minDate'),
                    maxDate = father.get('maxDate'),
                    disabled = father.get('disabled'),
                    multi = father.get('multi'),
                    range = father.get('range'),
                    startOffset = (7-father.get('startDay')+new Date(year,month,1).getDay())%7,//当月第一天是星期几
                    days = _getNumOfDays(year,month),
                    today = Brix_Date.format(new Date(),'isoDate'),
                    s='';

                if(selectedDate){
                    selectedDate = Brix_Date.format(selectedDate,'isoDate');
                }
                if(minDate){
                    minDate = Brix_Date.format(minDate,'isoDate');
                }
                if(maxDate){
                    maxDate = Brix_Date.format(maxDate,'isoDate');
                }
                for(var i=0;i<startOffset;i++){
                    s += '<a href="javascript:void(0);" class="calendar-hidden">0</a>';
                }
                for (var i = 1; i <= days; i++) {
                    var cls = 'class="calendar-item';
                    var date = Brix_Date.format(new Date(year,month, i),'isoDate');
                    if(date<minDate || date>maxDate || Brix_Date.isDisabled(disabled,date)){
                        cls += ' calendar-disabled';
                    }
                    else if(Brix_Date.isInRang(range,date)){
                        cls += ' calendar-range';
                    }
                    else if(selectedDate==date){
                        cls += ' calendar-selected';
                    }
                    else if(Brix_Date.isInMulit(multi,date)){
                        cls += ' calendar-multi';    
                    }
                    if(today==date){
                        cls += ' calendar-today';
                    }

                    s += '<a '+cls+'" href="javascript:void(0);">' + i + '</a>';
                }
                return s;
            }
        },
        select:{
            html:function(context){
                var s = '月:<select>';
                for (var i = 1; i <= 12; i++) {
                    s+='<option'+(i==this.month?' selected':'')+' value="'+(i-1)+'">'+(i<10?'0'+i:i)+'</option>';
                };
                s+='</select>';
                return s;
            }
        },
        days:{
            html:function(context){
                var father = context.get('father'),
                    days = _handleDaysOffset(father.get('startDay')),
                    s='';
                S.each(days,function(val){
                    s+='<span>'+val+'</span>';
                });
                return s;
            }
        }
    }

    Page.EVENTS = {
        '.calendar-prev-year':{
            click:function(e){
                var self = this,
                    year = self.get('year'),
                    month = self.get('month'),
                    index = self.get('index');
                year--;
                date = new Date(year,month,1);
                self.fire(Page.FIRES.monthChange,{date:date,index:index});
            }
        },
        '.calendar-prev-month':{
            click:function(e){
                var self = this,
                    year = self.get('year'),
                    month = self.get('month'),
                    index = self.get('index');
                month--;
                if(month<0){
                    year--;
                    month +=12; 
                }
                date = new Date(year,month,1);
                self.fire(Page.FIRES.monthChange,{date:date,index:index});
            }
        },
        '.calendar-next-year':{
            click:function(e){
                var self = this,
                    year = self.get('year'),
                    month = self.get('month'),
                    index = self.get('index');
                year++;
                date = new Date(year,month,1);
                self.fire(Page.FIRES.monthChange,{date:date,index:index});
            }
        },
        '.calendar-next-month':{
            click:function(e){
                var self = this,
                    year = self.get('year'),
                    month = self.get('month'),
                    index = self.get('index');
                month++;
                if(month>11){
                    year++;
                    month-=12;
                }
                date = new Date(year,month,1);
                self.fire(Page.FIRES.monthChange,{date:date,index:index});
            }
        },
        '.calendar-year-month':{
            click:function(e){
                var self = this,
                    navigator = self.get('father').get('navigator');
                if(navigator){
                    popupNode = self.get('el').one('.calendar-year-month-pupop').show();
                }
            }
        },
        '.btn-pupop-confirm':{
            click:function(e){
                e.preventDefault();
                var self = this,
                    index = self.get('index');
                    popupNode = self.get('el').one('.calendar-year-month-pupop'),
                    year = popupNode.one('input').val();
                    month = popupNode.one('select').val()
                if(Brix_Date.isYear(year)){
                    year = Number(year);
                    month = Number(month);
                    var date = new Date(year,month,1);
                    popupNode.hide();
                    self.fire(Page.FIRES.monthChange,{date:date,index:index});
                }

            }
        },
        '.btn-pupop-cancel':{
            click:function(e){
                e.preventDefault();
                var self = this,
                    popupNode = self.get('el').one('.calendar-year-month-pupop');
                popupNode.hide();
            }
        },
        '.calendar-item':{
            click:function(e){
                e.preventDefault();
                var self = this,
                    node = S.one(e.currentTarget);
                if(!node.hasClass('calendar-disabled')){
                    var d = false;
                    if(!node.hasClass('calendar-selected')){
                        var year = self.get('year'),
                            month = self.get('month');
                        d = new Date(year,month,Number(node.html()));
                        if(self.timeBrick){
                            var time = self.timeBrick.get('time');
                            d.setHours(time.getHours());
                            d.setMinutes(time.getMinutes());
                            d.setSeconds(time.getSeconds());
                        }
                    }
                    S.later(function(){
                        //先触发document的click事件
                        self.fire(Page.FIRES.itemClick,{date:d});
                    },0);
                }
            },
            mousedown:function(e){
                e.preventDefault();
                var self = this,
                    node = S.one(e.currentTarget);
                if(!node.hasClass('calendar-disabled')){
                    var year = self.get('year'),
                        month = self.get('month'),
                        d = new Date(year,month,Number(node.html()));
                    self.fire(Page.FIRES.itemMouseDown,{date:d});
                }
            },
            mouseup:function(e){
                e.preventDefault();
                var self = this,
                    node = S.one(e.currentTarget);
                if(!node.hasClass('calendar-disabled')){
                    var year = self.get('year'),
                        month = self.get('month'),
                        d = new Date(year,month,Number(node.html()));
                    self.fire(Page.FIRES.itemMouseUp,{date:d});
                }
            }   
        }
    };

    Page.METHODS = {

    };

    Page.FIRES = {
        itemClick: 'itemClick',
        itemMouseDown:'itemMouseDown',
        itemMouseUp:'itemMouseUp',
        monthChange:'monthChange'
    };
    S.extend(Page, Brick, {
        initialize: function() {
            var self = this,
                el = self.get('el'),
                father = self.get('father'),
                showTime = father.get('showTime');
            if(showTime){
                self.timeBrick = new Time({
                    isRemoveHTML:self.get('isRemoveHTML'),
                    isRemoveEl:self.get('isRemoveEl'),
                    container:el.one('.calendar-page-fd')
                });
            }
            self.on('afterYearChange',function(){
                self.setChunkData('year',self.get('year'));
            });
            self.on('afterMonthChange',function(){
                self.setChunkData('month',self.get('month')+1);
            });
        },
        destructor: function() {
            var self = this;
            if(self.timeBrick){
                self.timeBrick.destroy();
            }
        }

    });
    S.augment(Page, Page.METHODS);
    return Page;
}, {
    requires: ["brix/core/brick","./time","./date"]
});
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
            value : '<div>'+
                        '<div class="calendar-time">'+
                            '时间：<span class="h">{{h}}</span>:<span class="m">{{m}}</span>:<span class="s">{{s}}</span>'+
                            '<div class="calendar-time-updown">'+
                                '<i class="iconfont u">&#456</i><i class="iconfont d">&#459</i>'+
                            '</div>'+
                        '</div>'+
                        '<div class="calendar-time-popup">'+
                            '<div bx-tmpl="time" bx-datakey="list" class="calendar-time-popup-bd">'+
                            '<!--bx-tmpl="time" bx-datakey="list"-->'+
                                '{{#list}}'+
                                '<a class="item">{{.}}</a>'+
                                '{{/list}}'+
                            '<!--bx-tmpl="time"-->'+
                            '</div>'+
                            '<i class="iconfont icon-close">&#223</i>'+
                        '</div>'+
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

    Time.EVENTS = {
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

    Time.METHODS = {

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
        }
    });
    S.augment(Time, Time.METHODS);
    return Time;
}, {
    requires: ["brix/core/brick"]
});