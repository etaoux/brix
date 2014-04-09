/**
 * 从下面的jquery插件移植过来
 * jQuery Plugin to obtain touch gestures from iPhone, iPod Touch and iPad, should also work with Android mobile phones (not tested yet!)
 * Common usage: wipe images (left and right to show the previous or next image)
 * 
 * @author Andreas Waltl, netCU Internetagentur (http://www.netcu.de)
 * @version 1.1.1 (9th December 2010) - fix bug (older IE's had problems)
 * @version 1.1 (1st September 2010) - support wipe up and wipe down
 * @version 1.0 (15th July 2010)
 */

KISSY.add("touchswip", function(S, Event) {
    function main(el, settings) {
        var config = {
            min_move_x : 20,
            min_move_y : 20,
            wipeLeft : function() {
            },
            wipeRight : function() {
            },
            wipeUp : function() {
            },
            wipeDown : function() {
            },
            preventDefaultEvents : true
        };
        if (settings) {
            config = KISSY.merge(config, settings);
        }
        
        el.each(function(v, k) {
            var obj = this[0];
            var startX;
            var startY;
            var isMoving = false;

            function cancelTouch() {
                obj.removeEventListener('touchmove', onTouchMove);
                startX = null;
                isMoving = false;
            }

            function onTouchMove(e) {
                if (config.preventDefaultEvents) {
                    e.preventDefault();
                }
                if (isMoving) {
                    var x = e.touches[0].pageX;
                    var y = e.touches[0].pageY;
                    var dx = startX - x;
                    var dy = startY - y;
                    if (Math.abs(dx) >= config.min_move_x) {
                        cancelTouch();
                        if (dx > 0) {
                            config.wipeLeft(e, obj);
                        } else {
                            config.wipeRight(e, obj);
                        }
                    } else if (Math.abs(dy) >= config.min_move_y) {
                        cancelTouch();
                        if (dy > 0) {
                            config.wipeDown(e, obj);
                        } else {
                            config.wipeUp(e, obj);
                        }
                    }
                }
            }

            function onTouchStart(e) {
                if (e.touches.length == 1) {
                    startX = e.touches[0].pageX;
                    startY = e.touches[0].pageY;
                    isMoving = true;
                    obj.addEventListener('touchmove', onTouchMove, false);
                }
            }

            if ('ontouchstart' in document.documentElement) {
                obj.addEventListener('touchstart', onTouchStart, false);
            }
        });
    }

    return main;
}, {
    requires : ["event"]
});

