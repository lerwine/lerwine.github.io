var gulp = require('gulp');
var webserver = require('gulp-webserver');
var mocha = require('gulp-mocha');
var ts = require("gulp-typescript");
var fs = require("fs");
var path = require("path");

var tsScriptProject = ts.createProject("tsconfig.json");
var tsPublishProject = ts.createProject("tsconfig-publish.json");

var deployLib = [
    { source: "node_modules/popper.js/dist", target: "dist/lib/popper.js" },
    { source: "node_modules/jquery/dist", target: "dist/lib/query" },
    { source: "node_modules/bootstrap/dist", target: "dist/lib/bootstrap" },
    { source: "node_modules/bootstrap-table/dist", target: "dist/lib/bootstrap-table" },
    { source: "node_modules/angular", target: "dist/lib/angular", rm: ["bower.json", "index.js", "package.json"] }
];

function cleanDir(src) {
    if (!fs.existsSync(src) || !fs.statSync(src).isDirectory())
        return;
    fs.readdirSync(src).forEach(function(name) {
        var p = path.join(src, name);
        if (fs.statSync(p).isDirectory()) {
            cleanDir(p);
            //console.debug("rmdir '" + p + "'");
            fs.rmdirSync(p);
        }
        else {
            //console.debug("rm '" + p + "'");
            fs.unlinkSync(p);
        }
    });
}

function copyDir(src, target) {
    //console.debug("cpdir '" + src + "' '" + target + "'");
    if (!fs.existsSync(src) || !fs.existsSync(target) || !fs.statSync(src).isDirectory() || !fs.statSync(target).isDirectory())
        return;
    fs.readdirSync(src).forEach(function(name) {
        var sp = path.join(src, name);
        var tp = path.join(target, name);
        var stat = fs.statSync(sp);
        if (stat.isDirectory()) {
            if (fs.existsSync(tp)) {
                if (!fs.statSync(tp).isDirectory()) {
                    //console.debug("rm '" + tp + "'");
                    fs.unlinkSync(tp);
                    //console.debug("mkdir '" + tp + "'");
                    fs.mkdirSync(tp);
                }
            } else
                fs.mkdirSync(tp);
            copyDir(sp, tp);
        } else if (stat.isFile()) {
            if (fs.existsSync(tp) && fs.statSync(tp).isDirectory()) {
                cleanDir(tp);
                //console.debug("rmdir '" + tp + "'");
                fs.rmdirSync(tp);
            }
            //console.debug("cp '" + sp + "' '" + tp + "'");
            fs.copyFileSync(sp, tp);
        }
    });
}

gulp.task("clean-dist", function() {
    cleanDir(path.join(tsScriptProject.config.compilerOptions.outDir, "script"));
    deployLib.forEach(function(a) {
        cleanDir(path.join(__dirname, a.target));
    });
});

gulp.task('build-dist', function() {
    var scriptPath = path.join(tsScriptProject.config.compilerOptions.outDir, "script");
    var libPath = path.join(tsScriptProject.config.compilerOptions.outDir, "lib");
    var stat;
    if (fs.existsSync(scriptPath)) {
        stat = fs.statSync(scriptPath);
        if (!stat.isDirectory()) {
            fs.unlinkSync(scriptPath);
            fs.mkdirSync(scriptPath);
        }
    } else
        fs.mkdirSync(scriptPath);
    deployLib.forEach(function(a) {
        var pathNodes = [];
        for (var cp = a.target; typeof(cp) == "string" && cp.length > 0 && cp != "."; cp = path.dirname(cp))
            pathNodes.unshift(path.basename(cp));
        pathNodes.reduce(function (cp, n) {
            var np = path.join(cp, n);
            if (fs.existsSync(np)) {
                if (fs.statSync(np).isDirectory())
                    return np;
                fs.unlinkSync(np);
            }
            fs.mkdirSync(np);
            return np;
        }, __dirname);
        var targetPath = path.join(__dirname, a.target);
        copyDir(path.join(__dirname, a.source), targetPath);
        if (typeof(a.rm) == "object" && a.rm !== null && Array.isArray(a.rm))
            a.rm.forEach(function(f) {
                var p = path.join(targetPath, f);
                if (!fs.existsSync(p))
                    return;
                var s = fs.statSync(p);
                //console.debug("rm " + p);
                if (s.isFile())
                    fs.unlinkSync(p);
                else if (s.isDirectory()) {
                    cleanDir(p);
                    fs.rmdirSync(p);
                }
            });
    });
    return tsScriptProject.src()
        .pipe(tsScriptProject())
        .pipe(gulp.dest(tsScriptProject.config.compilerOptions.outDir));
});

gulp.task('rebuild-dist', ['clean-dist'], function() {
    tsScriptProject.src()
        .pipe(tsScriptProject())
        .pipe(gulp.dest(tsScriptProject.config.compilerOptions.outDir));
});

gulp.task('startWebServer', function() {
    gulp.src('./dist').pipe(webserver({
            livereload: true,
            directoryListing: true,
            open: true,
            port: 8085
        }));
});

gulp.task('stopWebServer', function() {
    var stream = gulp.src('./dist').pipe(webserver());
    stream.emit('kill');
});