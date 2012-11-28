var fs = require('fs');

var args = process.argv.slice(1);
var FILE = args[1];
var DIR = args[2];

if (!FILE) {
    console.error('no input files');
    process.exit(1);
}

var mixins = {};

function parser(input) {
    var input = input.replace(/\r\n/g, '\n');

    // Split the input into chunks.
    var chunks = [[]];
    var j = 0,
        skip = /[^;"'`\{\}\/\(\)\\]+/g,
        comment = /\/\*(?:[^*]|\*+[^\/*])*\*+\/|\/\/.*/g,
        string = /"((?:[^"\\\r\n]|\\.)*)"|'((?:[^'\\\r\n]|\\.)*)'|`((?:[^`\\\r\n]|\\.)*)`/g,
        level = 0,
        match,
        chunk = chunks[0],
        inParam;

    for (var i = 0, c, cc; i < input.length; i++) {
        skip.lastIndex = i;
        if (match = skip.exec(input)) {
            if (match.index === i) {
                i += match[0].length;
                chunk.push(match[0]);
            }
        }
        c = input.charAt(i);
        comment.lastIndex = string.lastIndex = i;

        if (match = string.exec(input)) {
            if (match.index === i) {
                i += match[0].length;
                chunk.push(match[0]);
                c = input.charAt(i);
            }
        }

        if (!inParam && c === '/') {
            cc = input.charAt(i + 1);
            if (cc === '/' || cc === '*') {
                if (match = comment.exec(input)) {
                    if (match.index === i) {
                        i += match[0].length;
                        // 注释就不保留了.
                        //chunk.push(match[0]);
                        c = input.charAt(i);
                    }
                }
            }
        }

        switch (c) {
            case ';':                                   chunk.push(c); chunks[++j] = chunk = []; break;
            case '{': level ++;                         chunk.push(c); chunks[++j] = chunk = []; break;
            case '}': level --;                         chunk.push(c); chunks[++j] = chunk = []; break;
            case '(': if (! inParam) { inParam = true;  chunk.push(c);                           break; }
            case ')': if (  inParam) { inParam = false; chunk.push(c);                           break; }
            default:                                    chunk.push(c);
        }
    }
    if (level > 0) {
        console.error('Parse error: missing closing `}` in ' + file + ', at ' + i);
        process.exit(1);
    }

    return chunks.map(function (c) { return c.join('').trim() });
}

function scan(file) {
    var chunks = parser(file);

    var match;
    var chunk;
    var stack = [];
    var isPublic;
    for (var i=0; i<chunks.length; i++) {
        chunk = chunks[i];
        isPublic = true;
        switch (chunk.slice(-1)) {
            case '{':
                for (var j=0; j<stack.length; j++) {
                    if (stack[j].slice(0, 1) !== '#') {
                        isPublic = false;
                    }
                }
                if (isPublic) {
                    if (match = chunk.match(/^(\.\w[A-Za-z0-9\-]*)\s*(\([^\)]*\))?\s*{$/)) {
                        while (j && j--) {
                            match[1] = stack[j].trim() + ' > ' + match[1];
                        }

                        mixins[match[1]] = {
                            parm: match[2],
                            count: 0
                        };
                    }
                }
                stack.push(chunk.slice(0, -1));
                break;
            case '}':
                stack.pop();
        }
    }
}

function statistic(file) {
    var chunks = parser(file);

    var match;
    var chunk;
    for (var i=0; i<chunks.length; i++) {
        chunk = chunks[i];
        if (match = chunk.match(/^((?:#\w+\s*>\s*)*\.\w[A-Za-z0-9\-]*)\s*(?:\([^\)]*\))?\s*;$/)) {
            match = match[1];
            if (mixins.hasOwnProperty(match)) {
                mixins[match].count++;
            //} else {
                //console.log(match);
            }
        }
    }
}

function handle(files, handler, callback) {
    var count = 0;
    var length = files.length;

    files.forEach(function (file) {
        fs.readFile(file, 'utf8', function (err, data) {
            if (err) {
                console.error(err.message);
                process.exit(1);
            }

            handler(data);
            if (length === ++count) {
                callback();
            }
        });
    });
}

handle([FILE], scan, function () {
    fs.readdir(DIR, function (err, files) {
        if (err) {
            console.error(err.message);
            process.exit(1);
        }

        for (var i=0; i<files.length; i++) {
            if (files[i].slice(-5) !== '.less') {
                files.splice(i, 1);
                i--;
            } else {
                files[i] = DIR + '/' + files[i];
            }
        }

        handle(files, statistic, function () {
            // sort
            var i, j, k;
            var mixinList = Object.getOwnPropertyNames(mixins);
            var mixin;
            for (i=0; i<mixinList.length; i++) {
                k = i;
                for (j=i+1; j<mixinList.length; j++) {
                    if (mixins[mixinList[k]].count < mixins[mixinList[j]].count) {
                        k = j;
                    }
                }

                j = mixinList[i];
                mixinList[i] = mixinList[k];
                mixinList[k] = j;
            }

            // print
            for (i=0; i<mixinList.length; i++) {
                mixin = mixinList[i];
                console.log(mixins[mixin].count + '\t' + mixin + (mixins[mixin].parm ? ' ' + mixins[mixin].parm : ''));
            }
        });
    });
});
