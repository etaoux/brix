KISSY.add('brix/gallery/charts/js/pub/utils/global',function(S){
	
	var Global  = {

		N05    : 0.5,
		N00001 : 0.00001,

		/**
		 * 数字千分位加','号
		 * @param  {[Number]} $n [数字]
		 * @param  {[type]} $s [千分位上的符号]
		 * @return {[String]}    [根据$s提供的值 对千分位进行分隔 并且小数点上自动加上'.'号  组合成字符串]
		 */
		numAddSymbol:function($n,$s){
			var s = String($n)
			var symbol = $s ? $s : ','
			if(isNaN($n)){
				return s
			}
			var n_arr = s.split('.')
			s = n_arr[0]
			var l = s.length
			var d = l / 3
			var arr = []
			if(d > 1){
				for(var a = 1;a<d;a++){
					arr.unshift(s.substr(-3,3))
					s = s.substr(0,s.length - 3)
				}
			}
			arr.unshift(s)
			n_arr.shift()
			arr.concat(n_arr)
			s = arr.join($s)
			if(n_arr.length == 1){
				s = s + '.' + n_arr[0]
			}
			return s
		},

		/**
		 * 将二维数组转换成一维数组
		 * @param  {[Array]} $arr [二维数组]
		 * @return {[Array]}      [一维数组]
		 */
		getChildsArr:function($arr){
			var arr = []
			for (var i = 0, l = $arr.length; i < l; i++){
				var tmp = $arr[i]
				arr = arr.concat(tmp);
			}
			return arr;
		},

		/**
		 * 从一个二维数组中获取子数组最长的长度值
		 * @param  {[type]} $arr:Array [description]
		 * @return {[type]}            [description]
		 */
		getMaxChildArrLength:function($arr) {
			var n = 0
			var arr = $arr
			for (var i = 0, l = arr.length; i < l; i++ ) {
				n = n > arr[i].length ? n : arr[i].length
			}
			return n
		},

		/**
		 * 根据$start和$end 从一个数组中合并数据
		 * @param  {[Array]} $arr    [数组]
		 * @param  {[Number]} $start [开始的索引]
		 * @param  {[Number]} $end   [结束的索引]
		 * @return {[Number]}        [之和的数字]
		 */
		getArrMergerNumber:function($arr,$start,$end){
			var n = 0
			var start = $start ? $start : 0 
			var end = $end || $end == 0 ? $end : $arr.length - 1
			if (start > end) {
				return n
			}
			for (var a = 0, al = $arr.length; a < al; a++) {
				if(a >= start){
					n = n + Number($arr[a])
					if(a == end){
						break;
					}
				}
			}
			return n
		},

		//在一个数组中 返回比对$arr中的值离$n最近的值的索引
		disMinATArr:function($n, $arr) {
			var index = 0
			var n = Math.abs($n - $arr[0])
			for (var a = 1, al = $arr.length ; a < al; a++ ) {
				if (n > Math.abs($n - $arr[a])) {
					n = Math.abs($n - $arr[a])
					index = a
				}
			}
			return index
		},

		/**
		 * 从一个数组中删除$length参数指定的长度 但需要保留子数组最后一位 返回新的数组
		 * @param  {[Array]} $arr    [数组]
		 * @param  {[Number]} $length [删除的长度]
		 * @return {[Array]}         [删除之后的数组]
		 */
		delArrUnPop:function($arr, $length) {
			var tmp = S.clone($arr);
			if (tmp.length >= $length + 1){
				var pop = tmp[tmp.length - 1];
				tmp.length = tmp.length - $length - 1;
				tmp.push(pop);
			}
			return tmp;
		},

		//根据$index指定的索引 将$arr中的$index处的数据 放到最前面 $index之后的数据自动提前一位
		unshiftIndexArray:function ($arr, $index) {
			var tmp = $arr[$index]
			$arr.splice($index,1)
			$arr.unshift(tmp)
		},

		ceil:function ($n){
			return Math.ceil($n)
		},

		//等比例缩放数值 $p1=缩放后最大w,h  $p2=需要缩放的w,h
		fit:function($p1,$p2){
			var p = {}
			var disW = $p1.w / $p2.w, disH = $p1.h / $p2.h
			
			if (disW >= disH) {
				p.scale = disH
				p.w = $p2.w * disH , p.h = $p1.h
			} else {
				p.scale = disW
				p.w = $p1.w, p.h = $p2.h * disW;
			}
			return p
		},

		//根据文字的length获取文字的宽
		getTextWidth:function($length){
			return 11 + 7 * ($length-1)
		},

		/**
		 * 计算数组中的每个值 占该数组总值的比例 并按原始索引返回对应的比例数组  比例总和为100
		 * @param  {[Array]} $arr    [数组]
		 * @return {[Array]}         [对应的比例数组]
		 */
		getArrScales:function($arr){
			var arr = []
			var total = 0
			var scales = []
			for (var a = 0 , al = $arr.length; a < al; a++) {
				$arr[a] = Number($arr[a])
				total += $arr[a]
			}
			for (var b = 0, bl = $arr.length; b < bl; b++) {
				var scale = Math.round($arr[b] / total * 100)
				scales.push(scale)
				
				//最后一个
				if (b == ($arr.length - 1)) {
					var n = 0
					for (var d = 0, dl = scales.length - 1; d < dl; d++ ) {
						n += scales[d]
					}
					n = 100 - n
					n = n < 0 ? 0 : n
					scale = n
					//如果最后一个大于前一个
					if(n > arr[arr.length - 1]){
						var dis = n - arr[arr.length - 1]
						n = arr[arr.length - 1]
						arr[0] += dis
						scale = n
					}
				}
				
				arr.push(scale)
			}
			
			for (var c = 0, cl = arr.length; c < cl; c++) {
				arr[c] = isNaN(arr[c]) ? 0 : arr[c]
			}
			return arr
		},

		/**
		 * Number精度计算
		 * @param  {[Array]} $arr    [数组]
		 * @param  {[Number]} $length [删除的长度]
		 * @return {[Array]}         [删除之后的数组]
		 */
		CountAccuracy:{
			/**
			 * 加法
			 * @param  {[Number]} $arg1  [数字1]
			 * @param  {[Number]} $arg2  [数字2]
			 * @return {[Number]}        [两个数字之和后的值]
			 */
			add:function($arg1,$arg2){
				var r1, r2, m;  
				try {  r1 = $arg1.toString().split(".")[1].length;  }  catch (e) {  r1 = 0;  }  
				try {  r2 = $arg2.toString().split(".")[1].length;  }  catch (e) {  r2 = 0;  }  
				m = Math.pow(10, Math.max(r1, r2)); 
				//19.6*100 = ?????
				return (this.mul($arg1, m) + this.mul($arg2, m)) / m;
			},

			/**
			 * 乘法
			 * @param  {[Number]} $arg1  [数字1]
			 * @param  {[Number]} $arg2  [数字2]
			 * @return {[Number]}        [两个数字之乘后的值]
			 */
			mul:function($arg1, $arg2) {  
				var m = 0, s1 = $arg1.toString(), s2 = $arg2.toString();  
				try {  m += s1.split(".")[1].length;  }  catch (e) {  }  
				try {  m += s2.split(".")[1].length;  }  catch (e) {  }  
				return Number(s1.replace(".", "")) * Number(s2.replace(".", "")) / Math.pow(10, m)
			}
		}
	};

	return Global;

	}
);