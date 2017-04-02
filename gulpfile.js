const gulp = require('gulp')
const gutil = require('gulp-util')
const browserify = require('browserify')
const source = require('vinyl-source-stream')
const babelify = require('babelify')
const webserver = require('gulp-webserver')
const clean = require('gulp-clean')
const uglifycss = require('gulp-uglifycss')
const concat = require('gulp-concat')
const runSequence = require('run-sequence')
const uglify = require('gulp-uglify')
const buffer = require('vinyl-buffer')
const envify = require('gulp-envify')

gulp.task('clean', () => {
    return gulp.src('dist', {read: false})
        .pipe(clean());
})

gulp.task('clean:css', () => {
  return gulp.src('dist/assets/css', {read: false})
      .pipe(clean());
})

gulp.task('copy:statics', () => {
    return gulp.src(['./static/**/*'])
               .pipe(gulp.dest('./dist'))
})

gulp.task('build:css', () => {
  return gulp.src('./static/assets/css/*.css')
             .pipe(uglifycss({
               "maxLineLen": 80,
               "uglyComments": true
              }))
              .pipe(concat('style.css'))
              .pipe(gulp.dest('./dist'))
})

gulp.task('build:es6', () => {
    return browserify({
            entries: './src/app.es6',
            extensions: ['.es6'],
            debug: true
        })
        .transform('babelify', {
            presets: ['es2015', 'react', 'stage-2'],
            plugins: ['transform-class-properties']
        })
        .bundle()
        .on('error', function(err){
            gutil.log(gutil.colors.red.bold('[browserify error]'))
            gutil.log(err.message)
            this.emit('end')
        })
        .pipe(source('app.js'))
        .pipe(gulp.dest('./dist'))
})

gulp.task('uglify:js', () => {
  return gulp.src('./dist/app.js')
             .pipe(buffer())
             .pipe(envify('production'))
             .pipe(uglify())
             .pipe(gulp.dest('./dist'))
})

gulp.task('dist:development', callback =>
  runSequence('clean', 'copy:statics', 'build:css', 'build:es6', callback)
)

gulp.task('dist:production', callback => {
  process.env.NODE_ENV = 'production'
  return runSequence('clean', 'copy:statics', 'build:css', 'clean:css', 'build:es6', 'uglify:js', callback)
})

gulp.task('watch', ['dist:development'], () => {
    gulp.watch('./src/**/*.es6', ['build:es6'])
    gulp.watch('./static/**/*', ['dist:development'])
})

gulp.task('serve', () => {
  gulp.src('dist')
    .pipe(webserver({
      livereload: true,
      open: true,
      fallback: 'index.html',
      host: '0.0.0.0',
    }))
})

gulp.task('default', ['watch', 'serve'])
