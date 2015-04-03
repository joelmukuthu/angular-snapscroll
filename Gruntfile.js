'use strict';

module.exports = function (grunt) {

  require('load-grunt-tasks')(grunt);

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    info: {
      banner: {
        short: '/* <%= pkg.name %> v<%= pkg.version %>, (c) 2014-2015 Joel Mukuthu, MIT License, built: <%= grunt.template.date("dd-mm-yyyy HH:MM:ss Z") %> */\n',
        long: '/**\n * <%= pkg.name %>\n * Version: <%= pkg.version %>\n * (c) 2014-2015 Joel Mukuthu\n * MIT License\n * Built on: <%= grunt.template.date("dd-mm-yyyy HH:MM:ss Z") %>\n **/\n\n'
      }
    },

    clean: {
      dev: '.tmp',
      dist: 'dist'
    },

    concat: {
      options: {
        separator: '\n'
      },
      dev: {
        src: ['src/*.js', 'src/**/*.js'],
        dest: '.tmp/<%= pkg.name %>.js'
      },
      dist: {
        options: {
          banner: '<%= info.banner.long %>'
        },
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

    coveralls: {
      options: {
        debug: true,
        coverageDir: 'coverage/',
        dryRun: false,
        force: true,
        recursive: true
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
          'concat:dev',
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
    }
  });

  grunt.registerTask('setup', [
    'jshint',
    'clean:dev',
    'concat:dev'
  ]);

  grunt.registerTask('default', [
    'setup',
    'watch',
  ]);

  grunt.registerTask('dev-test', [
    'setup',
    'karma:continuous'
  ]);

  grunt.registerTask('test', [
    'setup',
    'karma:single'
  ]);

  grunt.registerTask('send-coverage', [
    'test',
    'coveralls'
  ]);

  grunt.registerTask('build', [
    'clean:dist',
    'concat',
    'uglify'
  ]);
};
