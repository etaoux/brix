KISSY.add('brix/gallery/charts/js/e/integrate/control/configparse',function(S,Base,Node,HistogramConfigParse,LineConfigParse){
	var $ = Node.all

	function ConfigParse(){
		
		var self = this

		ConfigParse.superclass.constructor.apply(self,arguments);
	}

	ConfigParse.ATTRS = {
		o:{
			value:{
				v:'1.0',

				fills:{
					normals:['#458AE6'],
					overs  :['#135EBF']
				},

				right:{}
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

			var s = ''
			if(__data.getElementsByTagName("line")[0]){
				s = new XMLSerializer().serializeToString(__data.getElementsByTagName("line")[0])
			}
			s = s.replace('<line', "<data")
			s = s.replace('line>', "data>")

			o.right = new LineConfigParse().parse(s)

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
	    requires:['base','node','../../../pub/controls/histogram/configparse','../../../pub/controls/line/configparse']
	}
);