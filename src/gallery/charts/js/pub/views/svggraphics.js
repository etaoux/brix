KISSY.add('brix/gallery/charts/js/pub/views/svggraphics',function(S,Node,SVGElement,SVGRenderer){
	
	var SVGGraphics = {
		/**
		 * 创建文字
		 * @param  {[Object]} $o [配置参数]
		 * @return {[SVGElement]}    [文本SVGElement对象]
		 */
		text:function($o){
			var $o = $o ? $o : {}
			var family = $o.family ? $o.family : 'Arial'
			var size = $o.size ? $o.size : 12
			var fill = $o.fill ? $o.fill : '#000000'
			var content = $o.content ? $o.content : ''
			var bold = $o.bold ? 'bold' : ''

			var font = new SVGElement('text')
			font.attr({'font-family':family, 'font-size':size,'fill':fill,'font-weight':bold})
			
			// var tspan = new SVGElement("tspan");
		    // tspan.appendChild(document.createTextNode(content));
		    // font.appendChild(tspan.element);
		 	font.appendChild(document.createTextNode(content));
		    return font
		},
		/**
		 * 创建圆
		 * @param  {[Object]} $o [配置参数]
		 * @return {[SVGElement]}    [圆SVGElement对象]
		 */
		circle:function($o){
			var $o = $o ? $o : {}
			var r = $o.r ? $o.r : 10
			var fill = $o.fill ? $o.fill : '#000000'
			var fill_opacity = $o.fill_opacity || Number($o.fill_opacity) == 0 ? $o.fill_opacity : 1
			var stroke = $o.stroke ? $o.stroke : null
			var stroke_width = $o.stroke_width || Number($o.stroke_width) == 0 ? $o.stroke_width : 1
			var stroke_opacity = $o.stroke_opacity || Number($o.stroke_opacity) == 0 ? $o.stroke_opacity : 1

			var circle = new SVGElement('circle')
			circle.attr({'r':r,'fill':fill, 'fill-opacity':fill_opacity, 'stroke':stroke, 'stroke-width':stroke_width, 'stroke-opacity':stroke_opacity})
			return circle
		},
		/**
		 * 创建线组
		 * @param  {[Object]} $o [配置参数]
		 * @return {[SVGElement]}    [线组SVGElement对象]
		 */
		lines:function($o){
			var $o = $o ? $o : {}
			var lines = $o.lines
			var fill = $o.fill ? $o.fill : 'none'
			var stroke = $o.stroke ? $o.stroke : '#000000'
			var stroke_width = $o.stroke_width ? $o.stroke_width : 1
			var d = SVGRenderer.symbol('lines','','','','',lines)
			var fill_opacity = $o.fill_opacity ? $o.fill_opacity : 1

			var path = new SVGElement('path')
			path.attr({'d':d,'fill':fill, 'stroke':stroke,'stroke-width':stroke_width, 'fill-opacity':fill_opacity})
			return path
		},
		/**
		 * 创建二次贝塞尔曲线组
		 * @param  {[Object]} $o [配置参数]
		 * @return {[SVGElement]}    [线组SVGElement对象]
		 */
		curveLines:function($o){
			var $o = $o ? $o : {}
			var lines = $o.lines
			var fill = $o.fill ? $o.fill : 'none'
			var stroke = $o.stroke ? $o.stroke : '#000000'
			var stroke_width = $o.stroke_width ? $o.stroke_width : 1
			var d = SVGRenderer.symbol('curveLines','','','','',lines)

			var path = new SVGElement('path')
			path.attr({'d':d,'fill':fill, 'stroke':stroke,'stroke-width':stroke_width})
			return path
		}
	}

	return SVGGraphics;

	}, {
	    requires:['node','../utils/svgelement','../utils/svgrenderer']
	}
);