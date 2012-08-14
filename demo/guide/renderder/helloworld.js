KISSY.add('helloworld', function(S, Brick) {
    function HelloWorld() {
        HelloWorld.superclass.constructor.apply(this, arguments);
    }
    HelloWorld.ATTRS = {
        name: {
            value: 'World'
        }
    };
    HelloWorld.RENDERER = {
        xx: {
            yy: function(context) {
                return "xx_" + context.get('name') + "_yy"
            }
        }
    };

    S.extend(HelloWorld, Brick, {

    });

    return HelloWorld;
}, {
    requires: ["brix/core/brick"]
});