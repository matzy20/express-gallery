var gulp = require('gulp');
var sass = require('gulp-sass');
var connect = require('gulp-connect');

var PathTo = {
  SassFiles: './sass/**/*.scss',
  PublicFolder: './public',
  PublicCss: './public/styles',
  PublicCssFiles: './public/styles/*.css'
};

// this gulp just watches for changes to sass and updating the css. not running server

gulp.task('watch-files', function (){
  gulp.watch(PathTo.SassFiles, ['compile-sass']);
});

gulp.task('compile-sass', function (){
  return gulp
          .src(PathTo.SassFiles)
          .pipe(sass().on('error', sass.logError))
          .pipe(gulp.dest(PathTo.PublicCss));
});

gulp.task('default', ['compile-sass', 'watch-files']);
