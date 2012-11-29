KISSY.add("brix/gallery/breadcrumbs/index", function(S, Brick) {
	/**
	 * 面包屑组件
     * <br><a href="../demo/gallery/breadcrumbs/breadcrumbs.html" target="_blank">Demo</a>
	 * @class Brix.Gallery.Breadcrumbs
	 * @extends Brix.Brick
	 */
    function Breadcrumbs() {
        Breadcrumbs.superclass.constructor.apply(this, arguments);
    }
    Breadcrumbs.ATTRS = {

    }
    S.extend(Breadcrumbs, Brick, {
        
    });
    return Breadcrumbs;
}, {
    requires: ["brix/core/brick"]
});
