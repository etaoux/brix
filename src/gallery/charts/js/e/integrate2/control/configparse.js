KISSY.add('brix/gallery/charts/js/e/integrate2/control/configparse',function(S,Base,Node,BarConfigParse,Style1ConfigParse){
	var $ = Node.all

	function ConfigParse(){
		
		var self = this

		ConfigParse.superclass.constructor.apply(self,arguments);
	}

	ConfigParse.ATTRS = {
		o:{
			value:{
				v:'1.0',

				bar:{},

				layout:{},

				infos:{
			        xAxis:{
					    mode:0               //模式[0 = 显示两个点(1:00-2:00) | 1 = 显示一个点(2013-03-08)]
						  }
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
			if(__data){
				o.v = __data.getAttribute('v') && String(__data.getAttribute('v')) ? String(__data.getAttribute('v')) : o.v

				var s = ''
				if(__data.getElementsByTagName("bar")[0]){
					 s = new XMLSerializer().serializeToString(__data.getElementsByTagName("bar")[0])
				}
				s = s.replace('<bar', "<data")
				s = s.replace('bar>', "data>")
				o.bar = new BarConfigParse().parse(s)

				var s = ''
				if(__data.getElementsByTagName("layout")[0]){
					s = new XMLSerializer().serializeToString(__data.getElementsByTagName("layout")[0])
				}
				s = s.replace('<layout', "<data")
				s = s.replace('layout>', "data>")
				o.layout = new Style1ConfigParse().parse(s)

				var __infos = __data.getElementsByTagName("infos")[0]
				if(__infos){
					var __x_axis = __infos.getElementsByTagName("x_axis")[0]
					if(__x_axis){
						o.infos.xAxis.mode = __x_axis.getAttribute('mode') || __x_axis.getAttribute('mode') == 0 ? Number(__x_axis.getAttribute('mode')) : o.infos.xAxis.mode
					}
				}
			}else{
				o.bar = new BarConfigParse().parse('')
				o.layout = new Style1ConfigParse().parse('')
			}
			return o
		}
	});

	return ConfigParse;

	}, {
	    requires:['base','node','../../../pub/controls/bar/configparse','../../../pub/controls/layouts/style1/configparse']
	}
);