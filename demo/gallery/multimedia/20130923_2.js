KISSY.ready(function(S){

    var multimedia_click_url = window['tanx_js_click_url']&&tanx_js_click_url[encodeURIComponent('http://a.tbcdn.cn/apps/med/multimedia/js/20130923_2.js')];

    var click_url = 'http%3A%2F%2Fs.lw.aliimg.com%2Fhd%2Fgift923.html10eea3931';

    if(S.UA && S.UA.os != 'windows' && S.UA.os != 'linux' && S.UA.os != 'macintosh'){
        click_url = 'http%3A%2F%2Fs.lw.aliimg.com%2Fhd%2Fgift923_mobile.html07f437b91'
    }

    if(!multimedia_click_url){
        multimedia_click_url = decodeURIComponent(click_url.substr(0,click_url.length-9))
    }
    else{
        multimedia_click_url += click_url
    } 
    


    var config ={
        swf_url:'http://a.tbcdn.cn/apps/med/multimedia/swf/20130923_2.swf',
        url    :multimedia_click_url,
        top    :27
    }

    S.config({
        packages:[
                 {
                    name: "brix",
                    // path: 'http://127.0.0.1/',//本地
                    path: 'http://a.tbcdn.cn/apps/e/',//线上
                    tag: '20121228',
                    charset: "utf-8"
                 }
        ],
        map:[
          [/(.+brix\/)(gallery\/)(.+?)(\/.+?(?:-min)?\.(?:js|css))(\?[^?]+)?$/, function($0, $1, $2, $3, $4, $5) {
                var str = $1 + '2.0/' + $2 + $3;//线上
                
                // var str = $1 + 'src/' + $2 + $3;//本地
                // $4 = $4.replace('-min','');

                str += $4 + ($5 ? $5 : '');
                return str;
            }]
        ]
    });
     
    S.use('brix/gallery/multimedia/',function(S,Multimedia){
        new Multimedia(config);
    });
});