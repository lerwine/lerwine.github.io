export declare module lerwineGitUtils {
    /**
     * Type names for change to files or sub-modules.
     * @typedef ChangeType
     */
    type ChangeType = TrackedChangeType | UntrackedChangeType;
    /**
     * Type names for changes to files or sub-modules that are tracked.
     * @typedef TrackedChangeType
     */
    type TrackedChangeType = MergedChangeType | "unmerged";
    /**
     * Type names for changes to files or sub-modules that have been merged.
     * @typedef MergedChangeType
     */
    type MergedChangeType = CopyChangeType | "normal";
    /**
     * Type names for files or sub-modules that have been renamed or copied.
     * @typedef CopyChangeType
     */
    type CopyChangeType = "rename" | "copy";
    /**
     * Type names for changes which are untracked, ignored or the status is unknown.
     * @typedef UntrackedChangeType
     */
    type UntrackedChangeType = "untracked" | "ignored" | "unknown";
    /**
     * Object properties that are common to all change types.
     * @interface IChangeInfoBase
     */
    interface IChangeInfoBase {
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
    interface ITrackedChangeInfoBase extends IChangeInfoBase {
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
    interface IMergedChangeInfoBase extends ITrackedChangeInfoBase {
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
    interface IFileCopyChangeInfoBase extends IMergedChangeInfoBase {
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
    interface IUnmergedChangeInfoBase extends ITrackedChangeInfoBase {
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
    interface IUntrackedChangeInfo extends IChangeInfoBase {
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
    interface IChangeInfo extends IFileCopyChangeInfoBase, IUnmergedChangeInfoBase {
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
    interface ITrackedChangeInfo extends IFileCopyChangeInfoBase, IUnmergedChangeInfoBase {
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
    interface IUnmergedChangeInfo extends IUnmergedChangeInfoBase {
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
    interface IMergedChangeInfo extends IFileCopyChangeInfoBase {
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
    interface IFileCopyChangeInfo extends IFileCopyChangeInfoBase {
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
    interface INormalChangeInfo extends IFileCopyChangeInfoBase {
        /**
         * Get type of change
         * @type {"normal"}
         */
        type: "normal";
    }
    /**
     * Aggregate type which can be used to construct a {@link ChangeInfo} object.
     */
    type ChangeInfoSpec = string | INormalChangeInfo | IFileCopyChangeInfo | IUnmergedChangeInfo | IUntrackedChangeInfo | ChangeInfo;
    /**
     * Represents a change to a file or sub-module.
     * @class ChangeInfo
     */
    class ChangeInfo implements IChangeInfo {
        static readonly ordinaryRe: RegExp;
        static readonly copiedRe: RegExp;
        static readonly unmergedRe: RegExp;
        private _pathName;
        /**
         * Get file path, relative to repository root.
         * @type {string}
         */
        readonly pathName: string;
        /**
         * Gets verbal change message
         * @type {string}
         */
        private _message;
        readonly message: string;
        /**
         * Get type of change
         * @type {ChangeType}
         */
        private _type;
        readonly type: ChangeType;
        /**
         * Get original file path.
         * @type {string|undefined} Original relative path of file if [type]{@link ChangeInfo#type} is "rename" or "copy"; otherwise, false.
         */
        private _originalPath?;
        readonly originalPath: string | undefined;
        /**
         * Get similarity score of [pathName]{@link ChangeInfo#pathName} between the working copy and the index copy.
         * @type {number|undefined} Similarity score of [pathName]{@link ChangeInfo#pathName} between the working copy and the index copy if [type]{@link ChangeInfo#type} is "rename" or "copy"; otherwise, undefined.
         */
        private _score?;
        readonly score: number | undefined;
        /**
         * Get file mode of [pathName]{@link ChangeInfo#pathName} in the repository HEAD.
         * @type {number|undefined} Numeric file mode value of [pathName]{@link ChangeInfo#pathName} in the repository HEAD if [type]{@link ChangeInfo#type} is "normal", "rename" or "copy"; otherwise, undefined.
         */
        private _headFileMode?;
        readonly headFileMode: number | undefined;
        /**
         * Get file mode of [pathName]{@link ChangeInfo#pathName} in the repository index.
         * @type {number|undefined} Numeric file mode value of [pathName]{@link ChangeInfo#pathName} in the repository index if [type]{@link ChangeInfo#type} is "normal", "rename" or "copy"; otherwise, undefined.
         */
        private _indexFileMode?;
        readonly indexFileMode: number | undefined;
        /**
         * Get file mode of the working copy of [pathName]{@link ChangeInfo#pathName}.
         * @type {number|undefined} Numeric file mode value of the working copy of [pathName]{@link ChangeInfo#pathName} if [type]{@link ChangeInfo#type} is "normal", "rename" or "copy"; otherwise, undefined.
         */
        private _workTreeFileMode?;
        readonly workTreeFileMode: number | undefined;
        /**
         * Get object name for [pathName]{@link ChangeInfo#pathName} in the repository HEAD.
         * @type {string|undefined} Object name for [pathName]{@link ChangeInfo#pathName} in the repository HEAD if [type]{@link ChangeInfo#type} is "normal", "rename" or "copy"; otherwise, undefined.
         */
        private _headObjectName?;
        readonly headObjectName: string | undefined;
        /**
         * Get object name for [pathName]{@link ChangeInfo#pathName} in the repository index.
         * @type {string|undefined} Object name for [pathName]{@link ChangeInfo#pathName} in the repository index if [type]{@link ChangeInfo#type} is "normal", "rename" or "copy"; otherwise, undefined.
         */
        private _indexObjectName?;
        readonly indexObjectName: string | undefined;
        /**
         * Gets verbal change message for the indexed copy of the file.
         * @type {string}
         */
        private _indexMessage?;
        readonly indexMessage: string | undefined;
        /**
         * Gets verbal change message for the working copy of the file.
         * @type {string}
         */
        private _workingCopyMessage?;
        readonly workingCopyMessage: string | undefined;
        /**
         * Indicates whether [pathName]{@link ChangeInfo#pathName} refers to a sub-module.
         * @type {boolean} True if [pathName]{@link ChangeInfo#pathName} is a sub-module; otherwise, false.
         */
        private _isSubModule;
        readonly isSubModule: boolean;
        /**
         * Indicates whether the commit has changed in the submodule referred to [pathName]{@link ChangeInfo#pathName}.
         * @type {boolean} True if [isSubModule]{@link ChangeInfo#isSubModule} is true and the sub-module's commit has changed; otherwise, false.
         */
        private _subModuleCommitChanged;
        readonly subModuleCommitChanged: boolean;
        /**
         * Indicates whether the the submodule referred to [pathName]{@link ChangeInfo#pathName} has tracked changes.
         * @type {boolean} True if [isSubModule]{@link ChangeInfo#isSubModule} is true and the sub-module has tracked changes; otherwise, false.
         */
        private _subModuleHasTrackedChanges;
        readonly subModuleHasTrackedChanges: boolean;
        /**
         * Indicates whether the the submodule referred to [pathName]{@link ChangeInfo#pathName} has un-tracked changes.
         * @type {boolean} True if [isSubModule]{@link ChangeInfo#isSubModule} is true and the sub-module has un-tracked changes; otherwise, false.
         */
        private _subModuleHasUntrackedChanges;
        readonly subModuleHasUntrackedChanges: boolean;
        /**
         * Get stage 1 file mode of un-merged working copy referred to by [pathName]{@link ChangeInfo#pathName}.
         * @type {number|undefined} Numeric stage 1 file mode of working copy referred to by [pathName]{@link ChangeInfo#pathName} if [type]{@link ChangeInfo#type} is "unmerged"; otherwise, undefined.
         */
        private _stage1FileMode?;
        readonly stage1FileMode: number | undefined;
        /**
         * Get stage 2 file mode of un-merged working copy referred to by [pathName]{@link ChangeInfo#pathName}.
         * @type {number|undefined} Numeric stage 2 file mode of working copy referred to by [pathName]{@link ChangeInfo#pathName} if [type]{@link ChangeInfo#type} is "unmerged"; otherwise, undefined.
         */
        private _stage2FileMode?;
        readonly stage2FileMode: number | undefined;
        /**
         * Get stage 3 file mode of un-merged working copy referred to by [pathName]{@link ChangeInfo#pathName}.
         * @type {number|undefined} Numeric stage 3 file mode of working copy referred to by [pathName]{@link ChangeInfo#pathName} if [type]{@link ChangeInfo#type} is "unmerged"; otherwise, undefined.
         */
        private _stage3FileMode?;
        readonly stage3FileMode: number | undefined;
        /**
         * Get stage 1 object name for un-merged working copy referred to by [pathName]{@link ChangeInfo#pathName}.
         * @type {string|undefined} Stage 1 object name for working copy referred to by [pathName]{@link ChangeInfo#pathName} if [type]{@link ChangeInfo#type} is "unmerged"; otherwise, undefined.
         */
        private _stage1ObjectName?;
        readonly stage1ObjectName: string | undefined;
        /**
         * Get stage 2 object name for un-merged working copy referred to by [pathName]{@link ChangeInfo#pathName}.
         * @type {string|undefined} Stage 2 object name for working copy referred to by [pathName]{@link ChangeInfo#pathName} if [type]{@link ChangeInfo#type} is "unmerged"; otherwise, undefined.
         */
        private _stage2ObjectName?;
        readonly stage2ObjectName: string | undefined;
        /**
         * Get stage 3 object name for un-merged working copy referred to by [pathName]{@link ChangeInfo#pathName}.
         * @type {string||undefined} Stage 3 object name for working copy referred to by [pathName]{@link ChangeInfo#pathName} if [type]{@link ChangeInfo#type} is "unmerged"; otherwise, undefined.
         */
        private _stage3ObjectName?;
        readonly stage3ObjectName: string | undefined;
        static isAnyChangeObject(obj?: any): obj is IChangeInfo;
        static isChangeObject(obj?: any): obj is INormalChangeInfo | IFileCopyChangeInfo | IUnmergedChangeInfo | IUntrackedChangeInfo;
        static isChangeInfo(obj?: any): obj is ChangeInfo;
        static isUntrackedChange(obj?: any): obj is IUntrackedChangeInfo;
        static isUnmergedChange(obj?: any): obj is IUnmergedChangeInfo;
        static isCopyChange(obj?: any): obj is IFileCopyChangeInfo;
        static isNormalChange(obj?: any): obj is INormalChangeInfo;
        constructor(value?: ChangeInfoSpec);
    }
    interface IStatusInfo {
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
    class StatusInfo implements IStatusInfo {
        static readonly gsRe: RegExp;
        private _currentCommit;
        /**
         * Get name of current commit.
         * @type {string}
         */
        readonly currentCommit: string;
        private _currentBranch;
        /**
         * Get name of current branch.
         * @type {string}
         */
        readonly currentBranch: string;
        private _upstreamRemote;
        /**
         * Get name of upstream remote.
         * @type {string}
         */
        readonly upstreamRemote: string;
        private _upstreamBranch;
        /**
         * Get name of upstream branch.
         * @type {string}
         */
        readonly upstreamBranch: string;
        private _aheadCount;
        /**
         * Get ahead count.
         * @type {number}
         */
        readonly aheadCount: number;
        private _behindCount;
        /**
         * Get behind count.
         * @type {number}
         */
        readonly behindCount: number;
        private _changes;
        /**
         * Get repository changes.
         * @type {ReadonlyArray<ChangeInfo>}
         */
        readonly changes: ReadonlyArray<ChangeInfo>;
        private _ignoredChanges;
        /**
         * Get ignored repository changes.
         * @type {ReadonlyArray<ChangeInfo>}
         */
        readonly ignoredChanges: ReadonlyArray<ChangeInfo>;
        /**
         * Inititialize new GitStatus object.
         * @param {string|string[]|IStatusInfo|undefined} [source] If string value, Parse as output from [Git status output using Porcelain version 2]{@link https://git-scm.com/docs/git-status#_porcelain_format_version_2};
         *      otherwise, .
         * @param {ChangeInfoSpec|ChangeInfoSpec[]} [chg] String values are interpreted as the relative path of files which should be an "ignored" type, regardless of the actual status; Non-string values will be used for adding file change information.
         * @param {..GitChangeInfoSpec|undefined} [changes] Additional arguments where string values are interpreted as the relative path of files which should be an "ignored" type, regardless of the actual status, and non-string values will be used for adding file change information.
         */
        constructor(source?: string | string[] | IStatusInfo, chg?: ChangeInfoSpec | ChangeInfoSpec[], ...changes: ChangeInfoSpec[]);
    }
}
//# sourceMappingURL=index.d.ts.map