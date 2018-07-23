export enum JsTokenType {
    Unknown,
    Comment,
    Identifier,
    Number,
    String,
    OpenGroup,
    CloseGroup,
    Regex,
    Terminator,
    NewLine,
    Operator,
    WhiteSpace
}
export interface IParsedToken {
    value: any,
    code: string,
    type: JsTokenType
}
export interface ITokenChain {
    previous?: ITokenChain;
    current: IParsedToken;
    next?: ITokenChain;
}

export interface ITryParseTokenCB { (code: string, context: JsCodeParseContext): IParsedToken|undefined; }
interface IRegexParsedMatchGroups {
    codeGroup?: number|number[],
    value?: number|number[]|{ (matches: RegExpMatchArray): any }
    tokenType: JsTokenType
}
interface IRegexToTokenInfo {
    regex: RegExp,
    match: JsTokenType|IRegexParsedMatchGroups|IRegexParsedMatchGroups[],
    shouldParse?: { (tokenChain?: ITokenChain): boolean; }
}
interface IJsCodeParseOptions {
    allowIdentifierEscapeSequence?: boolean;
    allowBackquoteMultiline?: boolean;
}
export class JsCodeParseContext {
    private _tokenChain : ITokenChain|undefined;
    public get tokenChain() : ITokenChain|undefined {
        return this._tokenChain;
    }
    
    private _tokenParseInfo: IRegexToTokenInfo[];

    private _position : number = 0;
    public get position() : number {
        return this._position;
    }
    
    private _code : string;
    public get code() : string {
        return this._code;
    }
    
