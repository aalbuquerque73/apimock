/*jslint node: true, nomen: true, regexp: true, vars: true */
"use strict";

var gulp = require('gulp'),
    less = require('gulp-less'),
    path = require('path'),
    spawn = require('child_process').spawn,
    node,
    theseus;

var watchList = [
    'app.js',
    'config/*.json',
    'routes/*.js',
    'views/*.jade',
    'js/**/*.js',
    '!config/runtime.json'
];

gulp.task('default', ['run']);

gulp.task('run', [ 'server', 'watch' ], function () {
    gulp.watch(watchList, [ 'server' ]);
});

gulp.task('debug', ['theseus', 'watch'], function() {
    gulp.watch(watchList, ['theseus']);
});

gulp.task('server', function () {
    if (node) {
        console.log('[node] kill');
        node.kill();
    }
    node = spawn('node', ['bin/www'], {stdio: 'inherit'});
    node.on('close', function (code) {
        if (code === 8) {
            console.log('Error detected, waiting for changes...');
        }
    });
});

gulp.task('theseus', function() {
    if (theseus) {
        console.log('[theseus] kill');
        theseus.kill('SIGHUP');
    }
    theseus = spawn('node-theseus', ['bin/www'], {stdio: 'inherit'});
    theseus.on('close', function(code) {
        if (code === 8) {
            console.log('Error detected, wating for changes...');
        }
    });
});

gulp.task('less', function () {
    return gulp.src('./less/**/*.less')
        .pipe(less())
        .pipe(gulp.dest('./public/styles'));
});

gulp.task('watch', [ 'less' ], function () {
    gulp.watch('./less/**/*.less', [ 'less' ]);
});

process.on('exit', function () {
    if (node) {
        node.kill();
    }
    if (theseus) {
        theseus.kill();
    }
});