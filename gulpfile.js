var gulp = require('gulp'),
    gutil = require('gulp-util'),
    source = require('vinyl-source-stream'),
    buffer = require('vinyl-buffer'),
    watchify = require('watchify'),
    browserify = require('browserify'),
    size = require('gulp-size'),
    
    mocha = require('gulp-mocha');

var bundler = watchify(browserify('./src/index.js', watchify.args));
bundler.transform('brfs');

gulp.task('js', bundle);
bundler.on('update', bundle);
bundler.on('log', gutil.log);

function bundle() {
    return bundler.bundle()
        .on('error', gutil.log.bind(gutil, 'Browserify Error'))
        .on(source('bundle.js'))
        .pipe(gulp.dest('./public'));
}

gulp.task('test', function() {
    return gulp.src([ 'test/spec-*.js' ], { read: false })
        .pipe(size({title: 'test', showFiles: true}))
        .pipe(mocha({
            reporter: 'spec'
        }));
});