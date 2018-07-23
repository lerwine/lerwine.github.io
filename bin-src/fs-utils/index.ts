import * as FS from "fs";
import * as Path from "path";
import * as TS from "gulp-typescript";
import * as pathUtil from '../path-utils';

/**
 * Remove file or directory and all contents.
 * @param path Path to file or subdirectory.
 */
export function removeFsItemRecursive(path: string): void {
    let stat: FS.Stats|null|undefined;
    try { stat = FS.statSync(path); } catch (e) { stat = undefined; }
    if (typeof(stat) != "object" || stat === null)
        return;
    if (stat.isDirectory()) {
        let names: string[] = FS.readdirSync(path);
        for (var i = 0; i < names.length; i++) {
            let fullName: string = Path.join(path, names[i]);
            if (FS.statSync(fullName).isDirectory()) {
                removeFsItemRecursive(fullName);
                FS.rmdirSync(fullName);
            } else
                FS.unlinkSync(fullName);
        }
    }   
    FS.unlinkSync(path);
}

interface ISyncObjectBase {
    name: string;
    fullName: string;
    isDirectory: boolean;
}

interface ISyncDirectoryObject extends ISyncObjectBase {
    isDirectory: true;
}

function isSyncDirectoryObject(obj: ISyncObject): obj is ISyncDirectoryObject { return obj.isDirectory; }

interface ISyncFileObject extends ISyncObjectBase {
    isDirectory: false;
    mtimeMs: number;
    size: number;
}

type ISyncObject = ISyncDirectoryObject|ISyncFileObject;

interface ISyncMatchedObjectBase extends ISyncObjectBase {
    target: ISyncObject;
}

function isSyncMatchedObject(obj: ISyncObject): obj is ISyncMatchedObject {
    return (typeof((<{ [index: string]: any }>obj).target) !== "undefined");
}

function isSyncMatchedFileObject(obj: ISyncObject): obj is ISyncMatchedFileObject {
    return !obj.isDirectory && (typeof((<{ [index: string]: any }>obj).target) !== "undefined");
}

interface ISyncMatchedFileObject extends ISyncMatchedObjectBase, ISyncFileObject {
    isDirectory: false;
    target: ISyncFileObject;
}

interface ISyncMatchedDirectoryObject extends ISyncMatchedObjectBase, ISyncDirectoryObject {
    isDirectory: true;
    target: ISyncDirectoryObject;
}

type ISyncMatchedObject = ISyncMatchedDirectoryObject|ISyncMatchedFileObject;

export function syncFolders(source: string, dest: string, force: boolean, ignore?: string[]) {
    let hasChanges: boolean = force;
    let stat: FS.Stats|null|undefined;
    try { stat = FS.statSync(source); } catch (e) { stat = undefined; }
    if (typeof(stat) != "object" || stat === null || !stat.isDirectory())
        return;
    try { stat = FS.statSync(dest); } catch (e) { stat = undefined; }
    if (typeof(stat) != "object" || stat === null || !stat.isDirectory())
        return;
    let sourceNames: ISyncObject[] = FS.readdirSync(source).map(function(n: string): ISyncObject {
        let fullName: string = Path.join(source, n);
        stat = FS.statSync(fullName);
        if (stat.isDirectory())
            return {
                name: n,
                fullName: fullName,
                isDirectory: true
            };
        return {
            name: n,
            fullName: fullName,
            isDirectory: false,
            mtimeMs: stat.mtimeMs,
            size: stat.size
        };
    });
    let targetNames: ISyncObject[] = FS.readdirSync(dest).map(function(n: string): ISyncObject {
        let fullName: string = Path.join(dest, n);
        stat = FS.statSync(fullName);
        if (stat.isDirectory())
            return {
                name: n,
                fullName: fullName,
                isDirectory: true
            };
        return {
            name: n,
            fullName: fullName,
            isDirectory: false,
            mtimeMs: stat.mtimeMs,
            size: stat.size
        };
    });
    if (typeof(ignore) == "object" && ignore !== null && ignore.length > 0) {
        sourceNames = sourceNames.filter(function(s: ISyncObject) { return ignore.filter(function(f: string) { return f == s.name; }).length == 0; });
        targetNames = targetNames.filter(function(t: ISyncObject) { return ignore.filter(function(f: string) { return f == t.name; }).length == 0; });
    }
    targetNames.forEach(function(t: ISyncObject) {
        let match: ISyncObject[] = sourceNames.filter(function(s: ISyncObject): boolean {
            return (s.name == t.name && isSyncDirectoryObject(s) == isSyncDirectoryObject(t));
        });
        if (match.length > 0)
            (<ISyncMatchedObjectBase>(match[0])).target = t;
        else {
            hasChanges = true;
            if (t.isDirectory) {
                removeFsItemRecursive(t.fullName);
                FS.rmdirSync(t.fullName);
            } else
                FS.unlinkSync(t.fullName);
        }
    });
    if (force)
        sourceNames.forEach(function(s: ISyncObject) {
            let p: string;
            if (isSyncDirectoryObject(s)) {
                let p: string;
                if (isSyncMatchedObject(s))
                    p = s.target.fullName;
                else {
                    p = Path.join(dest, s.name);
                    FS.mkdirSync(p);
                }
                syncFolders(s.fullName, p, true);
            } else {
                p = (isSyncMatchedObject(s)) ? s.target.fullName : Path.join(dest, s.name);
                FS.copyFileSync(s.fullName, p);
            }
        });
    else
        sourceNames.forEach(function(s) {
            if (isSyncDirectoryObject(s)) {
                let p: string;
                if (isSyncMatchedObject(s)) {
                    if (syncFolders(s.fullName, s.target.fullName, false))
                        hasChanges = true;
                } else {
                    hasChanges = true;
                    p = Path.join(dest, s.name);
                    FS.mkdirSync(p);
                    syncFolders(s.fullName, p, false);
                }
            } else if (isSyncMatchedFileObject(s)) {
                if (s.size != s.target.size || s.mtimeMs != s.target.mtimeMs) {
                    hasChanges = true;
                    FS.copyFileSync(s.fullName, s.target.fullName);
                }
            } else {
                hasChanges = true;
                FS.copyFileSync(s.fullName, Path.join(dest, s.name));
            }
        });
    return hasChanges;
}

