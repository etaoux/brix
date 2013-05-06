KISSY.add('brix/gallery/charts/js/pub/controls/line3/configparse',function(S,Base,Node){
	var $ = Node.all

	function ConfigParse(){
		
		var self = this

		ConfigParse.superclass.constructor.apply(self,arguments);
	}

	ConfigParse.ATTRS = {
		o:{
			value:{
				v:'1.0',

				node:0,
				shape:0,
				area:0,

				scales:[1,1],

				fills:{
					normals:['0x458AE6', '0x94CC5C'],
					overs  :['0x135EBF', '0x78A64B']
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
			o.v = __data.getAttribute('v') && String(__data.getAttribute('v')) ? String(__data.getAttribute('v')) : o.v

			o.node = __data.getAttribute('node') && String(__data.getAttribute('node')) ? Number(__data.getAttribute('node')) : o.node
			o.shape = __data.getAttribute('shape') && String(__data.getAttribute('shape')) ? Number(__data.getAttribute('shape')) : o.shape
			o.area = __data.getAttribute('area') && String(__data.getAttribute('area')) ? Number(__data.getAttribute('area')) : o.area
			o.scales = __data.getAttribute('scales') && String(__data.getAttribute('scales')) ? String(__data.getAttribute('scales')).split(',') : o.scales

			var __fills = xmlDoc.getElementsByTagName("colors")[0]
			if(__fills){
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