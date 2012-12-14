KISSY.add("brix/core/demolet", function(S, Pagelet,IO) {
    /**
     * 同步获取默认模板和数据，多在demo页构建中使用
     * @param  {String} tmpl 模板文件
     * @param  {Object} data 数据对象
     * @param  {String} s    分割符号，默认‘@’
     * @private
     * @return {Object}      模板和数据的对象{tmpl:tmpl,data:data}
     */
    function getTmplData(tmpl,data,s){
        s = s||'@';
        data = data || {};
        var reg = new RegExp('\\{\\{'+s+'(.+)?\\}\\}',"ig");
        tmpl = tmpl.replace(reg,function($1,$2){
            S.log($2);
            var str = '';
            var p = $2.replace(/\//ig,'_').replace(/\./ig,'_');
            data[p] = data[p] || {};
            IO({
                url:$2+'template.html',
                dataType:'html',
                async:false,
                success:function(d , textStatus , xhrObj){
                    str = '{{#'+p+'}}' + d+'{{/'+p+'}}';
                }
            });
            IO({
                url:$2+'data.json',
                async:false,
                dataType:'json',
                success:function(d , textStatus , xhrObj){
                    for(var k in d){
                        data[p][k] = d[k];
                    }
                }
            });
            return str;
        });
        return {tmpl:tmpl,data:data};
    }

    /**
     * Brix Demolet 用来构建约定的template.html和data.json的占坑demo页面
     * @extends Brix.Pagelet
     * @class Brix.Demolet
     */
    function Demolet() {
        Demolet.superclass.constructor.apply(this, arguments);
    }
    Demolet.ATTRS = {
        /**
         * 分割符号
         * @cfg {String}
         */
        s:{
            value:'@'
        },
        /**
         * 模板,如果外部需要传入data，请把data属性设置在前，因为这个内部会会对data进行处理
         * @cfg {String}
         */
        tmpl:{
            setter:function(v){
                var self = this,
                    data = self.get('data') || {};
                var tmplData = getTmplData(v,data,self.get('s'));
                self.set('data',tmplData.data);
                return tmplData.tmpl;
            } 
        }
    };
    S.extend(Demolet, Pagelet, {
        
    });
    return Demolet;
}, {
    requires: ['./pagelet','ajax']
});