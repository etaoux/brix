KISSY.add('brix/gallery/share/index', function(S, Brick){
    function Share() {
        Share.superclass.constructor.apply(this, arguments);
    }

    Share.ATTRS = {
        name : {
            value : 'Share'
        },
        isFord : {
            value : false
        },
        hastips : {
            value : ''
        },
        duration: {
            value : 0.3
        }
    };

    Share.METHODS = {
        clearTimer : function(dispatcher){
            if(dispatcher.timer){
                clearTimeout(dispatcher.timer);
                dispatcher.timer = 0;
            }
        },
        turn : function(el, effect, duration, easing, fn, bfn, prop){
            if(typeof(bfn) == 'Function'){
                bfn();
            }
            if(effect == 'animate'){
               el.animate(prop, duration, easing, fn); 
            }else{
               el[effect](duration, fn, easing); 
            }

        },
        unfold : function(callback){
            var self = this;

            if(self.get('type') == 'popup'){
                self.show(callback);
            }else{
                self.expand(callback);
            }
        },
        fold : function(callback){
            var self = this;
            
            if(self.get('type') == 'popup'){
                self.hide(callback);
            }else{
                self.shrink(callback);
            }
        },
        expand : function(callback){
            var $ = S.all;
            var self = this,
                mod = self.get('el'),
                ext = $('.ext', mod),
                arrow =  $('.icon-arrow', mod),
                duration = self.get('duration');

            ext.css(self.initProp);

            self.turn(ext, 'animate', duration, 'easeOut', function(){
                callback();
                arrow.filter('.icon-arrow-l').html('&#402;');
                arrow.filter('.icon-arrow-r').html('&#403;');
                arrow.filter('.icon-arrow-d').html('&#404;');
                ext.css({
                    overflow : 'visible'
                });
            }, undefined, self.expendProp);

        },
        shrink : function(callback){
            var $ = S.all;
            var self = this,
                mod = self.get('el'),
                ext = $('.ext', mod),
                arrow =  $('.icon-arrow', mod),
                duration = self.get('duration');

            ext.css({overflow:'hidden'});

            self.turn(ext, 'animate', duration, 'easeIn', function(){
                callback();
                arrow.filter('.icon-arrow-l').html('&#403;');
                arrow.filter('.icon-arrow-r').html('&#402;');
                arrow.filter('.icon-arrow-d').html('&#405;');
                ext.css(self.initProp);
            }, undefined, self.shrinkProp);

        },
        show : function(callback){
            var $ = S.all;
            var self = this,
                mod = self.get('el'),
                activeClass = " popup-share-active",
                panel = S.one('.panel-popup', mod),
                duration = self.get('duration');

                $(mod).addClass(activeClass);
                self.turn(panel, 'fadeIn', duration, 'easeOut', callback);

        },
        hide : function(callback){
            var $ = S.all;
            var self = this,
                mod = self.get('el'),
                activeClass = "popup-share-active",
                panel = S.one('.panel-popup', mod),
                duration = self.get('duration');

                self.turn(panel, 'fadeOut', duration, 'easeIn', function(){
                    callback();
                    $(mod).removeClass(activeClass);
                });
        },
        showTips : function(btn, fn){
            var self = this;
            var tips = S.one('.tips', btn),
                angle = S.one('.angle', tips),
                left = btn.offset().left + Math.round(btn.width()/2.0),
                width = Math.round(tips.width()/2.0) + Math.round(btn.width()/2.0),
                _css = {'margin-left' : (0 - width) + 'px'},
                min_sep = 3;

            if(tips) {
                if(tips.hasClass('tips-up')){

                    if(left - width < min_sep){
                        _css = {'margin-left' : (0 - ( left - min_sep )) + 'px'};
                        if(btn.offset().left == 0) {
                            if(!tips.hasClass('.tips-up-left'))
                                tips.addClass('.tips-up-left');      
                        }else{
                            angle.css({'margin-left' :  ( left - width - min_sep - 5 ) + 'px'});
                        }
                    }

                    if(left + width + min_sep >= S.DOM.viewportWidth()){

                        _css = {'margin-left' : (0 - (width + left + width + min_sep - S.DOM.viewportWidth())) + 'px'};
                       
                        if(btn.offset().left + btn.outerWidth() + min_sep >= S.DOM.viewportWidth()) {
                            if(!tips.hasClass('.tips-up-right'))
                                tips.addClass('.tips-up-right'); 
                            angle.css({'left' : (width + Math.floor(tips.width()/2.0)) - 3 + 'px'});         
                        }else{
                            angle.css({'margin-left' : (left + width + min_sep - S.DOM.viewportWidth() - 5) + 'px'});
                        }

                    }

                    tips.css(_css);
                }

                self.turn(tips, 'fadeIn', 0.3, 'easeNone', fn);
            }

        },
        hideTips : function(btn, fn){
            var self = this;
            var tips = S.one('.tips', btn);
            if(tips)
                self.turn(tips, 'fadeOut', 0.3, 'easeNone', fn);
        }
    };

    Share.EVENTS = {
        '' : {
            mouseenter : function(e){
                var $ = S.all;
                var self = this,
                    isFord = self.get('isFord'),
                    dispatcher = self.dispatcher,
                    delay = 300;

                if(dispatcher){
                   self.clearTimer(dispatcher);
                }

                if(!isFord){
                    dispatcher.timer = setTimeout(function(){
                        self.unfold(function(){
                            self.set('isFord', true);
                        });
                    }, delay);
                }

            },
            mouseleave : function(e){
                var $ = S.all;
                var self = this,
                    isFord = self.get('isFord'),
                    dispatcher = self.dispatcher,
                    delay = 300;

                if(dispatcher){
                    self.clearTimer(dispatcher);
                }

                if(isFord){
                    dispatcher.timer = setTimeout(function(){
                        self.fold(function(){
                            self.set('isFord', false);
                        });
                    }, delay);
                }
            }
        },
        '.btn-share' : {
            mouseenter : function(e){
                var $ = S.all,
                    self = this,
                    delay = 300,
                    dispatcher = e.currentTarget.dispatcher;

                var btn = $(e.currentTarget);

                self.clearTimer(dispatcher);

                if(dispatcher.isTipsShow){
                    dispatcher.timer = setTimeout(function(){
                        if(self.get('hastips')){
                            $('.btn-share',self.get('el')).each(function(el){
                                el.children('.tips').hide();
                                el[0].dispatcher.isTipsShow = true;
                            });
                            self.showTips(btn, function(){
                                dispatcher.isTipsShow = false;
                            });
                        }
                    }, delay);
                }

            },
            mouseleave : function(e){
                var $ = S.all,
                    self = this,
                    delay = 300,
                    dispatcher = e.currentTarget.dispatcher;

                var btn = $(e.currentTarget);

                self.clearTimer(dispatcher);

                if(!dispatcher.isTipsShow){
                    dispatcher.timer = setTimeout(function(){
                        if(self.get('hastips')){
                            self.hideTips(btn, function(){
                                dispatcher.isTipsShow = true;
                            });
                        }
                    }, delay);
                }

            }
        }
         
    };

    S.extend(Share, Brick, {
        initialize: function(e) {
            var $ = S.all;
            var self = this;
            var mod = self.get('el');
            var ext = S.one('.ext', mod);

            self.dispatcher = { timer : 0 };

            if(ext){
                self.initProp = {
                    opacity : 0,
                    overflow: 'hidden'
                };
                self.expendProp = {
                    opacity : 1
                }
                self.shrinkProp = {
                    opacity : 0
                };

                var p = 'width';

                if($(mod).hasClass('share-vertical')){
                    p = 'height';
                }

                self.initProp[p] = 0;
                self.expendProp[p] = ext[p]() + 'px';
                self.shrinkProp[p] = 0;
                ext.css({'display':''})                
                ext.css(self.initProp);
            }

            $('.btn-share',self.get('el')).each(function(el){
                el[0].dispatcher = { isTipsShow: true, timer : 0};
            });

        }
    });

    S.augment(Share, Share.METHODS);

    return Share;
    
}, {
    requires: ['brix/core/brick']
});
