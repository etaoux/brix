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
        var pkg = config('pkg');
        var files = ['brix.js', 'mustache.js', 'mu.js', 'tmpler.js', 'dataset.js', 'chunk.js', 'brick.js', 'pagelet.js', 'demolet.js'];
        var banner = '/*! Brix - v<%= pkg.version %>\n' + '* <%= pkg.homepage %>\n' + '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' + ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */ \n';
        this.files.forEach(function(f) {
            files.forEach(function(name, i) {
                var srcPath = f.src + 'core/' + name;
                var destPath = f.dest + 'core/' + name;
                files[i] = destPath;
                if (i == 0) {
                    //对brix.js进行替换处理
                    var src = file.read(srcPath).replace('@VERSION@', pkg.version).replace('@TAG@', pkg.tag);
                    file.write(destPath, src);
                } else {
                    file.copy(srcPath, destPath);
                }
            });

            //执行contact和uglify
            config('concat', {
                options: {
                    banner: banner,
                    separator: '\n'
                },
                dist: {
                    src: files,
                    dest: f.dest + 'brix.js'
                }
            });
            task.run('concat');
            var uglifyConfig = {
                core: {
                    options: {
                        beautify: {
                            ascii_only: true
                        }
                    },
                    files: {}
                },
                dist: {
                    options: {
                        banner: banner,
                        beautify: {
                            ascii_only: true
                        }
                    },
                    files: {}
                }
            };
            files.forEach(function(name) {
                uglifyConfig.core.files[f.dest + 'core/' + path.basename(name, '.js') + '-min.js'] = [name];
            });
            uglifyConfig.dist.files[f.dest + 'brix-min.js'] = files;
            
            config('uglify', uglifyConfig);
            task.run('uglify');

            var brixminjsConfig = {
                brixminjs:{
                    files:{
                        'brix':[f.dest+'core/brix-min.js',f.dest+'brix-min.js']
                    }
                }
                
            }
            config('brixminjs', brixminjsConfig);
            task.run('brixminjs');
        });
    });
};