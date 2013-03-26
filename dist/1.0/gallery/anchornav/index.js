/*
 * 锚点导航组件
 * 
 * 使用方法:
 * 页面中的section需要加上rel属性
 * 传给工具条模版的数据需要提供rel属性，组件会自动查找和关联对应rel的section（调用组件时最好提供sectionContainer配置）
 * 配置的styleKind为不同样式和交互的区分，目前有1，2，3三种模式
 * 数据中的bgColor用于为不同的锚点按钮指定不同的背景色，如无特殊需求，不用设置
 * 数据中的iconfont用于为传入字体图标的unicode值，如果使用图片的话，请自行修改覆盖对应的css
 * 关于reach事件，是某区块上边触及浏览器顶部时算到达，并不是某区块滚动到可视区域的事件。
 */

KISSY.add('brix/gallery/anchornav/index', function(S, Brick) {

    
    var $ = S.one;

    function AnchorNav() {
        AnchorNav.superclass.constructor.apply(this, arguments);
    }

    AnchorNav.ATTRS = {
        /*
         * 是否带有图标，默认有，不带图标是，默认显示文本，不滑动
         * @cfg {Array}
         */
        styleKind : {
            value : 1 
        },
        /*
         * 鼠标悬浮锚点的class，和css样式关联，如需修改，请一同修改
         * @cfg {Array}
         */
        hoverClass : {
            value : 'hover'
        },
        /*
         * 当前锚点的class，和css样式关联，如需修改，请一同修改
         * @cfg {Array}
         */
        currentClass : {
            value : 'cur'
        },
        /*
         * 内容区块的父容易，不指定则为body
         * @cfg {Array}
         */
        sectionContainer : {
            value : 'body',
            getter : function(s) {
                return $(s)
            }
        },
        /*
         * 锚点工具条，距离屏幕右侧的距离, 默认20px
         * @cfg {Array}
         */
        rightPosition : {
            value : 20
        },

        /*
         * alwaysShow为true时，锚点工具条一直存在，不隐藏
         * @cfg {Array}
         */
        alwaysShow : {
            value : false
        },
        /*
         * styleKind为3的情况下，如果页面宽度或者高度不够的情况下，工具条自动收缩
         * 程序不判断,请根据页面具体情况指定
         * @cfg {Array}
         */
        autoFold : {
            value : false
        },
        /**
         * 模板数据, 预处理
         * @cfg {Object}
         */
        data: {
            value: false,
            getter : function(v) {
                if(v.list) {
                    var v = S.clone(v);
                    var d =  document.createElement('div');
                    S.each(v.list, function(o) {
                        d.innerHTML = o.iconfont;
                        o.iconfont = d.innerHTML;
                    });
                }
                return v;
            }
        }
    }

    AnchorNav.METHODS = {

        //设置传入的背景颜色
        addBackground : function(anchor) {
            var txt = anchor.one('.anchor-text');
            var bgColor = anchor.attr('bgColor');
            if(bgColor) {
                anchor.css({background: bgColor});
                txt.css({background: bgColor});
            }
        },

        //取消传入的背景颜色
        removeBackground : function(anchors) {
            var self = this;
            anchors.each(function(o) {
                var bgColor = o.attr('bgColor');
                var txt = o.one('.anchor-text');
                if(bgColor && !o.hasClass(self.get('currentClass'))) {
                    o.css({background: ''})
                    if(!self.hasIcon) txt.css({background: ''})
                }
            })
        },

        //设定当前锁定的anchor
        setCurrent : function(anchor) {
            this.anchors.removeClass(this.get('currentClass'));
            anchor.addClass(this.get('currentClass'));
            this.removeBackground(this.anchors);
            this.addBackground(anchor);
        },


        //滚动到anchor对应的位置
        scrollTo : function(anchor) {
            var self = this;
            var rel = anchor.attr('rel');
            var scrollTarget = this.sections[rel].section;
            var offset = scrollTarget.offset();

            //锁定滚动事件，避免滚动时触发scroll处理函数
            self.lockScroll = true;
            S.Anim(window, {
                scrollTop : offset.top 
            }, 0.3, "easeIn", function() {
                //到达目标位置后解锁滚动事件
                S.later(function() {
                    self.lockScroll = false;
                },50)
            }).run();
        },

        show : function() {
            var el = this.get('el');
            if(S.UA.ie == "6") {
                el.show();
            } else {
                S.Anim(el, {
                    right : this.get('rightPosition')
                }, 0.2, "easeOut", function() {

                }).run();
            }
            this.isShow = true;
        },

        hide : function() {
            var el = this.get('el');
            var self = this;
            if(S.UA.ie == "6") {
                el.hide();
                self.isShow = false;
            } else {
                S.Anim(el, {
                    right : -150
                }, 0.2, "easeIn", function() {
                   self.isShow = false; 
                }).run(); 
            }
        },

        //划出文本
        showTxt : function(anchor) {
            if(!this.hasIcon) return;
            var txt = anchor.one('.anchor-text');
            S.Anim(txt, {
                width : 80
            }, 0.2, "easeOut", function() {
            }).run();
        },

        //隐藏文本
        hideTxt : function(anchor, callBack) {
            if(!this.hasIcon) {
                callBack();
                return;
            }
            var self = this;
            var txt = anchor.one('.anchor-text');
            S.Anim(txt, {
                width : 0
            }, 0.2, "easeIn", function() {
                callBack();
            }).run();
        },

        _addFoldButton : function() {
            var el = this.get('el');
            var btn = $('<div class="anchor-foldBtn iconfont">&#410;</div>');
            this.foldBtn = btn;
            el.one('ul').hide();
            el.append(btn);
            el.addClass('.navbar-folded');
        }
    }

    AnchorNav.FIRES = {
        /*
         * @event reach
         * 滚动到达了某个section
         * @param e
         * @param e.section {Node} 到达的区块的kissy 对象
         * @param e.anchor {Node} 到达的区块对应的锚点的kissy 对象
         * @param e.anchor {String} 到达的区块的rel字段
         * @param e.top {Number} 到达的区块的offset().top值
         */
         reach: 'reach'
    };


    AnchorNav.EVENTS = {
        '.anchor-item' : {

            'mouseenter' : function(e) {
                var self = this;
                var anchor = $(e.currentTarget);
                anchor.addClass(this.get('hoverClass'))
                this.addBackground(anchor);
                self.mouseDelay = setTimeout(function(){
                    self.showTxt(anchor);
                },200)
                
            },

            'mouseleave' : function(e) {
                var self = this;
                var anchor = $(e.currentTarget);
                clearTimeout(self.mouseDelay);
                self.hideTxt(anchor, function() {
                    anchor.removeClass(self.get('hoverClass'))
                    self.removeBackground(anchor);
                })
            },

            'click' : function(e) {
                var anchor = $(e.currentTarget);
                this.setCurrent(anchor);
                this.scrollTo(anchor);
                e.preventDefault();
            }
        },

        //自动折叠的显示，仅当styleKind为3且autoFold设置为true时
        '.anchor-foldBtn' : {
            'mouseenter' : function(e) {
                if(this.get('styleKind') == 3 && this.get('autoFold')) {
                    var el = this.get('el');
                    this.foldBtn.hide();
                    el.removeClass('navbar-folded')
                    el.one('ul').slideDown(0.2,function(){
                    },'easeOut');
                }
            }
        },
        //自动折叠的隐藏，仅当styleKind为3且autoFold设置为true时
        '.anchor-list' : {
            'mouseleave' : function(e) {
                var self = this;
                if(this.get('styleKind') == 3 && this.get('autoFold')) {
                    var el = self.get('el');
                    el.one('.anchor-list').slideUp(0.2,function(){
                        el.addClass('navbar-folded')
                        self.foldBtn.show();
                    },'easeIn');
                    
                }
            }
        }

        
    }

    
    S.extend(AnchorNav, Brick, {
        initialize: function() {

            var self = this;
            var el = self.get('el');
            var styleKind = self.get('styleKind');
            self.anchors = el.all('.anchor-item');

            //绑定className, 设置不同的样式
            el.addClass('navbar-style-' + styleKind);

            //只有第一种模式下，文本会隐藏，并滑动显示
            if(styleKind == 1) self.hasIcon = true;

            if(styleKind == 3 && self.get('autoFold')) {
                self._addFoldButton();
            }

            //20毫秒内不重复执行
            $(window).on('scroll', S.buffer(self._onscroll, 20, self));

            //自动关联anchor和页面section
            var sections = {};
            self.anchors.each(function(anchor) {
                var rel = anchor.attr('rel');
                var section = self.get('sectionContainer').one('[rel=' + rel + ']');
                sections[rel] = {
                    section : section,
                    anchor : anchor 
                }
            });

            self.sections = sections;
            self._onscroll();
            AnchorNav.instance = self;

        },
        _onscroll : function() {

            //如果当前页面正在滚动中（点击锚点引起），不处理
            if(this.lockScroll) return;

            var self = this;
            var wtop = $(window).scrollTop();
            var currentObj = self.sections[$(self.anchors[0]).attr('rel')];

            //当第一个section距离页面顶部大于50px时，不显示锚点工具条

            var showTop = currentObj.top;

            if(!self.get('alwaysShow')) {
                if(showTop < (wtop + 50)) {
                    !self.isShow && self.show();
                } else {
                    self.isShow && self.hide();
                    if(showTop) return false;
                }
            }
            

            //关联工具条中的锚点状态
            self.anchors.each(function(anchor) {
                var sectionObject = self.sections[anchor.attr('rel')];
                var section = sectionObject.section;
                sectionObject.top = sectionObject.top || section.offset().top;
                sectionObject.height = sectionObject.height || section.height();
                currentObj = sectionObject;
                if(currentObj.top + currentObj.height > wtop) return false;
            })

            self.setCurrent(currentObj.anchor);
            self.fire('reach', currentObj);
        }
    })

    S.augment(AnchorNav, AnchorNav.METHODS);
    return AnchorNav;
}, {
    requires: ["brix/core/brick"]
});