KISSY.add('brix/gallery/charts/js/pub/controls/bar/dataparse',function(S,Base,Node,Global){
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
					names:[],                //名称集合(1:00,2:00,...,24:00)                        ->DataFrameFormat.horizontal.names
					start:{                  //原点
						name:'0'                 //名称[原点]                                       ->DataFrameFormat.horizontal.start.name
					},
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
			var data = String($data.replace(/>\s*?</g, '><').replace(/\n+/g, '').replace(/\r+/g, ''))

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
			o.vertical.data = self._getItems(__sets.childNodes)

			o.horizontal.name = __indexAxis.getAttribute('name') && String(__indexAxis.getAttribute('name')) ? String(__indexAxis.getAttribute('name')) : o.horizontal.name
			o.horizontal.names = __indexAxis.getAttribute('names') && String(__indexAxis.getAttribute('names')) ? String(__indexAxis.getAttribute('names')).split(',') : o.horizontal.names
			o.horizontal.data = __indexAxis.getAttribute('labels') ? String(__indexAxis.getAttribute('labels')).split(',') : o.horizontal.data
			o.horizontal.start.name = __start && String(__start.getAttribute('name')) ? String(__start.getAttribute('name')) : o.horizontal.start.name
			return o
		},

		/*
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
		}
		*/
		_getItems:function($list){
			var items = []
			
			for (var a = 0, al = $list.length; a < al; a++) {
				var item = $list[a]
				var o = { }
				o.name = item.getAttribute('name')
				o.data = []
				for (var b = 0, bl = $list[a].childNodes.length; b < bl; b++) {
					var item1 = $list[a].childNodes[b]
					var o1 = { }
					o1.name = item1.getAttribute('name')
					o1.signName = item1.getAttribute('name_sign')
					o1.data = item1.getAttribute('values') ? String(item1.getAttribute('values')).split(',') : []
					o1.total = Global.getArrMergerNumber(o1.data)
					o.data.push(o1)
				}
				items.push(o)
			}
			return items
		}
	});

	return DataParse;

	}, {
	    requires:['base','node','../../utils/global']
	}
);