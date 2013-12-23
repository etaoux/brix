KISSY.add('brix/gallery/charts/js/pub/controls/histogram/configparse',function(S,Base,Node){
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
					normals:['#458AE6', '#39BCC0', '#5BCB8A', '#C3CC5C', '#E6B522', '#E68422'],
					overs  :['#135EBF', '#2E9599', '#36B26A', '#9CA632', '#BF9E39', '#BF7C39']
				},

				y_axis:{                //y轴
					data:{              //数据
						mode:0,         //模式(空或0 = 普通  |  1 = 比例)
						suffix:'%'      //后缀
					}
				},

				x_axis:{                //x轴
					layout:{            //布局
						mode:0          //模式(空或0 = 区间  |  1 = 对应轴)
					}
				},

				graphs:{                //图形
					layout:{            //布局
						mode:0          //模式(0 = 纵向 | 1 = 横向)
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
			if(__data){
				o.v = __data.getAttribute('v') && String(__data.getAttribute('v')) ? String(__data.getAttribute('v')) : o.v

				var __fills = __data.getElementsByTagName("colors")[0]
				if(__fills){
					o.fills.normals = __fills.getAttribute('normals') && String(__fills.getAttribute('normals')) ? String(__fills.getAttribute('normals')).split(',') : o.fills.normals
					o.fills.overs = __fills.getAttribute('overs') && String(__fills.getAttribute('overs')) ? String(__fills.getAttribute('overs')).split(',') : o.fills.overs
				}
			}

			var __y_axis = xmlDoc.getElementsByTagName("y_axis")[0]
			if(__y_axis){
				var __data = __y_axis.getElementsByTagName("data")[0]
				if(__data){
					o.y_axis.data.mode = __data.getAttribute('mode') ? Number(__data.getAttribute('mode')) : o.y_axis.data.mode
				}
			}

			var __x_axis = xmlDoc.getElementsByTagName("x_axis")[0]
			if(__x_axis){
				var __layout = __x_axis.getElementsByTagName("layout")[0]
				if(__layout){
					o.x_axis.layout.mode = __layout.getAttribute('mode') ? Number(__layout.getAttribute('mode')) : o.x_axis.layout.mode
				}
			}

			o.fills.normals = self._trimFills(o.fills.normals)
			o.fills.overs = self._trimFills(o.fills.overs)
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