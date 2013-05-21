KISSY.add('brix/gallery/charts/js/pub/controls/map/datatrim',function(S,Base,Node,Global){
	var $ = Node.all

	function DataTrim(){
		
		var self = this

		DataTrim.superclass.constructor.apply(self,arguments);
	}

	DataTrim.ATTRS = {
		data:{
			value:{}
						         //[o,o,...o]
				                 /*o:{
				                 	 index:
				                 	 colors:{
										normal:[#000000]
									 content:[]
				                 	 }
				                 }*/
		},

		o:{
			value:{
				index:0,
				name :'',        //名称(浙江)
				value:0,         //根据此值计算比例(1000)
				order:0,         //排名 过滤0 真正计算时从1开始(1)
				scale:0,         //比例(10%)
				fills:{
					normal:'#BED2ED',
					over  :'#F89D60'
				},
				content:[],
				sign:{
					is  :0,
					font:{
						content:''
					}
				}
			}
		}
	}

	S.extend(DataTrim,Base,{
		parse:function($arr,$config){
			var self = this

			var data = S.clone(self.get('data')) 

			for(var a = 0,al = $arr.length; a < al; a++){
				var item = (new XMLSerializer()).serializeToString($arr[a])
				var domParser = new DOMParser();
				var xmlDoc = domParser.parseFromString(item, 'text/xml');
				var __set = xmlDoc.getElementsByTagName("set")[0]
				var __fills = __set.getElementsByTagName("colors")[0]
				var __sign = __set.getElementsByTagName("sign")[0]
				var __name = __set.getElementsByTagName("name")[0]

				var o = S.clone(self.get('o'))
				o.index = __set.getAttribute('index') && String(__set.getAttribute('index')) ? Number(__set.getAttribute('index')) : o.index
				o.value = __set.getAttribute('value') && String(__set.getAttribute('value')) ? Number(__set.getAttribute('value')) : o.value

				if(__name){
					o.name = String(__name.getAttribute('name')) ? String(__name.getAttribute('name')) : o.name
				}

				if(__fills){
					o.fills.normal = __fills.getAttribute('normal') && String(__fills.getAttribute('normal')) ? $config.fills.normals[Number(__fills.getAttribute('normal')) - 1] : o.fills.normal
					o.fills.over = $config.fills.over
				}else{
					o.fills.normal = $config.fills.normals[0]
					o.fills.over = $config.fills.over
				}

				var contents = $config.info.contents
				for(var b = 0,bl = contents.length; b < bl; b++){
					o.content[b] = []
					var o1 = {}
					var content = contents[b]

					var name
					var value
					var __name =  __set.getElementsByTagName(content)[0]
					if(__name){
						name = __name.getAttribute('name') && String(__name.getAttribute('name')) ?  String(__name.getAttribute('name')) : ''
						value = __name.getAttribute('value') && String(__name.getAttribute('value')) ?  String(__name.getAttribute('value')) : ''
						value = Global.numAddSymbol(value)
					}
					
					o1.content = name + value
					o1.size = $config.info.sizes[b]
					o1.bold = $config.info.bolds[b]
					o1.fill = $config.info.fills[b]
					o.content[b].push(o1)
				}

				o.sign.is = $config.sign.is ? 1 : 0
				if(__sign){
					var __font = __sign.getElementsByTagName("font")[0]
					if(__font){
						var content = __font.getAttribute('content') && String(__font.getAttribute('content')) ? String(__font.getAttribute('content')) : o.sign.font.content
					}
				}
				data[o.name] = o
			}
			return data
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

	return DataTrim;

	}, {
	    requires:['base','node','../../utils/global']
	}
);