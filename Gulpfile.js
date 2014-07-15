var gulp   = require('gulp');
var jshint = require('gulp-jshint');
var stylish = require('jshint-stylish');
// var mocha  = require('gulp-mocha');

function lint() {
  return gulp
    .src(['Gulpfile.js', 'public/scripts/*.js', 'routes/*.js', 'test/*.js'])
    .pipe(jshint())
    .pipe(jshint.reporter(stylish));  
}

gulp.task('lint', function() {
  return lint();
});

gulp.task('default', ['lint'], function() {
  lint();
  gulp.watch(['Gulpfile.js', 'public/scripts/*.js', 'routes/*.js','test/*.js'], function() {
    console.log('gulp is watching!');
    return lint();
  });
  console.log('gulp is watching!');
});