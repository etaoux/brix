KISSY.add('brix/gallery/pagination/index', function(S, Brick) {
    function Pagination() {
        Pagination.superclass.constructor.apply(this, arguments);
    }
    Pagination.ATTRS = {
        //模式，传统的第几页，还是记录条数
        mode: {
            value: 'p' //分为p 和s，p是传统模式，s是size总和模式
        },
        //是否精简模式
        simplify: {
            value: false
        },
        //步长
        step: {
            value: 7
        },
        //第几页
        index: {
            value: 1
        },
        //每页的记录数
        size: {
            value: 15
        },
        //是否可以修改每页记录数
        sizeChange: {
            value: false
        },
        //总记录数
        count: {
            value: 350
        },
        //是否有总记录数
        hascount: {
            value: true
        },
        //最多页数
        max: {
            value: false
        },
        //是否认为限定最多页数
        hasmax: {
            value: false
        },
        //统计信息
        statistics: {
            value: false
        },
        //是否显示总页数
        pageCount: {
            value: true
        },
        //是否有跳转
        jump: {
            value: false
        },
        //是否直接跳转
        goTo: {
            value: true
        },
        //跳转URL
        goToUrl: {
            value: null
        },
        //分页参数名
        pageName: {
            value: 'page'
        },
        //每页记录数参数名
        pageSizeName: {
            value: 'pagesize'
        },
        //连接跳转的参数
        params: {
            value: false
        },
        //是否用默认UI
        defaultUI: {
            value: true
        },
        //每页记录数集合
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
        }
    };

    Pagination.ATTACH = {
        '.page-num': {
            keydown: function(e) {
                if (e.keyCode === 13) {
                    e.halt();
                    this._jumpPage();
                }
            }
        },
        '.btn-jump': {
            click: function(e) {
                e.halt();
                this._jumpPage();
            }
        },
        'a': {
            'click': function(e) {
                var self = this,
                    target = S.one(e.currentTarget);
                if (target.hasClass('page')) {
                    e.halt();
                    self.goToPage(parseInt(target.html(), 10));
                } else if (target.hasClass('page-prev')) {
                    e.halt();
                    var index = self.get('index');
                    self.goToPage(index - 1);
                } else if (target.hasClass('page-next')) {
                    e.halt();
                    var index = self.get('index');
                    self.goToPage(index + 1);
                }
            }
        }
    };

    Pagination.METHOD = {
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

            if (self.get('goTo')) {
                var url = self.doUrl();
                location.href = url;
                return;
            }
            self._destroyDropdown();
            self._resizeConfig();
            self.renderUI();
            self._getDropDown();

            self.fire('goToPage', {
                index: page
            });
        },
        /**
         * 配置重置
         * @param {Object} config 配置对象
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
            if (config.index || config.size || config.max || config.hascount || config.step || config.mode) {
                if (config.size && config.size != size) {
                    self.fire('sizeChange', {
                        size: size
                    });
                }
                self._destroyDropdown();
                self._resizeConfig();
                self.renderUI();
                self._getDropDown();
            }
        },
        /**
         * 解析url
         * @param  {String} url url字符串
         * @return {Object}     解析后的URL对象
         */
        parseUrl: function(url) {
            var a = document.createElement('a');
            a.href = url.toLowerCase();
            return {
                source: url,
                protocol: a.protocol.replace(':', ''),
                host: a.hostname,
                port: a.port,
                query: a.search,
                params: (function() {
                    var ret = {},
                        seg = a.search.replace(/^\?/, '').split('&'),
                        len = seg.length,
                        i = 0,
                        s;
                    for (; i < len; i++) {
                        if (!seg[i]) {
                            continue;
                        }
                        s = seg[i].split('=');
                        ret[s[0]] = s[1];
                    }
                    return ret;
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
                mode = self.get('mode'),
                returnUrl;
            switch (mode) {
            case 'p':
                urlInfo.params[pageName] = index;
                break;
            case 's':
                urlInfo.params[pageName] = index * size;
                break;
            }
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

            var temp = [];
            for (var param in urlInfo.params) {
                temp[temp.length] = param + '=' + urlInfo.params[param];
            }
            returnUrl += temp.join('&');
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
                pageName = self.get('pageName'),
                pageSizeName = self.get('pageSizeName');

            if (pageSizeName && urlInfo.params[pageSizeName]) {
                self.set('size', parseInt(urlInfo.params[pageSizeName], 10));
            }
            if (urlInfo.params[pageName]) {
                switch (mode) {
                case 'p':
                    self.set('index', parseInt(urlInfo.params[pageName], 10));
                    break;
                case 's':
                    var size = self.get('size');
                    self.set('index', parseInt(urlInfo.params[pageName], 10) / size);
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
                step = self.get('step'),
                index = self.get('index'),
                max = self.get('max'),
                size = self.get('size'),
                count = self.get('count'),
                hascount = self.get('hascount'),
                pageCount = self.get('pageCount');
            var arrHTML = [];

            var seed = 1;
            switch (mode) {
            case 'p':
                seed = 1;
                break;
            case 's':
                seed = size;
                break
            }

            //render statistics
            if (self.get('statistics')) {
                arrHTML.push('<div class="pagination-info"><span>当前</span><span class="b">' + (count == 0 ? 0 : ((index - 1) * size + 1)) + '-' + Math.min(index * size, count) + '</span><span>条</span><span class="mr">共</span><span class="b">' + count + '</span><span>条</span><span class="mr">每页展现</span>');
                if (self.get('sizeChange')) {
                    var sizes = self.get('sizes');
                    arrHTML.push('<div class="dropdown">' + '<span class="dropdown-hd">' + '<span class="dropdown-text" value="' + S.indexOf(size, sizes) + '">' + size + '</span>' + '<i class="iconfont icon-arrow-down">&#405</i>' + '</span>' + '<ul class="dropdown-list">');
                    S.each(sizes, function(s, i) {
                        arrHTML.push('<li class="dropdown-item' + (s == size ? ' dropdown-itemselected' : '') + '"><span value="' + i + '">' + s + '</span><i class="iconfont icon-ok">&#126</i></li>');
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
                arrHTML.push('<a title="上一页" href="' + formatUrl.replace('{$p}', seed * (index - 1)) + '" class="page-prev"><i class="iconfont">&#403</i></a>');
            }
            if (self.get('simplify')) {
                arrHTML.push('<span class="page-simply">' + index + '/' + max + '</span>');
            } else {
                var start = Math.max(1, index - parseInt(step / 2));
                var end = Math.min(max, start + step - 1);
                start = Math.max(1, end - step + 1);

                if (start >= 3) {
                    arrHTML.push('<a class="page" href="' + formatUrl.replace('{$p}', seed * 1) + '" title="第1页">1</a>');
                    arrHTML.push('<a class="page" href="' + formatUrl.replace('{$p}', seed * 2) + '" title="第2页">2</a>');
                    if (start > 3) {
                        arrHTML.push('<span class="page-split">...</span>');
                    }
                } else if (start == 2) {
                    arrHTML.push('<a class="page" href="' + formatUrl.replace('{$p}', seed * 1) + '" title="第1页">1</a>');
                }

                for (var i = start; i <= end; i++) {
                    if (i === index) {
                        arrHTML.push('<span class="page-cur">' + i + '</span>');
                    } else {
                        arrHTML.push('<a class="page" href="' + formatUrl.replace('{$p}', seed * i) + '" title="第' + i + '页">' + i + '</a>');
                    }
                }
                if (end + 2 <= max) {
                    arrHTML.push('<span class="page-split">...</span>');
                    if (hascount) {
                        arrHTML.push('<a class="page" href="' + formatUrl.replace('{$p}', seed * max) + '" title="第' + max + '页">' + max + '</a>');
                    }
                } else if (end < max) {
                    arrHTML.push('<a class="page" href="' + formatUrl.replace('{$p}', seed * max) + '" title="第' + max + '页">' + max + '</a>');
                }
            }

            if (index != max) {
                arrHTML.push('<a title="下一页" href="' + formatUrl.replace('{$p}', seed * (index + 1)) + '" class="page-next"><i class="iconfont">&#402</i></a>');
            }
            arrHTML.push('</div>');
            if (hascount && pageCount) {
                arrHTML.push('<div class="pagination-count"><span>共</span><span class="b">' + max + '</span><span>页</span></div>');
            }
            //render Jump
            if (self.get('jump')) {
                arrHTML.push('<div class="pagination-form"><span>向前</span><input class="page-num" value="' + Math.min(max, index + 1) + '" name="page" type="text"><span>页</span><a class="btn-jump btn btn-size25">跳转</a></div>');
            }

            arrHTML.push('</div>');

            self.get('el').html(arrHTML.join(''));

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
                                self.dropdown.on('selected', function(ev) {
                                    self.setConfig({
                                        size: ev.text
                                    });
                                });
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
                self.dropdown.on('selected', function(ev) {
                    self.setConfig({
                        size: ev.text
                    });
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
         */
        _resizeConfig: function() {
            var self = this,
                index = self.get('index'),
                hascount = self.get('hascount'),
                step = self.get('step'),
                size = self.get('size'),
                count = self.get('count'),
                max = self.get('max'),
                hasmax = self.get('hasmax'),
                mode = self.get('mode'),
                pageName = self.get('pageName'),
                pageSizeName = self.get('pageSizeName');

            if (!hascount) {
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
            step = Math.min(step, max);
            self.set('step', step);

            var formatUrl = self.doUrl();
            switch (mode) {
            case 'p':
                formatUrl = formatUrl.replace(pageName + '=' + index, pageName + '={$p}');
                break;
            case 's':
                formatUrl = formatUrl.replace(pageName + '=' + index * size, pageName + '={$p}');
                break;
            }
            self.set('formatUrl', formatUrl);
        }
    });
    S.augment(Pagination, Pagination.METHOD);
    return Pagination;
}, {
    requires: ["brix/core/brick"]
});