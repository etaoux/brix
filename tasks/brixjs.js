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
        var pkg = file.readJSON('package.json');
        var src = this.file.src,
            dest = this.file.dest;
        var max,min, 
            files = ['tmpler.js', 'dataset.js', 'chunk.js', 'brick.js', 'pagelet.js','demolet.js','brix.js'],
            banner = grunt.task.directive('<banner:meta.banner>', function() { return null; });

        if(!banner){
            banner = '';
        }
        files.forEach(function(f,i){
            files[i] = [src+'core/'+f];
            max = grunt.helper('concat',files[i] , {
                separator: '\n'
            });
            max = max.replace('@DEBUG@','').replace('@VERSION@',pkg.version).replace('@TAG@',pkg.tag);
            file.write(dest+'core/'+f, max);
            min = grunt.helper('uglify', max, grunt.config('uglify'));
            file.write(dest+'core/'+path.basename(f,'.js')+'-min.js', min);
        });

        max = grunt.helper('concat', files, {
            separator: '\n'
        });
        max = max.replace('@DEBUG@','').replace('@VERSION@',pkg.version).replace('@TAG@',pkg.tag);
        file.write(dest+'brix.js', banner+max);

        min = grunt.helper('uglify', max, grunt.config('uglify'));
        file.write(dest+'brix-min.js', banner+min);

    });
};