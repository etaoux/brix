KISSY.add('brix/gallery/charts/js/pub/utils/svgrenderer',function(S){
	
	/**
	 * SVG渲染Path String
	 * @type {Object}
	 */
	var SVGRenderer = {

	  	symbol: function ($symbol, $x, $y, $w, $h, $options) {

		   var symbolFn = this.symbols[$symbol],
		       path = symbolFn && symbolFn(

		       Math.round($x),
		       Math.round($y),
		       $w,
		       $h,
		       $options
		    );

		    return path;
	 	},
	 	actions:{
	 		M : 'M',
	 		L : 'L',
	 		Q : 'Q'

	 	},
	 	symbols: {

		    //直线
		    'line'  : function($x,$y,$w,$h){
		    	return [
		    		SVGRenderer.actions.M, $x, $y,
		    		SVGRenderer.actions.L, $w, $h
		    	]
		    },
		    //多线组合
		    'lines' : function($x, $y, $w, $h, $options){
		    	var $arr = $options
		    	var s = SVGRenderer.actions.M + $arr[0].x + ' ' + $arr[0].y
		    	for(var a = 1,al = $arr.length; a < al ; a++){

		    		var x = $arr[a].x
		    		var y = $arr[a].y
		    		s += ' ' + SVGRenderer.actions.L + x + ' ' + y
		    	}
		    	return s
		    },
		    //二次贝塞尔曲线
		    'curveLines':function($x, $y, $w, $h, $options){
		    	var arr = S.clone($options);

				var s = SVGRenderer.actions.M + arr[0].x + ' ' + arr[0].y

			    for (var a = 0, al = arr.length - 2; a < al; a++ ) {
				    var x2 = (arr[a + 1].x + arr[a + 2].x ) / 2
				    var y2 = (arr[a + 1].y + arr[a + 2].y ) / 2
				    var x = arr[a + 1].x * 2 - (arr[a].x + x2) / 2;
				    var y = arr[a + 1].y * 2 - (arr[a].y + y2) / 2;
				    s +=' ' +  SVGRenderer.actions.Q + x + ' ' + y + ' ' + x2 + ' ' + y2
				    arr[a + 1] = {x:x2,y:y2}
			    }
			    s += ' ' + SVGRenderer.actions.L + arr[arr.length - 1].x + ' ' + arr[arr.length - 1].y
		   	 	return s
		    },
		    //方形
		    'square': function (x, y, w, h) {
		        return [
		            SVGRenderer.actions.M, x, y,
		            SVGRenderer.actions.L, x + w, y,
		            x + w, y + h,
		            x, y + h
		        ];
		    }
		}
	}

	return SVGRenderer;

	}
);