Brix = window.Brix || {};
Brix.config = function(options) {
    var debug = '@DEBUG@';//区分src还是dist版本
    options = KISSY.merge({
        path: '../../../../',
        fixed:'',//路径修正，brix路劲下存在其他文件夹
        gallery:{
            //配置组件版本信息
            //dropdown:'1.0'
        }
    },options);
    KISSY.config({
        packages: [{
            name: "brix",
            path:options.path,
            //path: "http://a.tbcdn.cn/p/",
            charset: "utf-8"
        }]
    });
    KISSY.config({
        map: [
            [/(.+brix\/)(gallery\/)(.+?)(\/index(?:-min)?\.js)(\?[^?]+)?$/, function($0,$1,$2,$3,$4,$5){
                var str = $1+options.fixed+$2+$3;
                if(options.gallery[$3]){
                    str += '/' + options.gallery[$3]
                }
                if(debug){
                   $4 = $4.replace('-min','');
                }
                str += $4+($5?$5:'');
                return str;
            }],
            [/(.+brix\/)(core.+?)((?:-min)?\.js)(\?[^?]+)?$/, function($0,$1,$2,$3,$4){
                var str = $1+options.fixed;
                if(debug){
                   $3 = $3.replace('-min','');
                }
                str += $2+$3+($4?$4:'');
                return str;
            }],
            [/(.+brix\/)(gallery\/)(.+?)(\/.+?(?:-min)?\.css)(\?[^?]+)?$/, function($0,$1,$2,$3,$4,$5){
                var str = $1+options.fixed+$2+$3;
                if(options.gallery[$3]){
                    str += '/' + options.gallery[$3]
                }
                if(debug){
                   $4 = $4.replace('-min','');
                }
                str += $4+($5?$5:'');
                return str;
            }]
        ]
    });
}