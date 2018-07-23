/// <reference types="node" />
export interface IHashObject<T> {
    [key: string]: T;
}
export interface IEOL {
    sequence: string;
    regex: RegExp;
}
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
export declare type EOLtype = "unix" | "windows" | "mac" | "ebcdic" | "qnx";
export declare type EOLmixed = "mixed" | "mixed_uwme" | "mixed_uwmq" | "mixed_uweq" | "mixed_umeq" | "mixed_wmeq" | "mixed_uwm" | "mixed_uwe" | "mixed_ume" | "mixed_wme" | "mixed_uwq" | "mixed_umq" | "mixed_wmq" | "mixed_ueq" | "mixed_weq" | "mixed_meq" | "mixed_uw" | "mixed_um" | "mixed_wm" | "mixed_ue" | "mixed_we" | "mixed_me" | "mixed_uq" | "mixed_wq" | "mixed_mq" | "mixed_eq";
export declare type EOLspec = EOLtype | EOLmixed;
export declare const EOL: IEOLspecMeta<IEOL>;
export declare function toEOLspec(type?: EOLspec | EOLspec[], ...types: EOLspec[]): EOLspec;
export declare function toEolType(type?: EOLspec | EOLspec[], ...types: EOLspec[]): EOLtype;
export declare function getEOLdefinition(type?: EOLspec | EOLspec[], ...types: EOLspec[]): IEOL;
export declare function getEOLsequence(type?: EOLspec | EOLspec[], ...types: EOLspec[]): string;
export interface IPrintableRegexOptions {
    multiLine?: boolean;
    ascii?: boolean;
    strict?: boolean;
    type?: EOLspec | EOLspec[];
}
export declare function getPrintableRegex(opt?: IPrintableRegexOptions | EOLspec, ...types: EOLspec[]): RegExp;
export declare function isPrintableText(text: string, opt?: IPrintableRegexOptions | EOLspec, ...types: EOLspec[]): boolean;
/**
 * Detect line ending type.
 * @export
 * @param {string} text Text to scan for line ending character sequences.
 * @returns {(EOLspec|undefined)} Type of line ending or undefined if text contains non-printable characters that do not reprsent a line ending sequence.
 */
export declare function detectLineEndingType(text: string): EOLspec | undefined;
/**
 * Split text into lines.
 * @export
 * @param {string} text Text to be split into lines
 * @param {(LineEndingType|null)} [type] Type of line ending. Use null or undefined to auto-detect.
 * @returns {string[]} Text split into individual lines
 */
export declare function splitLines(text: string | string[], type?: EOLspec | null, maxlen?: number): string[];
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
export declare type EncodingType = BufferEncoding | "utf16be" | "utf32le" | "utf32be";
export declare function isBufferCompatibleEncodingType(type: EncodingType): type is BufferEncoding;
export declare function convertBufferEncoding(sourceBuffer: Buffer, sourceEncoding: EncodingType, targetEncoding: EncodingType): Buffer;
export declare function toBufferCompatibleEncoding(type: EncodingType): BufferEncoding;
export declare function detectEncoding(buffer: Buffer | Uint8Array, extended?: boolean): EncodingType | null;
/**
 * Detect text encoding from byte order marks.
 * @param {(Buffer|Uint8Array)} buffer Buffer containing data.
 * @param {boolean} [extended] If set to true, then encodings not specifically supported by node.js will be detected.
 * @returns {(EncodingType|null)} Returns string representing detected encoding type if an encoding type is detected from byte order marks; otherwise a null value is returned.
 */
export declare function detectByteOrderMarks(buffer: Buffer | Uint8Array, extended?: boolean): EncodingType | null;
//# sourceMappingURL=index.d.ts.map