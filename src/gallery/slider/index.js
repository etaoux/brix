KISSY.add('brix/gallery/slider/index', function(S, Brick, UA, Node, DD) {

    function Slider() {
        Slider.superclass.constructor.apply(this, arguments);
    }

    Slider.FIRES = {
        drag : "drag",
        dragstart : "dragstart",
        dragend : "dragend",
        resize : "resize"
    }

    var MODE ={
        horizontal : "horizontal",
        vertical : "vertical"
    }

    Slider.ATTRS = {

        // 支持数组滚动
        range : {
            value : false
        },

        // 展现的横竖方式， horizontal：横向， vertical：竖向
        mode : {
            value : "horizontal"
        },

        // 启始的开始值
        startStep : {
            value : 0
        },
        // 结束值
        endStep : {
            value : 100
        },

        //整数值，值是integerStep的倍数 integerStep 可以设置成0.5
        integerStep : {
            value : 1
        },
        // 当前值
        current : {

        },

        // knob的居中偏移量，margin-left：-7px
        knobOffset:{
            value : -7
        }

    };

    Slider.METHOD = {
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
                knobNode_left_val = 0, knobNode_start_left_val = null,
                knobOffset = self.get("knobOffset"),
                left_top = mode === MODE.horizontal ? "left" : "top",
                width_height = mode === MODE.horizontal ? "width" : "height";

            knobNode = knobNode || el.one(".slider-knob");
            this.knobNode = knobNode;
            // 创建一个拖动按钮
            var knob = self.knob = new DD.Draggable({
                    node: knobNode,
                    cursor: 'move'
                });
            knob.on('drag', function(ev){
                var offset = el.offset(),
                    max_set = mode === MODE.horizontal ? el.width() : el.height(),
                    val = ev[left_top] - offset[left_top] - knobOffset;
                if(val > max_set){
                    val = max_set;
                }
                if(val < 0){
                    val = 0;
                }
                knobNode_left_val = val;

                if(knobNode_start){
                    val = val - knobNode_start_left_val;
                }

                barNode.css(width_height, Math.abs(val));
                barNode.css(left_top, knobNode_left_val > knobNode_start_left_val ?  knobNode_start_left_val : knobNode_left_val);
                knobNode.css(left_top, knobNode_left_val);
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
                        max_set = mode === MODE.horizontal ? el.width() : el.height(),
                        val = ev[left_top] - offset[left_top] - knobOffset;
                    if(val > max_set){
                        val = max_set;
                    }
                    if(val < 0){
                        val = 0;
                    }
                    knobNode_start_left_val = val;

                    barNode.css(left_top, knobNode_left_val > knobNode_start_left_val ?  knobNode_start_left_val : knobNode_left_val);
                    barNode.css(width_height, Math.abs(knobNode_left_val - knobNode_start_left_val));
                    knobNode_start.css(left_top, val);
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
                var current  = self.value, tmp,
                    max_set = mode === MODE.horizontal ? el.width() : el.height();

                if(S.isArray(current)){
                    // 处理两个拖动按钮的
                    current[0] = valid_value(current[0],startStep,endStep);
                    current[1] = valid_value(current[1],startStep,endStep);
                    knobNode_left_val = max_set * (current[1] - startStep) / (endStep - startStep)
                    knobNode_start_left_val = max_set * (current[0] - startStep) / (endStep - startStep)

                    knobNode.css(left_top, knobNode_left_val)
                    knobNode_start.css(left_top, knobNode_start_left_val)
                    barNode.css(left_top, knobNode_left_val > knobNode_start_left_val ?  knobNode_start_left_val : knobNode_left_val);
                    barNode.css(width_height, Math.abs(knobNode_left_val - knobNode_start_left_val));
                }else{
                    current = valid_value(current,startStep,endStep);
                    knobNode_left_val = max_set * (current - startStep) / (endStep - startStep);
                    knobNode.css(left_top, knobNode_left_val)
                    barNode.css(width_height, knobNode_left_val);

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
                var max_set = mode === MODE.horizontal ? el.width() : el.height(),
                    val = (endStep - startStep) * knobNode_left_val / max_set + startStep,
                    val2 = knobNode_start_left_val === null ? null : ((endStep - startStep) * knobNode_start_left_val / max_set + startStep);
                if(integer){
                    val = Math.round(val/integer) * integer ;
                    val2 = val2 === null ? null :  Math.round(val2 / integer) * integer
                }
                if (knobNode_start){
                    self.value = [val2, val];
                }else{
                    self.value = val;
                }

                set_current(self.value);
                self.fire(Slider.FIRES.drag, {data: self.value , current : self.get("current")})

                //S.log("Slider: change=" + self.value + "," + self.get("current"));
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


    S.augment(Slider, Slider.METHOD);
    return Slider;
}, {
    requires: ["brix/core/brick", "ua","node", "dd"]
});