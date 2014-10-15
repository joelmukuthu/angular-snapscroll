'use strict';

module.exports = function (grunt) {
  
  require('load-grunt-tasks')(grunt);
  
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    
    info: {
      banner: '/*! <%= pkg.name %>, version: <%= pkg.version %> - <%= grunt.template.today("dd-mm-yyyy") %> */\n'
    },
    
    clean: {
      dev: '.tmp',
      dist: 'dist'
    },
    
    concat: {
      options: {
        separator: ';'
      },
      dev: {
        src: ['src/*.js', 'src/**/*.js'],
        dest: '.tmp/<%= pkg.name %>.js'
      },
      dist: {
        src: ['src/*.js', 'src/**/*.js'],
        dest: 'dist/<%= pkg.name %>.js'
      }
    },
    
    uglify: {
      options: {
        banner: '<%= info.banner %>'
      },
      dist: {
        src: ['<%= concat.dist.dest %>'],
        dest: 'dist/<%= pkg.name %>.min.js'
      }
    },
    
    autoprefixer: {
      options: {
        browsers: ['last 1 version']
      },
      dev: {
        src: 'src/css/<%= pkg.name %>.css',
        dest: '.tmp/<%= pkg.name %>.css'
      },
      dist: {
        src: 'src/css/<%= pkg.name %>.css',
        dest: 'dist/<%= pkg.name %>.css'
      }
    },
    
    cssmin: {
      options: {
        banner: '<%= info.banner %>'
      },
      files: {
        'dist/<%= pkg.name %>.min.css': 'dist/<%= pkg.name %>.css'
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
      css: {
        files: ['src/css/<%= pkg.name %>.css'],
        tasks: [
          'autoprefixer:dev',
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
    'concat:dev',
    'autoprefixer:dev'
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
  
  grunt.registerTask('build', [
    'clean:dist',
    'concat',
    'uglify',
    'autoprefixer:dist',
    'cssmin'
  ]);
};