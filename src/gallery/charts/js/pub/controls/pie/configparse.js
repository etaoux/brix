KISSY.add('brix/gallery/charts/js/pub/controls/pie/configparse',function(S,Base,Node){
	var $ = Node.all

	function ConfigParse(){
		
		var self = this

		ConfigParse.superclass.constructor.apply(self,arguments);
	}

	ConfigParse.ATTRS = {
		o:{
			value:{

				dis:26,                 //圆饼实际大小与上、下、左、右之间的间隔

				font:{
					is:1
				},

				fills:{
					order  :0,
					normals:['0x458AE6', '0x45B5E6', '0x39BCC0', '0x5BCB8A', '0x94CC5C', '0xC3CC5C', '0xE6B522', '0xE68422', '0xB0704A', '0x6280A1'],
					overs  :['0x135EBF', '0x3997BF', '0x2E9599', '0x36B26A', '0x78A64B', '0x9CA632', '0xBF9E39', '0xBF7C39', '0x8C5738', '0x4D6580']
				},

				list:{
					is : 0,
					max: '',
					content:{           //内容
						mode:0          //模式(0 = 比例 | 1 = 数字)
					}
				},

				order:{                 //数据排序
					mode:1              //模式(0 = 不排序 | 1 = 从大到小)
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
			var __font = __data.getElementsByTagName("font")[0]
			var __fills = __data.getElementsByTagName("colors")[0]
			var __list = __data.getElementsByTagName("list")[0]
			var __order = __data.getElementsByTagName("order")[0]

			if(__font){
				o.font.is = __font.getAttribute('enabled') == 0 ? 0 : o.font.is
			}

			if(__fills){
				o.fills.order = __fills.getAttribute('normals') && String(__fills.getAttribute('normals')) ? 1 : o.fills.order
				o.fills.order = __fills.getAttribute('mode') == 1 ? 0 : o.fills.order
				o.fills.normals = __fills.getAttribute('normals') && String(__fills.getAttribute('normals')) ? String(__fills.getAttribute('normals')).split(',') : o.fills.normals
				o.fills.overs = __fills.getAttribute('overs') && String(__fills.getAttribute('overs')) ? String(__fills.getAttribute('overs')).split(',') : o.fills.overs
			}
			o.fills.normals = self._trimFills(o.fills.normals)
			o.fills.overs = self._trimFills(o.fills.overs)

			if(__list){
				o.list.is = 1
				o.list.max = __list.getAttribute('value') && __list.getAttribute('value') != 0 ? __list.getAttribute('value') : o.list.max

				var __content = __list.getElementsByTagName("content")[0]
				if(__content){
					o.list.content.mode = __content.getAttribute('mode') ? __content.getAttribute('mode') : o.list.content.mode
				}
			}

			if(__order){
				o.order.mode = __order.getAttribute('mode') ? __order.getAttribute('mode') : o.order.mode
			}
			return o
		},

		//将'0x' 替换成 '#'
		_trimFills:function($arr){
			var arr = []
			for(var a = 0,al = $arr.length; a < al; a++){
				var s = String($arr[a])
				s = s.replace('0x','#')
				arr.push(s)
			}
			return arr
		}
	});

	return ConfigParse;

	}, {
	    requires:['base','node']
	}
);