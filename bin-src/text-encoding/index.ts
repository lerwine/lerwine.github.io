import * as OS from "os";

export interface IHashObject<T> { [key: string]: T };
export interface IEOL { sequence: string; regex: RegExp; }
interface _IEOL extends IEOL { atomicRegex: RegExp; }
export interface IEOLtypeMeta<T> {
    unix: T;
    windows: T;
    mac: T;
    qnx: T;
    ebcdic: T;
}
export interface IEOLspecMeta<T> extends IEOLtypeMeta<T> {
    mixed: T;
    mixed_uwme: T;
    mixed_uwmq: T;
    mixed_uweq: T;
    mixed_umeq: T;
    mixed_wmeq: T;
    mixed_uwm: T;
    mixed_uwe: T;
    mixed_ume: T;
    mixed_wme: T;
    mixed_uwq: T;
    mixed_umq: T;
    mixed_wmq: T;
    mixed_ueq: T;
    mixed_weq: T;
    mixed_meq: T;
    mixed_uw: T;
    mixed_um: T;
    mixed_wm: T;
    mixed_ue: T;
    mixed_we: T;
    mixed_me: T;
    mixed_uq: T;
    mixed_wq: T;
    mixed_mq: T;
    mixed_eq: T;
}
/**
 * Basic types of line endings
 * @export
 * @typedef {("unix"|"windows"|"mac"|"qnx"|"ebcdic")}
 * @description Line ending types are described as follows:
 * "unix": Unix-style line endings;
 * "windows": Windows-style line endings;
 * "mac": Line endings common with classic Mac OS, Apple and Commodore machines;
 * "qnx": Line endings common with pre-POSIX QNX machines;
 * "ebcdic": Line endings common in old IBM mainframes
 */
export type EOLtype = "unix"|"windows"|"mac"|"ebcdic"|"qnx";
export type EOLmixed = "mixed"|"mixed_uwme"|"mixed_uwmq"|"mixed_uweq"|"mixed_umeq"|"mixed_wmeq"|
    "mixed_uwm"|"mixed_uwe"|"mixed_ume"|"mixed_wme"|"mixed_uwq"|"mixed_umq"|"mixed_wmq"|"mixed_ueq"|"mixed_weq"|"mixed_meq"|
    "mixed_uw"|"mixed_um"|"mixed_wm"|"mixed_ue"|"mixed_we"|"mixed_me"|"mixed_uq"|"mixed_wq"|"mixed_mq"|"mixed_eq";
