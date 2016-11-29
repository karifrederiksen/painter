'use strict';
 
var gulp = require('gulp');
var sass = require('gulp-sass');
var ts  = require('gulp-typescript');
 
var config = {
  styleFile: 'src/styles.scss',
  tsFiles: 'src/**/*.ts'
}

var tsProject = ts.createProject('tsconfig.json');


// Compile SASS
gulp.task('compile-sass', function () {
  return gulp.src(config.styleFile)
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('src/build/'));
});

// Compile TypeScript
gulp.task('compile-ts', function(){
  var tsResult = gulp.src(config.tsFiles).pipe(tsProject());
  return tsResult.js.pipe(gulp.dest("./"));
});

// Watch for changes
gulp.task('watch', function() {
  gulp.watch(config.tsFiles, ['compile-ts']);
  gulp.watch(config.styleFile, ['compile-sass']);
})



gulp.task('default', ['compile-ts', 'compile-sass', 'watch']);