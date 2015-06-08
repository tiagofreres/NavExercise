var gulp = require('gulp');
var sass = require('gulp-sass');
var jsmin = require('gulp-jsmin');
var concat = require('gulp-concat');

var scssPath = ['./lib/scss/main.scss'], 
		cssDest = "./public/styles/",
		jsPath = ['./lib/js/*.js'],
		jsDest = './public/js/',
		jsConcatFile = 'main.min.js';


gulp.task('sass', function () {
    gulp.src(scssPath)
        .pipe(sass())
        .pipe(gulp.dest(cssDest));
});

gulp.task('js', function () {
  gulp.src(jsPath)
  	.pipe(concat(jsConcatFile))
		// .pipe(jsmin())
		.pipe(gulp.dest(jsDest));
});

gulp.task('default', ['sass', 'js'], function() {
  // place code for your default task here
});