export type EOLspec = EOLtype|EOLmixed;
interface ITypeMetaCacheItem<T extends string> { name: T; abbr: string; metaData: _IEOL; }
interface ITypeMetaCache<TName extends string, TItem extends ITypeMetaCacheItem<TName>> {
    allNames: TName[],
    byAbbr: { [index: string]: TItem },
    byName: { [index: string]: TItem }
}
interface IMixedTypeMetaCacheItem extends ITypeMetaCacheItem<EOLmixed> { types: EOLtype[]; }
interface IPrintableRegexes {
    zeroOrMore: RegExp,
    oneOrMore: RegExp
}
interface IPrintableMetaData {
    baseRegex: RegExp,
    singleLine: RegExp,
    regexByType: { [index: string]: IPrintableRegexes|undefined },
    strictRegexByType: { [index: string]: IPrintableRegexes|undefined }
}
/* @description Line ending types are:
* "mixed": ; "mixed_uw": Mixed -unix and windows-style line endings; "mixed_wm": Mixed windows- and macintosh-style line endings;
* "unix": ;
* "windows": Windows-style line endings;
* "mac": ;
* "qnx": Line endings common with pre-POSIX QNX machines;
* "ebcdic": Line endings common in old IBM mainframes
*/
export const EOL: IEOLspecMeta<IEOL> = <IEOLspecMeta<IEOL>>{
    /**
     * Unix-style line ending sequence.
     */
    unix: <IEOL>{ },
    
    /**
     * Windows-style line ending sequence.
     */
    windows: <IEOL>{ },

    /**
     * Line ending sequence common with classic Mac OS, Apple and Commodore machines.
     */
    mac: <IEOL>{ },
    
    /**
     * Line ending sequence common in old IBM mainframes.
     */
    ebcdic: <IEOL>{ },
    
    /**
     * Line ending sequence common with pre-POSIX QNX machines.
     */
    qnx: <IEOL>{ },
    
    /**
     * Any suppoprted line ending sequence.
     */
    mixed: <IEOL>{ },
    
    /**
     * Unix- or Windows-style line ending sequence.
     */
    mixed_uw: <IEOL>{ },
    
    /**
     * Unix- or mAX-style line ending sequence.
     */
    mixed_um: <IEOL>{ },
    
    /**
     * Windows- or Mac-style line ending sequence.
     */
    mixed_wm: <IEOL>{ },
    
    /**
     * Unix- or EBCDIC-style line ending sequence.
     */
    mixed_ue: <IEOL>{ },
    
    /**
     * Windows- or EBCDIC-style line ending sequence.
     */
    mixed_we: <IEOL>{ },
    
    /**
     * Mac-, EBCDIC-style line ending sequence.
     */
    mixed_me: <IEOL>{ },
    
    /**
     * Unix- or qnx-style line ending sequence.
     */
    mixed_uq: <IEOL>{ },
    
    /**
     * Windows- or qnx-style line ending sequence.
     */
    mixed_wq: <IEOL>{ },
    
    /**
     * Mac- or qnx-style line ending sequence.
     */
    mixed_mq: <IEOL>{ },
    
    /**
     * EBCDIC- or qnx-style line ending sequence.
     */
    mixed_eq: <IEOL>{ },
    
    /**
     * Unix-, Windows- or Mac-style line ending sequence.
     */
    mixed_uwm: <IEOL>{ },
    
    /**
     * Unix-, Windows- or EBCDIC-style line ending sequence.
     */
    mixed_uwe: <IEOL>{ },
    
    /**
     * Unix-, Mac- or EBCDIC-style line ending sequence.
     */
    mixed_ume: <IEOL>{ },
    
    /**
     * Windows-, Mac- or EBCDIC-style line ending sequence.
     */
    mixed_wme: <IEOL>{ },
    
    /**
     * Unix-, Windows- or qnx-style line ending sequence.
     */
    mixed_uwq: <IEOL>{ },
    
    /**
     * Unix-, Mac- or qnx-style line ending sequence.
     */
    mixed_umq: <IEOL>{ },
    
    /**
     * Windows-, Mac- or qnx-style line ending sequence.
     */
    mixed_wmq: <IEOL>{ },
    
    /**
     * Unix-, EBCDIC- or qnx-style line ending sequence.
     */
    mixed_ueq: <IEOL>{ },
    
    /**
     * Windows-, EBCDIC- or qnx-style line ending sequence.
     */
    mixed_weq: <IEOL>{ },
    
    /**
     * Windows-, EBCDIC- or qnx-style line ending sequence.
     */
    mixed_meq: <IEOL>{ },
    
    /**
     * Unix-, Windows-, Mac- or EBCDIC-style line ending sequence.
     */
    mixed_uwme: <IEOL>{ },
    
    /**
     * Unix-, Windows-, Mac- or qnx-style line ending sequence.
     */
    mixed_uwmq: <IEOL>{ },
    
    /**
     * Unix-, Windows-, EBCDIC- or qnx-style line ending sequence.
     */
    mixed_uweq: <IEOL>{ },
    
    /**
     * Unix-, Mac-, EBCDIC- or qnx-style line ending sequence.
     */
    mixed_umeq: <IEOL>{ },
    
    /**
     * Windows-, Mac-, EBCDIC- or qnx-style line ending sequence.
     */
    mixed_wmeq: <IEOL>{ },
};
const __CACHE = {
    eolType: <ITypeMetaCache<EOLtype, ITypeMetaCacheItem<EOLtype>>>{
        allNames: [],
        byAbbr: {},
        byName: {}
    },
    eolMixed: <ITypeMetaCache<EOLmixed, IMixedTypeMetaCacheItem>>{
        allNames: [],
        byAbbr: {},
        byName: {}
    },
    fallback: <ITypeMetaCacheItem<EOLtype>>{
        abbr: 'u',
        name: 'unix',
        metaData: {
            regex: /\n/,
            sequence: "\n"
        }
    },
    printable: {
        utf8: <IPrintableMetaData>{
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
            strictRegexByType: { }
        },
        ascii: <IPrintableMetaData>{
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
            strictRegexByType: { }
        }
    }
};
__CACHE.eolType.allNames = (<ITypeMetaCacheItem<EOLtype>[]>[
    __CACHE.fallback,
    { name: "windows", abbr: "w", metaData: { sequence: "\r\n", regex: /\r\n/, atomicRegex: /(?:\r\n)/ } },
    { name: "mac", abbr: "m", metaData: { sequence: "\r", regex: /\r/, atomicRegex: /\r/ } },
    { name: "ebcdic", abbr: "e", metaData: { sequence: "", regex: /\x15/, atomicRegex: /\x15/ } },
    { name: "qnx", abbr: "q", metaData: { sequence: "", regex: /\x1e/, atomicRegex: /\x1e/ } }
]).map(function(c: ITypeMetaCacheItem<EOLtype>): EOLtype {
    __CACHE.eolType.byAbbr[c.abbr] = c;
    __CACHE.eolType.byName[c.name] = c;
    (<{ [index: string]: IEOL }>(<object>EOL))[c.name] = {
        regex: c.metaData.regex,
        sequence: c.metaData.sequence
    };
    if (c.metaData.sequence == OS.EOL)
        __CACHE.fallback = c;
    return c.name;
});
function isMixedType(value: EOLspec): value is EOLmixed {
    for (var i = 0; i< __CACHE.eolType.allNames.length; i++) {
        if (__CACHE.eolType.allNames[i] == value)
            return false;
    }
    return true;
}

