KISSY.add("brix/core/brick",function(a,b,c){var d=b.extend({initializer:function(){var a=this,b=a.constructor;while(b){var c=b.RENDERERS;c&&(a.addTmpl(),a.get("dataset").setRenderer(c,a)),b=b.superclass&&b.superclass.constructor}},bindUI:function(){var a=this;a._bindEvent()},_detachEvent:function(){var a=this,b=a.constructor;while(b){var c=b.EVENTS;c&&a._removeEvents(c);var d=b.DOCEVENTS;d&&a._removeEvents(d,document),b=b.superclass&&b.superclass.constructor}var e=a.get("events");e&&this._removeEvents(e)},_bindEvent:function(){var a=this,b=a.constructor;while(b){var c=b.EVENTS;c&&this._addEvents(c);var d=b.DOCEVENTS;d&&this._addEvents(d,document),b=b.superclass&&b.superclass.constructor}var e=a.get("events");e&&this._addEvents(e)},_removeEvents:function(a,b){b=b||this.get("el");for(var d in a){var e=a[d];for(var f in e){var g=e[f];d===""?c.detach(b,f,g,this):c.undelegate(b,f,d,g,this)}}},_addEvents:function(a,b){b=b||this.get("el");for(var d in a){var e=a[d];for(var f in e){var g=e[f];d===""?c.on(b,f,g,this):c.delegate(b,f,d,g,this)}}},destructor:function(){var a=this;if(a.get("rendered")){a._detachEvent();if(a.get("isRemoveHTML")){var b=a.get("el");a.get("isRemoveEL")?b.remove():b.empty()}}a.get("pagelet")&&a.set("pagelet",null)}},{ATTRS:{pagelet:{value:null}}});return d},{requires:["./chunk","event"]});