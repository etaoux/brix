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
				isArea_opacity:0,       //是否有调整区域填充部分的透明度
				area_opacity:[0.05, 0.25],//区域填充部分的透明度
				isLine:0,               //当鼠标划入时 是否有线

				data:{
				   mode:0               //数据模式(0 = 普通 | 1 = 叠加)
				},

				thickness:{             //线条粗线
					normal  : 2,        //正常情况
					over    : 3         //鼠标划入时
				},
				
				x_axis:{                //x轴
					line : {
						enabled : 1
					}
				},

				y_axis:{                //y轴
					enabled : 1,
					line: {
						enabled : 1
					},
					data:{
						isInt:0         //是否都为整数  防止[8, 8.2, 8.4, 8.6, 8.8, 9]   应该[8, 9]
					}
				},

				back:{                  //背景
					axis : {
						enabled : 1     //是否有从原点开始的x轴以及y轴
					},
					x_axis : {          //x轴
						mode : 0        //模式(0 = 虚线 | 1 = 实线)                
					},
					y_axis : {
						enabled : 1     //是否有y轴
					}
				},

				fills:{
					isDefault : 1,      //是否默认  如果外部传入有normals | overs  该值为0
					                    //用于integrate5
					normals:['#458AE6', '#39BCC0', '#5BCB8A', '#94CC5C', '#C3CC5C', '#E6B522', '#E68422'],
					overs  :['#135EBF', '#2E9599', '#36B26A', '#78A64B', '#9CA632', '#BF9E39', '#BF7C39']
				},
				
				circle:{
					mode  :0,           //模式[(仅当node=1) 空或0=显示所有节点 | 1=在数据变化时 显示变化的节点] 
					normal:{
						radius:3,       //半径
						thickness:2,    //轮廓粗细
						fill:'#FFFFFF', //填充色
						fill_follow : 0 //填充色是否跟随线条颜色(0 = 否 | 1 = 是)       ---
					},
					over  :{
						min_radius:4,                       //小圆半径
						max_radius:7,                       //大圆半径(白)
						max_fill_opacity:1,                 //大圆填充透明度           
						max_thickness:2,                    //大圆线框粗线
						max_thickness_opacity:1             //大圆线框透明度           
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
			
			if(__data.getAttribute('area_opacity') && String(__data.getAttribute('area_opacity'))){
				o.isArea_opacity = 1
			}
			o.area_opacity = __data.getAttribute('area_opacity') && String(__data.getAttribute('area_opacity')) ? String(__data.getAttribute('area_opacity')).split(',') : o.area_opacity
			

			var __thickness = xmlDoc.getElementsByTagName("thickness")[0]
			if(__thickness){
				o.thickness.normal = __thickness.getAttribute('normal') ? __thickness.getAttribute('normal') : o.thickness.normal
				o.thickness.over = __thickness.getAttribute('over') ? __thickness.getAttribute('over') : o.thickness.over
			}

			var __x_axis = xmlDoc.getElementsByTagName("x_axis")[0]
			if(__x_axis){
				var __line = __x_axis.getElementsByTagName("line")[0]
				if(__line){
					o.x_axis.line.enabled = String(__line.getAttribute('enabled')) ? Number(__line.getAttribute('enabled')) : o.x_axis.line.enabled
				}
			}

			var __y_axis = xmlDoc.getElementsByTagName("y_axis")[0]
			if(__y_axis){
				o.y_axis.enabled = __y_axis.getAttribute('enabled') && String(__y_axis.getAttribute('enabled')) ? Number(__y_axis.getAttribute('enabled')) : o.y_axis.enabled
				var __line = __y_axis.getElementsByTagName("line")[0]
				if(__line){
					o.y_axis.line.enabled = String(__line.getAttribute('enabled')) ? Number(__line.getAttribute('enabled')) : o.y_axis.line.enabled
				}
				var __data = __y_axis.getElementsByTagName("data")[0]
				if(__data){
					o.y_axis.data.isInt = __data.getAttribute('int') && String(__data.getAttribute('int')) ? Number(__data.getAttribute('int')) : o.y_axis.data.isInt
				}
			}

			var __back = xmlDoc.getElementsByTagName("back")[0]
			if(__back){
				var __axis = __back.getElementsByTagName("axis")[0]
				if(__axis){
					o.back.axis.enabled = String(__axis.getAttribute('enabled')) ? Number(__axis.getAttribute('enabled')) : o.back.axis.enabled
				}

				var __x_axis = __back.getElementsByTagName("x_axis")[0]
				if(__x_axis){
					o.back.x_axis.mode = String(__x_axis.getAttribute('mode')) ? Number(__x_axis.getAttribute('mode')) : o.back.x_axis.mode
				}
				var __y_axis = __back.getElementsByTagName("y_axis")[0]
				if(__y_axis){
					o.back.y_axis.enabled = String(__y_axis.getAttribute('enabled')) ? Number(__y_axis.getAttribute('enabled')) : o.back.__y_axis.enabled
				}
			}


			var __fills = xmlDoc.getElementsByTagName("colors")[0]
			if(__fills){
				if((__fills.getAttribute('normals') && String(__fills.getAttribute('normals'))) || (__fills.getAttribute('overs') && String(__fills.getAttribute('overs')))){
					o.fills.isDefault = 0
				}
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
					o.circle.normal.fill_follow =__normal.getAttribute('color_follow') && String(__normal.getAttribute('color_follow')) ? Number(__normal.getAttribute('color_follow')) : o.circle.normal.fill_follow
				}
				var __over = __circle.getElementsByTagName("over")[0]
				if(__over){
					o.circle.over.min_radius = __over.getAttribute('min_radius') && String(__over.getAttribute('min_radius')) ? __over.getAttribute('min_radius') : o.circle.over.min_radius
					o.circle.over.max_radius = __over.getAttribute('max_radius') && String(__over.getAttribute('max_radius')) ? __over.getAttribute('max_radius') : o.circle.over.max_radius
					o.circle.over.max_fill_opacity = __over.getAttribute('max_color_opacity') && String(__over.getAttribute('max_color_opacity')) ? Number(__over.getAttribute('max_color_opacity')) : o.circle.over.max_fill_opacity
					o.circle.over.max_thickness = __over.getAttribute('max_thickness') && String(__over.getAttribute('max_thickness')) ? __over.getAttribute('max_thickness') : o.circle.over.max_thickness
					o.circle.over.max_thickness_opacity = __over.getAttribute('max_thickness_opacity') && String(__over.getAttribute('max_thickness_opacity')) ? Number(__over.getAttribute('max_thickness_opacity')) : o.circle.over.max_thickness_opacity

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