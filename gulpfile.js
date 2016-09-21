var gulp = require('gulp'),
gutil = require('gulp-util'),
notify = require('gulp-notify'),
less = require('gulp-less'),
plumber = require('gulp-plumber'),
gulpif = require('gulp-if'),
jshint = require('gulp-jshint'),
stylish = require('jshint-stylish')
merge = require('utils-merge'),
argv = require('yargs').argv,
source = require('vinyl-source-stream'),
bSync = require('browser-sync'),

browserify = require('browserify'),
babelify = require('babelify'),
watchify = require('watchify');

var dest = './public/';
var src = './app/';

var production = !!argv.production;

gulp.task('watchify', function() {
    var args = merge(watchify.args, {debug: true});
    var bundler = watchify(browserify('./app/app.js', args)).transform(babelify, {presets: ['es2015']});
    bundle_js(bundler);

    bundler.on('update', function() {
        bundle_js(bundler);
    });
});

gulp.task('jslint', function() {
    return gulp.src('./app/**/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter(stylish));
});

function bundle_js(bundler) {
    return bundler.bundle()
        .on('error', map_error)
        .pipe(source('main.js'))
        .pipe(gulp.dest(dest + 'js/'));
}

function map_error(err) {
    if(err.fileName) {
        gutil.log(gutil.colors.bgRed('Regular error: ' + err.name + ' error:'), gutil.colors.red(err));
    }
    else {
        gutil.log(gutil.colors.bgRed('Browserify error: ' + err.name + ' : ' + err.message));
    }

    this.emit('end');
}

gulp.task('less', function() {
    gulp.src('app/less/*.less')
    .pipe(less())
    .pipe(gulp.dest(dest + 'css/'));
});

gulp.task('browser-sync', function() {
    var files = dest + '**';

    bSync.init(files, {
        server: {
            baseDir: './public'
        }
    });
});

gulp.task('watch', function() {
    gulp.watch('./app/less/styles.less', ['less']);
    gulp.watch('./app/**/*.js', ['jslint']);
});

gulp.task('default', ['watch', 'watchify', 'browser-sync']);
