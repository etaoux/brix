KISSY.add('brix/gallery/charts/js/pub/views/map/maps/zh/main',function(S,Base,SVGElement,EventType,MapData){
	function Main(){

		var self = this

		Main.superclass.constructor.apply(self,arguments);

		self.init()
	}

	Main.ATTRS = {

		map_w:{
			value:560
		},
		map_h:{
			value:470
		},
		maps:{
			value:[]
		},
		element:{
			value:null
		},

		_main:{
			value:null
		}
	}

	S.extend(Main,Base,{
		init:function(){
			var self = this
			self.set('element',new SVGElement('g'))
			self.get('element').attr({'class':'zh'});
			self.get('parent').appendChild(self.get('element').element)
		},

		widget:function(){
			var self = this
			
			self._widget()
			self._layout()
			self.get('element').fire(EventType.COMPLETE)
		},

		_widget:function(){
			var self = this
			self.set('maps', MapData.get())
		},

		_layout:function(){
			var self = this
			var arr = self.get('maps')
			var _df = document.createDocumentFragment();
			// for(var a = 0, al = arr.length; a < al; a++){
			for(var a in arr){
				var o = arr[a]
				if(o){
					var path = new SVGElement('path')
					path.attr({'d':o.d,'fill':'#BED2ED', 'stroke':'#ffffff','stroke-width':1.5})
					_df.appendChild(path.element)
					path.set('_index', a)
					o.element = path
				}
			}
			self.get('element').appendChild(_df)
			// self.set('_back', new SVGElement('rect')), self.get('_back').attr({'width':self.get('map_w'),'height':self.get('map_h'),'fill':'none','stroke':'#000000'})
			// self.get('element').appendChild(self.get('_back').element)
		},

		_overHandler:function($evt){
			console.log($evt.target.getAttribute('_index'))
		},
		_outHandler:function($evt){
			console.log('_outHandler')	
		}
	});

	return Main;

	}, {
	    requires:['base','../../../../utils/svgelement','../../../../models/eventtype','./mapdata']
	}
);