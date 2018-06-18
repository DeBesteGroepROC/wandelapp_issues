module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        // Task configuration.
        jshint: {
            src: ['src/*.js'],
            options: {
                esnext:true,
                browser:true,
                curly: true,
                eqeqeq: true,
                immed: true,
                latedef: true,
                newcap: false,
                noarg: true,
                sub: true,
                undef: true,
                unused: false,
                boss: true,
                eqnull: true,
                globals: {
                    jQuery: true,
                    $: true,
                    _: true,
                    console: true,
                    exports: true,
                    post: true,
                    test: true,
                    ok:true,
                    equal: true,
                    stampit: true
                }
            }
        },
        copy: {
            main: {
                files: [
                    // Copy jquery and ractive and mapbox
                    {expand: true, cwd: './node_modules/jquery/dist/', src: 'jquery.min.js', dest: './js/jquery/', ext: '.js'},
                    {expand: true, cwd: './node_modules/ractive/', src: 'ractive.min.js', dest: './js/ractive/', ext: '.js'},
                    {expand: true, cwd: './node_modules/mapbox-gl/dist/', src: 'mapbox-gl.js', dest: './public/mapbox/', ext: '.js'},
                    {expand: true, cwd: './node_modules/mapbox-gl/dist/', src: 'mapbox-gl.css', dest: './public/mapbox/', ext: '.css'}
                ],
            },
            final:{
                files: [
                    {expand:true,cwd: 'css/mincss', src: ['**'], dest:'public/css'},
                    {expand:true,cwd: 'js/', src: ['**', '!sw.js'], dest:'public/js'},
                    {expand:true,cwd: 'js/', src: ['sw.js'], dest:'public/'},
                    {expand:true,src: ['img/**'], dest:'public/'},
                    {expand:true,src: ['manifest.json'], dest:'public/'},
                ]
            }
        },
        browserify: {
            dist: {
                options: {
                    transform: [
                        ["babelify"] //Converts ES6 to ES5 (with require statements), which is then converted to one file with browserify!!
                    ]
                },
                files: {
                    // "./js/app_es5.js": "src/app.js"
                    "./js/app_es5.js": ["src/app.js"]
                }
            }
        },
        cssmin: {
            target: {
                files: [{
                    expand: true,
                    cwd: 'css',
                    src: ['*.css', '!*.min.css'],
                    dest: 'css/mincss',
                    ext: '.css'
                }]
            }
        },
        htmlmin: {
            dist: {
                options: {
                    removeComments: true,
                    collapseWhitespace: true
                },
                files: {
                    'public/index.html': 'index.html',
                }
            }
        },
        uglify: {
            options: {
                mangle: false
            },
            my_target: {
                    files: {
                        'public/js/app_es5.js': ['js/app_es5.js']
                    }
            }
        },
        exec: {
            log: 'echo "Ga naar localhost:2222 om de unit test uit te voeren"',
            runtest: 'browserify -t babelify unit_tests/*.js | browser-run -p 2222',
        },
        watch: {
            js: {
                files: ['*.js', 'src/*.js'],
                tasks: ['jshint', 'browserify']
            }
        }
    });

    // These plugins provide necessary tasks.
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-htmlmin');
    // grunt.loadNpmTasks('grunt-contrib-uglify-es');
    grunt.loadNpmTasks('grunt-browserify');
    grunt.loadNpmTasks('grunt-exec');

    // Default task.
    grunt.registerTask('default', ['jshint', 'copy:main', 'browserify', 'cssmin', 'htmlmin', 'copy:final']);//'uglify',
    grunt.registerTask('test', ['exec']);

};
