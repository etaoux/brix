KISSY.add('brix/gallery/charts/js/pub/controls/line/dataparse',function(S,Base,Node){
	var $ = Node.all

	function DataParse(){
		
		var self = this

		DataParse.superclass.constructor.apply(self,arguments);
	}

	DataParse.ATTRS = {
		o:{
			value:{
				key:{                    //突出显示
					indexs:''                //String 索引字符串[1,2,3]                             ->DataFrameFormat.key.indexs
				},
				vertical:{               //纵轴
					name:'',                 //名称[维度1]                                          ->DataFrameFormat.vertical.name
					names:[],                //名称集合[维度1---1：,,维度1---3：]
					data:[],                 //原始二维数据[[配置数据中每个队列第一个集合],[],[]]   ->DataFrameFormat.vertical.org
					no_nodes:[]              //无节点集合 1=不显示节点 | 0=显示节点 当该数组长度为0时代表所有节点均显示[0,0,1,0]
				},
				horizontal:{             //横轴
					name:'',                 //名称[维度2]                                          ->DataFrameFormat.horizontal.name
					data:[]                  //原始数据[0.05,0.1,0.15,0.2,...,2.55]                 ->DataFrameFormat.horizontal.org
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
			var __indexAxis = xmlDoc.getElementsByTagName("indexAxis")[0]
			var __key = __indexAxis.getElementsByTagName('key')[0]
			var __sets = xmlDoc.getElementsByTagName("sets")[0]

			//防止没有key节点
			o.key.indexs = __key && String(__key.getAttribute('indexs')) ? String(__key.getAttribute('indexs')) : o.key.indexs

			//__sets.getAttribute('name') 当没有name属性时 防止null
			o.vertical.name = __sets.getAttribute('name') && String(__sets.getAttribute('name')) ? String(__sets.getAttribute('name')) : o.vertical.name
			o.vertical.names = self._getNames(__sets.getElementsByTagName('set'))
			o.vertical.data = self._getItems(__sets.getElementsByTagName('set'))
			o.horizontal.name = __indexAxis.getAttribute('name') && String(__indexAxis.getAttribute('name')) ? String(__indexAxis.getAttribute('name')) : o.horizontal.name
			o.horizontal.data = __indexAxis.getAttribute('labels') ? String(__indexAxis.getAttribute('labels')).split(',') : o.horizontal.data
			return o
		},

		_getItems:function($list){
			var items = []
			var item;

			for (var a = 0, al = $list.length; a < al; a++) {
				item = $list[a]
				if(String(item.getAttribute('values'))){
					items.push(String(item.getAttribute('values')).split(','))
				}
			}
			return items
		},
		_getNames:function($list){
			var items = []
			var item 

			for (var a = 0, al = $list.length; a < al; a++) {
				item = $list[a]
				items[a] = item.getAttribute('name') && String(item.getAttribute('name')) ? String(item.getAttribute('name')) : ''
			}
			return items
		}
	});

	return DataParse;

	}, {
	    requires:['base','node']
	}
);