KISSY.add('brix/gallery/charts/js/pub/views/modules/pieinfo/main',function(S,Base,Node,Global,SVGElement,Graphs,Info,EventType,SVGGraphics){
	var $ = Node.all

	function Main(){
		
		var self = this

		/*
			arguments:

			  o:{
				parent    :''     //SVGElement
				w         :100    //宽
				h         :100    //高
				config    :{}     //配置
			  }

		 */
		Main.superclass.constructor.apply(self,arguments);

		// self.init()
	}

	Main.ATTRS = {
		w:{
			value:0
		},
		h:{
			value:0
		},
		data:{
			value:[]             //[ pie: { data:[300, 100], fills:['#ff0000', '#ffff00'] }, info:[] ]
		},
		element:{
			value:null
		},
		txtStartIndex:{
			value:0              //饼图对应info中的文字的起始索引
		},

		_graphs:{
			value:null           //pie graphs
		},
		_info:{
			value:null           
		},
		_radius:{
			value:30
		},
	}

	S.extend(Main,Base,{
		init:function(){
			var self = this
			Main.superclass.constructor.apply(self,arguments);

			self.set('element', new SVGElement('g')), self.get('element').set('class','pieInfo')
			self.get('parent').appendChild(self.get('element').element)

			self._widget()

			// self.set('_circle', SVGGraphics.circle({'r':5,'fill':'#ffffff','stroke':'#000000','stroke_width':2}))
			// self.get('element').appendChild(self.get('_circle').element)
		},

		_widget:function(){
			var self = this
			var _radius = self.get('_radius')
			var data = self.get('data')
			var _graphs,_info

			self.set('_graphs', new Graphs())
			_graphs = self.get('_graphs')

			var o = {
				x     : _radius,
				y     : _radius,
				parent: self.get('element'),
				data  : data.pie.data,
				fills : data.pie.fills,
				mw    : _radius * 2,
				mh    : _radius * 2,
				xr    : _radius,
				yr    : _radius,
				tr    : _radius * 0.6,
				isTxt : 0,
				disMove : 4,
			}
			_graphs.init(o)
			_graphs.get('element').set('transform','matrix(-1,-0.005,0.005,-1,' + _radius + ',' + _radius + ')')
			_graphs.get('element').on(EventType.OVER,function($o){self._overHandler($o)})
			_graphs.get('element').on(EventType.OUT,function($o){self._outHandler($o)})
			var total = Global.getArrMergerNumber(data.pie.data)
			if (!total) {
				_graphs.get('element').set('visibility','hidden')
			}

			if (data.info) {
				self.set('_info', new Info())
				_info = self.get('_info')

				var o = {
					data   : data.info,
					parent : self.get('element'),
					isBack : 0
				}
				_info.init(o)
			}
			_info.get('element').transformXY(Math.floor(_radius * 2 + 6 + _info.get('w') / 2), _radius)

			if (_info) {
				var w = Math.floor(_radius * 2 + 6 + _info.get('w'))
			}else {
				var w = Math.floor(_radius * 2)
			}
			self.set('w',w)
		},

		_overHandler:function($o){
			var index = $o.index
			this.get('_graphs').induce({index:index},true)
			if (this.get('_info')) {
				this.get('_info').moveRowTxt( { is:1, index:Number(this.get('txtStartIndex')) + Number(index), mode:1 } )
			}
		},
		_outHandler:function($o){
			var index = $o.index
			this.get('_graphs').induce({index:index},false)
			if (this.get('_info')) {
				this.get('_info').moveRowTxt( { is:0, index:Number(this.get('txtStartIndex')) + Number(index), mode:1 } )
			}
		},
	});

	return Main;

	}, {
	    requires:['base','node','../../../utils/global','../../../utils/svgelement','../../../views/pie/graphs','../../../views/infos/info','../../../models/eventtype','../../../views/svggraphics'
	    ]
	}
);