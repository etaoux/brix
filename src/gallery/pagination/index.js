KISSY.add('brix/gallery/pagination/index', function(S, Brick) {

    function param(o) {
        if (!S.isPlainObject(o)) {
            return '';
        }
        var sep = '&',eq = '=';
        var buf = [], key, val;
        for (key in o) {
            if (o.hasOwnProperty(key)) {
                val = o[key] || '';
                if (!S.isArray(val)) {
                    buf.push(key, eq, val, sep);
                }
                else if (S.isArray(val) && val.length) {
                    for (var i = 0, len = val.length; i < len; ++i) {
                        buf.push(key,eq,val[i], sep);
                    }
                }
            }
        }
        buf.pop();
        return buf.join('');
    }
    function unparam(str) {
        if (typeof str !== 'string'
            || (str = S.trim(str)).length === 0) {
            return {};
        }
        var sep = '&',eq = '=';
        var ret = {},
            pairs = str.split(sep),
            pair, key, val,
            i = 0, len = pairs.length;

        for (; i < len; ++i) {
            pair = pairs[i].split(eq);
            key = pair[0];
            val = pair[1] || '';
            if (Object.prototype.hasOwnProperty.call(ret, key)) {
                if (S.isArray(ret[key])) {
                    ret[key].push(val);
                } else {
                    ret[key] = [ret[key], val];
                }
            } else {
                ret[key] = val;
            }
        }
        return ret;
    }
    /**
     * Pagination 分页
     * <br><a href="../demo/gallery/pagination/pagination.html" target="_blank">Demo</a>
     * @class Brix.Gallery.Pagination
     * @extends Brix.Brick
     */
    function Pagination() {
        Pagination.superclass.constructor.apply(this, arguments);
    }
    Pagination.ATTRS = {
        /**
         * 模式，传统的第几页，还是记录条数,
         * 分为p 和s，p是传统模式，s是size总和模式
         * @cfg {Object}
         */
        mode: {
            value: 'p'
        },
        /**
         * 页数显示偏移，默认0，
         * @cfg {Number}
         */
        offset:{
            value:0
        },
        /**
         * 是否精简模式
         * @cfg {Boolean}
         */
        simplify: {
            value: false
        },
        /**
         * 步长
         * @cfg {Number}
         */
        step: {
            value: 7
        },
        /**
         * 第几页
         * @cfg {Number}
         */
        index: {
            value: 1
        },
        /**
         * 每页的记录数
         * @cfg {Number}
         */
        size: {
            value: 15
        },
        /**
         * 是否可以修改每页记录数
         * @cfg {Boolean}
         */
        sizeChange: {
            value: false
        },
        /**
         * 总记录数
         * @cfg {Number}
         */
        count: {
            value: 350
        },
        /**
         * 是否有总记录数
         * @cfg {Boolean}
         */
        hascount: {
            value: true
        },
        /**
         * 最多页数
         * @cfg {Number}
         */
        max: {
            value: false
        },
        /**
         * 是否认为限定最多页数
         * @cfg {Boolean}
         */
        hasmax: {
            value: false
        },
        /**
         * 是否显示统计信息
         * @cfg {Boolean}
         */
        statistics: {
            value: false
        },
        /**
         * 是否显示总页数
         * @cfg {Boolean}
         */
        pageCount: {
            value: true
        },
        /**
         * 是否有跳转
         * @cfg {Boolean}
         */
        jump: {
            value: false
        },
        /**
         * 是否直接跳转
         * @cfg {Boolean}
         */
        goTo: {
            value: true
        },
        /**
         * 跳转URL
         * @cfg {String}
         */
        goToUrl: {
            value: null
        },
        /**
         * 分页参数名
         * @cfg {String}
         */
        pageName: {
            value: 'page'
        },
        /**
         * 每页记录数参数名
         * @cfg {String}
         */
        pageSizeName: {
            value: 'pagesize'
        },
        /**
         * 连接跳转的额外参数
         * @cfg {Object}
         */
        params: {
            value: false
        },
        /**
         * 是否用默认UI,多在seo中采用
         * @cfg {Boolean}
         */
        defaultUI: {
            value: true
        },
        /**
         * 每页记录数集合
         * @cfg {Array}
         */
        sizes: {
            value: [10, 15, 20, 25, 30]
        },
        //url信息
        urlInfo: {
            value: {}
        },
        //格式化url字符，内部参数
        formatUrl: {
            value: false
        },
        /**
         * 是否显示上一页，下一页的文字
         * @cfg {Boolean}
         */
        isText:{
            value:false,
        }
    };

    Pagination.EVENTS = {
        '.page-num': {
            keydown: function(e) {
                if (e.keyCode === 13) {
                    e.preventDefault();
                    this._jumpPage();
                }
            }
        },
        '.btn-jump': {
            click: function(e) {
                e.preventDefault();
                this._jumpPage();
            }
        },
        'a': {
            'click': function(e) {
                var self = this,
                    target = S.one(e.currentTarget);
                if (target.hasClass('page')) {
                    e.preventDefault();
                    self.goToPage(parseInt(target.html(), 10));
                } else if (target.hasClass('page-prev')) {
                    e.preventDefault();
                    var index = self.get('index');
                    self.goToPage(index - 1);
                } else if (target.hasClass('page-next')) {
                    e.preventDefault();
                    var index = self.get('index');
                    self.goToPage(index + 1);
                }
            }
        }
    };
    Pagination.FIRES = {
        /**
         * @event beforeGotoPage
         * 跳转前触发 return false 阻止跳转
         * @param {Object} e 
         * @param {Number} e.newIndex 新的页数
         * @param {Number} e.prevIndex 原页数
         * @type {String}
         */
        beforeGotoPage:'beforeGotoPage',
        /**
         * @event goToPage
         * 跳转触发
         * @param {Object} e 
         * @param {Number} e.index 新的页数
         * @type {String}
         */
        goToPage:'goToPage',
        /**
         * @event gotoPage
         * 跳转触发
         * @param {Object} e 
         * @param {Number} e.index 新的页数
         * @type {String}
         */
        gotoPage:'gotoPage',
        /**
         * @event sizeChange
         * 每页显示记录数改变 
         * @param {Object} e 
         * @param {Number} e.size 记录数
         * @type {String}
         */
        sizeChange:'sizeChange'
    };

    Pagination.METHODS = {
        /**
         * 页面跳转或者触发goToPage事件
         * @param  {Number} page 要跳转的页
         */
        goToPage: function(page) {
            var self = this,
                ret;
            ret = self.fire('beforeGotoPage', {
                newIndex: page,
                prevIndex: self.get('index')
            });

            if (ret === false) {
                //如果返回默认false，则取消后续事件
                return;
            }

            self.set('index', page);

            if(self.setConfig({index:page})){
                return;
            }

            self.fire('goToPage', {
                index: page
            });
            self.fire('gotoPage', {
                index: page
            });
        },
        /**
         * 配置重置
         * @param {Object} config 配置对象
         * @return {Boolean} 是否跳转
         */
        setConfig: function(config) {
            var self = this,
                size = self.get('size');

            for (var key in config) {
                self.set(key, config[key]);
            }

            if (config.goToUrl) {
                self._setUrlInfo();
            }
            if (self.get('goTo')) {
                var url = self.doUrl();
                location.href = url;
                return true;
            }
            if (config.size && config.size != size) {
                self.fire('sizeChange', {
                    size: config.size
                });
            }
            self._destroyDropdown();
            self._resizeConfig();
            self.renderUI();
            self._getDropDown();
            return false;
        },
        /**
         * 解析url
         * @param  {String} url url字符串
         * @return {Object}     解析后的URL对象
         */
        parseUrl: function(url) {
            var a = document.createElement('a');
            a.href = url;
            return {
                source: url,
                protocol: a.protocol.replace(':', ''),
                host: a.hostname,
                port: a.port,
                query: a.search,
                params: (function() { 
                    return unparam(a.search.replace(/^\?/, ''));
                })(),
                file: (a.pathname.match(/\/([^\/?#]+)$/i) || [, ''])[1],
                hash: a.hash.replace('#', ''),
                path: a.pathname.replace(/^([^\/])/, '/$1'),
                relative: (a.href.match(/tps?:\/\/[^\/]+(.+)/) || [, ''])[1],
                segments: a.pathname.replace(/^\//, '').split('/')
            };
        },
        /**
         * 构建url
         * @return {String} url
         */
        doUrl: function() {
            var self = this,
                urlInfo = self.get('urlInfo'),
                index = self.get('index'),
                size = self.get('size'),
                pageName = self.get('pageName'),
                pageSizeName = self.get('pageSizeName'),
                returnUrl;
            urlInfo.params[pageName] = self._offset(index);
            if (pageSizeName) {
                urlInfo.params[pageSizeName] = size;
            } else if (urlInfo.params[pageSizeName]) {
                delete urlInfo.params[pageSizeName];
            }

            returnUrl = urlInfo.protocol + '://' + urlInfo.host;
            if (urlInfo.port != 0 && urlInfo.port != 80) {
                returnUrl += ':' + urlInfo.port;
            }
            returnUrl += urlInfo.path + '?';


            returnUrl += param(urlInfo.params);
            if (urlInfo.hash != '') {
                returnUrl += '#' + urlInfo.hash;
            }
            return returnUrl;
        }
    };

    S.extend(Pagination, Brick, {
        initialize: function() {
            var self = this;
            self._setUrlInfo();
            //从url信息中初始配置参数
            var urlInfo = self.get('urlInfo');
            var mode = self.get('mode'),
                offset = self.get('offset'),
                pageName = self.get('pageName'),
                pageSizeName = self.get('pageSizeName');

            if (pageSizeName && urlInfo.params[pageSizeName]) {
                self.set('size', parseInt(urlInfo.params[pageSizeName], 10));
            }
            if (urlInfo.params[pageName]) {
                switch (mode) {
                case 'p':
                    self.set('index', parseInt(urlInfo.params[pageName], 10)-offset);
                    break;
                case 's':
                    var size = self.get('size');
                    self.set('index', (parseInt(urlInfo.params[pageName], 10)-(offset*size)) / size);
                    break;
                }
            }
            //对配置参数容错
            self._resizeConfig();
            if (self.get('defaultUI')) {
                self.renderUI();
            }
            self._getDropDown();
        },
        destructor: function() {
            this._destroyDropdown();
        },
        renderUI: function() {
            var self = this,
                mode = self.get('mode'),
                formatUrl = self.get('formatUrl'),
                index = self.get('index'),
                max = self.get('max'),
                step = Math.min(self.get('step'),max),
                size = self.get('size'),
                count = self.get('count'),
                hascount = self.get('hascount'),
                pageCount = self.get('pageCount'),
                isText = self.get('isText');
            var arrHTML = [];

            //render statistics
            if (self.get('statistics')) {
                arrHTML.push('<div class="pagination-info"><span>当前</span><span class="b">' + (count == 0 ? 0 : ((index - 1) * size + 1)) + '-' + Math.min(index * size, count) + '</span><span>条</span><span class="mr">共</span><span class="b">' + count + '</span><span>条</span><span class="mr">每页展现</span>');
                if (self.get('sizeChange')) {
                    var sizes = self.get('sizes');
                    arrHTML.push('<div class="dropdown">' + '<span class="dropdown-hd">' + '<span class="dropdown-text" value="' + S.indexOf(size, sizes) + '">' + size + '</span>' + '</span>' + '<ul class="dropdown-list dropdown-list-noicon">');
                    S.each(sizes, function(s, i) {
                        arrHTML.push('<li class="dropdown-item' + (s == size ? ' dropdown-itemselected' : '') + '"><span value="' + i + '">' + s + '</span></li>');
                    });
                    arrHTML.push('</ul></div>');
                } else {
                    arrHTML.push('<span class="b">' + size + '</span>')
                }
                arrHTML.push('<span>条</span></div>');
            }

            //pages
            arrHTML.push('<div class="pagination-pages"><div class="pagination-page">');

            if (index > 1) {
                arrHTML.push('<a title="上一页" href="' + formatUrl.replace('{$p}',  self._offset(index - 1)) + '" class="page-prev"><i class="iconfont">&#403</i>'+(isText?'<span>上一页</span>':'')+'</a>');
            }
            if (self.get('simplify')) {
                arrHTML.push('<span class="page-simply">' + index + '/' + max + '</span>');
            } else {
                var start = Math.max(1, index - parseInt(step / 2));
                var end = Math.min(max, start + step - 1);
                start = Math.max(1, end - step + 1);

                if (start >= 3) {
                    arrHTML.push('<a class="page" href="' + formatUrl.replace('{$p}', self._offset(1)) + '" title="第1页">1</a>');
                    arrHTML.push('<a class="page" href="' + formatUrl.replace('{$p}', self._offset(2)) + '" title="第2页">2</a>');
                    if (start > 3) {
                        arrHTML.push('<span class="page-split">...</span>');
                    }
                } else if (start == 2) {
                    arrHTML.push('<a class="page" href="' + formatUrl.replace('{$p}', self._offset(1)) + '" title="第1页">1</a>');
                }

                for (var i = start; i <= end; i++) {
                    if (i === index) {
                        arrHTML.push('<span class="page-cur">' + i + '</span>');
                    } else {
                        arrHTML.push('<a class="page" href="' + formatUrl.replace('{$p}', self._offset(i)) + '" title="第' + i + '页">' + i + '</a>');
                    }
                }
                if (end + 2 <= max) {
                    arrHTML.push('<span class="page-split">...</span>');
                    if (hascount) {
                        arrHTML.push('<a class="page" href="' + formatUrl.replace('{$p}', self._offset(max)) + '" title="第' + max + '页">' + max + '</a>');
                    }
                } else if (end < max) {
                    arrHTML.push('<a class="page" href="' + formatUrl.replace('{$p}', self._offset(max)) + '" title="第' + max + '页">' + max + '</a>');
                }
            }

            if (index != max) {
                arrHTML.push('<a title="下一页" href="' + formatUrl.replace('{$p}', self._offset(index + 1)) + '" class="page-next">'+(isText?'<span>下一页</span>':'')+'<i class="iconfont">&#402</i></a>');
            }
            arrHTML.push('</div>');
            if (hascount && pageCount) {
                arrHTML.push('<div class="pagination-count"><span>共</span><span class="b">' + max + '</span><span>页</span></div>');
            }
            //render Jump
            if (self.get('jump')) {
                arrHTML.push('<div class="pagination-form"><span>向第</span><input class="page-num" value="' + Math.min(max, index + 1) + '" name="page" type="text"><span>页</span><a class="btn-jump btn btn-size25">跳转</a></div>');
            }

            arrHTML.push('</div>');

            self.get('el').html(arrHTML.join(''));

        },
        /**
         * 计算页数的偏移
         * @param  {Number} index 页数
         * @return {Number} 偏移后的值
         * @private
         */
        _offset:function(index){
            var self = this,
                mode = self.get('mode'),
                offset = self.get('offset');
            switch(mode){
                case 'p':
                    return index+offset;
                case 's':
                    var size = self.get('size');
                    return size*(index+offset);
                default:
                    return index+offset;
            }
        },
        _getDropDown: function() {
            var self = this;
            if (self.get('sizeChange') && self.get('statistics')) {
                var dropdownNode = self.get('el').one('.dropdown');
                if (dropdownNode) {
                    var id = dropdownNode ? dropdownNode.attr('id') : false;
                    if (id && self.pagelet) {
                        self.pagelet.ready(function(){
                            self.dropdown = self.pagelet.getBrick(id);
                            if(self.dropdown){
                                self._bindDropdownSizeChange();
                            }
                            else{
                                self._createDropdown();
                            }
                        }); 
                    }else{
                        self._createDropdown();
                    }
                }
            }

        },
        _createDropdown: function() {
            var self = this;
            S.use('brix/gallery/dropdown/', function(S, Dropdown) {
                self.dropdown = new Dropdown({
                    tmpl: self.get('el').one('.dropdown')
                });
                self._bindDropdownSizeChange();
            });
        },
        _bindDropdownSizeChange:function(){
            var self = this;
            self.dropdown.on('selected', function(ev) {
                self.setConfig({
                    index:1,
                    size: ev.text
                });
            });
        },
        _destroyDropdown: function() {
            var self = this;
            if (self.dropdown) {
                self.dropdown.destroy();
                self.dropdown = null;
            }
        },
        /**
         * 跳转
         * @private
         */
        _jumpPage: function() {
            var self = this,
                pageNumNode = this.get('el').one('.page-num'),
                page = parseInt(pageNumNode.val(), 10),
                max = self.get('max'),
                index = self.get('index');
            if (isNaN(page) || page < 1 || page > max || page == index) {
                pageNumNode[0].select();
                return;
            }
            this.goToPage(page);
        },
        /**
         * 设置urlInfo
         * @private
         */
        _setUrlInfo: function() {
            var self = this,
                params = self.get('params');
            if (!self.get('goToUrl')) {
                self.set('goToUrl', location.href);
            }

            var urlInfo = self.parseUrl(self.get('goToUrl'));

            //合并外部参数
            if (params) {
                S.each(params, function(v, k) {
                    urlInfo.params[k] = v;
                });
            }

            self.set('urlInfo', urlInfo);
        },
        /**
         * 配置纠错，对传入的配置进行容错处理
         * @private
         */
        _resizeConfig: function() {
            var self = this,
                index = self.get('index'),
                hascount = self.get('hascount'),
                
                size = self.get('size'),
                count = self.get('count'),
                max = self.get('max'),
                hasmax = self.get('hasmax'),
                pageName = self.get('pageName'),
                pageSizeName = self.get('pageSizeName');

            if (!hascount) {
                var step = self.get('step');
                if (index >= step) {
                    count = size * (index + 1);
                } else {
                    count = size * step;
                }
                self.set('count', count);
            }
            if (!hasmax) {
                max = Math.ceil(count / size);
            } else {
                max = Math.min(Math.ceil(count / size), max);
            }

            self.set('max', max);
            index = Math.min(index, max);
            self.set('index', index);

            if (count === 0) {
                self.set('max', 1);
                self.set('index', 1);
            }
            self.set('formatUrl', self.doUrl().replace(pageName + '=' + self._offset(index), pageName + '={$p}'));
        }
    });
    S.augment(Pagination, Pagination.METHODS);
    return Pagination;
}, {
    requires: ["brix/core/brick"]
});