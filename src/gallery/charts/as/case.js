KISSY.add('brix/gallery/charts/as/case',function(S,Base,Node){

	function Case(){
		var self = this
		/*
			arguments:

			  o:{
				parent_id :''    //div id
				path      :''    //路径[charts/src/as/case.swf]
				config    :{     //flashVars Object
				}
			  }
		 */
		Case.superclass.constructor.apply(self, arguments);

		self.init()
	}
	Case.ATTRS = {
		_id:{
			value:'_SWF'
		}
	}
	S.extend(Case,Base,{
		init:function(){
			var self = this
			self.set('_id',self.get('parent_id') + self.get('_id'))
			KISSY.use('dom, event, flash', function(S, DOM, Event, Flash) {
	            S.Flash.add('#' + self.get('parent_id'), {
	                src: self.get('path'),
	                id: self.get('_id'),
	                version: 10,
	                params: {
	                	flashvars: {
	                		configData:self.get('config').configData,
	                		chartData :self.get('config').chartData
	                	},
	                	wmode:'transparent',
	                	allowScriptAccess:'always'
	                },

	                attrs: {
	                    width: '100%',
	                    height: '100%'
	                }

	               
	            });
	        })
		},
		//与外部js交互总接口
		actions:function($name,$value){
			if($name == 'reset'){
				this._getFlash(this.get('_id')).toAS($name,this._objectToString($value));
			}
		},
		_getFlash:function($movieName){
			return S.one('#' + $movieName)[0];
		},
		_objectToString:function($o){
			var s = ''
			for(var i in $o){
				s += i + '=' + encodeURIComponent($o[i]) + '&'
			}
			s = s.substr(0,s.length-1)
			return s
		}
	});

	return Case;

	}, {
	    requires:['base','node']
	}
);