//暂时
KISSY.add("brix/dataset", function(S, Base) {
    function Dataset() {
        Dataset.superclass.constructor.apply(this, arguments);
    }
    Dataset.ATTRS = {
        data: {}
    }
    S.extend(Dataset, Base, {

    });
    return Dataset;
}, {
    requires: ["base"]
});
