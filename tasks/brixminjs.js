/*
 * grunt-brixminjs
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
    grunt.registerMultiTask('brixminjs', 'Compile BrixMin JS files.', function() {
        //console.log(this.files);
        this.files.forEach(function(f) {
            f.src.forEach(function(p){
                //console.log(p);
                var src = file.read(p).replace('@DEBUG@', '');
                file.write(p, src);
            });
        });
    });
};