KISSY.add('brix/gallery/charts/js/pub/controls/histogram/dataparse',function(S,Base,Node){
	var $ = Node.all

	function DataParse(){
		
		var self = this

		DataParse.superclass.constructor.apply(self,arguments);
	}

	DataParse.ATTRS = {
		o:{
			value:{
				key:{                    //突出显示
					indexs:'',               //String 索引字符串[1,2,3]                             ->DataFrameFormat.key.indexs
					data:[]                  //Array indexs split之后的数组
				},
				vertical:{               //纵轴
					name:'',                 //名称[维度1]                                          ->DataFrameFormat.vertical.name
					data:[]                  //原始二维数据[[配置数据中每个队列第一个集合],[],[]]   ->DataFrameFormat.vertical.org
				},
				horizontal:{             //横轴
					name:'',                 //名称[维度2]                                          ->DataFrameFormat.horizontal.name
					start:{                  //原点
						name:'0'                 //名称[原点]                                       ->DataFrameFormat.horizontal.start.name
					},
					data:[],                 //原始数据[0.05,0.1,0.15,0.2,...,2.55]                 ->DataFrameFormat.horizontal.org
					datas:[]                 //原始数据[['今天','(0-17点)'],['对比日','(0-17点)']]  应用于多行的情况
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
			var __start = __indexAxis.getElementsByTagName('start')[0]
			var __sets = xmlDoc.getElementsByTagName("sets")[0]

			//防止没有key节点
			o.key.indexs = __key && String(__key.getAttribute('indexs')) ? String(__key.getAttribute('indexs')) : o.key.indexs

			//__sets.getAttribute('name') 当没有name属性时 防止null
			o.vertical.name = __sets.getAttribute('name') && String(__sets.getAttribute('name')) ? String(__sets.getAttribute('name')) : o.vertical.name
			o.vertical.data = self._getItems(__sets.getElementsByTagName('set'))

			o.horizontal.name = __indexAxis.getAttribute('name') && String(__indexAxis.getAttribute('name')) ? String(__indexAxis.getAttribute('name')) : o.horizontal.name
			o.horizontal.data = __indexAxis.getAttribute('labels') ? String(__indexAxis.getAttribute('labels')).split(',') : o.horizontal.data
			o.horizontal.datas = self._getNames(__sets.getElementsByTagName('set'))
			o.horizontal.start.name = __start && String(__start.getAttribute('name')) ? String(__start.getAttribute('name')) : o.horizontal.start.name
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
			var item;

			for (var a = 0, al = $list.length; a < al; a++) {
				item = $list[a]
				var __name = item.getElementsByTagName('name')[0]
				if(__name){
					if(String(__name.getAttribute('values'))){
						items.push(String(__name.getAttribute('values')).split(','))
					}
				}
			}
			return items
		}
	});

	return DataParse;

	}, {
	    requires:['base','node']
	}
);