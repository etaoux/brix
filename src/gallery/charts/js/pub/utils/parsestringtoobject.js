KISSY.add('brix/gallery/charts/js/pub/utils/parsestringtoobject',function(S){
	
	var ParseStringToObject  = {
		toArray:function($s,$s1,$s2){
			var $s1 = $s1 ? $s1 : '&'
			var $s2 = $s2 ? $s2 : '='

			var arr = $s.split($s1);
			var l = arr.length;
			if (l == 1 && !arr[0].split($s2)[1]) { 
				return [];
			}
			var Arr = new Array();
			for (var i = 0; i<l; i++) {
				var tmpArr = arr[i].split($s2);
				var o = new Object();
				o.name = tmpArr[0], o.value = tmpArr[1]
				if (o.value != undefined) {
					Arr.push(o);
				}
			}
			return Arr;
		},
		toObject:function($s,$s1,$s2){
			var $s1 = $s1 ? $s1 : '&'
			var $s2 = $s2 ? $s2 : '='

			var o = { }
			var arr = ParseStringToObject.toArray($s, $s1, $s2)
			if (arr.length) {
				for (var a = 0, al= arr.length; a < al; a++ ) {
					o[arr[a].name] = arr[a].value
				}
			}else {
				return o
			}
			return o
		}
	};

	return ParseStringToObject;

	}
);