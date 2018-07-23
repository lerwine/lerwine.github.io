var debugGulp = true;

var gulp = require('gulp');
var WebServer = require('gulp-webserver');
var Mocha = require('gulp-mocha');
var TS = require("gulp-typescript");
var FS = require("fs");
var Path = require("path");
var Del = require("del");
var gulpFail = require('gulp-fail');
var gulpIf = require('gulp-if');
var tmp = require('tmp');
var Concat = require('gulp-concat');
var Git = require('gulp-git');
var runSequence = require('run-sequence');
var fileUtils = require('./bin/fs-utils');
var gitUtils = require('./bin/git-utils');
var http = require('http');

var loadPackageResult = fileUtils.loadPackageFile("./package.json");
var loadScriptDistTsConfigResult = fileUtils.loadTsConfigFile("./src/tsconfig-dist.json");
var loadScriptTestTsConfigResult = fileUtils.loadTsConfigFile("./src/tsconfig.json");
var loadBinTsConfigResult = fileUtils.loadTsConfigFile("./bin-src/tsconfig.json");

var webServerStatus = {
    started: false
};

gulp.task("clean", function() {
    if (fileUtils.isIParseErrorResult(loadScriptDistTsConfigResult))
        return gulpFail(loadScriptDistTsConfigResult.errorMessage + ": " + loadScriptDistTsConfigResult.errorObject);
    return Del(Path.join(loadScriptDistTsConfigResult.outDir, "**/*"));
});

gulp.task('build-script-dist', function() {
    if (fileUtils.isIParseErrorResult(loadScriptDistTsConfigResult))
        return gulpFail(loadScriptDistTsConfigResult.errorMessage + ": " + loadScriptDistTsConfigResult.errorObject);
    return loadScriptDistTsConfigResult.tsConfig.src()
        .pipe(loadScriptDistTsConfigResult.tsConfig())
        .pipe(gulp.dest(loadScriptDistTsConfigResult.outDir));
});

gulp.task('rebuild-script-dist', ['clean', 'build-script-dist']);

gulp.task('build-script-test', function() {
    if (fileUtils.isIParseErrorResult(loadScriptTestTsConfigResult))
        return gulpFail(loadScriptTestTsConfigResult.errorMessage + ": " + loadScriptTestTsConfigResult.errorObject);
    return loadScriptTestTsConfigResult.tsConfig.src()
        .pipe(loadScriptTestTsConfigResult.tsConfig())
        .pipe(gulp.dest(loadScriptTestTsConfigResult.outDir));
});

gulp.task('rebuild-script-test', ['clean', 'build-script-test']);

gulp.task('build-bin', function() {
    if (fileUtils.isIParseErrorResult(loadBinTsConfigResult))
        return gulpFail(loadBinTsConfigResult.errorMessage + ": " + loadBinTsConfigResult.errorObject);
    return loadBinTsConfigResult.tsConfig.src()
        .pipe(loadBinTsConfigResult.tsConfig())
        .pipe(gulp.dest(loadBinTsConfigResult.outDir));
});

gulp.task('build-all-dist', ['build-bin', 'build-script-dist']);

gulp.task('rebuild-all-dist', ['build-bin', 'rebuild-script-dist']);

gulp.task('build-all-test', ['build-bin', 'build-script-test']);

gulp.task('rebuild-all-test', ['build-bin', 'rebuild-script-test']);

var webServerConfig = {
    livereload: true,
    directoryListing: true,
    open: true,
    port: 8085
};
gulp.task('startWebServer', function(done) {
    var stream;
    if (fileUtils.isIParseErrorResult(loadPackageResult))
        stream = gulpFail(loadPackageResult.errorMessage + ": " + loadPackageResult.errorObject);
    else if (typeof(loadPackageResult.main) != "string")
        stream = gulpFail("main on package.json is not defined");
    else if (loadPackageResult.main.trim().length == 0)
        stream = gulpFail("main on package.json is empty");
    var path = Path.normalize(loadPackageResult.main);
    if (path.length > 0 && path.endsWith(Path.sep))
        path = path.substr(0, path.length = Path.sep.length);
    var stat;
    
    var pp;
    try { stat = FS.statSync(path); } catch (e) { stat = undefined; }
    if (typeof(stat) == "undefined") {
        pp = Path.parse(path);
        try { stat = FS.statSync(pp.dir); } catch (e) { }
        if (typeof(stat) == "undefined")
            stream = gulpFail("Neither \"" + path + "\" nor \"" + pp.dir + "\" (from main on package.json) exist");
        path = pp.dir;
    } else if (!stat.isDirectory())
        path = Path.parse(path).dir;
    if (typeof(stat) != "undefined") {
        stream = gulp.src(path);
        webServerConfig.middleware = function(req, res, next) {
            if (/__kill__\/?/.test(req.url)) {
                res.end();
                stream.emit('kill');
            }
            next();
        };
        stream.pipe(WebServer(webServerConfig));
        return;
    }
    stream.end(done);
    return stream;
});

gulp.task('stopWebServer', function(done) {
    http.request('http://localhost:' + webServerConfig.port + '/__kill__').on('close', done).end();
});