"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const OS = require("os");
;
/* @description Line ending types are:
* "mixed": ; "mixed_uw": Mixed -unix and windows-style line endings; "mixed_wm": Mixed windows- and macintosh-style line endings;
* "unix": ;
* "windows": Windows-style line endings;
* "mac": ;
* "qnx": Line endings common with pre-POSIX QNX machines;
* "ebcdic": Line endings common in old IBM mainframes
*/
exports.EOL = {
    /**
     * Unix-style line ending sequence.
     */
    unix: {},
    /**
     * Windows-style line ending sequence.
     */
    windows: {},
    /**
     * Line ending sequence common with classic Mac OS, Apple and Commodore machines.
     */
    mac: {},
    /**
     * Line ending sequence common in old IBM mainframes.
     */
    ebcdic: {},
    /**
     * Line ending sequence common with pre-POSIX QNX machines.
     */
    qnx: {},
    /**
     * Any suppoprted line ending sequence.
     */
    mixed: {},
    /**
     * Unix- or Windows-style line ending sequence.
     */
    mixed_uw: {},
    /**
     * Unix- or mAX-style line ending sequence.
     */
    mixed_um: {},
    /**
     * Windows- or Mac-style line ending sequence.
     */
    mixed_wm: {},
    /**
     * Unix- or EBCDIC-style line ending sequence.
     */
    mixed_ue: {},
    /**
     * Windows- or EBCDIC-style line ending sequence.
     */
    mixed_we: {},
    /**
     * Mac-, EBCDIC-style line ending sequence.
     */
    mixed_me: {},
    /**
     * Unix- or qnx-style line ending sequence.
     */
    mixed_uq: {},
    /**
     * Windows- or qnx-style line ending sequence.
     */
    mixed_wq: {},
    /**
     * Mac- or qnx-style line ending sequence.
     */
    mixed_mq: {},
    /**
     * EBCDIC- or qnx-style line ending sequence.
     */
    mixed_eq: {},
    /**
     * Unix-, Windows- or Mac-style line ending sequence.
     */
    mixed_uwm: {},
    /**
     * Unix-, Windows- or EBCDIC-style line ending sequence.
     */
    mixed_uwe: {},
    /**
     * Unix-, Mac- or EBCDIC-style line ending sequence.
     */
    mixed_ume: {},
    /**
     * Windows-, Mac- or EBCDIC-style line ending sequence.
     */
    mixed_wme: {},
    /**
     * Unix-, Windows- or qnx-style line ending sequence.
     */
    mixed_uwq: {},
    /**
     * Unix-, Mac- or qnx-style line ending sequence.
     */
    mixed_umq: {},
    /**
     * Windows-, Mac- or qnx-style line ending sequence.
     */
    mixed_wmq: {},
    /**
     * Unix-, EBCDIC- or qnx-style line ending sequence.
     */
    mixed_ueq: {},
    /**
     * Windows-, EBCDIC- or qnx-style line ending sequence.
     */
    mixed_weq: {},
    /**
     * Windows-, EBCDIC- or qnx-style line ending sequence.
     */
    mixed_meq: {},
    /**
     * Unix-, Windows-, Mac- or EBCDIC-style line ending sequence.
     */
    mixed_uwme: {},
    /**
     * Unix-, Windows-, Mac- or qnx-style line ending sequence.
     */
    mixed_uwmq: {},
    /**
     * Unix-, Windows-, EBCDIC- or qnx-style line ending sequence.
     */
    mixed_uweq: {},
    /**
     * Unix-, Mac-, EBCDIC- or qnx-style line ending sequence.
     */
    mixed_umeq: {},
    /**
     * Windows-, Mac-, EBCDIC- or qnx-style line ending sequence.
     */
    mixed_wmeq: {},
};
const __CACHE = {
    eolType: {
        allNames: [],
        byAbbr: {},
        byName: {}
    },
    eolMixed: {
        allNames: [],
        byAbbr: {},
        byName: {}
    },
    fallback: {
        abbr: 'u',
        name: 'unix',
        metaData: {
            regex: /\n/,
            sequence: "\n"
        }
    },
    printable: {
        utf8: {
            baseRegex: /\t\x20-\x7e\xa0-\xff/,
            singleLine: /^[\t\x20-\x7e\xa0-\xff]*$/,
            regexByType: {
                mixed: {
                    oneOrMore: new RegExp("[\t\x20-\x7e\xa0-\xff]*(?:([\r\n\x1e\x15]+)[\t\x20-\x7e\xa0-\xff]*(?:[\r\n\x1e\x15]+[\t\x20-\x7e\xa0-\xff]+)[\r\n\x1e\x15]*)?"),
                    zeroOrMore: new RegExp("[\t\x20-\x7e\xa0-\xff]*(?:[\r\n\x1e\x15]+[\t\x20-\x7e\xa0-\xff]+)*[\r\n\x1e\x15]*"),
                },
                mixed_uwm: {
                    oneOrMore: new RegExp("[\t\x20-\x7e\xa0-\xff]*(?:([\r\n]+)[\t\x20-\x7e\xa0-\xff]*(?:[\r\n]+[\t\x20-\x7e\xa0-\xff]+)[\r\n]*)?"),
                    zeroOrMore: new RegExp("[\t\x20-\x7e\xa0-\xff]*(?:[\r\n]+[\t\x20-\x7e\xa0-\xff]+)*[\r\n]*"),
                },
                mixed_uwme: {
                    oneOrMore: new RegExp("[\t\x20-\x7e\xa0-\xff]*(?:([\r\n\x15]+)[\t\x20-\x7e\xa0-\xff]*(?:[\r\n\x15]+[\t\x20-\x7e\xa0-\xff]+)[\r\n\x15]*)?"),
                    zeroOrMore: new RegExp("[\t\x20-\x7e\xa0-\xff]*(?:[\r\n\x15]+[\t\x20-\x7e\xa0-\xff]+)*[\r\n\x15]*"),
                },
                mixed_uwmq: {
                    oneOrMore: new RegExp("[\t\x20-\x7e\xa0-\xff]*(?:([\r\n\x1e]+)[\t\x20-\x7e\xa0-\xff]*(?:[\r\n\x1e]+[\t\x20-\x7e\xa0-\xff]+)[\r\n\x1e]*)?"),
                    zeroOrMore: new RegExp("[\t\x20-\x7e\xa0-\xff]*(?:[\r\n\x1e]+[\t\x20-\x7e\xa0-\xff]+)*[\r\n\x1e]*"),
                }
            },
            strictRegexByType: {}
        },
        ascii: {
            baseRegex: /\t\x20-\x7e/,
            singleLine: /^[\t\x20-\x7e]*$/,
            regexByType: {
                mixed: {
                    oneOrMore: new RegExp("[\t\x20-\x7e]*(?:([\r\n\x1e\x15]+)[\t\x20-\x7e]*(?:[\r\n\x1e\x15]+[\t\x20-\x7e]+)[\r\n\x1e\x15]*)?"),
                    zeroOrMore: new RegExp("[\t\x20-\x7e]*(?:[\r\n\x1e\x15]+[\t\x20-\x7e]+)*[\r\n\x1e\x15]*"),
                },
                mixed_uwm: {
                    oneOrMore: new RegExp("[\t\x20-\x7e]*(?:([\r\n]+)[\t\x20-\x7e]*(?:[\r\n]+[\t\x20-\x7e]+)[\r\n]*)?"),
                    zeroOrMore: new RegExp("[\t\x20-\x7e]*(?:[\r\n]+[\t\x20-\x7e]+)*[\r\n]*"),
                },
                mixed_uwme: {
                    oneOrMore: new RegExp("[\t\x20-\x7e]*(?:([\r\n\x15]+)[\t\x20-\x7e]*(?:[\r\n\x15]+[\t\x20-\x7e]+)[\r\n\x15]*)?"),
                    zeroOrMore: new RegExp("[\t\x20-\x7e]*(?:[\r\n\x15]+[\t\x20-\x7e]+)*[\r\n\x15]*"),
                },
                mixed_uwmq: {
                    oneOrMore: new RegExp("[\t\x20-\x7e]*(?:([\r\n\x1e]+)[\t\x20-\x7e]*(?:[\r\n\x1e]+[\t\x20-\x7e]+)[\r\n\x1e]*)?"),
                    zeroOrMore: new RegExp("[\t\x20-\x7e]*(?:[\r\n\x1e]+[\t\x20-\x7e]+)*[\r\n\x1e]*"),
                }
            },
            strictRegexByType: {}
        }
    }
};
__CACHE.eolType.allNames = [
    __CACHE.fallback,
    { name: "windows", abbr: "w", metaData: { sequence: "\r\n", regex: /\r\n/, atomicRegex: /(?:\r\n)/ } },
    { name: "mac", abbr: "m", metaData: { sequence: "\r", regex: /\r/, atomicRegex: /\r/ } },
    { name: "ebcdic", abbr: "e", metaData: { sequence: "", regex: /\x15/, atomicRegex: /\x15/ } },
    { name: "qnx", abbr: "q", metaData: { sequence: "", regex: /\x1e/, atomicRegex: /\x1e/ } }
].map(function (c) {
    __CACHE.eolType.byAbbr[c.abbr] = c;
    __CACHE.eolType.byName[c.name] = c;
    exports.EOL[c.name] = {
        regex: c.metaData.regex,
        sequence: c.metaData.sequence
    };
    if (c.metaData.sequence == OS.EOL)
        __CACHE.fallback = c;
    return c.name;
});
function isMixedType(value) {
    for (var i = 0; i < __CACHE.eolType.allNames.length; i++) {
        if (__CACHE.eolType.allNames[i] == value)
            return false;
    }
    return true;
}
__CACHE.eolMixed.allNames = [
    { name: "mixed", regex: /\r\n?|[\r\n\x1e\x15]/, isAtomic: false },
    { name: "mixed_uw", regex: /\r?\n/, isAtomic: false },
    { name: "mixed_wm", regex: /\r\n?/, isAtomic: false },
    { name: "mixed_um", regex: /[\r\n]/, isAtomic: true },
    { name: "mixed_ue", regex: /[\n\x15]/, isAtomic: true },
    { name: "mixed_we", regex: /\r\n|\x15/, isAtomic: false },
    { name: "mixed_me", regex: /[\r\x15]/, isAtomic: true },
    { name: "mixed_uq", regex: /[\n\x1e]/, isAtomic: true },
    { name: "mixed_wq", regex: /\r\n|\x1e/, isAtomic: false },
    { name: "mixed_mq", regex: /[\r\x1e]/, isAtomic: true },
    { name: "mixed_eq", regex: /[\x1e\x15]/, isAtomic: true },
    { name: "mixed_uwm", regex: /\r\n?|\n/, isAtomic: false },
    { name: "mixed_uwe", regex: /\r?\n|\x15/, isAtomic: false },
    { name: "mixed_ume", regex: /[\r\n\x15]/, isAtomic: true },
    { name: "mixed_wme", regex: /\r?\n|\x15/, isAtomic: false },
    { name: "mixed_uwq", regex: /\r?\n|\x1e/, isAtomic: false },
    { name: "mixed_umq", regex: /[\r\n\x1e]/, isAtomic: true },
    { name: "mixed_wmq", regex: /\r\n?|\x1e/, isAtomic: false },
    { name: "mixed_ueq", regex: /[\n\x1e\x15]/, isAtomic: true },
    { name: "mixed_weq", regex: /\r\n|[\x1e\x15]/, isAtomic: false },
    { name: "mixed_meq", regex: /[\r\x1e\x15]/, isAtomic: true },
    { name: "mixed_uwme", regex: /\r\n?|[\n\x15]/, isAtomic: false },
    { name: "mixed_uwmq", regex: /\r\n?|[\n\x1e]/, isAtomic: false },
    { name: "mixed_uweq", regex: /\r?\n|[\x1e\x15]/, isAtomic: false },
    { name: "mixed_umeq", regex: /[\r\n\x1e\x15]/, isAtomic: true },
    { name: "mixed_wmeq", regex: /\r\n?|[\x1e\x15]/, isAtomic: false }
].map(function (value, index) {
    let abbr = (index == 0) ? "uwmeq" : value.name.substr(6);
    let meta = {
        name: value.name,
        abbr: abbr,
        metaData: {
            sequence: (value.regex.test(OS.EOL)) ? OS.EOL : (value.name == "mixed" || value.name.startsWith("mixed_u")) ? "\n" : ((value.name.startsWith("mixed_w")) ? "\r\n" : ((value.name.startsWith("mixed_m")) ? "\n" : "\x15")),
            regex: value.regex,
            atomicRegex: (value.isAtomic) ? value.regex : new RegExp("(?:" + value.regex.source + ")")
        },
        types: __CACHE.eolType.allNames.filter(function (t) { return abbr.indexOf(__CACHE.eolType.byName[t].abbr) >= 0; })
    };
    __CACHE.eolMixed.byAbbr[abbr] = meta;
    __CACHE.eolMixed.byName[value.name] = meta;
    exports.EOL[value.name] = {
        regex: meta.metaData.regex,
        sequence: meta.metaData.sequence
    };
    return value.name;
});
function toEOLspec(type, ...types) {
    types = ((typeof (type) == "undefined") ? [] : ((Array.isArray(type)) ? type : [type])).concat((typeof (types) == "undefined") ? [] : types);
    if (types.length == 0)
        return __CACHE.fallback.name;
    if (types.length > 0)
        types = types.filter(function (value, index, array) {
            for (var i = 0; i < index; i++) {
                if (array[i] == value)
                    return false;
            }
            return true;
        });
    if (types.length == 1)
        return types[0];
    let basicTypes = __CACHE.eolType.allNames.filter(function (t) {
        for (var i = 0; i < types.length; i++) {
            if (isMixedType(types[i])) {
                let tt = __CACHE.eolMixed.byName[types[i]].types;
                for (var n = 0; n < tt.length; n++) {
                    if (tt[n] == t)
                        return true;
                }
            }
            else if (types[i] == t)
                return true;
        }
        return false;
    });
    if (basicTypes.length == __CACHE.eolType.allNames.length)
        return "mixed";
    return ("mixed_" + basicTypes.map(function (t) { return __CACHE.eolType.byName[t].abbr; }).join(""));
}
exports.toEOLspec = toEOLspec;
function toEolType(type, ...types) {
    let t = toEOLspec(((typeof (type) == "undefined") ? [] : ((Array.isArray(type)) ? type : [type])).concat((typeof (types) == "undefined") ? [] : types));
    if (isMixedType(t))
        return __CACHE.eolMixed.byName[t].types[0];
    return t;
}
exports.toEolType = toEolType;
function getEOLdefinition(type, ...types) {
    let t = toEOLspec(((typeof (type) == "undefined") ? [] : ((Array.isArray(type)) ? type : [type])).concat((typeof (types) == "undefined") ? [] : types));
    if (isMixedType(t))
        return __CACHE.eolMixed.byName[t].metaData;
    return __CACHE.eolType.byName[t].metaData;
}
exports.getEOLdefinition = getEOLdefinition;
function getEOLsequence(type, ...types) {
    return getEOLdefinition(((typeof (type) == "undefined") ? [] : ((Array.isArray(type)) ? type : [type])).concat((typeof (types) == "undefined") ? [] : types)).sequence;
}
exports.getEOLsequence = getEOLsequence;
function getPrintableRegex(opt, ...types) {
    if (typeof (opt) == "undefined")
        opt = { type: types };
    else if (typeof (opt) == "string")
        opt = { type: [opt].concat((typeof (types) == "undefined") ? [] : types) };
    let t = toEOLspec(opt.type);
    let metaData = (opt.ascii) ? __CACHE.printable.ascii : __CACHE.printable.utf8;
    let h = (opt.strict) ? metaData.strictRegexByType : metaData.regexByType;
    let regexes = h[t];
    if (typeof (regexes) == "undefined") {
        if (opt.strict)
            regexes = metaData.regexByType[t];
        if (typeof (regexes) == "undefined") {
            let eol = (getEOLdefinition(t));
            regexes = {
                oneOrMore: new RegExp("[" + metaData.baseRegex.source + "]*(?:(" + eol.atomicRegex.source + "+)[" + metaData.baseRegex.source + "]*(?:" + eol.atomicRegex.source + "+[" + metaData.baseRegex.source + "]+)" + eol.atomicRegex.source + "*)?"),
                zeroOrMore: new RegExp("[" + metaData.baseRegex.source + "]*(?:" + eol.atomicRegex.source + "+[" + metaData.baseRegex.source + "]+)*" + eol.atomicRegex.source + "*"),
            };
            metaData.regexByType[t] = regexes;
        }
        if (opt.strict) {
            regexes = {
                oneOrMore: new RegExp("^" + regexes.oneOrMore.source + "$"),
                zeroOrMore: new RegExp("^" + regexes.zeroOrMore.source + "$"),
            };
            h[t] = regexes;
        }
    }
    if (opt.multiLine)
        return regexes.oneOrMore;
    return regexes.zeroOrMore;
}
exports.getPrintableRegex = getPrintableRegex;
function isPrintableText(text, opt, ...types) {
    if (typeof (types) != "undefined" && types.length > 0) {
        if (typeof (opt) == "undefined")
            opt = { type: types, strict: true };
        else if (typeof (opt) == "string")
            opt = { type: [opt].concat((typeof (types) == "undefined") ? [] : types), strict: true };
        else if (typeof (types) != "undefined" && types.length > 0)
            opt = {
                type: (typeof (opt.type) == "undefined") ? types : ((typeof (opt.type) == "string") ? [opt.type] : opt.type).concat(types),
                ascii: opt.ascii,
                multiLine: opt.multiLine,
                strict: (typeof (opt.strict) == "boolean") ? opt.strict : true
            };
    }
    else if (typeof (opt) == "undefined")
        opt = { strict: true };
    else if (typeof (opt) == "string")
        opt = { type: opt, strict: true };
    else if (typeof (opt.strict) == "undefined") {
        opt = {
            type: opt.type,
            ascii: opt.ascii,
            multiLine: opt.multiLine,
            strict: true
        };
    }
    return getPrintableRegex(opt).test(text);
}
exports.isPrintableText = isPrintableText;
/**
 * Detect line ending type.
 * @export
 * @param {string} text Text to scan for line ending character sequences.
 * @returns {(EOLspec|undefined)} Type of line ending or undefined if text contains non-printable characters that do not reprsent a line ending sequence.
 */
