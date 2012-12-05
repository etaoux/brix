KISSY.add('brix/gallery/charts/js/pub/utils/move',function(S,Base){                               //R3
	
	function Move(p1, p2, s, mFn, eFn){
		
		var self = this

		Move.superclass.constructor.apply(self,arguments);
		self._id = null
		self.init(p1, p2, s, mFn, eFn);


	}
	Move.ATTRS = {
		_time:{
			value:10
		}
	}
	S.extend(Move,Base,{
		init:function(p1, p2, s, mFn, eFn){
			
			var self = this
			self.ok = 1
			var dN = self._distance(p1, p2);
			var dirX = p2.x-p1.x>0 ? 1 : -1, dirY = p2.y-p1.y>0 ? 1 : -1;
			var pXN, pYN;
			var addXN, addYN
			var curX = p1.x,curY = p1.y
			
			self._id = setInterval(function() {
				if(self.ok==1){
					
				}else{
					return
				}
				mFn({x:curX, y:curY});
				var disX = Math.abs(p2.x - curX), disY = Math.abs(p2.y - curY);
				var nx = disX / 10 * dirX, ny = disY / 10 * dirY
 				// console.log(nx,ny)
				curX += nx, curY += ny
				// console.log(curX,curY)
				if(Math.abs(curX) == Math.abs(p2.x) && Math.abs(curY) == Math.abs(p2.y)){
					eFn ? eFn() : ''
					clearInterval(self._id), self._id = null
				}

				// var dis = self._distance(p2, { x:curX, y:curY } );
				// var disX = Math.abs(p2.x - curX), disY = Math.abs(p2.y - curY);
				// if (addXN < Math.abs(disX * s * dirX) || addYN < Math.abs(disY * s * dirY)) {
				// 	curX = p2.x, curY = p2.y;
				// 	eFn ? eFn() : ''
				// 	clearInterval(self._id), self._id = null
				// }
				// var nx = disX * s * dirX, ny = disY * s * dirY
				// nx = dirX * nx > 0 ? nx : -nx, ny = dirY * ny > 0 ? ny : -ny
				// curX += nx, curY += ny;

				// if (curX == pXN && curY == pYN) {
				// 	curX = p2.x, curY = p2.y;
				// 	eFn ? eFn() : ''
				// 	clearInterval(self._id), self._id = null
				// }
				// pXN = curX, pYN = curY;
				// addXN = Math.abs(disX * s * dirX), addYN = Math.abs(disY * s * dirY)
			},self.get('_time'))
		},

		stop:function(){
			var self = this
			this.ok = 0
			clearInterval(self._id), self._id = null
		},

		_distance:function(p1, p2) {
			var disX = p2.x - p1.x, disY = p2.y - p1.y
			return Math.sqrt(disX*disX+disY*disY);
		}
	});

	return Move;

	}, {
	    requires:['base']
	}
);