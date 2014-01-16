/*
 * grunt-galleryjs
 * https://github.com/etaoux/brix
 *
 * Copyright (c) 2012 左莫
 * Licensed under the MIT license.
 */

module.exports = function(grunt) {
    // Grunt utilities.
    var task = grunt.task;
    var file = grunt.file;
    var utils = grunt.utils;
    var log = grunt.log;
    var verbose = grunt.verbose;
    var fail = grunt.fail;
    var option = grunt.option;
    var config = grunt.config;
    var template = grunt.template;

    // external dependencies
    var fs = require('fs');
    var path = require('path');

    // ==========================================================================
    // TASKS
    // ==========================================================================
    grunt.registerMultiTask('galleryjs', 'Compile Gallery JS files.', function() {
        var concatConfig = {
            options: {
                separator: '\n'
            }
        };
        var uglifyConfig = {
            options: {
                beautify: {
                    ascii_only: true
                }
            }
        };

        function foo(srcPath, destPath) {
            var srcFile = srcPath + 'index.js';
            var destFile = destPath + 'index.js';
            if (fs.existsSync(srcFile)) {
                var arr = [srcFile];
                var tempArr = fs.readdirSync(srcPath);
                tempArr.forEach(function(f) {
                    if (path.extname(f) == '.js' && path.basename(f) != 'index.js') {
                        arr.push(srcPath + f);
                    }
                });

                if (arr.length > 1) {
                    concatConfig[srcPath] = {
                        src: arr,
                        dest: destFile
                    }
                } else {
                    file.copy(srcFile, destFile)
                }

                uglifyConfig[srcPath] = {
                    files: {}
                };

                uglifyConfig[srcPath].files[destPath + 'index-min.js'] = [destFile];
            }
        }
        this.files.forEach(function(f) {
            var src = f.src[0];
            var dest = f.dest;

            var self = this;
            var files = fs.readdirSync(src);

            files.forEach(function(p) {
                if (p != 'd3') {
                    var srcPath = src + p + '/',
                        destPath = dest + p + '/';
                    foo(srcPath, destPath);
                    var extPath = srcPath + 'ext/';
                    if (fs.existsSync(extPath)) {
                        var extFiles = fs.readdirSync(extPath);
                        extFiles.forEach(function(p) {
                            foo(extPath + p + '/', destPath + 'ext/' + p + '/');
                        })
                    }
                }
            });
            config('concat', concatConfig);
            task.run('concat');

            //对tmpl的获取和替换
            config('gallerytmpl',uglifyConfig)
            task.run('gallerytmpl');

            config('uglify', uglifyConfig);
            task.run('uglify');
        });
    });
};