"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var lerwineGitUtils;
(function (lerwineGitUtils) {
    function convertFromChangeShortFormat(s) {
        if (typeof (s) != "string")
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
                    return "Added to index; " + convertFromChangeShortFormat(s.substr(1, 1)).toLowerCase() + " in work tree";
                return convertFromChangeShortFormat(s.substr(0, 1)) + " in index" + ((s.substr(1, 1) == "A") ? "Added to work tree" : convertFromChangeShortFormat(s.substr(1, 1)).toLowerCase() + " in work tree");
        }
    }
    /**
     * Represents a change to a file or sub-module.
     * @class ChangeInfo
     */
    class ChangeInfo {
        constructor(value) {
            if (typeof (value) == "object" && value !== null) {
                if (ChangeInfo.isUntrackedChange(value)) {
                    this._isSubModule = false;
                    this._subModuleCommitChanged = false;
                    this._subModuleHasTrackedChanges = false;
                    this._subModuleHasUntrackedChanges = false;
                }
                else {
                    if (ChangeInfo.isUnmergedChange(value)) {
                        this._stage1FileMode = (typeof (value.stage1FileMode) == "number") ? value.stage1FileMode : -1;
                        this._stage1ObjectName = (typeof (value.stage1ObjectName) == "string") ? value.stage1ObjectName : "";
                        this._stage2FileMode = (typeof (value.stage2FileMode) == "number") ? value.stage2FileMode : -1;
                        this._stage2ObjectName = (typeof (value.stage2ObjectName) == "string") ? value.stage2ObjectName : "";
                        this._stage3FileMode = (typeof (value.stage3FileMode) == "number") ? value.stage3FileMode : -1;
                        this._stage3ObjectName = (typeof (value.stage3ObjectName) == "string") ? value.stage3ObjectName : "";
                    }
                    else {
                        if (ChangeInfo.isCopyChange(value)) {
                            value.originalPath = (typeof (value.indexMessage) == "string") ? value.originalPath : "";
                            value.score = value.score;
                        }
                        else if (!ChangeInfo.isNormalChange(value)) {
                            this._type = "unknown";
                            this._isSubModule = false;
                            this._message = "";
                            this._pathName = "";
                            this._subModuleCommitChanged = false;
                            this._subModuleHasTrackedChanges = false;
                            this._subModuleHasUntrackedChanges = false;
                            return;
                        }
                        this._headFileMode = (typeof (value.headFileMode) == "number") ? value.headFileMode : -1;
                        this._headObjectName = (typeof (value.headObjectName) == "string") ? value.headObjectName : "";
                        this._indexFileMode = (typeof (value.indexFileMode) == "number") ? value.indexFileMode : -1;
                        this._indexObjectName = (typeof (value.indexObjectName) == "string") ? value.indexObjectName : "";
                        this._workTreeFileMode = (typeof (value.workTreeFileMode) == "number") ? value.workTreeFileMode : -1;
                    }
                    this._indexMessage = (typeof (value.indexMessage) == "string") ? value.indexMessage : "";
                    this._workingCopyMessage = (typeof (value.workingCopyMessage) == "string") ? value.workingCopyMessage : "";
                    this._isSubModule = (value.isSubModule === true);
                    if (this._isSubModule) {
                        this._subModuleCommitChanged = (value.subModuleCommitChanged === true);
                        this._subModuleHasTrackedChanges = (value.subModuleHasTrackedChanges === true);
                        this._subModuleHasUntrackedChanges = (value.subModuleHasUntrackedChanges === true);
                    }
                    else if (value.subModuleCommitChanged === true) {
                        this._isSubModule = true;
                        this._subModuleCommitChanged = true;
                        this._subModuleHasTrackedChanges = (value.subModuleHasTrackedChanges === true);
                        this._subModuleHasUntrackedChanges = (value.subModuleHasUntrackedChanges === true);
                    }
                    else if (value.subModuleHasTrackedChanges === true) {
                        this._isSubModule = true;
                        this._subModuleCommitChanged = false;
                        this._subModuleHasTrackedChanges = true;
                        this._subModuleHasUntrackedChanges = (value.subModuleHasUntrackedChanges === true);
                    }
                    else if (value.subModuleHasUntrackedChanges === true) {
                        this._isSubModule = true;
                        this._subModuleCommitChanged = false;
                        this._subModuleHasTrackedChanges = false;
                        this._subModuleHasUntrackedChanges = true;
                    }
                    else {
                        this._subModuleCommitChanged = false;
                        this._subModuleHasTrackedChanges = false;
                        this._subModuleHasUntrackedChanges = false;
                    }
                }
                this._type = value.type;
                this._message = (typeof (value.message) == "string") ? value.message : "";
                this._pathName = (typeof (value.pathName) == "string") ? value.pathName : "";
                return;
            }
            let str = (typeof (value) == "string") ? value : "";
            this._type = "unknown";
            this._isSubModule = false;
            this._message = "";
            this._pathName = "";
            this._subModuleCommitChanged = false;
            this._subModuleHasTrackedChanges = false;
            this._subModuleHasUntrackedChanges = false;
            var type = (typeof (str) != "string" || str.length == 0) ? "" : str.substr(0, 1);
            var matchResult, i;
            switch (type) {
                case "1":
                    if (typeof (matchResult = str.match(ChangeInfo.ordinaryRe)) != "object" || matchResult === null || matchResult.length < 13)
                        return;
                    this._type = "normal";
                    break;
                case "2":
                    if (typeof (matchResult = str.match(ChangeInfo.copiedRe)) != "object" || matchResult === null || matchResult.length < 16)
                        return;
                    this._type = (matchResult[12] === "R") ? "rename" : "copy";
                    break;
                case "u":
                case "U":
                    if (typeof (matchResult = str.match(ChangeInfo.unmergedRe)) != "object" || matchResult === null || matchResult.length < 15)
                        return;
                    this._type = "unmerged";
                    break;
                case "?":
                    this._type = "untracked";
                    if (str.length > 2)
                        this._pathName = str.substr(2);
                    this._message = "Untracked file";
                    return;
                case "!":
                    this._type = "ignored";
                    if (str.length > 2)
                        this._pathName = str.substr(2);
                    this._message = "Untracked file";
                    return;
            }
            if (typeof (matchResult) != "object" || matchResult === null) {
                this._message = str;
                return;
            }
            this._message = convertFromChangeShortFormat(matchResult[1]);
            this._indexMessage = convertFromChangeShortFormat(matchResult[2]);
            this._workingCopyMessage = convertFromChangeShortFormat(matchResult[3]);
            this._isSubModule = (typeof (matchResult[4]) == "string");
            if (this._isSubModule) {
                this._subModuleCommitChanged = matchResult[4] === "C";
                this._subModuleHasTrackedChanges = matchResult[5] === "M";
                this._subModuleHasUntrackedChanges = matchResult[6] === "U";
            }
            if (type == "unmerged") {
                this._stage1FileMode = parseInt(matchResult[7], 8);
                this._stage2FileMode = parseInt(matchResult[8], 8);
                this._stage3FileMode = parseInt(matchResult[9], 8);
                this._workTreeFileMode = parseInt(matchResult[10], 8);
                this._stage1ObjectName = matchResult[11];
                this._stage2ObjectName = matchResult[12];
                this._stage3ObjectName = matchResult[13];
                this._pathName = matchResult[14];
                return;
            }
            this._headFileMode = parseInt(matchResult[7], 8);
            this._indexFileMode = parseInt(matchResult[8], 8);
            this._workTreeFileMode = parseInt(matchResult[9], 8);
            this._headObjectName = matchResult[10];
            this._indexObjectName = matchResult[11];
            if (this._type == "normal")
                this._pathName = matchResult[12];
            else {
                this._score = parseInt(matchResult[13]);
                this._pathName = matchResult[14];
                this._originalPath = matchResult[15];
            }
        }
        /**
         * Get file path, relative to repository root.
         * @type {string}
         */
        get pathName() { return this._pathName; }
        get message() { return this._message; }
        get type() { return this._type; }
        get originalPath() { return this._originalPath; }
        get score() { return this._score; }
        get headFileMode() { return this._headFileMode; }
        get indexFileMode() { return this._indexFileMode; }
        get workTreeFileMode() { return this._workTreeFileMode; }
        get headObjectName() { return this._headObjectName; }
        get indexObjectName() { return this._indexObjectName; }
        get indexMessage() { return this._indexMessage; }
        get workingCopyMessage() { return this._workingCopyMessage; }
        get isSubModule() { return this._isSubModule; }
        get subModuleCommitChanged() { return this._subModuleCommitChanged; }
        get subModuleHasTrackedChanges() { return this._subModuleHasTrackedChanges; }
        get subModuleHasUntrackedChanges() { return this._subModuleHasUntrackedChanges; }
        get stage1FileMode() { return this._stage1FileMode; }
        get stage2FileMode() { return this._stage2FileMode; }
        get stage3FileMode() { return this._stage3FileMode; }
        get stage1ObjectName() { return this._stage1ObjectName; }
        get stage2ObjectName() { return this._stage2ObjectName; }
        get stage3ObjectName() { return this._stage3ObjectName; }
        static isAnyChangeObject(obj) {
            if (typeof (obj) != "object" || obj === null || Array.isArray(obj))
                return false;
            var type = obj.type;
            return typeof (type) == "string" && (type == "normal" || type == "rename" || type == "copy" || type == "unmerged" || type == "untracked" || type == "ignored" || type == "unknown");
        }
        static isChangeObject(obj) {
            if (typeof (obj) != "object" || obj === null || Array.isArray(obj))
                return false;
            var type = obj.type;
            return typeof (type) == "string" && (type == "normal" || type == "rename" || type == "copy" || type == "unmerged" || type == "untracked" || type == "ignored" || type == "unknown");
        }
        static isChangeInfo(obj) {
            if (typeof (obj) != "object" || obj === null)
                return false;
            if (obj instanceof ChangeInfo)
                return true;
            let classProto = ChangeInfo.prototype;
            let valueProto, valueConstructor;
            if (typeof (obj) == "function") {
                valueConstructor = obj;
                valueProto = obj.prototype;
            }
            else {
                valueProto = Object.getPrototypeOf(obj);
                valueConstructor = valueProto.constructor;
                while (typeof (valueConstructor) != "function") {
                    valueProto = Object.getPrototypeOf(valueProto);
                    if (typeof (valueProto) == "undefined" || valueProto === null)
                        break;
                    valueConstructor = valueProto.constructor;
                }
            }
            if (typeof (valueConstructor) == "undefined" || valueConstructor === null)
                return false;
            if (valueConstructor === ChangeInfo)
                return true;
            if (typeof (valueProto) == "undefined" || valueProto === null)
                return false;
            let constructorChain = [];
            do {
                if (valueProto instanceof ChangeInfo)
                    return true;
                constructorChain.push(valueConstructor);
                valueConstructor = null;
                do {
                    valueProto = Object.getPrototypeOf(valueProto);
                    if (typeof (valueProto) == "undefined" || valueProto === null)
                        break;
                    valueConstructor = valueProto.constructor;
                } while (typeof (valueConstructor) == "undefined" || valueConstructor === null);
            } while (typeof (valueConstructor) != "undefined" && valueConstructor !== null);
            for (let i = 0; i < constructorChain.length; i++) {
                if (constructorChain[i] === ChangeInfo)
                    return true;
            }
            return false;
        }
        static isUntrackedChange(obj) {
            if (typeof (obj) != "object" || obj === null || Array.isArray(obj))
                return false;
            var type = obj.type;
            return typeof (type) == "string" && (type == "untracked" || type == "ignored" || type == "unknown");
        }
        static isUnmergedChange(obj) {
            if (typeof (obj) != "object" || obj === null || Array.isArray(obj))
                return false;
            var type = obj.type;
            return typeof (type) == "string" && type == "unmerged";
        }
        static isCopyChange(obj) {
            if (typeof (obj) != "object" || obj === null || Array.isArray(obj))
                return false;
            var type = obj.type;
            return typeof (type) == "string" && (type == "rename" || type == "copy");
        }
        static isNormalChange(obj) {
            if (typeof (obj) != "object" || obj === null || Array.isArray(obj))
                return false;
            var type = obj.type;
            return typeof (type) == "string" && type == "normal";
        }
    }
    ChangeInfo.ordinaryRe = /^1\s+(([MADRCU.])([MADRCU.]))\s+(?:N\.{3}|S([C.])([M.])([U.]))\s+([0-7]+)\s+([0-7]+)\s+([0-7]+)\s+(\S+)\s+(\S+)\s+(.+)$/;
    ChangeInfo.copiedRe = /^2\s+(([MADRCU.])([MADRCU.]))\s+(?:N\.{3}|S([C.])([M.])([U.]))\s+([0-7]+)\s+([0-7]+)\s+([0-7]+)\s+(\S+)\s+(\S+)\s+([RC])(\d+)\s+([^\t])\t(.+)$/;
    ChangeInfo.unmergedRe = /^u\s+(([MADRCU.])([MADRCU.]))\s+(?:N\.{3}|S([C.])([M.])([U.]))\s+([0-7]+)\s+([0-7]+)\s+([0-7]+)\s+([0-7]+)\s+(\S+)\s+(\S+)\s+(\S+)\s+(.+)$/;
    lerwineGitUtils.ChangeInfo = ChangeInfo;
    class StatusInfo {
        /**
         * Inititialize new GitStatus object.
         * @param {string|string[]|IStatusInfo|undefined} [source] If string value, Parse as output from [Git status output using Porcelain version 2]{@link https://git-scm.com/docs/git-status#_porcelain_format_version_2};
         *      otherwise, .
         * @param {ChangeInfoSpec|ChangeInfoSpec[]} [chg] String values are interpreted as the relative path of files which should be an "ignored" type, regardless of the actual status; Non-string values will be used for adding file change information.
         * @param {..GitChangeInfoSpec|undefined} [changes] Additional arguments where string values are interpreted as the relative path of files which should be an "ignored" type, regardless of the actual status, and non-string values will be used for adding file change information.
         */
        constructor(source, chg, ...changes) {
            this._currentCommit = "";
            this._currentBranch = "";
            this._upstreamRemote = "";
            this._upstreamBranch = "";
            this._aheadCount = 0;
            this._behindCount = 0;
            this._changes = [];
            this._ignoredChanges = [];
            let forceAsIgnored = [];
            let changeArgs = [];
            switch (typeof (chg)) {
                case "string":
                    forceAsIgnored.push(chg);
                    break;
                case "object":
                    if (ChangeInfo.isChangeObject(chg))
                        changeArgs.push(chg);
                    break;
            }
            if (typeof (changes) == "object" && changes !== null) {
                changes.forEach(c => {
                    switch (typeof (c)) {
                        case "string":
                            forceAsIgnored.push(c);
                            break;
                        case "object":
                            if (ChangeInfo.isChangeObject(c))
                                changeArgs.push(c);
                            break;
                    }
                });
            }
            let statusInfo;
            if (typeof (source) == "string")
                statusInfo = source.split(/[\r\n]+/).filter(l => l.trim().length > 0);
            else if (typeof (source) == "object") {
                if (source !== null) {
                    if (Array.isArray(source)) {
                        statusInfo = [];
                        source.filter((o) => typeof (o) == "string").forEach((ln) => statusInfo = statusInfo.concat(ln.split(/[\r\n]+/)));
                        statusInfo = statusInfo.filter(l => l.trim().length > 0);
                    }
                    else if (typeof (source) == "object" && source !== null)
                        statusInfo = source;
                }
            }
            if (typeof (statusInfo) == "object") {
                if (Array.isArray(statusInfo)) {
                    this._changes = statusInfo.map(function (ln) {
                        if (ln.trim().length == 0)
                            return;
                        var type, matchResult, i;
                        if (ln.substr(0, 1) != "#") {
                            var c = new ChangeInfo(ln);
                            if (c.type != "ignored" && c.type != "unknown" && !(forceAsIgnored.length > 0 && forceAsIgnored.filter(f => c.pathName == f).length > 0))
                                return c;
                            this._ignoredChanges.push(c);
                            return;
                        }
                        if (typeof (matchResult = ln.match(StatusInfo.gsRe)) != "object" || matchResult === null || matchResult.length < 7)
                            return;
                        switch (matchResult[1]) {
                            case "oid":
                                this._currentCommit = matchResult[2];
                                break;
                            case "head":
                                this._currentBranch = matchResult[2];
                                break;
                            case "upstream":
                                if (typeof (matchResult[3] == "string"))
                                    this._upstreamRemote = matchResult[3],
                                        this._upstreamBranch = matchResult[4];
                                break;
                            default:
                                if (typeof (matchResult[5]) == "string") {
                                    this._aheadCount = parseInt(matchResult[5]);
                                    this._behindCount = parseInt(matchResult[6]);
                                }
                                break;
                        }
                    }, this).filter(function (r) { return typeof (r) != "undefined"; });
                }
                else {
                    this._aheadCount = (typeof (statusInfo.aheadCount) == "number") ? statusInfo.aheadCount : 0;
                    this._behindCount = (typeof (statusInfo.behindCount) == "number") ? statusInfo.behindCount : 0;
                    this._currentBranch = (typeof (statusInfo.currentBranch) == "string") ? statusInfo.currentBranch : "";
                    this._currentCommit = (typeof (statusInfo.currentCommit) == "string") ? statusInfo.currentCommit : "";
                    this._upstreamBranch = (typeof (statusInfo.upstreamBranch) == "string") ? statusInfo.upstreamBranch : "";
                    this._upstreamRemote = (typeof (statusInfo.upstreamRemote) == "string") ? statusInfo.upstreamRemote : "";
                }
            }
            else {
                this._aheadCount = 0;
                this._behindCount = 0;
                this._currentBranch = "";
                this._currentCommit = "";
                this._upstreamBranch = "";
                this._upstreamRemote = "";
            }
            if ((changeArgs = changeArgs.filter(c => ChangeInfo.isChangeObject(c))).length == 0)
                return;
            let changeArr = changeArgs.map(c => (ChangeInfo.isChangeInfo(c)) ? c : new ChangeInfo(c)).filter(c => {
                if (c.type != "ignored" && c.type != "unknown")
                    return true;
                this._ignoredChanges.push(c);
                return false;
            });
            if (changeArr.length == 0)
                return;
            if (forceAsIgnored.length > 0) {
                changeArr = changeArr.filter(c => {
                    if (forceAsIgnored.filter(f => f == c.pathName).length == 0)
                        return true;
                    this._ignoredChanges.push(c);
                    return false;
                });
                if (changeArr.length == 0)
                    return;
            }
            if (this._changes.length == 0)
                this._changes = changeArr;
            else
                this._changes = this._changes.concat(changeArr);
        }
        /**
         * Get name of current commit.
         * @type {string}
         */
        get currentCommit() { return this._currentCommit; }
        /**
         * Get name of current branch.
         * @type {string}
         */
        get currentBranch() { return this._currentBranch; }
        /**
         * Get name of upstream remote.
         * @type {string}
         */
        get upstreamRemote() { return this._upstreamRemote; }
        /**
         * Get name of upstream branch.
         * @type {string}
         */
        get upstreamBranch() { return this._upstreamBranch; }
        /**
         * Get ahead count.
         * @type {number}
         */
        get aheadCount() { return this._aheadCount; }
        /**
         * Get behind count.
         * @type {number}
         */
        get behindCount() { return this._behindCount; }
        /**
         * Get repository changes.
         * @type {ReadonlyArray<ChangeInfo>}
         */
        get changes() { return this._changes; }
        /**
         * Get ignored repository changes.
         * @type {ReadonlyArray<ChangeInfo>}
         */
        get ignoredChanges() { return this._ignoredChanges; }
    }
    StatusInfo.gsRe = /^#\s+branch.(oid|head|upstream|ab)\s+(([^\/]+)\/(\S.*)|\+(\d+)\s+-(\d+)|.+)/;
    lerwineGitUtils.StatusInfo = StatusInfo;
})(lerwineGitUtils = exports.lerwineGitUtils || (exports.lerwineGitUtils = {}));
//# sourceMappingURL=index.js.map