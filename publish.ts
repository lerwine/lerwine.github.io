import * as FS from 'fs';
import * as Path from 'path';
import * as Tmp from 'tmp';
import * as child_process from 'child_process';

//var git = require("simple-git");
// https://www.npmjs.com/package/simple-git
declare interface GitCallback<T> { (err: any, result: T, ...args: any[]): void }
declare interface GitOptions { [index: string]: string|null }
declare class BranchSummary {
    detached: boolean;
    current?: string;
    all: string[];
    branches: {
        [index: string]: {
            current: string,
            name: string,
            commit: string,
            label: string
        }
    }
}
declare class FetchSummary {
    raw: any;
    remote: string;
    branches: {
        name: string,
        tracking: string
    }[];
    tags: {
        name: string,
        tracking: string
    }[];
}
declare class CommitSummary {
    branch: string;
    commit: string;
    summary: {
        changes: number,
        insertions: number,
        deletions: number
    };
    author?: {
        email: string,
        name: string
    };
}
declare class PullSummary {
    files: string[];
    insertions: { [index: string]: number };
    deletions: { [index: string]: number };
    summary: {
        changes: number,
        insertions: number,
        deletions: number
    };
}
declare class FileStatusSummary {
    path: string;
    from: string;
    index: number;
    working_dir: string;
    summary: {
        changes: number,
        insertions: number,
        deletions: number
    };
}
declare class StatusSummary {
    ahead: number;
    behind: number;
    current?: string;
    tracking?: string;
    not_added: string[];
    conflicted: string[];
    created: string[];
    deleted: string[];
    modified: string[];
    renamed: string[];
    files: FileStatusSummary[];
    staged: string[];
    isClean(): boolean;
}
declare class Git {
    add(files: string|string[], then?: GitCallback<any>): Git;
    branch(then?: GitCallback<BranchSummary>, ...args: any[]): Git;
    branch(options?: GitOptions, then?: GitCallback<BranchSummary>, ...args: any[]): Git;
    branchLocal(then?: GitCallback<BranchSummary>, ...args: any[]): Git;
    checkout(what: string|string[], then?: GitCallback<any>): Git;
    checkoutBranch(branchName: string, startPoint: string, then?: GitCallback<any>): Git;
    checkoutLocalBranch(branchName: string, then?: GitCallback<any>): Git;
    commit(message: string|string[], files: string|string[], options?: GitOptions, then?: GitCallback<CommitSummary>, ...args: any[]): Git;
    commit(message: string|string[], options?: GitOptions, then?: GitCallback<CommitSummary>, ...args: any[]): Git;
    pull(then?: GitCallback<PullSummary>, ...args: any[]): Git;
    pull(remote?: string, branch?: string, options?: GitOptions, then?: GitCallback<PullSummary>, ...args: any[]): Git;
    push(remote?: string|string[], branch?: string, then?: GitCallback<any>, ...args: any[]): Git;
    fetch(then?: GitCallback<FetchSummary>, ...args: any[]): Git;
    fetch(remote?: string, branch?: string, then?: GitCallback<FetchSummary>, ...args: any[]): Git;
    fetch(options?: GitOptions, remote?: string, branch?: string, then?: GitCallback<FetchSummary>, ...args: any[]): Git;
    revert(commit: string, options?: GitOptions, then?: GitCallback<any>, ...args: any[]): Git;
    rm(files: string|string[], then?: GitCallback<any>): Git;
    raw(args: string[], then?: GitCallback<any>): Git;
    stash(options?: GitOptions|string[], then?: GitCallback<any>, ...args: any[]): Git;
    status(then?: GitCallback<StatusSummary>, ...args: any[]): Git;
}
declare var git: Git;

type denominationType = "bytes"|"KB"|"MB"|"GB"|"TB";
const Denomination_Byte: denominationType = "bytes";
const Denomination_KB: denominationType = "KB";
const Denomination_MB: denominationType = "MB";
const Denomination_GB: denominationType = "GB";
const Denomination_TB: denominationType = "TB";

