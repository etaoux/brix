/*
 * grunt-brixless
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
    grunt.registerMultiTask('brixless', 'Compile Brix LESS files.', function() {
        var src = this.file.src;
        var dest = this.file.dest;
        var options = this.data.options || {};
        if(options.compress||options.yuicompress){
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

        files = fs.readdirSync(src);
        var count = files.length;
        var done = this.async();
        files.forEach(function(f) {
            console.log(f);
            var srcFile = src + '/' + f + '/' + f + '.less';
            var destFile = dest + '/' + f + '/' + f + options.min+'.css'
            if (fs.existsSync(srcFile)) {
                grunt.helper('less', [srcFile], options, function(err, css) {
                    if (err) {
                        grunt.warn(err);
                        done(false);
                        return;
                    }
                    file.write(destFile, css);
                    count--;
                    if(count==0){
                        done();
                    }
                });
            }
            else{
                count--;
            }
        });
    });
};