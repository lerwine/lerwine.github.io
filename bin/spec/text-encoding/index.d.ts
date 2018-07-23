export interface IB64LinesAndExpected {
    b64Bytes: string[];
    expected: string;
}
export interface IEncodingWBomBytesTestData {
    utf8: IB64LinesAndExpected;
    utf16le: IB64LinesAndExpected;
    utf16be: IB64LinesAndExpected;
    utf32le: IB64LinesAndExpected;
    utf32be: IB64LinesAndExpected;
}
export interface IEncodingBytesTestData extends IEncodingWBomBytesTestData {
    utf7: IB64LinesAndExpected;
    ascii: IB64LinesAndExpected;
    latin1: IB64LinesAndExpected;
    windows: IB64LinesAndExpected;
    ebcdic500: IB64LinesAndExpected;
    ebcdic1140: IB64LinesAndExpected;
    ebcdic37: IB64LinesAndExpected;
}
export interface IEncodingTestData {
    withoutBOM: {
        lf: IEncodingBytesTestData;
        crlf: IEncodingBytesTestData;
        cr: IEncodingBytesTestData;
    };
    withBOM: {
        lf: IEncodingWBomBytesTestData;
        crlf: IEncodingWBomBytesTestData;
        cr: IEncodingWBomBytesTestData;
    };
    utf8AsHex: string[];
    names: {
        utf8: {
            name: string;
            webName?: string;
        };
        utf7: {
            name: string;
            webName?: string;
        };
        ascii: {
            name: string;
            webName?: string;
        };
        utf16le: {
            name: string;
            webName?: string;
        };
        utf16be: {
            name: string;
            webName?: string;
        };
        utf32le: {
            name: string;
            webName?: string;
        };
        utf32be: {
            name: string;
            webName?: string;
        };
        latin1: {
            name: string;
            webName?: string;
        };
        windows: {
            name: string;
            webName?: string;
        };
        ebcdic500: {
            name: string;
            webName?: string;
        };
        ebcdic1140: {
            name: string;
            webName?: string;
        };
        ebcdic37: {
            name: string;
            webName?: string;
        };
        base64: {
            name: string;
            webName?: string;
        };
        hex: {
            name: string;
            webName?: string;
        };
    };
}
export declare let encodingTestData: IEncodingTestData;
//# sourceMappingURL=index.d.ts.map