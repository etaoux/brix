var fs = require('fs');

var args = process.argv.slice(1);
var file = args[1];

if (!file) {
    console.error('no input files');
    process.exit(1);
}

var fileList = [];
var varList = [];

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
            case ';': if (! inParam && ! level) {       chunk.push(c); chunks[++j] = chunk = []; } break
            case '{': if (! inParam) { level ++;        /*这里只分析顶级作用域，就不保留这部分了*/   break }
            case '}': if (! inParam) { level --;        /*同上*/ chunks[j] = chunk = [];         break }
            case '(': if (! inParam) { inParam = true;  chunk.push(c);                           break }
            case ')': if (  inParam) { inParam = false; chunk.push(c);                           break }
            default:                                    chunk.push(c);
        }
    }
    if (level > 0) {
        console.error('Parse error: missing closing `}` in ' + file + ', at ' + i);
        process.exit(1);
    }

    return chunks.map(function (c) { return c.join('').trim() });
}

function check(file) {
    if (-1 !== fileList.indexOf(file)) {
        console.error('Circle reference of file: ' + file);
        process.exit(1);
    }
    fileList.push(file);

    fs.readFile(file, 'utf8', function (err, data) {
        if (err) {
            console.error(err.message);
            process.exit(1);
        }

        var chunks = parser(data);
        //console.log(chunks);

        var match;
        for (var i=0; i<chunks.length; i++) {
            if (match = chunks[i].match(/^@(\w+):/)) {
                match = match[1];
                if (-1 !== varList.indexOf(match)) {
                    console.error('Variables in less.js should be constants. Redefined variable `' + match + '` at ' + file);
                    process.exit(1);
                }
                varList.push(match);
            } else if (match = chunks[i].match(/^@import\s+(?:"([^"]+)"|'([^']+)')/)) {
                //console.log('import: ' + (match[1] || match[2]));
                check(match[1] || match[2]);
            }
        }
    });
}

check(file);