KISSY.add('brix/gallery/charts/js/pub/controls/map/dataparse',function(S,Base,Node){
	var $ = Node.all

	function DataParse(){
		
		var self = this

		DataParse.superclass.constructor.apply(self,arguments);
	}

	DataParse.ATTRS = {
		o:{
			value:{
				key:{                    //突出显示[预留]
					indexs:''                //String 索引字符串[1,2,3]                            
				},
				values:{                 	
					data:[]                  //原始二维数据['<set index="34"><name name="安徽"/>...</set>','...','...']
				}
			}
		}
	}

	S.extend(DataParse,Base,{
		parse:function($data,$type){
			var o
			var type = $type ? $type : 'xml'
			if(type == 'xml'){
				o = this._xml($data)
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
			var __sets = __data.getElementsByTagName("sets")[0]

			o.values.data = self._getItems(__sets.getElementsByTagName("set"))
			
			return o
		},

		_getItems:function($list){
			var self = this

			var item = []

			for (var a = 0, al = $list.length; a < al; a++) {
				var __data = $list[a]
				
				item.push(__data)
			}

			return item
		}
	});

	return DataParse;

	}, {
	    requires:['base','node']
	}
);