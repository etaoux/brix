KISSY.add('brix/gallery/charts/js/pub/controls/bar/configparse',function(S,Base,Node){
	var $ = Node.all

	function ConfigParse(){
		
		var self = this

		ConfigParse.superclass.constructor.apply(self,arguments);
	}

	ConfigParse.ATTRS = {
		o:{
			value:{
				v:'1.0',

				fills:[[ { normal:'#94CC5C', over:'#78A64B' }, { normal:'#458AE6', over:'#135EBF' }, { normal:'#FF0000', over:'#FF0000' }], [ { normal:'#CCCCCC', over:'#999999' }, { normal:'#999999', over:'#666666' }, { normal:'#0000FF', over:'#0000FF' }]]
			}
		}
	}

	S.extend(ConfigParse,Base,{
		parse:function($data,$type){
			var self = this

			var o = S.clone(self.o) 
			var type = $type ? $type : 'xml'
			if(type == 'xml'){
				o = self._xml($data)
			}
			return o
		},
		_xml:function($data){
			var self = this

			var o = S.clone(self.get('o')) 
			var data = String($data)
			var domParser = new DOMParser();
			var xmlDoc = domParser.parseFromString(data, 'text/xml');

			var __data = xmlDoc.getElementsByTagName("data")[0]
			if(!__data){
				return o
			}
				
			o.v = __data.getAttribute('v') && String(__data.getAttribute('v')) ? String(__data.getAttribute('v')) : o.v
			
			return o
		}
	});

	return ConfigParse;

	}, {
	    requires:['base','node']
	}
);