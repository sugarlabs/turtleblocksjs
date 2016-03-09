// Karma configuration
// Generated on Thu Aug 13 2015 01:41:32 GMT+0530 (IST)

module.exports = function(config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['mocha', 'requirejs'],


    // list of files / patterns to load in the browser
    files: [
      {pattern: 'node_modules/chai/chai.js', included: false},
      {pattern: 'node_modules/sinon-chai/lib/sinon-chai.js', included: false},
      {pattern: 'node_modules/sinon/pkg/sinon.js', included: false},

      // put what used to be in your requirejs 'shim' config here,
      // these files will be included without requirejs
      'lib/jquery-1.10.1.js',

      // put all libs in requirejs 'paths' config here (included: false)
      {pattern: 'lib/*.js', included: false},

      // all src and test modules (included: false)
      {pattern: 'js/*.js', included: false},
      {pattern: 'test/js/test.js', included: false},

      // test main require module last
      'test/js/test-main.js',
    ],


    // list of files to exclude
    exclude: [
        'js/loader.js',
    ],


    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
    },


    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['progress'],


    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['Chrome'],


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false
  })
}
