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


function isIParseErrorResult(obj) {
    return (typeof(obj) == "object" && obj != null && !Array.isArray(obj) && typeof(obj.errorObject) != "undefined" && obj.errorObject !== null && typeof(obj.errorMessage) == "string");
}

function ensureRelativePath(pathString) {
    if (typeof(pathString) == "string") {
        var relative = Path.normalize(Path.join(Path.dirname(pathString), Path.basename(pathString)));
        if (relative.startsWith(Path.sep))
            return (relative.length == 1) ? "." : relative.substr(1);
        return relative;
    }
    if (typeof(pathString) == "object" && Array.isArray(pathString))
        return pathString.map(ensureRelativePath);
}

function parseFile(filePath, callback) {
    var result, errObj, errMsg;
    try {
        var stat = FS.statSync(filePath);
        if (typeof(stat) == "undefined" || stat === null)
            throw new Error("File status unknown");
        if (stat.isDirectory())
            throw new Error("Path refers to a subdirectory");
        if (!stat.isFile())
            throw new Error("Path does not refer to a file");
        try { result = callback(filePath); }
        catch (e) {
            errObj = e;
            errMsg = "Error reading file: " + filePath;
        }
    } catch (exc) {
        errObj = exc;
        errMsg = "File not loaded: " + filePath;
    }
    if (typeof(result) != "undefined")
        return result;
    console.error(errObj);
    console.error(errMsg);
    return { errorObject: errObj, errorMessage: errMsg };
}

var loadPackageResult = parseFile(Path.join(__dirname, "package.json"), function(filePath) {
    var jsonData = JSON.parse(filePath);
    if (typeof(jsonData.main) == "undefined")
        throw new Error("main setting is not specified");
    if (typeof(jsonData.main) != "string" || jsonData.main.trim().length == 0)
        throw new Error("Invalid main setting");
    var dirname = Path.dirname(jsonData.main);
    var stat = FS.statSync(dirname);
    if (!stat.isDirectory())
        throw new Error("Parent path of '" + jsonData.main + "' does not refer to a subdirectory.");
    return { mainRoot: dirname, packageJSON: jsonData };
});

var loadTsConfigResult = parseFile(Path.join(__dirname, "tsconfig.json"), function(filePath) {
    var tsProj = TS.createProject(filePath);
    if (typeof(tsProj.config.compilerOptions) != "object" || tsProj.config.compilerOptions === null)
        throw new Error("config.compilerOptions setting is not specified");
    var outDir = tsProj.config.compilerOptions.outDir;
    if (typeof(outDir) == "undefined")
        throw new Error("main setting is not specified");
    if (typeof(outDir) != "string" || outDir.trim().length == 0)
        throw new Error("Invalid main setting");
    var stat;
    try { stat = FS.statSync(outDir); } catch (e) { }
    if (typeof(stat) == "undefined")
        stat = FS.statSync(Path.dirname(outDir));
    if (!stat.isDirectory())
        throw new Error("Path '" + outDir + "' does not refer to a subdirectory.");
    return { outDir: outDir, tsConfig: tsProj };
});

var webServerStatus = {
    started: false
};
var tempFolderStatus = {
    dependencyCount: 0,
    path: undefined,
    cleanupCallback: undefined,
    error: undefined
};
var checkoutStatus = {
    originalBranch: [],
    checkedOutBranch: undefined
};

gulp.task("clean", function() {
    if (isIParseErrorResult(loadTsConfigResult))
        return gulpFail(loadTsConfigResult.errorMessage + ": " + loadTsConfigResult.errorObject);
    return Del(Path.join(loadTsConfigResult.outDir, "**/*"));
});

gulp.task('build-ts', function() {
    if (isIParseErrorResult(loadTsConfigResult))
        return gulpFail(loadTsConfigResult.errorMessage + ": " + loadTsConfigResult.errorObject);
    return loadTsConfigResult.tsConfig.src()
        .pipe(loadTsConfigResult.tsConfig())
        .pipe(gulp.dest(loadTsConfigResult.outDir));
});

gulp.task('rebuild-ts', ['clean'], function() {
    if (isIParseErrorResult(loadTsConfigResult))
        return gulpFail(loadTsConfigResult.errorMessage + ": " + loadTsConfigResult.errorObject);
    return loadTsConfigResult.tsConfig.src()
        .pipe(loadTsConfigResult.tsConfig())
        .pipe(gulp.dest(loadTsConfigResult.outDir));
});

gulp.task('create-tempFolder', function(cb) {
    if (tempFolderStatus.dependencyCount > 0) {
        tempFolderStatus.dependencyCount = tempFolderStatus.dependencyCount + 1;
        cb();
    } else
        tmp.dir(function(err, path, cleanupCallback) {
            if (err)
                console.error(err);
            else if (tempFolderStatus.dependencyCount == 0) {
                tempFolderStatus.path = path;
                tempFolderStatus.cleanupCallback = cleanupCallback;
            } else
                cleanupCallback();
            tempFolderStatus.dependencyCount = tempFolderStatus.dependencyCount + 1;
            cb();
        });
});

