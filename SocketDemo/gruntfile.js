module.exports = function (grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        ngtemplates: {
            app: {
                src: 'App/html/**/*.html',
                dest: 'Static/js/templates.js',
                options: {
                    module: 'sd.templates'
                }
            }
        },
        watch: {
            files: ['<%= ngtemplates.app.src %>', 'App/js/**/*.js', 'App/less/**/*.less'],
            tasks: ['w']
        },
        concat: {
            options: {
                sourceMap: false,
                stripBanners: true,
                banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
                  '<%= grunt.template.today("yyyy-mm-dd") %> */' +
                  '\n (function(){',
                footer:'})();'
            },
            dist: {
                src: ['App/js/**/*.js', '<%= ngtemplates.app.dest %>'],
                dest: 'Static/js/app.js',
            },
        },
        uglify: {
            app: {
                options: {
                    //sourceMap: true,
                    //sourceMapName: '<%= concat.dist.dest %>.map'
                },
                files: {
                    'Static/js/app.min.js': ['<%= concat.dist.src %>']
                }
            }
        },
        less: {
            production: {
                options: {
                    plugins: [
                      new (require('less-plugin-autoprefix'))({ browsers: ["last 2 versions"] })
                    ],
                },
                files: {
                    'Static/css/app.css': 'App/less/main.less'
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-angular-templates');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-less');

    grunt.registerTask('build', ['ngtemplates','concat','uglify','less:production']);
    grunt.registerTask('dev', ['build','watch']);

    grunt.registerTask('w', ['ngtemplates', 'concat', 'uglify', 'less:production']);

};