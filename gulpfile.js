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

function convertFromGitChangeShortFormat(s) {
    if (typeof(s) != "string")
        return "Unknown";
    switch (s) {
        case ".":
            return "Unmodified";
        case "M":
            return "Modified";
        case "A":
            return "Added";
        case "D":
            return "Deleted";
        case "R":
            return "Renamed";
        case "C":
            return "Copied";
        case "U":
            return "Updated but unmerged";
        case ".A":
            return "Not updated";
        case ".D":
            return "Not updated; Deleted in work tree";
        case ".M":
            return "Not updated; Work tree changed since index";
        case "M.":
            return "Updated in index; Index and work tree matches";
        case "MM":
            return "Updated in index; Work tree changed since index";
        case "MD":
            return "Updated in index; Deleted in work tree";
        case "A.":
            return "Added to index; Index and work tree matches";
        case "AM":
            return "Added to index; Work tree changed since index";
        case "D.":
            return "Deleted from index";
        case "R.":
            return "Renamed in index; Index and work tree matches";
        case "RM":
            return "Renamed in index; Work tree changed since index";
        case "C.":
            return "Copied in index; Index and work tree matches";
        case "CM":
            return "Copied in index; Work tree changed since index";
        case ".R":
        case "DR":
            return "Renamed in work tree";
        case ".C":
        case "DC":
            return "Copied in work tree";
        case "DD":
            return "Unmerged, both deleted";
        case "AU":
            return "Unmerged, added by us";
        case "UD":
            return "Unmerged, deleted by them";
        case "UA":
            return "Unmerged, added by them";
        case "DU":
            return "Unmerged, deleted by us";
        case "AA":
            return "Unmerged, both added";
        case "UU":
            return "Unmerged, both modified";
        case "?":
        case "??":
            return "Untracked";
        case "!":
        case "!!":
            return "Ignored";
        default:
            if (s.length != 2)
                return "Unknown (" + s + ")";
            if (s.substr(0, 1) == "A")
                return "Added to index; " + convertFromGitChangeShortFormat(s.substr(1, 1)).toLowerCase() + " in work tree";
            return convertFromGitChangeShortFormat(s.substr(0, 1)) + " in index" + ((s.substr(1, 1) == "A") ? "Added to work tree" : convertFromGitChangeShortFormat(s.substr(1, 1)).toLowerCase() + " in work tree");
    }
}

