import * as FS from "fs";
import * as Path from "path";

/**
 * Parses path string into individual segments.
 * @param pathString Path string to be parsed.
 * @returns {string[]} Individual segments of path string.
 */
export function getPathSegments(pathString: string): string[] {
    pathString = Path.normalize(pathString);
    let parsedPath: Path.ParsedPath = Path.parse(pathString);
    let segments: string[] = [];
    let trailingSlash: boolean = pathString.endsWith(Path.sep);
    if (Path.isAbsolute(pathString)) {
        segments.push(parsedPath.root);
        pathString = parsedPath.dir.substr(parsedPath.root.length);
        if (pathString.startsWith(Path.sep))
            pathString = pathString.substr(Path.sep.length);
        if (pathString.length > 0)
            segments = segments.concat(pathString.split(Path.sep));

        if (parsedPath.base.length > 0)
            segments = segments.concat([parsedPath.base]);
        else if (segments.length == 1)
            trailingSlash = false;
    } else {
        if (parsedPath.base == pathString)
            segments = [pathString];
        else
        {
            segments = (parsedPath.dir.length > 0) ? parsedPath.dir.split(Path.sep) : [];
            if (parsedPath.base.length > 0)
                segments.push(parsedPath.base);
            if (segments.length == 0)
                segments = ["."];
        }
    }
    if (trailingSlash)
        segments.push("");
    if (segments[0].endsWith(Path.sep) && segments[0].length > Path.sep.length)
        segments[0] = segments[0].substr(0, segments[0].length - Path.sep.length)
    return segments;
}

function __getActualPath(path: Path.ParsedPath): string {
    if (path.base.length == 0) {
        if (path.root.length > 0 && path.root != path.dir)
            return __getActualPath(Path.parse(path.dir));
        return path.dir;
    }
    let dirname: string;
    if (path.dir.length == 0 || path.dir == "." || (dirname = __getActualPath(Path.parse(path.dir))).length == 0)
        dirname = ".";
    let lc: string = path.base.toLowerCase();
    let ms: string[] = FS.readdirSync(dirname).filter(function(n: string) { return n.toLowerCase() == lc; });
    if (path.dir.length == 0)
        return (ms.filter(function(n: string) { return n == path.base; }).length == 0) ? ms[0] :  path.base;
    return Path.normalize(Path.join(dirname, (ms.filter(function(n: string) { return n == path.base; }).length == 0) ? ms[0] :  path.base));
}

export function getActualPath(path: string, resolve?: boolean): string  {
    path =  Path.normalize(path);
    let orignalNormPath: string = path;
    if (path.length > 1 && path.endsWith(Path.sep))
        path = path.substr(0, path.length - Path.sep.length);
    let stats: FS.Stats|undefined;
    try { stats = FS.statSync(path); } catch (e) { stats = undefined; }
    if (typeof(stats) != "undefined") {
        if (typeof(resolve) == "boolean" && resolve == true)
            return __getActualPath(Path.parse(FS.realpathSync(orignalNormPath)));
        return __getActualPath(Path.parse(orignalNormPath));    
    }
    let parsed: Path.ParsedPath = Path.parse(orignalNormPath);
    if (parsed.base.length == 0) {
        if (parsed.root.length > 0 && parsed.root != parsed.dir)
            return getActualPath(parsed.dir, resolve);
        return parsed.dir;
    }
    if (parsed.dir.length == 0 || (path = getActualPath(parsed.dir, resolve)).length == 0)
        path = parsed.base;
    else
        path = Path.normalize(Path.join(path, parsed.base));
    if (typeof(resolve) == "boolean" && resolve == true && !Path.isAbsolute(path))
        return Path.normalize(Path.join(process.cwd(), path));
    return path;
}

export function containsChildOrEquals(parent: string, child: string) {
    if (parent == child)
        return true;
    parent = (parent.length == 0) ? Path.dirname(parent) : Path.normalize(parent);
    child = (child.length == 0) ? Path.dirname(child) : Path.normalize(child);
    if (parent == child)
        return true;
    parent = getActualPath(parent, true);
    child = getActualPath(child, true);
    while (child.length > parent.length) {
        let parsed: Path.ParsedPath = Path.parse(child);
        if (parsed.dir.length == 0 || parsed.dir == ".")
            return false;
        child = parsed.dir;
    }
    return (parent == child);
}

export function arePathsEqual(x: string, y: string) {
    if (x == y)
        return true;
    x = (x.length == 0) ? Path.dirname(x) : Path.normalize(x);
    y = (y.length == 0) ? Path.dirname(y) : Path.normalize(y);
    if (x == y)
        return true;
    x = getActualPath(x, true);
    y = getActualPath(y, true);
    return x == y;
}

/**
 * Gets a normalized, relative path string.
 * @param pathString Path string(s) to be normalized as a relative path string.
 */
export function ensureRelativePath(pathString: string): string {   
    pathString = (pathString.length == 0) ? Path.dirname(pathString) : Path.normalize(pathString);
    if (!Path.isAbsolute(pathString))
        return pathString;
    let parsedPath: Path.ParsedPath = Path.parse(pathString);
    pathString = parsedPath.dir.substr(parsedPath.root.length);
    if (pathString.startsWith(Path.sep))
        pathString = pathString.substr(Path.sep.length);
    if (pathString.length == 0)
        pathString = parsedPath.base;
    else if (parsedPath.base.length > 0)
        pathString = Path.join(pathString, parsedPath.base);
    return (pathString.length == 0) ? Path.dirname(pathString) : pathString;
}

export function isParsedPath(value?: FS.PathLike|Path.ParsedPath|null): value is Path.ParsedPath {
    return typeof(value) == "object" && value !== null && !Array.isArray(value) && typeof((<{ [index: string]: any }>value).root) == "string" &&
        typeof((<{ [index: string]: any }>value).dir) == "string" && typeof((<{ [index: string]: any }>value).base) == "string" &&
        typeof((<{ [index: string]: any }>value).ext) == "string" && typeof((<{ [index: string]: any }>value).name) == "string";
}
