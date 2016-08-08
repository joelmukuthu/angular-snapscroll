'use strict';

module.exports = function (grunt) {

    require('load-grunt-tasks')(grunt);

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        info: {
            banner: {
                short: '/* <%= pkg.name %> v<%= pkg.version %>, (c) 2014-<%= grunt.template.today("yyyy") %> Joel Mukuthu, MIT License, built: <%= grunt.template.date("dd-mm-yyyy HH:MM:ss Z") %> */\n',
                long: '/**\n * <%= pkg.name %>\n * Version: <%= pkg.version %>\n * (c) 2014-<%= grunt.template.today("yyyy") %> Joel Mukuthu\n * MIT License\n * Built on: <%= grunt.template.date("dd-mm-yyyy HH:MM:ss Z") %>\n **/\n\n'
            }
        },

        clean: {
            // dev: '.tmp',
            dist: 'dist'
        },

        concat: {
            options: {
                separator: '\n',
                banner: '<%= info.banner.long %>'
            },
            // dev: {
            //     src: ['src/*.js', 'src/**/*.js'],
            //     dest: '.tmp/<%= pkg.name %>.js'
            // },
            dist: {
                src: ['src/*.js', 'src/**/*.js'],
                dest: 'dist/<%= pkg.name %>.js'
            }
        },

        uglify: {
            options: {
                banner: '<%= info.banner.short %>'
            },
            dist: {
                src: ['<%= concat.dist.dest %>'],
                dest: 'dist/<%= pkg.name %>.min.js'
            }
        },

        eslint: {
            target: [
                'src/**/*.js',
                'test/spec/**/*.js'
            ]
        },

        jshint: {
            options: {
                jshintrc: '.jshintrc',
                reporter: require('jshint-stylish')
            },
            js: {
                src: [
                    'Gruntfile.js',
                    'src/**/*.js'
                ]
            },
            test: {
                options: {
                    jshintrc: 'test/.jshintrc'
                },
                src: ['test/spec/**/*.js']
            }
        },

        karma: {
            options: {
                configFile: 'test/karma.conf.js'
            },
            single: {
                singleRun: true
            },
            continuous: {
                singleRun: false
            }
        },

        watch: {
            js: {
                files: ['src/**/*.js'],
                tasks: [
                    'newer:jshint:js',
                    'karma:single'
                ]
            },
            test: {
                files: ['test/spec/**/*.js'],
                tasks: [
                    'newer:jshint:test',
                    'karma:single'
                ]
            }
        },

        'release-it': {
            options: {
                pkgFiles: ['package.json', 'bower.json'],
                commitMessage: 'Release %s',
                tagName: 'v%s',
                tagAnnotation: 'Release %s',
                buildCommand: 'grunt build'
            }
        }
    });

    grunt.registerTask('default', [
        'eslint',
        'watch'
    ]);

    grunt.registerTask('dev-test', [
        'eslint',
        'karma:continuous'
    ]);

    grunt.registerTask('test', [
        'eslint',
        'karma:single'
    ]);

    grunt.registerTask('build', [
        'test',
        'clean:dist',
        'concat',
        'uglify'
    ]);
};
