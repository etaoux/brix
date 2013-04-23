KISSY.add('brix/gallery/charts/js/pub/views/infos/infos',function(S,Base,node,Global,Move,SVGElement,SVGRenderer,SVGGraphics,EventType,Info,Light,HInfo,HLine,Other,Arrow){
	
	function Infos(){
		
		var self = this

		Infos.superclass.constructor.apply(self,arguments);

		this._move = null;
	}

	Infos.ATTRS = {
		w:{
			value:100
		},
		h:{
			value:100
		},
		element:{
			value:null
		},
		dis_info:{
			value:8
		},
		info:{
			value:{
				x:0,                     //x坐标               
				y:0,                     //y坐标
				data:[],                 //Info.data
				base_fill:'#000000'      //Info.base_fill
			}
		},
		light:{
			value:{
				is:0,                    //是否有
				x:0,                     //x坐标
				y:0,                     //y坐标
				min_radius:4,
				max_radius:7,
				max_thickness:2,
				fill:'#000000',          //Light.fill
				fill_opacity:1        
			}
		},
		other:{
			value:{
				is:0,                    //是否有 
				os:[]                    //数组中有几个就几个
			}
		},
		hInfo:{
			value:{
				is:1,                    //是否有
				x:0,                     //x坐标
				y:0,                     //y坐标
				y1:6,                    //当没有hLine时 默认的Y坐标
				content:''               //HInfo.content
			}
		},
		hLine:{
			value:{
				is:1,                    //是否有 
				x:0,                     //x坐标
				y:0,                     //y坐标
				y1:0
			}
		},
		arrow:{
			value:{
				is:0,
				mode:1,                  //模式(1 = 左上 | 2 = 右上 | 3 = 右下 | 4 = 左下)
				x:0,
				y:0,
			}
		},

		_is_new_shadow:{
			value:0
		},
		_shadow_id:{
			value:'shadow'
		},
		_move:{
			value:null
		},

		_info:{
			value:null          
		},
		_light:{
			value:null          
		},
		_other:{
			value:null
		},
		_hInfo:{ 
			value:null            
		},
		_hLine:{ 
			value:null            
		},
		_arrow:{
			value:null
		}
	}

	S.extend(Infos,Base,{
		init:function(){
			var self = this
			Infos.superclass.constructor.apply(self,arguments);
			
			self.set('element', new SVGElement('g')), self.get('element').set('class','infos')
			self.get('parent').appendChild(self.get('element').element)

			self.get('element').element.addEventListener("mouseover",function(evt){ self._overHandler(evt)}, false);
			self.get('element').element.addEventListener("mouseout",function(evt){ self._outHandler(evt)}, false);
		},
		remove:function(){
			var self = this
			if(self.get('_arrow')){
				self.get('element').removeChild(self.get('_arrow').get('element').element)
				self.set('_arrow', null)
			}
			if(self.get('_hLine')){
				self.get('element').removeChild(self.get('_hLine').get('element').element)
				self.set('_hLine', null)
			}
			if(self.get('_hInfo')){
				self.get('element').removeChild(self.get('_hInfo').get('element').element)
				self.set('_hInfo', null)
			}
			if(self.get('_other')){
				self.get('element').removeChild(self.get('_other').get('element').element)
				self.set('_other', null)
			}
			if(self.get('_light')){
				self.get('element').removeChild(self.get('_light').get('element').element)
				self.set('_light', null)
			}
			if(self.get('_info')){
				self.get('element').removeChild(self.get('_info').get('element').element)
				self.set('_info', null)
			}
		},
		
		move:function(){
			var self = this
			Infos.superclass.constructor.apply(self,arguments);
			var x = 0, y = 0
			if(self.get('_info')){
				x = Number(self.get('_info').get('element').get('_x'))
				y = Number(self.get('_info').get('element').get('_y'))
			}
			if(x == 0 && y == 0){
			   x = Number(self.get('info').x) - 17
			   y = Number(self.get('info').y)
			}
			self.update()

			var x2 = Number(self.get('_info').get('element').get('_x'))
			var y2 = Number(self.get('_info').get('element').get('_y'))

			if(this._move){
				this._move.stop()
				this._move = null
			}
			this._move = new Move({x:x,y:y},{x:x2,y:y2},0.3,function($o){
				if(!self.get('_info')){
					return		
				}
				self.get('_info').get('element').transformXY($o.x,$o.y)
				//arrow
				if(self.get('arrow').is){
					var info = self._getArrowInfo()
					var o = {
						parent : self.get('element'),
						data   : info.lines,
						shadow_id : self.get('_shadow_id')
					}
					self.get('_arrow').update(o)
					var x = self.get('_info').get('element').get('_x'), y = self.get('_info').get('element').get('_y')
					self.get('_arrow').get('element').transformXY(x,y)
				}
			},function(){'a'})
		},

		update:function(){
			var self = this
			Infos.superclass.constructor.apply(self,arguments);

			if(self.get('_is_new_shadow') == 0){
				self._shadow()
				if(self.get('arrow').is){
					self._shadow({'dx':-2, 'id':'shadow2'})
				}
				self.set('_is_new_shadow',1)
			}

			self.remove()
			self._widget()
			self._layout()
		},
		_getArrowInfo:function(){
			var self = this
			var arrow = self.get('arrow')
			var angle = 45
			var x = self.get('_info').get('element').get('_x')
			var y = self.get('_info').get('element').get('_y')
			var w = self.get('_info').get('w')
			var h = self.get('_info').get('h')
			var dis = arrow.dis ? arrow.dis : 4
			if (arrow.x < x && arrow.y < y) {
				arrow.mode = 1
			}else if(arrow.x > x && arrow.y < y){
				arrow.mode = 2
			}else if(arrow.x > x && arrow.y > y){
				arrow.mode = 3
			}else if(arrow.x < x && arrow.y > y){
				arrow.mode = 4
			}
			var arr = []
			if(arrow.mode == 1 || arrow.mode == 3){
				self.set('_shadow_id','shadow')
				var o = {}
				o.x = w / 2, o.y = -h / 2 + dis
				arr.push(o)
				var o = {}
				o.x = arrow.x - x, o.y = arrow.y - y
				arr.push(o)
				var o = {}
				o.x = -w / 2 + dis, o.y = h / 2
				arr.push(o)
			}else if(arrow.mode == 2 || arrow.mode == 4){
				self.set('_shadow_id','shadow2')
				angle = 135
				var o = {}
				o.x = w / 2 - dis, o.y = h / 2 
				arr.push(o)
				var o = {}
				o.x = arrow.x - x, o.y = arrow.y - y
				arr.push(o)
				var o = {}
				o.x = -w / 2, o.y = -h / 2 + dis
				arr.push(o)
			}
			return {'lines':arr, 'angle':angle}
		},
		_widget:function(){
			var self = this
			if(self.get('arrow').is){
				self.set('_arrow', new Arrow())
			}
			if(self.get('hLine').is){
				self.set('_hLine', new HLine())
			}
			if(self.get('hInfo').is){
				self.set('_hInfo', new HInfo())
			}
			if(self.get('other').is){
				self.set('_other', new Other())
			}
			if(self.get('light').is){
				self.set('_light', new Light())
			}
			self.set('_info', new Info())
		},
		_layout:function(){
			var self = this

			//arrow
			if(self.get('arrow').is){
				var o = {
					parent : self.get('element'),
				}
				self.get('_arrow').add(o)
			}

			//hline
			if(self.get('hLine').is){
				var o = {
					parent : self.get('element')
				}
				if(self.get('hLine').y1){
					o.y1 = self.get('hLine').y1
				}
				self.get('_hLine').init(o)
			    var x = self.get('hLine').x, y = self.get('hLine').y
			    self.get('_hLine').get('element').transformXY(x,y)
			}

		    //hinfo
		    if(self.get('hInfo').is){
				var o ={
					parent : self.get('element'),
			    	content: self.get('hInfo').content
			    }
			    self.get('_hInfo').init(o)

			    var y1 = self.get('_hLine') ? self.get('_hLine').get('h') : self.get('hInfo').y1
			    var x = self.get('hInfo').x, y = Number(self.get('hInfo').y) + Number(self.get('_hInfo').get('h') / 2) + y1
			   	var p = self._allShow(self.get('w'), self.get('h'), {w:self.get('_hInfo').get('w'),h:self.get('_hInfo').get('h')}, {x:x,y:y})
			    x = p.x, y = p.y
			    self.get('_hInfo').get('element').transformXY(x,y)
			}
		    //other
		    if(self.get('_other')){
		    	var o = {
					parent : self.get('element'),
			    	os     : self.get('other').os
			    }
			    self.get('_other').init(o)
		    }

			//light
			if(self.get('_light')){
		    	var o = {
		    		parent : self.get('element'),
		    		fill   : self.get('light').fill,
		    	}
		    	if(self.get('light').min_radius){
		    		o.min_radius = self.get('light').min_radius
		    	}
		    	if(self.get('light').max_radius){
		    		o.max_radius = self.get('light').max_radius
		    	}
		    	if(self.get('light').max_thickness){
		    		o.max_thickness = self.get('light').max_thickness
		    	}
		    	if(self.get('light').fill_opacity){
		    		o.fill_opacity = self.get('light').fill_opacity
		    	}
			    self.get('_light').init(o)
			    // self.get('_light').get('element').on(EventType.OVER,function($o){self._overHandler({child:'light'})})
				// self.get('_light').get('element').on(EventType.OUT,function($o){self._outHandler({child:'light'})})
			    var x = self.get('light').x, y = self.get('light').y
			    self.get('_light').get('element').transformXY(x,y)
		    }

			//info
			var o = {
				data   : self.get('info').data,
				parent : self.get('element'),
				base_fill   : self.get('info').base_fill,
				shadow_id   : self.get('_shadow_id')
			}
		    self.get('_info').init(o)
		    // self.get('_info').get('element').on(EventType.OVER,function($o){self._overHandler({child:'info'})})
			// self.get('_info').get('element').on(EventType.OUT,function($o){self._outHandler({child:'info'})})

		    var x = self.get('info').x, y = Number(self.get('info').y) - Number(self.get('dis_info')) - Number(self.get('_info').get('h') / 2)
		    if(self.get('arrow').is){
		 	   y = Number(self.get('info').y)
			}
		    if(self.get('_light')){
		    	y -= Number(self.get('_light').get('max_radius'))
		    }
		  	var p = self._allShow(self.get('w'), self.get('h'), {w:self.get('_info').get('w'),h:self.get('_info').get('h')}, {x:x,y:y})
		   	x = p.x, y = p.y
		    if(self.get('_light')){
		    	if (Number(y) + Number(self.get('_info').get('h') / 2) + Number(self.get('dis_info')) + Number(self.get('_light').get('max_radius')) > self.get('_light').get('element').get('_y')) {
			
					y = Number(self.get('light').y) + Number(self.get('_light').get('max_radius')) + Number(self.get('dis_info')) + Number(self.get('_info').get('h') / 2)
				}
		    }else{
		    	// if (Number(self.get('_info').get('element').get('_y')) + Number(self.get('_info').get('h') / 2) + Number(self.get('dis_info')) + Number(self.get('_light').get('max_radius')) > self.get('_light').get('element').get('_y')) {
		    	// }
		    }
		    self.get('_info').get('element').transformXY(x,y)

		   	//arrow
			if(self.get('arrow').is){
				var info = self._getArrowInfo()
				var o = {
					parent : self.get('element'),
					data   : info.lines,
					shadow_id : self.get('_shadow_id')
				}
				self.get('_arrow').init(o)
				var x = self.get('_info').get('element').get('_x'), y = self.get('_info').get('element').get('_y')
				self.get('_arrow').get('element').transformXY(x,y)
			}

			//info
			self.get('_info').setShadow(self.get('_shadow_id'))
		},

		//全显
		_allShow:function($w,$h,$i,$p,$dis){
			var dis = $dis ? $dis : 4
			var w = $w, h = $h
			var x = $p.x , y = $p.y
			if ($p.x - $i.w / 2 < dis) { x = $i.w / 2 + dis}
			if ($p.x + $i.w / 2 > w - dis) { x = w - $i.w / 2 - dis }
			if ($p.y - $i.h / 2 < dis) { y = $i.h / 2 + dis}
			if ($p.y + $i.h / 2 > h - dis) { y = h - $i.h / 2 - dis }
			return {x:x, y:y}
		},

		_shadow:function($o){
			var self = this

			var dx = 2
			var dy = 2
			var id = 'shadow'

			if($o){
				dx = $o.dx ? $o.dx : dx
			 	dy = $o.dy ? $o.dy : dy
			 	id = $o.id ? $o.id : id
			}

			var defs = new SVGElement('defs')
			self.get('element').appendChild(defs.element)

			var filter = new SVGElement('filter')
			filter.attr({'id':id,'filterUnits':'objectBoundingBox','x':'-10%','y':'-10%','width':'150%','height':'150%'})
			defs.appendChild(filter.element)

			var feGaussianBlur = new SVGElement('feGaussianBlur')
			feGaussianBlur.attr({'in':'SourceAlpha','stdDeviation':1,'result':'blurredAlpha'})
			filter.appendChild(feGaussianBlur.element)

			var feOffset = new SVGElement('feOffset')
			feOffset.attr({'in':'blurredAlpha','dx':dx,'dy':dy,'result':'offsetBlurredAlpha'})
			filter.appendChild(feOffset.element)

			var feFlood = new SVGElement('feFlood')
			feFlood.attr({'style':'flood-color:#000000;flood-opacity:0.15','result':'flooded'})
			filter.appendChild(feFlood.element)

			var feComposite = new SVGElement('feComposite')
			feComposite.attr({'in':'flooded','operator':"in",'in2':'offsetBlurredAlpha','result':'coloredShadow'})
			filter.appendChild(feComposite.element)

			var feComposite = new SVGElement('feComposite')
			feComposite.attr({'in':'SourceGraphic','in2':'coloredShadow','operator':'over'})
			filter.appendChild(feComposite.element)
		},

		_overHandler:function($o){
			var self = this
			self.get('element').fire(EventType.OVER,$o)
		},
		_outHandler:function($o){
			var self = this
			self.get('element').fire(EventType.OUT,$o)
		},
	});

	return Infos;

	}, {
	    requires:['base','node','../../utils/global','../../utils/move','../../utils/svgelement','../../utils/svgrenderer','../svggraphics','../../models/eventtype','./info','./light','./hinfo','./hline','./other','./arrow']
	}
);