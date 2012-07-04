KISSY.add("brix/core/dataset", function(S, Base) {
    function Dataset() {
        Dataset.superclass.constructor.apply(this, arguments);
    }
    Dataset.ATTRS = {
        data: {}
    };
    S.extend(Dataset, Base, {
        /**
         * 扩展数据，用于mastache渲染
         * @param {Object} renderer 代理方法对象
         * @param {Object} context  当前上下文环境
         * @param {String} prefix   前缀，防止相同brick方法覆盖
         */
        setRenderer : function(renderer,context,prefix) {
            var self = this, rr = renderer, mcName, wrapperName,data = self.get('data');
            if(rr) {
                var foo = function(mcName,wrapperName){
                    var mn = mcName, wn = wrapperName;
                    var fn = rr[mn][wn];
                    data[(prefix?prefix+"_":"")+mn + "_" + wn] = function() {
                        return fn.call(this, context, mn);
                    };
                };
                for(mcName in rr) {
                    for(wrapperName in rr[mcName]) {
                        foo(mcName,wrapperName);
                    }
                }
            }
        }
    });
    return Dataset;
}, {
    requires: ["base"]
});