__CACHE.eolMixed.allNames = (<{name: EOLmixed; regex: RegExp; isAtomic: boolean; }[]>[
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
]).map(function(value: {name: EOLmixed; regex: RegExp; isAtomic: boolean }, index: number): EOLmixed {
    let abbr: string = (index == 0) ? "uwmeq" : value.name.substr(6);
    let meta: IMixedTypeMetaCacheItem = {
        name: value.name,
        abbr: abbr,
        metaData: {
            sequence: (value.regex.test(OS.EOL)) ? OS.EOL : (value.name == "mixed" || value.name.startsWith("mixed_u")) ? "\n" : ((value.name.startsWith("mixed_w")) ? "\r\n" : ((value.name.startsWith("mixed_m")) ? "\n" : "\x15")),
            regex: value.regex,
            atomicRegex: (value.isAtomic) ? value.regex : new RegExp("(?:" + value.regex.source + ")")
        },
        types: __CACHE.eolType.allNames.filter(function(t: EOLtype) { return abbr.indexOf(__CACHE.eolType.byName[t].abbr) >= 0; })
    };
    __CACHE.eolMixed.byAbbr[abbr] = meta;
    __CACHE.eolMixed.byName[value.name] = meta;
    (<{ [index: string]: IEOL }>(<object>EOL))[value.name] = {
        regex: meta.metaData.regex,
        sequence: meta.metaData.sequence
    };
    return value.name;
});
export function toEOLspec(type?: EOLspec|EOLspec[], ...types: EOLspec[]): EOLspec {
    types = ((typeof(type) == "undefined") ? [] : ((Array.isArray(type)) ? type : [type])).concat((typeof(types) == "undefined") ? [] : types);
    if (types.length == 0)
        return __CACHE.fallback.name;

    if (types.length > 0)
        types = types.filter(function(value: EOLspec, index: number, array: EOLspec[]) {
            for (var i = 0; i < index; i++) {
                if (array[i] == value)
                    return false;
            }
            return true;
        });
    if (types.length == 1)
        return types[0];
    
    let basicTypes: EOLtype[] = __CACHE.eolType.allNames.filter(function(t: EOLtype) {
        for (var i = 0; i < types.length; i++) {
            if (isMixedType(types[i])) {
                let tt: EOLtype[] = __CACHE.eolMixed.byName[types[i]].types;
                for (var n = 0; n < tt.length; n++) {
                    if (tt[n] == t)
                        return true;
                }
            } else if (types[i] == t)
                return true;
        }
        return false;
    });
    if (basicTypes.length == __CACHE.eolType.allNames.length)
        return "mixed";
    return <EOLspec>("mixed_" + basicTypes.map(function(t: EOLtype) { return __CACHE.eolType.byName[t].abbr}).join(""));
}
export function toEolType(type?: EOLspec|EOLspec[], ...types: EOLspec[]): EOLtype {
    let t: EOLspec = toEOLspec(((typeof(type) == "undefined") ? [] : ((Array.isArray(type)) ? type : [type])).concat((typeof(types) == "undefined") ? [] : types));
    if (isMixedType(t))
        return __CACHE.eolMixed.byName[t].types[0];
    return t;
}
export function getEOLdefinition(type?: EOLspec|EOLspec[], ...types: EOLspec[]): IEOL {
    let t: EOLspec = toEOLspec(((typeof(type) == "undefined") ? [] : ((Array.isArray(type)) ? type : [type])).concat((typeof(types) == "undefined") ? [] : types));
    if (isMixedType(t))
        return __CACHE.eolMixed.byName[t].metaData;
    return __CACHE.eolType.byName[t].metaData;
}
export function getEOLsequence(type?: EOLspec|EOLspec[], ...types: EOLspec[]): string {
    return getEOLdefinition(((typeof(type) == "undefined") ? [] : ((Array.isArray(type)) ? type : [type])).concat((typeof(types) == "undefined") ? [] : types)).sequence;
}
export interface IPrintableRegexOptions {
    multiLine?: boolean;
    ascii?: boolean,
    strict?: boolean;
    type?: EOLspec|EOLspec[]
}
export function getPrintableRegex(opt?: IPrintableRegexOptions|EOLspec, ...types: EOLspec[]): RegExp {
    if (typeof(opt) == "undefined")
        opt = { type: types };
    else if (typeof(opt) == "string")
        opt = { type: [opt].concat((typeof(types) == "undefined") ? [] : types) };
    let t: EOLspec = toEOLspec(opt.type);
    let metaData: IPrintableMetaData = (opt.ascii) ? __CACHE.printable.ascii : __CACHE.printable.utf8;
    let h: { [index: string]: IPrintableRegexes|undefined; } = (opt.strict) ? metaData.strictRegexByType : metaData.regexByType;
    let regexes: IPrintableRegexes|undefined = h[t];
    if (typeof(regexes) == "undefined") {
        if (opt.strict)
            regexes = metaData.regexByType[t];
        if (typeof(regexes) == "undefined") {
            let eol: _IEOL = <_IEOL>(getEOLdefinition(t));
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
            }
            h[t] = regexes;
        }
    }

    if (opt.multiLine)
        return regexes.oneOrMore;
    return regexes.zeroOrMore;
}
export function isPrintableText(text: string, opt?: IPrintableRegexOptions|EOLspec, ...types: EOLspec[]): boolean {
    if (typeof(types) != "undefined" && types.length > 0) {
        if (typeof(opt) == "undefined")
            opt = { type: types, strict: true };
        else if (typeof(opt) == "string")
            opt = { type: [opt].concat((typeof(types) == "undefined") ? [] : types), strict: true };
        else if (typeof(types) != "undefined" && types.length > 0)
            opt = {
                type: (typeof(opt.type) == "undefined") ? types : ((typeof(opt.type) == "string") ? [opt.type] : opt.type).concat(types),
                ascii: opt.ascii,
                multiLine: opt.multiLine,
                strict: (typeof(opt.strict) == "boolean") ? opt.strict : true
            };
    } else if (typeof(opt) == "undefined")
        opt = { strict: true };
    else if (typeof(opt) == "string")
        opt = { type: opt, strict: true };
    else if (typeof(opt.strict) == "undefined") {
        opt = {
            type: opt.type,
            ascii: opt.ascii,
            multiLine: opt.multiLine,
            strict: true
        };
    }
    return getPrintableRegex(opt).test(text);
}

