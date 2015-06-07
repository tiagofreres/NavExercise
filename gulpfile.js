var gulp = require('gulp');
var sass = require('gulp-sass');
var jade = require('gulp-jade');

var scssPath = ['./lib/scss/main.scss'];
var cssDest = "./public/styles/";

gulp.task('sass', function () {
    gulp.src(scssPath)
        .pipe(sass())
        .pipe(gulp.dest(cssDest));
});

gulp.task('default', ['sass'], function() {
  // place code for your default task here
});
