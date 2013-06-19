KISSY.add('brix/gallery/charts/js/e/treemap2/main', function(S, Base, d3) {
	function Main() {
		var self = this
		/*
			arguments:

			  o:{
				parent   :''     //SVGElement
				w        :100    //chart 宽
				h        :100    //chart 高
				config   :''     //图表配置
				data     :''     //图表数据  
			  }

		 */
		Main.superclass.constructor.apply(self, arguments);
		self.init()
	}

	Main.ATTRS = {
		_main: {
			value: null
		},
		_config: { //图表配置   经过ConfigParse.parse
			value: {}
		},
		_DataSource: {
			value: {} //图表数据源 经过DataParse.parse
		}
	}

	S.extend(Main, Base, {
		init: function() {
			var self = this
			self._widget()
		},

		_widget: function() {
			var self = this
			var w = self.get('w'),
				h = self.get('h'),
				x = d3.scale.linear().range([0, w]),
				y = d3.scale.linear().range([0, h]),
				color = d3.scale.category20c(),
				root,
				node;
			var treemap = d3.layout.treemap()
				.round(false)
				.size([w, h])
				.sticky(true)
				.value(function(d) {
				return d.size;
			});

			var svg = d3.select(self.get('parent').element).append("svg:g").attr("transform", "translate(.5,.5)").attr('class', 'parent');

			node = root = self.get('data');

			var nodes = treemap.nodes(root).filter(function(d) {
				return !d.parent;
			});
			//appendChildren(nodes,root);
			appendChildren(root.children, root);

			// d3.select(window).on("click", function() {
			// 	zoom(root);
			// });

			function appendChildren(nodes, d) {
				var kx = w / d.dx,
					ky = h / d.dy;
				x.domain([d.x, d.x + d.dx]);
				y.domain([d.y, d.y + d.dy]);

				var cell = svg.selectAll(".parent").data(nodes).enter().append("svg:g").attr("class", "cell").attr("transform", function(d) {
					return "translate(" + x(d.x) + "," + y(d.y) + ")";
				}).on("click", function(d) {
					if (d3.event.button == 0) {
						if (d.children) {
							zoom(d, d3.select(this));
						} else {
							var parent = d.parent.parent;
							if (parent) {
								zoom(parent, (parent == root ? null : d3.select(this)));
							}
						}
					} else {
						var parent = d.parent.parent;
						if (parent) {
							zoom(parent, (parent == root ? null : d3.select(this)));
						}
					}
				}).on("contextmenu", function(d) {
					var parent = d.parent.parent;
					if (parent) {
						zoom(parent, (parent == root ? null : d3.select(this)));
					}
					d3.event.preventDefault()
				});
				cell.append("svg:title").text(function(d) {
					return d.name;
				});
				cell.append("svg:rect").attr("width", function(d) {
					return kx * d.dx;
				}).attr("height", function(d) {
					return ky * d.dy;
				}).style("fill", function(d) {
					return color(d.name);
				});
				cell.append("svg:text").attr("x", function(d) {
					return kx * d.dx / 2;
				}).attr("y", function(d) {
					return ky * d.dy / 2;
				}).attr("text-anchor", "middle").text(function(d) {
					return d.name;
				}).style("visibility", function(d) {
					d.w = this.getComputedTextLength();
					return kx * d.dx > d.w ? 'visible' : 'hidden';
				});
			}

			function zoom(d, context) {
				var kx = w / d.dx,
					ky = h / d.dy;
				S.log(kx)
				x.domain([d.x, d.x + d.dx]);
				y.domain([d.y, d.y + d.dy]);
				var flg = false;
				var t = svg.selectAll("g.cell").transition().duration(d3.event.altKey ? 7500 : 750).attr("transform", function(d) {
					return "translate(" + x(d.x) + "," + y(d.y) + ")";
				}).each("end", function(xx, i) {
					if (i == 1 && !flg) {
						flg = true;
						if (context) {
							context.select("text").style("visibility", 'hidden');
						} else {
							svg.selectAll(".cell").remove();
						}
						appendChildren(d.children, d);
					}
				});

				t.select("rect").attr("width", function(d) {
					return kx * d.dx;
				}).attr("height", function(d) {
					return ky * d.dy;
				})

				t.select("text").attr("x", function(d) {
					return kx * d.dx / 2;
				}).attr("y", function(d) {
					return ky * d.dy / 2;
				}).style("visibility", function(d) {
					return kx * d.dx > d.w ? 'visible' : 'hidden';
				});
			}
		}
	});
	return Main;
}, {
	requires: ['base', './view/widget']
})