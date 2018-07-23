import * as FS from "fs";
import * as Path from "path";
import * as textEncoding from '../text-encoding';
import * as pathUtil from '../path-utils';
import { removeFsItemRecursive } from '../fs-utils';

export interface IJsonFsArchive {
    name: string;
    birthtime: Date|string;
    mtime: Date|string;
}

export interface IJsonDirectoryArchive extends IJsonFsArchive {
    childItems: (IJsonDirectoryArchive|IJSONFileArchive)[]
}

export interface IJSONFileArchive extends IJsonFsArchive {
    size: number;
    encoding: textEncoding.EncodingType,
    content: string[],
    eolType?: textEncoding.EOLtype
}

function isJSONFileArchive(value?: IJsonFsArchive|null): value is IJSONFileArchive {
    return typeof(value) == "object" && value !== null && !Array.isArray(value) && typeof((<{ [index: string]: any}>value).size) == "number" &&
        typeof((<{ [index: string]: any}>value).encoding) == "string";
}

function unpackFsContentFromJSON(source: IJsonDirectoryArchive|IJSONFileArchive|(IJsonDirectoryArchive|IJSONFileArchive)[], targetDir: string|Path.ParsedPath, overwrite?: boolean): void {
    if (Array.isArray(source)) {
        source.forEach(function(f: IJsonDirectoryArchive|IJSONFileArchive) { unpackFsContentFromJSON(f, targetDir); });
        return;
    }
    let fsPath: string;
    let parsedPath: Path.ParsedPath;
    if (pathUtil.isParsedPath(targetDir)) {
        fsPath = Path.format(targetDir);
        parsedPath = targetDir;
    } else {
        fsPath = targetDir;
        parsedPath = Path.parse(targetDir);
    }
    console.info("Unpacking %s", fsPath);
    let stats: FS.Stats|undefined;
    stats = FS.statSync(fsPath);
    if (!stats.isDirectory())
        throw new Error("Target path must be a subdirectory.");
    fsPath = Path.join(source.name);
    try { stats = FS.statSync(fsPath); } catch { stats = undefined; }
    if (typeof(stats) != "undefined") {
        if (!overwrite)
            throw new Error("Target " + ((stats.isDirectory()) ? "directory" : "file") + " already exists");
        console.info("Removing %s", fsPath);
        removeFsItemRecursive(fsPath);
    }

    let mtime: Date = (typeof(source.mtime) == "string") ? new Date(source.mtime) : source.mtime;

    if (isJSONFileArchive(source)) {
        let buffer: Buffer;
        let intermediaryEncoding: textEncoding.EncodingType = source.encoding;
        let options: { [index: string]: string; }|undefined;
        switch (source.encoding) {
            case "binary":
            case "base64":
            case "hex":
                break;
            case "utf16be":
            case "utf32be":
            case "utf32le":
                intermediaryEncoding = "utf16le";
                break;
            default:
                options = { encoding: source.encoding };
                break;
        }
        if (source.content.length == 0)
            buffer = new Buffer("");
        if (source.content.length == 1)
            buffer = new Buffer(source.content[0], intermediaryEncoding);
        else if (typeof(source.eolType) != undefined)
            buffer = new Buffer(source.content.join(textEncoding.getEOLsequence(source.eolType)), intermediaryEncoding);
        else
            buffer = new Buffer(source.content.join(""), intermediaryEncoding);
        if (intermediaryEncoding != source.encoding)
            buffer = textEncoding.convertBufferEncoding(buffer, intermediaryEncoding, source.encoding);
        console.info("Writing %d bytes to %s", buffer.byteLength, fsPath);
        FS.writeFileSync(fsPath, buffer, options);
        console.info("Updating modification time to %s", mtime);
        FS.utimesSync(fsPath, mtime, mtime);
        return;
    }

    console.info("Creating %s", fsPath);
    FS.mkdirSync(fsPath);
    console.info("Updating modification time to %s", mtime);
    FS.utimesSync(fsPath, mtime, mtime);
    unpackFsContentFromJSON(source.childItems, fsPath, overwrite);
}

function packFsContentAsJSON(path: string|Path.ParsedPath, maxDepth?: number): IJsonDirectoryArchive|IJSONFileArchive {
    let fsPath: string;
    let parsedPath: Path.ParsedPath;
    if (pathUtil.isParsedPath(path)) {
        fsPath = Path.format(path);
        parsedPath = path;
    } else {
        fsPath = path;
        parsedPath = Path.parse(path);
    }

    console.info("Packing %s", fsPath);
    let currentItemStats: FS.Stats = FS.statSync(fsPath);
    if (currentItemStats.isFile()) {
        console.info("Reading %d bytes from %s", currentItemStats.size, fsPath);
        let buffer: Buffer = FS.readFileSync(fsPath);
        console.info("Detecting encoding");
        let e: textEncoding.EncodingType|null = textEncoding.detectEncoding(buffer);
        if (e !== null) {
            console.info("Detected encoding %s", e);
            let s: string;
            if (textEncoding.isBufferCompatibleEncodingType(e))
                s = buffer.toString(e);
            else
                s = textEncoding.convertBufferEncoding(buffer, e, "utf16le").toString("utf16le");
            let lineEnding: textEncoding.EOLspec|undefined = textEncoding.detectLineEndingType(s);
            if (typeof(lineEnding) == "string" && textEncoding.isPrintableText(s, (lineEnding == "ebcdic" || lineEnding == "qnx") ? lineEnding : "mixed")) {
                let eolType: textEncoding.EOLtype = textEncoding.toEolType(lineEnding);
                return {
                    name: parsedPath.base,
                    birthtime: currentItemStats.birthtime,
                    mtime: currentItemStats.mtime,
                    size: currentItemStats.size,
                    content: textEncoding.splitLines(s, eolType),
                    encoding: e,
                    eolType: eolType
                };
            }
            console.info("Detected encoding did not match content. Falling back to base64.");
        } else
            console.info("Unable to detect encoding. Using base64.")
        return {
            name: parsedPath.base,
            birthtime: currentItemStats.birthtime,
            mtime: currentItemStats.mtime,
            size: currentItemStats.size,
            content: textEncoding.splitLines(buffer.toString("base64"), "mixed", 76),
            encoding: "base64"
        };
    }

    if (!currentItemStats.isDirectory())
        throw new Error(JSON.stringify(fsPath) + " is neither a file or a subdirectory.");
    
    if (typeof(maxDepth) == "number") {
        if (maxDepth < 1)
            return {
                name: parsedPath.base,
                birthtime: currentItemStats.birthtime,
                mtime: currentItemStats.mtime,
                childItems: []
            };
        maxDepth--;
    } else
        maxDepth = 32;
    return {
        name: parsedPath.base,
        birthtime: currentItemStats.birthtime,
        mtime: currentItemStats.mtime,
        childItems: FS.readdirSync(fsPath).map(function(n: string): IJsonDirectoryArchive|IJSONFileArchive {
            return packFsContentAsJSON(Path.join(fsPath, n), maxDepth);
        })
    };
}