function detectLineEndingType(text) {
    if (text.length > 0) {
        let mr = text.match(exports.EOL.mixed.regex);
        if (mr !== null && mr[0].length == text.length) {
            let i;
            for (i = 0; i < __CACHE.eolType.allNames.length; i++) {
                if ((mr = text.match(__CACHE.eolType.byName[__CACHE.eolType.allNames[i]].metaData.regex)) !== null && mr[1] !== null && mr[0].length == text.length)
                    return __CACHE.eolType.allNames[i];
            }
            for (i = 1; i < __CACHE.eolMixed.allNames.length; i++) {
                if ((mr = text.match(__CACHE.eolMixed.byName[__CACHE.eolMixed.allNames[i]].metaData.regex)) !== null && mr[1] !== null && mr[0].length == text.length)
                    return __CACHE.eolMixed.allNames[i];
            }
            return "mixed";
        }
    }
}
exports.detectLineEndingType = detectLineEndingType;
/**
 * Split text into lines.
 * @export
 * @param {string} text Text to be split into lines
 * @param {(LineEndingType|null)} [type] Type of line ending. Use null or undefined to auto-detect.
 * @returns {string[]} Text split into individual lines
 */
function splitLines(text, type, maxlen) {
    let lines;
    if (typeof (text) == "string") {
        if (typeof (type) != "string") {
            let t = detectLineEndingType(text);
            type = (typeof (t) == "string") ? t : "mixed";
        }
        if (isMixedType(type))
            lines = text.split(__CACHE.eolMixed.byName[type].metaData.regex);
        else
            lines = text.split(__CACHE.eolType.byName[type].metaData.regex);
    }
    else {
        lines = [];
        text.forEach(function (s) { lines = lines.concat(splitLines(s, type)); });
    }
    if (typeof (maxlen) == "number" && maxlen > 0) {
        let result = [];
        lines.forEach(function (s) {
            while (s.length > maxlen) {
                result.push(s.substr(0, maxlen));
                s = s.substr(maxlen);
            }
            result.push(s);
        });
        return result;
    }
    return lines;
}
exports.splitLines = splitLines;
function isBufferCompatibleEncodingType(type) {
    switch (type) {
        case "utf16be":
        case "utf32le":
        case "utf32be":
            return false;
        default:
            return true;
    }
}
exports.isBufferCompatibleEncodingType = isBufferCompatibleEncodingType;
function convertBufferEncoding(sourceBuffer, sourceEncoding, targetEncoding) {
    if (sourceBuffer.length == 0 || sourceEncoding == targetEncoding)
        return new Buffer(sourceBuffer);
    let i;
    let targetBuffer;
    switch (sourceEncoding) {
        case "utf16be":
            switch (targetEncoding) {
                case "utf16le":
                    if ((sourceBuffer.length % 2) != 0)
                        throw new Error("Source buffer does not contain even number of bytes");
                    targetBuffer = new Buffer(sourceBuffer.length);
                    for (i = 0; i < sourceBuffer.length; i += 2)
                        targetBuffer.writeInt16LE(sourceBuffer.readInt16BE(i), i);
                    return targetBuffer;
                case "utf32be":
                    if ((sourceBuffer.length % 2) != 0)
                        throw new Error("Source buffer does not contain even number of bytes");
                    targetBuffer = new Buffer(sourceBuffer.length << 1);
                    for (i = 0; i < sourceBuffer.length; i += 2)
                        targetBuffer.writeInt32BE(sourceBuffer.readInt16BE(i), i << 1);
                    return targetBuffer;
                case "utf32le":
                    if ((sourceBuffer.length % 2) != 0)
                        throw new Error("Source buffer does not contain even number of bytes");
                    targetBuffer = new Buffer(sourceBuffer.length << 1);
                    for (i = 0; i < sourceBuffer.length; i += 2)
                        targetBuffer.writeInt32LE(sourceBuffer.readInt16BE(i), i << 1);
                    return targetBuffer;
            }
            return new Buffer(convertBufferEncoding(sourceBuffer, sourceEncoding, "utf16le").toString("utf16le"), targetEncoding);
        case "utf32le":
            switch (targetEncoding) {
                case "utf16le":
                    if ((sourceBuffer.length % 4) != 0)
                        throw new Error("Source buffer does not contain even number of byte pairs");
                    targetBuffer = new Buffer(sourceBuffer.length >> 1);
                    for (i = 0; i < sourceBuffer.length; i += 4)
                        targetBuffer.writeInt16LE((sourceBuffer.readInt32LE(i) & 0xffff), (i >> 1));
                    return targetBuffer;
                case "utf16be":
                    if ((sourceBuffer.length % 4) != 0)
                        throw new Error("Source buffer does not contain even number of byte pairs");
                    targetBuffer = new Buffer(sourceBuffer.length >> 1);
                    for (i = 0; i < sourceBuffer.length; i += 4)
                        targetBuffer.writeInt16BE((sourceBuffer.readInt32LE(i) & 0xffff), (i >> 1));
                    return targetBuffer;
                case "utf32be":
                    if ((sourceBuffer.length % 4) != 0)
                        throw new Error("Source buffer does not contain even number of byte pairs");
                    targetBuffer = new Buffer(sourceBuffer.length);
                    for (i = 0; i < sourceBuffer.length; i += 4)
                        targetBuffer.writeInt32BE(sourceBuffer.readInt32LE(i), i);
                    return targetBuffer;
            }
            return new Buffer(convertBufferEncoding(sourceBuffer, sourceEncoding, "utf16le").toString("utf16le"), targetEncoding);
        case "utf32be":
            switch (targetEncoding) {
                case "utf16le":
                    if ((sourceBuffer.length % 4) != 0)
                        throw new Error("Source buffer does not contain even number of byte pairs");
                    targetBuffer = new Buffer(sourceBuffer.length >> 1);
                    for (i = 0; i < sourceBuffer.length; i += 4)
                        targetBuffer.writeInt16LE((sourceBuffer.readInt32BE(i) & 0xffff), (i >> 1));
                    return targetBuffer;
                case "utf16be":
                    if ((sourceBuffer.length % 4) != 0)
                        throw new Error("Source buffer does not contain even number of byte pairs");
                    targetBuffer = new Buffer(sourceBuffer.length >> 1);
                    for (i = 0; i < sourceBuffer.length; i += 4)
                        targetBuffer.writeInt16BE((sourceBuffer.readInt32BE(i) & 0xffff), (i >> 1));
                    return targetBuffer;
                case "utf32le":
                    if ((sourceBuffer.length % 4) != 0)
                        throw new Error("Source buffer does not contain even number of byte pairs");
                    targetBuffer = new Buffer(sourceBuffer.length);
                    for (i = 0; i < sourceBuffer.length; i += 4)
                        targetBuffer.writeInt32LE(sourceBuffer.readInt32BE(i), i);
                    return targetBuffer;
            }
            return new Buffer(convertBufferEncoding(sourceBuffer, sourceEncoding, "utf16le").toString("utf16le"), targetEncoding);
    }
    return new Buffer(sourceBuffer.toString(sourceEncoding), targetEncoding);
}
exports.convertBufferEncoding = convertBufferEncoding;
function toBufferCompatibleEncoding(type) {
    switch (type) {
        case "utf16be":
        case "utf32le":
        case "utf32be":
            return "utf16le";
        default:
            return type;
    }
}
exports.toBufferCompatibleEncoding = toBufferCompatibleEncoding;
function detectEncoding(buffer, extended) {
    if (buffer.length == 0)
        return null;
    let e = detectByteOrderMarks(buffer);
    if (e !== null)
        return e;
    let tryOrder = ["ascii", "utf8", "utf16le", "latin1", "utf16be", "utf32le", "utf32be"];
    let b = new Buffer(buffer);
    for (var i = 0; i < tryOrder.length; i++) {
        let text;
        try {
            text = b.toString(tryOrder[i]);
        }
        catch (_a) {
            text = undefined;
        }
        if (typeof (text) == "string" && isPrintableText(text, { ascii: (tryOrder[i] == "ascii"), type: "mixed_uwm" }))
            return tryOrder[i];
    }
    for (var i = 0; i < tryOrder.length; i++) {
        let text;
        try {
            text = b.toString(tryOrder[i]);
        }
        catch (_b) {
            text = undefined;
        }
        if (typeof (text) == "string" && isPrintableText(text, { ascii: (tryOrder[i] == "ascii"), type: "ebcdic" }))
            return tryOrder[i];
    }
    for (var i = 0; i < tryOrder.length; i++) {
        let text;
        try {
            text = b.toString(tryOrder[i]);
        }
        catch (_c) {
            text = undefined;
        }
        if (typeof (text) == "string" && isPrintableText(text, { ascii: (tryOrder[i] == "ascii"), type: "qnx" }))
            return tryOrder[i];
    }
    return null;
}
exports.detectEncoding = detectEncoding;
/**
 * Detect text encoding from byte order marks.
 * @param {(Buffer|Uint8Array)} buffer Buffer containing data.
 * @param {boolean} [extended] If set to true, then encodings not specifically supported by node.js will be detected.
 * @returns {(EncodingType|null)} Returns string representing detected encoding type if an encoding type is detected from byte order marks; otherwise a null value is returned.
 */