/**
 * Detect line ending type.
 * @export
 * @param {string} text Text to scan for line ending character sequences.
 * @returns {(EOLspec|undefined)} Type of line ending or undefined if text contains non-printable characters that do not reprsent a line ending sequence.
 */
export function detectLineEndingType(text: string): EOLspec|undefined {
    if (text.length > 0) {
        let mr: RegExpMatchArray|null = text.match(EOL.mixed.regex);
        if (mr !== null && mr[0].length == text.length) {
            let i: number;
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

/**
 * Split text into lines.
 * @export
 * @param {string} text Text to be split into lines
 * @param {(LineEndingType|null)} [type] Type of line ending. Use null or undefined to auto-detect.
 * @returns {string[]} Text split into individual lines
 */
export function splitLines(text: string|string[], type?: EOLspec|null, maxlen?: number): string[] {
    let lines: string[];
    if (typeof(text) == "string") {
        if (typeof(type) != "string") {
            let t: EOLspec|undefined = detectLineEndingType(text);
            type = (typeof(t) == "string") ? t : "mixed";
        }
        if (isMixedType(type))
            lines = text.split(__CACHE.eolMixed.byName[type].metaData.regex);
        else
            lines = text.split(__CACHE.eolType.byName[type].metaData.regex);
    } else {
        lines = [];
        text.forEach(function(s: string) { lines = lines.concat(splitLines(s, type)); });
    }
    if (typeof(maxlen) == "number" && maxlen > 0) {
        let result: string[] = [];
        lines.forEach(function(s: string) {
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

/**
 * Supported text encoding types
 * @export
 * @typedef {(BufferEncoding|"utf16be"|"utf32le"|"utf32be")}
 * @description Encodings are as follows:
 * "utf8": 8-bit unicode characters.
 * "ascii": 7-bit ASCII characters.
 * "utf16le": 16-bit little-endian encoded unicode characters.
 * "utf16be": 16-bit big-endian encoded unicode characters.
 * "utf32le": 32-bit little-endian encoded unicode characters.
 * "utf32be": 32-bit big-endian encoded unicode characters.
 * "base64": Base64 byte encoding.
 * "latin1": Western European (ISO) encoding.
 * "hex": Each byte encoded as 2 hexidecimal characters.
 * "binary": Obsolete buffer encoding type which is synonymous with base64 in this module..
 */
export type EncodingType = BufferEncoding|"utf16be"|"utf32le"|"utf32be";

export function isBufferCompatibleEncodingType(type: EncodingType): type is BufferEncoding {
    switch (type) {
        case "utf16be":
        case "utf32le":
        case "utf32be":
            return false;
        default:
            return true;
    }
}

export function convertBufferEncoding(sourceBuffer: Buffer, sourceEncoding: EncodingType, targetEncoding: EncodingType): Buffer {
    if (sourceBuffer.length == 0 || sourceEncoding == targetEncoding)
        return new Buffer(sourceBuffer);
    let i: number;
    let targetBuffer: Buffer;
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

export function toBufferCompatibleEncoding(type: EncodingType): BufferEncoding {
    switch (type) {
        case "utf16be":
        case "utf32le":
        case "utf32be":
            return "utf16le";
        default:
            return type;
    }   
}

export function detectEncoding(buffer: Buffer|Uint8Array, extended?: boolean): EncodingType|null {
    if (buffer.length == 0)
        return null;
    let e: EncodingType|null = detectByteOrderMarks(buffer);
    if (e !== null)
        return e;
    let tryOrder: EncodingType[] = ["ascii", "utf8", "utf16le", "latin1", "utf16be", "utf32le", "utf32be"];
    let b: Buffer = new Buffer(buffer);
    for (var i = 0; i < tryOrder.length; i++) {
        let text: string|undefined;
        try { text = b.toString(tryOrder[i]); } catch { text = undefined; }
        if (typeof(text) == "string" && isPrintableText(text, { ascii: (tryOrder[i] == "ascii"), type: "mixed_uwm" }))
            return tryOrder[i];
    }
    for (var i = 0; i < tryOrder.length; i++) {
        let text: string|undefined;
        try { text = b.toString(tryOrder[i]); } catch { text = undefined; }
        if (typeof(text) == "string" && isPrintableText(text, { ascii: (tryOrder[i] == "ascii"), type: "ebcdic" }))
            return tryOrder[i];
    }
    for (var i = 0; i < tryOrder.length; i++) {
        let text: string|undefined;
        try { text = b.toString(tryOrder[i]); } catch { text = undefined; }
        if (typeof(text) == "string" && isPrintableText(text, { ascii: (tryOrder[i] == "ascii"), type: "qnx" }))
            return tryOrder[i];
    }
    return null;
}

/**
 * Detect text encoding from byte order marks.
 * @param {(Buffer|Uint8Array)} buffer Buffer containing data.
 * @param {boolean} [extended] If set to true, then encodings not specifically supported by node.js will be detected.
 * @returns {(EncodingType|null)} Returns string representing detected encoding type if an encoding type is detected from byte order marks; otherwise a null value is returned.
 */
export function detectByteOrderMarks(buffer: Buffer|Uint8Array, extended?: boolean): EncodingType|null {
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
                        } else
                            return "utf16le";
                    } else if (buffer.length == 2 || buffer[2] != 0)
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