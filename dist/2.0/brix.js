/*! Brix - v2.0
* https://github.com/etaoux/brix
* Copyright (c) 2013 etaoux; Licensed MIT */
/**
 * Brix配置类 组件框架入口类，在调用Brix组件的时候可以配置cdn地址，组件版本号等
 * <br><a href="../demo/core/brix.html" target="_blank">Demo</a>
 * <br>
 * 引用：
 *
 *     <script type="text/javascript" src="brix.js" bx-config="{autoConfig:true,autoPagelet:true}"></script>
 *
 * bx-config节点说明：<br>
 *     autoConfig：自动配置包和map
 *     autoPagelet：自动渲染body节点下的所有bx-name组件
 *     componentsPath：项目组件包路径
 *     componentsTag：项目组件时间戳
 *     importsPath：项目公用组件包路径
 *     importsTag：项目公用组件时间戳
 *     templateEngine: 模板引擎的包路径，brix内置mustache引擎，并做了扩展，详细看mu.js
 *     gallery：组件版本配置
 *     tag：核心组件的时间戳
 *     debug:是否启用非压缩版本
 *     combine:是否启用combo功能
 *
 * bx-config高级配置：<br>
 *     fixed：对包路径的重写，多用在内部的版本管理（不清楚的不要配）
 * @class Brix
 */
