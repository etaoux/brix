KISSY.add('brix/gallery/charts/js/pub/controls/line/configparse',function(S,Base,Node){
	var $ = Node.all

	function ConfigParse(){
		
		var self = this

		ConfigParse.superclass.constructor.apply(self,arguments);
	}

	ConfigParse.ATTRS = {
		o:{
			value:{
				v:'1.0',

				node:0,
				shape:0,
				area:0,
				areaMode:0,             //区域闭合模式(0 = 自动闭合 | 1 = 不自动闭合 根据前一条线闭合)
				areaAlphas:[0.05, 0.25],//区域填充部分的透明度
				isLine:0,               //当鼠标划入时 是否有线

				data:{
				   mode:0               //数据模式(0 = 普通 | 1 = 叠加)
				},
				
				fills:{
					normals:['#458AE6', '#39BCC0', '#5BCB8A', '#94CC5C', '#C3CC5C', '#E6B522', '#E68422'],
					overs  :['#135EBF', '#2E9599', '#36B26A', '#78A64B', '#9CA632', '#BF9E39', '#BF7C39']
				},

				circle:{
					mode  :0,           //模式[(仅当node=1) 空或0=显示所有节点 | 1=在数据变化时 显示变化的节点] 
					normal:{
						radius:3,       //半径
						thickness:2,    //轮廓粗线
						fill:'#FFFFFF'  //填充色
					},
					over  :{
						min_radius:4,
						max_radius:7,
						max_thickness:2
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
			if(!__data){
				return o 
			}
			o.v = __data.getAttribute('v') && String(__data.getAttribute('v')) ? String(__data.getAttribute('v')) : o.v

			o.node = __data.getAttribute('node') && String(__data.getAttribute('node')) ? Number(__data.getAttribute('node')) : o.node
			o.shape = __data.getAttribute('shape') && String(__data.getAttribute('shape')) ? Number(__data.getAttribute('shape')) : o.shape
			o.area = __data.getAttribute('area') && String(__data.getAttribute('area')) ? Number(__data.getAttribute('area')) : o.area

			var __fills = xmlDoc.getElementsByTagName("colors")[0]
			if(__fills){
				o.fills.normals = __fills.getAttribute('normals') && String(__fills.getAttribute('normals')) ? String(__fills.getAttribute('normals')).split(',') : o.fills.normals
				o.fills.overs = __fills.getAttribute('overs') && String(__fills.getAttribute('overs')) ? String(__fills.getAttribute('overs')).split(',') : o.fills.overs
			}

			o.fills.normals = self._trimFills(o.fills.normals)
			o.fills.overs = self._trimFills(o.fills.overs)

			var __circle = xmlDoc.getElementsByTagName("node")[0]
			if(__circle){
				o.circle.mode = __circle.getAttribute('mode') && String(__circle.getAttribute('normals')) ? Number(__circle.getAttribute('mode')) : o.circle.mode
				var __normal = __circle.getElementsByTagName("normal")[0]
				if(__normal){
					o.circle.normal.radius = __normal.getAttribute('radius') && String(__normal.getAttribute('radius')) ? __normal.getAttribute('radius') : o.circle.normal.radius
					o.circle.normal.thickness = __normal.getAttribute('thickness') && String(__normal.getAttribute('thickness')) ? __normal.getAttribute('thickness') : o.circle.normal.thickness
					o.circle.normal.fill = __normal.getAttribute('color') && String(__normal.getAttribute('color')) ? String(__normal.getAttribute('fill')) : o.circle.normal.fill
				}

				var __over = __circle.getElementsByTagName("over")[0]
				if(__over){
					o.circle.over.min_radius = __over.getAttribute('min_radius') && String(__over.getAttribute('min_radius')) ? __over.getAttribute('min_radius') : o.circle.over.min_radius
					o.circle.over.max_radius = __over.getAttribute('max_radius') && String(__over.getAttribute('max_radius')) ? __over.getAttribute('max_radius') : o.circle.over.max_radius
					o.circle.over.max_thickness = __over.getAttribute('max_thickness') && String(__over.getAttribute('max_thickness')) ? __over.getAttribute('max_thickness') : o.circle.over.max_thickness
				}
			}

			o.circle.normal.fill = self._trimFill(o.circle.normal.fill)
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
			var s = $s.replace('0x','#')
			return s
		}
	});

	return ConfigParse;

	}, {
	    requires:['base','node']
	}
);