function TrackedGitChange(str) {
    var type = (typeof(str) != "string" || str.length == 0) ? "" : str.substr(0, 1);
    var matchResult, i;
    switch (type) {
        case "1":
            if (typeof(matchResult = str.match(TrackedGitChange.ordinaryRe)) != "object" || matchResult === null || matchResult.length < 13)
                return;
            this.type = "normal";
            break;
        case "2":
            if (typeof(matchResult = str.match(TrackedGitChange.copiedRe)) != "object" || matchResult === null || matchResult.length < 16)
                return;
            this.type = (matchResult[12] === "R") ? "rename" : "copy";
            break;
        case "u":
        case "U":
            if (typeof(matchResult = str.match(TrackedGitChange.unmergedRe)) != "object" || matchResult === null || matchResult.length < 15)
                return;
            this.type = "unmerged";
            break;
        case "?":
            this.type = "untracked";
            if (str.length > 2)
                this.pathName = str.substr(2);
            this.message = "Untracked file";
            this.headFileMode = undefined;
            this.indexFileMode = undefined;
            this.headObjectName = undefined;
            this.indexObjectName = undefined;
            this.score = undefined;
            this.stage1FileMode = undefined;
            this.stage2FileMode = undefined;
            this.stage3FileMode = undefined;
            this.stage1ObjectName = undefined;
            this.stage2ObjectName = undefined;
            this.stage3ObjectName = undefined;
            return this;
        case "!":
            this.type = "ignored";
            if (str.length > 2)
                this.pathName = str.substr(2);
            this.message = "Untracked file";
            this.headFileMode = undefined;
            this.indexFileMode = undefined;
            this.headObjectName = undefined;
            this.indexObjectName = undefined;
            this.score = undefined;
            this.stage1FileMode = undefined;
            this.stage2FileMode = undefined;
            this.stage3FileMode = undefined;
            this.stage1ObjectName = undefined;
            this.stage2ObjectName = undefined;
            this.stage3ObjectName = undefined;
            return this;
    }
    if (typeof(matchResult) != "object" || matchResult === null) {
        this.message = str;
        return;
    }
    
    this.message = convertFromGitChangeShortFormat(matchResult[1]);
    this.indexMessage = convertFromGitChangeShortFormat(matchResult[2]);
    this.workingCopyMessage = convertFromGitChangeShortFormat(matchResult[3]);
    this.isSubModule = (typeof(matchResult[4]) == "string");
    if (this.isSubModule) {
        this.subModuleCommitChanged = matchResult[4] === "C";
        this.subModuleHasTrackedChanges = matchResult[5] === "M";
        this.subModuleHasUntrackedChanges = matchResult[6] === "U";
    }
    if (type == "unmerged") {
        this.stage1FileMode = parseInt(matchResult[7], 8);
        this.stage2FileMode = parseInt(matchResult[8], 8);
        this.stage3FileMode = parseInt(matchResult[9], 8);
        this.workTreeFileMode = parseInt(matchResult[10], 8);
        this.stage1ObjectName = matchResult[11];
        this.stage2ObjectName = matchResult[12];
        this.stage3ObjectName = matchResult[13];
        this.pathName = matchResult[14];
        this.headFileMode = undefined;
        this.indexFileMode = undefined;
        this.headObjectName = undefined;
        this.indexObjectName = undefined;
        this.score = undefined;
        return this;
    }
    this.headFileMode = parseInt(matchResult[7], 8);
    this.indexFileMode = parseInt(matchResult[8], 8);
    this.workTreeFileMode = parseInt(matchResult[9], 8);
    this.headObjectName = matchResult[10];
    this.indexObjectName = matchResult[11];
    if (this.type == "normal") {
        this.score = undefined;
        this.pathName = matchResult[12];
    } else {
        this.score = parseInt(matchResult[13]);
        this.pathName = matchResult[14];
        this.originalPath = matchResult[15];
    }
    this.stage1FileMode = undefined;
    this.stage2FileMode = undefined;
    this.stage3FileMode = undefined;
    this.stage1ObjectName = undefined;
    this.stage2ObjectName = undefined;
    this.stage3ObjectName = undefined;
    return this;
}
TrackedGitChange.prototype.pathName = "";
TrackedGitChange.prototype.originalPath = "";
TrackedGitChange.prototype.type = "unknown";
TrackedGitChange.prototype.message = "";
TrackedGitChange.prototype.indexMessage = "";
TrackedGitChange.prototype.workingCopyMessage = "";
TrackedGitChange.prototype.isSubModule = false;
TrackedGitChange.prototype.subModuleCommitChanged = false;
TrackedGitChange.prototype.subModuleHasTrackedChanges = false;
TrackedGitChange.prototype.subModuleHasUntrackedChanges = false;
TrackedGitChange.prototype.subModuleHasUntrackedChanges = false;
TrackedGitChange.prototype.headFileMode = 0;
TrackedGitChange.prototype.indexFileMode = 0;
TrackedGitChange.prototype.workTreeFileMode = 0;
TrackedGitChange.prototype.headObjectName = "";
TrackedGitChange.prototype.indexObjectName = "";
TrackedGitChange.prototype.score = 0;
TrackedGitChange.prototype.stage1FileMode = 0;
TrackedGitChange.prototype.stage2FileMode = 0;
TrackedGitChange.prototype.stage3FileMode = 0;
TrackedGitChange.prototype.stage1ObjectName = "";
TrackedGitChange.prototype.stage2ObjectName = "";
TrackedGitChange.prototype.stage3ObjectName = "";
TrackedGitChange.ordinaryRe = /^1\s+(([MADRCU.])([MADRCU.]))\s+(?:N\.{3}|S([C.])([M.])([U.]))\s+([0-7]+)\s+([0-7]+)\s+([0-7]+)\s+(\S+)\s+(\S+)\s+(.+)$/;
TrackedGitChange.copiedRe = /^2\s+(([MADRCU.])([MADRCU.]))\s+(?:N\.{3}|S([C.])([M.])([U.]))\s+([0-7]+)\s+([0-7]+)\s+([0-7]+)\s+(\S+)\s+(\S+)\s+([RC])(\d+)\s+([^\t])\t(.+)$/;
TrackedGitChange.unmergedRe = /^u\s+(([MADRCU.])([MADRCU.]))\s+(?:N\.{3}|S([C.])([M.])([U.]))\s+([0-7]+)\s+([0-7]+)\s+([0-7]+)\s+([0-7]+)\s+(\S+)\s+(\S+)\s+(\S+)\s+(.+)$/;

