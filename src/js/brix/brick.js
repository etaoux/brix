KISSY.add("brix/brick", function(S, Chunk) {
	function Brick(config) {
		Brick.superclass.constructor.call(this, config);
		this.initialize(config);
	}


	Brick.COM = {
		_idMap : {},
		push : function(brick) {
			this._idMap[brick.id] = brick;
		},
		pop : function(brick) {
			delete this._idMap[brick.id];
		},
		getElementById : function(id) {
			return this._idMap[id] || null;
		}
	};

	S.extend(Brick, Chunk, {
		initialize : function(config) {
			this.id = config.id;
			this.pageletId = config.pageletId;
			this.enhanced = false;
			this.tmpl = null;
			this.subtmpl = {};
			this.register2COM();
			this.parseTmpl();
			this.delegateEvents();
			console.log("brickbase initialize~");
			if(this.init) {
				this.init(config);
			}
		},
		parseTmpl : function() {

		},
		delegateEvents : function() {
			var events = this.events;
			var node = document.getElementById(this.id);
			var that = this;
			for(var _type in events) {(function() {
					var type = _type;
					node["on" + type] = function() {
						var event = arguments[0] || window.event;
						var target = event.target || event.srcElement;
						var root = this;
						if(target.nodeType != 1) {
							target = target.parentNode;
						}
						var eventinfo = target.getAttribute("bx" + type);
						if(eventinfo) {
							var events = eventinfo.split("|"), eventArr, eventKey;
							//var vc = vom.getElementById(root.id);
							//var view = vc.view;
							for(var i = 0; i < events.length; i++) {
								eventArr = events[i].split(":");
								eventKey = eventArr.shift();

								// 事件代理,通过最后一个参数,决定是否阻止事件冒泡和取消默认动作
								var evtBehavior = eventArr[eventArr.length - 1], evtArg = false;
								if(evtBehavior == '_halt_' || evtBehavior == '_preventDefault_') {
									event.preventDefault ? event.preventDefault() : (event.returnValue = false);
									evtArg = true;
								}
								if(evtBehavior == '_halt_' || evtBehavior == '_stop_') {
									event.stopPropagation ? event.stopPropagation() : (event.cancelBubble = true);
									evtArg = true;
								}
								if(evtArg) {
									eventArr.pop();
								}
								if(that.events && that.events[type] && that.events[type][eventKey]) {
									that.events[type][eventKey](that, that.idIt(target), eventArr);
								}
							}
						}
						target = null;
						root = null;
					};
				})();
			}
		},
		register2COM : function() {
			Brick.COM.push(this);
		}
	});
	console.watch("Brick", Brick);
	return Brick;
}, {
	requires : ["brix/chunk"]
});
