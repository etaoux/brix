#!/usr/bin/env node

// Usage: ./sleepless.js --watch assets/less
// if --watch folder is not provided, current working directory will be used.

var path  = require('path'),
    less = require('less'),
    fs = require('fs')

// console methods wrappers
function say() {
    console.log.apply(this, arguments)
}

function yell() {
    console.warn.apply(this, arguments)
}

function get_dir() {
    var argv = process.argv.slice(2),
        i, arg,
        dir

    for (i = 0; i < argv.length; i++) {
        arg = argv[i]
        if (arg === '--watch') {
            break
        }
    }
    dir = argv[i + 1]
    if (/^-/.test(dir) || !dir) {
        dir = process.cwd()
    }
    else {
        dir = path.resolve(dir)
    }

    return dir
}

function lessc(file) {
    var code = fs.readFileSync(file, 'utf8'),
        css_file = file.replace(/\.less$/, '.css'),
        parser

    parser = new (less.Parser)({
        paths: [file.replace(/\/[^\/]+\.less$/, '')],
        filename: file
    })
    parser.parse(code, function(ev, tree) {
        say('Rendered file', css_file)
        fs.writeFileSync(css_file, tree.toCSS(), 'utf8')
    })
}

function glob_dir(dir) {
    var files = fs.readdirSync(dir),
        i, file,
        less_files = []

    for (i = 0; i < files.length; i++) {
        file = files[i]
        if (/\.less/.test(file)) {
            less_files.push(file)
        }
    }

    return less_files
}

function watch_files(dir, files) {
    var i, file

    for (i = 0; i < files.length; i++) {
        file = path.join(dir, files[i])
        say('Watching file', file)
        fs.watch(file, (function(file) {
            return function(ev, filename) {
                // filename is not always provided
                lessc(file)
            }
        })(file))
    }
}

var dir = get_dir(),
    files

if (fs.existsSync(dir)) {
    files = glob_dir(dir)

    if (files.length > 0) {
        watch_files(dir, files)
    }
    else {
        say('No .less files found, nothing to watch.')
    }
}
else {
    yell('Error: cannot find', dir, 'to watch')
}
