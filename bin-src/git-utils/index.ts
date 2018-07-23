export module lerwineGitUtils {
    function convertFromChangeShortFormat(s: string|undefined): string {
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
                    return "Added to index; " + convertFromChangeShortFormat(s.substr(1, 1)).toLowerCase() + " in work tree";
                return convertFromChangeShortFormat(s.substr(0, 1)) + " in index" + ((s.substr(1, 1) == "A") ? "Added to work tree" : convertFromChangeShortFormat(s.substr(1, 1)).toLowerCase() + " in work tree");
        }
    }
    
    /**
     * Type names for change to files or sub-modules.
     * @typedef ChangeType
     */
    export type ChangeType = TrackedChangeType|UntrackedChangeType;
    
    /**
     * Type names for changes to files or sub-modules that are tracked.
     * @typedef TrackedChangeType
     */
    export type TrackedChangeType = MergedChangeType|"unmerged";
    
    /**
     * Type names for changes to files or sub-modules that have been merged.
     * @typedef MergedChangeType
     */
    export type MergedChangeType = CopyChangeType|"normal";
    
    /**
     * Type names for files or sub-modules that have been renamed or copied.
     * @typedef CopyChangeType
     */
    export type CopyChangeType = "rename"|"copy";
    
    /**
     * Type names for changes which are untracked, ignored or the status is unknown.
     * @typedef UntrackedChangeType
     */
    export type UntrackedChangeType = "untracked"|"ignored"|"unknown";
    
    /**
     * Object properties that are common to all change types.
     * @interface IChangeInfoBase
     */
    export interface IChangeInfoBase {
        /**
         * Get file path, relative to repository root.
         * @type {string|undefined}
         */
        pathName?: string;
    
        /**
         * Gets verbal change message
         * @type {string|undefined}
         */
        message?: string;
    }
    
    /**
     * Object properties that are common to all tracked change types.
     * @interface ITrackedChangeInfoBase
     */
    export interface ITrackedChangeInfoBase extends IChangeInfoBase {
        /**
         * Gets verbal change message for the indexed copy of the file.
         * @type {string|undefined}
         */
        indexMessage?: string;
    
        /**
         * Gets verbal change message for the working copy of the file.
         * @type {string|undefined}
         */
        workingCopyMessage?: string;
    
        /**
         * Indicates whether [pathName]{@link ITrackedChangeInfoBase#pathName} refers to a sub-module.
         * @type {boolean|undefined} True if [pathName]{@link ITrackedChangeInfoBase#pathName} is a sub-module; otherwise, false.
         */
        isSubModule?: boolean;
    
        /**
         * Indicates whether the commit has changed in the submodule referred to [pathName]{@link ITrackedChangeInfoBase#pathName}.
         * @type {boolean|undefined} True if [isSubModule]{@link ITrackedChangeInfoBase#isSubModule} is true and the sub-module's commit has changed; otherwise, false.
         */
        subModuleCommitChanged?: boolean;
    
        /**
         * Indicates whether the the submodule referred to [pathName]{@link ITrackedChangeInfoBase#pathName} has tracked changes.
         * @type {boolean|undefined} True if [isSubModule]{@link ITrackedChangeInfoBase#isSubModule} is true and the sub-module has tracked changes; otherwise, false.
         */
        subModuleHasTrackedChanges?: boolean;
    
        /**
         * Indicates whether the the submodule referred to [pathName]{@link ITrackedChangeInfoBase#pathName} has un-tracked changes.
         * @type {boolean|undefined} True if [isSubModule]{@link ITrackedChangeInfoBase#isSubModule} is true and the sub-module has un-tracked changes; otherwise, false.
         */
        subModuleHasUntrackedChanges?: boolean;
    }
    
    /**
     * Object properties that are common to all merged change types.
     * @interface ITrackedChangeInfoBase
     */
    export interface IMergedChangeInfoBase extends ITrackedChangeInfoBase {
        /**
         * Get file mode of [pathName]{@link IMergedChangeInfoBase#pathName} in the repository HEAD.
         * @type {number|undefined} Numeric file mode value of [pathName]{@link IMergedChangeInfoBase#pathName} in the repository HEAD if [type]{@link IMergedChangeInfoBase#type} is "normal", "rename" or "copy"; otherwise, undefined.
         */
        headFileMode?: number;
    
        /**
         * Get file mode of [pathName]{@link IMergedChangeInfoBase#pathName} in the repository index.
         * @type {number|undefined} Numeric file mode value of [pathName]{@link IMergedChangeInfoBase#pathName} in the repository index if [type]{@link IMergedChangeInfoBase#type} is "normal", "rename" or "copy"; otherwise, undefined.
         */
        indexFileMode?: number;
    
        /**
         * Get file mode of the working copy of [pathName]{@link IMergedChangeInfoBase#pathName}.
         * @type {number|undefined} Numeric file mode value of the working copy of [pathName]{@link IMergedChangeInfoBase#pathName} if [type]{@link IMergedChangeInfoBase#type} is "normal", "rename" or "copy"; otherwise, undefined.
         */
        workTreeFileMode?: number;
    
        /**
         * Get object name for [pathName]{@link IMergedChangeInfoBase#pathName} in the repository HEAD.
         * @type {string|undefined} Object name for [pathName]{@link IMergedChangeInfoBase#pathName} in the repository HEAD if [type]{@link IMergedChangeInfoBase#type} is "normal", "rename" or "copy"; otherwise, undefined.
         */
        headObjectName?: string;
    
        /**
         * Get object name for [pathName]{@link IMergedChangeInfoBase#pathName} in the repository index.
         * @type {string|undefined} Object name for [pathName]{@link IMergedChangeInfoBase#pathName} in the repository index if [type]{@link IMergedChangeInfoBase#type} is "normal", "rename" or "copy"; otherwise, undefined.
         */
        indexObjectName?: string;
    }
    
    /**
     * Object properties that are common to both "rename" and "copy" change types.
     * @interface IFileCopyChangeInfoBase
     */
    export interface IFileCopyChangeInfoBase extends IMergedChangeInfoBase {
        /**
         * Get original relative path of file if [type]{@link IFileCopyChangeInfoBase#type} is "rename" or "copy"; otherwise, returns undefined.
         * @type {string|undefined}
         */
        originalPath?: string;
    
        /**
         * Get similarity score of [pathName]{@link IFileCopyChangeInfoBase#pathName} between the working copy and the index copy.
         * @type {number|undefined} Similarity score of [pathName]{@link IFileCopyChangeInfoBase#pathName} between the working copy and the index copy if [type]{@link IFileCopyChangeInfoBase#type} is "rename" or "copy"; otherwise, undefined.
         */
        score?: number;
    }
    
    /**
     * Object properties that are common to all un-merged change types.
     * @interface IUnmergedChangeInfoBase
     */
    export interface IUnmergedChangeInfoBase extends ITrackedChangeInfoBase {
        /**
         * Get stage 1 file mode of un-merged working copy referred to by [pathName]{@link IUnmergedChangeInfoBase#pathName}.
         * @type {number|undefined} Numeric stage 1 file mode of working copy referred to by [pathName]{@link IUnmergedChangeInfoBase#pathName} if [type]{@link IUnmergedChangeInfoBase#type} is "unmerged"; otherwise, undefined.
         */
        stage1FileMode?: number;
    
        /**
         * Get stage 2 file mode of un-merged working copy referred to by [pathName]{@link IUnmergedChangeInfoBase#pathName}.
         * @type {number|undefined} Numeric stage 2 file mode of working copy referred to by [pathName]{@link IUnmergedChangeInfoBase#pathName} if [type]{@link IUnmergedChangeInfoBase#type} is "unmerged"; otherwise, undefined.
         */
        stage2FileMode?: number;
    
        /**
         * Get stage 3 file mode of un-merged working copy referred to by [pathName]{@link IUnmergedChangeInfoBase#pathName}.
         * @type {number|undefined} Numeric stage 3 file mode of working copy referred to by [pathName]{@link IUnmergedChangeInfoBase#pathName} if [type]{@link IUnmergedChangeInfoBase#type} is "unmerged"; otherwise, undefined.
         */
        stage3FileMode?: number;
    
        /**
         * Get stage 1 object name for un-merged working copy referred to by [pathName]{@link IUnmergedChangeInfoBase#pathName}.
         * @type {string|undefined} Stage 1 object name for working copy referred to by [pathName]{@link IUnmergedChangeInfoBase#pathName} if [type]{@link IUnmergedChangeInfoBase#type} is "unmerged"; otherwise, undefined.
         */
        stage1ObjectName?: string;
    
        /**
         * Get stage 2 object name for un-merged working copy referred to by [pathName]{@link IUnmergedChangeInfoBase#pathName}.
         * @type {string|undefined} Stage 2 object name for working copy referred to by [pathName]{@link IUnmergedChangeInfoBase#pathName} if [type]{@link IUnmergedChangeInfoBase#type} is "unmerged"; otherwise, undefined.
         */
        stage2ObjectName?: string;
    
        /**
         * Get stage 3 object name for un-merged working copy referred to by [pathName]{@link IUnmergedChangeInfoBase#pathName}.
         * @type {string||undefined} Stage 3 object name for working copy referred to by [pathName]{@link IUnmergedChangeInfoBase#pathName} if [type]{@link IUnmergedChangeInfoBase#type} is "unmerged"; otherwise, undefined.
         */
        stage3ObjectName?: string;
    }
    
    /**
     * Properties for an object which represents a change to a file or sub-module that is untracked, ignored, or it's status is unknown.
     * @interface IUntrackedChangeInfo
     */
    export interface IUntrackedChangeInfo extends IChangeInfoBase {
        /**
         * Get type of change
         * @type {UntrackedChangeType}
         */
        type: UntrackedChangeType;
    }
    
    /**
     * Properties for an object which represents any change to a file or sub-module.
     * @interface IChangeInfo
     */
    export interface IChangeInfo extends IFileCopyChangeInfoBase, IUnmergedChangeInfoBase {
        /**
         * Get type of change
         * @type {ChangeType}
         */
        type: ChangeType;
    }
    
    /**
     * Properties for an object which represents any tracked change to a file or sub-module.
     * @interface ITrackedChangeInfo
     */
    export interface ITrackedChangeInfo extends IFileCopyChangeInfoBase, IUnmergedChangeInfoBase {
        /**
         * Get type of change
         * @type {TrackedChangeType}
         */
        type: TrackedChangeType;
    }
    
    /**
     * Properties for an object which represents an un-merged change to a file or sub-module.
     * @interface IUnmergedChangeInfo
     */
    export interface IUnmergedChangeInfo extends IUnmergedChangeInfoBase {
        /**
         * Get type of change
         * @type {"unmerged"}
         */
        type: "unmerged";
    }
    
    /**
     * Represents a merged change for a file or sub-module.
     * @interface IMergedChangeInfo
     */
    export interface IMergedChangeInfo extends IFileCopyChangeInfoBase {
        /**
         * Get type of change
         * @type {MergedChangeType}
         */
        type: MergedChangeType;
    }
    
    /**
     * Represents a file or sub-module that has been renamed or copied.
     * @interface IFileCopyChangeInfo
     */
    export interface IFileCopyChangeInfo extends IFileCopyChangeInfoBase {
        /**
         * Get type of change
         * @type {CopyChangeType}
         */
        type: CopyChangeType;
    }
    
    /**
     * Represents a normal file change.
     * @interface INormalChangeInfo
     */
    export interface INormalChangeInfo extends IFileCopyChangeInfoBase {
        /**
         * Get type of change
         * @type {"normal"}
         */
        type: "normal";
    }
    
    /**
     * Aggregate type which can be used to construct a {@link ChangeInfo} object.
     */
    export type ChangeInfoSpec = string|INormalChangeInfo|IFileCopyChangeInfo|IUnmergedChangeInfo|IUntrackedChangeInfo|ChangeInfo;
    
    /**
     * Represents a change to a file or sub-module.
     * @class ChangeInfo
     */
    export class ChangeInfo implements IChangeInfo {
        static readonly ordinaryRe = /^1\s+(([MADRCU.])([MADRCU.]))\s+(?:N\.{3}|S([C.])([M.])([U.]))\s+([0-7]+)\s+([0-7]+)\s+([0-7]+)\s+(\S+)\s+(\S+)\s+(.+)$/;
        static readonly copiedRe = /^2\s+(([MADRCU.])([MADRCU.]))\s+(?:N\.{3}|S([C.])([M.])([U.]))\s+([0-7]+)\s+([0-7]+)\s+([0-7]+)\s+(\S+)\s+(\S+)\s+([RC])(\d+)\s+([^\t])\t(.+)$/;
        static readonly unmergedRe = /^u\s+(([MADRCU.])([MADRCU.]))\s+(?:N\.{3}|S([C.])([M.])([U.]))\s+([0-7]+)\s+([0-7]+)\s+([0-7]+)\s+([0-7]+)\s+(\S+)\s+(\S+)\s+(\S+)\s+(.+)$/;
        
        private _pathName : string;
        /**
         * Get file path, relative to repository root.
         * @type {string}
         */
        public get pathName() : string { return this._pathName; }
        
        /**
         * Gets verbal change message
         * @type {string}
         */
        private _message: string;
        public get message() : string { return this._message; }
    
        /**
         * Get type of change
         * @type {ChangeType}
         */
        private _type: ChangeType;
        public get type() : ChangeType { return this._type; }
    
        /**
         * Get original file path.
         * @type {string|undefined} Original relative path of file if [type]{@link ChangeInfo#type} is "rename" or "copy"; otherwise, false.
         */
        private _originalPath?: string;
        public get originalPath() : string|undefined { return this._originalPath; }
    
        /**
         * Get similarity score of [pathName]{@link ChangeInfo#pathName} between the working copy and the index copy.
         * @type {number|undefined} Similarity score of [pathName]{@link ChangeInfo#pathName} between the working copy and the index copy if [type]{@link ChangeInfo#type} is "rename" or "copy"; otherwise, undefined.
         */
        private _score?: number;
        public get score() : number|undefined { return this._score; }
    
        /**
         * Get file mode of [pathName]{@link ChangeInfo#pathName} in the repository HEAD.
         * @type {number|undefined} Numeric file mode value of [pathName]{@link ChangeInfo#pathName} in the repository HEAD if [type]{@link ChangeInfo#type} is "normal", "rename" or "copy"; otherwise, undefined.
         */
        private _headFileMode?: number;
        public get headFileMode() : number|undefined { return this._headFileMode; }
    
        /**
         * Get file mode of [pathName]{@link ChangeInfo#pathName} in the repository index.
         * @type {number|undefined} Numeric file mode value of [pathName]{@link ChangeInfo#pathName} in the repository index if [type]{@link ChangeInfo#type} is "normal", "rename" or "copy"; otherwise, undefined.
         */
        private _indexFileMode?: number;
        public get indexFileMode() : number|undefined { return this._indexFileMode; }
    
        /**
         * Get file mode of the working copy of [pathName]{@link ChangeInfo#pathName}.
         * @type {number|undefined} Numeric file mode value of the working copy of [pathName]{@link ChangeInfo#pathName} if [type]{@link ChangeInfo#type} is "normal", "rename" or "copy"; otherwise, undefined.
         */
        private _workTreeFileMode?: number;
        public get workTreeFileMode() : number|undefined { return this._workTreeFileMode; }
    
        /**
         * Get object name for [pathName]{@link ChangeInfo#pathName} in the repository HEAD.
         * @type {string|undefined} Object name for [pathName]{@link ChangeInfo#pathName} in the repository HEAD if [type]{@link ChangeInfo#type} is "normal", "rename" or "copy"; otherwise, undefined.
         */
        private _headObjectName?: string;
        public get headObjectName() : string|undefined { return this._headObjectName; }
    
        /**
         * Get object name for [pathName]{@link ChangeInfo#pathName} in the repository index.
         * @type {string|undefined} Object name for [pathName]{@link ChangeInfo#pathName} in the repository index if [type]{@link ChangeInfo#type} is "normal", "rename" or "copy"; otherwise, undefined.
         */
        private _indexObjectName?: string;
        public get indexObjectName() : string|undefined { return this._indexObjectName; }
    
        /**
         * Gets verbal change message for the indexed copy of the file.
         * @type {string}
         */
        private _indexMessage?: string;
        public get indexMessage() : string|undefined { return this._indexMessage; }
    
        /**
         * Gets verbal change message for the working copy of the file.
         * @type {string}
         */
        private _workingCopyMessage?: string;
        public get workingCopyMessage() : string|undefined { return this._workingCopyMessage; }
    
        /**
         * Indicates whether [pathName]{@link ChangeInfo#pathName} refers to a sub-module.
         * @type {boolean} True if [pathName]{@link ChangeInfo#pathName} is a sub-module; otherwise, false.
         */
        private _isSubModule: boolean;
        public get isSubModule() : boolean { return this._isSubModule; }
    
        /**
         * Indicates whether the commit has changed in the submodule referred to [pathName]{@link ChangeInfo#pathName}.
         * @type {boolean} True if [isSubModule]{@link ChangeInfo#isSubModule} is true and the sub-module's commit has changed; otherwise, false.
         */
        private _subModuleCommitChanged: boolean;
        public get subModuleCommitChanged() : boolean { return this._subModuleCommitChanged; }
    
        /**
         * Indicates whether the the submodule referred to [pathName]{@link ChangeInfo#pathName} has tracked changes.
         * @type {boolean} True if [isSubModule]{@link ChangeInfo#isSubModule} is true and the sub-module has tracked changes; otherwise, false.
         */
        private _subModuleHasTrackedChanges: boolean;
        public get subModuleHasTrackedChanges() : boolean { return this._subModuleHasTrackedChanges; }
    
        /**
         * Indicates whether the the submodule referred to [pathName]{@link ChangeInfo#pathName} has un-tracked changes.
         * @type {boolean} True if [isSubModule]{@link ChangeInfo#isSubModule} is true and the sub-module has un-tracked changes; otherwise, false.
         */
        private _subModuleHasUntrackedChanges: boolean;
        public get subModuleHasUntrackedChanges() : boolean { return this._subModuleHasUntrackedChanges; }
    
        /**
         * Get stage 1 file mode of un-merged working copy referred to by [pathName]{@link ChangeInfo#pathName}.
         * @type {number|undefined} Numeric stage 1 file mode of working copy referred to by [pathName]{@link ChangeInfo#pathName} if [type]{@link ChangeInfo#type} is "unmerged"; otherwise, undefined.
         */
        private _stage1FileMode?: number;
        public get stage1FileMode() : number|undefined { return this._stage1FileMode; }
    
        /**
         * Get stage 2 file mode of un-merged working copy referred to by [pathName]{@link ChangeInfo#pathName}.
         * @type {number|undefined} Numeric stage 2 file mode of working copy referred to by [pathName]{@link ChangeInfo#pathName} if [type]{@link ChangeInfo#type} is "unmerged"; otherwise, undefined.
         */
        private _stage2FileMode?: number;
        public get stage2FileMode() : number|undefined { return this._stage2FileMode; }
    
        /**
         * Get stage 3 file mode of un-merged working copy referred to by [pathName]{@link ChangeInfo#pathName}.
         * @type {number|undefined} Numeric stage 3 file mode of working copy referred to by [pathName]{@link ChangeInfo#pathName} if [type]{@link ChangeInfo#type} is "unmerged"; otherwise, undefined.
         */
        private _stage3FileMode?: number;
        public get stage3FileMode() : number|undefined { return this._stage3FileMode; }
    
        /**
         * Get stage 1 object name for un-merged working copy referred to by [pathName]{@link ChangeInfo#pathName}.
         * @type {string|undefined} Stage 1 object name for working copy referred to by [pathName]{@link ChangeInfo#pathName} if [type]{@link ChangeInfo#type} is "unmerged"; otherwise, undefined.
         */
        private _stage1ObjectName?: string;
        public get stage1ObjectName() : string|undefined { return this._stage1ObjectName; }
    
        /**
         * Get stage 2 object name for un-merged working copy referred to by [pathName]{@link ChangeInfo#pathName}.
         * @type {string|undefined} Stage 2 object name for working copy referred to by [pathName]{@link ChangeInfo#pathName} if [type]{@link ChangeInfo#type} is "unmerged"; otherwise, undefined.
         */
        private _stage2ObjectName?: string;
        public get stage2ObjectName() : string|undefined { return this._stage2ObjectName; }
    
        /**
         * Get stage 3 object name for un-merged working copy referred to by [pathName]{@link ChangeInfo#pathName}.
         * @type {string||undefined} Stage 3 object name for working copy referred to by [pathName]{@link ChangeInfo#pathName} if [type]{@link ChangeInfo#type} is "unmerged"; otherwise, undefined.
         */
        private _stage3ObjectName?: string;
        public get stage3ObjectName() : string|undefined { return this._stage3ObjectName; }
    
        static isAnyChangeObject(obj?: any): obj is IChangeInfo {
            if (typeof(obj) != "object" || obj === null || Array.isArray(obj))
                return false;
            var type: any|undefined = (<{[index: string]: any|undefined}>obj).type;
            return typeof(type) == "string" && (type == "normal" || type == "rename" || type == "copy" || type == "unmerged" || type == "untracked" || type == "ignored" || type == "unknown");
        }

        static isChangeObject(obj?: any): obj is INormalChangeInfo|IFileCopyChangeInfo|IUnmergedChangeInfo|IUntrackedChangeInfo {
            if (typeof(obj) != "object" || obj === null || Array.isArray(obj))
                return false;
            var type: any|undefined = (<{[index: string]: any|undefined}>obj).type;
            return typeof(type) == "string" && (type == "normal" || type == "rename" || type == "copy" || type == "unmerged" || type == "untracked" || type == "ignored" || type == "unknown");
        }
    
        static isChangeInfo(obj?: any): obj is ChangeInfo {
            if (typeof(obj) != "object" || obj === null)
                return false;
            if (obj instanceof ChangeInfo)
                return true;
            let classProto: { [index: string]: any|undefined } = ChangeInfo.prototype;
                
            let valueProto, valueConstructor;
            if (typeof(obj) == "function") {
                valueConstructor = obj;
                valueProto = obj.prototype;
            } else {
                valueProto = Object.getPrototypeOf(obj);
                valueConstructor = valueProto.constructor;
                while (typeof(valueConstructor) != "function") {
                    valueProto = Object.getPrototypeOf(valueProto);
                    if (typeof(valueProto) == "undefined" || valueProto === null)
                        break;
                    valueConstructor = valueProto.constructor;
                }
            }
            if (typeof(valueConstructor) == "undefined" || valueConstructor === null)
                return false;
            if (valueConstructor === ChangeInfo)
                return true;
            if (typeof(valueProto) == "undefined" || valueProto === null)
                return false;
            
            let constructorChain = [];
            do {
                if (valueProto instanceof ChangeInfo)
                    return true;
                constructorChain.push(valueConstructor);
                valueConstructor = null;
                do {
                    valueProto = Object.getPrototypeOf(valueProto);
                    if (typeof(valueProto) == "undefined" || valueProto === null)
                        break;
                    valueConstructor = valueProto.constructor;
                } while (typeof(valueConstructor) == "undefined" || valueConstructor === null);
            } while (typeof(valueConstructor) != "undefined" && valueConstructor !== null);
            for (let i = 0; i < constructorChain.length; i++) {
                if (constructorChain[i] === ChangeInfo)
                    return true;
            }
            return false;
        }
    
        static isUntrackedChange(obj?: any): obj is IUntrackedChangeInfo {
            if (typeof(obj) != "object" || obj === null || Array.isArray(obj))
                return false;
            var type: any|undefined = (<{[index: string]: any|undefined}>obj).type;
            return typeof(type) == "string" && (type == "untracked" || type == "ignored" || type == "unknown");
        }
    
        static isUnmergedChange(obj?: any): obj is IUnmergedChangeInfo {
            if (typeof(obj) != "object" || obj === null || Array.isArray(obj))
                return false;
            var type: any|undefined = (<{[index: string]: any|undefined}>obj).type;
            return typeof(type) == "string" && type == "unmerged";
        }
    
        static isCopyChange(obj?: any): obj is IFileCopyChangeInfo {
            if (typeof(obj) != "object" || obj === null || Array.isArray(obj))
                return false;
            var type: any|undefined = (<{[index: string]: any|undefined}>obj).type;
            return typeof(type) == "string" && (type == "rename" || type == "copy");
        }
    
        static isNormalChange(obj?: any): obj is INormalChangeInfo {
            if (typeof(obj) != "object" || obj === null || Array.isArray(obj))
                return false;
            var type: any|undefined = (<{[index: string]: any|undefined}>obj).type;
            return typeof(type) == "string" && type == "normal";
        }
    
        constructor(value?: ChangeInfoSpec) {
            if (typeof(value) == "object" && value !== null) {
                if (ChangeInfo.isUntrackedChange(value)) {
                    this._isSubModule = false;
                    this._subModuleCommitChanged = false;
                    this._subModuleHasTrackedChanges = false;
                    this._subModuleHasUntrackedChanges = false;
                } else {
                    if (ChangeInfo.isUnmergedChange(value)) {
                        this._stage1FileMode = (typeof(value.stage1FileMode) == "number") ? value.stage1FileMode : -1;
                        this._stage1ObjectName = (typeof(value.stage1ObjectName) == "string") ? value.stage1ObjectName : "";
                        this._stage2FileMode = (typeof(value.stage2FileMode) == "number") ? value.stage2FileMode : -1;
                        this._stage2ObjectName = (typeof(value.stage2ObjectName) == "string") ? value.stage2ObjectName : "";
                        this._stage3FileMode = (typeof(value.stage3FileMode) == "number") ? value.stage3FileMode : -1;
                        this._stage3ObjectName = (typeof(value.stage3ObjectName) == "string") ? value.stage3ObjectName : "";
                    } else {
                        if (ChangeInfo.isCopyChange(value)) {
                            value.originalPath = (typeof(value.indexMessage) == "string") ? value.originalPath : "";
                            value.score = value.score;
                        } else if (!ChangeInfo.isNormalChange(value)) {
                            this._type = "unknown";
                            this._isSubModule = false;
                            this._message = "";
                            this._pathName = "";
                            this._subModuleCommitChanged = false;
                            this._subModuleHasTrackedChanges = false;
                            this._subModuleHasUntrackedChanges = false;
                            return;
                        }
                        this._headFileMode = (typeof(value.headFileMode) == "number") ? value.headFileMode : -1;
                        this._headObjectName = (typeof(value.headObjectName) == "string") ? value.headObjectName : "";
                        this._indexFileMode = (typeof(value.indexFileMode) == "number") ? value.indexFileMode : -1;
                        this._indexObjectName = (typeof(value.indexObjectName) == "string") ? value.indexObjectName : "";
                        this._workTreeFileMode = (typeof(value.workTreeFileMode) == "number") ? value.workTreeFileMode : -1;
                    }
                    this._indexMessage = (typeof(value.indexMessage) == "string") ? value.indexMessage : "";
                    this._workingCopyMessage = (typeof(value.workingCopyMessage) == "string") ? value.workingCopyMessage : "";
                    this._isSubModule = (value.isSubModule === true);
                    if (this._isSubModule) {
                        this._subModuleCommitChanged = (value.subModuleCommitChanged === true);
                        this._subModuleHasTrackedChanges = (value.subModuleHasTrackedChanges === true);
                        this._subModuleHasUntrackedChanges = (value.subModuleHasUntrackedChanges === true);
                    } else if (value.subModuleCommitChanged === true) {
                        this._isSubModule = true;
                        this._subModuleCommitChanged = true;
                        this._subModuleHasTrackedChanges = (value.subModuleHasTrackedChanges === true);
                        this._subModuleHasUntrackedChanges = (value.subModuleHasUntrackedChanges === true);
                    } else if (value.subModuleHasTrackedChanges === true) {
                        this._isSubModule = true;
                        this._subModuleCommitChanged = false;
                        this._subModuleHasTrackedChanges = true;
                        this._subModuleHasUntrackedChanges = (value.subModuleHasUntrackedChanges === true);
                    } else if (value.subModuleHasUntrackedChanges === true) {
                        this._isSubModule = true;
                        this._subModuleCommitChanged = false;
                        this._subModuleHasTrackedChanges = false;
                        this._subModuleHasUntrackedChanges = true;
                    } else {
                        this._subModuleCommitChanged = false;
                        this._subModuleHasTrackedChanges = false;
                        this._subModuleHasUntrackedChanges = false;
                    }
                }
                this._type = value.type;
                this._message = (typeof(value.message) == "string") ? value.message : "";
                this._pathName = (typeof(value.pathName) == "string") ? value.pathName : "";
                return;
            }
            
            let str: string = (typeof(value) == "string") ? value : "";
        
            this._type = "unknown";
            this._isSubModule = false;
            this._message = "";
            this._pathName = "";
            this._subModuleCommitChanged = false;
            this._subModuleHasTrackedChanges = false;
            this._subModuleHasUntrackedChanges = false;
    
            var type = (typeof(str) != "string" || str.length == 0) ? "" : str.substr(0, 1);
            var matchResult, i;
            switch (type) {
                case "1":
                    if (typeof(matchResult = str.match(ChangeInfo.ordinaryRe)) != "object" || matchResult === null || matchResult.length < 13)
                        return;
                    this._type = "normal";
                    break;
                case "2":
                    if (typeof(matchResult = str.match(ChangeInfo.copiedRe)) != "object" || matchResult === null || matchResult.length < 16)
                        return;
                    this._type = (matchResult[12] === "R") ? "rename" : "copy";
                    break;
                case "u":
                case "U":
                    if (typeof(matchResult = str.match(ChangeInfo.unmergedRe)) != "object" || matchResult === null || matchResult.length < 15)
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
            if (typeof(matchResult) != "object" || matchResult === null) {
                this._message = str;
                return;
            }
            
            this._message = convertFromChangeShortFormat(matchResult[1]);
            this._indexMessage = convertFromChangeShortFormat(matchResult[2]);
            this._workingCopyMessage = convertFromChangeShortFormat(matchResult[3]);
            this._isSubModule = (typeof(matchResult[4]) == "string");
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
    }
    
    export interface IStatusInfo {
        /**
         * Get name of current commit.
         * @type {string|undefined}
         */
        currentCommit?: string;
        /**
         * Get name of current branch.
         * @type {string|undefined}
         */
        currentBranch?: string;
        /**
         * Get name of upstream remote.
         * @type {string|undefined}
         */
        upstreamRemote?: string;
        /**
         * Get name of upstream branch.
         * @type {string|undefined}
         */
        upstreamBranch?: string;
        /**
         * Get ahead count.
         * @type {number|undefined}
         */
        aheadCount?: number;
        /**
         * Get behind count.
         * @type {number|undefined}
         */
        behindCount?: number;
    }
    
    export class StatusInfo implements IStatusInfo {
        static readonly gsRe: RegExp = /^#\s+branch.(oid|head|upstream|ab)\s+(([^\/]+)\/(\S.*)|\+(\d+)\s+-(\d+)|.+)/;
    
        private _currentCommit: string;
        /**
         * Get name of current commit.
         * @type {string}
         */
        public get currentCommit(): string { return this._currentCommit; }
        
        private _currentBranch: string;
        /**
         * Get name of current branch.
         * @type {string}
         */
        public get currentBranch(): string { return this._currentBranch; }
    
        private _upstreamRemote: string;
        /**
         * Get name of upstream remote.
         * @type {string}
         */
        public get upstreamRemote(): string { return this._upstreamRemote; }
    
        private _upstreamBranch: string;
        /**
         * Get name of upstream branch.
         * @type {string}
         */
        public get upstreamBranch(): string { return this._upstreamBranch; }
    
        private _aheadCount: number;
        /**
         * Get ahead count.
         * @type {number}
         */
        public get aheadCount(): number { return this._aheadCount; }
    
        private _behindCount: number;
        /**
         * Get behind count.
         * @type {number}
         */
        public get behindCount(): number { return this._behindCount; }
    
        private _changes: ChangeInfo[];
        /**
         * Get repository changes.
         * @type {ReadonlyArray<ChangeInfo>}
         */
        public get changes(): ReadonlyArray<ChangeInfo> { return this._changes; }
    
        private _ignoredChanges: ChangeInfo[];
        /**
         * Get ignored repository changes.
         * @type {ReadonlyArray<ChangeInfo>}
         */
        public get ignoredChanges(): ReadonlyArray<ChangeInfo> { return this._ignoredChanges; }
    
        /**
         * Inititialize new GitStatus object.
         * @param {string|string[]|IStatusInfo|undefined} [source] If string value, Parse as output from [Git status output using Porcelain version 2]{@link https://git-scm.com/docs/git-status#_porcelain_format_version_2};
         *      otherwise, .
         * @param {ChangeInfoSpec|ChangeInfoSpec[]} [chg] String values are interpreted as the relative path of files which should be an "ignored" type, regardless of the actual status; Non-string values will be used for adding file change information.
         * @param {..GitChangeInfoSpec|undefined} [changes] Additional arguments where string values are interpreted as the relative path of files which should be an "ignored" type, regardless of the actual status, and non-string values will be used for adding file change information.
         */
        constructor (source?: string|string[]|IStatusInfo, chg?: ChangeInfoSpec|ChangeInfoSpec[], ...changes: ChangeInfoSpec[]) {
            this._currentCommit = "";
            this._currentBranch = "";
            this._upstreamRemote = "";
            this._upstreamBranch = "";
            this._aheadCount = 0;
            this._behindCount = 0;
            this._changes = [];
            this._ignoredChanges = [];

            let forceAsIgnored: string[] = [];
            let changeArgs: (INormalChangeInfo|IFileCopyChangeInfo|IUnmergedChangeInfo|IUntrackedChangeInfo|ChangeInfo)[]  = [];
            switch (typeof(chg)) {
                case "string":
                    forceAsIgnored.push(<string>chg);
                    break;
                case "object":
                    if (ChangeInfo.isChangeObject(chg))
                        changeArgs.push(chg);
                    break;
            }
            if (typeof(changes) == "object" && changes !== null) {
                changes.forEach(c => {
                    switch (typeof(c)) {
                        case "string":
                            forceAsIgnored.push(<string>c);
                            break;
                        case "object":
                            if (ChangeInfo.isChangeObject(c))
                                changeArgs.push(c);
                            break;
                    }
                });
            }

            let statusInfo: IStatusInfo|string[]|undefined;
            if (typeof(source) == "string")
                statusInfo = source.split(/[\r\n]+/).filter(l => l.trim().length > 0);
            else if (typeof(source) == "object") {
                if (source !== null) {
                    if (Array.isArray(source)) {
                        statusInfo = [];
                        source.filter((o?: any) => typeof(o) == "string").forEach((ln: string) => statusInfo = (<string[]>statusInfo).concat(ln.split(/[\r\n]+/)));
                        statusInfo = statusInfo.filter(l => l.trim().length > 0);
                    } else if (typeof(source) == "object" && source !== null)
                        statusInfo = source;
                }
            }
            
            if (typeof(statusInfo) == "object") {
                if (Array.isArray(statusInfo)) {
                    this._changes = <ChangeInfo[]>statusInfo.map(function(this: StatusInfo, ln: string) {
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
                        if (typeof(matchResult = ln.match(StatusInfo.gsRe)) != "object" || matchResult === null || matchResult.length < 7)
                            return;
                        switch (matchResult[1]) {
                            case "oid":
                                this._currentCommit = matchResult[2];
                                break;
                            case "head":
                                this._currentBranch = matchResult[2];
                                break;
                            case "upstream":
                                if (typeof(matchResult[3] == "string"))
                                    this._upstreamRemote = matchResult[3],
                                    this._upstreamBranch =  matchResult[4]
                                break;
                            default:
                                if (typeof(matchResult[5]) == "string") {
                                    this._aheadCount = parseInt(matchResult[5]);
                                    this._behindCount = parseInt(matchResult[6]);
                                }
                                break;
                        }
                    }, this).filter(function(r) { return typeof(r) != "undefined"; });
                } else {
                    this._aheadCount = (typeof(statusInfo.aheadCount) == "number") ? statusInfo.aheadCount : 0;
                    this._behindCount = (typeof(statusInfo.behindCount) == "number") ? statusInfo.behindCount : 0;
                    this._currentBranch = (typeof(statusInfo.currentBranch) == "string") ? statusInfo.currentBranch : "";
                    this._currentCommit = (typeof(statusInfo.currentCommit) == "string") ? statusInfo.currentCommit : "";
                    this._upstreamBranch = (typeof(statusInfo.upstreamBranch) == "string") ? statusInfo.upstreamBranch : "";
                    this._upstreamRemote = (typeof(statusInfo.upstreamRemote) == "string") ? statusInfo.upstreamRemote : "";
                }
            } else {
                this._aheadCount = 0;
                this._behindCount = 0;
                this._currentBranch = "";
                this._currentCommit = "";
                this._upstreamBranch = "";
                this._upstreamRemote = "";
            }
            if ((changeArgs = changeArgs.filter(c => ChangeInfo.isChangeObject(c))).length == 0)
                return;
            let changeArr: ChangeInfo[] = changeArgs.map(c => (ChangeInfo.isChangeInfo(c)) ? c : new ChangeInfo(c)).filter(c => {
                if (c.type != "ignored" && c.type != "unknown")
                    return true;
                this._ignoredChanges.push(c);
                return false;
            });
            if (changeArr.length == 0)
                return;
            if (forceAsIgnored.length > 0)
            {
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
    }
}