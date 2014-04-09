KISSY.add('brix/gallery/visibility/index',function(S,Base){
	var prefix;
	var prefixHidden;
	var prefixVisibilityState;
	// In Opera, `'onfocusin' in document == true`, hence the extra `hasFocus` check to detect IE-like behavior
	var eventName = 'onfocusin' in document && 'hasFocus' in document ? 'focusin focusout' : 'focus blur';
	var prefixes = ['o','ms','moz', 'webkit',''];
	var isSupported;

	while ((prefix = prefixes.pop()) != undefined) {
		prefixHidden = (prefix ? prefix + 'H': 'h') + 'idden';
		if (isSupported = typeof document[prefixHidden] == 'boolean') {
			prefixVisibilityState = (prefix ? prefix + 'V': 'v') + 'isibilityState';
			eventName = prefix + 'visibilitychange';
			break;
		}
	}

	if(!isSupported){
		document.hidden = false;
    	document.visibilityState = 'visible';
    	prefixHidden = 'hidden';
    	prefixVisibilityState = 'visibilityState';
	}

	/**
	 * 监听页面是否显示
	 */
	function Visibility(){
		var me = this;
		S.one(/blur$/.test(eventName) ? window : document).on(eventName, function(event) {
			var type = event.type;
			var originalEvent = event.originalEvent;
			var toElement = originalEvent.toElement;
			// If it’s a `{focusin,focusout}` event (IE), `fromElement` and `toElement` should both be `null` or `undefined`;
			// else, the page visibility hasn’t changed, but the user just clicked somewhere in the doc.
			// In IE9, we need to check the `relatedTarget` property instead.
			if (!/^focus./.test(type) || (toElement == undefined && originalEvent.fromElement == undefined && originalEvent.relatedTarget == undefined)) {
				var isFocusout = /^(?:blur|focusout)$/.test(type);
				if(!isSupported){
					if(isFocusout){
						document.hidden = true;
    					document.visibilityState = 'hidden';
					}
					else{
						document.hidden = false;
    					document.visibilityState = 'visible';
					}
				}
				me.fire((prefixHidden && document[prefixHidden] || isFocusout ? 'hidden' : 'visible'));
			}
		});
	}
	/**
	 * 浏览器是否支持visibilitychange
	 * @type {Boolean}
	 */
	Visibility.isSupported=isSupported;

	/**
	 * 是否是隐藏
	 * @return {Boolean} 
	 */
	Visibility.hidden = function(){
		return document[prefixHidden];
	}
	/**
	 * 当前状态['hidden','visable']
	 * @return {String} 
	 */
	Visibility.visibilityState = function(){
		return document[prefixVisibilityState];
	}

	S.extend(Visibility,Base);
	return Visibility;

},{
	requires:['base','node']
})