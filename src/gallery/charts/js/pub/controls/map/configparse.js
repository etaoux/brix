KISSY.add('brix/gallery/charts/js/pub/controls/map/configparse',function(S,Base,Node){
	var $ = Node.all

	function ConfigParse(){
		
		var self = this

		ConfigParse.superclass.constructor.apply(self,arguments);
	}

	ConfigParse.ATTRS = {
		o:{
			value:{
				v:'1.0',

				fills:{
					normals:['0xBED2ED'],
					over:'0xF89D60'
				},

				info:{
					contents:[],
					bolds   :[1,1,1],
					fills  :['0x1351BF','0x1351BF','0x1351BF'],
					sizes   :[14,12,12],
					frame_fill :'0x1351BF'
				},

				sign:{
					is : 0,
					max: '',
					circle:{
						fill:{
							normal:'#937ACC',
							over  :'#7459B3'
						}
					}
				},

				list:{
					is : 0,
					max: '',
					font:{
						fill:{
							normal:'#333333',
							over:'#7459B3'
						}
					}
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
			var __fills = __data.getElementsByTagName("colors")[0]
			var __info = __data.getElementsByTagName("info")[0]
			var __sign = __data.getElementsByTagName("sign")[0]
			var __list = __data.getElementsByTagName("list")[0]

			o.v = __data.getAttribute('v') && String(__data.getAttribute('v')) ? String(__data.getAttribute('v')) : o.v

			if(__fills){
				o.fills.normals = __fills.getAttribute('normals') && String(__fills.getAttribute('normals')) ? String(__fills.getAttribute('normals')).split(',') : o.fills.normals
				o.fills.over = __fills.getAttribute('over') && String(__fills.getAttribute('over')) ? String(__fills.getAttribute('over')) : o.fills.over
			}
			if(__info){
				o.info.contents = __info.getAttribute('contents') && String(__info.getAttribute('contents')) ? String(__info.getAttribute('contents')).split(',') : o.info.contents
				o.info.bolds = __info.getAttribute('bolds') && String(__info.getAttribute('bolds')) ? String(__info.getAttribute('bolds')).split(',') : o.info.bolds
				o.info.fills = __info.getAttribute('colors') && String(__info.getAttribute('colors')) ? String(__info.getAttribute('colors')).split(',') : o.info.fills
				o.info.sizes = __info.getAttribute('sizes') && String(__info.getAttribute('sizes')) ? String(__info.getAttribute('sizes')).split(',') : o.info.sizes

				o.info.frame_fill = __info.getAttribute('f_c') && String(__info.getAttribute('f_c')) ? String(__info.getAttribute('f_c')) : o.info.frame_fill
			}

			o.fills.normals = self._trimFills(o.fills.normals)
			o.fills.over = self._trimFill(o.fills.over)

			o.info.fills = self._trimFills(o.info.fills)
			o.info.frame_fill = self._trimFill(o.info.frame_fill)

			if(__sign){
				o.sign.is = 1
				o.sign.max = __sign.getAttribute('value') && __sign.getAttribute('value') != 0 ? __sign.getAttribute('value') : o.sign.max
			}
			if(__list){
				o.list.is = 1
				o.list.max = __list.getAttribute('value') && __list.getAttribute('value') != 0 ? __list.getAttribute('value') : o.list.max
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
		},

		_trimFill:function($s){
			var s = $s
			s = s.replace('0x','#')
			return s
		}
	});

	return ConfigParse;

	}, {
	    requires:['base','node']
	}
);