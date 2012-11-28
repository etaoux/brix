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
        var src = this.file.src;
        var dest = this.file.dest;
        var options = this.data.options || {};
        if (options.compress) {
            if (!options.min) {
                options.min = '-min';
            }
        } else {
            options.min = '';
        }

        if (!src) {
            grunt.warn('Missing src property.');
            return false;
        }

        if (!dest) {
            grunt.warn('Missing dest property');
            return false;
        }

        var self = this;
        var files = fs.readdirSync(src);

        function foo(srcPath,destPath){
            var srcFile =  srcPath + 'index.js';
            var destFile = destPath + 'index' + options.min + '.js'
            if (fs.existsSync(srcFile)) {
                var arr = [srcFile];
                var tempArr = fs.readdirSync(srcPath);
                tempArr.forEach(function(f) {
                    if (path.extname(f) == '.js' && path.basename(f) != 'index.js') {
                        arr.push(srcPath + f);
                    }
                });

                var max = grunt.helper('concat', arr, {
                    separator: '\n'
                });
                var min;
                if (options.compress) {
                    min = grunt.helper('uglify', max, grunt.config('uglify'));
                } else {
                    min = max;
                }
                file.write(destFile, min);
            }

        }

        files.forEach(function(p){
            var srcPath = src  + p +'/',
                destPath = dest + p + '/';
            foo(srcPath,destPath);

            var extPath = srcPath+'ext/';
            if(fs.existsSync(extPath)){
                var extFiles = fs.readdirSync(extPath);
                extFiles.forEach(function(p){
                   foo(extPath+p+'/',destPath+'ext/'+p+'/'); 
                })
            }
        });
    });
};