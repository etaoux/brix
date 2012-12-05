KISSY.add('brix/gallery/charts/js/pub/views/infos/other',function(S,Base,node,Global,SVGElement,SVGGraphics,Light){
	
	function Other(){
		
		var self = this

		Other.superclass.constructor.apply(self,arguments);
	}

	Other.ATTRS = {
		element:{
			value:null
		},
		os:{
			value:[]
		}
	}

	S.extend(Other,Base,{
		init:function(){
			var self = this
			Other.superclass.constructor.apply(self,arguments);
			
			self.set('element', new SVGElement('g')), self.get('element').set('class','other')
			self.get('parent').appendChild(self.get('element').element)

			self._widget()
		},
		
		_widget:function(){

			var self = this
			for(var a = 0, al = self.get('os').length; a < al; a++){
				var $o = self.get('os')[a]
				var light = new Light()
		    	var o = {
		    		parent : self.get('element'),
		    		fill   : $o.fill_over
		    	}
			 	light.init(o)
			    var x = $o.x, y = $o.y
			    light.get('element').transformXY(x,y)
			}
		}
	});

	return Other;

	}, {
	    requires:['base','node','../../utils/global','../../utils/svgelement','../svggraphics','./light']
	}
);