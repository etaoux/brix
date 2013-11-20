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
		getArrScales:function($arr, $exact){
			/*
			var arr = []
			var total = 0
			var max = 0
			var maxIndex = 0
			var scale
			for (var a = 0 , al = $arr.length; a < al; a++) {
				$arr[a] = Number($arr[a])
				total += $arr[a]
			}
			if (total == 0) {
				for (var g = 0 , gl = $arr.length; g < gl; g++) {
					scale = Math.round(1 / $arr.length * 100)
					arr.push(scale)
				}
				return arr
			}
			
			for (var b = 0, bl = $arr.length; b < bl; b++) {
				scale = Math.round($arr[b] / total * 100)
				arr.push(scale)
			}
			
			total = 0
			for (var c = 0, cl = arr.length; c < cl; c++) {
				arr[c] = isNaN(arr[c]) || arr[c] < 0 ? 0 : arr[c]
				if(max < arr[c]){
					max = arr[c]
					maxIndex = c
				}
				total += arr[c]
			}
			if (total > 100) {
				arr[maxIndex] = arr[maxIndex] - (total - 100)
			}else if(total < 100){
				arr[maxIndex] = arr[maxIndex] + (100 - total)
			}
			if (arr[maxIndex] < 0) {
				arr[maxIndex] = 0
			}
			return arr
			*/

			var arr = []
			var total = 0
			var max = 0
			var maxIndex = 0
			var scale
			//几位小数点
			var exact = $exact ? $exact : 0
			var exactNumber = Math.pow(10, (2 + exact))
			//最后整数除以该数 得到exact位的小数点值
			var exactDisNumber = Math.pow(10, exact)
			for (var a = 0 , al = $arr.length; a < al; a++) {
				$arr[a] = Number($arr[a])
				total += $arr[a]
			}
			if (total == 0) {
				for (var g = 0 , gl = $arr.length; g < gl; g++) {
					scale = Math.round(1 / $arr.length * exactNumber)
					arr.push(scale)
				}
				return arr
			}
			
			for (var b = 0, bl = $arr.length; b < bl; b++) {
				scale = Math.round($arr[b] / total * exactNumber)
				arr.push(scale)
			}
			
			total = 0
			for (var c = 0, cl = arr.length; c < cl; c++) {
				arr[c] = isNaN(arr[c]) || arr[c] < 0 ? 0 : arr[c]
				if(max < arr[c]){
					max = arr[c]
					maxIndex = c
				}
				total += arr[c]
			}
			if (total > exactNumber) {
				arr[maxIndex] = arr[maxIndex] - (total - exactNumber)
			}else if(total < exactNumber){
				arr[maxIndex] = arr[maxIndex] + (exactNumber - total)
			}
			if (arr[maxIndex] < 0) {
				arr[maxIndex] = 0
			}
			
			if (exact != 0) {
				for (var d = 0, dl = arr.length; d < dl; d++) {
					arr[d] = arr[d] / exactDisNumber
				}
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
		},
		/**
		 * 获取相对坐标(相对于div)
		 * @param  {[Obhect]}   $evt     [鼠标事件对象]
		 * @param  {[document]} $element [删除的长度]
		 * @return {[Object]}            [相对于div坐标]
		 */
		getLocalXY:function($evt,$element){
			// while($element.tagName!='DIV'){
			// 	$element = $element.parentNode
			// }
			var o = S.one($element).offset()
			// var o = $element
			//S.log($element)
			//S.log('$evt.pageX ' + $evt.pageX +"   |   "+ '$evt.pageY ' + $evt.pageY)
			// S.log('offset   X ' + o.left +"   |   "+ 'offset   Y ' + o.top)
			//debugger
			return {'x':$evt.pageX - o.left, 'y':$evt.pageY - o.top};
		}
	};

	return Global;

	}
);