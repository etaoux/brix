/**
 * Brix扩展的Mustache类<br/>
 * 支持简单的条件判断 如:
<pre>
{{#list}}
&nbsp;&nbsp;&nbsp;&nbsp;{{#if(status==P)}}ID:{{id}},status:&lt;b style='color:green'>通过&lt;/b>{{/if(status==P)}}
&nbsp;&nbsp;&nbsp;&nbsp;{{#if(status==W)}}ID:{{id}},status:等待{{/if(status==W)}}
&nbsp;&nbsp;&nbsp;&nbsp;{{#if(status==R)}}ID:{{id}},status&lt;b style='color:red'>拒绝&lt;/b>{{/if(status==R)}}
{{/list}}
</pre>
 * 对于数组对象可以通过{{__index__}}访问数组下标
 * @class Brix.Gallery.Mu
 * @extend Mustache
 * @static
 */
KISSY.add("brix/gallery/mu/index", function(S, Mustache) {
    var notRender = /\s*<script[^>]+type\s*=\s*(['"])\s*text\/tmpl\1[^>]*>([\s\S]*?)<\/script>\s*/gi;

    function addFns(template, data) {
        var ifs = getConditions(template);
        var key = "";
        for (var i = 0; i < ifs.length; i++) {
            key = "if(" + ifs[i] + ")";
            if (data[key]) {
                continue;
            } else {
                data[key] = buildFn(ifs[i]);
            }
        }
    }

    function getConditions(template) {
        var ifregexp_ig = /\{{2,3}[\^#]?if\((.*?)\)\}{2,3}?/ig;
        var ifregexp_i = /\{{2,3}[\^#]?if\((.*?)\)\}{2,3}?/i;
        var gx = template.match(ifregexp_ig);
        var ret = [];
        if (gx) {
            for (var i = 0; i < gx.length; i++) {
                ret.push(gx[i].match(ifregexp_i)[1]);
            }
        }
        return ret;
    }

    function buildFn(key) {
        key = key.split("==");
        var res = function() {
            var ns = key[0].split("."),
                value = key[1],
                curData = this;
            for (var i = ns.length - 1; i > -1; i--) {
                var cns = ns.slice(i);
                var d = curData;
                try {
                    for (var j = 0; j < cns.length - 1; j++) {
                        d = d[cns[j]];
                    }
                    if (cns[cns.length - 1] in d) {
                        if (d[cns[cns.length - 1]].toString() === value) {
                            return true;
                        } else {
                            return false;
                        }
                    }
                } catch (err) {}
            }
            return false;
        };
        return res;
    }

    function findArray(o, depth) {
        var k, v;
        for (k in o) {
            v = o[k];
            if (v instanceof Array) {
                addArrayIndex(v);
            } else if (typeof(v) === "object" && depth < 5) {
                findArray(v, depth + 1);
            }
        }
    }

    function addArrayIndex(v) {
        for (var i = 0; i < v.length; i++) {
            var o = v[i];
            if (o !== null && typeof(o) === "object") {
                if (i === 0) {
                    o.__first__ = true;
                } else if (i === (v.length - 1)) {
                    o.__last__ = true;
                } else {
                    o.__mid__ = true;
                }
                o.__index__ = i;
            }
        }
    }
    return {
        /**
         * 输出模板和数据,返回渲染后结果字符串,接口与Mustache完全一致
         * @method to_html
         * @param {String} template 模板字符串
         * @param {Object} data 数据Object
         * @return {String}
         */
        to_html: function(template, data) {
            if (typeof(data) === "object") {
                findArray(data, 0);
            }
            var notRenders = template.match(notRender);
            if (notRenders) {
                template = template.replace(notRender, function() { //防止不必要的解析
                    return '<script type="text/tmpl"></script>';
                });
            }
            //对if判断在vm中出错的兼容。
            template = template.replace(/(\{{2,3})@if/ig, '$1#if');
            addFns(template, data);
            template = Mustache.to_html.apply(this, arguments);

            if (notRenders) {
                var idx = 0;
                template = template.replace(notRender, function() {
                    return notRenders[idx++];
                });
            }
            return template;
        },
        name: Mustache.name,
        version: Mustache.version,
        tags: Mustache.tags,
        Scanner: Mustache.Scanner,
        Context: Mustache.Context,
        Writer: Mustache.Writer,
        escape: Mustache.escape,
        parse: Mustache.parse,
        clearCache: Mustache.clearCache,
        compile: Mustache.compile,
        compilePartial: Mustache.compilePartial,
        compileTokens: Mustache.compileTokens,
        render: function() {
            return this.to_html.apply(this, arguments);
        }
    };
}, {
    requires: ["brix/gallery/mustache/"]
});