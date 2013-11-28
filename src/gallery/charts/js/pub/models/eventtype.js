KISSY.add('brix/gallery/charts/js/pub/models/eventtype',function(S){
	
	var EventType  = {
		MOVE : 'move',
		OVER : 'over',
		OUT  : 'out',
		COMPLETE:'complete',
		CLICK: '_click'       //为防止跟原有click重复触发
	};

	return EventType;

	}
);