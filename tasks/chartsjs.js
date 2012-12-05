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
        var src = this.file.src;
        var dest = this.file.dest;

        if (!src) {
            grunt.warn('Missing src property.');
            return false;
        }

        if (!dest) {
            grunt.warn('Missing dest property');
            return false;
        }

        function foo(f,srcPath,arr,destPath){
            var stats = fs.statSync(srcPath+f);
            if(stats.isFile()){
                if (path.extname(f) == '.js'){
                    arr.push(srcPath+f);
                }
                else if (path.extname(f) == '.swf'){
                    try{
                        if(!fs.existsSync(destPath)){
                            file.mkdir(destPath);
                        }
                        file.copy(srcPath+f,destPath+f);
                    }
                    catch(e){
                        console.log(e);
                    }
                    
                }
            }
            else if(stats.isDirectory()){
                fs.readdirSync(srcPath+f).forEach(function(nf){
                    foo(nf,srcPath+f+'/',arr,destPath+f+'/');
                });
            }
        }


        //打包 js case
        var arr = [];
        var srcPath = src+'/js/';
        fs.readdirSync(srcPath).forEach(function(f){
            foo(f,srcPath,arr,dest+'/js/');
        });


        /*var mPath = src+'/js/m/';

        fs.readdirSync(mPath).forEach(function(f){
            foo(f,mPath,arr);
        });

        arr.push(src+'/js/case.js');*/

        var max = grunt.helper('concat', arr, {
                    separator: '\n'
                });
        file.write(dest+'js/case.js', max);
        var min = grunt.helper('uglify', max, grunt.config('uglify'));;
        file.write(dest+'js/case-min.js', min);


        //打包swf case
        arr = [];
        var srcPath = src+'/as/';
        fs.readdirSync(srcPath).forEach(function(f){
            foo(f,srcPath,arr,dest+'/as/');
        });
        max = grunt.helper('concat', arr, {
                    separator: '\n'
                });
        file.write(dest+'as/case.js', max);
        var min = grunt.helper('uglify', max, grunt.config('uglify'));;
        file.write(dest+'as/case-min.js', min);

    });
};