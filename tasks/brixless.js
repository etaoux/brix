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
        var lessConfig = {};
        this.files.forEach(function(f) {
            lessConfig[f.dest] = {
                options: {
                    paths: f.src
                },
                files: {

                }
            };
            lessConfig[f.dest].files[f.dest + 'brix.css'] = f.src + 'brix.less';

            lessConfig[f.dest + 'min'] = {
                options: {
                    paths: f.src,
                    yuicompress: true
                },
                files: {

                }
            };
            lessConfig[f.dest + 'min'].files[f.dest + 'brix-min.css'] = f.src + 'brix.less';
        });

        config('less', lessConfig);
        task.run('less');
    });
};