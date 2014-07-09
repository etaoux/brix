KISSY.add("brix/gallery/lavalamp/index", function(S, Brick, Anim, Node) {
    /**
     * Lavalamp 滑动菜单
     * <br><a href="../demo/gallery/lavalamp/lavalamp.html" target="_blank">Demo</a>
     * @class Brix.Gallery.Lavalamp
     * @extends Brix.Brick
     */
    function Lavalamp() {
        Lavalamp.superclass.constructor.apply(this, arguments);
    }
    var Lavalamp = Brick.extend({
        bindUI: function() {
            var self = this,
                trigger = self.get('el');
            var anim, backNode = new Node('<li class="back"></li>'),
                liNodeList = trigger.all('li'),
                currendNode = (trigger.one('.current') || liNodeList[0].addClass('current'))[0];

            trigger.append(backNode);
            liNodeList.each(function(el) {

                if (self.get('triggered') == 'mouseover') {
                    el.on('mouseenter', function() {
                        move(el[0]);
                    });
                    el.on('click', function(e) {
                        setCurr(el[0]);
                        return self.get('click').apply(self, [e]);
                    });
                } else {
                    el.on('click', function(e) {
                        move(el[0]);
                        setCurr(el[0]);
                        return self.get('click').apply(self, [e]);
                    });
                }
            });
            trigger.on('mouseleave', function() {
                move(currendNode);
            })

            setCurr(currendNode);

            function setCurr(el) {
                backNode.css({
                    "left": el.offsetLeft + "px",
                    "width": el.offsetWidth + "px"
                });
                currendNode = el;
            };

            function move(el) {
                if (anim) {
                    //anim = null;
                    anim.stop();
                }
                anim = new Anim(backNode[0], {
                    width: el.offsetWidth + 'px',
                    left: el.offsetLeft + 'px'
                }, self.get('speed'), self.get('fx'));
                anim.run();
            };
        },
        destructor: function() {

        }
    });
    Lavalamp.ATTRS = {
        /**
         * 动画效果
         * @cfg {String}
         */
        fx: {
            value: 'bounceOut'
        },
        /**
         * 动画时间
         * @cfg {Number}
         */
        speed: {
            value: 0.4
        },
        /**
         * 触发方式“click”，“mouseover”
         * @cfg {String}
         */
        triggered: {
            value: 'mouseover' 
        },
        /**
         * 点击的回调方法
         * @cfg {Function}
         */
        click: {
            value: function() {

            }
        }
    };



    return Lavalamp;
}, {
    requires: ["brix/core/brick", "anim", "node"]
});