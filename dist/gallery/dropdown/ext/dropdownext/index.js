KISSY.add("brix/gallery/dropdown/ext/dropdownext/index", function(S, Dropdown) {

	function Dropdownext(){
		//这里可以做一些hack操作，不确定
		Dropdownext.superclass.constructor.apply(this, arguments);
	}

	Dropdownext.ATTRS={
		extattr:{
			value:123
		}
	}

	Dropdownext.EVENTS = {
		'':{
			click:function(){
				console.log(this.get('extattr'));
			}
		}
	}
	S.extend(Dropdownext, Dropdown, {

    });
    return Dropdownext;

}, {
    requires: ["../../index"]
});





// //项目组件
// KISSY.add("components/dropdown/ext/dropdownext/index", function(S, Brick) {



// }, {
//     requires: ["../../"]
// });


// //export 命名空间的转换



// //inports组件
// KISSY.add("imports/namespace/dropdown/ext/dropdownext/index", function(S, Brick) {



// });


