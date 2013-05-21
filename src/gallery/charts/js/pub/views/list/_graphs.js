KISSY.add('brix/gallery/charts/js/pub/views/list/graphs',function(S,Base,node,Global,SVGElement,SVGRenderer,SVGGraphics,Sign){
	
	function List(){
		
		var self = this

		List.superclass.constructor.apply(self,arguments);

		// self.init()
	}

	List.ATTRS = {
		w:{
			value:100
		},
		h:{
			value:100
		},
		data:{
			value:[]             //[o,o,o]
			                       /*o:{
									   sign:{
									   	   is:1,
									   	   circle:{
									           is:1,
									           radius:12,
									 	       fill:'#937ACC'
										   },
										   font:{
											   is:1
											   content:'name',
											   size:12,
											   fill:'#000000',
									           bold:1,
											   family:'微软雅黑'
										   }		
									   },
									   font:{
										   is:1,
										   content:'name',
										   size:12,
										   fill:'#000000',
									       bold:1,
										   family:'微软雅黑'
									   }
			                         }
			                       */
		},
		element:{
			value:null
		}
	}			

	S.extend(List,Base,{
		init:function(){
			var self = this
			List.superclass.constructor.apply(self,arguments);
			
			self.set('element', new SVGElement('g')), self.get('element').set('class','list')
			self.get('element').setDynamic('childs',[])
			self.get('parent').appendChild(self.get('element').element)

			self._widget()
		},

		_widget:function(){
			var self = this
			var data = self.get('data')
			data = self._test()

			//每个alist之间的间距  但是最上面一个alist距顶端为0
			var disY = 4
			//alist中的sign与font之间的x距离
			var disX = 4

			var induce = self._drawGraph({w:100,h:100,opacity:0.4})
			self.get('element').appendChild(induce.element)

			for (var a = 0, al = data.length; a < al; a++ ) { 
				var o = data[a]

				var aList = new SVGElement('g')
				aList.setDynamic('info',{h:0})
				aList.set('class','alist')
				self.get('element').appendChild(aList.element)
				self.get('element').getDynamic('childs').push(aList)

				var sign = new Sign()
				sign.init({
					parent : aList,
					config : o.sign
				})
				var x = sign.get('w') / 2, y = sign.get('h') / 2
				var w = 0, h = 0 
   				sign.get('element').transformXY(x, y)

   				var font = SVGGraphics.text(o.font)
   				aList.appendChild(font.element)
   				x = sign.get('w') + disX
   				y = font.getHeight() * 0.75
   				font.transformXY(x, y)

   				if(font.getHeight() > sign.get('h')){
   					y = (font.getHeight() - sign.get('h')) / 2 
   					y =  parseInt(sign.get('h') / 2 + y)
   					sign.get('element').transformY(y)

   					h = font.getHeight()
   				}else{
   					y = -(font.getHeight() - sign.get('h')) / 2
   					y = parseInt(font.getHeight() * 0.75 + y)
   					font.transformY(y)

   					h = sign.get('h')
   				}
   				aList.getDynamic('info').h = h

   				var pre_list = self.get('element').getDynamic('childs')[a - 1]
   				if(pre_list){
   					y = disY + Number(pre_list.get('_y')) + Number(pre_list.getDynamic('info').h)
   				}else{
   					y = 0
   				}
   				aList.transformY(y)
			}
		},

		_test:function(){
			var data = []
			var o ={sign:{is:0,circle:{is:1,radius:4,fill:'#937ACC'},font:{is:0,content:'1',size:12,fill:'#000000',bold:1,family:'微软雅黑'}},font:{is:1,content:'哈哈哈1',size:12,fill:'#000000',bold:1,family:'微软雅黑'}}
			data.push(o)
			var o ={sign:{is:0,circle:{is:1,radius:4,fill:'#937ACC'},font:{is:0,content:'2',size:12,fill:'#000000',bold:1,family:'微软雅黑'}},font:{is:1,content:'哈哈哈2',size:12,fill:'#000000',bold:1,family:'微软雅黑'}}
			data.push(o)
			var o ={sign:{is:0,circle:{is:1,radius:4,fill:'#937ACC'},font:{is:0,content:'2',size:12,fill:'#000000',bold:1,family:'微软雅黑'}},font:{is:1,content:'哈哈哈3',size:12,fill:'#000000',bold:1,family:'微软雅黑'}}
			data.push(o)
			return data
		},
				//画支柱
		_drawGraph:function($o){
			var w = $o.w,h = $o.h,fill = $o.fill ? $o.fill : '#000000',opacity = $o.opacity ? $o.opacity : 1
			var d = SVGRenderer.symbol('square',0,0,w,h).join(' ')
			var p = new SVGElement('path')
			p.attr({'_w':w,'_h':h,'d':d,'fill':fill,'opacity':opacity})
			return p
		},
	});

	return List;

	}, {
	    requires:['base','node','../../utils/global','../../utils/svgelement','../../utils/svgrenderer','../../views/svggraphics','../modules/sign/main']
	}
);