module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: '<json:package.json>',
        meta: {
            name: 'Brix',
            banner: '/*! <%= meta.name %> - v<%= pkg.version %>\n' + '* <%= pkg.homepage %>\n' + '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' + ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */'
        },
        lint: {
            files: ['grunt.js']
        },
        brixjs:{
            brixjs:{
                src:'src/',
                dest:'dist/<%= pkg.version %>/'
            }
        },
        brixless:{
            brixless:{
                src:'src/',
                dest:'dist/<%= pkg.version %>/'
            },
            brixsrcless:{
                src:'src/',
                dest:'src/style/'
            }
        },
        galleryless:{
            gallerysrc:{
                src:'src/gallery/',
                dest:'src/gallery/'
            },
            gallerydes:{
                src:'src/gallery/',
                dest:'dist/<%= pkg.version %>/gallery/'
            },
            gallerydes_min:{
                src:'src/gallery/',
                dest:'dist/<%= pkg.version %>/gallery/',
                options: {
                  yuicompress: true
                }
            }
        },
        galleryjs:{
            gallerysrc:{
                src:'src/gallery/',
                dest:'dist/<%= pkg.version %>/gallery/'
            },
            gallerydes:{
                src:'src/gallery/',
                dest:'dist/<%= pkg.version %>/gallery/',
                options: {
                  compress: true
                }
            }
        },
        watch: {
            watchbrixjs:{
                files: 'src/core/*.js',
                tasks: 'brixjs'
            },
            watchgalleryless:{
                files: 'src/gallery/**/*.less',
                tasks: 'galleryless'
            },
            watchgalleryjs:{
                files: 'src/gallery/**/*.js',
                tasks: 'galleryjs'
            },
            watchcss:{
                files: 'src/style/*.less',
                tasks: 'brixless'
            }
        },
        jshint: {
            options: {
                browser: true,
                curly: true,
                eqeqeq: false,
                immed: true,
                latedef: true,
                newcap: true,
                noarg: true,
                sub: true,
                undef: true,
                boss: true,
                eqnull: true
            },
            globals: {
                exports: true,
                module: false,
                KISSY: true,
                console: true,
                print: true,
                document: true,
                window: true
            }
        },
        uglify: {
            codegen: {
                ascii_only: true
            }
        }
    });

    //npm install grunt-less
    grunt.loadNpmTasks('grunt-less');

    //tasks
    grunt.loadTasks('tasks');

    // Default task.
    grunt.registerTask('default', 'lint brixjs brixless galleryless galleryjs watch');
};