    public constructor(code: string, options?: IJsCodeParseOptions) {
        this._code = code;
        if (typeof(options) == "undefined")
            options = { };
        this._tokenParseInfo = [
            {
                regex: /^(?:\/\/([^\r\n]*)|\/\*([^*]*(?:(?:\*[^\/])+[^*]+)*(?:\*[^\/])*)\*\/)/,
                match: { value: [1, 2], tokenType: JsTokenType.Comment }
            }, {
                regex: (options.allowIdentifierEscapeSequence) ? /^[_$a-zA-Z](?:[_$a-zA-Z\d]+|\\u[\da-fA-F]{4})*/ : /^[_$a-zA-Z][_$a-zA-Z\d]*/,
                match: JsTokenType.Identifier
            }, {
                regex: /^-?(\d+(\.\d+)?(e\d+)?|0b[10]+|0o[0-7]+|0x[a-fA-F\d]+)/,
                match: JsTokenType.Number
            }, {
                regex: (options.allowBackquoteMultiline) ? /^("(?:[^"\\]*(?:(?:\\(?:\r\n|[^\\]))+[^"\\]+)*(?:\\(?:\r\n|[^\\]))*)"|'(?:[^'\\]*(?:(?:\\(?:\r\n|[^\\]))+[^'\\]+)*(?:\\(?:\r\n|[^\\]))*)'|`([^`]*)`)/ :
                    /^("(?:[^"\\]*((?:\\(?:\r\n|[^\\]))+[^"\\]+)*(?:\\(?:\r\n|[^\\]))*)"|'(?:[^'\\]*((?:\\(?:\r\n|[^\\]))+[^'\\]+)*(?:\\(?:\r\n|[^\\]))*)')/,
                match: {
                    tokenType: JsTokenType.String,
                    value: (options.allowBackquoteMultiline) ? function(matches: RegExpMatchArray): string { return (matches[2] !== null) ? matches[2] : JSON.parse(matches[0]); } :
                        function(matches: RegExpMatchArray): string { return JSON.parse(matches[0]); }
                }
            }, {
                regex: /^[\[{(]/,
                match: JsTokenType.OpenGroup
            }, {
                regex: /^[\]})]/,
                match: JsTokenType.CloseGroup
            }, {
                regex: /^\/[^\r\n\\]*((\\[^\r\n])+[^\r\n\\]+)*(\\[^\r\n])*\//,
                match: JsTokenType.Regex,
                shouldParse: function(tokenChain?: ITokenChain): boolean {
                    while (typeof(tokenChain) != "undefined") {
                        switch (tokenChain.current.type) {
                            case JsTokenType.CloseGroup:
                            case JsTokenType.OpenGroup:
                            case JsTokenType.Operator:
                            case JsTokenType.Terminator:
                                return true;
                            case JsTokenType.Identifier:
                            case JsTokenType.Number:
                            case JsTokenType.Regex:
                            case JsTokenType.String:
                                return false;
                        }
                    }
                    return true;
                }
            }, {
                regex: /^;/,
                match: JsTokenType.Terminator
            }, {
                regex: /^(\r\n?|\n)/,
                match: JsTokenType.NewLine
            }, {
            regex: /^([+\-*/%=!<>\|&\^]=?|++|--|[!=]==|(<<|>>>?)=?|&&|\|\||=>|[?.~,])/,
                match: JsTokenType.Operator
            }, {
            regex: /^[^\S\r\n]+/,
                match: JsTokenType.WhiteSpace
            }
        ]
    }

    public ParseNextToken(): IParsedToken|undefined {
        if (this._position >= this._code.length)
            return;
        let c: string = (this._position > 0) ? this._code.substr(this._position) : this._code;
        let tokenChain: ITokenChain|undefined = undefined;
        for (var i = 0; i < this._tokenParseInfo.length; i++) {
            let parseInfo: IRegexToTokenInfo = this._tokenParseInfo[i];
            if (typeof(parseInfo.shouldParse) != "undefined" && !parseInfo.shouldParse(this._tokenChain))
                continue;
            let m: RegExpMatchArray|null = c.match(parseInfo.regex);
            if (m !== null) {
                let matchSpec: JsTokenType|IRegexParsedMatchGroups|IRegexParsedMatchGroups[] = parseInfo.match;
                if (typeof(matchSpec) == "number")
                    tokenChain = {
                        previous: this._tokenChain,
                        current: {
                            value: m[0],
                            code: m[0],
                            type: matchSpec
                        },
                    }
                else if (Array.isArray(matchSpec)) {
                    for (var n = 0; n < matchSpec.length; n++) {
                        let cg: number|number[]|undefined = matchSpec[n].codeGroup;
                        let vs: number|number[]|{ (matches: RegExpMatchArray): any }|undefined = matchSpec[n].value;
                        let ng: number[] = (typeof(cg) == "undefined") ? [] : ((typeof(cg) == "number") ? [cg] : cg);
                        let vi: number[]|{ (matches: RegExpMatchArray): any } = (typeof(vs) == "undefined") ? [] : ((typeof(vs) == "number") ? [vs] : vs);
                        if (ng.length == 0) {
                            if (!Array.isArray(vi)) {
                                tokenChain = {
                                    previous: this._tokenChain,
                                    current: {
                                        value: vi(m),
                                        code: m[0],
                                        type: matchSpec[n].tokenType
                                    },
                                }
                                break;
                            }
                            if (vi.length == 0) {
                                tokenChain = {
                                    previous: this._tokenChain,
                                    current: {
                                        value:m[0],
                                        code: m[0],
                                        type: matchSpec[n].tokenType
                                    },
                                }
                                break;
                            }
                            for (var i = 0; i < vi.length; i++) {
                                if (vi[i] >= 0 && vi[i] < m.length && m[vi[i]] !== null) {
                                    tokenChain = {
                                        previous: this._tokenChain,
                                        current: {
                                            value:m[vi[i]],
                                            code: m[0],
                                            type: matchSpec[n].tokenType
                                        },
                                    }
                                    break;
                                }
                            }
                            if (typeof(tokenChain) != "undefined")
                                break;
                        }
                         
                        if (Array.isArray(vi)) {
                            for (var i = 0; i < vi.length; i++) {
                                if (vi[i] >= 0 && vi[i] < m.length && m[vi[i]] !== null) {
                                    tokenChain = {
                                        previous: this._tokenChain,
                                        current: {
                                            value:m[vi[i]],
                                            code: m[0],
                                            type: matchSpec[n].tokenType
                                        }
                                    }
                                    break;
                                }
                            }
                        }
                        for (var i = 0; i < ng.length; i++) {
                            if (ng[i] >= 0 && ng[i] < m.length && m[ng[i]] !== null) {
                                let cv: any|undefined = m[ng[i]];
                                if (Array.isArray(vi)) {
                                    for (var x = 0; x < vi.length; x++) {
                                        if (vi[x] >= 0 && vi[x] < m.length && m[vi[x]] !== null) {
                                            cv = m[vi[x]];
                                            break;
                                        }
                                    }
                                } else
                                    cv = vi(m);
                                tokenChain = {
                                    previous: this._tokenChain,
                                    current: {
                                        value: cv,
                                        code: m[ng[i]],
                                        type: matchSpec[n].tokenType
                                    }
                                }
                                break;
                            }
                        }
                        
                        if (typeof(tokenChain) != "undefined")
                            break;
                    }
                }
                if (typeof(tokenChain) != "undefined") {
                    if (typeof(tokenChain.previous) != "undefined")
                        tokenChain.previous.next = tokenChain;
                    this._tokenChain = tokenChain;
                    this._position += this._tokenChain.current.code.length;
                    return tokenChain.current;
                }
            }
        }
        tokenChain = this._tokenChain;
        if (typeof(tokenChain) != "undefined" && tokenChain.current.type == JsTokenType.Unknown)
            tokenChain.current.code += this._code.substr(this._position, 1);
        else {
            tokenChain = {
                previous: this._tokenChain,
                current: {
                    value: "Parse error",
                    code: this._code.substr(this._position, 1),
                    type: JsTokenType.Unknown
                }
            }
            if (typeof(tokenChain.previous) != "undefined")
                tokenChain.previous.next = tokenChain;
            this._tokenChain = tokenChain;
            this._position++;
            return tokenChain.current;
        }
    }
}