(function(S, Brix) {
    var isReady = false,
        readyList = [],
        win = window,
        loc = win.location,
        startsWith = S.startsWith,
        __pagePath = loc.href.replace(loc.hash, "").replace(/[^\/]*$/i, "");
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
        if(path && path.charAt(path.length - 1) != '/') {
            path += "/";
        }

        /**
         * 一定要正则化，防止出现 ../ 等相对路径
         * 考虑本地路径
         * @ignore
         */
        if(!path.match(/^(http(s)?)|(file):/i) && !startsWith(path, "/")) {
            path = __pagePath + path;
        }

        if(startsWith(path, "/")) {
            var loc = win.location;
            path = loc.protocol + "//" + loc.host + path;
        }
        var paths = path.split("/"),
            re = [],
            p;
        for(var i = 0; i < paths.length; i++) {
            p = paths[i];
            if(p == ".") {} else if(p == "..") {
                re.pop();
            } else {
                re.push(p);
            }
        }
        path = re.join("/");
        return path.substring(0, path.length - 1);
    }

    function getBaseInfo() {
        // get path from current script file path
        // notice: timestamp
        var pathReg = /^(.*)brix(-min)?\.js[^\/]*/i,
            pathTestReg = /brix(-min)?\.js/i,
            scripts = win.document.getElementsByTagName('script'),
            script = scripts[scripts.length - 1],
            src = absoluteFilePath(script.src),
            pathInfo = script.getAttribute("bx-config");
        if(pathInfo) {
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
        if(index == -1) {
            path = src.replace(pathReg, '$1');
        } else {
            path = part0.substring(0, index);
            part01 = part0.substring(index + 2, part0.length);
            // combo first
            // notice use match better than test
            if(part01.match(pathTestReg)) {
                path += part01.replace(pathReg, '$1');
            }
            // combo after first
            else {
                S.each(parts, function(part) {
                    if(part.match(pathTestReg)) {
                        path += part.replace(pathReg, '$1');
                        return false;
                    }
                });
            }
        }
        path = path.substring(0, path.lastIndexOf('brix'));
        return S.mix({
            autoConfig: true,
            path: path,
            componentsPath: './',
            importsPath: './',
            templateEngine:'./mu'
        }, pathInfo);
    }
    var defaultOptions = getBaseInfo();
    var debug = ''; //区分src还是dist版本
    var tag = '20121226'; //KISSY包时间戳
    var version = '2.0'; //版本号
    var isConfig = false; //是否已经配置过
    S.mix(Brix, {
        /**
         * 初始化配置
         * @param  {Object} options 配置对象，详见bx-config配置节点
         */
        config: function(options) {
            if(isConfig) {
                return;
            }
            isConfig = true;
            options = S.merge({
                debug: debug == '@DEBUG@' ? true : false,
                combine:true,//默认开始combine
                tag: tag == '@TAG@' ? '' : tag,
                //路径修正，brix路径下存在其他文件夹
                fixed: version == '@VERSION@' ? '' : version + '/',
                gallery: {
                    //配置组件版本信息
                    //dropdown:'1.0'
                }
            }, defaultOptions, options);
            if(options.fixed == '@VERSION@') {
                options.fixed = '';
            }
            /**
             * brix 的基础路径
             * @type {String}
             */
            Brix.basePath = options.path;
            /**
             * 对包路径的重写
             * @type {String}
             */
            Brix.fixed = options.fixed;
            /**
             * 模板引擎的包路径，内部使用
             * @type {String}
             */
            Brix.templateEngine = options.templateEngine;
            S.config({
                packages: [{
                    name: "brix",
                    path: options.path,
                    combine:options.combine,
                    tag: options.tag,
                    charset: "utf-8"
                }, {
                    name: "components",
                    path: options.componentsPath,
                    combine:options.combine,
                    debug:options.debug,
                    tag: options.componentsTag || options.tag,
                    charset: "utf-8"
                }, {
                    name: "imports",
                    path: options.importsPath,
                    combine:options.combine,
                    debug:options.debug,
                    tag: options.importsTag || options.tag,
                    charset: "utf-8"
                }]
            });
            S.config({
                map: [
                    [/(.+brix\/)(gallery\/)(.+?)(\/.+?(?:-min)?\.(?:js|css))(\?[^?]+)?$/, function($0, $1, $2, $3, $4, $5) {
                        var str = $1 + options.fixed + $2 + $3;
                        if(options.gallery[$3]) {
                            str += '/' + options.gallery[$3];
                        }
                        if(options.debug) {
                            $4 = $4.replace('-min', '');
                        }
                        str += $4 + ($5 ? $5 : '');
                        return str;
                    }],
                    [/(.+brix\/)(core.+?)((?:-min)?\.js)(\?[^?]+)?$/, function($0, $1, $2, $3, $4) {
                        var str = $1 + options.fixed;
                        if(options.debug) {
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
            if(isReady) {
                fn.call(Brix);
            } else {
                readyList.push(fn);
            }
        },
        /**
         * 触发ready添加的方法
         * @private
         */
        _bx_fireReady: function() {
            if(isReady) {
                return;
            }
            isReady = true;
            if(readyList) {
                var fn, i = 0;
                while(fn = readyList[i++]) {
                    fn.call(Brix);
                }
                readyList = null;
            }
        }
    });
    if(defaultOptions.autoConfig) {
        //自动配置
        Brix.config({});
        //自动实例化pagelet
        //外部调用的S.ready注册的方法中可以直接用Brix.pagelet实例书写业务逻辑
        if(defaultOptions.autoPagelet) {
            //延时执行，在打包后的能保证后面的模块已经载入
            S.later(function(){
                S.use('brix/core/pagelet', function(S, Pagelet) {
                    S.ready(function() {
                        /**
                         * 配置autoPagelet时候，会在Brix的全局对象上挂载Pagelet的实例对象，模板为body
                         * @type {Brix.Pagelet}
                         */
                        Brix.pagelet = new Pagelet({
                            tmpl: 'body'
                        });
                        Brix._bx_fireReady();
                    });
                });
            },1);
            return;
        }
    }
    S.ready(function() {
        Brix._bx_fireReady();
    });
}(KISSY, 'Brix'));
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
            //对if判断在vm中出错的兼容。
            template = template.replace(/(\{{2,3})@if/ig,'$1#if');
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
KISSY.add("brix/core/tmpler", function(S, XTemplate, Node) {
    var $ = Node.all;
    /**
     * 模板解析器，对传入的模板通过钩子进行分析，结合 XTemplate 和数据给出 html 片段。
     * @class Brix.Tmpler
     * @param {String}  tmpl    模板字符串
     * @param {Number} level    对模板进行解析的层级，false表示不解析
     * @requires Brix.Mu
     */

    function Tmpler(tmpl, level) {
        this.tmpls = [];
        if(tmpl && (level !== false)) {
            this._bx_praseTmpl(tmpl, level);
        } else {
            this.tmpl = tmpl;
        }
    }

    S.augment(Tmpler, {
        /**
         * 解析模板
         * @param  {String} tmpl  模板字符串
         * @param  {Number} level 对模板进行解析的层级，false表示不解析
         * @private
         */
        _bx_praseTmpl: function(tmpl, level) {
            var self = this,
                inDom = false,
                node, tmplNode;
            if(typeof tmpl === 'string') {
                if(tmpl.charAt(0) === '.' || tmpl.charAt(0) === '#' || tmpl === 'body') {
                    node = $(tmpl);
                }
            } else {
                node = tmpl;
            }

            if(node) {
                if(node.item(0)[0].nodeName.toUpperCase() == 'SCRIPT') {
                    //如果是script节点，则直接取html
                    tmpl = node.item(0).html();
                } else {
                    inDom = true;
                }
            }

            if(!inDom) {
                var r = '<([\\w]+)\\s+[^>]*?bx-tmpl=["\']?([^"\'\\s]+)["\']?\\s+[^>]*?bx-datakey=["\']?([^"\'\\s]+)["\']?[^>]*?>(@brix@)</\\1>';
                while(level--) {
                    r = r.replace('@brix@', '(?:<\\1[^>]*>@brix@</\\1>|[\\s\\S])*?');
                }
                r = r.replace('@brix@', '(?:[\\s\\S]*?)');
                self.reg = r;
                self.tmpl = tmpl;
                self._bx_buildTmpls(self.tmpl);
            }
            self.inDom = inDom;
        },
        /**
         * 对节点中的bx-tmpl解析，构建模板和数据配置
         * @param  {String} tmpl  需要解析的模板
         * @private
         */
        _bx_buildTmpls: function(tmpl) {
            var self = this;
            var r = new RegExp(self.reg, "ig"),
                m;
            while((m = r.exec(tmpl)) !== null) {
                self.tmpls.push({
                    name: m[2],
                    datakey: m[3],
                    tmpler: new Tmpler(m[4], false)
                });
                self._bx_buildTmpls(m[4]);
            }
        },
        /**
         * 添加子模板
         * @param {String} name    模板名称
         * @param {String} datakey 模板对应的数据key
         * @param {String} tmpl    子模板
         */
        addTmpl: function(name, datakey, tmpl) {
            var self = this;
            self.tmpls.push({
                name: name,
                datakey: datakey,
                tmpler: new Tmpler(tmpl, false)
            });
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
        render: function(data) {
            if(typeof XTemplate === 'function'){
                return new XTemplate(this.getTmpl()).render(data);
            }
            else{
                return XTemplate.render(this.getTmpl(),data);
            }
            
        }
    });
    return Tmpler;
}, {
    requires: [Brix.templateEngine, 'node', 'sizzle']
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
            if(renderer) {
                var foo = function(type, wrapperName) {
                        var name = prefix + type + '_' + wrapperName,
                            fn = renderer[type][wrapperName];
                        data[name] = function() {
                            return fn.call(this, context, type);
                        };
                    };
                for(type in renderer) {
                    for(wrapperName in renderer[type]) {
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
KISSY.add("brix/core/chunk", function(S, Node, UA, RichBase, Dataset, Tmpler) {
    var $ = Node.all,
        noop = S.noop;
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

    /**
     * Brix Chunk,Brick和Pagelet类的基类,
     * 作为组件底层，完成渲染、数据更新、销毁操作，是模板解析器（Tmpler）和数据管理器（Dataset）的调度者。
     * @extends KISSY.RichBase
     * @class Brix.Chunk
     */
    var Chunk = RichBase.extend({
        constructor: function Chunk() {
            var self = this;
            Chunk.superclass.constructor.apply(self, arguments);
            var tmpler = self.get('tmpler');
            if(self.get('autoRender') || !tmpler || tmpler.inDom) {
                self.render();
            }
        },

        // change routine from rich-base for uibase
        bindInternal: noop,

        // change routine from rich-base for uibase
        syncInternal: noop,
        /**
         * 初始化,在实例化对象时调用
         * @protected
         */
        initializer: function() {
            var self = this;
            var tmpl = self.get('tmpl');
            if(tmpl) {
                self._bx_buildTmpler(tmpl, self.get('level'));
                var tmpler = self.get('tmpler');
                if(tmpler) {
                    self._bx_buildDataset(self.get('data'));
                    if(tmpler.inDom) {
                        self.set('el', tmpl);
                    }
                }
            }
        },
        /**
         * 构建模板解析器
         * @param {String} tmpl 模板字符串
         * @param {Number} level 模板解析的层级
         * @private
         */
        _bx_buildTmpler: function(tmpl, level) {
            var self = this;
            if(!self.get('isBuidTmpler')) {
                self.set('isBuidTmpler', true);
                var tmpler = new Tmpler(tmpl, level);
                self.set('tmpler', tmpler);
            }
        },
        /**
         * 构建数据管理器
         * @param {Object} data 数据集合
         * @private
         */
        _bx_buildDataset: function(data) {
            var self = this;
            if(!self.get('isBuidDataset')) {
                self.set('isBuidDataset', true);
                data = data || {}; //原始数据
                data = S.clone(data); //数据深度克隆
                var dataset = new Dataset({
                    data: data
                });
                self.set('dataset', dataset); //设置最新的数据集合
                dataset.on('afterDataChange', function(e) {
                    self._bx_render(e.subAttrName, e.newVal);
                });
            }
        },
        /**
         * 销毁（destroy）时候调用
         * @protected
         */
        destructor: function() {
            var self = this,
                tmpler = self.get('tmpler'),
                dataset = self.get('dataset');
            if(tmpler) {
                self.set('tmpler', null);
                delete tmpler.tmpls;
            }
            if(dataset) {
                self.set('dataset', null);
                dataset.detach();
            }
        },

        /**
         * 为子类组件的绑定逻辑，替代1.0版本brix的initialize方法
         * @protected
         * @method
         */
        bindUI: noop,

        /**
         * 同步属性与用户界面
         * @protected
         * @method
         */
        syncUI: noop,

        /**
         * 添加子模板
         * @param {String} name    模板名称
         * @param {String} datakey 模板对应的数据key
         * @param {String} tmpl    子模板
         */
        addTmpl: function(name, datakey, tmpl) {
            var self = this;
            self._bx_buildTmpler('', false);
            self._bx_buildDataset();
            if(name) {
                var tmpler = self.get('tmpler');
                tmpler.addTmpl(name, datakey, tmpl);
            }
        },

        /**
         * 设置数据，并刷新模板数据
         * @param {String} datakey 需要更新的数据对象key
         * @param {Object} data    数据对象
         * @param {Object} [opts]    控制对象，包括以下控制选项
         * @param {Boolean} [opts.silent] 是否触发change事件
         */
        setChunkData: function(datakey, data, opts) {
            var self = this,
                dataset = self.get('dataset');
            if(dataset) {
                data = S.clone(data);
                dataset.set('data.' + datakey, data, opts);
            }
        },
        /**
         * 将模板渲染到页面
         */
        render: function() {
            var self = this;
            if(!self.get("rendered")) {
                /**
                 * @event beforeRenderUI
                 * fired when root node is ready
                 * @param {KISSY.Event.CustomEventObject} e
                 */

                self.fire('beforeRenderUI');
                var dataset = self.get('dataset');
                if(dataset) {
                    self._bx_render('data', dataset.get('data'));
                }

                /**
                 * @event afterRenderUI
                 * fired after root node is rendered into dom
                 * @param {KISSY.Event.CustomEventObject} e
                 */
                self.fire('afterRenderUI');


                self.setInternal("rendered", true);

                /**
                 * @event beforeBindUI
                 * fired before component 's internal event is bind.
                 * @param {KISSY.Event.CustomEventObject} e
                 */

                self.fire('beforeBindUI');
                Chunk.superclass.bindInternal.call(self);
                self.callMethodByHierarchy("bindUI", "__bindUI");
                
                //兼容老的brix render后的初始化函数
                self.callMethodByHierarchy("initialize", "constructor");

                /**
                 * @event afterBindUI
                 * fired when component 's internal event is bind.
                 * @param {KISSY.Event.CustomEventObject} e
                 */

                self.fire('afterBindUI');

                /**
                 * @event beforeSyncUI
                 * fired before component 's internal state is synchronized.
                 * @param {KISSY.Event.CustomEventObject} e
                 */

                self.fire('beforeSyncUI');

                Chunk.superclass.syncInternal.call(self);
                self.callMethodByHierarchy("syncUI", "__syncUI");

                /**
                 * @event afterSyncUI
                 * fired after component 's internal state is synchronized.
                 * @param {KISSY.Event.CustomEventObject} e
                 */

                self.fire('afterSyncUI');

            }
            return self;
        },
        /**
         * 将模板渲染到页面
         * @param  {String} key  更新的数据对象key
         * @param  {Object} data 数据
         * @private
         */
        _bx_render: function(key, data) {
            var self = this,
                tmpler = self.get('tmpler');
            if(tmpler) {
                if(key.split('.').length > 1) {
                    if(self.get("rendered")) {
                        //已经渲染，才能局部刷新
                        key = key.replace(/^data\./, '');
                        self._bx_renderTmpl(tmpler.tmpls, key, data);
                    }
                } else {
                    if(!tmpler.inDom) {
                        var container = self.get('container');
                        var el = self.get('el');
                        var html = S.trim(tmpler.render(data));
                        var node;
                        //下面增加浏览器的判断，
                        //是因为创建dom时候，不同浏览器对自定义标签（比如：vframe）的支持不同。
                        if((!el || el.length === 0)) {
                            var elID = 'brix_' + S.guid();
                            if(UA.ie <= 8) {
                                node = new Node('<div />');
                                container.append(node);
                                node.html(html);
                                var childs = node[0].childNodes;
                                if(childs.length > 1) {
                                    node.attr('id', elID);
                                } else {
                                    elID = childs[0].id || elID;
                                    childs[0].id = elID;
                                    while(childs.length > 0) {
                                        container[0].appendChild(childs[0]);
                                    }
                                    node.remove();
                                    node = null;
                                }
                            } else {
                                node = new Node(html);
                                if(node.length > 1) {
                                    node = $('<div id="' + elID + '"></div>').append(node);
                                } else {
                                    elID = node.attr('id') || elID;
                                    node.attr('id', elID);
                                }
                                container.append(node);
                            }
                            self.set('el', '#' + elID);
                        } else {
                            if(UA.ie <= 8) {
                                node = new Node('<div />');
                                container.append(node);
                                node.html(html);
                                while(node[0].childNodes.length > 0) {
                                    container[0].appendChild(node[0].childNodes[0]);
                                }
                                node.remove();
                                node = null;
                            } else {
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
        _bx_renderTmpl: function(tmpls, key, data) {
            var self = this,
                el = self.get('el');
            S.each(tmpls, function(o) {
                if((',' + o.datakey + ',').indexOf(',' + key + ',') >= 0) {
                    var nodes = el.all('[bx-tmpl=' + o.name + ']');
                    //如果el本身也是tmpl，则加上自己
                    if(el.attr('bx-tmpl') == o.name) {
                        nodes = el.add(nodes);
                    }
                    nodes.each(function(node) {
                        if(node.attr('bx-datakey') == o.datakey) {
                            var newData = {};
                            S.each(o.datakey.split(','), function(item) {
                                var tempdata = data,
                                    temparr = item.split('.'),
                                    length = temparr.length,
                                    i = 0;
                                while(i !== length) {
                                    tempdata = tempdata[temparr[i]];
                                    i++;
                                }
                                newData[temparr[length - 1]] = tempdata;
                                tempdata = null;
                            });
                            S.each(data, function(d, k) {
                                if(S.isFunction(d)) {
                                    newData[k] = d;
                                }
                            });
                            /**
                             * @event beforeRefreshTmpl
                             * 局部刷新前触发
                             * @param {KISSY.Event.CustomEventObject} e
                             */
                            self.fire('beforeRefreshTmpl', {
                                node: node
                            });
                            node.html(S.trim(o.tmpler.render(newData)));
                            /**
                             * @event afterRefreshTmpl
                             * 局部刷新后触发
                             * @param {KISSY.Event.CustomEventObject} e
                             */
                            self.fire('afterRefreshTmpl', {
                                node: node
                            });
                            newData = null;
                        }
                    });
                    nodes = null;
                }
            });
        }
    }, {
        ATTRS: {
            /**
             * 组件节点
             * @cfg {String}
             */
            el: {
                getter: function(s) {
                    if(S.isString(s)) {
                        s = $(s);
                    }
                    return s;
                }
            },
            /**
             * 销毁操作时候的动作，默认remove。
             * 可选none:什么都不做，empty:清空内部html
             * @cfg {String}
             */
            destroyAction:{
                value:'remove'
            },
            /**
             * 容器节点
             * @cfg {String}
             */
            container: {
                value: 'body',
                getter: function(s) {
                    if(S.isString(s)) {
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
            tmpler: {
                value: false
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
            data: {
                value: false
            },
            /**
             * 解析后的数据对象
             * @type {Brix.Dataset}
             */
            dataset: {
                value: false
            },
            /**
             * 子模板解析的层级
             * @cfg {Number}
             */
            level: {
                value: 3
            }
        }
    });
    return Chunk;
}, {
    requires: ["node", 'ua', "rich-base", "./dataset", "./tmpler"]
});
KISSY.add("brix/core/brick", function(S, Chunk, Event) {
    /**
     * Brix Brick 组件基类，完成组件渲染后的事件代理（既行为）。<br>
     * initializer是组件实例化的初始函数，bindUI在渲染后的绑定逻辑,替换原来的initialize方法，destructor是析构方法
     * @extends Brix.Chunk
     * @class Brix.Brick
     */
    var Brick = Chunk.extend({
        initializer: function() {
            var self = this,
                constt = self.constructor;
            while(constt) {
                var renderers = constt.RENDERERS;
                if(renderers) {
                    self.addTmpl();
                    self.get('dataset').setRenderer(renderers, self);
                }
                constt = constt.superclass && constt.superclass.constructor;
            }
            //对原有pagelet的兼容
            self.pagelet = self.get('pagelet');
        },
        bindUI: function() {
            var self = this;
            self._bx_bindEvent();
        },
        /**
         * 移除代理事件
         * @private
         */
        _bx_detachEvent: function() {
            var self = this;
            var constt = self.constructor;

            while(constt) {
                var defaultEvents = constt.EVENTS;
                if(defaultEvents) {
                    self._bx_removeEvents(defaultEvents);
                }
                var defaultDocEvents = constt.DOCEVENTS;
                if(defaultDocEvents) {
                    self._bx_removeEvents(defaultDocEvents, document);
                }
                constt = constt.superclass && constt.superclass.constructor;
            }
            var events = self.get("events");
            if(events) {
                this._bx_removeEvents(events);
            }
        },
        /**
         * 绑定代理事件
         * @private
         */
        _bx_bindEvent: function() {
            var self = this;
            var constt = self.constructor;
            while(constt) {
                //组件默认事件代理
                //方式一
                var defaultEvents = constt.EVENTS;
                if(defaultEvents) {
                    this._bx_addEvents(defaultEvents);
                }
                //代理在全局的页面上
                var defaultDocEvents = constt.DOCEVENTS;
                if(defaultDocEvents) {
                    this._bx_addEvents(defaultDocEvents, document);
                }
                constt = constt.superclass && constt.superclass.constructor;
            }


            //用户使用组件中的自定义事件代理
            var events = self.get("events");
            if(events) {
                this._bx_addEvents(events);
            }
        },
        /**
         * 移除事件代理
         * @param  {Object} events 事件对象，参见EVENTS属性
         * @private
         */
        _bx_removeEvents: function(events, el) {
            el = el || this.get("el");
            for(var selector in events) {
                var es = events[selector];
                for(var type in es) {
                    var callback = es[type];
                    if(selector === "") {
                        Event.detach(el, type, callback, this);
                    } else {
                        Event.undelegate(el, type, selector, callback, this);
                    }
                }
            }
        },
        /**
         * 添加事件代理绑定
         * @param  {Object} events 事件对象，参见EVENTS属性
         * @private
         */
        _bx_addEvents: function(events, el) {
            el = el || this.get("el");
            for(var selector in events) {
                var es = events[selector];
                for(var type in es) {
                    var callback = es[type];
                    if(selector === "") {
                        Event.on(el, type, callback, this);
                    } else {
                        Event.delegate(el, type, selector, callback, this);
                    }
                }
            }
        },
        /**
         * 销毁组件（destroy）时候调用
         * @protected
         */
        destructor: function() {
            var self = this;
            if(self.get('rendered')) {
                self._bx_detachEvent();
                var action = self.get('destroyAction');
                var el = self.get('el');
                switch(action){
                    case 'remove':
                        el.remove();
                        break;
                    case 'empty':
                        el.empty();
                        break;
                }
            }
            if(self.get('pagelet')) {
                self.set('pagelet', null);
            }
        }
    }, {
        ATTRS: {
            pagelet: {
                value: null
            }
        }
    });


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
    return Brick;
}, {
    requires: ["./chunk", "event"]
});
KISSY.add("brix/core/pagelet", function(S, Chunk) {
    /**
     * 用以给brick打上id的标记,brick有id则返回
     * @method _stamp
     * @param el
     * @return {string}
     * @ignore
     */

    function _stamp(el) {
        if(!el.attr('id')) {
            var id;
            //判断页面id是否存在，如果存在继续随机。
            while((id = S.guid('brix_brick_')) && S.one('#' + id)) {}
            el.attr('id', id);
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
    var Pagelet = Chunk.extend({
        initializer: function() {
            var self = this;
            //初始化属性
            self.isReady = false;
            self.readyList = [];
            self.bricks = [];
            self.isAddBehavior = false;
            self.destroyed = false; //是否销毁的标志位。
        },
        bindUI: function() {
            //增加参数回调
            var self = this;
            var callback = self.get('callback');
            if(callback && typeof callback === 'function') {
                self.ready(callback);
            }
            //自动添加行为渲染
            if(self.get('autoBehavior')) {
                self.addBehavior();
            }
        },
        /**
         * 获取brick的实例
         * @param  {String} id     brick的id
         * @return {Object}        组件实例
         */
        getBrick: function(id) {
            var self = this,
                brick;
            S.each(self.bricks, function(b) {
                if(b.id === id) {
                    brick = b.brick;
                    return false;
                }
            });
            return brick || null;
        },
        destroyBrick: function(id) {
            var self = this;
            for(var i = 0; i < self.bricks.length; i++) {
                var o = self.bricks[i];
                if(id === o.id) {
                    self._bx_destroyBrick(o);
                    self.bricks.splice(i, 1);
                    return false;
                }
            }
        },
        /**
         * 销毁brick引用
         * @param  {Object} o 需要销毁的对象
         * @private
         */
        _bx_destroyBrick: function(o) {
            o.destroyed = true;
            if(o.brick) {
                o.brick.destroy && o.brick.destroy();
                o.brick = null;
            }
        },
        /**
         * 给组件添加行为
         */
        addBehavior: function() {
            var self = this;
            if(self.get('rendered') && !self.isAddBehavior) {
                self.isAddBehavior = true;
                var el = self.get('el');
                var brickNodes = el.all('[bx-name]');
                if(el.hasAttr('bx-name')) {
                    brickNodes = el.add(brickNodes);
                }
                self._bx_addBehavior(brickNodes, function(bricks) {
                    self.bricks = bricks;
                }, function() {
                    self._bx_fireReady();
                    self.on('beforeRefreshTmpl', function(e) {
                        e.node.all('[bx-name]').each(function(node) {
                            self.destroyBrick(node.attr('id'));
                        });
                    });
                    self.on('afterRefreshTmpl', function(e) {
                        self._bx_addBehavior(e.node.all('[bx-name]'), function(newBricks) {
                            if(newBricks.length > 0) {
                                self.bricks = self.bricks.concat(newBricks);
                            }
                        });
                    });
                });
            }
        },

        /**
         * 给组件添加行为
         * @param {NodeList} brickNodes 组件node对象集合
         * @param {Function} fn 页面元素解析完成执行的方法,同步执行
         * @param {Function} callback 实例化完成后的回调事件，异步执行
         * @private
         */
        _bx_addBehavior: function(brickNodes, fn, callback) {
            var self = this,
                bxConfig = self.get('config'),
                bricks = [];
            brickNodes.each(function(brickNode) {
                var id = _stamp(brickNode),
                    name = brickNode.attr('bx-name'),
                    path = brickNode.attr('bx-path'),
                    config = brickNode.attr('bx-config');
                config = config ? (new Function("return " + config))() : {};
                if(bxConfig && bxConfig[id]) {
                    S.mix(config, bxConfig[id]);
                }
                bricks.push({
                    id: id,
                    name: name,
                    path: path,
                    config: config
                });
            });

            //构建pagelet需要引用组件js
            if(bricks.length > 0) {
                var useList = [];
                S.each(bricks, function(o) {
                    if(!o.path) {
                        o.path = 'brix/gallery/' + o.name + '/';
                    }
                    if(!S.inArray(useList, o.path)) {
                        useList.push(o.path);
                    }
                });
                self.fire('beforeAddBehavior', {
                    useList: useList
                });
                fn && fn(bricks);
                //实例化pagelet所有组件
                S.use(useList.join(','), function(S) {
                    if(self.destroyed) {
                        return;
                    }
                    var useClassList = arguments;
                    S.each(bricks, function(o) {
                        if(!o.destroyed){
                            var id = o.id;
                            var config = S.merge({
                                container: '#' + id,
                                el: '#' + id,
                                pagelet: self
                            }, o.config);
                            var TheBrick = useClassList[S.indexOf(o.path, useList) + 1];
                            var myBrick = new TheBrick(config);
                            o.brick = myBrick;
                        }
                    });
                    useClassList = null;
                    callback && callback();
                });
            } else {
                fn && fn(bricks);
                callback && callback();
            }

        },

        /**
         * 渲染完成后需要执行的函数
         * @param {Function} fn 执行的函数
         */
        ready: function(fn) {
            if(this.isReady) {
                fn.call(window, this);
            } else {
                this.readyList.push(fn);
            }
        },
        /**
         * 触发ready添加的方法
         * @private
         */
        _bx_fireReady: function() {
            var self = this;
            if(self.isReady) {
                return;
            }
            self.isReady = true;
            if(self.readyList) {
                var fn, i = 0;
                while(fn = self.readyList[i++]) {
                    fn.call(self);
                }
                self.readyList = null;
            }
        },
        /**
         * 销毁组件或者pagelet
         * @param  {String} id 组件id,如果带了id，销毁组件
         */
        destructor: function() {
            var self = this;
            S.each(self.bricks, function(o, i) {
                self._bx_destroyBrick(o);
            });
            self.bricks = null;
            if(self.get('rendered')) {
                var action = self.get('destroyAction');
                var el = self.get('el');
                switch(action) {
                case 'remove':
                    el.remove();
                    break;
                case 'empty':
                    el.empty();
                    break;
                }
                el = null;
            }
            self.destroyed = true;
        }
    }, {
        ATTRS: {
            /**
             * 自动添加组件行为
             * @cfg {Boolean}
             */
            autoBehavior: {
                value: true
            },
            /**
             * 行为添加完成后的回调方法
             * @cfg {Function}
             */
            callback: {
                value: null
            },
            /**
             * 增加pagelet对brick组件的配置增强,示例：{id:{xx:{},yy:{}}}
             * @cfg {Object}
             */
            config: {
                value: {}
            }
        }
    }, 'Pagelet');
    return Pagelet;
}, {
    requires: ['./chunk']
});
KISSY.add("brix/core/demolet", function(S, Pagelet, IO, Node) {
    var $ = Node.all;

    //存储已经加载的CSS
    var hasLoadCSS = {};
    /**
     * 同步载入样式，保证串行加载
     * @param  {String} path css路径
     * @ignore
     */

    function loadCSS(path) {
        if(hasLoadCSS[path]) {
            return false;
        }
        hasLoadCSS[path] = true;
        IO({
            url: path,
            dataType: 'text',
            async: false,
            complete: function(d, textStatus, xhrObj) {
                if(textStatus == 'success') {
                    $('<style>' + d + '</style>').appendTo('head');
                }
            }
        });
    }

    /**
     * 同步获取默认模板和数据，多在demo页构建中使用
     * @param  {String} tmpl 模板文件
     * @param  {Object} data 数据对象
     * @param  {String} s    分割符号，默认‘@’
     * @return {Object}      模板和数据的对象{tmpl:tmpl,data:data}
     * @ignore
     */

    function getTmplData(tmpl, data, s) {
        s = s || '@';
        data = data || {};
        var reg = new RegExp('\\{\\{' + s + '(.+)?\\}\\}', "ig");
        tmpl = tmpl.replace(reg, function($1, $2) {
            S.log($2);
            var str = '';
            var p = $2.replace(/\//ig, '_').replace(/\./ig, '_');
            data[p] = data[p] || {};
            IO({
                url: $2 + 'template.html',
                dataType: 'html',
                async: false,
                success: function(d, textStatus, xhrObj) {
                    str = '{{#' + p + '}}' + d + '{{/' + p + '}}';
                }
            });
            IO({
                url: $2 + 'data.json',
                async: false,
                dataType: 'json',
                success: function(d, textStatus, xhrObj) {
                    for(var k in d) {
                        data[p][k] = d[k];
                    }
                }
            });
            return str;
        });
        return {
            tmpl: tmpl,
            data: data
        };
    }

    /**
     * Brix Demolet 用来构建约定的template.html和data.json的占坑demo页面
     * @extends Brix.Pagelet
     * @class Brix.Demolet
     */
    var Demolet = Pagelet.extend({
        initializer: function() {
            var self = this;
            //在组件渲染前，加载所有的css
            self.on('beforeAddBehavior', function(ev) {
                S.each(self.get('projectCSS'), function(path) {
                    loadCSS(path);
                });
                var useList = ev.useList;
                S.each(useList, function(path) {
                    if(S.startsWith(path,'brix/')) {
                        S.use(path + 'index.css');//核心组件采用模块方式加载
                    } else {
                        var length = 3;
                        if(S.startsWith(path,'imports/')) {
                            //imports有5个层级imports/namespace/componentname/version/index.js
                            length = 5;
                        }
                        var arr = path.split('/');
                        if(arr.length > length) {
                            arr.splice(arr.length - 2);
                            loadCSS(arr.join('/') + '/index.css');
                        }
                        loadCSS(path.substring(0,path.lastIndexOf('/')) + '/index.css');
                    }
                });

            });
        }
    }, {
        ATTRS: {
            /**
             * 项目的样式
             * @cfg {Array}
             */
            projectCSS: {
                value: [],
                setter:function(v){
                    if(S.isArray(v)){
                        return v;
                    }else{
                        return [v];
                    }
                }
            },
            /**
             * 分割符号
             * @cfg {String}
             */
            s: {
                value: '@'
            },
            /**
             * 模板,如果外部需要传入data，请把data属性设置在前，因为这个内部会会对data进行处理
             * @cfg {String}
             */
            tmpl: {
                setter: function(v) {
                    var self = this,
                        data = self.get('data') || {};
                    var tmplData = getTmplData(v, data, self.get('s'));
                    self.set('data', tmplData.data);
                    return tmplData.tmpl;
                }
            }
        }
    }, 'Demolet');
    return Demolet;
}, {
    requires: ['./pagelet', 'ajax', 'node']
});