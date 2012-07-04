module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: '<json:package.json>',
    meta: {
      name: 'JavaScript Hooker',
      banner: '/*! <%= meta.name %> - v<%= pkg.version %> - <%= grunt.template.today("m/d/yyyy") %>\n' +
              '* <%= pkg.homepage %>\n' +
              '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
              ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */'
    },
    concat: {
      dist: {
        src: ['<banner:meta.banner>', "src/core/mustache.js",
        "src/core/mu.js",
        "src/core/tmpler.js",
        "src/core/dataset.js",
        "src/core/chunk.js",
        "src/core/brick.js",
        "src/core/pagelet.js"],
        dest: 'dist/<%= pkg.name %>.js'
      }
    },
    min: {
      dist: {
        src: ['<banner:meta.banner>', 'dist/<%= pkg.name %>.js'],
        dest: 'dist/<%= pkg.name %>.min.js'
      }
    },
    test: {
      files: []
    },
    lint: {
      files: ['grunt.js']
    },
    watch: {
      files: '<config:lint.files>',
      tasks: 'lint:files test:files'
    },
    jshint: {
      options: {
        curly: true,
        eqeqeq: true,
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
        module: false
      }
    },
    uglify: {
        codegen: {
          ascii_only: true
        }
    }
  });

  // Default task.
  grunt.registerTask('default', 'lint test concat min');

};