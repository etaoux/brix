KISSY.add('brix/gallery/charts/js/pub/controls/pie/dataparse',function(S,Base,Node){
	var $ = Node.all

	function DataParse(){
		
		var self = this

		DataParse.superclass.constructor.apply(self,arguments);
	}

	DataParse.ATTRS = {
		o:{
			value:{
				key:{                    //突出显示[预留]
					indexs:'',               //String 索引字符串[1,2,3]
					data:[]                  //Array indexs split之后的数组
				},
				values:{
					names:[],                //原始名称数组
					data:[],                 //原始数据数组(未排序)
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

			var domParser = new  DOMParser();
			var xmlDoc = domParser.parseFromString(data, 'text/xml');
			var __indexAxis = xmlDoc.getElementsByTagName("indexAxis")[0]
			var __key = __indexAxis.getElementsByTagName('key')[0]
			var __sets = xmlDoc.getElementsByTagName("sets")[0]
			var __set = __sets.getElementsByTagName("set")[0]

			//防止没有key节点
			o.key.indexs = __key && String(__key.getAttribute('indexs')) ? String(__key.getAttribute('indexs')) : o.key.indexs

			o.values.data = __set.getAttribute('values') && String(__set.getAttribute('values')) ? String(__set.getAttribute('values')).split(',') : o.values.data
			o.values.names = __set.getAttribute('names') && String(__set.getAttribute('names')) ? String(__set.getAttribute('names')).split(',') : o.values.names
			return o
		},
	});

	return DataParse;

	}, {
	    requires:['base','node']
	}
);