/*! Brix - v0.1.0
* https://github.com/etaoux/brix
* Copyright (c) 2012 etaoux; Licensed MIT */
KISSY.add('brix/core/mustache', function(S) {
  /**
   * mustache.js - Logic-less {{mustache}} templates with JavaScript
   * http://github.com/janl/mustache.js
   * @class Mustache
   */
  var Mustache = (typeof module !== "undefined" && module.exports) || {};

  (function(exports) {

    exports.name = "mustache.js";
    exports.version = "0.5.0-dev";
    exports.tags = ["{{", "}}"];
    exports.parse = parse;
    exports.compile = compile;
    exports.render = render;
    exports.clearCache = clearCache;

    // This is here for backwards compatibility with 0.4.x.
    exports.to_html = function(template, view, partials, send) {
      var result = render(template, view, partials);

      if (typeof send === "function") {
        send(result);
      } else {
        return result;
      }
    };

    var _toString = Object.prototype.toString;
    var _isArray = Array.isArray;
    var _forEach = Array.prototype.forEach;
    var _trim = String.prototype.trim;

    var isArray;
    if (_isArray) {
      isArray = _isArray;
    } else {
      isArray = function(obj) {
        return _toString.call(obj) === "[object Array]";
      };
    }

    var forEach;
    if (_forEach) {
      forEach = function(obj, callback, scope) {
        return _forEach.call(obj, callback, scope);
      };
    } else {
      forEach = function(obj, callback, scope) {
        for (var i = 0, len = obj.length; i < len; ++i) {
          callback.call(scope, obj[i], i, obj);
        }
      };
    }

    var spaceRe = /^\s*$/;

    function isWhitespace(string) {
      return spaceRe.test(string);
    }

    var trim;
    if (_trim) {
      trim = function(string) {
        return string == null ? "" : _trim.call(string);
      };
    } else {
      var trimLeft, trimRight;

      if (isWhitespace("\xA0")) {
        trimLeft = /^\s+/;
        trimRight = /\s+$/;
      } else {
        // IE doesn't match non-breaking spaces with \s, thanks jQuery.
        trimLeft = /^[\s\xA0]+/;
        trimRight = /[\s\xA0]+$/;
      }

      trim = function(string) {
        return string == null ? "" : String(string).replace(trimLeft, "").replace(trimRight, "");
      };
    }

    var escapeMap = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': '&quot;',
      "'": '&#39;'
    };

    function escapeHTML(string) {
      return String(string).replace(/&(?!\w+;)|[<>"']/g, function(s) {
        return escapeMap[s] || s;
      });
    }

    /**
     * Adds the `template`, `line`, and `file` properties to the given error
     * object and alters the message to provide more useful debugging information.
     */

    function debug(e, template, line, file) {
      file = file || "<template>";

      var lines = template.split("\n"),
        start = Math.max(line - 3, 0),
        end = Math.min(lines.length, line + 3),
        context = lines.slice(start, end);

      var c;
      for (var i = 0, len = context.length; i < len; ++i) {
        c = i + start + 1;
        context[i] = (c === line ? " >> " : "    ") + context[i];
      }

      e.template = template;
      e.line = line;
      e.file = file;
      e.message = [file + ":" + line, context.join("\n"), "", e.message].join("\n");

      return e;
    }

    /**
     * Looks up the value of the given `name` in the given context `stack`.
     */

    function lookup(name, stack, defaultValue) {
      if (name === ".") {
        return stack[stack.length - 1];
      }

      var names = name.split(".");
      var lastIndex = names.length - 1;
      var target = names[lastIndex];

      var value, context, i = stack.length,
        j, localStack;
      while (i) {
        localStack = stack.slice(0);
        context = stack[--i];

        j = 0;
        while (j < lastIndex) {
          context = context[names[j++]];

          if (context == null) {
            break;
          }

          localStack.push(context);
        }

        if (context && typeof context === "object" && target in context) {
          value = context[target];
          break;
        }
      }

      // If the value is a function, call it in the current context.
      if (typeof value === "function") {
        value = value.call(localStack[localStack.length - 1]);
      }

      if (value == null) {
        return defaultValue;
      }

      return value;
    }

    function renderSection(name, stack, callback, inverted) {
      var buffer = "";
      var value = lookup(name, stack);

      if (inverted) {
        // From the spec: inverted sections may render text once based on the
        // inverse value of the key. That is, they will be rendered if the key
        // doesn't exist, is false, or is an empty list.
        if (value == null || value === false || (isArray(value) && value.length === 0)) {
          buffer += callback();
        }
      } else if (isArray(value)) {
        forEach(value, function(value) {
          stack.push(value);
          buffer += callback();
          stack.pop();
        });
      } else if (typeof value === "object") {
        stack.push(value);
        buffer += callback();
        stack.pop();
      } else if (typeof value === "function") {
        var scope = stack[stack.length - 1];
        var scopedRender = function(template) {
            return render(template, scope);
          };
        buffer += value.call(scope, callback(), scopedRender) || "";
      } else if (value) {
        buffer += callback();
      }

      return buffer;
    }

    /**
     * Parses the given `template` and returns the source of a function that,
     * with the proper arguments, will render the template. Recognized options
     * include the following:
     *
     *   - file     The name of the file the template comes from (displayed in
     *              error messages)
     *   - tags     An array of open and close tags the `template` uses. Defaults
     *              to the value of Mustache.tags
     *   - debug    Set `true` to log the body of the generated function to the
     *              console
     *   - space    Set `true` to preserve whitespace from lines that otherwise
     *              contain only a {{tag}}. Defaults to `false`
     */

    function parse(template, options) {
      options = options || {};

      var tags = options.tags || exports.tags,
        openTag = tags[0],
        closeTag = tags[tags.length - 1];

      var code = ['var buffer = "";', // output buffer
      "\nvar line = 1;", // keep track of source line number
      "\ntry {", '\nbuffer += "'];

      var spaces = [],
        // indices of whitespace in code on the current line
        hasTag = false,
        // is there a {{tag}} on the current line?
        nonSpace = false; // is there a non-space char on the current line?
      // Strips all space characters from the code array for the current line
      // if there was a {{tag}} on it and otherwise only spaces.
      var stripSpace = function() {
          if (hasTag && !nonSpace && !options.space) {
            while (spaces.length) {
              code.splice(spaces.pop(), 1);
            }
          } else {
            spaces = [];
          }

          hasTag = false;
          nonSpace = false;
        };

      var sectionStack = [],
        updateLine, nextOpenTag, nextCloseTag;

      var setTags = function(source) {
          tags = trim(source).split(/\s+/);
          nextOpenTag = tags[0];
          nextCloseTag = tags[tags.length - 1];
        };

      var includePartial = function(source) {
          code.push('";', updateLine, '\nvar partial = partials["' + trim(source) + '"];', '\nif (partial) {', '\n  buffer += render(partial,stack[stack.length - 1],partials);', '\n}', '\nbuffer += "');
        };

      var openSection = function(source, inverted) {
          var name = trim(source);

          if (name === "") {
            throw debug(new Error("Section name may not be empty"), template, line, options.file);
          }

          sectionStack.push({
            name: name,
            inverted: inverted
          });

          code.push('";', updateLine, '\nvar name = "' + name + '";', '\nvar callback = (function () {', '\n  return function () {', '\n    var buffer = "";', '\nbuffer += "');
        };

      var openInvertedSection = function(source) {
          openSection(source, true);
        };

      var closeSection = function(source) {
          var name = trim(source);
          var openName = sectionStack.length != 0 && sectionStack[sectionStack.length - 1].name;

          if (!openName || name != openName) {
            throw debug(new Error('Section named "' + name + '" was never opened'), template, line, options.file);
          }

          var section = sectionStack.pop();

          code.push('";', '\n    return buffer;', '\n  };', '\n})();');

          if (section.inverted) {
            code.push("\nbuffer += renderSection(name,stack,callback,true);");
          } else {
            code.push("\nbuffer += renderSection(name,stack,callback);");
          }

          code.push('\nbuffer += "');
        };

      var sendPlain = function(source) {
          code.push('";', updateLine, '\nbuffer += lookup("' + trim(source) + '",stack,"");', '\nbuffer += "');
        };

      var sendEscaped = function(source) {
          code.push('";', updateLine, '\nbuffer += escapeHTML(lookup("' + trim(source) + '",stack,""));', '\nbuffer += "');
        };

      var line = 1,
        c, callback;
      for (var i = 0, len = template.length; i < len; ++i) {
        if (template.slice(i, i + openTag.length) === openTag) {
          i += openTag.length;
          c = template.substr(i, 1);
          updateLine = '\nline = ' + line + ';';
          nextOpenTag = openTag;
          nextCloseTag = closeTag;
          hasTag = true;

          switch (c) {
          case "!":
            // comment
            i++;
            callback = null;
            break;
          case "=":
            // change open/close tags, e.g. {{=<% %>=}}
            i++;
            closeTag = "=" + closeTag;
            callback = setTags;
            break;
          case ">":
            // include partial
            i++;
            callback = includePartial;
            break;
          case "#":
            // start section
            i++;
            callback = openSection;
            break;
          case "^":
            // start inverted section
            i++;
            callback = openInvertedSection;
            break;
          case "/":
            // end section
            i++;
            callback = closeSection;
            break;
          case "{":
            // plain variable
            closeTag = "}" + closeTag;
            // fall through
          case "&":
            // plain variable
            i++;
            nonSpace = true;
            callback = sendPlain;
            break;
          default:
            // escaped variable
            nonSpace = true;
            callback = sendEscaped;
          }

          var end = template.indexOf(closeTag, i);

          if (end === -1) {
            throw debug(new Error('Tag "' + openTag + '" was not closed properly'), template, line, options.file);
          }

          var source = template.substring(i, end);

          if (callback) {
            callback(source);
          }

          // Maintain line count for \n in source.
          var n = 0;
          while (~ (n = source.indexOf("\n", n))) {
            line++;
            n++;
          }

          i = end + closeTag.length - 1;
          openTag = nextOpenTag;
          closeTag = nextCloseTag;
        } else {
          c = template.substr(i, 1);

          switch (c) {
          case '"':
          case "\\":
            nonSpace = true;
            code.push("\\" + c);
            break;
          case "\r":
            // Ignore carriage returns.
            break;
          case "\n":
            spaces.push(code.length);
            code.push("\\n");
            stripSpace(); // Check for whitespace on the current line.
            line++;
            break;
          default:
            if (isWhitespace(c)) {
              spaces.push(code.length);
            } else {
              nonSpace = true;
            }

            code.push(c);
          }
        }
      }

      if (sectionStack.length != 0) {
        throw debug(new Error('Section "' + sectionStack[sectionStack.length - 1].name + '" was not closed properly'), template, line, options.file);
      }

      // Clean up any whitespace from a closing {{tag}} that was at the end
      // of the template without a trailing \n.
      stripSpace();

      code.push('";', "\nreturn buffer;", "\n} catch (e) { throw {error: e, line: line}; }");

      // Ignore `buffer += "";` statements.
      var body = code.join("").replace(/buffer \+= "";\n/g, "");

      if (options.debug) {
        if (typeof console != "undefined" && console.log) {
          console.log(body);
        } else if (typeof print === "function") {
          print(body);
        }
      }

      return body;
    }

    /**
     * Used by `compile` to generate a reusable function for the given `template`.
     */

    function _compile(template, options) {
      var args = "view,partials,stack,lookup,escapeHTML,renderSection,render";
      var body = parse(template, options);
      var fn = new Function(args, body);

      // This anonymous function wraps the generated function so we can do
      // argument coercion, setup some variables, and handle any errors
      // encountered while executing it.
      return function(view, partials) {
        partials = partials || {};

        var stack = [view]; // context stack
        try {
          return fn(view, partials, stack, lookup, escapeHTML, renderSection, render);
        } catch (e) {
          throw debug(e.error, template, e.line, options.file);
        }
      };
    }

    // Cache of pre-compiled templates.
    var _cache = {};

    /**
     * Clear the cache of compiled templates.
     */

    function clearCache() {
      _cache = {};
    }

    /**
     * Compiles the given `template` into a reusable function using the given
     * `options`. In addition to the options accepted by Mustache.parse,
     * recognized options include the following:
     *
     *   - cache    Set `false` to bypass any pre-compiled version of the given
     *              template. Otherwise, a given `template` string will be cached
     *              the first time it is parsed
     */

    function compile(template, options) {
      options = options || {};

      // Use a pre-compiled version from the cache if we have one.
      if (options.cache !== false) {
        if (!_cache[template]) {
          _cache[template] = _compile(template, options);
        }

        return _cache[template];
      }

      return _compile(template, options);
    }

    /**
     * High-level function that renders the given `template` using the given
     * `view` and `partials`. If you need to use any of the template options (see
     * `compile` above), you must compile in a separate step, and then call that
     * compiled function.
     */

    function render(template, view, partials) {
      return compile(template)(view, partials);
    }

  })(Mustache);

  return Mustache;
});
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
 * @class Brix.Mu
 * @extend Mustache
 * @static
 */
