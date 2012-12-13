KISSY.add('brix/gallery/charts/js/pub/controls/pie/configparse',function(S,Base,Node){
	var $ = Node.all

	function ConfigParse(){
		
		var self = this

		ConfigParse.superclass.constructor.apply(self,arguments);
	}

	ConfigParse.ATTRS = {
		o:{
			value:{
				fills:{
					order  :0,
					normals:['0x458AE6', '0x45B5E6', '0x39BCC0', '0x5BCB8A', '0x94CC5C', '0xC3CC5C', '0xE6B522', '0xE68422', '0xB0704A', '0x6280A1'],
					overs  :['0x135EBF', '0x3997BF', '0x2E9599', '0x36B26A', '0x78A64B', '0x9CA632', '0xBF9E39', '0xBF7C39', '0x8C5738', '0x4D6580']
				}
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
			var __fills = __data.getElementsByTagName("colors")[0]
			if(__fills){
				o.fills.order = __fills.getAttribute('normals') && String(__fills.getAttribute('normals')) ? 1 : o.fills.order
				o.fills.normals = __fills.getAttribute('normals') && String(__fills.getAttribute('normals')) ? String(__fills.getAttribute('normals')).split(',') : o.fills.normals
				o.fills.overs = __fills.getAttribute('overs') && String(__fills.getAttribute('overs')) ? String(__fills.getAttribute('overs')).split(',') : o.fills.overs
			}
			o.fills.normals = self._trimFills(o.fills.normals)
			o.fills.overs = self._trimFills(o.fills.overs)
			return o
		},

		//将'0x' 替换成 '#'
		_trimFills:function($arr){
			var arr = []
			for(var a = 0,al = $arr.length; a < al; a++){
				var s = String($arr[a])
				s = s.replace('0x','#')
				arr.push(s)
			}
			return arr
		}
	});

	return ConfigParse;

	}, {
	    requires:['base','node']
	}
);