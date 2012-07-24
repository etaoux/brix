module.exports = function(grunt) {
  grunt.initConfig({
    test: {
      files: ['less_test.js']
    },
    less: {
      test_no_compress: {
        src: 'fixtures/test.less',
        dest: 'fixtures/output/test.css'
      },
      test_compress: {
        src: 'fixtures/test.less',
        dest: 'fixtures/output/test_compress.css',
        options: {
          compress: true
        }
      },
      test_yuicompress: {
        src: 'fixtures/test.less',
        dest: 'fixtures/output/test_yuicompress.css',
        options: {
          yuicompress: true
        }
    }
  }
});

  // Load local tasks.
  grunt.loadTasks('../tasks');

  grunt.registerTask('default', 'less test');
};
