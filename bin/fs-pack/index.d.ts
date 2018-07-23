import * as textEncoding from '../text-encoding';
export interface IJsonFsArchive {
    name: string;
    birthtime: Date | string;
    mtime: Date | string;
}
export interface IJsonDirectoryArchive extends IJsonFsArchive {
    childItems: (IJsonDirectoryArchive | IJSONFileArchive)[];
}
export interface IJSONFileArchive extends IJsonFsArchive {
    size: number;
    encoding: textEncoding.EncodingType;
    content: string[];
    eolType?: textEncoding.EOLtype;
}
//# sourceMappingURL=index.d.ts.map