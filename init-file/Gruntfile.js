
module.exports = function(grunt) {
	require('load-grunt-tasks')(grunt);
	var config = {
		app: './dev',
		dist: './release'
	};
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		config: config,
		copy: {
			css: {
				file: {
					expand: true,
					cwd:'<%= config.app %>/css/',
					src: ['*', '!*.styl'],
					dest: '<%= config.dist %>/css/',
					flatten: true
				}
			},
			image: {
				file: {
					expand: true,
					cwd:'<%= config.app %>/image/',
					src: '**/*',
					dest: '<%= config.dist %>/image/',
					flatten: true
				}
			},
			views: {
				file: {
					expand: true,
					cwd:'<%= config.app %>/views/',
					src: '*.html',
					dest: '<%= config.dist %>/views/',
					flatten: true
				}
			},
			scripts: {
				file: {
					expand: true,
					cwd:'<%= config.app %>/scripts/',
					src: '**/*.js',
					dest: '<%= config.dist %>/scripts/',
					flatten: true
				}
			}
		},
		stylus: {
			options: {
				compress: false
			},
			compile: {
				files: [{
					expand: true,
					cwd:'<%= config.app %>/css/',
					src: ['**/*.styl', '!{reset,common,mixin,ie}.styl'],
					dest: '<%= config.dist %>/css/',
					ext: '.min.css',
					flatten: true
				}]
			}
		},
		jade: {
			options: {
				pretty: true
			},
			dist: {
				files: [{
					expand: true,
					cwd:'<%= config.app %>/views/',
					src: '*.jade',
					dest: '<%= config.dist %>/views/',
					ext: '.html',
					flatten: true
				}]
			}
		},
		coffee: {
			build: {
				expand: true,
				cwd: '<%= config.app %>/scripts/',
				src: '*.coffee',
				dest: '<%= config.dist %>/scripts/',
				ext: '.js',
				flatten: true
			}
		},
		rev: {
			dist: {
				files: {
					src: [
						'<%= config.dist %>/scripts/*.js',
						'<%= config.dist %>/css/*.css'
					]
				}
			}
		},
		usemin: {
			options: {
				assetsDirs: [
					'<%= config.dist %>/scripts',
					'<%= config.dist %>/css'
				]
			},
			html: ['<%= config.dist %>/views/*.html']
		},
		autoprefixer: {
			options: {
				browsers: ['> 1%', 'last 2 versions', 'Firefox ESR', 'Opera 12.1']
			},
			build: {
				expand: true,
				cwd: '<%= config.dist %>/css/',
				src: ['*.css', '!reset.css'],
				dest: '<%= config.dist %>/css/'
			}
		},
		cssmin: {
			build: {
				expand: true,
				cwd: '<%= config.dist %>/css/',
				src: '*.css',
				dest: '<%= config.dist %>/css/'
			}
		},
		uglify: {
			build: {
				expand: true,
				cwd: '<%= config.dist %>/scripts/',
				src: '*.js',
				dest: '<%= config.dist %>/scripts/'
			}
		},
		wiredep: {
			dev: {
				fileTypes: {
					jade: {
						block: /(([ \t]*)\/\/\s*bower:*(\S*))(\n|\r|.)*?(\/\/\s*endbower)/gi,
						detect: {
							js: /script\(.*src=['"]([^'"]+)/gi,
							css: /link\(.*href=['"]([^'"]+)/gi
						},
						replace: {
							js: 'script(src="{{filePath}}")',
							css: 'link(rel="stylesheet", href="{{filePath}}")'
						}
					}
				},
				onFileUpdated: function(filePath) {
					var _txt = grunt.file.read(filePath);
					grunt.file.write(filePath, _txt.replace(/(script\(src=")(..\/)+/gi,'$1'))
				},
				src: ['<%= config.app %>/views/**/*.jade']
			}
		},
		clean: {
			css: {
				src: '<%= config.dist %>/css/**/*'
			},
			image: {
				src: '<%= config.dist %>/image/**/*'
			},
			views: {
				src: '<%= config.dist %>/views/**/*'
			},
			scripts: {
				src: '<%= config.dist %>/scripts/**/*'
			}
		},
		connect: {
			options: {
				post: 8000,
				open: true,
				hostname: 'localhost',
				base: ['<%= config.dist %>']
			},
			livereload: {
		        options: {
			        middleware: function (connect, options) {
						var arr = [
							connect().use('/', connect.static(options.base[0] + '/views')),
							connect().use('/bower_components', connect.static('./bower_components')),
						];
						var _arr = ['scripts', 'css', 'image'];
						for (var _i in _arr) {
							arr.push(connect().use('/' + _arr[_i], connect.static(options.base[0] + '/' + _arr[_i])));
						}
						return arr;
					}
		        }
		     }

		},
		newer: {
			options: {
				override: function(detail, include) {
					if (detail.task === 'stylus' || detail.task === 'jade') {
						include(true);
					} else {
						include(false);
					}
				}
			}
		},
		watch: {
			copy: {
				tasks: ['copyfile'],
				files: ['<%= config.app %>/image/*']
			},
			stylus: {
				tasks: ['stylesheets'],
				files: ['<%= config.app %>/css/**/*.styl']
			},
			jade: {
				tasks: ['newer:jade'],
				files: ['<%= config.app %>/views/**/*.jade']
			},
			coffee: {
				tasks: ['scripts'],
				files: ['<%= config.app %>/scripts/**/*.coffee']
			},
			js: {
				tasks: ['copyfile', 'newer:uglify'],
				files: ['<%= config.app %>/scripts/**/*']
			},
			livereload: {
				options: {
					livereload: 35729
				},
				files: ['<%= config.dist %>/{views,scripts,css}/**/*']
			}
		}
	});

	grunt.registerTask('copyfile', ['newer:copy']);
	grunt.registerTask('stylesheets', ['newer:stylus', 'newer:autoprefixer', 'newer:cssmin']);
	grunt.registerTask('scripts', ['newer:coffee', 'newer:uglify']);
	grunt.registerTask('build', ['copyfile', 'stylesheets', 'newer:jade', 'scripts']);
	grunt.registerTask('default', ['build', 'connect', 'watch']);
}