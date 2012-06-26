KISSY.config({
    packages: [{
        name: "brix",
        tag: "20120419",
        path: "../../../../",//这里可以配置cdn的路径
        charset: "utf-8"
    }]
});

KISSY.config({
    map: [
        [/(.+brix\/.+)-min.js(\?[^?]+)?$/, "$1.js$2"],
        [/(.+brix\/.+)-min.css(\?[^?]+)?$/, "$1.css$2"]
    ]
});
