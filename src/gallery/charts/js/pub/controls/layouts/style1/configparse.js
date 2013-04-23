KISSY.add('brix/gallery/charts/js/pub/controls/layouts/style1/configparse',function(S,Base,Node){
	var $ = Node.all

	function ConfigParse(){
		
		var self = this

		ConfigParse.superclass.constructor.apply(self,arguments);
	}

	ConfigParse.ATTRS = {
		o:{
			value:{
				xAxis: {
						name:'单位(整点)'
					   },
				yAxis: {
						name:''
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
				var __x_axis = xmlDoc.getElementsByTagName("x_axis")[0]
				if(__x_axis){
					o.xAxis.name = __x_axis.getAttribute('name') && String(__x_axis.getAttribute('name')) ? String(__x_axis.getAttribute('name')) : o.xAxis.name
					o.xAxis.name = __x_axis.getAttribute('name') == '' ? '' : o.xAxis.name
				}
				var __y_axis = xmlDoc.getElementsByTagName("y_axis")[0]
				if(__y_axis){
					o.yAxis.name = __y_axis.getAttribute('name') && String(__y_axis.getAttribute('name')) ? String(__y_axis.getAttribute('name')) : o.yAxis.name
					o.yAxis.name = __y_axis.getAttribute('name') == '' ? '' : o.yAxis.name
				}
			}
			return o
		}
	});

	return ConfigParse;

	}, {
	    requires:['base','node']
	}
);