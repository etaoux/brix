KISSY.add('brix/gallery/charts/js/pub/utils/datasection',function(S){
	
	var DataSection  = {
		section:function($arr,$maxPart,$cfg){
			var _max =  Math.max.apply(null,$arr)   //所有数据中最大值
			var _count =  $arr.length               //总共有几条数据
			var _maxPart = $maxPart ? $maxPart : 9  //当前 最多有几个分段
			var arr = []
			var tmpMax = _max
			var tmpMin = 0
			var l = String(Math.ceil(_max)).length
			var scale = 1
			$cfg || ($cfg = {})
			scale = parseFloat($cfg.scale)
			if(!isNaN(scale)){
				_max *= scale
			}
			if (_max % Math.pow(10, l - 1) != 0) {
				//千位数以上 
				if (l >= 3) {
					if (parseInt(_max / Math.pow(10, l - 2)) % 2 == 0) {
						tmpMax = parseInt(_max / Math.pow(10, l - 2)) * Math.pow(10, l - 2) + 2 * Math.pow(10, l - 2)
					}else {
						tmpMax = parseInt(_max / Math.pow(10, l - 2)) * Math.pow(10, l - 2) + Math.pow(10, l - 2)
					}
				}else {
					tmpMax = parseInt(_max / Math.pow(10, l - 1) + 1) * Math.pow(10, l - 1)
				}
			}
			l = String(tmpMax).length
			if (_maxPart >= _count ) { _maxPart = _count }
			var part = _maxPart
			//十位数以上
			if (l >= 2) {
				for (var a = 1, al = tmpMax / Math.pow(10, l - 2) ; a <= al; a++ ) {
					if (tmpMax / (a *  Math.pow(10, l - 2)) == parseInt(tmpMax / (a *  Math.pow(10, l - 2)))) {
						if (tmpMax / (a *  Math.pow(10, l - 2)) <= _maxPart) {
							if (_maxPart - tmpMax / (a *  Math.pow(10, l - 2)) < part) {
								part = _maxPart - tmpMax / (a *  Math.pow(10, l - 2))
							}
						}
					}
				}
				for (var b = 0, bl = _maxPart - part; b < bl; b++ ) {
					arr[b] = tmpMax / (_maxPart - part) * (b + 1)
				}
				//个位数及小数点
			}else if (l <= 1) {
				for (var c = 1, cl = tmpMax ; c <= cl; c++ ) {
					if (tmpMax / c == parseInt(tmpMax / c)) {
						if (tmpMax / c <= _maxPart) {
							if (_maxPart - tmpMax / c < part) {
								part = _maxPart - tmpMax / c
							}
						}
					}
				}
				for (var d = 0, dl = _maxPart - part; d < dl; d++ ) {
					arr[d] = tmpMax / (_maxPart - part) * (d + 1)
				}
			}
			if (arr.length < 1) {
				arr = [0]
			}
			
			return arr
		}
	};

	return DataSection;

	}
);