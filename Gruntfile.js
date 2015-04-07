module.exports = function(grunt) {
	var pt = grunt.file.readJSON('project.json'),
		config = {
			app: './init-file',
			dist: pt.dist
		},
		cons = [
			'grunt',
			'grunt-contrib-copy',
			'grunt-autoprefixer',
			'grunt-contrib-clean',
			'grunt-contrib-coffee',
			'grunt-contrib-connect',
			'grunt-contrib-cssmin',
			'grunt-contrib-jade',
			'grunt-contrib-stylus',
			'grunt-contrib-uglify',
			'grunt-contrib-watch',
			'grunt-wiredep',
			'grunt-usemin',
			'connect-livereload',
			'grunt-rev',
			'grunt-newer',
			'load-grunt-tasks'
		],
		files = [],
		obj = {
			expand: true,
			cwd: '../node_modules/',
			src: ['{' + cons.join(',') + '}/**/*', '!.cache'],
			dest: config.dist + '/node_modules/'
		};
	files.push(obj);
	files.push({
		expand: true,
		cwd: config.app,
		src: ['**/*', '!package.json'],
		dest: config.dist,
		dot: true,
		filter: function (filepath) {
			var nott = pt.type === 'pc' ? 'mobi' : 'pc',
				reg = new RegExp('(\\\\|/)\\b' + nott + '\\b');
			return !reg.test(filepath);
		},
		rename: function(dest, src) {
			var reg = new RegExp('(\\\\|/)\\b' + pt.type + '\\b');
			if (reg.test(src)) {
				src = src.replace(reg, '');
			}
			return dest + '\\' + src;
		}
	});
	grunt.initConfig({
		copy: {
			dist: {
				files: files
			}
		}
	});
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-newer');
	grunt.registerTask('default', function() {
		grunt.task.run('newer:copy');
		var _pkg = config.dist + '/package.json';
		if (!grunt.file.exists(_pkg)) {
			var data = grunt.file.read(config.app + '/package.json'),
				data1 = grunt.file.read(config.app + '/bower.json'),
				_str = '{\n';
			cons.forEach(function(dev) {
				_str += '    "' + dev + '": "^' + grunt.file.readJSON('../node_modules/' + dev + '/package.json').version + '",\n';
			});
			_str = _str.substr(0, _str.length - 2);
			_str += '\n  }';
			grunt.file.write(_pkg, data.replace('#{name}', pt.projectName).replace('#{dependencies}', _str));
			grunt.file.write(config.dist + '/bower.json',  data1.replace('#{name}', pt.projectName));
		}
	});
};