class SizeInfo {
    denomination: denominationType = Denomination_Byte;
    value: number = 0;
    constructor(size?: number, denomination?: denominationType) {
        if (typeof(size) != "number" || size <= 0) {
            this.value = 0;
            this.denomination = Denomination_Byte;
            return;
        }
        this.value = size;
        this.denomination = (typeof(denomination) == "string") ? denomination : Denomination_Byte;
        this.normalize();
    }
    private normalize(): void {
        if (!Number.isFinite(this.value) || this.value == 0) {
            this.value = 0;
            this.denomination = Denomination_Byte;
            return;
        }

        if (this.value < 0)
        {
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
        else
        {
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
    add(value?: number|SizeInfo): SizeInfo {
        this.normalize();
        let rValue: SizeInfo;
        if (typeof(value) == "undefined")
            return new SizeInfo(this.value, this.denomination);
        if (typeof(value) == "number") {
            rValue = new SizeInfo(value);
            if (rValue.value == 0)
                return new SizeInfo(this.value, this.denomination);
        } else {
            if (value.value == 0)
                return new SizeInfo(this.value, this.denomination);
            rValue = new SizeInfo(value.value, value.denomination);
        }
        if (this.value == 0)
            return rValue;
        let lValue: SizeInfo = new SizeInfo(this.value, this.denomination);
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
                } else {
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
    toString(): string {
        this.normalize();
        return (Math.round(this.value * 100) / 100) + " " + this.denomination;
    }
}

class FileSystemInfo {
    name: string = "";
    lcName: string = "";
    dirname: string = "";
    size: number = 0;
    path: string = "";
    exists: boolean = false;
    isDirectory: boolean = false;
    isFile: boolean = false;

    constructor(dirName?: string|FileSystemInfo, fileName?: string) {
        let p, d: string|undefined;
        if (typeof(fileName) != "string") {
            if (typeof(dirName) == "undefined")
                return;
            d = (typeof(dirName) == "object") ? dirName.dirname : dirName;
        } else {
            d = (typeof(dirName) == "object") ? dirName.dirname : dirName;
            this.name = fileName;
        }
        if (this.name.length == 0) {
            p = (typeof(d) == "string" && d.length > 0) ? d : ".";
            d = undefined;
        } else
            p = undefined;

        if (typeof(p) == "string") {
            this.exists = FS.existsSync(p);
            this.path = (this.exists)  ? Path.resolve(p) : p;
            this.name = Path.basename(this.path);
            this.dirname = Path.dirname(this.path);
        } else {
            if (typeof(d) != "string" || d.length == 0)
                d = ".";
            this.exists = FS.existsSync(d);
            this.dirname = (this.exists) ? Path.resolve(d) : d;
            this.path = Path.join(this.dirname, this.name);
        }
        this.lcName = this.name.toLowerCase();
        if (this.exists) {
            let stat: FS.Stats = FS.statSync(this.path);
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
        let existed: boolean = this.exists;
        this.exists = FS.existsSync(this.path);
        if (!existed && (this.exists || FS.existsSync(this.dirname))) {
            this.dirname = Path.resolve(this.dirname);
            this.path = Path.join(this.dirname, this.name);
        }
        if (this.exists) {
            let stat: FS.Stats = FS.statSync(this.path);
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

    getChildItems(): FileSystemInfo[] {
        this.refresh();
        if (!(this.exists && this.isDirectory))
            return [];
        return FS.readdirSync(this.path).map(function(this: FileSystemInfo, n: string) {
            let item: FileSystemInfo = new FileSystemInfo();
            item.name = n;
            item.lcName = n.toLowerCase();
            item.dirname = this.path;
            item.path = Path.join(this.path, n);
            item.exists = true;
            let stat: FS.Stats = FS.statSync(item.path);
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

interface IOpError { error: any }
interface IFsSourceOp { source: FileSystemInfo }
interface IFsTargetOp  { target: FileSystemInfo }
interface IFsSourceOpError extends IFsSourceOp, IOpError { }
interface IFsTargetOpError extends IFsTargetOp, IOpError { }
interface IFsBinaryOp extends IFsSourceOp, IFsTargetOp { }
interface IFsBinaryOpError extends IFsBinaryOp, IFsSourceOpError, IFsTargetOpError { }
type IFsOpsError = IFsBinaryOpError|IFsSourceOpError|IFsTargetOpError;
type IFsOp = IFsOpsError|IFsBinaryOp|IFsSourceOp|IFsTargetOp;

function isIFsSourceOp(value?: IOpError|IFsOp|null): value is IFsSourceOp {
    return (typeof(value) == "object" && value !== null && typeof((<{ [index: string]: any }>value).source) == "string");
}
function isIFsTargetOp(value?: IOpError|IFsOp|null): value is IFsTargetOp {
    return (typeof(value) == "object" && value !== null && typeof((<{ [index: string]: any }>value).target) == "string");
}
function isIFsBinaryOp(value?: IOpError|IFsOp|null): value is IFsBinaryOp {
    return (typeof(value) == "object" && value !== null && typeof((<{ [index: string]: any }>value).source) == "string" && typeof((<{ [index: string]: any }>value).target) == "string");
}
function isIOpError(value?: IOpError|IFsOp|null): value is IOpError { return (typeof(value) == "object" && value !== null && typeof((<{ [index: string]: any }>value).error) != "undefined"); }

function copyFiles(source: FileSystemInfo, target: FileSystemInfo, checkTarget: boolean, returnAll: boolean): IFsOp[] {
    let sourceItems: FileSystemInfo[] = source.getChildItems();
    let results: IFsOp[];
    if (checkTarget) {
        let targetItems: FileSystemInfo[] = target.getChildItems();
        results = <IFsOp[]>targetItems.filter((tf: FileSystemInfo) => {
            let sf: FileSystemInfo[] = sourceItems.filter((s: FileSystemInfo) => s.lcName == tf.lcName);
            return sf.length == 0 || ((tf.isDirectory) ? !sf[0].isDirectory : (tf.isFile && sf[0].isFile));
        }).map((tf: FileSystemInfo) => {
            try {
                try {
                    if (tf.isDirectory)
                        FS.rmdirSync(tf.path);
                    else
                        FS.unlinkSync(tf.path);
                    tf.refresh();
                } catch (e) { throw new Error("Error removing file: " + e); }
                if (tf.exists)
                    throw new Error("Failure removing file");
            } catch (err) { return <IFsTargetOpError>{ target: tf, error: err }; }
        }).filter((e: IFsOpsError|undefined) => typeof(e) != "undefined");
    } else
        results = [];
    if (results.length > 0)
        sourceItems = sourceItems.filter((sf: FileSystemInfo) => (sf.isDirectory || sf.isFile) && results.filter((f: IFsOp) => (<IFsTargetOpError>f).target.lcName == sf.lcName).length == 0);
    else
        sourceItems = sourceItems.filter((sf: FileSystemInfo) => sf.isDirectory || sf.isFile);
    sourceItems.forEach(function(this: FileSystemInfo, sf: FileSystemInfo) {
        let tf: FileSystemInfo = new FileSystemInfo(this.path, sf.name);
        try {
            if (sf.isDirectory) {
                if (!tf.exists) {
                    try {
                        FS.mkdirSync(tf.path);
                        tf.refresh();
                    } catch (e) { throw new Error("Error creating subdirectory: " + e); }
                    if (!tf.exists)
                        throw new Error("Failure creating target directory");
                }
                results = results.concat(copyFiles(sf, tf, checkTarget, returnAll));
            } else {
                if (tf.exists) {
                    try {
                        FS.unlinkSync(tf.path);
                        tf.refresh();
                    } catch (e) { throw new Error("Error removing file to be overwritten: " + e); }
                    if (tf.exists)
                        throw new Error("Failure removing file to be overwritten");
                }
                try {
                    FS.copyFileSync(sf.path, tf.path);
                    tf.refresh();
                } catch (e) { throw new Error("Error copying file: " + e); }
                if (!tf.exists)
                    throw new Error("Failure copying file");
            }
        } catch (err) { results.push(<IFsBinaryOpError>{ source: sf, target: tf, error: err }); }
        if (returnAll)
            results.push(<IFsBinaryOp>{ source: sf, target: tf });
    }, target);
    return results;
}

function loadJSONConfig(path: string): ({ [index: string]: any }|any[]) {
    if (!FS.existsSync(path))
        throw new Error("File not found: " + path);
    let stat: FS.Stats = FS.statSync(path);
    if (!stat.isFile())
        throw new Error("Path does not point to a file: " + path);
    return JSON.parse(FS.readFileSync(path).toString());
}

interface IPackageConfig {
    name: string|null|undefined,
    description: string|null|undefined,
    main: any|null|undefined,
    repository: {
      type: "git",
      url: string
    }|string|null|undefined,
    author: string|null|undefined,
    license: string|null|undefined
}

function publishToPagesBranch(localBranchSummary: BranchSummary, sourceFileSystemInfo: FileSystemInfo): void {
    let currentBranchSummary: BranchSummary = localBranchSummary;
    try {
        var opItems: IFsOp[] = [];
        var tempDir = Tmp.dirSync();
        try {
            var tempFileInfo = new FileSystemInfo(tempDir.name);
            opItems = copyFiles(sourceFileSystemInfo, tempFileInfo, false, false);
            if (opItems.length == 0) {
                // TODO: Check out "gh-pages"
                // TODO: Pull "gh-pages"
                opItems = copyFiles(tempFileInfo, new FileSystemInfo(__dirname), true, true);
            }
        } finally { tempDir.removeCallback(); }
        if (opItems.length == 0 && opItems.filter(function(a: IFsOp) {
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
            (<IFsBinaryOp[]>opItems).map(function(a: IFsBinaryOp) {
                console.log("git checkout " + localBranchSummary.current + " -- " + Path.relative(sourceFileSystemInfo.path, a.target.path));
            });
        }
    } finally {
        if (typeof(currentBranchSummary.current) == "string" && currentBranchSummary.current == "gh-pages") {
            // TODO: Stage and check in
            // TODO: Push "gh-pages"
            if (typeof(localBranchSummary.current) == "string") {
                // TODO: check out localBranchSummary.current
            }
        }
    }
}

function publishFromLocalBranch(remoteBranchSummary: BranchSummary, localBranchSummary: BranchSummary, sourceFileSystemInfo: FileSystemInfo): void {
    console.log("publishFromLocalBranch");
    if (typeof(localBranchSummary.current) != "string" || localBranchSummary.current.trim().length == 0)
        console.error("No local branch is checked out. Cannot continue.");
    else if (localBranchSummary.current == "gh-pages")
        console.error("'gh-pages' is the current local branch. Cannot continue.");
    else {
        var localGhPagesBranch = localBranchSummary.branches['gh-pages'];
        if (typeof(localGhPagesBranch) != "object" || localGhPagesBranch === null)
            console.error("There is not a 'gh-pages' local branch. Cannot continue.");
        else
            publishToPagesBranch(localBranchSummary, sourceFileSystemInfo);
    }
}

function validateRemoteBranch(remoteBranchSummary: BranchSummary): boolean {
    if (remoteBranchSummary.detached)
        console.error("Current remote branch is detached. Cannot continue.");
    else if (typeof(remoteBranchSummary.current) != "string" || remoteBranchSummary.current.trim().length == 0)
        console.error("No remote branch is checked out. Cannot continue.");
    else if (remoteBranchSummary.current == "gh-pages")
        console.error("'gh-pages' is the current remote branch. Cannot continue.");
    else
        return true;
    return false;
}

let packageConfig: IPackageConfig = <IPackageConfig>loadJSONConfig("./package.json");
if (typeof(packageConfig.main) != "string") {
    var t = typeof(packageConfig.main);
    if (t == "undefined")
        throw new Error("'main' package configuration setting not defined. Cannot continue.");
    throw new Error("'main' package configuration setting expected: 'string'; actual: '" + t + "'. Cannot continue.");
} else if (packageConfig.main.length == 0)
    throw new Error("'main' package configuration setting was empty. Cannot continue.");
let sourceFileSystemInfo: FileSystemInfo = new FileSystemInfo(Path.dirname(packageConfig.main));
if (sourceFileSystemInfo.exists || !sourceFileSystemInfo.isDirectory)
    throw new Error("Directory for 'main' package configuration setting does not exist. Cannot continue.");

console.log(child_process.execSync("git"));