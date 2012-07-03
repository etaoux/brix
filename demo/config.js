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
        [/(.+brix)\/(.+?)(?:-min)?.js(\?[^?]+)?$/, "$1/src/$2.js$3"],
        [/(.+brix)\/(.+?)(?:-min)?.css(\?[^?]+)?$/, "$1/src/$2.css$3"]
    ]
});
