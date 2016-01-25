var gulp = require('gulp');

var pkg = require('./package.json');
var dirs = pkg['configs'].directories;

gulp.task('clean', clean);
gulp.task('copyRoot', copyFiles);
gulp.task('sass', buildSass);
gulp.task('resume', buildResume);

gulp.task('copyAll', function(done) {
    runSequence('copyRoot', done);
});

var runSequence = require('run-sequence');
gulp.task('default', function(done) {
    runSequence('clean', 'sass', 'resume', done);
});

var del = require('del');
function clean(done) {
    del([dirs.dist]).then(() => done());
}

function copyFiles() {
    return copyType(['*', '../package.json']);
}

var path = require('path');
function copyType(files, inType, outType) {
    var flat = files
        .map(f => path.join(dirs.src, inType || '', f));

    return gulp.src(flat, {dot: true})
        .pipe(gulp.dest(path.join(dirs.dist, outType || '')));
}

var sass = require('gulp-sass');
function buildSass() {
    var base = dirs.src + '/sass';
    return gulp.src(path.join(base, '/*.scss'), {base: base})
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest(dirs.dist));
}

function buildResume() {
    var resume = require(pkg.configs.resume);
    var template = require('./src/cli.js');
    var path = dirs.dist + '/resume.html';

    template.writeResume(resume, path);
}