function detectByteOrderMarks(buffer, extended) {
    if (buffer.length > 1) {
        switch (buffer[0]) {
            case 0xef:
                if (buffer.length > 2 && buffer[1] == 0xbb && buffer[2] == 0xbf)
                    return "utf8";
                break;
            case 0xfe:
                if (extended && buffer[1] == 0xff)
                    return "utf16be";
                break;
            case 0xff:
                if (buffer[1] == 0xfe) {
                    if (extended) {
                        if (buffer.length > 2 && buffer[2] == 0) {
                            if (buffer.length > 3 && buffer[3] == 0)
                                return "utf32le";
                        }
                        else
                            return "utf16le";
                    }
                    else if (buffer.length == 2 || buffer[2] != 0)
                        return "utf16le";
                }
                break;
            case 0x00:
                if (extended && buffer.length > 3 && buffer[1] == 0 && buffer[2] == 0xfe && buffer[3] == 0xff)
                    return "utf32be";
                break;
            // case 0x2b:
            //     if (extended && buffer.length > 4 && buffer[1] == 0x2f && buffer[2] == 0x76 &&
            //             (buffer[3] == 0x38 || buffer[3] == 0x39 || buffer[3] == 0x2b || buffer[3] == 0x2f))
            //         return "utf7";
            //     break;
        }
    }
    return null;
}
exports.detectByteOrderMarks = detectByteOrderMarks;
//# sourceMappingURL=index.js.map