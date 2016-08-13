// Karma configuration
// Generated on Sat Sep 13 2014 18:48:29 GMT+0300 (EEST)

var reporters = [
    'progress',
    'coverage'
];

var coverageType = 'html';

if (process.env.TRAVIS) {
    coverageType = 'lcov';
    reporters.push('coveralls');
}

module.exports = function (config) {
    config.set({

        // base path that will be used to resolve all patterns (eg. files, exclude)
        basePath: '../',


        // frameworks to use
        // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
        frameworks: ['jasmine'],


        // list of files / patterns to load in the browser
        files: [
            'node_modules/angular/angular.js',
            'node_modules/angular-mocks/angular-mocks.js',
            'node_modules/angular-wheelie/dist/angular-wheelie.js',
            'node_modules/angular-scrollie/dist/angular-scrollie.js',
            'src/*.js',
            'src/**/*.js',
            'test/spec/**/*.js'
        ],


        // list of files to exclude
        exclude: [
        ],


        // preprocess matching files before serving them to the browser
        // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
        preprocessors: {
            // generage coverage for these files
            'src/**/*.js': ['coverage']
        },


        // test results reporter to use
        // possible values: 'dots', 'progress'
        // available reporters: https://npmjs.org/browse/keyword/karma-reporter
        // coverage reporter generates tests' coverage
        reporters: reporters,


        // configure coverage reporter
        coverageReporter: {
            dir: 'coverage/',
            type: coverageType
        },


        // web server port
        port: 9876,


        // enable / disable colors in the output (reporters and logs)
        colors: true,


        // level of logging
        // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        logLevel: config.LOG_INFO,


        // enable / disable watching file and executing tests whenever any file changes
        autoWatch: true,


        plugins: [
            'karma-jasmine',
            'karma-coverage',
            'karma-coveralls',
            'karma-phantomjs-launcher'
        ],


        // start these browsers
        // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
        browsers: [
            'PhantomJS'
        ],


        // Continuous Integration mode
        // if true, Karma captures browsers, runs the tests and exits
        singleRun: true
    });
};
