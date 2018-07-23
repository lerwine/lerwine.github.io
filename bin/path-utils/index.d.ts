/// <reference types="node" />
import * as FS from "fs";
import * as Path from "path";
/**
 * Parses path string into individual segments.
 * @param pathString Path string to be parsed.
 * @returns {string[]} Individual segments of path string.
 */
export declare function getPathSegments(pathString: string): string[];
export declare function getActualPath(path: string, resolve?: boolean): string;
export declare function containsChildOrEquals(parent: string, child: string): boolean;
export declare function arePathsEqual(x: string, y: string): boolean;
/**
 * Gets a normalized, relative path string.
 * @param pathString Path string(s) to be normalized as a relative path string.
 */
export declare function ensureRelativePath(pathString: string): string;
export declare function isParsedPath(value?: FS.PathLike | Path.ParsedPath | null): value is Path.ParsedPath;
//# sourceMappingURL=index.d.ts.map