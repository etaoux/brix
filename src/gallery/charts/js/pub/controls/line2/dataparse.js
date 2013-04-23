KISSY.add('brix/gallery/charts/js/pub/controls/line2/dataparse',function(S,Base,Node){
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
				vertical:{               //纵轴	
					names:[],                //名称三维数据[ [  [[03月08号:],[...]] , [[03月01号:],[...]] ] ]   				
					data:[]                  //原始三维数据[ [  [[83],[81],[...]]   , [[43],[41],[...]]   ] ]
				},
				horizontal:{             //横轴
					data:[]                  //原始二维数据[[3月8号],[3月9号],[...]]
				},
				info:{                   //显示信息配置         
				    content:{                //内容
						title:{                  //标题 
							name:'',                 //内容
							fill:'#505050'           //颜色
						}
					}
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

			o = self._getObject(xmlDoc.getElementsByTagName("data"))

			var __info = xmlDoc.getElementsByTagName('info')[0]
			if(__info){
				var __content = __info.getElementsByTagName('content')[0]
				if(__content){
					var __title = __content.getElementsByTagName('title')[0]
					if(__title){
						o.info.content.title.name = __title.getAttribute('name') ? String(__title.getAttribute('name')) : o.info.content.title.name
						o.info.content.title.fill = __title.getAttribute('color') ? self._trimFill(__title.getAttribute('color')) : o.info.content.title.fill
					}
				}
			}
			return o
		},

		_getObject:function($list){
			var self = this

			var o = S.clone(self.get('o')) 
			var item;

			for (var a = 0, al = $list.length; a < al; a++) {
				var __data = $list[a]
				var __indexAxis = __data.getElementsByTagName("indexAxis")[0]
				var __sets = __data.getElementsByTagName("sets")[0]

				//Q3(js:空的数组判断能通过)
				o.horizontal.data = o.horizontal.data.length > 0 ? o.horizontal.data : __indexAxis.getAttribute('labels') ? String(__indexAxis.getAttribute('labels')).split(',') : []

				o.vertical.names.push(String(__sets.getAttribute('name')).split(','))
				o.vertical.data.push(String(__sets.getElementsByTagName('set')[0].getAttribute('values')).split(','))
			}

			return o
		},

		_trimFill:function($s){
			var s = $s.replace('0x','#')
			return s
		}
	});

	return DataParse;

	}, {
	    requires:['base','node']
	}
);