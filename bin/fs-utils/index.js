"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const FS = require("fs");
const Path = require("path");
const TS = require("gulp-typescript");
const pathUtil = require("../path-utils");
/**
 * Remove file or directory and all contents.
 * @param path Path to file or subdirectory.
 */
function removeFsItemRecursive(path) {
    let stat;
    try {
        stat = FS.statSync(path);
    }
    catch (e) {
        stat = undefined;
    }
    if (typeof (stat) != "object" || stat === null)
        return;
    if (stat.isDirectory()) {
        let names = FS.readdirSync(path);
        for (var i = 0; i < names.length; i++) {
            let fullName = Path.join(path, names[i]);
            if (FS.statSync(fullName).isDirectory()) {
                removeFsItemRecursive(fullName);
                FS.rmdirSync(fullName);
            }
            else
                FS.unlinkSync(fullName);
        }
    }
    FS.unlinkSync(path);
}
exports.removeFsItemRecursive = removeFsItemRecursive;
function isSyncDirectoryObject(obj) { return obj.isDirectory; }
function isSyncMatchedObject(obj) {
    return (typeof (obj.target) !== "undefined");
}
function isSyncMatchedFileObject(obj) {
    return !obj.isDirectory && (typeof (obj.target) !== "undefined");
}
function syncFolders(source, dest, force, ignore) {
    let hasChanges = force;
    let stat;
    try {
        stat = FS.statSync(source);
    }
    catch (e) {
        stat = undefined;
    }
    if (typeof (stat) != "object" || stat === null || !stat.isDirectory())
        return;
    try {
        stat = FS.statSync(dest);
    }
    catch (e) {
        stat = undefined;
    }
    if (typeof (stat) != "object" || stat === null || !stat.isDirectory())
        return;
    let sourceNames = FS.readdirSync(source).map(function (n) {
        let fullName = Path.join(source, n);
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
    let targetNames = FS.readdirSync(dest).map(function (n) {
        let fullName = Path.join(dest, n);
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
    if (typeof (ignore) == "object" && ignore !== null && ignore.length > 0) {
        sourceNames = sourceNames.filter(function (s) { return ignore.filter(function (f) { return f == s.name; }).length == 0; });
        targetNames = targetNames.filter(function (t) { return ignore.filter(function (f) { return f == t.name; }).length == 0; });
    }
    targetNames.forEach(function (t) {
        let match = sourceNames.filter(function (s) {
            return (s.name == t.name && isSyncDirectoryObject(s) == isSyncDirectoryObject(t));
        });
        if (match.length > 0)
            (match[0]).target = t;
        else {
            hasChanges = true;
            if (t.isDirectory) {
                removeFsItemRecursive(t.fullName);
                FS.rmdirSync(t.fullName);
            }
            else
                FS.unlinkSync(t.fullName);
        }
    });
    if (force)
        sourceNames.forEach(function (s) {
            let p;
            if (isSyncDirectoryObject(s)) {
                let p;
                if (isSyncMatchedObject(s))
                    p = s.target.fullName;
                else {
                    p = Path.join(dest, s.name);
                    FS.mkdirSync(p);
                }
                syncFolders(s.fullName, p, true);
            }
            else {
                p = (isSyncMatchedObject(s)) ? s.target.fullName : Path.join(dest, s.name);
                FS.copyFileSync(s.fullName, p);
            }
        });
    else
        sourceNames.forEach(function (s) {
            if (isSyncDirectoryObject(s)) {
                let p;
                if (isSyncMatchedObject(s)) {
                    if (syncFolders(s.fullName, s.target.fullName, false))
                        hasChanges = true;
                }
                else {
                    hasChanges = true;
                    p = Path.join(dest, s.name);
                    FS.mkdirSync(p);
                    syncFolders(s.fullName, p, false);
                }
            }
            else if (isSyncMatchedFileObject(s)) {
                if (s.size != s.target.size || s.mtimeMs != s.target.mtimeMs) {
                    hasChanges = true;
                    FS.copyFileSync(s.fullName, s.target.fullName);
                }
            }
            else {
                hasChanges = true;
                FS.copyFileSync(s.fullName, Path.join(dest, s.name));
            }
        });
    return hasChanges;
}
exports.syncFolders = syncFolders;
/**
 * Tests whether an object implements {@link IParseErrorResult}.
 * @param {*} obj Object to test.
 * @returns True if object implements {@link IParseErrorResult}; otherwie, false.
 */
function isIParseErrorResult(obj) {
    return (typeof (obj) == "object" && obj != null && !Array.isArray(obj) && typeof (obj.errorObject) != "undefined" && obj.errorObject !== null && typeof (obj.errorMessage) == "string");
}
exports.isIParseErrorResult = isIParseErrorResult;
function parseFile(filePath, callback) {
    var errObj, errMsg;
    var result;
    try {
        var stat = FS.statSync(filePath);
        if (typeof (stat) == "undefined" || stat === null)
            throw new Error("File status unknown");
        if (stat.isDirectory())
            throw new Error("Path refers to a subdirectory");
        if (!stat.isFile())
            throw new Error("Path does not refer to a file");
        try {
            result = callback(filePath);
        }
        catch (e) {
            errObj = e;
            errMsg = "Error reading file: " + filePath;
        }
    }
    catch (exc) {
        errObj = exc;
        errMsg = "File not loaded: " + filePath;
    }
    if (typeof (errObj) == "undefined")
        return result;
    console.error(errObj);
    console.error(errMsg);
    return { errorObject: errObj, errorMessage: errMsg };
}
exports.parseFile = parseFile;
function loadPackageFile(path) {
    return parseFile(path, function (filePath) {
        let jsonData = (JSON.parse(FS.readFileSync(filePath).toString()));
        if (typeof (jsonData.main) == "undefined")
            throw new Error("main setting is not specified");
        if (typeof (jsonData.main) != "string" || jsonData.main.trim().length == 0)
            throw new Error("Invalid main setting");
        if (!FS.statSync(Path.dirname(jsonData.main)).isDirectory())
            throw new Error("Parent path of '" + jsonData.main + "' does not refer to a subdirectory.");
        return jsonData;
    });
}
exports.loadPackageFile = loadPackageFile;
function loadTsConfigFile(path) {
    return parseFile(path, function (filePath) {
        let tsProj = TS.createProject(filePath);
        if (typeof (tsProj.options) != "object")
            throw new Error("config.compilerOptions setting is not specified");
        let outDir = tsProj.options.outDir;
        if (typeof (outDir) == "undefined")
            throw new Error("outDir setting is not specified");
        if (typeof (outDir) != "string" || outDir.trim().length == 0)
            throw new Error("Invalid outDir setting");
        outDir = pathUtil.ensureRelativePath(outDir);
        let stat;
        try {
            stat = FS.statSync(outDir);
        }
        catch (e) { }
        if (typeof (stat) == "undefined")
            stat = FS.statSync(Path.dirname(outDir));
        if (!stat.isDirectory())
            throw new Error("Path '" + outDir + "' does not refer to a subdirectory.");
        return { outDir: Path.resolve(outDir), tsConfig: tsProj };
    });
}
exports.loadTsConfigFile = loadTsConfigFile;
//# sourceMappingURL=index.js.map