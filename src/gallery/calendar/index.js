KISSY.add('brix/gallery/calendar/index', function(S, Brick, Overlay, Page, Brix_Date) {

    function Calendar() {
        Calendar.superclass.constructor.apply(this, arguments);
        var self = this,
            popup = self.get('popup'),
            trigger = S.one(self.get('trigger'));
        if(popup&&trigger){
            var triggerType = self.get('triggerType');
            S.each(triggerType, function(v) {
                trigger.on(v, function(e) {
                    e.preventDefault();
                    self.toggle();
                });
            });
        }
    }
    Calendar.Date = Brix_Date;
    Calendar.ATTRS = {
        //该日期所在月份, 默认为当天
        date: {
            value: new Date()
        },
        //当前选中的日期
        selected: {
            value: null
        },
        //日历显示星期x为起始日期, 取值范围为0到6, 默认为0,从星期日开始,若取值为1, 则从星期一开始, 若取值为7, 则从周日开始
        startDay: {
            value: 0
        },
        //日历的页数, 默认为1, 包含一页日历
        pages: {
            value: 1
        },
        //在弹出情况下, 点选日期后是否关闭日历, 默认为false
        closable: {
            value: false
        },
        //是否支持时间段选择，只有开启时候才会触发rangeSelect事件
        rangeSelect: {
            value: false
        },
        //日历可选择的最小日期
        minDate: {
            value: false
        },
        //日历可选择的最大日期
        maxDate: {
            value: false
        },
        //是否支持多选
        multiSelect: {
            value: false
        },
        //多选的日期数组
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
        //是否可以通过点击导航输入日期,默认开启
        navigator: {
            value: true
        },
        //日历是否为弹出,默认为false
        popup: {
            value: true
        },
        //是否显示时间的选择,默认为false
        showTime: {
            value: false
        },
        trigger:{
            value:false
        },
        //弹出状态下, 触发弹出日历的事件, 例如：[‘click’,’focus’],也可以直接传入’focus’, 默认为[‘click’]
        triggerType: {
            value: ['click']
        },
        //禁止点击的日期数组[new Date(),new Date(2011,11,26)]
        disabled: {
            value: false
        },
        //已选择的时间段{start:null,end:null}
        range: {
            value: false
        },
        //多个日历是否联动
        rangeLinkage: {
            value: true
        },
        //对齐方式
        align: {
            value: {
                node:false,
                points: ['bl', 'tl'],
                offset: [0, 0]
            }
        },
        // 是否出现不限的按钮
        notLimited: {
            value: false
        },
        tmpl: {
            valueFn: function() {
                var self = this,
                    id = self.get('id') || 'brix_calendar_' + S.guid();
                return '<div id="' + id + '" bx-name="calendar" class="calendar">' + '<div class="calendar-pages"></div>' + '<div bx-tmpl="calendar" bx-datakey="notLimited,multiSelect,showTime,' + id + '_op_html" class="calendar-operator">{{{' + id + '_op_html}}}</div>' + '</div>'
            }
        }
    };

    Calendar.FIRES = {
        select: 'select',
        monthChange: 'monthChange',
        timeSelect: 'timeSelect',
        rangeSelect: 'rangeSelect',
        multiSelect: 'multiSelect',
        show: 'show',
        hide: 'hide'
    };
    Calendar.RENDERER = {
        op: {
            html: function(context) {
                var self = context,
                    notLimited = self.get('notLimited'),
                    showTime = self.get('showTime'),
                    multiSelect = self.get('multiSelect'),
                    s = '';

                if (showTime || multiSelect) {
                    s += '<a class="btn btn-size25 btn-calendar-confirm">确定</a>'
                }
                if (notLimited) {
                    s += '<a class="btn btn-size25 btn-calendar-notlimited">不限</a>'
                }
                return s;
            }
        }
    }
    Calendar.DOCATTACH = {
        '': {
            click: function(e) {
                var self = this,
                    el = self.get('el'),
                    node = S.one(e.target),
                    trigger = S.one(self.get('trigger'));
                if (!el.contains(node) && trigger && node[0] != trigger[0]) {
                    self.hide();
                }
            }
        }
    };
    Calendar.ATTACH = {
        ".btn-calendar-confirm": {
            click: function(e) {
                var self = this,
                    selected = self.get('selected'),
                    showTime = self.get('showTime'),
                    multiSelect = self.get('multiSelect');
                if (multiSelect) {
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
                    S.log(multi);
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

    Calendar.METHOD = {
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
        hide: function() {
            var self = this;
            if (self.overlay) {
                self.overlay.hide();
                self.fire(Calendar.FIRES.hide);
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
                    srcNode: '#' + self.get('id'),
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
                        id: self.get('id') + 'page' + i,
                        index: i,
                        prev: prev,
                        next: next,
                        year: year,
                        month: month,
                        father: self,
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
            if (self.overlay) {
                self.overlay.destroy();
            } else {
                S.one(self.get('trigger')).empty();
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
                self.fire('rangeSelect', range);
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
        }
    });
    S.augment(Calendar, Calendar.METHOD);
    return Calendar;
}, {
    requires: ["brix/core/brick", "overlay", "./page", "./date","./calendar.css"]
});