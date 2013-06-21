KISSY.add('brix/gallery/charts/js/m/datasource/datasource',function(S,Base){

	function DataSource(){
		
		var self = this

		DataSource.superclass.constructor.apply(self,arguments);
	}

	DataSource.ATTRS = {
		o:{
			value:{
				type : '',
				data : ''
			}	
		},
		version:{
			value:{
				v1:'1.0'
			}
		}
	}

	S.extend(DataSource,Base,{
		parse:function($data,$type){
			var self = this
			var o
			var type = $type ? $type : 'xml'
			if(type == 'xml'){
				o = self._xml($data)
			}
			return o
		},
		_xml:function($data){
			var self = this
			var o
			var domParser = new DOMParser();
			var xmlDoc = domParser.parseFromString($data, 'text/xml');
			var __chart = xmlDoc.getElementsByTagName("chart")[0]
			var v = __chart && __chart.getAttribute('v') && String(__chart.getAttribute('v')) ? String(__chart.getAttribute('v')) : '1.0'
			if(v == self.get('version').v1){
				o = self._V1($data)
			}

			return o
		},
		_V1:function($data){
			var self = this
			var o = S.clone(self.get('o'))
			var domParser = new DOMParser();
			var xmlDoc = domParser.parseFromString($data, 'text/xml');
			var __chart = xmlDoc.getElementsByTagName("chart")[0]

			o.type = __chart.getAttribute('type') && String(__chart.getAttribute('type')) ? String(__chart.getAttribute('type')) : ''
			
			var __data = __chart.getElementsByTagName("data")[0]
			if(__data){
				o.data = (new XMLSerializer()).serializeToString(__chart.getElementsByTagName("data")[0])
			}
			
			return o
		}

	});

	return DataSource;

	}, {
	    requires:['base']
	}
);