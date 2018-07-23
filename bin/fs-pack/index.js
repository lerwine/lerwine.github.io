"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const FS = require("fs");
const Path = require("path");
const textEncoding = require("../text-encoding");
const pathUtil = require("../path-utils");
const fs_utils_1 = require("../fs-utils");
function isJSONFileArchive(value) {
    return typeof (value) == "object" && value !== null && !Array.isArray(value) && typeof (value.size) == "number" &&
        typeof (value.encoding) == "string";
}
function unpackFsContentFromJSON(source, targetDir, overwrite) {
    if (Array.isArray(source)) {
        source.forEach(function (f) { unpackFsContentFromJSON(f, targetDir); });
        return;
    }
    let fsPath;
    let parsedPath;
    if (pathUtil.isParsedPath(targetDir)) {
        fsPath = Path.format(targetDir);
        parsedPath = targetDir;
    }
    else {
        fsPath = targetDir;
        parsedPath = Path.parse(targetDir);
    }
    console.info("Unpacking %s", fsPath);
    let stats;
    stats = FS.statSync(fsPath);
    if (!stats.isDirectory())
        throw new Error("Target path must be a subdirectory.");
    fsPath = Path.join(source.name);
    try {
        stats = FS.statSync(fsPath);
    }
    catch (_a) {
        stats = undefined;
    }
    if (typeof (stats) != "undefined") {
        if (!overwrite)
            throw new Error("Target " + ((stats.isDirectory()) ? "directory" : "file") + " already exists");
        console.info("Removing %s", fsPath);
        fs_utils_1.removeFsItemRecursive(fsPath);
    }
    let mtime = (typeof (source.mtime) == "string") ? new Date(source.mtime) : source.mtime;
    if (isJSONFileArchive(source)) {
        let buffer;
        let intermediaryEncoding = source.encoding;
        let options;
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
        else if (typeof (source.eolType) != undefined)
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
function packFsContentAsJSON(path, maxDepth) {
    let fsPath;
    let parsedPath;
    if (pathUtil.isParsedPath(path)) {
        fsPath = Path.format(path);
        parsedPath = path;
    }
    else {
        fsPath = path;
        parsedPath = Path.parse(path);
    }
    console.info("Packing %s", fsPath);
    let currentItemStats = FS.statSync(fsPath);
    if (currentItemStats.isFile()) {
        console.info("Reading %d bytes from %s", currentItemStats.size, fsPath);
        let buffer = FS.readFileSync(fsPath);
        console.info("Detecting encoding");
        let e = textEncoding.detectEncoding(buffer);
        if (e !== null) {
            console.info("Detected encoding %s", e);
            let s;
            if (textEncoding.isBufferCompatibleEncodingType(e))
                s = buffer.toString(e);
            else
                s = textEncoding.convertBufferEncoding(buffer, e, "utf16le").toString("utf16le");
            let lineEnding = textEncoding.detectLineEndingType(s);
            if (typeof (lineEnding) == "string" && textEncoding.isPrintableText(s, (lineEnding == "ebcdic" || lineEnding == "qnx") ? lineEnding : "mixed")) {
                let eolType = textEncoding.toEolType(lineEnding);
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
        }
        else
            console.info("Unable to detect encoding. Using base64.");
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
    if (typeof (maxDepth) == "number") {
        if (maxDepth < 1)
            return {
                name: parsedPath.base,
                birthtime: currentItemStats.birthtime,
                mtime: currentItemStats.mtime,
                childItems: []
            };
        maxDepth--;
    }
    else
        maxDepth = 32;
    return {
        name: parsedPath.base,
        birthtime: currentItemStats.birthtime,
        mtime: currentItemStats.mtime,
        childItems: FS.readdirSync(fsPath).map(function (n) {
            return packFsContentAsJSON(Path.join(fsPath, n), maxDepth);
        })
    };
}
//# sourceMappingURL=index.js.map