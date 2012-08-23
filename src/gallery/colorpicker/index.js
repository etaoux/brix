KISSY.add('brix/gallery/colorpicker/index', function(S, Brick, Overlay, DD) {
    var type = (window.SVGAngle || document.implementation.hasFeature("http://www.w3.org/TR/SVG11/feature#BasicStructure", "1.1") ? "SVG" : "VML");

    /**
     * Create SVG element.
     */

    function $C(el, attrs, children) {
        el = document.createElementNS('http://www.w3.org/2000/svg', el);
        for (var key in attrs)
        el.setAttribute(key, attrs[key]);
        if (Object.prototype.toString.call(children) != '[object Array]') children = [children];
        var i = 0,
            len = (children[0] && children.length) || 0;
        for (; i < len; i++)
        el.appendChild(children[i]);
        return el;
    }


    function ColorPicker() {
        ColorPicker.superclass.constructor.apply(this, arguments);
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
    }
    ColorPicker.ATTRS = {
        min:{
            value:false
        },
        trigger:{
            value:false
        },
        triggerType:{
            value:['click']
        },
        align: {
            value: {
                node: false,
                points: ['bl', 'tl'],
                offset: [0, 0]
            }
        },
        colorList: {
            value: ['#d81e06', '#f4ea2a', '#1afa29', '#1296db', '#13227a', '#d4237a', '#ffffff', '#e6e6e6', '#dbdbdb', '#cdcdcd', '#bfbfbf', '#8a8a8a', '#707070', '#515151', '#2c2c2c', '#000000', '#ea986c', '#eeb174', '#f3ca7e', '#f9f28b', '#c8db8c', '#aad08f', '#87c38f', '#83c6c2', '#7dc5eb', '#87a7d6', '#8992c8', '#a686ba', '#bd8cbb', '#be8dbd', '#e89abe', '#e8989a', '#e16632', '#e98f36', '#efb336', '#f6ef37', '#afcd51', '#7cba59', '#36ab60', '#1baba8', '#17ace3', '#3f81c1', '#4f68b0', '#594d9c', '#82529d', '#a4579d', '#db649b', '#dd6572', '#d81e06', '#e0620d', '#ea9518', '#f4ea2a', '#8cbb1a', '#2ba515', '#0e932e', '#0c9890', '#1295db', '#0061b2', '#0061b0', '#004198', '#122179', '#88147f', '#d3227b', '#d6204b']
        },
        data: {
            valueFn: function() {
                return {
                    colorList: this.get('colorList'),
                    color: this.get('color'),
                    min:this.get('min')
                };
            }
        },
        tmpl: {
            value: '<div class="colorpicker">' + '<div class="colorpicker-hd">' + '<ul>' + '{{#colorList}}' + '<li val="{{.}}" style="background-color:{{.}};"></li>' + '{{/colorList}}' + '</ul>' + '</div>' + '<div class="colorpicker-md">' + '<i class="iconfont icon-arrow {{^min}}icon-arrow-up{{/min}}">{{#min}}&#405{{/min}}{{^min}}&#404{{/min}}</i>' + '</div>' + '<div class="colorpicker-bd {{#min}}colorpicker-bd-min{{/min}}">' + '<div class="picker-wrapper">' + '<div class="picker"></div>' + '<i class="iconfont icon-picker-indicator">&#470</i>' + '</div>' + '<div class="slide-wrapper">' + '<div class="slide"></div>' + '<i class="iconfont icon-slide-indicator">&#461</i>' + '</div>' + '</div>' + '<div class="colorpicker-fd">' + '<span class="bg" style="background-color:{{color}}"></span><input type="text" value="{{color}}"><a class="btn btn-size25 btn-confirm">确定</a>' + '</div>' + '</div>'
        },
        color: {
            value: '#ffffff'
        }
    };
    ColorPicker.DOCATTACH = {
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
    }
    ColorPicker.ATTACH = {
        '.picker': {
            click: function(e) {
                var self = this,
                    offset = self.pickerNode.offset(),
                    left = e.pageX-offset.left,
                    top = e.pageY-offset.top,
                    width = self.pickerNode.width(),
                    height = self.pickerNode.height(),
                    s = left / width,
                    v = (height - top) / height;
                self.setHsv({
                    h: self.h,
                    s: s,
                    v: v
                });
            }
        },
        '.slide': {
            click: function(e) {
                var self = this,
                    offset = self.slideNode.offset(),
                    height = self.slideNode.height(),
                    top = ((e.pageY-offset.top>=height)?height-1:e.pageY-offset.top),
                    h = top / height * 360;
                self.setHsv({
                    h: h,
                    s: self.s,
                    v: self.v
                });
            }
        },
        '.btn-confirm': {
            click: function(e) {
                this._fireSelected();
            }
        },
        'li': {
            click: function(e) {
                var color = S.one(e.currentTarget).attr('val');
                this.setHex(color);
                //this._fireSelected();
            }
        },
        '.icon-arrow': {
            click: function(e) {
                var self = this,
                    animateNode = self.get('el').one('.colorpicker-bd');
                var node = S.one(e.currentTarget);
                animateNode.stop();
                if (node.hasClass('icon-arrow-up')) {
                    node.removeClass('icon-arrow-up');
                    animateNode.css('overflow', 'hidden');
                    animateNode.animate({
                        height: 0,
                        'marginBottom': 0
                    }, 0.3, 'easyNone', function() {
                        node.html('&#405');
                    });
                } else {
                    node.addClass('icon-arrow-up');
                    animateNode.animate({
                        height: 196,
                        marginBottom: 10
                    }, 0.3, 'easyNone', function() {
                        node.html('&#404');
                        animateNode.css('overflow', 'visible');
                    });
                }
            }
        },
        'input':{
            'blur':function(e){
                var self = this,v= S.one(e.currentTarget).val();
                if(self.get('color')!=v){
                    this.setHex(v);
                }
            }
        }
    };

    ColorPicker.FIRES = {
        /**
         * selected 事件，在点击确定后触发
         * @type {String}
         */
        selected:'selected',
        show: 'show',
        hide: 'hide'
    };

    ColorPicker.METHOD = {
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
                self.fire(ColorPicker.FIRES.show);
            }

        },
        hide: function() {
            var self = this;
            if (self.overlay) {
                self.overlay.hide();
                self.fire(ColorPicker.FIRES.hide);
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
        },
        /**
         * Convert HSV representation to RGB HEX string.
         * Credits to http://www.raphaeljs.com
         */
        hsv2rgb: function(h, s, v) {
            var R, G, B, X, C;
            h = (h % 360) / 60;
            C = v * s;
            X = C * (1 - Math.abs(h % 2 - 1));
            R = G = B = v - C;

            h = ~~h;
            R += [C, X, 0, 0, X, C][h];
            G += [X, C, C, X, 0, 0][h];
            B += [0, 0, X, C, C, X][h];

            var r = R * 255,
                g = G * 255,
                b = B * 255;
            return {
                r: r,
                g: g,
                b: b,
                hex: "#" + (16777216 | b | (g << 8) | (r << 16)).toString(16).slice(1)
            };
        },
        /**
         * Convert RGB representation to HSV.
         * r, g, b can be either in <0,1> range or <0,255> range.
         * Credits to http://www.raphaeljs.com
         */
        rgb2hsv: function(r, g, b) {
            if (r > 1 || g > 1 || b > 1) {
                r /= 255;
                g /= 255;
                b /= 255;
            }
            var H, S, V, C;
            V = Math.max(r, g, b);
            C = V - Math.min(r, g, b);
            H = (C == 0 ? null : V == r ? (g - b) / C + (g < b ? 6 : 0) : V == g ? (b - r) / C + 2 : (r - g) / C + 4);
            H = (H % 6) * 60;
            S = C == 0 ? 0 : C / V;
            return {
                h: H,
                s: S,
                v: V
            };
        },
        /**
         * Sets color of the picker in hsv/rgb/hex format.
         * @param {object} hsv Object of the form: { h: <hue>, s: <saturation>, v: <value> }.
         * @param {object} rgb Object of the form: { r: <red>, g: <green>, b: <blue> }.
         * @param {string} hex String of the form: #RRGGBB.
         */
        setColor: function(hsv, rgb, hex) {
            var self = this;
            self.h = hsv.h % 360;
            self.s = hsv.s;
            self.v = hsv.v;
            var c = self.hsv2rgb(self.h, self.s, self.v);

            self.slideDragNode.css({
                top: Math.round(self.h * self.slideNode.height() / 360 - 5)
            });
            var left = Math.round(self.s * self.pickerNode.width() - 5),
                top = Math.round((1 - self.v) * self.pickerNode.height() - 5);
            self.pickerDragNode.css({
                left: left,
                top: top,
                color: top > 98 ? '#fff' : '#000'
            });
            self.pickerNode.css({
                "background-color": self.hsv2rgb(self.h, 1, 1).hex
            });
            self.get('el').one('.bg').css({
                "background-color": c.hex
            });
            self.set('color',c.hex);
            self.get('el').one('input').val(c.hex);
        },
        /**
         * 设置颜色
         * @param {Object} hsv hsv对象 { h: <hue>, s: <saturation>, v: <value> }
         */
        setHsv: function(hsv) {
            this.setColor(hsv);
        },
        /**
         * 设置颜色
         * @param {Object} rgb rgb对象 { r: <red>, g: <green>, b: <blue> }
         */
        setRgb: function(rgb) {
            this.setColor(this.rgb2hsv(rgb.r, rgb.g, rgb.b), rgb);
        },
        /**
         * 设置颜色
         * @param {String} hex 颜色值#RRGGBB.
         */
        setHex: function(hex) {
            this.setColor(this.rgb2hsv(parseInt(hex.substr(1, 2), 16), parseInt(hex.substr(3, 2), 16), parseInt(hex.substr(5, 2), 16)), undefined, hex);
        }
    };


    S.extend(ColorPicker, Brick, {
        initialize: function() {
            var self = this;
            this.h = 0;
            this.s = this.v = 1;
            var align = self.get('align');
            self.overlay = new Overlay({
                srcNode: '#' + self.get('id'),
                align: align
            });
            self.overlay.render();
            var el = self.get('el'),
                slideNode = self.slideNode = el.one('.slide'),
                pickerNode = self.pickerNode = el.one('.picker');
            if (type == 'SVG') {
                slideNode.append($C('svg', {
                    xmlns: 'http://www.w3.org/2000/svg',
                    version: '1.1',
                    width: '100%',
                    height: '100%'
                }, [
                $C('defs', {}, $C('linearGradient', {
                    id: 'gradient-hsv',
                    x1: '0%',
                    y1: '100%',
                    x2: '0%',
                    y2: '0%'
                }, [
                $C('stop', {
                    offset: '0%',
                    'stop-color': '#FF0000',
                    'stop-opacity': '1'
                }), $C('stop', {
                    offset: '13%',
                    'stop-color': '#FF00FF',
                    'stop-opacity': '1'
                }), $C('stop', {
                    offset: '25%',
                    'stop-color': '#8000FF',
                    'stop-opacity': '1'
                }), $C('stop', {
                    offset: '38%',
                    'stop-color': '#0040FF',
                    'stop-opacity': '1'
                }), $C('stop', {
                    offset: '50%',
                    'stop-color': '#00FFFF',
                    'stop-opacity': '1'
                }), $C('stop', {
                    offset: '63%',
                    'stop-color': '#00FF40',
                    'stop-opacity': '1'
                }), $C('stop', {
                    offset: '75%',
                    'stop-color': '#0BED00',
                    'stop-opacity': '1'
                }), $C('stop', {
                    offset: '88%',
                    'stop-color': '#FFFF00',
                    'stop-opacity': '1'
                }), $C('stop', {
                    offset: '100%',
                    'stop-color': '#FF0000',
                    'stop-opacity': '1'
                })])), $C('rect', {
                    x: '0',
                    y: '0',
                    width: '100%',
                    height: '100%',
                    fill: 'url(#gradient-hsv)'
                })]));
                pickerNode.append($C('svg', {
                    xmlns: 'http://www.w3.org/2000/svg',
                    version: '1.1',
                    width: '100%',
                    height: '100%'
                }, [
                $C('defs', {}, [
                $C('linearGradient', {
                    id: 'gradient-black',
                    x1: '0%',
                    y1: '100%',
                    x2: '0%',
                    y2: '0%'
                }, [
                $C('stop', {
                    offset: '0%',
                    'stop-color': '#000000',
                    'stop-opacity': '1'
                }), $C('stop', {
                    offset: '100%',
                    'stop-color': '#CC9A81',
                    'stop-opacity': '0'
                })]), $C('linearGradient', {
                    id: 'gradient-white',
                    x1: '0%',
                    y1: '100%',
                    x2: '100%',
                    y2: '100%'
                }, [
                $C('stop', {
                    offset: '0%',
                    'stop-color': '#FFFFFF',
                    'stop-opacity': '1'
                }), $C('stop', {
                    offset: '100%',
                    'stop-color': '#CC9A81',
                    'stop-opacity': '0'
                })])]), $C('rect', {
                    x: '0',
                    y: '0',
                    width: '100%',
                    height: '100%',
                    fill: 'url(#gradient-white)'
                }), $C('rect', {
                    x: '0',
                    y: '0',
                    width: '100%',
                    height: '100%',
                    fill: 'url(#gradient-black)'
                })]));
            } else {
                if (!document.namespaces['v']) {
                    document.namespaces.add('v', 'urn:schemas-microsoft-com:vml', '#default#VML');
                }
                slideNode.html(['<div style="position: relative; width: 100%; height: 100%">', '<v:rect style="position: absolute; top: 0; left: 0; width: 100%; height: 100%" stroked="f" filled="t">', '<v:fill type="gradient" method="none" angle="0" color="red" color2="red" colors="8519f fuchsia;.25 #8000ff;24903f #0040ff;.5 aqua;41287f #00ff40;.75 #0bed00;57671f yellow"></v:fill>', '</v:rect>', '</div>'].join(''));
                pickerNode.html(['<div style="position: relative; width: 100%; height: 100%">', '<v:rect style="position: absolute; left: -1px; top: -1px; width: 101%; height: 101%" stroked="f" filled="t">', '<v:fill type="gradient" method="none" angle="270" color="#FFFFFF" opacity="100%" color2="#CC9A81" o:opacity2="0%"></v:fill>', '</v:rect>', '<v:rect style="position: absolute; left: 0px; top: 0px; width: 100%; height: 101%" stroked="f" filled="t">', '<v:fill type="gradient" method="none" angle="0" color="#000000" opacity="100%" color2="#CC9A81" o:opacity2="0%"></v:fill>', '</v:rect>', '</div>'].join(''));
            }

            var pickerDragNode = self.pickerDragNode = el.one('.icon-picker-indicator'),
                slideDragNode = self.slideDragNode = el.one('.icon-slide-indicator');
            var pickerDrag = new DD.Draggable({
                node: pickerDragNode,
                cursor: 'move'
            });

            pickerDrag.on('drag', function(ev) {
                var offset = pickerNode.offset();
                var width = pickerNode.width(),
                    height = pickerNode.height();
                var left = ev.left - offset.left,
                    top = ev.top - offset.top;
                if (left > width) {
                    left = width;
                } else if (left < 0) {
                    left = 0;
                } else {
                    left += 5;
                }
                if (top > height) {
                    top = height;
                } else if (top < 0) {
                    top = 0;
                } else {
                    top += 5;
                }

                var s = left / width,
                    v = (height - top) / height;
                self.setHsv({
                    h: self.h,
                    s: s,
                    v: v
                });
            });

            var slideDrag = new DD.Draggable({
                node: slideDragNode,
                cursor: 'move'
            });

            slideDrag.on('drag', function(ev) {
                var offset = slideNode.offset();
                var height = slideNode.height(),
                    top = ev.top - offset.top;
                if (top + 5 > height) {
                    top = height - 1;
                } else if (top < 0) {
                    top = 0;
                } else {
                    top += 5;
                }
                h = top / self.slideNode.height() * 360;
                self.setHsv({
                    h: h,
                    s: self.s,
                    v: self.v
                });
            });
            self.setHex(self.get('color'));
        },
        _fireSelected: function() {
            var self = this,
                c = self.hsv2rgb(self.h, self.s, self.v);
            self.overlay.hide();
            self.fire(ColorPicker.FIRES.selected, {
                hex: c.hex,
                hsv: {
                    h: self.h,
                    s: self.s,
                    v: self.v
                },
                rgb: {
                    r: c.r,
                    g: c.g,
                    b: c.b
                }
            });
        },
        destructor: function() {
            var self= this;
            self.overlay.destroy();
        }
    });
    S.augment(ColorPicker, ColorPicker.METHOD);
    return ColorPicker;
}, {
    requires: ["brix/core/brick", "overlay", "dd"]
});