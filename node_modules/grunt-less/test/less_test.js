var grunt = require('grunt');

/*
  ======== A Handy Little Nodeunit Reference ========
  https://github.com/caolan/nodeunit

  Test methods:
    test.expect(numAssertions)
    test.done()
  Test assertions:
    test.ok(value, [message])
    test.equal(actual, expected, [message])
    test.notEqual(actual, expected, [message])
    test.deepEqual(actual, expected, [message])
    test.notDeepEqual(actual, expected, [message])
    test.strictEqual(actual, expected, [message])
    test.notStrictEqual(actual, expected, [message])
    test.throws(block, [error], [message])
    test.doesNotThrow(block, [error], [message])
    test.ifError(value)
*/

exports.less = {
    no_compress: function(test) {
        var expect = 'body {\n  background: #000000;\n}\n';
        var results = grunt.file.read('fixtures/output/test.css');

        test.expect(1);
        test.equal(expect, results, "should compile LESS file");
        test.done();
    },
    compress: function(test) {
        var expect = 'body{background:#000000;}\n';
        var results = grunt.file.read('fixtures/output/test_compress.css');

        test.expect(1);
        test.equal(expect, results, "should compile and compress LESS file");
        test.done();
    },
    yuicompress: function(test) {
        var expect = 'body{background:#000}';
        var results = grunt.file.read('fixtures/output/test_yuicompress.css');

        test.expect(1);
        test.equal(expect, results, "should compile yuicompress LESS file");
        test.done();
    }
};
