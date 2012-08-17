/*! Brix - v0.1.0
* https://github.com/etaoux/brix
* Copyright (c) 2012 etaoux; Licensed MIT */

KISSY.add('brix/core/mustache', function(S) {
  /*!
   * mustache.js - Logic-less {{mustache}} templates with JavaScript
   * http://github.com/janl/mustache.js
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
 * Magix扩展的Mustache
 * @module mu
 * @require mustache
 */
/**
 * 扩展的Mustache类<br/>
 * 支持简单的条件判断 如:
<pre>
{{#list}}
&nbsp;&nbsp;&nbsp;&nbsp;{{#if(status==P)}}ID:{{id}},status:&lt;b style='color:green'>通过&lt;/b>{{/if(status==P)}}
&nbsp;&nbsp;&nbsp;&nbsp;{{#if(status==W)}}ID:{{id}},status:等待{{/if(status==W)}}
&nbsp;&nbsp;&nbsp;&nbsp;{{#if(status==R)}}ID:{{id}},status&lt;b style='color:red'>拒绝&lt;/b>{{/if(status==R)}}
{{/list}}
</pre>
 * 对于数组对象可以通过{{__index__}}访问数组下标
 * @class Mu
 * @namespace libs.magix
 * @static*/
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
     * @private
     */

    function _stamp(el, prefix) {
        prefix = prefix || 'brick_';
        if (!el.attr('id')) {
            el.attr('id', S.guid('brix_' + prefix));
        }
        return el.attr('id');
    }
    /**
     * 判断节点是否已经在dom中
     * @param  {HTMLElement} el 检测节点
     * @return {Boolen}      是否包含 el 节点
     */

    function _inDom(el) {
        return el.parentNode && el.parentNode.nodeType!=11;
    }

    /**
     * 复原替换的模板
     * @param  {string} html 原html
     * @param  {Array} arr  保存数据的数组
     * @return {string}      替换后的html
     */

    function _recovery(html, arr) {
        //去掉attr=""
        html = html.replace(/(\{{2,3}[\^#~](.+?)\}{2,3})\=\"\"/g, '$1');

        //对if语句的还原处理
        html = html.replace(/(\{{2,3}[\^#~]?)iftmplbrick\_(\d+)(\}{2,3})/g, function(w, i, j, k) {
            return i + arr[parseInt(j,10)] + k;
        });
        //对href和src语句的还原处理
        html = html.replace(/(href|src|style)=("|')("|')/ig,"");
        html = html.replace(/(\{{2,3}[\^#~]?)href\_src\_style\_tmplbrick\_(\d+)(\}{2,3})/g, function(w, i, j, k) {
            return arr[parseInt(j,10)];
        });
        //将~符号替换回/，完美了。
        html = html.replace(/(\{{2,3})~/g, '$1/');
        return html;
    }

    /**
     * 模板解析器
     * @param {String}  tmpl    模板字符串
     * @param {Boolean} isParse 是否需要对模板进行解析
     */

    function Tmpler(tmpl, isParse) {
        if (tmpl && (isParse !== false)) {
            this.bricks = {};
            this._praseTmpl(tmpl);
        } else {
            this.tmpl = tmpl;
        }
    }

    S.extend(Tmpler, Object, {
        _praseTmpl: function(tmpl) {
            this._buildBricks(tmpl);
        },
        /**
         * 对模板中的brick的解析
         * @param  {String} tmpl 模板字符串
         */
        _buildBricks: function(tmpl) {
            var self = this;
            var node = $(tmpl);
            var tmplNode = null;
            var inDom = _inDom(node[0]); //判断是否已经添加到dom中
            if (!inDom) {
                node.remove();
                //牛逼的正则啊
                var reg = /(\{{2,3}\#(.+?)\}{2,3})\s*([\s\S]*)?\s*((\{{2,3})\/\2(\}{2,3}))/g;
                while (reg.test(tmpl)) {
                    tmpl = tmpl.replace(reg, ' $1$3$5~$2$6 ');
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
                });


                //对href、src style的处理
                tmpl = tmpl.replace(/((href|src|style)=("|')(.*?)("|'))/ig,function(w,i){
                    var index = S.indexOf(i, arr),
                        name = 'href_src_style_tmplbrick_';
                    if (index < 0) {
                        name += arr.length;
                        arr.push(i);
                    } else {
                        name += index;
                    }
                    return "{{#"+name+"}}"  ;
                });

                node = $(tmpl);
                if (node.length > 1) { //如果是多个节点，则创建容器节点
                    node = $('<div></div>').append(node);
                }
                tmplNode = $('<div></div>').append(node);
            } else {
                tmplNode = node;
            }
            this.id = _stamp(node);
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

            var bks = tmplNode.all('[bx-name]:not([bx-parent])');
            bks.each(function(el) {
                self._buildBrick(el, tmplNode, self.bricks, arr);
            });

            if (!inDom) {
                self.tmpl = _recovery(tmplNode.html(), arr);
                node.remove();
                tmplNode.remove();
            }
            tmplNode = null;
            node = null;
            this.inDom = inDom;
        },

        _buildBrick: function(el, container, bricks, arr) {
            var self = this,
                id = _stamp(el),
                name = el.attr('bx-name'),
                path = el.attr('bx-path'),
                config = el.attr('bx-config'),
                tmplNodes = container.all('[bx-tmpl=' + name + ']');
            if (el.hasAttr('bx-tmpl')) {
                tmplNodes = tmplNodes.add(el[0]);
            }
            config = config ? eval("config=" + config) : {};
            bricks[id] = {
                name:name,
                path: path,
                config: config,
                tmpls: [],
                bricks: {}
            };
            var tmpls = bricks[id].tmpls;
            tmplNodes.each(function(tmplNode) {
                var tmplId = _stamp(tmplNode, 'tmpl_'),
                    datakey = tmplNode.attr('bx-datakey'),
                    tmpl = _recovery(tmplNode.html(), arr);
                tmpls.push({
                    id: tmplId,
                    datakey: datakey ? datakey.split(',') : [],
                    tmpler: new Tmpler(tmpl, false)
                });
            });
            tmplNodes = null;
            //递归调用获取子brick
            container.all('[bx-parent=' + name + ']').each(function(subBrick) {
                self._buildBrick(subBrick, container, bricks[id].bricks);
            });
        },

        /**
         * 给brick添加模板
         * @param {string} id  brick的id
         * @param {array} arr 模板数组
         * @return {Boolen} 是否添加成功
         */
        addTmpl: function(id, arr) {
            var self = this,
                ret = false;
            S.each(self.bricks, function(b, k) {
                if (k === id) {
                    S.each(arr, function(m) {
                        b.tmpls.push({
                            id: m.id,
                            datakey: m.datakey.split(','),
                            tmpler: new Tmpler(m.tmpl, false)
                        });
                    });
                    ret = true;
                    return false;
                }
            });
            return ret;
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
    function Dataset() {
        Dataset.superclass.constructor.apply(this, arguments);
    }
    Dataset.ATTRS = {
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
KISSY.add("brix/core/chunk", function(S, Node, Base, Dataset, Tmpler) {
    var $ = Node.all;
    /**
     * brick和pagelet类的基类
     */

    function Chunk() {
        Chunk.superclass.constructor.apply(this, arguments);
        this._buildTmpler();
    }

    Chunk.ATTRS = {
        /*当前pagelet或者brick的唯一标识*/
        id:{
            value:false
        },
        //组件节点
        el: {
            getter: function(s) {
                if (S.isString(s)) {
                    s = $(s);
                    //el节点考虑性能，不缓存，以免对dom节点的引用，引起内存泄漏
                    // this.__set("el", s);
                }
                return s;
            }
        },
        //容器节点
        container: {
            value: 'body',
            getter: function(s) {
                if (S.isString(s)) {
                    s = $(s);
                }
                return s;
            }
        },
        tmpl: { //模板代码，如果是已经渲染的html元素，则提供渲染html容器节点选择器
            value: false
        },
        tmpler:{
            value:false
        },
        rendered: {
            value: false
        },
        //是否自动渲染
        autoRender: {
            value: false
        },
        data:{
            value:false
        },
        //如果提供dataset，则忽略data
        dataset:{
            value:false
        }
    };

    S.extend(Chunk, Base, {
        /**
         * 构建模板解析器
         */
        _buildTmpler: function() {
            var self = this,
                tmpler = self.get('tmpler');
            if(!tmpler){
                var tmpl = self.get('tmpl');
                if(tmpl){
                    tmpler = new Tmpler(tmpl);
                    self.set('tmpler',tmpler);
                    var id = self.get('id');
                    if(!id){
                        self.set('id',tmpler.id);
                        self.set('el','#'+tmpler.id);
                    }
                    else{
                        self.set('el','#'+id);
                    }
                }
            }
            if(tmpler){
                self._buildDataset();
            }
        },
        /**
         * 构建数据管理器
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
         * @param {string} id  brick的id
         * @param {array} arr 模板数组
         * @return {Boolen} 是否添加成功
         */
        addTmpl: function(id, arr) {
            var self =  this,tmpler = self.get('tmpler');
            if(tmpler){
                return tmpler.addTmpl(id, arr);
            }
            else{
                return false;
            }
        },

        /**
         * 设置数据，并刷新模板数据
         * @param {string} datakey 需要更新的数据对象key
         * @param {object} data    数据对象
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
                self.__set("rendered", true);
                self.fire('rendered');
            }
        },
        /**
         * 将模板渲染到页面
         * @param  {string} key     更新的数据对象key
         * @param  {object} data 数据
         */
        _render: function(key, data) {
            var self = this,tmpler = self.get('tmpler');
            if(tmpler){
               if (key.split('.').length > 1) {
                    //部分数据更新
                    key = key.replace(/^data\./, '');
                    self._renderTmpl(tmpler.bricks, key, data);
                } else {
                    if(!tmpler.inDom){
                        var container = self.get('container');
                        container.append(tmpler.to_html(data));
                    }
                } 
            }
        },
        /**
         * 渲染模板
         * @param  {object} bricks  brick对象集合
         * @param  {string} key     更新的数据对象key
         * @param  {object} data 数据
         */
        _renderTmpl: function(bricks, key, data) {
            S.each(bricks, function(b) {
                S.each(b.tmpls, function(o, id) {
                    if (S.inArray(key, o.datakey)) {
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
                        S.one('#' + o.id).html(o.tmpler.to_html(newData));
                        newData = null;
                    }
                });
                this._renderTmpl(b.bricks, key, data);
            }, this);
        }
    });
    return Chunk;
}, {
    requires: ["node", "base", "./dataset", "./tmpler"]
});

KISSY.add("brix/core/brick", function(S, Chunk) {
    function normFn(self, f) {
        if (S.isString(f)) {
            return self[f];
        }
        return f;
    }

    function Brick() {
        var self = this;
        self.pagelet = arguments[0] ? arguments[0].pagelet : null; //pagelet的引用
        Brick.superclass.constructor.apply(this, arguments);

        var id = self.get('id'),
            tmpler = self.get('tmpler'),
            renderer = self.constructor.RENDERER;
        if (tmpler&&renderer) {
            self.get('dataset').setRenderer(renderer, self, id);
        }

        self.on('rendered', function() {
            self.initialize();
            self._bindEvent();
        });

        if(self.pagelet){
            if(self.pagelet.get('rendered')){
                self.render();
            }
            else{
                self.pagelet.on('rendered', function() {
                    self.render();
                }) 
            }
        }
        else{
            if (self.get('autoRender')||!tmpler||tmpler.inDom) {
                self.render();
            }
        }
    }
    Brick.ATTACH = {
        //组件内部的事件代理，
        /*"selector":{
            enventtype:function(e){
                //e：事件对象
                //this:指向当前实例
            }
        }*/
    };
    Brick.ATTRS = {
        events: {
            //此事件代理是KISSY选择器的事件的代理
        }
    };

    S.extend(Brick, Chunk, {
        //初始化方法，提供子类覆盖
        initialize: function() {

        },
        //析构函数，用来销毁时候的操作,提供子类覆盖
        destructor:function(){

        },
        /**
         * 移除代理事件
         */
        _detachEvent: function() {
            var self = this;
            var defaultEvents = self.constructor.ATTACH;
            if (defaultEvents) {
                self._removeEvents(defaultEvents);
            }
            var defaultDocEvents = self.constructor.DOCATTACH;
            if (defaultDocEvents) {
                self._removeEvents(defaultDocEvents, S.one(document));
            }

            self._undelegateEvents();
            var events = self.get("events");
            if (events) {
                this._removeEvents(events);
            }
            self.destructor();
        },
        /**
         * 绑定代理事件
         */
        _bindEvent: function() {
            var self = this;
            //组件默认事件代理
            //方式一
            var defaultEvents = self.constructor.ATTACH;
            if (defaultEvents) {
                this._addEvents(defaultEvents);
            }
            //代理在全局的页面上
            var defaultDocEvents = self.constructor.DOCATTACH;
            if (defaultDocEvents) {
                this._addEvents(defaultDocEvents, S.one(document));
            }

            //方式二
            self._delegateEvents();

            //用户使用组件中的自定义事件代理
            var events = self.get("events");
            if (events) {
                this._addEvents(events);
            }
        },
        events: {
            //此事件代理是原生的页面bxclick等事件的代理
        },
        /**
         * 移除事件代理
         * @param  {object} events 事件对象，参见ATTACH属性
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
         * @param  {object} events 事件对象，参见ATTACH属性
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
            if (tmpler && !S.isEmptyObject(tmpler.bricks)) {
                S.each(tmpler.bricks, function(b, k) {
                    tmpler.bricks[k].brick = null;
                    delete tmpler.bricks[k];
                });
            }
            if(self.pagelet){
                var id = self.get('id');
                self.pagelet.destroy(id);
            }
            else{
                self._detachEvent();
                self.get("el").remove();
            }
            
        }
    });
    return Brick;
}, {
    requires: ["./chunk"]
});
KISSY.add("brix/core/pagelet", function(S, Chunk) {
    function Pagelet() {
        Pagelet.superclass.constructor.apply(this, arguments);
        var self = this;
        //初始化属性
        self.isReady = false;
        self.brickCount = 0;
        self.readyList = [];
        self.isAddBehavior = false;
        //如果是自动渲染，或者已经在dom中，则触发rendered事件
        if (self.get('autoRender')||self.get('tmpler').inDom) {
            self.ready(function(){
                self.render();
            });
        }
    }

    S.extend(Pagelet, Chunk, {
        /**
         * 获取brick的实例
         * @param  {String} id brick的id
         * @return {Object} 组件实例
         */
        getBrick: function(id) {
            return this._getBrick(id, this.get('tmpler').bricks);
        },

        /**
         * 获取brick的实例
         * @param  {String} id     brick的id
         * @param  {Object} bricks 需要渲染的brick集合
         * @return {Object}        组件实例
         */
        _getBrick: function(id, bricks) {
            var self = this,
                brick;
            S.each(bricks, function(b, k) {
                if (k === id) {
                    brick = b.brick;
                    return false;
                } else {
                    brick = self._getBrick(id, b.bricks);
                }
            });
            return brick || null;
        },
        /**
         * 给组件添加行为
         */
        addBehavior: function() {
            if (!this.isAddBehavior) {
                this._addBehavior(this.get('tmpler').bricks);
                this.isAddBehavior = true;
            }
        },
        /**
         * 分层次的渲染brick
         * @param {Object} bricks 需要渲染的brick集合
         */
        _addBehavior: function(bricks) {
            var self = this;
            var foo = function(o,k){
                self.brickCount++;
                if(!o.path){
                    o.path = 'brix/gallery/'+o.name+'/';
                }
                S.use(o.path, function(S, TheBrick) {
                    var config = S.merge({
                        container:'#'+k,
                        id: k,
                        el: '#' + k,
                        pagelet: self
                    }, o.config);
                    var myBrick = new TheBrick(config);
                    o.brick = myBrick;
                    self._addBehavior(o.bricks);
                    self.brickCount--;
                    if (self.brickCount === 0) {
                        self._fireReady();
                    }
                });
            };
            S.each(bricks, function(brick, key) {
                foo(brick, key);
            });
            if (self.brickCount === 0) {
                self._fireReady();
            }
        },
        /**
         * pagelet 渲染完成后需要执行的函数
         * @param {Function} fn 执行的函数
         */
        ready: function(fn) {
            if (this.isReady) {
                fn.call(window, this);
            } else {
                this.readyList.push(fn);
            }
            return this;
        },
        /**
         * 触发ready添加的方法
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
            var self = this,el = self.get('el'),tmpler = self.get('tmpler');
            if (tmpler && !S.isEmptyObject(tmpler.bricks)) {
                context._destroyBricks(tmpler.bricks,id);
            }
            if(!id){
                el.remove();
            }
        },

        /**
         * 销毁brick引用
         * @param  {object} bricks 需要销毁的对象集合
         */
        _destroyBricks: function(bricks,id) {
            var self = this;
            S.each(bricks, function(o,k) {
                if(id){
                    if(id===k){
                        self._destroyBrick(o);
                        delete bricks[k];
                        return false;
                    }
                    else{
                        self._destroyBricks(o.bricks);
                    }
                }
                else{
                    self._destroyBrick(o);
                    delete bricks[k];
                }
            });
        },
        /**
         * 销毁brick引用
         * @param  {object} o 需要销毁的对象
         */
        _destroyBrick: function(o) {
            var self = this;
            if (o.brick) {
                o.brick._detachEvent();
                //递归调用
                self._destroyBricks(o.bricks);
                o.brick.get('el').remove();
                o.brick.pagelet = null;
                o.brick = null;
                delete o;
            }
        }
    });
    return Pagelet;
}, {
    requires: ['./chunk']
});