KISSY.add('brix/gallery/property/index', function(S, Brick, Switchable, Mustache, Touchswip) {
    var DOM = S.DOM;
    
    var cateTemplate  = "";
    cateTemplate += "<li class='pf-slide-item pf-slide-item-{{id}}' filterid='{{id}}' filtertype='pf-{{id}}' filtername='{{name}}'>";
    cateTemplate += "    <div class='pf-content'>";
    cateTemplate += "        <div class='filter-title'>{{name}}</div>";
    cateTemplate += "        {{#hasImage}}";
    cateTemplate += "        <div class='filter-items pf-image pf-fixed-height clear-fix'>";
    cateTemplate += "            {{#imgitems}}";
    cateTemplate += "            <a data-stat='{{stat}}' href='{{url}}' class='filter-item fp-item-{{id}} pf-image-item' filterid='{{id}}' filtername='{{name}}' title='{{name}}'>";
    cateTemplate += "                <img src='{{image}}'>";
    cateTemplate += "            </a>";
    cateTemplate += "            {{/imgitems}}";
    cateTemplate += "        </div>";
    cateTemplate += "        {{/hasImage}}";
    cateTemplate += "        {{#hasGroupNoImage}}";
    cateTemplate += "        <div class='filter-items pf-fixed-height clear-fix pf-itemcotainer-{{id}}'>";
    cateTemplate += "            {{#items}}";
    cateTemplate += "                <a data-stat='{{stat}}' href='{{url}}' class='filter-item fp-item-{{id}}' filterid='{{id}}' filtername='{{name}}' title='{{name}}'>{{name}}</a>";
    cateTemplate += "            {{/items}}";
    cateTemplate += "        </div>";
    cateTemplate += "        {{/hasGroupNoImage}}";
    cateTemplate += "        {{#hasgroup}}";
    cateTemplate += "        <div id='pf-band-cate' class='pf-band-more pf-switch'>";
    cateTemplate += "            <ul class='ks-switchable-nav'>";
    cateTemplate += "                {{#cate}}";
    cateTemplate += "                <li>{{group_name}}<i class='iconfont'>&#404;</i></li>";
    cateTemplate += "                {{/cate}}";
    cateTemplate += "            </ul>";
    cateTemplate += "           <div class='ks-switchable-content'>";
    cateTemplate += "               {{#cate}}";
    cateTemplate += "               <div style='display: none'>";
    cateTemplate += "                   <div class='pf-switch-ul clear-fix pf-itemcotainer-{{id}}'>";
    cateTemplate += "                       {{#items}}";
    cateTemplate += "                           <a data-stat='{{stat}}' href='{{url}}' class='filter-item fp-item-{{id}}' filterid='{{id}}' filtername='{{name}}' title='{{name}}'>{{name}}</a>";
    cateTemplate += "                       {{/items}}";
    cateTemplate += "                   </div>";
    cateTemplate += "               </div>";
    cateTemplate += "               {{/cate}}";
    cateTemplate += "            </div>";
    cateTemplate += "        </div>";
    cateTemplate += "        {{/hasgroup}}";
    cateTemplate += "        {{^hasgroup}}";
    cateTemplate += "        <div class='filter-items clear-fix pf-itemcotainer-{{id}}'>";
    cateTemplate += "            {{#items}}";
    cateTemplate += "                <a data-stat='{{stat}}' href='{{url}}' class='filter-item fp-item-{{id}}' filterid='{{id}}' filtername='{{name}}' title='{{name}}'>{{name}}</a>";
    cateTemplate += "            {{/items}}";
    cateTemplate += "        </div>";
    cateTemplate += "        {{/hasgroup}}";
    cateTemplate += "    </div>";
    cateTemplate += " </li>";

    
    var itemTemplate  = "";
    itemTemplate += "{{#items}}";
    itemTemplate += "    <a data-stat='{{stat}}' href='{{url}}' class='filter-item newadded fp-item-{{id}}' filterid='{{id}}' filtername='{{name}}' title='{{name}}'>{{name}}</a>";
    itemTemplate += "{{/items}}";
    
    var selectedTemplate  = "";
    selectedTemplate += "    <div class='pf-st-slide'>";
    selectedTemplate += "        <div class='pf-st-wrap'>";
    selectedTemplate += "            {{#fp_cate}}";
    selectedTemplate += "            <span class='pf-st-item pf-{{id}}' filterid='{{id}}'>";
    selectedTemplate += "                {{#selectlist}}";
    selectedTemplate += "                <a href='{{url}}' class='selected-item pf-selid-{{id}}' filterid='{{id}}' filtername='{{name}}'>{{name}}<span class='del-btn'></span></a>";
    selectedTemplate += "                {{/selectlist}}";
    selectedTemplate += "            </span>";
    selectedTemplate += "            {{/fp_cate}}";
    selectedTemplate += "            {{#otherSelect}}";
    selectedTemplate += "            <span class='pf-st-item pf-other' filterid='other'>";
    selectedTemplate += "                <a href='{{url}}' class='selected-item pf-selid-{{type}} {{type}}-item' filterid='{{type}}' filtername='{{name}}'>{{name}}<span class='del-btn'></span></a>";
    selectedTemplate += "            </span>";
    selectedTemplate += "            {{/otherSelect}}";
    selectedTemplate += "            <a href='{{allurl}}' class='pf-st-clearall'><span>清除全部</span></a>";
    selectedTemplate += "        </div>";
    selectedTemplate += "    </div>";
    selectedTemplate += "    <a href='#' class='pf-st-indicator pf-st-prev'></a>";
    selectedTemplate += "    <a href='#' class='pf-st-indicator pf-st-next'></a>";


    function propertyFilter() {
        propertyFilter.superclass.constructor.apply(this, arguments);
    }
    
    propertyFilter.ATTRS = {
        mode:{
            value:1
        },
        templatePath:{
            cate: "components/property/template-cate.html",
            item: "components/property/template-item.html"
        },
        template:{
            cate: "",
            item: ""
        },
        isCssAnim: false,
        objMap:null,
        ajaxtimeout: null,
        data: {},
        curLink: "",
        containerWidth: 0,
        minHeight:105,
        maxHeight:280,
        slideNum: 0,
        slidePageNum: 0,
        slidePerPage: 0,
        slideDefaultWidth: 280
    }
    
    propertyFilter.METHODS = {
        getTemplate:function(){
            propertyFilter.ATTRS.template.cate = cateTemplate;
            propertyFilter.ATTRS.template.item = itemTemplate;
            propertyFilter.ATTRS.template.selected = selectedTemplate;
            return;
            /*
            S.io({
                url: propertyFilter.ATTRS.templatePath.cate,
                cache: false,
                success: function(html){
                    propertyFilter.ATTRS.template.cate = html;
                }
            });
            S.io({
                url: propertyFilter.ATTRS.templatePath.item,
                cache: false,
                success: function(html){
                    propertyFilter.ATTRS.template.item = html;
                }
            });*/
        },
        updateUrl: function(data) {
            var newData =  KISSY.clone(data.fp_cate);
            for( var i in newData){
                var cateItem = newData[i];
                for( var j in cateItem.items){
                    var item = cateItem.items[j];
                    var updateItem = S.one(".fp-item-" + item.id);
                    if(updateItem && updateItem.length > 0){
                        updateItem.attr("href", item.url).attr("data-stat", item.stat);
                    }
                }
                for( var k in cateItem.selectlist){
                    var selecteditem = cateItem.selectlist[k];
                    var updateItem = S.one(".pf-selid-" + selecteditem.id);
                    if(updateItem && updateItem.length > 0){
                        updateItem.attr("href", selecteditem.url);
                    }
                }
            }
        },
        mergeData: function(data) {
            var me = this;
            var newData =  KISSY.clone(data.fp_cate);
            
            var restructData = {};
            for( var i in newData){
                restructData[newData[i].id] = newData[i];
            }
            
            function getAddSlide(){
                var returnData = {};
                for( var k in restructData){
                    var slideitem = S.one(".pf-slide-item-" + restructData[k].id);
                    if(slideitem == null || slideitem.length == 0){
                        returnData[restructData[k].sort] = restructData[k];
                        delete restructData[k];
                    }
                }
                return returnData;
            }
            function getDeleteSlide(){
                var objMap = me.getObjMap();
                var slideItems = objMap.pfSlideItem;
                for( var j = 0 ; j < slideItems.length ; j++ ){
                    var item = S.one(slideItems[j]);
                    if(restructData[item.attr("filterid")] == undefined){
                        item.addClass("pf-deleteCate");
                        delete restructData[item.attr("filterid")];
                    }
                }
                return "";
            }
            function getAddItems(){
                var addArray = {};
                function judgeAdd(containerObj){
                    var containerid = containerObj.id;
                    addArray[containerid] = {"items":[]};
                    for(var n in containerObj.items){
                        var curitem = containerObj.items[n];
                        var obj = S.one("#J_propertyFilter .pf-itemcotainer-" + containerid + " .fp-item-" + curitem.id);
                        if(obj == null){
                            addArray[containerid].items.push(curitem);
                        }
                    }
                }
                for(var i in restructData){
                    var curslide = restructData[i];
                    if(curslide["cate"]){
                        for(var k in curslide.cate){
                            judgeAdd(curslide.cate[k]);
                        }
                    }
                    if(curslide["items"]){
                        judgeAdd(curslide);
                    }
                }
                return addArray;
            }
            function getDeleteItems(){
                var newData = {};
                for(var i in restructData){
                    var curslide = restructData[i];
                    if(curslide["cate"]){
                        for(var k in curslide.cate){
                            var curitems = curslide.cate[k].items;
                            for(var m in curitems){
                                var curitem = curitems[m];
                                newData[curitem.id] = curitem;
                            }
                        }
                    }
                    if(curslide["imgitems"]){
                        for(var s in curslide.imgitems){
                            var curitem = curslide.imgitems[s];
                            newData[curitem.id] = curitem;
                        }
                    }
                    if(curslide["items"]){
                        for(var n in curslide.items){
                            var curitem = curslide.items[n];
                            newData[curitem.id] = curitem;
                        }
                    }
                }
                var items = S.all(".filter-item");
                for( var j = 0 ; j < items.length ; j++ ){
                    var item = S.one(items[j]);
                    if(newData[item.attr("filterid")] == undefined){
                        item.addClass("pf-deleteItem");
                    }
                }
                return "";
            }
            
            var returnData = {
                "addCate":{"fp_cate": getAddSlide()},
                "deleteCate":getDeleteSlide(),
                "additem":getAddItems(),
                "deleteitem":getDeleteItems()
            }
            
            return returnData;
        },
        //获取异步查询的参数串
        getQueryParam: function(){
            return window.location.href;
            //需要自己定制
            var locationObj = Router.pathToObject(window.location.href);
            locationObj.params.ppath = this.getPPath();
            if(locationObj.params.ppath == ""){
                delete locationObj.params.ppath;
            }
            var priceitem = S.one(".priceRange-item");
            if(priceitem && priceitem.length > 0){
                if(priceitem.attr("link")){
                    var priceLink = priceitem.attr("link");
                    var priceObj = Router.pathToObject(priceLink);
                    if(priceObj.params.start_price){
                        locationObj.params.start_price = priceObj.params.start_price;
                    }
                    if(priceObj.params.end_price){
                        locationObj.params.end_price = priceObj.params.end_price;
                    }
                }
            }else{
                delete locationObj.params.start_price;
                delete locationObj.params.end_price;
            }
            return Router.objectToPath(locationObj);
        },
        getPPath: function(){
            var selectedList = S.all("#J_propertyFilter .filter-item.selected");
            var query = {};
            selectedList.each(function(){
                var filterName = S.one(S.DOM.parent(this, ".pf-slide-item")).attr("filterid");
                if(filterName == 30000){
                }else if(query[filterName] == undefined){
                    query[filterName] = this.attr("filterid");
                }else{
                    query[filterName] += "," + this.attr("filterid");
                }
            });
            var ppath = "";
            for(var i in query ){
                ppath += i + ":" + query[i] + ";";
            }
            return ppath.substring(0, ppath.length - 1);
        },
        sendAjax: function() {
            this.setAnchor();
            
            return; //需要自己实现ajax请求
            
            if(true){
                Router.navigate(this.getQueryParam());
            }else{
                var localhost = window.location.origin;
                var suburl = propertyFilter.ATTRS.curLink.replace(localhost, "");
                var url = "http://fashion.s.etao.com" + suburl;
                var param = {
                    ppath:this.getPPath(),
                    from:"srpAjax",
                    renderType:"json",
                    fromscombo:"yes",
                    mdList:"compass,compass_json",
                    tbpm:"t"
                };
                var debug = false;
                if(debug == true){
                    param.q = "女装";
                    param.start_price=300;
                    param.end_price=900;
                    delete param.ppath;
                    url = "http://fashion.s.etao.com/search";
                }
                var me = this;
                S.io({
                    type:"get",
                    url: url,
                    data: param,
                    success: function(data){
                        if(data.status == "1"){
                            console.log(data.resultList.compass_json.html);
                            me.setData(data.resultList.compass_json.html);
                        }
                    },
                    dataType: "jsonp"
                })
            }
        },
        setData: function(dataString) {
            var me = this;
            var data = KISSY.JSON.parse(dataString);
            
            if(data.fp_cate.length == 0){
                return;
            }
            this.updateUrl(data);
            var filterData = this.mergeData(data);
            
            function addSlide(filterData){
                if(filterData && filterData.addCate && filterData.addCate.fp_cate){
                    var initBandCate = true;
                    if(S.one("#pf-band-cate") && S.one("#pf-band-cate").length > 0){
                        initBandCate = false;
                    }
                    var cate = filterData.addCate.fp_cate;
                    for(var k in cate){
                        var html = Mustache.to_html(propertyFilter.ATTRS.template.cate, cate[k]);
                        var insertObj = S.one("#J_propertyFilter .pf-slide-item:eq(" + (k-1) + ")");
                        if(insertObj){
                            var ST = DOM.create(html);
                            S.one(ST).addClass("new-slide-item");
                            S.DOM.insertBefore(ST,insertObj[0]);
                        }else{
                            S.one(".pf-slide").append(html);
                        }
                    }
                    
                    var newCate = S.all(".pf-slide-item");
                    newCate.removeClass("new-slide-item");
                    me.animateFunc(newCate, {
                        "margin-left":0
                    }, function(obj){});
                    me.calWidth();
                    
                    if(initBandCate && S.one("#pf-band-cate") && S.one("#pf-band-cate").length > 0){
                        var Tabs = Switchable.Tabs;
                        var tabs = new Tabs('#pf-band-cate', {
                            triggerType: "click",
                            switchTo : 0
                        });
                    }
                }
            }
            function removeSlide(){
                me.animateFunc(S.all(".pf-deleteCate"), {
                    opacity:0,
                    "margin-left":-S.all(".pf-deleteCate").width()
                }, function(obj){
                    obj.remove();
                    me.calWidth();
                });
            }
            function addItems(filterData){
                for(var i in filterData.additem){
                    if(filterData.additem[i].items.length != 0){
                        var html = Mustache.to_html(propertyFilter.ATTRS.template.item, filterData.additem[i]);
                        S.one(".pf-itemcotainer-" + i).append(html);
                    }
                }
                var addLength = S.all(".filter-item.newadded").length;
                me.animateFunc(S.all(".filter-item.newadded"), {
                    "margin-left":20
                }, function(obj){
                    obj.removeClass("newadded");
                    if(--addLength == 0){
                        var curSlideMore = S.one(".pf-slide-item.norelative");
                        if(curSlideMore && curSlideMore[0]){
                            me.showMore(curSlideMore[0]);
                        }
                    }
                });
                return;
            }
            function removeItems(){
                me.animateFunc(S.all(".pf-deleteItem:not(.pf-image-item)"), {
                    opacity:0,
                    "margin-left":-50
                }, function(obj){
                    obj.remove();
                    var curSlideMore = S.one(".pf-slide-item.norelative");
                    if(curSlideMore && curSlideMore[0]){
                        me.showMore(curSlideMore[0]);
                    }
                });
            }
            function resetSelected(){
                var html = Mustache.to_html(propertyFilter.ATTRS.template.selected, data);
                S.one(".pf-selected").html(html);
                var objMap = me.getObjMap(true);
                S.one(".pf-st-slide").css("width", objMap.pfPanel.width() - 100);
                me.checkSelectedStatus(true);
            }
            addSlide(filterData);
            removeSlide();
            addItems(filterData);
            removeItems();
            resetSelected();
        },
        //重置，srp页面的需求是异步请求后定位到.main的位置
        setAnchor: function(){
            return;
            var mainTop = S.one(".main").offset().top;
            var winScrollTop = S.one(window).scrollTop();

            if(winScrollTop > mainTop){
                this.animateFunc(S.one(window), {
                    scrollTop: mainTop + 1
                }, function(){});
            }
        },
        getPfHeight: function (){
            var returnHeight = propertyFilter.ATTRS.minHeight;
            var objMap = this.getObjMap();
            if(objMap.pfSelected.css("display") != "none"){
                returnHeight +=  objMap.pfSelected.outerHeight() + parseInt(objMap.pfSelected.css("padding-top"));
            }
            return returnHeight;
        },
        getObjMap: function(force){
            if(propertyFilter.ATTRS.objMap == null || force){
                propertyFilter.ATTRS.objMap = {
                    pfObj : S.one("#J_propertyFilter"),
                    pfSlideItem: S.all(".pf-slide-item"),
                    pfSelectedItem: S.all(".selected-item"),
                    pfReplaceObj : S.one(".pf-replace"),
                    pfWrapObj : S.one("#J_propertyFilter .contentwrap"),
                    flushingSlide : S.one("#J_propertyFilter .flushingSlide"),
                    pfPanelWrap : S.one("#J_propertyFilter .pf-panel-wrap"),
                    pfPanel: S.one("#J_propertyFilter .pf-panel"),
                    pfSelected : S.one("#J_propertyFilter .pf-selected"),
                    pfclearAll : S.one("#J_propertyFilter .pf-st-clearall"),
                    pfPagination : S.one("#J_propertyFilter .pf-pagination"),
                    pfShadow : S.one("#J_propertyFilter .pf-shadow"),
                    indicator : S.all("#J_propertyFilter .pagi-indicator")
                };
            }
            return propertyFilter.ATTRS.objMap;
        },
        bindFixedEvent: function(){
            var me = this;
            function checkisFixed(){
                if(S.one('#J_propertyFilter').hasClass("property-fixed")){
                    return true;
                }
                return false;
            }
            S.Event.delegate('#J_propertyFilter','mouseenter','.pf-selected',function(e){
                if(checkisFixed() && !S.one('#J_propertyFilter').hasClass("hover")){
                    me.fixedMouseEnter();
                }
            });
            S.Event.delegate('#J_propertyFilter','mouseenter','.flushingSlide',function(e){
                if(checkisFixed()){
                    me.fixedMouseEnter();
                }
            });
            S.Event.on('#J_propertyFilter', 'mouseleave', function(e){
                if(checkisFixed()){
                    me.fixedMouseLeave();
                }
            });
        },
        fixedShow: function(){
            var me = this;
            var objMap = this.getObjMap();
            function changeDom(){
                var pfObjLeft = objMap.pfObj.offset().left;
                objMap.pfReplaceObj.height(parseInt(objMap.pfObj.height()) + parseInt(objMap.pfObj.css("margin-bottom"))).show();
                objMap.pfObj.css({"width": S.one(".wrap").width() - pfObjLeft + S.one(".wrap").offset().left});
                objMap.pfObj.addClass("property-fixed");
                if (S.UA.ie && S.UA.ie == 6) {
                    objMap.pfObj.css("top", S.one(window).scrollTop());
                }
                if(propertyFilter.ATTRS.isCssAnim){
                    objMap.pfWrapObj.css("overflow", "hidden");
                }
                me.animateFunc(objMap.pfWrapObj, {
                    height : 24
                }, function(){
                    afterAnim();
                });
            }
            
            function afterAnim(){
                
                objMap.pfPanel.hide();
                objMap.indicator.addClass("hide");
                
                var selecteditems = objMap.pfSelectedItem;
                if(selecteditems.length > 0){
                    objMap.pfPagination.show();
                    objMap.pfSelected.addClass("show");
                    objMap.flushingSlide.hide();
                }else{
                    objMap.pfPagination.hide();
                    objMap.pfSelected.removeClass("show");
                    objMap.flushingSlide.show();
                }
                objMap.pfObj.removeClass("hover");
                objMap.pfShadow.show();
                var flushingItems = S.all("#J_propertyFilter .pf-flush-item");
                me.animateFunc(flushingItems, {
                    "width" : flushingItems.attr("oriwidth")
                }, function(){
                }, .05);
            }
            
            changeDom();
        },
        fixedHide: function(){
            var me = this;
            var objMap = this.getObjMap();
            
            objMap.pfObj.stop(true);
            objMap.pfWrapObj.stop(true);
            if(!objMap.pfObj.hasClass("property-fixed")){
                return;
            }
            
            function changeDom(){
                objMap.pfReplaceObj.hide();
                objMap.pfObj.removeClass("property-fixed");
                objMap.pfObj.css({"left": "auto", "width": "auto"});
                
                if (S.UA.ie && S.UA.ie == 6) {
                    objMap.pfObj.css("top", 0);
                    objMap.pfObj[0].offsetLeft;
                }
                
                if(objMap.pfSelectedItem.length == 0) {
                    objMap.pfSelected.removeClass("show");
                }
                me.animateFunc(objMap.pfWrapObj, {
                    height : me.getPfHeight()
                }, function(){
                    objMap.pfPanel.show();
                    //objMap.pfPagination.show();
                    objMap.indicator.removeClass("hide");
                    objMap.flushingSlide.hide();
                });
            }
            changeDom();
        },
        fixedMouseEnter: function(){
            var me = this;
            var objMap = this.getObjMap();
            var flushingItems = S.all("#J_propertyFilter .pf-flush-item");
            this.animateFunc(flushingItems, {
                "width" : parseInt(flushingItems.attr("oriwidth")) + 100
            }, function(){
                objMap.pfObj.addClass("hover");
                objMap.flushingSlide.hide();
                objMap.indicator.removeClass("hide");
                objMap.pfShadow.hide();
                objMap.pfPanel.show();
                if(objMap.pfSelected.css("display") == "block"){
                    objMap.pfPagination.show();
                }
                me.animateFunc(objMap.pfWrapObj, {
                    height : me.getPfHeight()
                }, function(){
                    objMap.pfWrapObj.css("overflow", "visible");
                });
            }, .05);
        },
        fixedMouseLeave: function(){
            //return;
            this.fixedShow();
        },
        selfAnimateHeight: function(obj, targetHeight, duration, callback) {
            var useCssAnim = false;
            if(propertyFilter.ATTRS.isCssAnim && obj[0] && obj[0].style && 'webkitTransition' in obj[0].style){
                useCssAnim = true;
            }
            var useDefaultAnim = false;
            var me = this;
            if(S.UA.ie && S.UA.ie == 6){
                obj.height(targetHeight);
                callback(obj);
            }else if(useCssAnim){
                S.Event.detach(obj, "webkitTransitionEnd");
                S.Event.on(obj, "webkitTransitionEnd", function(e) {
                    callback(obj);
                    S.Event.detach(obj, "webkitTransitionEnd");
                    return false;
                });
                obj.height(targetHeight);
            }else{
                if(useDefaultAnim){
                    var delay = 20, timer;
                    var heighFall =  targetHeight - obj.height();
                    var step = heighFall / duration;
                    timer = setInterval(function() {
                        var afterHeight = obj.height() + step * delay;
                        if(heighFall > 0 && afterHeight < targetHeight){
                            obj.height(afterHeight);
                        }else if(heighFall < 0 && afterHeight > targetHeight){
                            obj.height(afterHeight);
                        }else{
                            obj.height(targetHeight);
                            clearInterval(timer);
                            callback(obj);
                        }
                    }, delay);
                }else{
                    me.animateFunc(obj, {
                        "height": targetHeight
                    }, function(){
                        callback(obj);
                    }, (duration / 1000));
                }
            }
        },
        checkSelectedStatus: function(noAjax){
            var me = this;
            var objMap = me.getObjMap(true);
            
            if(objMap.pfSelectedItem.length > 0){
                if(objMap.pfSelected.css("display") == "none"){
                    objMap.pfSelected.addClass("show");
                    objMap.pfclearAll.addClass("show");
                    objMap.pfPagination.show();
                    me.selfAnimateHeight(objMap.pfSelected, 34, 200, function(obj){
                    });
                    me.selfAnimateHeight(objMap.pfWrapObj, propertyFilter.ATTRS.minHeight + 34, 200, function(){
                    });
                }else{
                    objMap.pfclearAll.addClass("show");
                    objMap.pfPagination.show();
                }
                me.setSelIndicatorSt();
            }else{
                objMap.pfclearAll.removeClass("show");
                objMap.pfPagination.hide();
                me.selfAnimateHeight(objMap.pfWrapObj, propertyFilter.ATTRS.minHeight, 200, function(){
                    objMap.pfSelected.removeClass("show");
                });
                me.selfAnimateHeight(objMap.pfSelected, 0, 200, function(){
                    objMap.pfSelected.removeClass("show");
                });
            }
            if(!noAjax){
                var isDelay = false;
                if(isDelay){
                    clearTimeout(propertyFilter.ATTRS.ajaxtimeout);
                    propertyFilter.ATTRS.ajaxtimeout = setTimeout(function(){
                        me.sendAjax();
                    }, 300);
                }else{
                    me.sendAjax();
                }
            }
        },
        setSelectedStyle:function(){
            var selectedList = S.all("#J_propertyFilter .selected-item");
            if(selectedList.length > 0){
                for(var i = 0 ; i < selectedList.length ; i++){
                    var itemid = S.one(selectedList[i]).attr("filterid");
                    S.all("#J_propertyFilter .fp-item-" + itemid).addClass("selected");
                }
            }
        },
        setSelIndicatorSt:function(){
            var slideObj = S.one(".pf-st-slide");
            var pfClearAllObj = S.one(".pf-st-clearall");
            
            var maxLeft = slideObj.offset().left + slideObj.width();
            var scrollLeft = slideObj.scrollLeft();
            var clearAllRight = pfClearAllObj.width() + pfClearAllObj.offset().left;
            
            if(clearAllRight > maxLeft){
                S.one(".pf-st-next").show();
            }else{
                S.one(".pf-st-next").hide();
            }
            
            if(scrollLeft > 0){
                S.one(".pf-st-prev").show();
            }else{
                S.one(".pf-st-prev").hide();
            }
        },
        getCurSelWidth: function(){
            var me = this;
            var objMap = me.getObjMap();
            var selItems = objMap.pfSelectedItem;
            var returnWidth = 0;
            selItems.each(function(){
                returnWidth += this[0].offsetWidth + 10;
            });
            return returnWidth + 150;
        },
        initSelected: function(){
            var me = this;
            var objMap = me.getObjMap();
            
            function addSelectedItem(filterType, filterId, filterName, filteritem){
                var objMap = me.getObjMap();
                var selectedPF = DOM.children(".pf-st-wrap", "." + filterType);
                S.all(".fp-item-" + filterId).addClass("selected");
                var html = '<a href="#" style="margin-left:-50px;" class="selected-item pf-selid-' + filterId + '" filterid="' + filterId + '" filtername="' + filterName + '" title="' + filterName + '">' + filterName + '<span class="del-btn"></span></a>';
                if(filterType == "pf-30000"){
                    html = '<a href="#" link="' + filteritem.attr("href") + '" style="margin-left:-50px;" class="selected-item priceRange-item pf-selid-' + filterId + '" filterid="' + filterId + '" filtername="' + filterName + '" title="' + filterName + '">' + filterName + '<span class="del-btn"></span></a>';''
                }
                S.one(".pf-st-wrap").width(me.getCurSelWidth()+ (filterName.length * 30));
                S.one(selectedPF).prepend(html);
                
                me.getObjMap(true);
                me.checkSelectedStatus(true);
                me.animateFunc(S.one('.pf-selid-' + filterId), {
                    "margin-left": 0
                }, function(obj){
                    obj.css({"opacity":1});
                    me.checkSelectedStatus();
                    S.one(".pf-st-wrap").width(me.getCurSelWidth());
                });
            }
            function delSelectedItem(filterId){
                S.all(".fp-item-" + filterId).removeClass("selected");
                
                var obj = S.one(".pf-selid-" + filterId);
                obj.css("z-index", 0);
                me.animateFunc(obj, {
                    "margin-left":-(obj.width() + 35)
                }, function(obj){
                    obj.remove();
                    me.getObjMap(true);
                    S.one(".pf-st-wrap").width(me.getCurSelWidth());
                    me.checkSelectedStatus();
                }, .3);
            }
            S.Event.delegate('#J_propertyFilter', 'click', '.filter-item', function(e){
                var filteritem = S.one(e.target);
                var slideItem = DOM.parent(e.target, ".pf-slide-item");
                
                if(!filteritem.hasClass("filter-item")){
                    filteritem = filteritem.parent(".filter-item");
                }
                propertyFilter.ATTRS.curLink = filteritem.attr("href");
                
                var filterType = S.one(slideItem).attr("filtertype");
                var filterTypeId = S.one(slideItem).attr("filterid");
                var filterId = filteritem.attr("filterid");
                var filterName = filteritem.attr("filtername");
                    
                if(filteritem.hasClass("selected")){
                    delSelectedItem(filterId);
                }else{
                    addSelectedItem(filterType, filterId, filterName, filteritem);
                    if(filterTypeId == "30000"){
                        me.animateFunc(S.one(".pf-slide-item-30000"), {
                            opacity:0,
                            "margin-left":-S.all(".pf-slide-item-30000").width()
                        }, function(obj){
                            obj.remove();
                            me.calWidth();
                        }, .3);
                    }
                }
                return false;
            });
            //点击已选项删除
            S.Event.delegate('#J_propertyFilter', 'click', '.selected-item', function(e){
                propertyFilter.ATTRS.curLink = e.target.href;
                var selObj = S.one(e.target);
                if(!selObj.hasClass("selected-item")){
                    selObj = S.one(DOM.parent(e.target, ".selected-item"));
                }
                var filterid = selObj.attr("filterid");
                delSelectedItem(filterid);
                return false;
            });
            //hover已选项删除
            S.Event.delegate('#J_propertyFilter', 'mouseenter', '.selected-item', function(e){
                objMap.pfSelectedItem.removeClass("hover");
                S.one(e.target).addClass("hover");
            });
            //hover已选项删除
            S.Event.delegate('#J_propertyFilter', 'mouseleave', '.selected-item', function(e){
                S.one(e.target).removeClass("hover");
            });
            //删除全部
            S.Event.delegate('#J_propertyFilter', 'click', '.pf-st-clearall', function(e){
                var clearallObj = S.one(e.target);
                if(!clearallObj.hasClass("pf-st-clearall")){
                    clearallObj = clearallObj.parent(".pf-st-clearall");
                }
                propertyFilter.ATTRS.curLink = clearallObj.attr("href");
                S.all(".filter-item").removeClass("selected");
                
                me.animateFunc(S.all(".selected-item"), {
                    "margin-left":-70
                }, function(obj){
                    obj.remove();
                    me.checkSelectedStatus();
                }, .3);
                return false;
            });
            
            S.Event.delegate('#J_propertyFilter', 'click', '.pf-st-prev', function(e){
                var slideObj = S.one(".pf-st-slide");
                var outerWidth = slideObj.width();
                S.one(".pf-st-wrap").width(me.getCurSelWidth());
                me.animateFunc(slideObj, {
                    scrollLeft : slideObj.scrollLeft() - outerWidth
                }, function(){
                    me.setSelIndicatorSt();
                }, .6);
                return false;
            });
            S.Event.delegate('#J_propertyFilter', 'click', '.pf-st-next', function(e){
                var slideObj = S.one(".pf-st-slide");
                var outerWidth = slideObj.width();
                
                S.one(".pf-st-wrap").width(me.getCurSelWidth());
                me.animateFunc(slideObj, {
                    scrollLeft : slideObj.scrollLeft() + outerWidth
                }, function(){
                    me.setSelIndicatorSt();
                }, .6);
                return false;
            });
            me.setSelectedStyle();
            me.checkSelectedStatus(true);
        },
        removeDuplicate: function(){
            var visibleItems = S.all("#J_propertyFilter .pf-fixed-height:not(.pf-image) .filter-item");
            if(visibleItems){
                for(var i = 0 ; i < visibleItems.length ; i++){
                    if(visibleItems[i].offsetTop > 100){
                        continue;
                    }
                    var filterid = S.one(visibleItems[i]).attr("filterid");
                    var cateTabItem = S.one("#pf-band-cate .fp-item-" + filterid);
                    if(cateTabItem){
                        cateTabItem.addClass("hidden");
                    }
                }
            }
        },
        initSlide: function() {
            if( 'webkitTransition' in S.DOM.get("#J_propertyFilter").style ){
                propertyFilter.ATTRS.isCssAnim = true;
            }
            if(propertyFilter.ATTRS.isCssAnim){
                S.one("#J_propertyFilter").addClass("useCssAnimate");
            }else{
                S.one("#J_propertyFilter").removeClass("useCssAnimate");
            }
            
            if(S.one("#pf-band-cate") && S.one("#pf-band-cate").length > 0){
                var Tabs = Switchable.Tabs;
                var tabs = new Tabs('#pf-band-cate', {
                    triggerType: "click",
                    switchTo : 0
                });
            }
            
            var me = this;
            this.calWidth();
            //注册监听页面宽度改变，不用resize是因为做了特殊处理，有延时
            //RP.listen('J_propertyFilter', function(width) {
            //    me.calWidth();
            //});
            
            var timer = null;
            S.Event.on(window, "scroll", function(e) {
                clearTimeout(timer);
                timer = setTimeout(function(){
                    var showFixedTop = S.one(".main").offset().top;
                    var scrollTop = S.one(window).scrollTop();
                    if(scrollTop > showFixedTop){
                        var objMap = me.getObjMap();
                        if(S.UA.ie && S.UA.ie == 6){
                        }else if(objMap.pfObj.hasClass("property-fixed")){
                            return;
                        }
                        var curLi = S.DOM.get(".pf-slide-item.norelative");
                        if(curLi){
                            me.hideMore(curLi);
                        }
                        me.fixedShow();
                    }else{
                        var objMap = me.getObjMap();
                        if(objMap.pfObj.hasClass("property-fixed")){
                            me.fixedHide();
                        }
                    }
                }, 50);
            });
            
            me.bindFixedEvent();
            
            S.Event.delegate('#J_propertyFilter','click','.pf-pg-link',function(e){
                S.one(e.target).addClass("active").siblings().removeClass("active");
                var objMap = me.getObjMap();
                var pfPanel = objMap.pfPanel;
                var visibleSlideWidth = objMap.pfSlideItem.width() * propertyFilter.ATTRS.slidePerPage;
                var firstLeftNum = visibleSlideWidth - (pfPanel.width() - visibleSlideWidth) / 2;
                
                me.animateFunc(pfPanel, {
                    scrollLeft : firstLeftNum + visibleSlideWidth * (parseInt(S.one(e.target).attr("num")) - 1)
                }, function(){
                });
                if(S.one(e.target).attr("num") == 0){
                    S.one(".pagi-prev").removeClass("show");
                    S.one(".pagi-next").addClass("show");
                }else if(S.one(e.target).attr("num") == (propertyFilter.ATTRS.slidePageNum - 1)){
                    S.one(".pagi-prev").addClass("show");
                    S.one(".pagi-next").removeClass("show");
                }else{
                    S.one(".pagi-prev").addClass("show");
                    S.one(".pagi-next").addClass("show");
                }
                return false;
            });
            S.Event.delegate('#J_propertyFilter','click','.pagi-prev',function(e){
                var curActive = S.one(".pf-pg-link.active");
                if(curActive.prev()){
                    curActive.prev().fire("click");
                }
            });
            S.Event.delegate('#J_propertyFilter','click','.pagi-next',function(e){
                var curActive = S.one(".pf-pg-link.active");
                if(curActive.next()){
                    curActive.next().fire("click");
                }
            });
            S.Event.on('.pf-content','click',function(e){
                return;
                var obj = S.one(this);
                var slideItem = obj.parent(".pf-slide-item");
                if(slideItem.hasClass("norelative")){
                    obj.fire("mouseleave");
                }else{
                    obj.fire("mouseenter");
                }
            });
            S.Event.delegate('#J_propertyFilter','mouseenter','.pf-content',function(e){
                var slideItem = DOM.parent(e.target, ".pf-slide-item");
                var slidePanel = DOM.parent(e.target, ".pf-panel");
                
                if(S.one(slideItem).hasClass("no-slidedown")){
                    return;
                }

                var itemLeft = slideItem.offsetLeft;
                var itemRigth = slideItem.offsetLeft + slideItem.offsetWidth;
                var visibleLeft =  slidePanel.scrollLeft;
                var visibleRight =  slidePanel.scrollLeft + slidePanel.offsetWidth;
                
                if(itemLeft >= visibleLeft && itemRigth <= visibleRight){
                    me.showMore(slideItem);
                }
            });
            S.Event.delegate('#J_propertyFilter','mouseleave','.pf-content',function(e){
                me.hideMore(DOM.parent(e.target, ".pf-slide-item"));
            });
            S.Event.delegate('#J_propertyFilter','mouseenter','.ks-switchable-nav li',function(e){
                S.one(e.target).fire("click");
            });
            me.removeDuplicate();
        },
        getpfContentHeight: function(pfContentObj, adjust){
            var titleHeight = pfContentObj.children(".filter-title").height();
            var filterUleHeight = 0;
            pfContentObj.children(".filter-items").each(function(){
                filterUleHeight += this.height();
            });
            var totalHeight = titleHeight + filterUleHeight + adjust;
            if(totalHeight <= propertyFilter.ATTRS.minHeight){
                return propertyFilter.ATTRS.minHeight;
            }else if(totalHeight >= propertyFilter.ATTRS.maxHeight){
                return propertyFilter.ATTRS.maxHeight;
            }else{
                return totalHeight;
            }
        },
        animateFunc: function(obj, cssObj, callback, duration){
            var useCssAnim = false;
            if(propertyFilter.ATTRS.isCssAnim){
                //if(cssObj["width"] == undefined && cssObj["scrollLeft"] == undefined && cssObj["margin-left"] == undefined){
                if(cssObj["width"] == undefined && cssObj["scrollLeft"] == undefined){
                    useCssAnim = true;
                }
            }
            
            if(S.UA.ie && S.UA.ie == 6){
                if(cssObj.scrollLeft){
                    obj.scrollLeft(cssObj.scrollLeft);
                    delete cssObj.scrollLeft;
                }
                obj.css(cssObj);
                callback(obj);
            }else if(useCssAnim){
                S.Event.detach(obj, "webkitTransitionEnd");
                S.Event.on(obj, "webkitTransitionEnd", function(e) {
                    S.Event.detach(obj, "webkitTransitionEnd");
                    callback(obj);
                    return false;
                });
                obj.css(cssObj);
            }else{
                if(obj.hasClass("property-fixed")){
                    obj.stop(true);
                }else{
                    obj.stop(false);
                }
                obj.animate(cssObj, {
                    duration : duration || .5,
                    easing : "easeOutStrong",
                    complete : function() {
                        callback(obj);
                    }
                });
            }
        },
        showMore: function(liObj){
            var objMap = this.getObjMap();
            var pfSlide = S.one(".pf-slide");
            var pfLiContent = S.one(DOM.children(liObj, ".pf-content"));
            var pfFilterUl = pfLiContent.children(".filter-items:not(.pf-fixed-height)");
            var pfFilterImage = pfLiContent.children(".filter-items.pf-fixed-height");
            var pfFilterHeight = pfFilterUl.height();
            var pfSwitch = pfLiContent.children(".pf-switch");
            
            pfFilterUl.removeClass("maxheight");
            var adjustHeight = 14;
            
            var hasSwitch = pfSwitch && pfSwitch.length > 0;
            var hasImage = pfFilterImage && pfFilterImage.length > 0;
            
            if(hasSwitch && hasImage){
                adjustHeight = 300;
            }else if(!hasSwitch && hasImage){
                if(pfFilterHeight <= 150){
                    pfFilterUl.css({"height":"auto"});
                }else{
                    adjustHeight = 300;
                    pfFilterUl.css({"overflow":"auto", "height":"158"});
                }
            }else{
                if(pfFilterHeight <= 80){
                    return;
                }else if(pfFilterHeight > 244){
                    pfFilterUl.addClass("maxheight");
                }
            }
            objMap.pfWrapObj.css("overflow", "visible");
            pfLiContent.css({"width": S.one(liObj).width()-1,"overflow": "hidden", "left":parseInt(liObj.offsetLeft)});
            S.one(liObj).addClass("norelative");
            
            var listHeight = this.getpfContentHeight(pfLiContent, adjustHeight);
            
            objMap.pfPanelWrap.css("border-bottom", "none");
            this.animateFunc(pfSlide, {
                height : listHeight + 5
            }, function(){});
            if(propertyFilter.ATTRS.isCssAnim){
                pfLiContent.height(listHeight - 3);
            }else{
                this.animateFunc(pfLiContent, {
                    height : listHeight - 3
                }, function(){});
            }
        },
        hideMore: function(liObj){
            if(!S.one(liObj).hasClass("norelative")){
                return;
            }
            var pfSlide = S.one(".pf-slide");
            var pfLiContent = S.one(DOM.children(liObj, ".pf-content"));
            var pfFilterUl = pfLiContent.children(".filter-items");
            
            pfFilterUl.removeClass("maxheight");
            pfLiContent.scrollTop(0);

            this.animateFunc(pfLiContent, {
                height : propertyFilter.ATTRS.minHeight
            }, function(){
                pfLiContent.css({"width": "100%","overflow": "hidden","height": propertyFilter.ATTRS.minHeight, "left":0});
                S.one(liObj).removeClass("norelative");
            });
            this.animateFunc(pfSlide, {
                height : propertyFilter.ATTRS.minHeight
            }, function(){
            });
        },
        calWidth: function(){
            var objMap = this.getObjMap(true);
            var pfPanel = objMap.pfPanel; 
            var slideItems = objMap.pfSlideItem;
            var pfSlide = S.one(".pf-slide");
            var pfSelected = S.one(".pf-st-slide");
            pfSelected.css("width", pfPanel.width() - 100);
            
            var slidePerPage = Math.floor(pfPanel.width() / propertyFilter.ATTRS.slideDefaultWidth);
            slidePerPage = slidePerPage < slideItems.length ? slidePerPage : slideItems.length;
            var paginationNum = Math.ceil(slideItems.length / slidePerPage);
            
            if(pfPanel.width() != propertyFilter.ATTRS.containerWidth || slideItems.length != propertyFilter.ATTRS.slideNum){
                propertyFilter.ATTRS.slideNum = slideItems.length;
                propertyFilter.ATTRS.containerWidth = pfPanel.width();
                //只有一页，则将内容平分
                if(paginationNum == 1){
                    pfSlide.width(pfPanel.width());
                    var width = parseInt(pfPanel.width() / slidePerPage);
                    slideItems.width(width);
                    slideItems.children(".pf-content").width(width);
                    if(S.one("#pf-band-cate") && S.one("#pf-band-cate").length > 0){
                        this.hideMore(DOM.parent("#pf-band-cate", ".pf-slide-item"));
                    }
                    if(width > 450){
                        if(S.one("#pf-band-cate") && S.one("#pf-band-cate").parent(".pf-slide-item")){
                            S.one("#pf-band-cate").parent(".pf-slide-item").addClass("no-slidedown");
                        }
                    }
                }else{
                    pfSlide.width(slideItems.length * propertyFilter.ATTRS.slideDefaultWidth);
                    slideItems.width(propertyFilter.ATTRS.slideDefaultWidth);
                    slideItems.removeClass("no-slidedown");
                }
                propertyFilter.ATTRS.slidePageNum = paginationNum;
                propertyFilter.ATTRS.slidePerPage = slidePerPage;
                
                this.animateFunc(pfPanel, {
                    scrollLeft : 0
                }, function(){}, 1);
                
                this.generatePagition(paginationNum);
            }
            this.generateFlushItem();
            return;
        },
        generateFlushItem: function(){
            var objMap = this.getObjMap();
            var pHtml = "";
            
            objMap.pfSlideItem.each(function(i, k){
                if(k < 5){
                    var id = S.one(this).attr("filterid");
                    var name = S.one(this).attr("filtername");
                    pHtml += '<span class="pf-flush-item pf-flush-item-' + id + '" filterid="' + id + '" filtertype="pf-' + id + '">' + name + '</span>';
                }
            });
            objMap.flushingSlide.html(pHtml);

            var flushItems = S.all(".pf-flush-item");
            var itemwidth = parseInt((objMap.pfPanel.width() - 30) / flushItems.length);
            flushItems.width(itemwidth);
            flushItems.attr("oriwidth", itemwidth);
        },
        generatePagition: function(num){
            var objMap = this.getObjMap();
            objMap.indicator.removeClass("show");
            if(num <= 1){
                objMap.pfPagination.html("");
            }else{
                S.one(".pagi-next").addClass("show");
                var pHtml = "";
                for(var i = 0 ; i < num ; i++){
                    pHtml += '<a href="#" class="pf-pg-link ' + (i==0 ? "active" : "") + '" num="' + i + '">' + i + '</a>';
                }
                objMap.pfPagination.html(pHtml);
            }
        },
        registerTouchEvent: function(){
            if (S.UA.ie && S.UA.ie == 6) {
                return;
            }
            var objMap = this.getObjMap();
            Touchswip(objMap.pfPanel, {
                wipeLeft : function() {
                    KISSY.one("#J_propertyFilter .pagi-next").fire("click");
                },
                wipeRight : function() {
                    KISSY.one("#J_propertyFilter .pagi-prev").fire("click");
                },
                wipeUp : function() {
                },
                wipeDown : function() {
                },
                min_move_x : 20,
                min_move_y : 20,
                preventDefaultEvents : true
            });
            
            /*
            return;
            Touchswip(S.all("#J_propertyFilter .pf-slide-item"), {
                wipeLeft : function() {
                },
                wipeRight : function() {
                },
                wipeUp : function(e, obj) {
                    S.one(obj).children(".pf-content").fire("mouseenter");
                },
                wipeDown : function(e, obj) {
                    S.one(obj).children(".pf-content").fire("mouseleave");
                },
                min_move_x : 20,
                min_move_y : 20,
                preventDefaultEvents : true
            });*/
        }
    };
    
    propertyFilter.EVENTS = {
        '#J_unfold': {
            click: function(e){
            }
        }
    };
    
    S.extend(propertyFilter, Brick, {
        initialize: function() {
            this.initSlide();
            this.initSelected();
            this.registerTouchEvent();
            this.getTemplate();
        },
        setAjaxData: function(data){
            this.setData(data);
        }
    });

    S.augment(propertyFilter, propertyFilter.METHODS);
    return propertyFilter;
}, {
    requires: ['brix/core/brick',"switchable",'brix/core/mustache', "touchswip", "../property/index.css"]
});
