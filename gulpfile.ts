import * as Gulp from 'gulp';
import * as TS from "gulp-typescript";
import * as FS from "fs";
import * as Path from "path";
import * as gulpIf from 'gulp-if';
import * as tmp from 'tmp';
import { Project } from 'gulp-typescript/release/project';

/*
import * as WebServer from 'gulp-webserver';
import * as Mocha from 'gulp-mocha';
import * as Del from "del";
import * as gulpFail from 'gulp-fail';
*/

import { Duplex } from 'stream';
declare function gulpFail(message?: any, failAfterCompletion?: any): Duplex;
declare function Del(patterns: string|string[]): Promise<string[]>;
declare function WebServer(options?: {
    livereload: boolean,
    directoryListing: boolean,
    open: boolean,
    port: number
});
//declare function gulpIf(condition: boolean|StartFilterCondition|{(fs: File): boolean }|RegExp, stream: NodeJS.ReadWriteStream, elseStream?: NodeJS.ReadWriteStream): NodeJS.ReadWriteStream;

interface IParseErrorResult { errorObject: any, errorMessage: string }
interface ParseValidatedFileCallback<T> { (filePath: string): T }
interface IPlainObject { [index: string]: any };
interface IPackageConfig {
    main?: string|null
}
interface ILoadPackageResult {
    packageJSON: IPackageConfig,
    mainRoot: string
};
interface ILoadTsConfigResult {
    tsConfig: Project,
    outDir: string
}
interface ITsConfigCompilerOptions {
    outDir?: string|null;
}
class PathHelper {
    static isIParseErrorResult(obj?: any): obj is IParseErrorResult {
        if (typeof(obj) == "object" && obj != null && !Array.isArray(obj)) {
            let a: IPlainObject = <IPlainObject>obj;
            return typeof(a["errorObject"]) != "undefined" && a["errorObject"] !== null && typeof(a["errorMessage"]) == "string";
        }
    }
    static ensureRelativePath(pathString?: string|string[]): string|string[] {
        if (typeof(pathString) == "string") {
            var relative = Path.normalize(Path.join(Path.dirname(pathString), Path.basename(pathString)));
            if (relative.startsWith(Path.sep))
                return (relative.length == 1) ? "." : relative.substr(1);
            return relative;
        }
        if (typeof(pathString) == "object" && Array.isArray(pathString))
            return <string[]>pathString.map(this.ensureRelativePath);
    }
    static parseFile<T>(filePath: string, callback: ParseValidatedFileCallback<T>): T|IParseErrorResult {
        let result: T|undefined;
        let errObj: any|undefined;
        let errMsg: string|undefined;
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
}
let loadPackageResult: ILoadPackageResult|IParseErrorResult = PathHelper.parseFile<ILoadPackageResult>(Path.join(__dirname, "package.json"), function(filePath: string) {
    let jsonData: IPackageConfig = <IPackageConfig>(JSON.parse(filePath));
    if (typeof(jsonData.main) == "undefined")
        throw new Error("main setting is not specified");
    if (typeof(jsonData.main) != "string" || jsonData.main.trim().length == 0)
        throw new Error("Invalid main setting");
    let dirname: string = Path.dirname(jsonData.main);
    let stat: FS.Stats = FS.statSync(dirname);
    if (!stat.isDirectory())
        throw new Error("Parent path of '" + jsonData.main + "' does not refer to a subdirectory.");
    return <ILoadPackageResult>{ mainRoot: dirname, packageJSON: jsonData };
});
let loadTsConfigResult: ILoadTsConfigResult|IParseErrorResult = PathHelper.parseFile<ILoadTsConfigResult>(Path.join(__dirname, "tsconfig.json"), function(filePath: string) {
    let tsProj: Project = TS.createProject(filePath);
    if (typeof(tsProj.config.compilerOptions) != "object" || tsProj.config.compilerOptions === null)
        throw new Error("config.compilerOptions setting is not specified");
    let outDir: string|null|undefined = (<ITsConfigCompilerOptions>(tsProj.config.compilerOptions)).outDir;
    if (typeof(outDir) == "undefined")
        throw new Error("main setting is not specified");
    if (typeof(outDir) != "string" || outDir.trim().length == 0)
        throw new Error("Invalid main setting");
    let stat: FS.Stats|undefined;
    try { stat = FS.statSync(outDir); } catch { }
    if (typeof(stat) == "undefined")
        stat = FS.statSync(Path.dirname(outDir));
    if (!stat.isDirectory())
        throw new Error("Path '" + outDir + "' does not refer to a subdirectory.");
    return <ILoadTsConfigResult>{ outDir: outDir, tsConfig: tsProj };
});

let webServerStatus: { started: boolean } = {
    started: false
};

Gulp.task("clean", function() {
    if (PathHelper.isIParseErrorResult(loadTsConfigResult))
        return gulpFail(loadTsConfigResult.errorMessage + ": " + loadTsConfigResult.errorObject);
    return Del(Path.join(loadTsConfigResult.outDir, "**/*"));
});

Gulp.task('build-ts', function() {
    if (PathHelper.isIParseErrorResult(loadTsConfigResult))
        return gulpFail(loadTsConfigResult.errorMessage + ": " + loadTsConfigResult.errorObject);
    return loadTsConfigResult.tsConfig.src()
        .pipe(loadTsConfigResult.tsConfig())
        .pipe(Gulp.dest(loadTsConfigResult.outDir));
});

Gulp.task('rebuild-ts', ['clean'], function() {
    if (PathHelper.isIParseErrorResult(loadTsConfigResult))
        return gulpFail(loadTsConfigResult.errorMessage + ": " + loadTsConfigResult.errorObject);
    return loadTsConfigResult.tsConfig.src()
        .pipe(loadTsConfigResult.tsConfig())
        .pipe(Gulp.dest(loadTsConfigResult.outDir));
});

Gulp.task('deploy', function() {
    if (PathHelper.isIParseErrorResult(loadPackageResult))
        return gulpFail(loadPackageResult.errorMessage + ": " + loadPackageResult.errorObject);
    var tempDir = tmp.dirSync();
    Gulp.src(Path.join(loadPackageResult.mainRoot, "**/*")).pipe(Gulp.dest(tempDir.name)).end(function() {

    });
});

Gulp.task('startWebServer', function() {
    if (PathHelper.isIParseErrorResult(loadPackageResult))
        return gulpFail(loadPackageResult.errorMessage + ": " + loadPackageResult.errorObject);
    return Gulp.src(loadPackageResult.mainRoot).pipe(gulpIf(function() {
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

Gulp.task('stopWebServer', function() {
    if (PathHelper.isIParseErrorResult(loadPackageResult))
        return gulpFail(loadPackageResult.errorMessage + ": " + loadPackageResult.errorObject);
    return Gulp.src(loadPackageResult.mainRoot).pipe(gulpIf(function() {
        if (!webServerStatus.started)
            return false;
        webServerStatus.started = false;
        return true;
    }, WebServer().emit('kill')));
});
