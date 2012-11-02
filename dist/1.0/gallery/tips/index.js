KISSY.add('brix/gallery/tips/index', function (S, Brick, Node, Template) {
    var $ = Node.all, D = S.DOM, E = S.Event;
    var count = 0;

    function Tips() {
        Tips.superclass.constructor.apply(this, arguments);
    }

    Tips.ATTRS = {
        dataAttrName:{
            value:'data-tips'
        },
        closeable:{
            value: true
        },
        length:{

        },
        'tmpl-tip':{
            value:'<div id="{{id}}" class="bx-tips-show {{hide}}" style="display: none;position: absolute;top:0;left:0"><p class="bx-tips-msg">{{tips}}</p><a href="javascript:void(0);" class="bx-tips-iknow">我知道了</a><span class="tri"><i class="outer"></i><i class="inner"></i></span><span class="bx-tips-close">关闭</span></div>'
        },
        tips:{
            value:{}
        },
        timers:{
            value:{}
        },
        prex:{
            value:'bx-tip-'
        },
        dis:{
            value: 10
        },
        el:{
            value:'body'
        },
        order:{
            value:['RB', 'BR', 'LB', 'LT', 'TL', 'TR', 'RT', 'BL']
        },
        timeout:{
            value:3
        }

    };

    Tips.DOCEVENTS = {

        '.bx-tips':{
            mouseenter:function (e) {
                var el = e.currentTarget;
                this.showTips(el);
            },
            mouseleave:function (e) {
                var el = e.currentTarget;
                this.hideTips(el);
            }

        },
        '.bx-tips-close':{
            click:function (e) {
                var el = e.currentTarget;
                var self = this;
                var _tip = D.parent(el, '.bx-tips-show');
                self.closeTips(_tip);
            }
        },
        '.bx-tips-iknow': {
            click:function (e) {
                e.halt();
                var el = e.currentTarget;
                var self = this;
                var _tip = D.parent(el, '.bx-tips-show');
                self.closeTips(_tip);
            }
        }

    };

    Tips.METHODS = {
        showTips:function (el) {
            var self = this;
            var _id = self._getTipId(el);
            var isCloseable = !D.hasClass(el, 'bx-uncloseable') && self.get("closeable");
            console.log(isCloseable);
            if (!_id || !self.get("tips")[_id]) {
                _id = self._createTipId();
                var __tip = Template(self.get("tmpl-tip"))
                    .render({'id':_id, 'tips':D.attr(el, self.get("dataAttrName")), 'hide': isCloseable? '' : 'bx-tips-uncloseable'});
                self.get("tips")[_id] = _id;
                D.attr(el, "data-tipid", _id);
                $(__tip).appendTo('body');
            }
            self._posTip(el, D.get("#" + _id));

        },
        hideTips:function (el) {
            var self = this;
            var _id = self._getTipId(el);
            var tip = D.get("#" + _id);
            var _timer = setTimeout(function () {
                D.hide(tip);
                D.css(tip, {left:'-9999px', top:'-9999px'});
            }, self.get("timeout") * 1000);
            self.get("timers")[_id] = _timer;
        },
        closeTips:function (tip) {
            this._clearTimer(tip.id);
            D.hide(tip);
            D.css(tip, {left:'-9999px', top:'-9999px'});
        },
        _clearTimer:function (tipid) {
            var _timer = this.get("timers")[tipid];
            if (_timer) {
                clearTimeout(_timer);
                delete this.get("timers")[tipid];
            }
        },
        _createTipId:function () {
            return this.get('prex') + ++count;
        },

        _posTip:function (el, tip) {
            var self = this;
            var elOffset = D.offset(el);
            var elX1 = elOffset.left;
            var elY2 = elOffset.top;
            var _el = {
                x1:elX1,
                y1:elY2,
                x2:elX1 + D.innerWidth(el),
                y2:elY2 + D.innerHeight(el)
            };

            var _viewW = D.viewportWidth();
            var _viewH = D.viewportHeight();
            var _left = D.scrollLeft(window);
            var _top = D.scrollTop(window);
            var _view = {
                x1:_left,
                y1:_top,
                x2:_left + _viewW,
                y2:_top + _viewH
            }

            self._clearTimer(self._getTipId(el));
            D.show(tip);
            var _tip = {
                tip:tip,
                w:D.outerWidth(tip),
                h:D.outerHeight(tip)
            };
            var _offset;
            var order = self.get("order");
            var len = order.length;
            for (var i = 0; i < len; i++) {
                _offset = self["_test" + order[i]](_el, _tip, _view);
                if (_offset) {
                    break;
                }
            }

            var _tri = D.get('.bx-tips-tri', tip);
            var isCloseable = !D.hasClass(el, 'bx-uncloseable') && self.get("closeable");
            D.attr(tip, "class", isCloseable ? 'bx-tips-show' : "bx-tips-show bx-tips-uncloseable");
            D.addClass(tip, _offset.cls);
            D.css(tip, {position:'absolute', left:_offset.left + 'px', top:_offset.top + 'px'});


        },
        _testBR:function (el, tip, view) {
            var dis = this.get("dis");
            var x1 = el.x2 - dis;
            var y1 = el.y2 + dis;
            var x2 = x1 + tip.w;
            var y2 = y1 + tip.h;

            if (x2 > view.x2 || y2 > view.y2 || y1 < view.y1) {
                return false;
            } else {
                return {
                    left:x1,
                    top:y1,
                    cls:'bx-tips-br'
                };
            }
        },
        _testTL:function (el, tip, view) {
            var dis = this.get("dis");
            var x1 = el.x1 - tip.w + dis;
            var y1 = el.y1 - tip.h - dis;
            var y2 = y1 + tip.h;
            if (x1 < view.x1 || y1 < view.y1 || y2 > view.y2) {
                return false;
            } else {
                return {
                    left:x1,
                    top:y1,
                    cls:'bx-tips-tl'
                };
            }
        },
        _testBL:function (el, tip, view) {
            var dis = this.get("dis");
            var x1 = el.x1 - tip.w + dis;
            var y1 = el.y2 + dis;
            var y2 = y1 + tip.h;
            if (x1 < view.x1 || y2 > view.y2 || y1 < view.y1) {
                return false;
            } else {
                return {
                    left:x1,
                    top:y1,
                    cls:'bx-tips-bl'
                };
            }
        },
        _testTR:function (el, tip, view) {
            var dis = this.get("dis");
            var x1 = el.x2 - dis;
            var y1 = el.y1 - tip.h - dis;
            var x2 = x1 + tip.w;
            var y2 = y1 + tip.h;
            if (x2 > view.x2 || y1 < view.y1 || y2 > view.y2) {
                return false;
            } else {
                return {
                    left:x1,
                    top:y1,
                    cls:'bx-tips-tr'
                };
            }
        },
        _testLT:function (el, tip, view) {
            var dis = this.get("dis");
            var x1 = el.x1 - tip.w - dis;
            var y1 = el.y1 - tip.h + dis;
            var y2 = y1 + tip.h;
            if (x1 < view.x1 || y1 < view.y1 || y2 > view.y2) {
                return false;
            } else {
                return {
                    left:x1,
                    top:y1,
                    cls:'bx-tips-lt'
                };
            }
        },
        _testLB:function (el, tip, view) {
            var dis = this.get("dis");
            var x1 = el.x1 - tip.w - dis;
            var y1 = el.y2 - dis;
            var y2 = y1 + tip.h;
            if (x1 < view.x1 || y2 > view.y2 || y1 < view.y1) {
                return false;
            } else {
                return {
                    left:x1,
                    top:y1,
                    cls:'bx-tips-lb'
                };
            }
        },
        _testRT:function (el, tip, view) {
            var dis = this.get("dis");
            var x1 = el.x2 + dis;
            var y1 = el.y1 - tip.h + dis;
            var x2 = x1 + tip.w;
            var y2 = y1 + tip.h;
            if (x2 > view.x2 || y1 < view.y1 || y2 > view.y2) {
                return false;
            } else {
                return {
                    left:x1,
                    top:y1,
                    cls:'bx-tips-rt'
                };
            }
        },
        _testRB:function (el, tip, view) {
            var dis = this.get("dis");
            var x1 = el.x2 + dis;
            var y1 = el.y2 - dis;
            var x2 = x1 + tip.w;
            var y2 = y1 + tip.h;
            if (x2 > view.x2 || y2 > view.y2 || y1 < view.y1) {
                return false;
            } else {
                return {
                    left:x1,
                    top:y1,
                    cls:'bx-tips-rb'
                };
            }
        },
        _getTipId:function (el) {
            return D.attr(el, "data-tipid");
        }
    };
    S.extend(Tips, Brick, {
        initialize:function () {
            var self = this;
            window.onresize = function () {
                var tips = self.get("tips");
                S.each(tips, function (item) {
                    self.closeTips(D.get("#" + item));
                });
            };
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

    S.augment(Tips, Tips.METHODS);
    return Tips;


}, {
    requires:["brix/core/brick", "node", "template"]
});