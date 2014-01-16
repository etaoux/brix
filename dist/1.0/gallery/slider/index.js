KISSY.add('brix/gallery/slider/index', function(S, Brick, UA, Node, DD) {
    /**
     * Slider 滑块
     * <br><a href="../demo/gallery/slider/slider.html" target="_blank">Demo</a>
     * @class Brix.Gallery.Slider
     * @extends Brix.Brick
     */
    function Slider() {
        Slider.superclass.constructor.apply(this, arguments);
    }

    Slider.FIRES = {
        /**
         * @event drag
         * 拖拽
         */
        drag : "drag",
        /**
         * @event dragstart
         * 开始拖拽
         */
        dragstart : "dragstart",
        /**
         * @event dragend
         * 结束拖拽
         */
        dragend : "dragend",
        /**
         * @event resize
         * 重置大小
         */
        resize : "resize"
    }

    var MODE ={
        horizontal : "horizontal",
        vertical : "vertical"
    }

    Slider.ATTRS = {

        /**
         * 支持数组滚动
         * @cfg {Boolean}
         */
        range : {
            value : false
        },
        /**
         * 展现的横竖方式， horizontal：横向， vertical：竖向
         * @cfg {String}
         */
        mode : {
            value : "horizontal"
        },
        /**
         * 启始的开始值
         * @cfg {Number}
         */
        startStep : {
            value : 0
        },
        /**
         * 启始的结束值
         * @cfg {Number}
         */
        endStep : {
            value : 100
        },

        /**
         * 整数值，值是integerStep的倍数 integerStep 可以设置成0.5
         * @cfg {Number}
         */
        integerStep : {
            value : 1
        },

        /**
         * 当前值
         * @cfg {Number}
         */
        current : {

        },

        /**
         * knob的居中偏移量，margin-left：-7px
         * @cfg {Number}
         */
        knobOffset:{
            value : -7
        }

    };

    Slider.METHODS = {
        resize : function(){
            this.fire(Slider.FIRES.resize);
        },
        destructor: function(){
            this.knob.destroy();
            this.knob_start && this.knob_start.destroy();
            this.knobNode = null;
            this.knobNode_start = null;
            self.detach();
        }

    };

    S.extend(Slider, Brick, {
        initialize: function() {
            this._render_range();
            this._render_knob();
        },

        // 处理 拖动按钮
        _render_knob : function(){
            var self = this,
                el = self.get('el'),
                mode = self.get("mode"),
                startStep = self.get("startStep"), endStep = self.get("endStep"),
                integer = self.get("integerStep"),
                barNode = el.one(".slider-bar"),
                knobNode = el.one(".slider-knob-end"),
                knobNode_start = this.knobNode_start = el.one(".slider-knob-start"),
                knobNode_left_val = 0,  // 表示拖动按钮的像素值。
                knobNode_start_left_val = null,

                knobOffset = self.get("knobOffset"),
                vertical = mode === MODE.horizontal ? false : true,
                left_top = !vertical ? "left" : "top",
                left_bottom = !vertical ? "left" : "bottom",
                width_height = !vertical ? "width" : "height";

            knobNode = knobNode || el.one(".slider-knob");
            this.knobNode = knobNode;


            // 创建一个拖动按钮
            var knob = self.knob = new DD.Draggable({
                    node: knobNode,
                    cursor: 'move'
                });
            knob.on('drag', function(ev){
                var offset = el.offset(),
                    max_set = vertical ? el.height() : el.width(),
                    val = knobNode_left_val = ev[left_top] - offset[left_top] - knobOffset;
                if(vertical){
                    //如果是垂直，选中在下面，因此要最大值减val
                    knobNode_left_val = max_set - val;
                }
                knobNode_left_val = valid_value(knobNode_left_val, knobNode_start_left_val || 0,max_set);

                barNode.css(width_height, Math.abs(knobNode_left_val - (knobNode_start_left_val || 0)));
                barNode.css(left_bottom, knobNode_start_left_val || 0);
                knobNode.css(left_bottom, knobNode_left_val);
                change({target : knobNode});
            });

            knob.on("dragstart", dragstart)
            knob.on('dragend',dragend);

            // 有两个knob  说明是区间
            if(knobNode_start){
                var knob_start = self.knob_start = new DD.Draggable({
                    node: knobNode_start,
                    cursor: 'move'
                });
                knob_start.on('drag', function(ev){
                    var offset = el.offset(),
                        max_set = vertical ? el.height() : el.width(),
                        val = knobNode_start_left_val = ev[left_top] - offset[left_top] - knobOffset;

                    if(vertical){
                        //如果是垂直，选中在下面，因此要最大值减val
                        knobNode_start_left_val = max_set - val;
                    }
                    knobNode_start_left_val =  valid_value(knobNode_start_left_val,0,knobNode_left_val);

                    barNode.css(left_bottom, knobNode_start_left_val);
                    barNode.css(width_height, Math.abs(knobNode_left_val - knobNode_start_left_val));
                    knobNode_start.css(left_bottom, knobNode_start_left_val);
                    change({target : knobNode_start});
                });
                knob_start.on("dragstart", dragstart)
                knob_start.on('dragend',dragend);

            }

            // 说明有设置初始值
            if(!S.isUndefined(self.get("current")) ){
                self.value = self.value || self.get("current");
                _render_current();

            }

            //
            self.on(Slider.FIRES.resize, _render_current);


            // 处理当前展现状态
            function _render_current (){
                var current  = self.value, tmp, val, val_start,
                    max_set = vertical ? el.height() : el.width();

                if(S.isArray(current)){
                    // 处理两个拖动按钮的
                    current[0] = valid_value(current[0],startStep,endStep);
                    current[1] = valid_value(current[1],startStep,endStep);
                    knobNode_left_val = max_set * (current[1] - startStep) / (endStep - startStep)
                    knobNode_start_left_val = max_set * (current[0] - startStep) / (endStep - startStep)

                    knobNode.css(left_bottom, knobNode_left_val)
                    knobNode_start.css(left_bottom, knobNode_start_left_val)
                    barNode.css(left_bottom, knobNode_start_left_val);
                    barNode.css(width_height, Math.abs(knobNode_left_val - knobNode_start_left_val));
                    if(knobNode_start_left_val == max_set){
                        knobNode_start.css("zIndex", 2);
                    }else{
                        knobNode_start.css("zIndex", "auto");
                    }
                }else{
                    current = valid_value(current,startStep,endStep);
                    knobNode_left_val = max_set * (current - startStep) / (endStep - startStep);

                    barNode.css(width_height, Math.abs(knobNode_left_val));
                    knobNode.css(left_bottom, knobNode_left_val);
                }
            }

            // 验证值
            function valid_value(current,startStep,endStep){
                if(S.isUndefined(current)){
                    current = startStep;
                }
                if (current < startStep && current < endStep){
                    current = startStep;
                }
                if(current > endStep && current > startStep ){
                    current = endStep;
                }
                return current;
            }

            // change 事件，同时处理 integerStep 倍数
            function change(e){
                var max_set = vertical ? el.height() : el.width(),
                    val = (endStep - startStep) * knobNode_left_val / max_set + startStep,
                    val2 = knobNode_start_left_val === null ? null : ((endStep - startStep) * knobNode_start_left_val / max_set + startStep);
                if(integer){
                    // 处理整数值的倍数
                    val = Math.round(val/integer) * integer ;
                    val2 = val2 === null ? null :  Math.round(val2 / integer) * integer
                }
                    S.log( "(" + endStep+ "-" + startStep+ ")*" + knobNode_left_val + "/" + max_set + "+"+startStep)
                if (knobNode_start){
                    self.value = [val2, val];
                }else{
                    self.value = val;
                }

                set_current(self.value);
                self.fire(Slider.FIRES.drag, {data: self.value , current : self.get("current")})

                S.log("Slider: change=" + self.value + "," + self.get("current"));
            }


            // 设置当前值
            function set_current(val){
                var range = self.get("range"), current;
                if(S.isArray(val)){
                    // 如果是区间 0 - 100，如果用户把后面的拖动拉到前面的，
                    // 可能会出现 val = [50, 40] ，因此我们需要把它转化成 val = [40,50]
                    if(startStep < endStep && val[0] > val[1]){
                        val = [val[1], val[0]];
                    }
                    if(startStep > endStep && val[0] < val[1]){
                        val = [val[1], val[0]];
                    }
                }
                current = val;
                // 处理数组数据
                if(S.isArray(self.get("range"))){
                    if(S.isArray(val)){
                        current = [range[val[0]], range[val[1]]];

                    }else{
                        current = range[val];
                    }
                }
                self.set("current", current);
            }
            function dragstart(){
                self.fire(Slider.FIRES.dragstart, {data: self.value , current : self.get("current")});
            }
            function dragend(){
                _render_current();
                self.fire(Slider.FIRES.dragend, {data: self.value , current : self.get("current")});
            }
        },

        // 预处理是数组数据
        _render_range : function(){
            if(S.isArray(this.get("range"))){
                this.set("endStep", this.get("range").length - 1);
                S.log("slider: range " + this.get("range"));
                if(S.isString(this.get("current"))){
                    this.value = S.indexOf(this.get("current"),this.get("range"));
                }
            }
        }

    });


    S.augment(Slider, Slider.METHODS);
    return Slider;
}, {
    requires: ["brix/core/brick", "ua","node", "dd"]
});