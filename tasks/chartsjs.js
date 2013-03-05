/*
 * grunt-chartsjs
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
    grunt.registerMultiTask('chartsjs', 'Compile Chart JS files.', function() {
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

        function foo(f, srcPath, arr, destPath) {
            var stats = fs.statSync(srcPath + f);
            if (stats.isFile()) {
                if (path.extname(f) == '.js') {
                    arr.push(srcPath + f);
                } else if (path.extname(f) == '.swf') {
                    try {
                        if (!fs.existsSync(destPath)) {
                            file.mkdir(destPath);
                        }
                        file.copy(srcPath + f, destPath + f);
                    } catch (e) {
                        console.log(e);
                    }

                }
            } else if (stats.isDirectory()) {
                fs.readdirSync(srcPath + f).forEach(function(nf) {
                    foo(nf, srcPath + f + '/', arr, destPath + f + '/');
                });
            }
        }
        this.files.forEach(function(f) {
            var src = f.src;
            var dest = f.dest;

            //打包 js case
            var arr = [];
            var srcPath = src + 'js/';
            fs.readdirSync(srcPath).forEach(function(f) {
                foo(f, srcPath, arr, dest + 'js/');
            });

            concatConfig[srcPath] = {
                src: arr,
                dest: dest + 'js/case.js'
            };

            uglifyConfig[srcPath] = {
                files: {}
            };
            uglifyConfig[srcPath].files[dest + 'js/case-min.js'] = [dest + 'js/case.js'];


            //打包swf case
            arr = [];
            var srcPath = src + 'as/';
            fs.readdirSync(srcPath).forEach(function(f) {
                foo(f, srcPath, arr, dest + 'as/');
            });
            concatConfig[srcPath] = {
                src: arr,
                dest: dest + 'as/case.js'
            };

            uglifyConfig[srcPath] = {
                files: {}
            };
            uglifyConfig[srcPath].files[dest + 'as/case-min.js'] = [dest + 'as/case.js'];
        });

        config('concat', concatConfig);
        task.run('concat');

        config('uglify', uglifyConfig);
        task.run('uglify');
    });
};