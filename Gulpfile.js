var gulp   = require('gulp');
var jshint = require('gulp-jshint');
var stylish = require('jshint-stylish');
var mocha  = require('gulp-mocha');

function handleError(err) {
  console.log('gulp error ', err.toString());
  this.emit('end');
}

gulp.task('lint', function(cb) {
  gulp
    .src(['Gulpfile.js', 'public/scripts/*.js', 'routes/*.js', 'test/*.js'])
    .pipe(jshint()
      .on('error', handleError))
    .pipe(jshint.reporter(stylish));
  cb(null);
});

//unit tests (instead of nyan cat 'spec' report is also OK)
gulp.task('mocha', function(cb){
  gulp
    .src(['test/test.js'], {read: false})
    .pipe(mocha({reporter: 'nyan'})
      .on('error', handleError));
  cb(null);
});

var tester = gulp.series('mocha', 'lint');

gulp.task('default', function(cb) {
  gulp.run(tester);
  cb(null);
});

gulp.watch(['Gulpfile.js', 'public/scripts/*.js', 'routes/*.js','test/*.js'], ['default']);

// must use gulp Beta. If not, do an asyncronous version:
// gulp.task('default', ['lint', 'mocha'], function() {
// });
// var watcher = gulp.watch(['Gulpfile.js', 'public/scripts/*.js', 'routes/*.js','test/*.js'], tester);
// watcher.on('change', function(event){
//   console.log('File '+event.path+' was '+event.type+', running tasks...');
// });
