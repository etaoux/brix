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
            files: [
                'Gruntfile.js', 'src/core/brix.js', 'src/core/mu.js', 'src/core/dataset.js', 'src/core/chunk.js', 'src/core/brick.js', 'src/core/pagelet.js', 'src/core/demolet.js'],
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
                    window: true
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-watch');

    //tasks
    grunt.loadTasks('tasks');

    // Default task.
    //grunt.registerTask('default', ['chartsjs']);
    grunt.registerTask('default', ['jshint','brixjs' ,'brixless','galleryless', 'galleryjs' ,'chartsjs', 'watch']);
};