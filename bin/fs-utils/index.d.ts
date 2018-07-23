import * as TS from "gulp-typescript";
/**
 * Remove file or directory and all contents.
 * @param path Path to file or subdirectory.
 */
export declare function removeFsItemRecursive(path: string): void;
export declare function syncFolders(source: string, dest: string, force: boolean, ignore?: string[]): boolean | undefined;
export interface IPackageJsonObject {
    name?: string;
    version?: string;
    description?: string;
    main?: string;
    scripts: {
        [key: string]: string | undefined;
    };
    repository: {
        type?: string;
        url?: string;
    };
    author?: string;
    license?: string;
    bugs?: {
        url?: string;
        [key: string]: string | undefined;
    };
    homepage?: string;
    directories?: {
        lib?: string;
        [key: string]: string | undefined;
    };
    dependencies?: {
        [key: string]: string;
    };
    devDependencies?: {
        [key: string]: string;
    };
    [key: string]: any;
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
    errorMessage: string;
    /**
     * Error detail object
     * @type {*}
     */
    errorObject: any;
}
/**
 * Tests whether an object implements {@link IParseErrorResult}.
 * @param {*} obj Object to test.
 * @returns True if object implements {@link IParseErrorResult}; otherwie, false.
 */
export declare function isIParseErrorResult(obj?: any): obj is IParseErrorResult;
export declare function parseFile<T>(filePath: string, callback: {
    (p: string): T | undefined;
}): IParseErrorResult | T | undefined;
export declare function loadPackageFile(path: string): IPackageJsonObject | IParseErrorResult | undefined;
export declare function loadTsConfigFile(path: string): {
    outDir: string;
    tsConfig: TS.Project;
} | IParseErrorResult | undefined;
//# sourceMappingURL=index.d.ts.map