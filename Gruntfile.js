module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        brixjs: {
            brixjs: {
                files: {
                    "dist/<%= pkg.version %>/": "src/"
                }
            }
        },
        brixless: {
            brixless: {
                files: {
                    'dist/<%= pkg.version %>/': 'src/style/',
                    'src/style/': 'src/style/'
                }
            }
        },
        galleryjs: {
            gallery: {
                files: {
                    'dist/<%= pkg.version %>/gallery/': 'src/gallery/'
                }
            }
        },
        galleryless: {
            galleryless: {
                files: {
                    'dist/<%= pkg.version %>/gallery/': 'src/gallery/'
                }
            }

        },
        chartsjs:{
            chartsjs:{
                files:{
                    'dist/<%= pkg.version %>/gallery/charts/':'src/gallery/charts/'
                }
            }
        },
        watch: {
            watchbrixjs: {
                files: 'src/core/*.js',
                tasks: ['brixjs']
            },
            watchgalleryless: {
                files: 'src/gallery/**/*.less',
                tasks: ['galleryless']
            },
            watchgalleryjs: {
                files: 'src/gallery/**/*.js',
                tasks: ['galleryjs']
            },
            watchbrixless: {
                files: 'src/style/*.less',
                tasks: ['brixless']
            }
        },
        jshint: {
            files: ['Gruntfile.js', 'src/core/brix.js', 'src/core/tmpler.js', 'src/core/dataset.js', 'src/core/chunk.js', 'src/core/brick.js', 'src/core/pagelet.js', 'src/core/demolet.js'],
            options: {
                browser: true,
                curly: true,
                eqeqeq: false,
                immed: true,
                latedef: true,
                newcap: false,
                noarg: true,
                sub: true,
                undef: true,
                boss: true,
                eqnull: true,
                evil: true,
                expr: true,
                laxcomma: true,
                globals: {
                    exports: true,
                    module: false,
                    KISSY: true,
                    console: true,
                    print: true,
                    document: true,
                    window: true,
                    Brix:true
                }
            }
        },
        curl: {
            'dist/fonts/uxiconfont.ttf': 'http://ux.etao.com/assets/src_uxiconfont.ttf',
            'dist/fonts/uxiconfont.woff': 'http://ux.etao.com/assets/src_uxiconfont.woff',
            'dist/fonts/uxiconfont.svg': 'http://ux.etao.com/assets/src_uxiconfont.svg',
            'dist/fonts/uxiconfont.eot': 'http://ux.etao.com/assets/src_uxiconfont.eot'
        }
    });

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-curl');
    //tasks
    grunt.loadTasks('tasks');

    // Default task.
    //grunt.registerTask('default', ['chartsjs']);
    grunt.registerTask('default', ['jshint','brixjs' ,'brixless','galleryless', 'galleryjs' ,'chartsjs', 'watch']);
};