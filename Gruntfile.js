module.exports = function (grunt) {
    'use strict';
    grunt.loadNpmTasks('grunt-contrib-requirejs');
    require('load-grunt-tasks')(grunt);

    grunt.initConfig({
        karma: {
            options: {
                configFile: 'karma.conf.js',
                autoWatch: false,
                singleRun: true
            },

            dev: {
                browsers: ['Chrome', 'Firefox', 'PhantomJS']
            }
        }
    });

    grunt.registerTask('default', ['karma:dev']);
};