KISSY.add("brix/core/mu", function(S, Mustache) {
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
            if (typeof(o) === "object") {
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
            addFns(template, data);
            return Mustache.to_html.apply(this, arguments);
        },
        name: Mustache.name,
        version: Mustache.version,
        tags: Mustache.tags,
        parse: Mustache.parse,
        compile: Mustache.compile,
        render: Mustache.render,
        clearCache: Mustache.clearCache
    };
}, {
    requires: ["./mustache"]
});
KISSY.add("brix/core/tmpler", function(S, Mustache, Node,UA) {
    var $ = Node.all;
    /**
     * 用以给brick打上id的标记,brick有id则返回
     * @method _stamp
     * @param el
     * @return {string}
     * @ignore
     */

    function _stamp(el, prefix) {
        prefix = prefix || 'brick_';
        if (!el.attr('id')) {
            el.attr('id', S.guid('brix_' + prefix));
        }
        return el.attr('id');
    }

    /**
     * 复原替换的模板
     * @param  {string} html 原html
     * @param  {Array} arr  保存数据的数组
     * @return {string}      替换后的html
     * @ignore
     */

    function _recovery(html) {
        html = html.replace(/(?:<|&lt;)!--({{[^}]+}})--(?:>|&gt;)/g, '$1').replace(/\s(src|href)\s*=\s*(['"])(.*?\{.+?)\2/g,' data-templatable-$1=$2$3$2');
        //去掉attr=""
        /*html = html.replace(/(\{{2,3}[\^#~](.+?)\}{2,3})\=\"\"/g, '$1');

        //对if语句的还原处理
        html = html.replace(/(\{{2,3}[\^#~]?)iftmplbrick\_(\d+)(\}{2,3})/g, function(w, i, j, k) {
            return i + arr[parseInt(j,10)] + k;
        });*/
        //对href和src语句的还原处理
        /*html = html.replace(/(href|src|style)=("|')("|')/ig,"");
        html = html.replace(/(\{{2,3}[\^#~]?)href\_src\_style\_tmplbrick\_(\d+)(\}{2,3})/g, function(w, i, j, k) {
            return arr[parseInt(j,10)];
        });*/
        //将~符号替换回/，完美了。
        //html = html.replace(/(\{{2,3})~/g, '$1/');


        
        return html;
    }

    /**
     * 模板解析器，对传入的模板通过钩子进行分析，结合 Mustache 和数据给出 html 片段。
     * @class Brix.Tmpler
     * @param {String}  tmpl    模板字符串
     * @param {Boolean} isParse 是否需要对模板进行解析
     * @requires Brix.Mu
     */

    function Tmpler(tmpl, isParse) {
        if (tmpl && (isParse !== false)) {
            this.tmpls = [];
            this._praseTmpl(tmpl);
        } else {
            this.tmpl = tmpl;
        }
    }

    S.extend(Tmpler, Object, {
        /**
         * 解析模板
         * @param  {String} tmpl 模板字符串
         * @private
         */
        _praseTmpl: function(tmpl) {
            var self = this,inDom = false,node,tmplNode;
            if(typeof tmpl === 'string'){
                if(tmpl.charAt(0)==='.'||tmpl.charAt(0)==='#'||tmpl==='body'){
                    node = $(tmpl);
                }
            }
            else{
                node = tmpl;
            }

            if(node){
                if(node.item(0)[0].nodeName.toUpperCase()=='SCRIPT'){
                    //如果是script节点，则直接取html
                    tmpl= node.item(0).html()
                }
                else{
                    inDom = true;
                }
            }
            
            if (!inDom) {
                //牛逼的正则啊
                /*var reg = /(\{{2,3}\#(.+?)\}{2,3})\s*([\s\S]*)?\s*((\{{2,3})\/\2(\}{2,3}))/g;
                while (reg.test(tmpl)) {
                    //这里为什么要前后加空格
                    tmpl = tmpl.replace(reg, '$1$3$5~$2$6');
                    //console.log(reg.lastIndex);
                    //不重置位置，我了个去，ie7，8有问题
                    reg.lastIndex = 0;
                }
                //对if语句的处理
                var arr = [];
                tmpl = tmpl.replace(/(\{{2,3}[\^#~])?(if\(.*?\))(\}{2,3})?/ig, function(w, i, j, k, m, n) {
                    var index = S.indexOf(j, arr),
                        name = 'iftmplbrick_';
                    if (index < 0) {
                        name += arr.length;
                        arr.push(j);
                    } else {
                        name += index;
                    }
                    return i + name + k;
                });*/


                //对href、src style的处理
                /*tmpl = tmpl.replace(/((href|src|style)=("|')(.*?)("|'))/ig,function(w,i){
                    var index = S.indexOf(i, arr),
                        name = 'href_src_style_tmplbrick_';
                    if (index < 0) {
                        name += arr.length;
                        arr.push(i);
                    } else {
                        name += index;
                    }
                    return "{{#"+name+"}}"  ;
                });*/


                tmpl = tmpl.replace(/({[^}]+}})/g, '<!--$1-->').replace(/\s(src|href)\s*=\s*(['"])(.*?\{.+?)\2/g,' data-templatable-$1=$2$3$2');

                node = new Node(tmpl);

                tmplNode = $('<div></div>').append(node);
                if(node.length>1){
                    this.id = _stamp(tmplNode);
                }
                else{
                    this.id = _stamp(node);
                }
                
            } else {
                tmplNode = node;
                this.id = _stamp(tmplNode);
            }
            
            var tmplTargetNodes = tmplNode.all('[bx-tmpl-source]');
            tmplTargetNodes.each(function(node) {
                var selector = node.attr('bx-tmpl-source'),
                    id= _stamp(node,'tmpl_'),
                    temptmplNode = tmplNode.one(selector).clone(true);
                temptmplNode.removeAttr('id');
                temptmplNode.insertBefore(node);
                node.remove();
                temptmplNode.attr('id',id);
            });
            if (!inDom) {
                self._buildTmpls(tmplNode);
                self.tmpl = _recovery(tmplNode.html());
                node.remove();
                tmplNode.remove();
            }
            tmplNode = null;
            node = null;
            this.inDom = inDom;
        },
        /**
         * 对节点中的bx-tmpl解析，构建模板和数据配置
         * @param  {Node} el 容器节点
         * @private
         */
        _buildTmpls:function(el){
            var self = this,
                tmplNodes = el.all('[bx-tmpl]');
            if (el.hasAttr('bx-tmpl')) {
                tmplNodes = tmplNodes.add(el[0]);
            }
            tmplNodes.each(function(tmplNode) {
                var tmplId = _stamp(tmplNode, 'tmpl_'),
                    datakey = tmplNode.attr('bx-datakey'),
                    tmpl = _recovery(tmplNode.html());
                self.tmpls.push({
                    id: tmplId,
                    datakey: datakey ? datakey.split(',') : [],
                    tmpler: new Tmpler(tmpl, false)
                });
            });
            tmplNodes = null;
        },

        /**
         * 给brick添加模板
         * @param {Array} arr 模板数组
         * @return {Boolean} 是否添加成功
         */
        addTmpl: function(arr) {
            var self = this;
            S.each(arr, function(m) {
                self.tmpls.push({
                    id: m.id,
                    datakey: m.datakey.split(','),
                    tmpler: new Tmpler(m.tmpl, false)
                });
            });
            return true;
        },

        /**
         * 获取模板字符串
         * @return {String} 模板字符串
         */
        getTmpl: function() {
            return this.tmpl;
        },


        /**
         * 模板和数据渲染成字符串
         * @param  {Object} data 数据
         * @return {String}      html片段
         */
        to_html: function(data) {
            return Mustache.to_html(this.getTmpl(), data);
        }
    });
    return Tmpler;
}, {
    requires: ['./mu', 'node','ua', 'sizzle']
});

KISSY.add("brix/core/dataset", function(S, Base) {
    /**
     * Brix Dataset 提供数据管理；为所有组件提供基于数据事件的编程
     * @extends KISSY.Base
     * @class Brix.Dataset
     */
    function Dataset() {
        Dataset.superclass.constructor.apply(this, arguments);
    }
    Dataset.ATTRS = {
        /**
         * 数据对象
         * @cfg {Object}
         */
        data: {}
    };
    S.extend(Dataset, Base, {
        /**
         * 扩展数据，用于 mastache 渲染
         * @param {Object} renderer 代理方法对象
         * @param {Object} context  当前上下文环境
         * @param {String} prefix   前缀，防止相同 brick 方法覆盖
         */
        setRenderer: function(renderer, context, prefix) {
            var self = this,
                data = self.get('data'),
                type, wrapperName;
            prefix = prefix ? prefix + '_' : '';
            if (renderer) {
                var foo = function(type, wrapperName) {
                        var name = prefix + type + '_' + wrapperName,
                            fn = renderer[type][wrapperName];
                        data[name] = function() {
                            return fn.call(this, context, type);
                        };
                    };
                for (type in renderer) {
                    for (wrapperName in renderer[type]) {
                        foo(type, wrapperName);
                    }
                }
            }
        }
    });
    return Dataset;
}, {
    requires: ["base"]
});
KISSY.add("brix/core/chunk", function(S, Node, UA, Base, Dataset, Tmpler) {
    var $ = Node.all;
     /**
     * Brix Chunk,Brick和Pagelet类的基类,
     * 作为组件底层，完成渲染、数据更新、销毁操作，是模板解析器（Tmpler）和数据管理器（Dataset）的调度者。
     * @extends KISSY.Base
     * @class Brix.Chunk
     */
    function Chunk() {
        Chunk.superclass.constructor.apply(this, arguments);
        this._buildTmpler();
        if(!this.get('id')){
            this.set('id','brix_'+S.guid());
        }
    }

    /**
     * The default set of attributes which will be available for instances of this class, and
     * their configuration
     *
     * By default if the value is an object literal or an array it will be 'shallow' cloned, to
     * protect the default value.
     *
     *      for example:
     *      @example
     *      {
     *          x:{
     *              value: // default value
     *              valueFn: // default function to get value
     *              getter: // getter function
     *              setter: // setter function
     *          }
     *      }
     * see:
     * <a href="http://docs.kissyui.com/kissy/docs/#!/api/KISSY.Base">http://docs.kissyui.com/kissy/docs/#!/api/KISSY.Base</a>
     *
     * @property ATTRS
     * @member KISSY.Base
     * @static
     * @type {Object}
     */

    Chunk.ATTRS = {
        /**
         * 当前pagelet或者brick的唯一标识
         * @cfg {String}
         */
        id:{
            value:false
        },
        /**
         * 组件节点
         * @cfg {String}
         */
        el: {
            getter: function(s) {
                if (S.isString(s)) {
                    s = $(s);
                }
                return s;
            }
        },
        /**
         * 容器节点
         * @cfg {String}
         */
        container: {
            value: 'body',
            getter: function(s) {
                if (S.isString(s)) {
                    s = $(s);
                }
                return s;
            }
        },
        /**
         * 模板代码，如果是已经渲染的html元素，则提供渲染html容器节点选择器
         * @cfg {String}
         */
        tmpl: {
            value: false
        },
        /**
         * 解析后的模板对象
         * @type {Brix.Tmpler}
         */
        tmpler:{
            value:false
        },
        /**
         * 是否已经渲染
         * @type {Boolean}
         */
        rendered: {
            value: false
        },
        /**
         * 是否自动渲染
         * @cfg {Boolean}
         */
        autoRender: {
            value: true 
        },
        /**
         * 模板数据
         * @cfg {Object}
         */
        data:{
            value:false
        },
        /**
         * 解析后的数据对象
         * @type {Brix.Dataset}
         */
        dataset:{
            value:false
        }
    };

    S.extend(Chunk, Base, {
        /**
         * 构建模板解析器
         * @private
         */
        _buildTmpler: function() {
            var self = this,
                tmpler = self.get('tmpler');
            if(!tmpler){
                var tmpl = self.get('tmpl');
                if(tmpl){
                    tmpler = new Tmpler(tmpl);
                    self.set('tmpler',tmpler);
                    if(tmpler.inDom){
                        self.set('el',tmpl);
                    }
                }
            }
            if(tmpler&&!tmpler.inDom){
                self._buildDataset();
            }
        },
        /**
         * 构建数据管理器
         * @private
         */
        _buildDataset: function() {
            var self = this;
            var dataset = self.get('dataset');
            if(!dataset){
                var data = self.get('data') || {};//原始数据
                data = S.clone(data); //数据深度克隆
                dataset = new Dataset({
                    data: data
                });
                self.set('dataset',dataset);//设置最新的数据集合
            }
            dataset.on('afterDataChange', function(e) {
                self._render(e.subAttrName, e.newVal);
            });
        },

        /**
         * 给brick添加模板
         * @param {Array} arr 模板数组
         * @return {Boolean} 是否添加成功
         */
        addTmpl: function(arr) {
            var self =  this,tmpler = self.get('tmpler');
            if(tmpler){
                return tmpler.addTmpl(arr);
            }
            else{
                return false;
            }
        },

        /**
         * 设置数据，并刷新模板数据
         * @param {String} datakey 需要更新的数据对象key
         * @param {Object} data    数据对象
         */
        setChunkData: function(datakey, data) {
            var self = this,
                dataset = self.get('dataset');
            if(dataset){
                data = S.clone(data);
                dataset.set('data.' + datakey, data);
            }
        },
        /**
         * 将模板渲染到页面
         */
        render: function() {
            var self = this;
            if (!self.get("rendered")) {
                var dataset = self.get('dataset');
                if(dataset){
                    self._render('data', dataset.get('data'));
                }
                self.set("rendered", true);
                self.fire('rendered');
            }
        },
        /**
         * 将模板渲染到页面
         * @param  {String} key  更新的数据对象key
         * @param  {Object} data 数据
         * @private
         */
        _render: function(key, data) {
            var self = this,tmpler = self.get('tmpler');
            if(tmpler){
               if (key.split('.').length > 1) {
                    if(self.get("rendered")){
                        //已经渲染，才能局部刷新
                        key = key.replace(/^data\./, '');
                        self._renderTmpl(tmpler.tmpls,key, data);
                    }
                } else {
                    if(!tmpler.inDom){
                        var container = self.get('container');
                        var el = self.get('el');
                        var html = tmpler.to_html(data);
                        if((!el||el.length==0)){
                            var elID = self.get('id');
                            if(UA.ie<=8){
                                var node = new Node('<div />');
                                container.append(node);
                                node.html(html);
                                var childs = node[0].childNodes;
                                if(childs.length>1){
                                    node.attr('id',elID);
                                }
                                else{
                                    elID = childs[0].id || elID;
                                    childs[0].id = elID;
                                    while(childs.length>0){
                                        container[0].appendChild(childs[0]);
                                    }
                                    node.remove();
                                }
                            }
                            else{
                                var node = new Node(html);
                                if(node.length>1){
                                    node = $('<div id="'+elID+'"></div>').append(node);
                                }
                                else{
                                    elID = node.attr('id') || elID;
                                    node.attr('id',elID);
                                }
                                container.append(node);
                            }
                            self.set('el','#'+elID);
                        }
                        else{
                            if(UA.ie<=8){
                                var node = new Node('<div />');
                                container.append(node);
                                node.html(html);
                                while(node[0].childNodes.length>0){
                                    container[0].appendChild(node[0].childNodes[0]);
                                }
                                node.remove();
                            }
                            else{
                                container.append(html);
                            }
                        }
                    }
                } 
            }
        },
        /**
         * 渲染模板
         * @param  {Array} tmpls  tmpls集合
         * @param  {String} key   更新的数据对象key
         * @param  {Object} data 数据
         * @private
         */
        _renderTmpl: function(tmpls, key, data) {
            S.each(tmpls, function(o) {
                var node = S.one('#' + o.id);
                if (node&&S.inArray(key, o.datakey)) {
                    //这里数据是否需要拼装，还是传入完整的数据，待考虑
                    var newData = {};
                    S.each(o.datakey, function(item) {
                        var tempdata = data,
                            temparr = item.split('.'),
                            length = temparr.length,
                            i = 0;
                        while (i !== length) {
                            tempdata = tempdata[temparr[i]];
                            i++;
                        }
                        newData[temparr[length - 1]] = tempdata;
                        tempdata = null;
                    });
                    node.html(o.tmpler.to_html(newData));
                    newData = null;
                }
            });
        }
    });
    return Chunk;
}, {
    requires: ["node",'ua', "base", "./dataset", "./tmpler"]
});

KISSY.add("brix/core/brick", function(S, Chunk) {
    function normFn(self, f) {
        if (S.isString(f)) {
            return self[f];
        }
        return f;
    }
    /**
     * Brix Brick 组件基类，完成组件渲染后的事件代理（既行为）。
     * initialize是组件在渲染后的初始化方法，destructor是析构方法
     * @extends Brix.Chunk
     * @class Brix.Brick
     */
    function Brick() {
        var self = this;
        self.pagelet = arguments[0] ? arguments[0].pagelet : null; //pagelet的引用
        Brick.superclass.constructor.apply(this, arguments);

        var id = self.get('id'),
            tmpler = self.get('tmpler');
        var constt = self.constructor;

        if(tmpler&&!tmpler.inDom){
            while(constt.NAME!='Brick'){
                var renderers = constt.RENDERERS;
                if (renderers) {
                    self.get('dataset').setRenderer(renderers, self, id);
                }
                constt = constt.superclass.constructor;
            }
        }
        self.on('rendered', function() {
            var main,extChains = [];
            constt = self.constructor;
            while(constt.NAME!='Brick'){
                if (constt.prototype.hasOwnProperty('initialize') && (main = constt.prototype['initialize'])) {
                    extChains.push(main);
                }
                constt = constt.superclass.constructor;
            }
            for (var i = extChains.length - 1; i >= 0; i--) {
                extChains[i] && extChains[i].call(self);
            }
            self._bindEvent();
        });

        if (self.get('autoRender')||!tmpler||tmpler.inDom){
            self.render();
        }
    }

    /**
     * 用来标识Brick
     * @property NAME
     * @static
     * @type {String}
     */
    Brick.NAME = 'Brick';

    /**
     * pagelet的实例
     * @property pagelet
     * @type {Object}
     */


    /**
     * 对外方法配置
     * 
     *
     *      Brick.METHODS = {
     *          method1:function(){
     *                  
     *          }
     *      }
     *      S.augment(Brick, Brick.METHODS)
     *      
     *
     * @property METHODS
     * @static
     * @type {Object}
     */
    
    /**
     * 节点代理事件
     * 
     *
     *      Brick.EVENTS = {
     *          'selector':{
     *              'eventtype':function(){
     *                  
     *               }
     *           }
     *      }
     *      
     *
     * @property EVENTS
     * @static
     * @type {Object}
     */
    
    /**
     * DOCUMENT节点代理事件
     *
     *
     *      Brick.DOCEVENTS = {
     *          'selector':{
     *              'eventtype':function(){
     *                  
     *               }
     *           }
     *      }
     *      
     *
     * @property DOCEVENTS
     * @static
     * @type {Object}
     */
    
    /**
     * 对外事件申明
     *
     *
     *      Brick.FIRES = {
     *          'selector':'selector'
     *      }
     *      
     *
     * @property FIRES
     * @static
     * @type {Object}
     */
    
    /**
     * 模板数据渲染扩展
     *
     *
     *      Brick.RENDERERS = {
     *          'xx':{
     *              'yy'function(){
     *              
     *              }
     *          }
     *      }
     *      
     *
     * @property RENDERERS
     * @static
     * @type {Object}
     */

    S.extend(Brick, Chunk, {
        /**
         * 初始化方法，提供子类覆盖
         */
        initialize: function() {

        },
        /**
         * 析构函数，用来销毁时候的操作,提供子类覆盖
         */
        destructor:function(){

        },
        /**
         * 移除代理事件
         * @private
         */
        _detachEvent: function() {
            var self = this;
            var constt = self.constructor;

            while(constt.NAME!='Brick'){
                var defaultEvents = constt.EVENTS;
                if (defaultEvents) {
                    self._removeEvents(defaultEvents);
                }
                var defaultDocEvents = constt.DOCEVENTS;
                if (defaultDocEvents) {
                    self._removeEvents(defaultDocEvents, S.one(document));
                }
                constt = constt.superclass.constructor;
            }

            self._undelegateEvents();
            var events = self.get("events");
            if (events) {
                this._removeEvents(events);
            }

            constt = self.constructor;
            while(constt.NAME!='Brick'){
                if(constt.prototype.hasOwnProperty('destructor')){
                    constt.prototype.destructor.apply(self);
                }
                constt = constt.superclass.constructor;
            }
        },
        /**
         * 绑定代理事件
         * @private
         */
        _bindEvent: function() {
            var self = this;
            var constt = self.constructor;
            while(constt.NAME!='Brick'){
                //组件默认事件代理
                //方式一
                var defaultEvents = constt.EVENTS;
                if (defaultEvents) {
                    this._addEvents(defaultEvents);
                }
                //代理在全局的页面上
                var defaultDocEvents = constt.DOCEVENTS;
                if (defaultDocEvents) {
                    this._addEvents(defaultDocEvents, S.one(document));
                }
                constt = constt.superclass.constructor;
            }

            //方式二
            self._delegateEvents();

            //用户使用组件中的自定义事件代理
            var events = self.get("events");
            if (events) {
                this._addEvents(events);
            }
        },
        // events: {
        //     //此事件代理是原生的页面bxclick等事件的代理
        // },
        /**
         * 移除事件代理
         * @param  {Object} events 事件对象，参见EVENTS属性
         * @private
         */
        _removeEvents: function(events, el) {
            el = el || this.get("el");
            for (var selector in events) {
                var event = events[selector];
                for (var type in event) {
                    var callback = normFn(this, event[type]);
                    if (selector === "") {
                        el.detach(type, callback, this);
                    } else {
                        el.undelegate(type, selector, callback, this);
                    }
                }
            }
        },
        /**
         * 添加事件代理绑定
         * @param  {Object} events 事件对象，参见EVENTS属性
         * @private
         */
        _addEvents: function(events, el) {
            el = el || this.get("el");
            for (var selector in events) {
                var event = events[selector];
                for (var type in event) {
                    var callback = normFn(this, event[type]);
                    if (selector === "") {
                        el.on(type, callback, this);
                    } else {
                        el.delegate(type, selector, callback, this);
                    }
                }
            }
        },
        /**
         * 原生事件代理
         * @private
         */
        _delegateEvents: function() {
            var events = this.events;
            var node = this.get("el")[0];
            var that = this;
            for (var _type in events) {
                (function() {
                    var type = _type;
                    node["on" + type] = function() {
                        var event = arguments[0] || window.event;
                        var target = event.target || event.srcElement;
                        if (target.nodeType !== 1) {
                            target = target.parentNode;
                        }
                        var eventinfo = target.getAttribute("bx" + type);
                        if (eventinfo) {
                            var events = eventinfo.split("|"),
                                eventArr, eventKey;
                            for (var i = 0; i < events.length; i++) {
                                eventArr = events[i].split(":");
                                eventKey = eventArr.shift();

                                // 事件代理,通过最后一个参数,决定是否阻止事件冒泡和取消默认动作
                                var evtBehavior = eventArr[eventArr.length - 1],
                                    evtArg = false;
                                if (evtBehavior === '_halt_' || evtBehavior === '_preventDefault_') {
                                    event.preventDefault ? event.preventDefault() : (event.returnValue = false);
                                    evtArg = true;
                                }
                                if (evtBehavior === '_halt_' || evtBehavior === '_stop_') {
                                    event.stopPropagation ? event.stopPropagation() : (event.cancelBubble = true);
                                    evtArg = true;
                                }
                                if (evtArg) {
                                    eventArr.pop();
                                }
                                if (that.events && that.events[type] && that.events[type][eventKey]) {
                                    that.events[type][eventKey].call(that, target, eventArr); //将事件当前上下文更改成当前实例，和kissy mvc一致。
                                }
                            }
                        }
                        target = null;
                    };
                })();
            }
        },
        /**
         * 取消原生事件代理
         * @private
         */
        _undelegateEvents: function() {
            var events = this.events;
            var node = this.get("el")[0];
            var that = this;
            for (var _type in events) {
                (function() {
                    var type = _type;
                    node["on" + type] = null;
                })();
            }
        },
        /**
         * 销毁组件
         */
        destroy:function(){
            var self = this, 
                tmpler = self.get('tmpler');
            if (tmpler) {
                tmpler.tmpls = null;
            }
            self._detachEvent();
            self.get("el").remove();
            if(self.pagelet){
                delete self.pagelet;
            }
        }
    });
    return Brick;
}, {
    requires: ["./chunk"]
});
KISSY.add("brix/core/pagelet", function(S, Chunk) {
    /**
     * 用以给brick打上id的标记,brick有id则返回
     * @method _stamp
     * @param el
     * @return {string}
     * @ignore
     */

    function _stamp(el, prefix) {
        prefix = prefix || 'brick_';
        if (!el.attr('id')) {
            el.attr('id', S.guid('brix_' + prefix));
        }
        return el.attr('id');
    }
    /**
     * Brix Pagelet 是组件的管理器，实现组件的层次化渲染。
     * 一个页面由多个组件和非组件的HTML片段组成，实际创建过程中需要一个个动态创建，
     * 基于约定为大的原则，采用“钩子”和Mustache，自动化的完成组件渲染和行为附加
     * @extends Brix.Chunk
     * @class Brix.Pagelet
     */
    function Pagelet() {
        Pagelet.superclass.constructor.apply(this, arguments);
        var self = this;
        //初始化属性
        self.isReady = false;
        self.readyList = [];
        self.bricks = [];
        self.isAddBehavior = false;
        //如果是自动渲染，或者已经在dom中，则触发rendered事件
        if (self.get('autoRender')||self.get('tmpler').inDom) {
            self.on('rendered',function(){
                //增加参数回调
                var callback = self.get('callback');
                if(callback&&typeof callback === 'function'){
                    self.ready(callback);
                }
                //自动添加行为渲染
                if(self.get('behavior')){
                    self.addBehavior();
                }
            });
            self.render();
        }
    }
    Pagelet.ATTRS = {
        /**
         * 自动添加组件行为
         * @cfg {Boolean}
         */
        behavior:{
            value:true 
        },
        /**
         * 行为添加完成后的回调方法
         * @cfg {Function}
         */
        callback:{
            value:null
        }
    }
    S.extend(Pagelet, Chunk, {
        /**
         * 获取brick的实例
         * @param  {String} id     brick的id
         * @return {Object}        组件实例
         * @private
         */
        getBrick: function(id, bricks) {
            var self = this,
                brick;
            S.each(self.bricks, function(b) {
                if (b.id === id) {
                    brick = b.brick;
                    return false;
                }
            });
            return brick || null;
        },
        /**
         * 给组件添加行为
         */
        addBehavior: function() {
            var self = this;
            if (self.get('rendered')&&!self.isAddBehavior) {
                self.isAddBehavior = true;
                var el = self.get('el');
                //构建pagelet所有的brick组件
                var bricks = self.bricks = [];
                var brickNodes = el.all('[bx-name]');
                if (el.hasAttr('bx-name')) {
                    brickNodes = brickNodes.add(el[0]);
                }
                brickNodes.each(function(brickNode){
                    var id = _stamp(brickNode),
                        name = brickNode.attr('bx-name'),
                        path = brickNode.attr('bx-path'),
                        config = brickNode.attr('bx-config');
                    config = config ? eval("config=" + config) : {};
                    bricks.push({
                        id :id,
                        name:name,
                        path: path,
                        config: config
                    });
                });

                //构建pagelet需要引用组件js
                if(bricks.length>0){
                    var useList = [];
                    S.each(bricks, function(o) {
                        if(!o.path){
                            o.path = 'brix/gallery/'+o.name+'/';
                        }
                        if(!S.inArray(useList,o.path)){
                            useList.push(o.path);
                        }
                    });
                    //实例化pagelet所有组件
                    S.use(useList.join(','),function(S){
                        var useClassList = arguments;
                        S.each(bricks, function(o) {
                            var id = o.id;
                            var config = S.merge({
                                container:'#'+id,
                                id: id,
                                el: '#' + id,
                                pagelet: self
                            }, o.config);
                            var TheBrick = useClassList[S.indexOf(o.path, useList)+1];
                            var myBrick = new TheBrick(config);
                            o.brick = myBrick;
                        });
                        useClassList = null;
                        self._fireReady();
                    });
                }
                else{
                    self._fireReady();
                }
            }
        },
        /**
         * 渲染完成后需要执行的函数
         * @param {Function} fn 执行的函数
         */
        ready: function(fn) {
            if (this.isReady) {
                fn.call(window, this);
            } else {
                this.readyList.push(fn);
            }
        },
        /**
         * 触发ready添加的方法
         * @private
         */
        _fireReady: function() {
            var self = this;
            if (self.isReady) {
                return;
            }
            self.isReady = true;
            if (self.readyList) {
                var fn, i = 0;
                while (fn = self.readyList[i++]) {
                    fn.call(self);
                }
                self.readyList = null;
            }
        },
        /**
         * 销毁组件或者pagelet
         * @param  {String} id 组件id,如果带了id，销毁组件
         */
        destroy: function(id) {
            var self = this,
                el = self.get('el'),
                tmpler = self.get('tmpler');
            if(id){
                for (var i = 0; i < self.bricks.length; i++) {
                    var o = self.bricks[i];
                    if(id===o.id){
                        self._destroyBrick(o);
                        self.bricks.splice(i,1);
                        return false;
                    }
                };
            }
            else{
                S.each(self.bricks, function(o,i) {
                    self._destroyBrick(o);
                    self.bricks = null;
                });
                if(tmpler){
                     tmpler.tmpls = null;
                }
                el.remove();
            }

            el = null;
        },
        /**
         * 销毁brick引用
         * @param  {Object} o 需要销毁的对象
         * @private
         */
        _destroyBrick: function(o) {
            if (o.brick) {
                o.brick.destroy();
                o.brick = null;
            }
        }
    });
    return Pagelet;
}, {
    requires: ['./chunk']
});
/**
 * Brix配置类 组件框架入口类，在调用Brix组件的时候可以配置cdn地址，组件版本号等
 * @class Brix
 */
(function(S, Brix) {
    var isReady = false,
        readyList = [],
        win = window,
        loc = win.location,
        startsWith = S.startsWith, 
        __pagePath = loc.href.replace(loc.hash, "").replace(/[^/]*$/i, "");
    Brix = win[Brix] = win[Brix] || {};

    //从KISSY源代码提取并改动适合brix的
    /**
     * 相对路径文件名转换为绝对路径
     * @param path
     * @ignore
     */

    function absoluteFilePath(path) {
        path = S.trim(path);

        // path 为空时，不能变成 "/"
        if (path && path.charAt(path.length - 1) != '/') {
            path += "/";
        }

        /**
         * 一定要正则化，防止出现 ../ 等相对路径
         * 考虑本地路径
         * @ignore
         */
        if (!path.match(/^(http(s)?)|(file):/i) && !startsWith(path, "/")) {
            path = __pagePath + path;
        }

        if (startsWith(path, "/")) {
            var loc = win.location;
            path = loc.protocol + "//" + loc.host + path;
        }
        var paths = path.split("/"),
            re = [],
            p;
        for (var i = 0; i < paths.length; i++) {
            p = paths[i];
            if (p == ".") {} else if (p == "..") {
                re.pop();
            } else {
                re.push(p);
            }
        }
        path = re.join("/");
        return path.substring(0, path.length - 1);
    };

    function getBaseInfo() {
        // get path from current script file path
        // notice: timestamp
        var pathReg = /^(.*)brix(-min)?\.js[^/]*/i,
            pathTestReg = /brix(-min)?\.js/i,
            scripts = win.document.getElementsByTagName('script'),
            script = scripts[scripts.length - 1],
            src = absoluteFilePath(script.src),
            pathInfo = script.getAttribute("bx-config");
        if (pathInfo) {
            pathInfo = (new Function("return " + pathInfo))();
        } else {
            pathInfo = {};
        }
        pathInfo.comboPrefix = pathInfo.comboPrefix || '??';
        pathInfo.comboSep = pathInfo.comboSep || ',';

        var comboPrefix = pathInfo.comboPrefix,
            comboSep = pathInfo.comboSep,
            parts = src.split(comboSep),
            path, part0 = parts[0],
            part01, index = part0.indexOf(comboPrefix);

        // no combo
        if (index == -1) {
            path = src.replace(pathReg, '$1');
        } else {
            path = part0.substring(0, index);
            part01 = part0.substring(index + 2, part0.length);
            // combo first
            // notice use match better than test
            if (part01.match(pathTestReg)) {
                path += part01.replace(pathReg, '$1');
            }
            // combo after first
            else {
                S.each(parts, function(part) {
                    if (part.match(pathTestReg)) {
                        path += part.replace(pathReg, '$1');
                        return false;
                    }
                });
            }
        }
        path = path.substring(0, path.lastIndexOf('brix'));
        return S.mix({
            path: path,
            componentsPath:'./',
            importsPath:'./'
        }, pathInfo);
    }
    var defaultOptions = getBaseInfo();
    var debug = ''; //区分src还是dist版本
    var isConfig = false; //是否已经配置过
    S.mix(Brix, {
        /**
         * 配置路径
         * @param  {Object} options [配置对象]
         */
        config: function(options) {
            if (isConfig) {
                return;
            }
            isConfig = true;
            options = KISSY.merge({
                fixed: '',
                //路径修正，brix路劲下存在其他文件夹
                gallery: {
                    //配置组件版本信息
                    //dropdown:'1.0'
                }
            }, defaultOptions, options);
            KISSY.config({
                packages: [{
                    name: "brix",
                    path: options.path,
                    charset: "utf-8"
                },{
                    name: "components",
                    path: options.componentsPath,
                    charset: "utf-8"
                },{
                    name: "imports",
                    path: options.importsPath,
                    charset: "utf-8"
                }]
            });
            KISSY.config({
                map: [
                    [/(.+brix\/)(gallery\/)(.+?)(\/.+?(?:-min)?\.(?:js|css))(\?[^?]+)?$/, function($0, $1, $2, $3, $4, $5) {
                        var str = $1 + options.fixed + $2 + $3;
                        if (options.gallery[$3]) {
                            str += '/' + options.gallery[$3]
                        }
                        if (debug) {
                            $4 = $4.replace('-min', '');
                        }
                        str += $4 + ($5 ? $5 : '');
                        return str;
                    }],
                    [/(.+brix\/)(core.+?)((?:-min)?\.js)(\?[^?]+)?$/, function($0, $1, $2, $3, $4) {
                        var str = $1 + options.fixed;
                        if (debug) {
                            $3 = $3.replace('-min', '');
                        }
                        str += $2 + $3 + ($4 ? $4 : '');
                        return str;
                    }]
                ]
            });
        },
        /**
         * 渲染完成后需要执行的函数
         * @param {Function} fn 执行的函数
         */
        ready: function(fn) {
            if (isReady) {
                fn.call(Brix);
            } else {
                readyList.push(fn);
            }
        },
        /**
         * 触发ready添加的方法
         * @private
         */
        _fireReady: function() {
            if (isReady) {
                return;
            }
            isReady = true;
            if (readyList) {
                var fn, i = 0;
                while (fn = readyList[i++]) {
                    fn.call(Brix);
                }
                readyList = null;
            }
        }
    });
    if (defaultOptions.autoConfig) {
        //自动配置
        Brix.config({});
        //自动实例化pagelet
        //外部调用的S.ready注册的方法中可以直接用Brix.pagelet实例书写业务逻辑
        if (defaultOptions.autoPagelet) {
            S.use('brix/core/pagelet',function(S,Pagelet){
                S.ready(function(){
                    Brix.pagelet = new Pagelet({tmpl:'body'});
                    Brix._fireReady();
                });
            });
            return;
        }
    }
    Brix._fireReady();
})(KISSY, 'Brix');