function GitStatus(s) {
    this.upstream = undefined;
    this.changes = [];
    this.ignoredChanges = [];
    var nlRe = /[\r\n]+/;
    var lines;
    if (typeof(s) == "string")
        lines = s.split(nlRe);
    else {
        if (typeof(s) != "object" || s === null || !Array.isArray(s))
            return;
        lines = [];
        s.map(function(o) { return typeof(o) == "string"; }).forEach(function(ln) { lines = lines.concat(ln.split(nlRe)); });
    }
    this.changes = lines.map(function(ln) {
        if (ln.trim().length == 0)
            return;
        var type, matchResult, i;
        if (ln.substr(0, 1) != "#") {
            var chg = new TrackedGitChange(ln);
            if (chg.type != "ignored" && chg.type != "unknown" && !(debugGulp && chg.pathName == "gulpfile.js"))
                return chg;
            this.ignoredChanges.push(chg);
            return;
        }
        if (typeof(matchResult = ln.match(GitStatus.gsRe)) != "object" || matchResult === null || matchResult.length < 7)
            return;
        switch (matchResult[1]) {
            case "oid":
                this.currentCommit = matchResult[2];
                break;
            case "head":
                this.currentBranch = matchResult[2];
                break;
            case "upstream":
                if (typeof(matchResult[3] == "string"))
                    this.upstream = {
                        remote: matchResult[3],
                        branch: matchResult[4]
                    };
                break;
            default:
                if (typeof(matchResult[5]) == "string") {
                    this.aheadCount = parseInt(matchResult[5]);
                    this.behindCount = parseInt(matchResult[6]);
                }
                break;
        }
    }, this).filter(function(r) { return typeof(r) == "object"; });
    return this;
}
GitStatus.prototype.currentCommit = "";
GitStatus.prototype.currentBranch = "";
GitStatus.prototype.upstream = { remote: "", branch: "" };
GitStatus.prototype.aheadCount = 0;
GitStatus.prototype.behindCount = 0;
GitStatus.prototype.changes = [new TrackedGitChange()];
GitStatus.prototype.ignoredChanges = [new TrackedGitChange()];
GitStatus.gsRe = /^#\s+branch.(oid|head|upstream|ab)\s+(([^\/]+)\/(\S.*)|\+(\d+)\s+-(\d+)|.+)/;

var loadPackageResult = parseFile(Path.join(__dirname, "package.json"), function(filePath) {
    var jsonData = JSON.parse(FS.readFileSync(filePath));
    if (typeof(jsonData.main) == "undefined")
        throw new Error("main setting is not specified");
    if (typeof(jsonData.main) != "string" || jsonData.main.trim().length == 0)
        throw new Error("Invalid main setting");
    var dirname = Path.dirname(ensureRelativePath(jsonData.main));
    var stat = FS.statSync(dirname);
    if (!stat.isDirectory())
        throw new Error("Parent path of '" + jsonData.main + "' does not refer to a subdirectory.");
    return { mainRoot: Path.resolve(dirname), packageJSON: jsonData };
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
    outDir = ensureRelativePath(outDir);
    var stat;
    try { stat = FS.statSync(outDir); } catch (e) { }
    if (typeof(stat) == "undefined")
        stat = FS.statSync(Path.dirname(outDir));
    if (!stat.isDirectory())
        throw new Error("Path '" + outDir + "' does not refer to a subdirectory.");
    return { outDir: Path.resolve(outDir), tsConfig: tsProj };
});

