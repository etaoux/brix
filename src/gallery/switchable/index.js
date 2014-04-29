KISSY.add("brix/gallery/switchable/index", function(S,Brick,KSSwitchable) {
    /**
     * kissy switchable 组件的封装。
     * @extends Brix.Brick
     * @class  Brix.Gallery.Switchable
     * <a target="_blank" href="http://docs.kissyui.com/docs/html/api/component/switchable/">其他配置、方法、事件请参考KISSY API</a>
     * @param {Object} config 配置信息
     */
    var Switchable = Brick.extend({
        constructor:function(config){
            this.config = config;
            Switchable.superclass.constructor.apply(this, arguments);
        },
        bindUI:function(){
            var self = this,
                config = self.config;
            if(config.switchType){
                var switchType = config.switchType;
                delete config.switchType;
                self.switchable = new KSSwitchable[switchType](self.get('el'),config);
            }
            else{
                self.switchable = new KSSwitchable(self.get('el'),config);
            }
            config = null;
            delete self.config;
        },
        destructor:function(){
            var self = this;
            if(self.switchable&&self.switchable.destroy){
                self.switchable.destroy();
            }
        }
    });
    /**
     * Switchable 实例对象类型Tabs|Slide|Carousel|Accordion。
     * @cfg switchType
     */
    

    /**
     * @property {Object} switchable KISSY switchable实例化后的对象
     */

    
    return Switchable;
}, {
    requires: ["brix/core/brick",'switchable']
});
