KISSY.add("components/area/index", function(S, Brick, DropdownBrick, Zone) {
    function AreaSelect() {
        AreaSelect.superclass.constructor.apply(this, arguments);
    }
    AreaSelect.ATTRS = {
        container : {
            value : ''
        },
        name : {
            value : ''
        },
        datalist : {
            value : []
        },
        tmplate : {
            value : ''
        },
        callback : {
            value : ''
        },
        defaultVal : {
            value : ''
        },
        el : {
            value : []
        }
    };
    S.extend(AreaSelect, Brick, {
        initialize: function() {
            var self = this;
            self.provinceTmpl = self._getProvinceTmpl('_provinceSelector',85,0);
            self.provinceData = {
                datalist : self._dataProvince()
            };

            self.cityTmpl = self._getCityTmpl('_citySelector',80,-1);
            self.cityData = {
                datalist : self._dataCity()
            };
            self._renderUI();
        },
        _renderUI : function(path){
            var self = this;
            var provinceSelector = new DropdownBrick({
                container : self.get('container'),
                tmpl: self.provinceTmpl,//需要的模板
                data: self.provinceData,
                events : {
                }
            });

            var citySelector = new DropdownBrick({
                container : self.get('container'),
                tmpl: self.cityTmpl,//需要的模板
                data: self.cityData,
                events : {
                }
            });
            
            citySelector.on('selected',function(e){
                var cal = self.get('callback');
                var p = S.one('#_provinceSelector').one('.dropdown-text');
                var pValue = p.attr('value');
                var pTxt = p.text();
                var txt = pTxt===e.text ? e.text : pTxt+' '+e.text;
                if(cal && typeof cal === 'function'){
                    cal.call(this,{
                        area : txt,
                        zoneId : e.value
                    });
                }
            }); 
            provinceSelector.on('selected',function(e){
                var data = self._dataCity(e.value);
                var cal = self.get('callback');
                if(!e.value){
                    if(cal && typeof cal === 'function'){
                        cal.call(this,{
                            area : '',
                            zoneId : ''
                        });
                    }
                }else{
                    citySelector.setChunkData('datalist',data);
                }
            }); 
        },
        _getProvinceTmpl : function(id,width,left){
            var self = this;
            var tpl = [
                '<div bx-name="dropdown" class="dropdown" id="'+id+'" style="text-class:left;width:'+width+'px;height: 24px;line-height: 24px;left:'+left+'px">',
                    '<span class="dropdown-hd">',
                        '{{#datalist}}',
                            '{{#selected}}',
                                '<span class="dropdown-text" value="{{value}}">{{text}}</span>',
                            '{{/selected}}',
                        '{{/datalist}}',
                    '</span>', 
                    '<ul class="dropdown-list dropdown-list-noicon" style="height:140px">',
                        '{{#datalist}}',
                            '<li class="dropdown-item {{#selected}}dropdown-itemselected{{/selected}}">',
                                '<span value="{{value}}">{{text}}</span><i class="iconfont icon-ok">&#126;</i>',
                            '</li>',
                        '{{/datalist}}',
                    '</ul>',
                    '<input value="" name="'+self.get('name')+'" type="hidden" />',
                '</div>'].join('');
            return tpl;
        },
        _getCityTmpl : function(id,width,left){
            var self = this;
            var tpl = [
                '<div bx-name="dropdown" class="dropdown" id="'+id+'" style="text-class:left;width:'+width+'px;height: 24px;line-height: 24px;left:'+left+'px">',
                    '<span bx-tmpl="dropdownhd" bx-datakey="datalist" class="dropdown-hd">',
                    '<!--bx-tmpl="dropdownhd" bx-datakey="datalist"-->',
                        '{{#datalist}}',
                            '{{#def}}',
                                '<span class="dropdown-text" value="{{value}}">{{text}}</span>',
                            '{{/def}}',
                            '{{^def}}',
                                '{{#selected}}',
                                    '<span class="dropdown-text" value="{{value}}">{{text}}</span>',
                                '{{/selected}}',
                            '{{/def}}',
                        '{{/datalist}}',
                        '<!--bx-tmpl="dropdownhd"-->',
                    '</span>', 
                    '<ul bx-tmpl="dropdownlist" bx-datakey="datalist" class="dropdown-list dropdown-list-noicon" style="height:140px">',
                    '<!--bx-tmpl="dropdownlist" bx-datakey="datalist"-->',
                        '{{#datalist}}',
                            '{{^def}}',
                            '<li class="dropdown-item {{#selected}}dropdown-itemselected{{/selected}}">',
                                '<span value="{{value}}">{{text}}</span><i class="iconfont icon-ok">&#126;</i>',
                            '</li>',
                            '{{/def}}',
                        '{{/datalist}}',
                    '</ul>',
                    '<!--bx-tmpl="dropdownlist"-->',
                    '<input value="" name="'+self.get('name')+'" type="hidden" />',
                '</div>'].join('');
            return tpl;
        },
        _renderCity : function(){

        },
        _dataProvince : function(){
            var self = this;
            var data = Zone.provinces;
            var def = self.get('defaultVal');
            var d = [];
            d.push({
                value : '',
                text : '选择省份',
                selected : def ? false : true
            });
            if(data){
                for(var key in data){
                    d.push({
                        value : key,
                        text : data[key].name,
                        selected : (def && key.toString()===Zone.cities[def].province.toString())
                    });
                }
            }
            return d;
        },
        _dataCity : function(pid){
            var self = this;
            var def = self.get('defaultVal');
            var d = [];
            if(pid || (!pid && !def)){
                d.push({
                    value : '',
                    text : '选择城市',
                    def : true
                });
                def = '';
            }
            pid = pid || (def && Zone.cities[def].province) || 8610;
            var data = Zone.provinces[pid].cities
            for(var i = 0; i < data.length; i++){
                var cid = data[i];
                var city = Zone.cities[cid];
                d.push({
                    value : cid,
                    text : city.name,
                    selected : (def && cid.toString()===def.toString())
                });
            }
            return d;
        }
    });

    return AreaSelect;
}, {
    requires: ["brix/core/brick","brix/gallery/dropdown/index","components/area/zoneData"]
});