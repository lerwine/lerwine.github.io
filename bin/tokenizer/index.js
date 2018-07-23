"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
let s = "test\My";
var jsTokenizer;
(function (jsTokenizer) {
    const blockTokenRe = /^(\s+)?(([;{}()\[\]])|"([^\r\n\\"]*(?:(?:\\(?:\r\n|.))+[^\r\n\\"]+)*(?:\\(?:\r\n|.))*)(")?|'([^\r\n\\"]*(?:(?:\\(?:\r\n|.))+[^\r\n\\"]+)*(?:\\(?:\r\n|.))*)(')?|([$_a-zA-Z][a-zA-z\d_]*))/;
    let BasicTokenType;
    (function (BasicTokenType) {
        BasicTokenType[BasicTokenType["Whitespace"] = 0] = "Whitespace";
        BasicTokenType[BasicTokenType["Terminator"] = 1] = "Terminator";
        BasicTokenType[BasicTokenType["OpenBrace"] = 2] = "OpenBrace";
        BasicTokenType[BasicTokenType["CloseBrace"] = 3] = "CloseBrace";
        BasicTokenType[BasicTokenType["OpenParenth"] = 4] = "OpenParenth";
        BasicTokenType[BasicTokenType["ClosePareth"] = 5] = "ClosePareth";
        BasicTokenType[BasicTokenType["OpenBracket"] = 6] = "OpenBracket";
        BasicTokenType[BasicTokenType["CloseBracket"] = 7] = "CloseBracket";
        BasicTokenType[BasicTokenType["SingleQuotedString"] = 8] = "SingleQuotedString";
        BasicTokenType[BasicTokenType["DoubleQuotedString"] = 9] = "DoubleQuotedString";
        BasicTokenType[BasicTokenType["Symbol"] = 10] = "Symbol";
        BasicTokenType[BasicTokenType["Error"] = 11] = "Error";
    })(BasicTokenType = jsTokenizer.BasicTokenType || (jsTokenizer.BasicTokenType = {}));
    class BasicToken {
        static parseBlockLevelJs(source, previousNode) {
            let matches = source.match(blockTokenRe);
            if (matches !== null) {
                if (matches[1] !== null)
                    previousNode = new BasicToken(BasicTokenType.Whitespace, matches[1], previousNode);
                if (matches[3] !== null) {
                    switch (matches[2]) {
                        case "{":
                            return new BasicToken(BasicTokenType.OpenBrace, matches[1], previousNode);
                        case "}":
                            return new BasicToken(BasicTokenType.CloseBrace, matches[1], previousNode);
                        case "(":
                            return new BasicToken(BasicTokenType.OpenParenth, matches[1], previousNode);
                        case ")":
                            return new BasicToken(BasicTokenType.ClosePareth, matches[1], previousNode);
                        case "[":
                            return new BasicToken(BasicTokenType.OpenBracket, matches[1], previousNode);
                        case "]":
                            return new BasicToken(BasicTokenType.CloseBracket, matches[1], previousNode);
                        default:
                            return new BasicToken(BasicTokenType.Terminator, matches[1], previousNode);
                    }
                }
                if (matches[4] !== null) {
                    if (matches[5] === null)
                        return new BasicToken(BasicTokenType.Error, matches[1], previousNode, "Unterminated string");
                    return new BasicToken(BasicTokenType.DoubleQuotedString, matches[1], previousNode, matches[4]);
                }
                if (matches[6] !== null) {
                    if (matches[7] === null)
                        return new BasicToken(BasicTokenType.Error, matches[1], previousNode, "Unterminated string");
                    return new BasicToken(BasicTokenType.DoubleQuotedString, matches[1], previousNode, matches[6]);
                }
                if (matches[8] !== null)
                    return new BasicToken(BasicTokenType.Symbol, matches[1], previousNode);
            }
            return new BasicToken(BasicTokenType.Error, source, previousNode, "Unknown token type");
        }
        get type() {
            return this._type;
        }
        get text() {
            return this._text;
        }
        get value() {
            return this._value;
        }
        get preceding() {
            return this._preceding;
        }
        get following() {
            return this._following;
        }
        constructor(type, text, precedingNode, value) {
            if (typeof (precedingNode) != "undefined") {
                if (typeof (precedingNode._following) != "undefined")
                    throw new Error("Preceding node already has a following node.");
                precedingNode._following = this;
            }
            this._type = type;
            this._text = text;
            this._value = (typeof (value) == "undefined") ? text : value;
            this._preceding = precedingNode;
        }
    }
})(jsTokenizer = exports.jsTokenizer || (exports.jsTokenizer = {}));
//# sourceMappingURL=index.js.map