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
                var self = this,
                    id=self.get('id');
                return '<div id="'+id+'" bx-name="page" class="calendar-page">'+
                        '<div class="calendar-page-hd">'+
                            '<div bx-tmpl="page" bx-datakey="prev">'+
                            '{{#prev}}'+
                            '<a href="javascript:void(0);" class="calendar-prev-year"><i class="iconfont">&#403</i><i class="iconfont icon-yp">&#403</i></a>'+
                            '<a href="javascript:void(0);" class="calendar-prev-month"><i class="iconfont">&#403</i></a>'+
                            '{{/prev}}'+
                            '</div>'+
                            '<a bx-tmpl="page" bx-datakey="year,month" href="javascript:void(0);" class="calendar-year-month">{{year}}年{{month}}月</a>'+
                            '<div bx-tmpl="page" bx-datakey="next">'+
                            '{{#next}}'+
                            '<a href="javascript:void(0);" class="calendar-next-month "><i class="iconfont">&#402</i></a>'+
                            '<a href="javascript:void(0);" class="calendar-next-year "><i class="iconfont icon-yn">&#402</i><i class="iconfont">&#402</i></a>'+
                            '{{/next}}'+
                            '</div>'+
                            '<div class="calendar-year-month-pupop" >'+
                                '<p bx-tmpl="page" bx-datakey="month,'+id+'_select_html">{{{'+id+'_select_html}}}</p>'+
                                '<p bx-tmpl="page" bx-datakey="year">年:<input type="text" value="{{year}}" onfocus="this.select()"></p>'+
                                '<p><a class="btn btn-pupop-confirm">确定</a><a class="btn-pupop-cancel">取消</a></p>'+
                            '</div>'+
                        '</div>'+
                        '<div bx-tmpl="page" bx-datakey="startDay,'+id+'_days_html" class="calendar-page-wbd">'+
                            '{{{'+id+'_days_html}}}'+
                        '</div>'+
                        '<div class="calendar-page-dbd" bx-tmpl="page" bx-datakey="startDay,year,month,selected,range,multi,disabled,minDate,maxDate,'+id+'_da_html">'+
                           '{{{'+id+'_da_html}}}'+
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

    Page.RENDERER = {
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

    Page.ATTACH = {
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
                var self = this,
                    popupNode = self.get('el').one('.calendar-year-month-pupop');
                popupNode.hide();
            }
        },
        '.calendar-item':{
            click:function(e){
                e.halt();
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
                    self.fire(Page.FIRES.itemClick,{date:d});
                }
            },
            mousedown:function(e){
                e.halt();
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
                e.halt();
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

    Page.METHOD = {

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
                self.timeBrick = new Time({container:el.one('.calendar-page-fd')});
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
    S.augment(Page, Page.METHOD);
    return Page;
}, {
    requires: ["brix/core/brick","./time","./date"]
});