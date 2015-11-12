var gulp = require('gulp'),
    gutil = require('gulp-util'),
    size = require('gulp-size'),
    jshint = require('gulp-jshint'),
    stylish = require('jshint-stylish'),
    plumber = require('gulp-plumber'),
    gutil = require('gulp-util'),
    
    concat = require('gulp-concat'),
    
    browserify = require('browserify'),
    source = require('vinyl-source-stream'),
    stringify = require('stringify'),
    reactify = require('reactify'),
    uglify = require('gulp-uglify'),
    
    less = require('gulp-less'),
    prefix = require('gulp-autoprefixer'),
    minifyCSS = require('gulp-minify-css'),
    
    tinyLR = require('tiny-lr'),
    livereload = require('gulp-livereload'),
    
    listing = require('gulp-task-listing'),
    
    spawn = require('child_process').spawn,
    
    mochaPhantomjs = require('gulp-mocha-phantomjs'),
    mocha = require('gulp-mocha');

var node;


gulp.task('test', [ 'jshint' ], function() {
    return gulp.src([ 'test/spec-*.js' ], { read: false })
        .pipe(size({title: 'test', showFiles: true}))
        .pipe(mocha({
            reporter: 'spec'
        }));
});

gulp.task('jshint', function() {
    return gulp.src([ 'api.js', 'api/**/*.js', '!node_modules/**', '!public/**', '!data/**', '!demo/**' ])
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

// ========= public website ===========
// lint
gulp.task('lint-web', function() {
    return gulp.src('./web/**/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});

gulp.task('lint-test', function() {
    return gulp.src('./test/**/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});

// browserify
gulp.task('browserify-web', ['lint-web'], function() {
    var b = browserify();
    b.transform(stringify({
        extensions: ['.html','.hbs'],
        minify: true,
        options: {
            removeComments: false
        }
    }));
    b.transform(reactify);
    b.add('./web/index.js');
    
    return b.bundle()
        .on('error', function(error) {
            gutil.log(gutil.colors.red(['Error (', error.plugin, '): ', error.message].join('')));
            // emit the end event, to properly end the task
            gulp.emit('task_err', error);
            this.emit('end');
        })
        .pipe(source('bundle.js'))
        .pipe(gulp.dest('build'))
        .pipe(uglify())
        .pipe(gulp.dest('public/js/'));
});

gulp.task('browserify-test', ['lint-test'], function() {
    var b = browserify();
    b.transform(stringify({
        extensions: ['.html','.hbs'],
        minify: true,
        options: {
            removeComments: false
        }
    }));
    b.add('./test/web/index.js');
    
    return b.bundle()
        .on('error', function(error) {
            gutil.log(gutil.colors.red(['Error (', error.plugin, '): ', error.message].join('')));
            // emit the end event, to properly end the task
            gulp.emit('task_err', error);
            this.emit('end');
        })
        .pipe(source('bundle-test.js'))
        .pipe(gulp.dest('build'));
});

// styles
gulp.task('styles', function() {
    return gulp.src('web/less/*.less')
        .pipe(less())
        .pipe(prefix({ cascade: true }))
        .pipe(concat('bundle.css'))
        .pipe(gulp.dest('build'))
        .pipe(minifyCSS())
        .pipe(gulp.dest('public/css/'));
});

gulp.task('build', ['styles','browserify-web']);

// Live reload
var lr = null;
gulp.task('live-reload', function() {
    lr = tinyLR();
    lr.listen(35729);
});

function notifyLiveReload(event) {
    if (lr) {
        console.log(event);
        gulp.src(event.path, {read: false})
            .pipe(livereload(lr));
    }
}

// watch
gulp.task('watch', ['live-reload'], function() {
    gulp.watch(['web/**/*.js', 'web/**/*.html'], ['browserify-web'], notifyLiveReload);
    gulp.watch('modules/**/*.js', ['browserify-web'], notifyLiveReload);
    gulp.watch('test/web/**/*.js', ['browserify-test']);
    
    gulp.watch('web/less/**/*.less', ['styles'], notifyLiveReload);
    
    gulp.watch('public/**/*.html', notifyLiveReload);
});

// test
gulp.task('test', ['lint-test', 'browserify-test'], function() {
    return gulp.src('test/web/index.html')
        .pipe(mochaPhantomjs());
});