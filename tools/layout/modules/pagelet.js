KISSY.add('modules/pagelet', function (S, D) {
    var nodes;

    function parseHooks() {
        nodes = document.querySelectorAll('[bx]');
    }
    function initModules() {
        var name;
        for (var i=0; i<nodes.length; i++) {
            name = nodes[i].id.slice(2);
            S.use('modules/' + name, function(S, Module) {
                Module();
            });
        }
    }

    return {
        init: function () {
            parseHooks();
            initModules();
        }
    };
});
