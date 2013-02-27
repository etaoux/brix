/*
 * grunt-galleryless
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
    grunt.registerMultiTask('galleryless', 'Compile Gallery LESS files.', function() {
        var lessConfig = {};

        function foo(srcPath, destPath) {
            var srcFile = srcPath + 'index.less';
            var destFile = destPath + 'index.css'
            if (fs.existsSync(srcFile)) {
                lessConfig[srcPath] = {
                    files: {}
                };
                lessConfig[srcPath].files[srcPath + 'index.css'] = srcFile;

                lessConfig[destPath] = {
                    files: {}
                };
                lessConfig[destPath].files[destFile] = srcFile;

                lessConfig[destPath + 'min'] = {
                    options: {
                        yuicompress: true
                    },
                    files: {}
                };
                lessConfig[destPath + 'min'].files[destPath + 'index-min.css'] = srcFile;
            }
        }
        this.files.forEach(function(f) {
            var src = f.src;
            var dest = f.dest;
            src.forEach(function(dir){
                fs.readdirSync(dir).forEach(function(p) {
                    var srcPath = dir + p + '/'
                    var destPath = dest + p + '/'
                    foo(srcPath, destPath);

                    var extPath = srcPath + 'ext/';
                    if (fs.existsSync(extPath)) {
                        var extFiles = fs.readdirSync(extPath);
                        extFiles.forEach(function(p) {
                            foo(extPath + p + '/', destPath + 'ext/' + p + '/');
                        })
                    }
                });
            });
        });
        config('less', lessConfig);
        task.run('less');
    });
};