export interface IPackageJsonObject {
    name?: string,
    version?: string,
    description?: string,
    main?: string,
    scripts: { [ key: string ]: string|undefined },
    repository: {
        type?: string,
        url?: string
    },
    author?: string,
    license?: string,
    bugs?: {
        url?: string,
        [ key: string ]: string|undefined
    },
    homepage?: string,
    directories?: {
        lib?: string,
        [ key: string ]: string|undefined
    },
    dependencies?: { [ key: string ]: string },
    devDependencies?: { [ key: string ]: string },
    [ key: string ]: any
}

/**
 * Represents a file content parse error.
 * @interface IParseErrorResult
 */
export interface IParseErrorResult {
    /**
     * Summary error message
     * @type {string}
     */
    errorMessage: string,

    /**
     * Error detail object
     * @type {*}
     */
    errorObject: any
}

/**
 * Tests whether an object implements {@link IParseErrorResult}.
 * @param {*} obj Object to test.
 * @returns True if object implements {@link IParseErrorResult}; otherwie, false.
 */
export function isIParseErrorResult(obj?: any): obj is IParseErrorResult {
    return (typeof(obj) == "object" && obj != null && !Array.isArray(obj) && typeof(obj.errorObject) != "undefined" && obj.errorObject !== null && typeof(obj.errorMessage) == "string");
}

export function parseFile<T>(filePath: string, callback: { (p: string): T|undefined }): IParseErrorResult|T|undefined {
    var errObj, errMsg;
    var result: T|undefined;
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
    if (typeof(errObj) == "undefined")
        return result;
    console.error(errObj);
    console.error(errMsg);
    return <IParseErrorResult>{ errorObject: errObj, errorMessage: errMsg };
}

export function loadPackageFile(path: string): IPackageJsonObject|IParseErrorResult|undefined {
    return parseFile<IPackageJsonObject>(path, function(filePath: string): IPackageJsonObject {
        let jsonData: IPackageJsonObject = <IPackageJsonObject>(JSON.parse(FS.readFileSync(filePath).toString()));
        if (typeof(jsonData.main) == "undefined")
            throw new Error("main setting is not specified");
        if (typeof(jsonData.main) != "string" || jsonData.main.trim().length == 0)
            throw new Error("Invalid main setting");
        if (!FS.statSync(Path.dirname(jsonData.main)).isDirectory())
            throw new Error("Parent path of '" + jsonData.main + "' does not refer to a subdirectory.");
        return jsonData;
    });
}

export function loadTsConfigFile(path: string): { outDir: string, tsConfig: TS.Project }|IParseErrorResult|undefined {
    return parseFile<{ outDir: string, tsConfig: TS.Project }>(path, function(filePath: string) {
    let tsProj: TS.Project = TS.createProject(filePath);
        if (typeof(tsProj.options) != "object")
                throw new Error("config.compilerOptions setting is not specified");
        let outDir: string|undefined = tsProj.options.outDir;
        if (typeof(outDir) == "undefined")
            throw new Error("outDir setting is not specified");
        if (typeof(outDir) != "string" || outDir.trim().length == 0)
            throw new Error("Invalid outDir setting");
        outDir = pathUtil.ensureRelativePath(outDir);
        let stat: FS.Stats|undefined;
        try { stat = FS.statSync(outDir); } catch (e) { }
        if (typeof(stat) == "undefined")
            stat = FS.statSync(Path.dirname(outDir));
        if (!stat.isDirectory())
            throw new Error("Path '" + outDir + "' does not refer to a subdirectory.");
        return { outDir: Path.resolve(outDir), tsConfig: tsProj };
    });
}
