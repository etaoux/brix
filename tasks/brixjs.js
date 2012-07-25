/*
 * grunt-brixjs
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
    grunt.registerMultiTask('brixjs', 'Compile Brix JS files.', function() {
        var src = this.file.src;
        var dest = this.file.dest;
        var options = this.data.options || {};
        if(options.compress){
            if(!options.min){
                options.min = '-min';
            }
        }
        else{
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
        files = fs.readdirSync(src);
        files.forEach(function(f) {
            var srcFile = src + '/' + f + '/'  + 'index.js';
            var destFile = dest + '/' + f + '/index'  + options.min+'.js'
            if (fs.existsSync(srcFile)) {
                var max = grunt.helper('concat', [srcFile], {separator: self.data.separator});
                var min;
                if(options.compress){
                    min = grunt.helper('uglify', max, grunt.config('uglify'));
                }
                else{
                    min = max;
                }
                file.write(destFile, min);
            }
        });
    });
};