gulp.task('remove-temp-folder', function(cb) {
    if (tempFolderStatus.dependencyCount > 0) {
        tempFolderStatus.dependencyCount = tempFolderStatus.dependencyCount - 1;
        if (tempFolderStatus.dependencyCount == 0) {
            tempFolderStatus.path = undefined;
            try { tempFolderStatus.cleanupCallback(); } catch (e) { } finally { tempFolderStatus.cleanupCallback = undefined; }
        }
    }
    cb();
});

gulp.task('copy-to-temp-folder', function(cb) {
    if (typeof(tempFolderStatus.path) != "string") {
        console.error("create-tempfolder must be called in sequence before this task.");
        cb();
    } else {
        var writeTempStream = gulp.src(Path.join(loadPackageResult.mainRoot, "**/*"));
        writeTempStream.on('finish', function() { cb(); });
        writeTempStream.pipe(gulp.dest(tempFolderStatus.path)).end();
    }
});

gulp.task('git-checkout-gh-pages', function(cb) {
    if (typeof(checkoutStatus.checkedOutBranch) == "string") {
        if (checkoutStatus.checkedOutBranch == "gh-pages") {
            cb();
            return;
        }
        // TODO: See if we need to commit, check in, etc
        Git.checkout('gh-pages', { }, function (err) {
            if (err)
                console.error(err);
            else {
                checkoutStatus.originalBranch.push(checkoutStatus.checkedOutBranch);
                checkoutStatus.checkedOutBranch = 'gh-pages';
            }
            cb();
        });
    }
    Git.exec({ args: 'branch' }, function(err, stdout) {
        if (err) {
            console.error(err);
            cb();
            return;
        }
        
        if (stdout) {
            var ra = stdout.match(/(?:^|[\r\n])[^\S\r\n]*\*[^\S\r\n]*(\S+(?:[^\S\r\n]+\S+)*)/);
            if (ra.length && ra.length > 1) {
                if (typeof(checkoutStatus.checkedOutBranch) == "string") {
                    if (checkoutStatus.checkedOutBranch != ra[1] && checkoutStatus.checkedOutBranch != 'gh-pages')
                        checkoutStatus.originalBranch.push(checkoutStatus.checkedOutBranch);
                }
                checkoutStatus.checkedOutBranch = ra[1];
                if (checkoutStatus.checkedOutBranch == "gh-pages") {
                    cb();
                    return;
                }
                // TODO: See if we need to commit, check in, etc
                Git.checkout('gh-pages', { }, function (err) {
                    if (err)
                        console.error(err);
                    else {
                        checkoutStatus.originalBranch.push(checkoutStatus.checkedOutBranch);
                        checkoutStatus.checkedOutBranch = 'gh-pages';
                    }
                    cb();
                });
            } else {
                console.warn("Unable to determine current branch");
            }
        }
    });
});

gulp.task('copy-from-temp-folder', function(cb) {
    if (typeof(tempFolderStatus.path) != "string") {
        console.error("create-tempfolder must be called in sequence before this task.");
        cb();
    } else {
        var writeTempStream = gulp.src(Path.join(tempFolderStatus.path, "**/*"));
        writeTempStream.on('finish', function() { cb(); });
        writeTempStream.pipe(gulp.dest(__dirname)).end();
    }
});

gulp.task('push-gh-pages', function(cb) {
    cb();
});

gulp.task('git-uncheckout', function(cb) {
    if (typeof(checkoutStatus.checkedOutBranch) == "string") {
        if (checkoutStatus.originalBranch.length == 0) {
            cb();
            return;
        }
        var newBranch = checkoutStatus.originalBranch.pop();
        Git.checkout(newBranch, { }, function (err) {
            if (err) {
                checkoutStatus.originalBranch.push(newBranch);
                console.error(err);
            } else
                checkoutStatus.checkedOutBranch = newBranch;
            cb();
        });
    }
});

gulp.task('deploy', function(cb) {
    if (isIParseErrorResult(loadPackageResult)) {
        console.error(loadPackageResult.errorMessage + ": " + loadPackageResult.errorObject);
        cb();
    } else
        runSequence('create-tempFolder', 'copy-to-temp-folder', 'git-checkout-gh-pages', 'copy-from-temp-folder', 'remove-temp-folder', 'push-gh-pages', 'git-uncheckout', cb);
});

gulp.task('startWebServer', function() {
    if (isIParseErrorResult(loadPackageResult))
        return gulpFail(loadPackageResult.errorMessage + ": " + loadPackageResult.errorObject);
    return gulp.src(loadPackageResult.mainRoot).pipe(gulpIf(function() {
        if (webServerStatus.started)
            return false;
        webServerStatus.started = true;
        return true;
    }, WebServer({
        livereload: true,
        directoryListing: true,
        open: true,
        port: 8085
    })));
});

gulp.task('stopWebServer', function() {
    if (isIParseErrorResult(loadPackageResult))
        return gulpFail(loadPackageResult.errorMessage + ": " + loadPackageResult.errorObject);
    return gulp.src(loadPackageResult.mainRoot).pipe(gulpIf(function() {
        if (!webServerStatus.started)
            return false;
        webServerStatus.started = false;
        return true;
    }, WebServer().emit('kill')));
});
