var gulp = require('gulp'),
    gutil = require('gulp-util'),
    source = require('vinyl-source-stream'),
    buffer = require('vinyl-buffer'),
    watchify = require('watchify'),
    browserify = require('browserify'),
    size = require('gulp-size'),
    jshint = require('gulp-jshint'),
    stylish = require('jshint-stylish'),
    plumber = require('gulp-plumber'),
    gutil = require('gulp-util'),
    
    listing = require('gulp-task-listing'),
    
    spawn = require('child_process').spawn,
    
    mocha = require('gulp-mocha');

var node;

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

gulp.task('build', function() {
    
});

gulp.task('test', [ 'jshint' ], function() {
    return gulp.src([ 'test/spec-*.js' ], { read: false })
        .pipe(size({title: 'test', showFiles: true}))
        .pipe(mocha({
            reporter: 'spec'
        }));
});

gulp.task('jshint', function() {
    return gulp.src([ '**/*.js', '!**/node_modules/**', '!public/**', '!data/**', '!demo/**' ])
        .pipe(plumber(function(error) {
            // Output error message
            gutil.log(gutil.colors.red(['Error (', error.plugin, '): ', error.message].join('')));
            // emit the end event, to properly end the task
            gulp.emit('task_err', error);
            this.emit('end');
        }))
        .pipe(size({title: 'test', showFiles: true}))
        .pipe(jshint())
        .pipe(jshint.reporter(stylish, {
            fail: true
        }))
        .pipe(jshint.reporter('fail'));
});

gulp.task('server', function () {
    if (node) {
        console.log('[node] kill');
        node.kill();
    }
    node = spawn('node', ['server'], {stdio: 'inherit'});
    node.on('close', function (code) {
        if (code === 8) {
            console.log('Error detected, waiting for changes...');
        }
    });
});

gulp.task('default', listing);
