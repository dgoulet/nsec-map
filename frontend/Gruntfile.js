module.exports = function (grunt) {

    var vendors = [
        'd3',
        'topojson',
        'underscore',
        'backbone',
        'backbone.marionette'
    ];

    grunt.initConfig({
        'template-module': {
            templates: {
                options: {
                    module: true,
                    provider: 'underscore',
                    processName: function(filename) {
                        return (/templates\/(.+).template.html/).exec(filename)[1];
                    }
                },

                files: {
                    'dist/templates.js':
                    ["src/templates/*.template.html"]
                }
            }
        },

        browserify: {
            app: {
                src: 'src/entry.js',
                dest: 'dist/entry.js',
                options: {
                    browserifyOptions: {
                        debug: true
                    },
                    external: vendors
                }
            },

            vendors: {
                files: {
                    'dist/vendors.js': []
                },
                options: {
                    'require': vendors
                }
            },

            bundle: {
                src: 'src/entry.js',
                dest: 'dist/bundle.js'
            }
        },

        targethtml: {
            dev: {
                src: 'src/index.html',
                dest: 'index.html'
            },
            prod: {
                src: 'src/index.html',
                dest: 'index.html'
            }
        },

        uglify: {
            bundle: {
                src: 'dist/bundle.js',
                dest: 'dist/bundle.js'
            }
        },

        watch: {
            options: {
                livereload: true,
                spawn: false,
                interrupt: true
            },
            src: {
                files: ['src/**/*', 'src/entry.js',
                        '!src/index.html', '!src/templates/*'],
                tasks: ['browserify:app'],
            },
            templates: {
                files: ['src/templates/*'],
                tasks: ['template-module', 'browserify:app'],

            },
            index: {
                files: ['src/index.html'],
                tasks: ['targethtml:dev']
            },
            assets: {
                files: ['assets/**/*']
            }
        },

        connect: {
            server: {
                options: {
                    hostname: 'localhost',
                    port: 4000,
                    livereload: true
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-browserify');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-targethtml');
    grunt.loadNpmTasks('grunt-template-module');

    grunt.registerTask('builddev', ['template-module', 'browserify:app',
                                    'browserify:vendors', 'targethtml:dev']);
    grunt.registerTask('buildprod', ['template-module', 'browserify:bundle',
                                     'uglify', 'targethtml:prod']);
    grunt.registerTask('run',   ['builddev', 'connect', 'watch']);

};
