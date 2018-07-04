"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const FS = require("fs");
const Path = require("path");
const Tmp = require("tmp");
const child_process = require("child_process");
const Denomination_Byte = "bytes";
const Denomination_KB = "KB";
const Denomination_MB = "MB";
const Denomination_GB = "GB";
const Denomination_TB = "TB";
class SizeInfo {
    constructor(size, denomination) {
        this.denomination = Denomination_Byte;
        this.value = 0;
        if (typeof (size) != "number" || size <= 0) {
            this.value = 0;
            this.denomination = Denomination_Byte;
            return;
        }
        this.value = size;
        this.denomination = (typeof (denomination) == "string") ? denomination : Denomination_Byte;
        this.normalize();
    }
    normalize() {
        if (!Number.isFinite(this.value) || this.value == 0) {
            this.value = 0;
            this.denomination = Denomination_Byte;
            return;
        }
        if (this.value < 0) {
            while (this.value < -1000 && this.denomination != Denomination_TB) {
                this.value /= 1024;
                switch (this.denomination) {
                    case Denomination_Byte:
                        this.denomination = Denomination_KB;
                        break;
                    case Denomination_KB:
                        this.denomination = Denomination_MB;
                        break;
                    case Denomination_MB:
                        this.denomination = Denomination_GB;
                        break;
                    default:
                        this.denomination = Denomination_TB;
                        break;
                }
            }
            while (this.value > -1 && this.denomination != Denomination_Byte) {
                this.value *= 1024;
                switch (this.denomination) {
                    case Denomination_TB:
                        this.denomination = Denomination_GB;
                        break;
                    case Denomination_GB:
                        this.denomination = Denomination_MB;
                        break;
                    case Denomination_MB:
                        this.denomination = Denomination_KB;
                        break;
                    default:
                        this.denomination = Denomination_Byte;
                        break;
                }
            }
        }
        else {
            while (this.value > 1000 && this.denomination != Denomination_TB) {
                this.value /= 1024;
                switch (this.denomination) {
                    case Denomination_Byte:
                        this.denomination = Denomination_KB;
                        break;
                    case Denomination_KB:
                        this.denomination = Denomination_MB;
                        break;
                    case Denomination_MB:
                        this.denomination = Denomination_GB;
                        break;
                    default:
                        this.denomination = Denomination_TB;
                        break;
                }
            }
            while (this.value < 1 && this.denomination != Denomination_Byte) {
                this.value *= 1024;
                switch (this.denomination) {
                    case Denomination_TB:
                        this.denomination = Denomination_GB;
                        break;
                    case Denomination_GB:
                        this.denomination = Denomination_MB;
                        break;
                    case Denomination_MB:
                        this.denomination = Denomination_KB;
                        break;
                    default:
                        this.denomination = Denomination_Byte;
                        break;
                }
            }
        }
    }
    add(value) {
        this.normalize();
        let rValue;
        if (typeof (value) == "undefined")
            return new SizeInfo(this.value, this.denomination);
        if (typeof (value) == "number") {
            rValue = new SizeInfo(value);
            if (rValue.value == 0)
                return new SizeInfo(this.value, this.denomination);
        }
        else {
            if (value.value == 0)
                return new SizeInfo(this.value, this.denomination);
            rValue = new SizeInfo(value.value, value.denomination);
        }
        if (this.value == 0)
            return rValue;
        let lValue = new SizeInfo(this.value, this.denomination);
        if (rValue.denomination == lValue.denomination) {
            lValue.value += rValue.value;
            lValue.normalize();
            return lValue;
        }
        switch (lValue.denomination) {
            case Denomination_Byte:
                lValue.value /= 1024;
                if (rValue.denomination != Denomination_KB) {
                    lValue.value /= 1024;
                    if (rValue.denomination != Denomination_MB) {
                        lValue.value /= 1024;
                        if (rValue.denomination != Denomination_GB)
                            lValue.value /= 1024;
                    }
                }
                lValue.denomination = rValue.denomination;
                break;
            case Denomination_KB:
                if (rValue.denomination == Denomination_Byte)
                    rValue.value /= 1024;
                else {
                    lValue.value /= 1024;
                    if (rValue.denomination != Denomination_MB) {
                        lValue.value /= 1024;
                        if (rValue.denomination != Denomination_GB)
                            lValue.value /= 1024;
                    }
                    lValue.denomination = rValue.denomination;
                }
                break;
            case Denomination_MB:
                if (rValue.denomination == Denomination_Byte)
                    rValue.value /= (1024 * 1024);
                else if (rValue.denomination == Denomination_KB)
                    rValue.value /= 1024;
                else {
                    lValue.value /= 1024;
                    if (rValue.denomination != Denomination_MB) {
                        lValue.value /= 1024;
                        if (rValue.denomination != Denomination_GB)
                            lValue.value /= 1024;
                    }
                    lValue.denomination = rValue.denomination;
                }
                break;
            case Denomination_GB:
                if (rValue.denomination == Denomination_TB) {
                    lValue.value /= 1024;
                    lValue.denomination = rValue.denomination;
                }
                else {
                    rValue.value /= 1024;
                    if (rValue.denomination != Denomination_MB) {
                        rValue.value /= 1024;
                        if (rValue.denomination != Denomination_KB)
                            rValue.value /= 1024;
                    }
                }
                break;
            default:
                rValue.value /= 1024;
                if (rValue.denomination != Denomination_GB) {
                    rValue.value /= 1024;
                    if (rValue.denomination != Denomination_MB) {
                        rValue.value /= 1024;
                        if (rValue.denomination != Denomination_KB)
                            rValue.value /= 1024;
                    }
                }
                break;
        }
        lValue.value += rValue.value;
        lValue.normalize();
        return lValue;
    }
    toString() {
        this.normalize();
        return (Math.round(this.value * 100) / 100) + " " + this.denomination;
    }
}
class FileSystemInfo {
    constructor(dirName, fileName) {
        this.name = "";
        this.lcName = "";
        this.dirname = "";
        this.size = 0;
        this.path = "";
        this.exists = false;
        this.isDirectory = false;
        this.isFile = false;
        let p, d;
        if (typeof (fileName) != "string") {
            if (typeof (dirName) == "undefined")
                return;
            d = (typeof (dirName) == "object") ? dirName.dirname : dirName;
        }
        else {
            d = (typeof (dirName) == "object") ? dirName.dirname : dirName;
            this.name = fileName;
        }
        if (this.name.length == 0) {
            p = (typeof (d) == "string" && d.length > 0) ? d : ".";
            d = undefined;
        }
        else
            p = undefined;
        if (typeof (p) == "string") {
            this.exists = FS.existsSync(p);
            this.path = (this.exists) ? Path.resolve(p) : p;
            this.name = Path.basename(this.path);
            this.dirname = Path.dirname(this.path);
        }
        else {
            if (typeof (d) != "string" || d.length == 0)
                d = ".";
            this.exists = FS.existsSync(d);
            this.dirname = (this.exists) ? Path.resolve(d) : d;
            this.path = Path.join(this.dirname, this.name);
        }
        this.lcName = this.name.toLowerCase();
        if (this.exists) {
            let stat = FS.statSync(this.path);
            this.isDirectory = stat.isDirectory();
            if (this.isDirectory)
                this.isFile = false;
            else {
                this.isFile = stat.isFile();
                if (this.isFile) {
                    this.size = stat.size;
                    return;
                }
            }
        }
        this.size = 0;
    }
    refresh() {
        if (this.path.length == 0)
            return;
        let existed = this.exists;
        this.exists = FS.existsSync(this.path);
        if (!existed && (this.exists || FS.existsSync(this.dirname))) {
            this.dirname = Path.resolve(this.dirname);
            this.path = Path.join(this.dirname, this.name);
        }
        if (this.exists) {
            let stat = FS.statSync(this.path);
            this.isDirectory = stat.isDirectory();
            if (this.isDirectory)
                this.isFile = false;
            else {
                this.isFile = stat.isFile();
                if (this.isFile) {
                    this.size = stat.size;
                    return;
                }
            }
        }
        this.size = 0;
    }
    getChildItems() {
        this.refresh();
        if (!(this.exists && this.isDirectory))
            return [];
        return FS.readdirSync(this.path).map(function (n) {
            let item = new FileSystemInfo();
            item.name = n;
            item.lcName = n.toLowerCase();
            item.dirname = this.path;
            item.path = Path.join(this.path, n);
            item.exists = true;
            let stat = FS.statSync(item.path);
            item.isDirectory = stat.isDirectory();
            if (!item.isDirectory) {
                item.isFile = stat.isFile();
                if (item.isFile)
                    item.size = stat.size;
            }
            return item;
        }, this);
    }
}
function isIFsSourceOp(value) {
    return (typeof (value) == "object" && value !== null && typeof (value.source) == "string");
}
function isIFsTargetOp(value) {
    return (typeof (value) == "object" && value !== null && typeof (value.target) == "string");
}
function isIFsBinaryOp(value) {
    return (typeof (value) == "object" && value !== null && typeof (value.source) == "string" && typeof (value.target) == "string");
}
function isIOpError(value) { return (typeof (value) == "object" && value !== null && typeof (value.error) != "undefined"); }
function copyFiles(source, target, checkTarget, returnAll) {
    let sourceItems = source.getChildItems();
    let results;
    if (checkTarget) {
        let targetItems = target.getChildItems();
        results = targetItems.filter((tf) => {
            let sf = sourceItems.filter((s) => s.lcName == tf.lcName);
            return sf.length == 0 || ((tf.isDirectory) ? !sf[0].isDirectory : (tf.isFile && sf[0].isFile));
        }).map((tf) => {
            try {
                try {
                    if (tf.isDirectory)
                        FS.rmdirSync(tf.path);
                    else
                        FS.unlinkSync(tf.path);
                    tf.refresh();
                }
                catch (e) {
                    throw new Error("Error removing file: " + e);
                }
                if (tf.exists)
                    throw new Error("Failure removing file");
            }
            catch (err) {
                return { target: tf, error: err };
            }
        }).filter((e) => typeof (e) != "undefined");
    }
    else
        results = [];
    if (results.length > 0)
        sourceItems = sourceItems.filter((sf) => (sf.isDirectory || sf.isFile) && results.filter((f) => f.target.lcName == sf.lcName).length == 0);
    else
        sourceItems = sourceItems.filter((sf) => sf.isDirectory || sf.isFile);
    sourceItems.forEach(function (sf) {
        let tf = new FileSystemInfo(this.path, sf.name);
        try {
            if (sf.isDirectory) {
                if (!tf.exists) {
                    try {
                        FS.mkdirSync(tf.path);
                        tf.refresh();
                    }
                    catch (e) {
                        throw new Error("Error creating subdirectory: " + e);
                    }
                    if (!tf.exists)
                        throw new Error("Failure creating target directory");
                }
                results = results.concat(copyFiles(sf, tf, checkTarget, returnAll));
            }
            else {
                if (tf.exists) {
                    try {
                        FS.unlinkSync(tf.path);
                        tf.refresh();
                    }
                    catch (e) {
                        throw new Error("Error removing file to be overwritten: " + e);
                    }
                    if (tf.exists)
                        throw new Error("Failure removing file to be overwritten");
                }
                try {
                    FS.copyFileSync(sf.path, tf.path);
                    tf.refresh();
                }
                catch (e) {
                    throw new Error("Error copying file: " + e);
                }
                if (!tf.exists)
                    throw new Error("Failure copying file");
            }
        }
        catch (err) {
            results.push({ source: sf, target: tf, error: err });
        }
        if (returnAll)
            results.push({ source: sf, target: tf });
    }, target);
    return results;
}
function loadJSONConfig(path) {
    if (!FS.existsSync(path))
        throw new Error("File not found: " + path);
    let stat = FS.statSync(path);
    if (!stat.isFile())
        throw new Error("Path does not point to a file: " + path);
    return JSON.parse(FS.readFileSync(path).toString());
}
function publishToPagesBranch(localBranchSummary, sourceFileSystemInfo) {
    let currentBranchSummary = localBranchSummary;
    try {
        var opItems = [];
        var tempDir = Tmp.dirSync();
        try {
            var tempFileInfo = new FileSystemInfo(tempDir.name);
            opItems = copyFiles(sourceFileSystemInfo, tempFileInfo, false, false);
            if (opItems.length == 0) {
                // TODO: Check out "gh-pages"
                // TODO: Pull "gh-pages"
                opItems = copyFiles(tempFileInfo, new FileSystemInfo(__dirname), true, true);
            }
        }
        finally {
            tempDir.removeCallback();
        }
        if (opItems.length == 0 && opItems.filter(function (a) {
            if (isIOpError(a)) {
                if (isIFsBinaryOp(a))
                    console.log("Publication staging failure " + JSON.stringify({ sourceDir: a.source.dirname, targetDir: a.target.dirname, name: a.target.name }) + ": " + a.error);
                else if (isIFsSourceOp(a))
                    console.log("Publication staging failure " + JSON.stringify({ source: a.source.path }) + ": " + a.error);
                else
                    console.log("Publication staging failure " + JSON.stringify({ target: a.target.path }) + ": " + a.error);
                return true;
            }
            return false;
        }).length == 0) {
            opItems.map(function (a) {
                console.log("git checkout " + localBranchSummary.current + " -- " + Path.relative(sourceFileSystemInfo.path, a.target.path));
            });
        }
    }
    finally {
        if (typeof (currentBranchSummary.current) == "string" && currentBranchSummary.current == "gh-pages") {
            // TODO: Stage and check in
            // TODO: Push "gh-pages"
            if (typeof (localBranchSummary.current) == "string") {
                // TODO: check out localBranchSummary.current
            }
        }
    }
}
function publishFromLocalBranch(remoteBranchSummary, localBranchSummary, sourceFileSystemInfo) {
    console.log("publishFromLocalBranch");
    if (typeof (localBranchSummary.current) != "string" || localBranchSummary.current.trim().length == 0)
        console.error("No local branch is checked out. Cannot continue.");
    else if (localBranchSummary.current == "gh-pages")
        console.error("'gh-pages' is the current local branch. Cannot continue.");
    else {
        var localGhPagesBranch = localBranchSummary.branches['gh-pages'];
        if (typeof (localGhPagesBranch) != "object" || localGhPagesBranch === null)
            console.error("There is not a 'gh-pages' local branch. Cannot continue.");
        else
            publishToPagesBranch(localBranchSummary, sourceFileSystemInfo);
    }
}
function validateRemoteBranch(remoteBranchSummary) {
    if (remoteBranchSummary.detached)
        console.error("Current remote branch is detached. Cannot continue.");
    else if (typeof (remoteBranchSummary.current) != "string" || remoteBranchSummary.current.trim().length == 0)
        console.error("No remote branch is checked out. Cannot continue.");
    else if (remoteBranchSummary.current == "gh-pages")
        console.error("'gh-pages' is the current remote branch. Cannot continue.");
    else
        return true;
    return false;
}
let packageConfig = loadJSONConfig("./package.json");
if (typeof (packageConfig.main) != "string") {
    var t = typeof (packageConfig.main);
    if (t == "undefined")
        throw new Error("'main' package configuration setting not defined. Cannot continue.");
    throw new Error("'main' package configuration setting expected: 'string'; actual: '" + t + "'. Cannot continue.");
}
else if (packageConfig.main.length == 0)
    throw new Error("'main' package configuration setting was empty. Cannot continue.");
let sourceFileSystemInfo = new FileSystemInfo(Path.dirname(packageConfig.main));
if (sourceFileSystemInfo.exists || !sourceFileSystemInfo.isDirectory)
    throw new Error("Directory for 'main' package configuration setting does not exist. Cannot continue.");
console.log(child_process.execSync("git"));
//# sourceMappingURL=publish.js.map