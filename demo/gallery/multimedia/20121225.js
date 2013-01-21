KISSY.ready(function(S){
    var config ={
        // swf_url:'http://127.0.0.1/multimedia/src/swf/20121225.swf',
        swf_url:'http://img02.taobaocdn.com/tps/i2/T1U03KXbtaXXXtxVjX.swf',
        url    : 'http://clk.pagechoice.net/clk/iv-2839/st-211/cr-2/oi-72671/or-1408/adv-62/pcon-0/http%253A%252F%252Fmm.10086.cn%252Findex.html'
    }


    S.config({
        packages:[
                 {
                    name: "brix",
                    path: 'http://127.0.0.1/',//本地
                    //path: 'http://a.tbcdn.cn/apps/e/',//线上
                    tag: '20121225',
                    charset: "utf-8"
                 }
        ],
        map:[
          [/(.+brix\/)(gallery\/)(.+?)(\/.+?(?:-min)?\.(?:js|css))(\?[^?]+)?$/, function($0, $1, $2, $3, $4, $5) {
                //var str = $1 + '1.0/' + $2 + $3;//线上
                
                
                var str = $1 + 'src/' + $2 + $3;//本地
                $4 = $4.replace('-min','');


                str += $4 + ($5 ? $5 : '');
                return str;
            }]
        ]
    });
     S.use('brix/gallery/multimedia/',function(S,Multimedia){
        new Multimedia(config);
     });


});