var webServerStatus = {
    started: false
};

var deployTaskflowState  = {
    startingStatus: new GitStatus(""),
    currentStatus: new GitStatus(""),
    localBranches: [],
    remoteBranches: [],
    tempFolder: {
        path: undefined,
        cleanupCallback: undefined
    },
    failed: false
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

gulp.task('deploy', function(done) {
    if (deployTaskflowState.startingStatus.currentBranch.length > 0)
        console.error('Deployment already in progress');
    else if (isIParseErrorResult(loadPackageResult))
        console.error(loadPackageResult.errorMessage + ": " + loadPackageResult.errorObject);
    else {
        deployTaskflowState.failed = true;
        deployTaskflowState.startingStatus.currentBranch = "?";
        Git.exec({ args: 'branch --list' }, function(localErr, localStdout) {
            if (localErr)
                console.error(localErr);
            else if (!localStdout)
                console.error("Cannot determine local branches");
            else {
                deployTaskflowState.localBranches = localStdout.split(/\r\n?|\n/).map(function(s) {
                var matchResult = s.match(/^\s*(?:\*\s+)?(\S+(?:\s+\S+)*)\s*$/);
                    if (typeof(matchResult) == "object" && matchResult !== null && matchResult.length > 1)
                        return matchResult[1];
                }).filter(function(a) { return typeof(a) == "string"; });
                Git.exec({ args: 'branch --list -r' }, function(remotesErr, remotesStdout) {
                    if (remotesErr)
                        console.error(remotesStdout);
                    else if (!localStdout)
                        console.error("Cannot determine remote branches");
                    else {
                        deployTaskflowState.remoteBranches = remotesStdout.split(/\r\n?|\n/).map(function(s) {
                            var matchResult = s.match(/^\s*(?:\*\s+)?(\S+(?:\s+\S+)*)\/(\S+(?:\s+\S+)*)\s*$/);
                            if (typeof(matchResult) == "object" && matchResult !== null && matchResult.length > 2)
                                return { remote: matchResult[1], name: matchResult[2] };
                        }).filter(function(a) { return typeof(a) == "object"; });
                        if (deployTaskflowState.localBranches.filter(function(s) { return s == "gh-pages"; }).length == 0 && deployTaskflowState.remoteBranches.filter(function(a) { return a.name == "gh-pages"; }).length == 0)
                            console.error("'gh-pages' branch not found.");
                        else {
                            Git.status({ args: "--porcelain=2 -b" }, function(statErr, statStdout) {
                                if (statErr)
                                    console.error(statErr);
                                else if (!statStdout)
                                    console.error("Cannot determine current repository status");
                                else {
                                    deployTaskflowState.startingStatus = new GitStatus(statStdout);
                                    if (deployTaskflowState.startingStatus.currentBranch.length == 0)
                                        console.error("Could not determine current branch");
                                    else if (deployTaskflowState.startingStatus.currentBranch == "gh-pages")
                                        console.error("Cannot deploy from the 'gh-pages' branch");
                                    else if (deployTaskflowState.startingStatus.changes.length > 0) {
                                        Git.status({ }, function(statErr, statStdout) {
                                            var errMsg;
                                            if (deployTaskflowState.startingStatus.changes.length == 1)
                                                errMsg = "1 change needs to be checked in or resolved:\n";
                                            else
                                                errMsg = deployTaskflowState.startingStatus.changes.length + " changes need to be checked in or resolved:\n";
                                            if (statErr) {
                                                console.error(statErr);
                                                console.error(errMsg);
                                            }
                                            else if (!statStdout)
                                                console.error("Cannot determine current repository status; " + errMsg);
                                            else
                                                console.error(errMsg + statStdout);
                                            done();
                                        });
                                        return;
                                    } else {
                                        deployTaskflowState.failed = false;
                                        runSequence('copy-to-temp-folder', 'remove-temp-folder', done);
                                        return;
                                    }
                                    done();
                                }
                            });
                            return;
                        }
                    }
                    done();
                });
                return;
            }
            done();
        });
        return;
    }
    done();
});

gulp.task('copy-to-temp-folder', function(done) {
    tmp.dir(function(err, path, cleanupCallback) {
        if (err) {
            console.error(err);
            done();
        } else {
            deployTaskflowState.tempFolder = {
                path: path,
                cleanupCallback: cleanupCallback
            };
            return gulp.src(Path.join(loadPackageResult.mainRoot, "**/*")).pipe(gulp.dest(path));
        }
    });
});

gulp.task('git-checkout-gh-pages', function(done) {
    Git.checkout('gh-pages', { }, function (err) {
        if (err)
            console.error(err);
        else {
            Git.status({ args: "--porcelain=2 -b" }, function(statErr, statStdout) {
                if (statErr)
                    console.error(statErr);
                else if (!statStdout)
                    console.error("Cannot determine current repository status");
                else {
                    deployTaskflowState.currentStatus = new GitStatus(statStdout);
                    if (deployTaskflowState.currentStatus.currentBranch.length == 0)
                        console.error("Could not determine current branch");
                    else if (deployTaskflowState.currentStatus.currentBranch != "gh-pages")
                        console.error("Failed to check out the 'gh-pages' branch");
                    done();
                }
            });
            return;
        }
        done();
    });
});

gulp.task('copy-from-temp-folder', function(done) {
    if (typeof(deployTaskflowState.tempFolder) != "object" || deployTaskflowState.tempFolder === null || typeof(deployTaskflowState.tempFolder.path) != "string") {
        console.error("create-tempfolder must be called in sequence before this task.");
        done();
    } else
        return gulp.src(Path.join(deployTaskflowState.tempFolder.path, "**/*")).pipe(gulp.dest(__dirname));
});

gulp.task('remove-temp-folder', function(done) {
    if (typeof(deployTaskflowState.tempFolder) == "object" && deployTaskflowState.tempFolder !== null && typeof(deployTaskflowState.tempFolder.cleanupCallback) == "function")
        try { deployTaskflowState.tempFolder.cleanupCallback(); } catch (e) { }
        finally {
            deployTaskflowState.tempFolder = undefined;
        }
    done();
});

gulp.task('push-gh-pages', function(done) {
    if (deployTaskflowState.currentStatus.currentBranch != "gh-pages")
        console.error("gh-pages not checked out");
    done();
});

gulp.task('git-uncheckout', function(done) {
    if (deployTaskflowState.currentStatus.currentBranch != "gh-pages") {
        console.error("gh-pages not checked out");
        done();
        return;
    }
    Git.checkout(deployTaskflowState.startingStatus.currentBranch , { }, function (err) {
        if (err) {
            console.error(err);
            done();
            return;
        }
        Git.status({ args: "--porcelain=2 -b" }, function(statErr, statStdout) {
            if (statErr)
                console.error(statErr);
            else if (!statStdout)
                console.error("Cannot determine current repository status");
            else {
                deployTaskflowState.currentStatus = new GitStatus(statStdout);
                if (deployTaskflowState.currentStatus.currentBranch.length == 0)
                    console.error("Could not determine current branch");
                else if (deployTaskflowState.currentStatus.currentBranch != deployTaskflowState.startingStatus.currentBranch)
                    console.error("Failed to check out the '" + deployTaskflowState.startingStatus.currentBranch + "' branch");
                done();
            }
        });
    });
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
