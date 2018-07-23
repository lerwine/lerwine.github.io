"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.encodingTestData = {
    withoutBOM: {
        lf: {
            utf8: {
                b64Bytes: [
                    "PCFET0NUWVBFIGh0bWwgW10+CjxodG1sPgogIDxoZWFkPgogICAgPG1ldGEgY2hhcnNldD0idXRm",
                    "LTgiIC8+CiAgICA8dGl0bGU+VW5pY29kZSAoVVRGLTgpPC90aXRsZT4KICA8L2hlYWQ+CiAgPGJv",
                    "ZHk+VGhpcyBpcyBhbiBleGFtcGxlPC9ib2R5Pgo8L2h0bWw+"
                ],
                expected: "<!DOCTYPE html []>\n<html>\n  <head>\n    <meta charset=\"utf-8\" />\n    <title>Unicode (UTF-8)</title>\n  </head>\n  <body>This is an example</body>\n</html>"
            },
            utf7: {
                b64Bytes: [
                    "K0FEd0FJUS1ET0NUWVBFIGh0bWwgK0FGc0FYUUErLQorQUR3LWh0bWwrQUQ0LQogICtBRHctaGVh",
                    "ZCtBRDQtCiAgICArQUR3LW1ldGEgY2hhcnNldCtBRDBBSWctdXRmLTcrQUNJLSAvK0FENC0KICAg",
                    "ICtBRHctdGl0bGUrQUQ0LVVuaWNvZGUgKFVURi03KStBRHctL3RpdGxlK0FENC0KICArQUR3LS9o",
                    "ZWFkK0FENC0KICArQUR3LWJvZHkrQUQ0LVRoaXMgaXMgYW4gZXhhbXBsZStBRHctL2JvZHkrQUQ0",
                    "LQorQUR3LS9odG1sK0FENC0="
                ],
                expected: "<!DOCTYPE html []>\n<html>\n  <head>\n    <meta charset=\"utf-7\" />\n    <title>Unicode (UTF-7)</title>\n  </head>\n  <body>This is an example</body>\n</html>"
            },
            ascii: {
                b64Bytes: [
                    "PCFET0NUWVBFIGh0bWwgW10+CjxodG1sPgogIDxoZWFkPgogICAgPG1ldGEgY2hhcnNldD0idXMt",
                    "YXNjaWkiIC8+CiAgICA8dGl0bGU+VVMtQVNDSUk8L3RpdGxlPgogIDwvaGVhZD4KICA8Ym9keT5U",
                    "aGlzIGlzIGFuIGV4YW1wbGU8L2JvZHk+CjwvaHRtbD4="
                ],
                expected: "<!DOCTYPE html []>\n<html>\n  <head>\n    <meta charset=\"us-ascii\" />\n    <title>US-ASCII</title>\n  </head>\n  <body>This is an example</body>\n</html>"
            },
            utf16le: {
                b64Bytes: [
                    "PAAhAEQATwBDAFQAWQBQAEUAIABoAHQAbQBsACAAWwBdAD4ACgA8AGgAdABtAGwAPgAKACAAIAA8",
                    "AGgAZQBhAGQAPgAKACAAIAAgACAAPABtAGUAdABhACAAYwBoAGEAcgBzAGUAdAA9ACIAdQB0AGYA",
                    "LQAxADYAIgAgAC8APgAKACAAIAAgACAAPAB0AGkAdABsAGUAPgBVAG4AaQBjAG8AZABlADwALwB0",
                    "AGkAdABsAGUAPgAKACAAIAA8AC8AaABlAGEAZAA+AAoAIAAgADwAYgBvAGQAeQA+AFQAaABpAHMA",
                    "IABpAHMAIABhAG4AIABlAHgAYQBtAHAAbABlADwALwBiAG8AZAB5AD4ACgA8AC8AaAB0AG0AbAA+",
                    "AA=="
                ],
                expected: "<!DOCTYPE html []>\n<html>\n  <head>\n    <meta charset=\"utf-16\" />\n    <title>Unicode</title>\n  </head>\n  <body>This is an example</body>\n</html>"
            },
            utf16be: {
                b64Bytes: [
                    "ADwAIQBEAE8AQwBUAFkAUABFACAAaAB0AG0AbAAgAFsAXQA+AAoAPABoAHQAbQBsAD4ACgAgACAA",
                    "PABoAGUAYQBkAD4ACgAgACAAIAAgADwAbQBlAHQAYQAgAGMAaABhAHIAcwBlAHQAPQAiAHUAdABm",
                    "AC0AMQA2AEIARQAiACAALwA+AAoAIAAgACAAIAA8AHQAaQB0AGwAZQA+AFUAbgBpAGMAbwBkAGUA",
                    "IAAoAEIAaQBnAC0ARQBuAGQAaQBhAG4AKQA8AC8AdABpAHQAbABlAD4ACgAgACAAPAAvAGgAZQBh",
                    "AGQAPgAKACAAIAA8AGIAbwBkAHkAPgBUAGgAaQBzACAAaQBzACAAYQBuACAAZQB4AGEAbQBwAGwA",
                    "ZQA8AC8AYgBvAGQAeQA+AAoAPAAvAGgAdABtAGwAPg=="
                ],
                expected: "<!DOCTYPE html []>\n<html>\n  <head>\n    <meta charset=\"utf-16BE\" />\n    <title>Unicode (Big-Endian)</title>\n  </head>\n  <body>This is an example</body>\n</html>"
            },
            utf32le: {
                b64Bytes: [
                    "PAAAACEAAABEAAAATwAAAEMAAABUAAAAWQAAAFAAAABFAAAAIAAAAGgAAAB0AAAAbQAAAGwAAAAg",
                    "AAAAWwAAAF0AAAA+AAAACgAAADwAAABoAAAAdAAAAG0AAABsAAAAPgAAAAoAAAAgAAAAIAAAADwA",
                    "AABoAAAAZQAAAGEAAABkAAAAPgAAAAoAAAAgAAAAIAAAACAAAAAgAAAAPAAAAG0AAABlAAAAdAAA",
                    "AGEAAAAgAAAAYwAAAGgAAABhAAAAcgAAAHMAAABlAAAAdAAAAD0AAAAiAAAAdQAAAHQAAABmAAAA",
                    "LQAAADMAAAAyAAAAIgAAACAAAAAvAAAAPgAAAAoAAAAgAAAAIAAAACAAAAAgAAAAPAAAAHQAAABp",
                    "AAAAdAAAAGwAAABlAAAAPgAAAFUAAABuAAAAaQAAAGMAAABvAAAAZAAAAGUAAAAgAAAAKAAAAFUA",
                    "AABUAAAARgAAAC0AAAAzAAAAMgAAACkAAAA8AAAALwAAAHQAAABpAAAAdAAAAGwAAABlAAAAPgAA",
                    "AAoAAAAgAAAAIAAAADwAAAAvAAAAaAAAAGUAAABhAAAAZAAAAD4AAAAKAAAAIAAAACAAAAA8AAAA",
                    "YgAAAG8AAABkAAAAeQAAAD4AAABUAAAAaAAAAGkAAABzAAAAIAAAAGkAAABzAAAAIAAAAGEAAABu",
                    "AAAAIAAAAGUAAAB4AAAAYQAAAG0AAABwAAAAbAAAAGUAAAA8AAAALwAAAGIAAABvAAAAZAAAAHkA",
                    "AAA+AAAACgAAADwAAAAvAAAAaAAAAHQAAABtAAAAbAAAAD4AAAA="
                ],
                expected: "<!DOCTYPE html []>\n<html>\n  <head>\n    <meta charset=\"utf-32\" />\n    <title>Unicode (UTF-32)</title>\n  </head>\n  <body>This is an example</body>\n</html>"
            },
            utf32be: {
                b64Bytes: [
                    "AAAAPAAAACEAAABEAAAATwAAAEMAAABUAAAAWQAAAFAAAABFAAAAIAAAAGgAAAB0AAAAbQAAAGwA",
                    "AAAgAAAAWwAAAF0AAAA+AAAACgAAADwAAABoAAAAdAAAAG0AAABsAAAAPgAAAAoAAAAgAAAAIAAA",
                    "ADwAAABoAAAAZQAAAGEAAABkAAAAPgAAAAoAAAAgAAAAIAAAACAAAAAgAAAAPAAAAG0AAABlAAAA",
                    "dAAAAGEAAAAgAAAAYwAAAGgAAABhAAAAcgAAAHMAAABlAAAAdAAAAD0AAAAiAAAAdQAAAHQAAABm",
                    "AAAALQAAADMAAAAyAAAAQgAAAEUAAAAiAAAAIAAAAC8AAAA+AAAACgAAACAAAAAgAAAAIAAAACAA",
                    "AAA8AAAAdAAAAGkAAAB0AAAAbAAAAGUAAAA+AAAAVQAAAG4AAABpAAAAYwAAAG8AAABkAAAAZQAA",
                    "ACAAAAAoAAAAVQAAAFQAAABGAAAALQAAADMAAAAyAAAAIAAAAEIAAABpAAAAZwAAAC0AAABFAAAA",
                    "bgAAAGQAAABpAAAAYQAAAG4AAAApAAAAPAAAAC8AAAB0AAAAaQAAAHQAAABsAAAAZQAAAD4AAAAK",
                    "AAAAIAAAACAAAAA8AAAALwAAAGgAAABlAAAAYQAAAGQAAAA+AAAACgAAACAAAAAgAAAAPAAAAGIA",
                    "AABvAAAAZAAAAHkAAAA+AAAAVAAAAGgAAABpAAAAcwAAACAAAABpAAAAcwAAACAAAABhAAAAbgAA",
                    "ACAAAABlAAAAeAAAAGEAAABtAAAAcAAAAGwAAABlAAAAPAAAAC8AAABiAAAAbwAAAGQAAAB5AAAA",
                    "PgAAAAoAAAA8AAAALwAAAGgAAAB0AAAAbQAAAGwAAAA+"
                ],
                expected: "<!DOCTYPE html []>\n<html>\n  <head>\n    <meta charset=\"utf-32BE\" />\n    <title>Unicode (UTF-32 Big-Endian)</title>\n  </head>\n  <body>This is an example</body>\n</html>"
            },
            latin1: {
                b64Bytes: [
                    "PCFET0NUWVBFIGh0bWwgW10+CjxodG1sPgogIDxoZWFkPgogICAgPG1ldGEgY2hhcnNldD0iaXNv",
                    "LTg4NTktMSIgLz4KICAgIDx0aXRsZT5XZXN0ZXJuIEV1cm9wZWFuIChJU08pPC90aXRsZT4KICA8",
                    "L2hlYWQ+CiAgPGJvZHk+VGhpcyBpcyBhbiBleGFtcGxlPC9ib2R5Pgo8L2h0bWw+"
                ],
                expected: "<!DOCTYPE html []>\n<html>\n  <head>\n    <meta charset=\"iso-8859-1\" />\n    <title>Western European (ISO)</title>\n  </head>\n  <body>This is an example</body>\n</html>"
            },
            windows: {
                b64Bytes: [
                    "PCFET0NUWVBFIGh0bWwgW10+CjxodG1sPgogIDxoZWFkPgogICAgPG1ldGEgY2hhcnNldD0iV2lu",
                    "ZG93cy0xMjUyIiAvPgogICAgPHRpdGxlPldlc3Rlcm4gRXVyb3BlYW4gKFdpbmRvd3MpPC90aXRs",
                    "ZT4KICA8L2hlYWQ+CiAgPGJvZHk+VGhpcyBpcyBhbiBleGFtcGxlPC9ib2R5Pgo8L2h0bWw+"
                ],
                expected: "<!DOCTYPE html []>\n<html>\n  <head>\n    <meta charset=\"Windows-1252\" />\n    <title>Western European (Windows)</title>\n  </head>\n  <body>This is an example</body>\n</html>"
            },
            ebcdic500: {
                b64Bytes: [
                    "TE/E1sPj6NfFQIijlJNASlpuJUyIo5STbiVAQEyIhYGEbiVAQEBATJSFo4FAg4iBmaKFo35/ycLU",
                    "9fDwf0BhbiVAQEBATKOJo5OFbsnC1EDFwsPEycNATcmVo4WZlYGjiZaVgZNdTGGjiaOThW4lQEBM",
                    "YYiFgYRuJUBATIKWhKhu44iJokCJokCBlUCFp4GUl5OFTGGCloSobiVMYYijlJNu"
                ],
                expected: "<!DOCTYPE html []>\n<html>\n  <head>\n    <meta charset=\"IBM500\" />\n    <title>IBM EBCDIC (International)</title>\n  </head>\n  <body>This is an example</body>\n</html>"
            },
            ebcdic1140: {
                b64Bytes: [
                    "TFrE1sPj6NfFQIijlJNAurtuJUyIo5STbiVAQEyIhYGEbiVAQEBATJSFo4FAg4iBmaKFo35/ycLU",
                    "8PHx9PB/QGFuJUBAQEBMo4mjk4VuycLUQMXCw8TJw0BN5OJgw4GVgYSBYMWkmZZdTGGjiaOThW4l",
                    "QEBMYYiFgYRuJUBATIKWhKhu44iJokCJokCBlUCFp4GUl5OFTGGCloSobiVMYYijlJNu"
                ],
                expected: "<!DOCTYPE html []>\n<html>\n  <head>\n    <meta charset=\"IBM01140\" />\n    <title>IBM EBCDIC (US-Canada-Euro)</title>\n  </head>\n  <body>This is an example</body>\n</html>"
            },
            ebcdic37: {
                b64Bytes: [
                    "TFrE1sPj6NfFQIijlJNAurtuJUyIo5STbiVAQEyIhYGEbiVAQEBATJSFo4FAg4iBmaKFo35/ycLU",
                    "8PP3f0BhbiVAQEBATKOJo5OFbsnC1EDFwsPEycNATeTiYMOBlYGEgV1MYaOJo5OFbiVAQExhiIWB",
                    "hG4lQEBMgpaEqG7jiImiQImiQIGVQIWngZSXk4VMYYKWhKhuJUxhiKOUk24="
                ],
                expected: "<!DOCTYPE html []>\n<html>\n  <head>\n    <meta charset=\"IBM037\" />\n    <title>IBM EBCDIC (US-Canada)</title>\n  </head>\n  <body>This is an example</body>\n</html>"
            }
        },
        crlf: {
            utf8: {
                b64Bytes: [
                    "PCFET0NUWVBFIGh0bWwgW10+DQo8aHRtbD4NCiAgPGhlYWQ+DQogICAgPG1ldGEgY2hhcnNldD0i",
                    "dXRmLTgiIC8+DQogICAgPHRpdGxlPlVuaWNvZGUgKFVURi04KTwvdGl0bGU+DQogIDwvaGVhZD4N",
                    "CiAgPGJvZHk+VGhpcyBpcyBhbiBleGFtcGxlPC9ib2R5Pg0KPC9odG1sPg=="
                ],
                expected: "<!DOCTYPE html []>\r\n<html>\r\n  <head>\r\n    <meta charset=\"utf-8\" />\r\n    <title>Unicode (UTF-8)</title>\r\n  </head>\r\n  <body>This is an example</body>\r\n</html>"
            },
            utf7: {
                b64Bytes: [
                    "K0FEd0FJUS1ET0NUWVBFIGh0bWwgK0FGc0FYUUErLQ0KK0FEdy1odG1sK0FENC0NCiAgK0FEdy1o",
                    "ZWFkK0FENC0NCiAgICArQUR3LW1ldGEgY2hhcnNldCtBRDBBSWctdXRmLTcrQUNJLSAvK0FENC0N",
                    "CiAgICArQUR3LXRpdGxlK0FENC1Vbmljb2RlIChVVEYtNykrQUR3LS90aXRsZStBRDQtDQogICtB",
                    "RHctL2hlYWQrQUQ0LQ0KICArQUR3LWJvZHkrQUQ0LVRoaXMgaXMgYW4gZXhhbXBsZStBRHctL2Jv",
                    "ZHkrQUQ0LQ0KK0FEdy0vaHRtbCtBRDQt"
                ],
                expected: "<!DOCTYPE html []>\r\n<html>\r\n  <head>\r\n    <meta charset=\"utf-7\" />\r\n    <title>Unicode (UTF-7)</title>\r\n  </head>\r\n  <body>This is an example</body>\r\n</html>"
            },
            ascii: {
                b64Bytes: [
                    "PCFET0NUWVBFIGh0bWwgW10+DQo8aHRtbD4NCiAgPGhlYWQ+DQogICAgPG1ldGEgY2hhcnNldD0i",
                    "dXMtYXNjaWkiIC8+DQogICAgPHRpdGxlPlVTLUFTQ0lJPC90aXRsZT4NCiAgPC9oZWFkPg0KICA8",
                    "Ym9keT5UaGlzIGlzIGFuIGV4YW1wbGU8L2JvZHk+DQo8L2h0bWw+"
                ],
                expected: "<!DOCTYPE html []>\r\n<html>\r\n  <head>\r\n    <meta charset=\"us-ascii\" />\r\n    <title>US-ASCII</title>\r\n  </head>\r\n  <body>This is an example</body>\r\n</html>"
            },
            utf16le: {
                b64Bytes: [
                    "PAAhAEQATwBDAFQAWQBQAEUAIABoAHQAbQBsACAAWwBdAD4ADQAKADwAaAB0AG0AbAA+AA0ACgAg",
                    "ACAAPABoAGUAYQBkAD4ADQAKACAAIAAgACAAPABtAGUAdABhACAAYwBoAGEAcgBzAGUAdAA9ACIA",
                    "dQB0AGYALQAxADYAIgAgAC8APgANAAoAIAAgACAAIAA8AHQAaQB0AGwAZQA+AFUAbgBpAGMAbwBk",
                    "AGUAPAAvAHQAaQB0AGwAZQA+AA0ACgAgACAAPAAvAGgAZQBhAGQAPgANAAoAIAAgADwAYgBvAGQA",
                    "eQA+AFQAaABpAHMAIABpAHMAIABhAG4AIABlAHgAYQBtAHAAbABlADwALwBiAG8AZAB5AD4ADQAK",
                    "ADwALwBoAHQAbQBsAD4A"
                ],
                expected: "<!DOCTYPE html []>\r\n<html>\r\n  <head>\r\n    <meta charset=\"utf-16\" />\r\n    <title>Unicode</title>\r\n  </head>\r\n  <body>This is an example</body>\r\n</html>"
            },
            utf16be: {
                b64Bytes: [
                    "ADwAIQBEAE8AQwBUAFkAUABFACAAaAB0AG0AbAAgAFsAXQA+AA0ACgA8AGgAdABtAGwAPgANAAoA",
                    "IAAgADwAaABlAGEAZAA+AA0ACgAgACAAIAAgADwAbQBlAHQAYQAgAGMAaABhAHIAcwBlAHQAPQAi",
                    "AHUAdABmAC0AMQA2AEIARQAiACAALwA+AA0ACgAgACAAIAAgADwAdABpAHQAbABlAD4AVQBuAGkA",
                    "YwBvAGQAZQAgACgAQgBpAGcALQBFAG4AZABpAGEAbgApADwALwB0AGkAdABsAGUAPgANAAoAIAAg",
                    "ADwALwBoAGUAYQBkAD4ADQAKACAAIAA8AGIAbwBkAHkAPgBUAGgAaQBzACAAaQBzACAAYQBuACAA",
                    "ZQB4AGEAbQBwAGwAZQA8AC8AYgBvAGQAeQA+AA0ACgA8AC8AaAB0AG0AbAA+"
                ],
                expected: "<!DOCTYPE html []>\r\n<html>\r\n  <head>\r\n    <meta charset=\"utf-16BE\" />\r\n    <title>Unicode (Big-Endian)</title>\r\n  </head>\r\n  <body>This is an example</body>\r\n</html>"
            },
            utf32le: {
                b64Bytes: [
                    "PAAAACEAAABEAAAATwAAAEMAAABUAAAAWQAAAFAAAABFAAAAIAAAAGgAAAB0AAAAbQAAAGwAAAAg",
                    "AAAAWwAAAF0AAAA+AAAADQAAAAoAAAA8AAAAaAAAAHQAAABtAAAAbAAAAD4AAAANAAAACgAAACAA",
                    "AAAgAAAAPAAAAGgAAABlAAAAYQAAAGQAAAA+AAAADQAAAAoAAAAgAAAAIAAAACAAAAAgAAAAPAAA",
                    "AG0AAABlAAAAdAAAAGEAAAAgAAAAYwAAAGgAAABhAAAAcgAAAHMAAABlAAAAdAAAAD0AAAAiAAAA",
                    "dQAAAHQAAABmAAAALQAAADMAAAAyAAAAIgAAACAAAAAvAAAAPgAAAA0AAAAKAAAAIAAAACAAAAAg",
                    "AAAAIAAAADwAAAB0AAAAaQAAAHQAAABsAAAAZQAAAD4AAABVAAAAbgAAAGkAAABjAAAAbwAAAGQA",
                    "AABlAAAAIAAAACgAAABVAAAAVAAAAEYAAAAtAAAAMwAAADIAAAApAAAAPAAAAC8AAAB0AAAAaQAA",
                    "AHQAAABsAAAAZQAAAD4AAAANAAAACgAAACAAAAAgAAAAPAAAAC8AAABoAAAAZQAAAGEAAABkAAAA",
                    "PgAAAA0AAAAKAAAAIAAAACAAAAA8AAAAYgAAAG8AAABkAAAAeQAAAD4AAABUAAAAaAAAAGkAAABz",
                    "AAAAIAAAAGkAAABzAAAAIAAAAGEAAABuAAAAIAAAAGUAAAB4AAAAYQAAAG0AAABwAAAAbAAAAGUA",
                    "AAA8AAAALwAAAGIAAABvAAAAZAAAAHkAAAA+AAAADQAAAAoAAAA8AAAALwAAAGgAAAB0AAAAbQAA",
                    "AGwAAAA+AAAA"
                ],
                expected: "<!DOCTYPE html []>\r\n<html>\r\n  <head>\r\n    <meta charset=\"utf-32\" />\r\n    <title>Unicode (UTF-32)</title>\r\n  </head>\r\n  <body>This is an example</body>\r\n</html>"
            },
            utf32be: {
                b64Bytes: [
                    "AAAAPAAAACEAAABEAAAATwAAAEMAAABUAAAAWQAAAFAAAABFAAAAIAAAAGgAAAB0AAAAbQAAAGwA",
                    "AAAgAAAAWwAAAF0AAAA+AAAADQAAAAoAAAA8AAAAaAAAAHQAAABtAAAAbAAAAD4AAAANAAAACgAA",
                    "ACAAAAAgAAAAPAAAAGgAAABlAAAAYQAAAGQAAAA+AAAADQAAAAoAAAAgAAAAIAAAACAAAAAgAAAA",
                    "PAAAAG0AAABlAAAAdAAAAGEAAAAgAAAAYwAAAGgAAABhAAAAcgAAAHMAAABlAAAAdAAAAD0AAAAi",
                    "AAAAdQAAAHQAAABmAAAALQAAADMAAAAyAAAAQgAAAEUAAAAiAAAAIAAAAC8AAAA+AAAADQAAAAoA",
                    "AAAgAAAAIAAAACAAAAAgAAAAPAAAAHQAAABpAAAAdAAAAGwAAABlAAAAPgAAAFUAAABuAAAAaQAA",
                    "AGMAAABvAAAAZAAAAGUAAAAgAAAAKAAAAFUAAABUAAAARgAAAC0AAAAzAAAAMgAAACAAAABCAAAA",
                    "aQAAAGcAAAAtAAAARQAAAG4AAABkAAAAaQAAAGEAAABuAAAAKQAAADwAAAAvAAAAdAAAAGkAAAB0",
                    "AAAAbAAAAGUAAAA+AAAADQAAAAoAAAAgAAAAIAAAADwAAAAvAAAAaAAAAGUAAABhAAAAZAAAAD4A",
                    "AAANAAAACgAAACAAAAAgAAAAPAAAAGIAAABvAAAAZAAAAHkAAAA+AAAAVAAAAGgAAABpAAAAcwAA",
                    "ACAAAABpAAAAcwAAACAAAABhAAAAbgAAACAAAABlAAAAeAAAAGEAAABtAAAAcAAAAGwAAABlAAAA",
                    "PAAAAC8AAABiAAAAbwAAAGQAAAB5AAAAPgAAAA0AAAAKAAAAPAAAAC8AAABoAAAAdAAAAG0AAABs",
                    "AAAAPg=="
                ],
                expected: "<!DOCTYPE html []>\r\n<html>\r\n  <head>\r\n    <meta charset=\"utf-32BE\" />\r\n    <title>Unicode (UTF-32 Big-Endian)</title>\r\n  </head>\r\n  <body>This is an example</body>\r\n</html>"
            },
            latin1: {
                b64Bytes: [
                    "PCFET0NUWVBFIGh0bWwgW10+DQo8aHRtbD4NCiAgPGhlYWQ+DQogICAgPG1ldGEgY2hhcnNldD0i",
                    "aXNvLTg4NTktMSIgLz4NCiAgICA8dGl0bGU+V2VzdGVybiBFdXJvcGVhbiAoSVNPKTwvdGl0bGU+",
                    "DQogIDwvaGVhZD4NCiAgPGJvZHk+VGhpcyBpcyBhbiBleGFtcGxlPC9ib2R5Pg0KPC9odG1sPg=="
                ],
                expected: "<!DOCTYPE html []>\r\n<html>\r\n  <head>\r\n    <meta charset=\"iso-8859-1\" />\r\n    <title>Western European (ISO)</title>\r\n  </head>\r\n  <body>This is an example</body>\r\n</html>"
            },
            windows: {
                b64Bytes: [
                    "PCFET0NUWVBFIGh0bWwgW10+DQo8aHRtbD4NCiAgPGhlYWQ+DQogICAgPG1ldGEgY2hhcnNldD0i",
                    "V2luZG93cy0xMjUyIiAvPg0KICAgIDx0aXRsZT5XZXN0ZXJuIEV1cm9wZWFuIChXaW5kb3dzKTwv",
                    "dGl0bGU+DQogIDwvaGVhZD4NCiAgPGJvZHk+VGhpcyBpcyBhbiBleGFtcGxlPC9ib2R5Pg0KPC9o",
                    "dG1sPg=="
                ],
                expected: "<!DOCTYPE html []>\r\n<html>\r\n  <head>\r\n    <meta charset=\"Windows-1252\" />\r\n    <title>Western European (Windows)</title>\r\n  </head>\r\n  <body>This is an example</body>\r\n</html>"
            },
            ebcdic500: {
                b64Bytes: [
                    "TE/E1sPj6NfFQIijlJNASlpuDSVMiKOUk24NJUBATIiFgYRuDSVAQEBATJSFo4FAg4iBmaKFo35/",
                    "ycLU9fDwf0Bhbg0lQEBAQEyjiaOThW7JwtRAxcLDxMnDQE3JlaOFmZWBo4mWlYGTXUxho4mjk4Vu",
                    "DSVAQExhiIWBhG4NJUBATIKWhKhu44iJokCJokCBlUCFp4GUl5OFTGGCloSobg0lTGGIo5STbg=="
                ],
                expected: "<!DOCTYPE html []>\r\n<html>\r\n  <head>\r\n    <meta charset=\"IBM500\" />\r\n    <title>IBM EBCDIC (International)</title>\r\n  </head>\r\n  <body>This is an example</body>\r\n</html>"
            },
            ebcdic1140: {
                b64Bytes: [
                    "TFrE1sPj6NfFQIijlJNAurtuDSVMiKOUk24NJUBATIiFgYRuDSVAQEBATJSFo4FAg4iBmaKFo35/",
                    "ycLU8PHx9PB/QGFuDSVAQEBATKOJo5OFbsnC1EDFwsPEycNATeTiYMOBlYGEgWDFpJmWXUxho4mj",
                    "k4VuDSVAQExhiIWBhG4NJUBATIKWhKhu44iJokCJokCBlUCFp4GUl5OFTGGCloSobg0lTGGIo5ST",
                    "bg=="
                ],
                expected: "<!DOCTYPE html []>\r\n<html>\r\n  <head>\r\n    <meta charset=\"IBM01140\" />\r\n    <title>IBM EBCDIC (US-Canada-Euro)</title>\r\n  </head>\r\n  <body>This is an example</body>\r\n</html>"
            },
            ebcdic37: {
                b64Bytes: [
                    "TFrE1sPj6NfFQIijlJNAurtuDSVMiKOUk24NJUBATIiFgYRuDSVAQEBATJSFo4FAg4iBmaKFo35/",
                    "ycLU8PP3f0Bhbg0lQEBAQEyjiaOThW7JwtRAxcLDxMnDQE3k4mDDgZWBhIFdTGGjiaOThW4NJUBA",
                    "TGGIhYGEbg0lQEBMgpaEqG7jiImiQImiQIGVQIWngZSXk4VMYYKWhKhuDSVMYYijlJNu"
                ],
                expected: "<!DOCTYPE html []>\r\n<html>\r\n  <head>\r\n    <meta charset=\"IBM037\" />\r\n    <title>IBM EBCDIC (US-Canada)</title>\r\n  </head>\r\n  <body>This is an example</body>\r\n</html>"
            }
        },
        cr: {
            utf8: {
                b64Bytes: [
                    "PCFET0NUWVBFIGh0bWwgW10+CjxodG1sPgogIDxoZWFkPgogICAgPG1ldGEgY2hhcnNldD0idXRm",
                    "LTgiIC8+CiAgICA8dGl0bGU+VW5pY29kZSAoVVRGLTgpPC90aXRsZT4KICA8L2hlYWQ+CiAgPGJv",
                    "ZHk+VGhpcyBpcyBhbiBleGFtcGxlPC9ib2R5Pgo8L2h0bWw+"
                ],
                expected: "<!DOCTYPE html []>\n<html>\n  <head>\n    <meta charset=\"utf-8\" />\n    <title>Unicode (UTF-8)</title>\n  </head>\n  <body>This is an example</body>\n</html>"
            },
            utf7: {
                b64Bytes: [
                    "K0FEd0FJUS1ET0NUWVBFIGh0bWwgK0FGc0FYUUErLQorQUR3LWh0bWwrQUQ0LQogICtBRHctaGVh",
                    "ZCtBRDQtCiAgICArQUR3LW1ldGEgY2hhcnNldCtBRDBBSWctdXRmLTcrQUNJLSAvK0FENC0KICAg",
                    "ICtBRHctdGl0bGUrQUQ0LVVuaWNvZGUgKFVURi03KStBRHctL3RpdGxlK0FENC0KICArQUR3LS9o",
                    "ZWFkK0FENC0KICArQUR3LWJvZHkrQUQ0LVRoaXMgaXMgYW4gZXhhbXBsZStBRHctL2JvZHkrQUQ0",
                    "LQorQUR3LS9odG1sK0FENC0="
                ],
                expected: "<!DOCTYPE html []>\n<html>\n  <head>\n    <meta charset=\"utf-7\" />\n    <title>Unicode (UTF-7)</title>\n  </head>\n  <body>This is an example</body>\n</html>"
            },
            ascii: {
                b64Bytes: [
                    "PCFET0NUWVBFIGh0bWwgW10+CjxodG1sPgogIDxoZWFkPgogICAgPG1ldGEgY2hhcnNldD0idXMt",
                    "YXNjaWkiIC8+CiAgICA8dGl0bGU+VVMtQVNDSUk8L3RpdGxlPgogIDwvaGVhZD4KICA8Ym9keT5U",
                    "aGlzIGlzIGFuIGV4YW1wbGU8L2JvZHk+CjwvaHRtbD4="
                ],
                expected: "<!DOCTYPE html []>\n<html>\n  <head>\n    <meta charset=\"us-ascii\" />\n    <title>US-ASCII</title>\n  </head>\n  <body>This is an example</body>\n</html>"
            },
            utf16le: {
                b64Bytes: [
                    "PAAhAEQATwBDAFQAWQBQAEUAIABoAHQAbQBsACAAWwBdAD4ACgA8AGgAdABtAGwAPgAKACAAIAA8",
                    "AGgAZQBhAGQAPgAKACAAIAAgACAAPABtAGUAdABhACAAYwBoAGEAcgBzAGUAdAA9ACIAdQB0AGYA",
                    "LQAxADYAIgAgAC8APgAKACAAIAAgACAAPAB0AGkAdABsAGUAPgBVAG4AaQBjAG8AZABlADwALwB0",
                    "AGkAdABsAGUAPgAKACAAIAA8AC8AaABlAGEAZAA+AAoAIAAgADwAYgBvAGQAeQA+AFQAaABpAHMA",
                    "IABpAHMAIABhAG4AIABlAHgAYQBtAHAAbABlADwALwBiAG8AZAB5AD4ACgA8AC8AaAB0AG0AbAA+",
                    "AA=="
                ],
                expected: "<!DOCTYPE html []>\n<html>\n  <head>\n    <meta charset=\"utf-16\" />\n    <title>Unicode</title>\n  </head>\n  <body>This is an example</body>\n</html>"
            },
            utf16be: {
                b64Bytes: [
                    "ADwAIQBEAE8AQwBUAFkAUABFACAAaAB0AG0AbAAgAFsAXQA+AAoAPABoAHQAbQBsAD4ACgAgACAA",
                    "PABoAGUAYQBkAD4ACgAgACAAIAAgADwAbQBlAHQAYQAgAGMAaABhAHIAcwBlAHQAPQAiAHUAdABm",
                    "AC0AMQA2AEIARQAiACAALwA+AAoAIAAgACAAIAA8AHQAaQB0AGwAZQA+AFUAbgBpAGMAbwBkAGUA",
                    "IAAoAEIAaQBnAC0ARQBuAGQAaQBhAG4AKQA8AC8AdABpAHQAbABlAD4ACgAgACAAPAAvAGgAZQBh",
                    "AGQAPgAKACAAIAA8AGIAbwBkAHkAPgBUAGgAaQBzACAAaQBzACAAYQBuACAAZQB4AGEAbQBwAGwA",
                    "ZQA8AC8AYgBvAGQAeQA+AAoAPAAvAGgAdABtAGwAPg=="
                ],
                expected: "<!DOCTYPE html []>\n<html>\n  <head>\n    <meta charset=\"utf-16BE\" />\n    <title>Unicode (Big-Endian)</title>\n  </head>\n  <body>This is an example</body>\n</html>"
            },
            utf32le: {
                b64Bytes: [
                    "PAAAACEAAABEAAAATwAAAEMAAABUAAAAWQAAAFAAAABFAAAAIAAAAGgAAAB0AAAAbQAAAGwAAAAg",
                    "AAAAWwAAAF0AAAA+AAAACgAAADwAAABoAAAAdAAAAG0AAABsAAAAPgAAAAoAAAAgAAAAIAAAADwA",
                    "AABoAAAAZQAAAGEAAABkAAAAPgAAAAoAAAAgAAAAIAAAACAAAAAgAAAAPAAAAG0AAABlAAAAdAAA",
                    "AGEAAAAgAAAAYwAAAGgAAABhAAAAcgAAAHMAAABlAAAAdAAAAD0AAAAiAAAAdQAAAHQAAABmAAAA",
                    "LQAAADMAAAAyAAAAIgAAACAAAAAvAAAAPgAAAAoAAAAgAAAAIAAAACAAAAAgAAAAPAAAAHQAAABp",
                    "AAAAdAAAAGwAAABlAAAAPgAAAFUAAABuAAAAaQAAAGMAAABvAAAAZAAAAGUAAAAgAAAAKAAAAFUA",
                    "AABUAAAARgAAAC0AAAAzAAAAMgAAACkAAAA8AAAALwAAAHQAAABpAAAAdAAAAGwAAABlAAAAPgAA",
                    "AAoAAAAgAAAAIAAAADwAAAAvAAAAaAAAAGUAAABhAAAAZAAAAD4AAAAKAAAAIAAAACAAAAA8AAAA",
                    "YgAAAG8AAABkAAAAeQAAAD4AAABUAAAAaAAAAGkAAABzAAAAIAAAAGkAAABzAAAAIAAAAGEAAABu",
                    "AAAAIAAAAGUAAAB4AAAAYQAAAG0AAABwAAAAbAAAAGUAAAA8AAAALwAAAGIAAABvAAAAZAAAAHkA",
                    "AAA+AAAACgAAADwAAAAvAAAAaAAAAHQAAABtAAAAbAAAAD4AAAA="
                ],
                expected: "<!DOCTYPE html []>\n<html>\n  <head>\n    <meta charset=\"utf-32\" />\n    <title>Unicode (UTF-32)</title>\n  </head>\n  <body>This is an example</body>\n</html>"
            },
            utf32be: {
                b64Bytes: [
                    "AAAAPAAAACEAAABEAAAATwAAAEMAAABUAAAAWQAAAFAAAABFAAAAIAAAAGgAAAB0AAAAbQAAAGwA",
                    "AAAgAAAAWwAAAF0AAAA+AAAACgAAADwAAABoAAAAdAAAAG0AAABsAAAAPgAAAAoAAAAgAAAAIAAA",
                    "ADwAAABoAAAAZQAAAGEAAABkAAAAPgAAAAoAAAAgAAAAIAAAACAAAAAgAAAAPAAAAG0AAABlAAAA",
                    "dAAAAGEAAAAgAAAAYwAAAGgAAABhAAAAcgAAAHMAAABlAAAAdAAAAD0AAAAiAAAAdQAAAHQAAABm",
                    "AAAALQAAADMAAAAyAAAAQgAAAEUAAAAiAAAAIAAAAC8AAAA+AAAACgAAACAAAAAgAAAAIAAAACAA",
                    "AAA8AAAAdAAAAGkAAAB0AAAAbAAAAGUAAAA+AAAAVQAAAG4AAABpAAAAYwAAAG8AAABkAAAAZQAA",
                    "ACAAAAAoAAAAVQAAAFQAAABGAAAALQAAADMAAAAyAAAAIAAAAEIAAABpAAAAZwAAAC0AAABFAAAA",
                    "bgAAAGQAAABpAAAAYQAAAG4AAAApAAAAPAAAAC8AAAB0AAAAaQAAAHQAAABsAAAAZQAAAD4AAAAK",
                    "AAAAIAAAACAAAAA8AAAALwAAAGgAAABlAAAAYQAAAGQAAAA+AAAACgAAACAAAAAgAAAAPAAAAGIA",
                    "AABvAAAAZAAAAHkAAAA+AAAAVAAAAGgAAABpAAAAcwAAACAAAABpAAAAcwAAACAAAABhAAAAbgAA",
                    "ACAAAABlAAAAeAAAAGEAAABtAAAAcAAAAGwAAABlAAAAPAAAAC8AAABiAAAAbwAAAGQAAAB5AAAA",
                    "PgAAAAoAAAA8AAAALwAAAGgAAAB0AAAAbQAAAGwAAAA+"
                ],
                expected: "<!DOCTYPE html []>\n<html>\n  <head>\n    <meta charset=\"utf-32BE\" />\n    <title>Unicode (UTF-32 Big-Endian)</title>\n  </head>\n  <body>This is an example</body>\n</html>"
            },
            latin1: {
                b64Bytes: [
                    "PCFET0NUWVBFIGh0bWwgW10+CjxodG1sPgogIDxoZWFkPgogICAgPG1ldGEgY2hhcnNldD0iaXNv",
                    "LTg4NTktMSIgLz4KICAgIDx0aXRsZT5XZXN0ZXJuIEV1cm9wZWFuIChJU08pPC90aXRsZT4KICA8",
                    "L2hlYWQ+CiAgPGJvZHk+VGhpcyBpcyBhbiBleGFtcGxlPC9ib2R5Pgo8L2h0bWw+"
                ],
                expected: "<!DOCTYPE html []>\n<html>\n  <head>\n    <meta charset=\"iso-8859-1\" />\n    <title>Western European (ISO)</title>\n  </head>\n  <body>This is an example</body>\n</html>"
            },
            windows: {
                b64Bytes: [
                    "PCFET0NUWVBFIGh0bWwgW10+CjxodG1sPgogIDxoZWFkPgogICAgPG1ldGEgY2hhcnNldD0iV2lu",
                    "ZG93cy0xMjUyIiAvPgogICAgPHRpdGxlPldlc3Rlcm4gRXVyb3BlYW4gKFdpbmRvd3MpPC90aXRs",
                    "ZT4KICA8L2hlYWQ+CiAgPGJvZHk+VGhpcyBpcyBhbiBleGFtcGxlPC9ib2R5Pgo8L2h0bWw+"
                ],
                expected: "<!DOCTYPE html []>\n<html>\n  <head>\n    <meta charset=\"Windows-1252\" />\n    <title>Western European (Windows)</title>\n  </head>\n  <body>This is an example</body>\n</html>"
            },
            ebcdic500: {
                b64Bytes: [
                    "TE/E1sPj6NfFQIijlJNASlpuJUyIo5STbiVAQEyIhYGEbiVAQEBATJSFo4FAg4iBmaKFo35/ycLU",
                    "9fDwf0BhbiVAQEBATKOJo5OFbsnC1EDFwsPEycNATcmVo4WZlYGjiZaVgZNdTGGjiaOThW4lQEBM",
                    "YYiFgYRuJUBATIKWhKhu44iJokCJokCBlUCFp4GUl5OFTGGCloSobiVMYYijlJNu"
                ],
                expected: "<!DOCTYPE html []>\n<html>\n  <head>\n    <meta charset=\"IBM500\" />\n    <title>IBM EBCDIC (International)</title>\n  </head>\n  <body>This is an example</body>\n</html>"
            },
            ebcdic1140: {
                b64Bytes: [
                    "TFrE1sPj6NfFQIijlJNAurtuJUyIo5STbiVAQEyIhYGEbiVAQEBATJSFo4FAg4iBmaKFo35/ycLU",
                    "8PHx9PB/QGFuJUBAQEBMo4mjk4VuycLUQMXCw8TJw0BN5OJgw4GVgYSBYMWkmZZdTGGjiaOThW4l",
                    "QEBMYYiFgYRuJUBATIKWhKhu44iJokCJokCBlUCFp4GUl5OFTGGCloSobiVMYYijlJNu"
                ],
                expected: "<!DOCTYPE html []>\n<html>\n  <head>\n    <meta charset=\"IBM01140\" />\n    <title>IBM EBCDIC (US-Canada-Euro)</title>\n  </head>\n  <body>This is an example</body>\n</html>"
            },
            ebcdic37: {
                b64Bytes: [
                    "TFrE1sPj6NfFQIijlJNAurtuJUyIo5STbiVAQEyIhYGEbiVAQEBATJSFo4FAg4iBmaKFo35/ycLU",
                    "8PP3f0BhbiVAQEBATKOJo5OFbsnC1EDFwsPEycNATeTiYMOBlYGEgV1MYaOJo5OFbiVAQExhiIWB",
                    "hG4lQEBMgpaEqG7jiImiQImiQIGVQIWngZSXk4VMYYKWhKhuJUxhiKOUk24="
                ],
                expected: "<!DOCTYPE html []>\n<html>\n  <head>\n    <meta charset=\"IBM037\" />\n    <title>IBM EBCDIC (US-Canada)</title>\n  </head>\n  <body>This is an example</body>\n</html>"
            }
        }
    },
    withBOM: {
        lf: {
            utf16le: {
                b64Bytes: [
                    "//48ACEARABPAEMAVABZAFAARQAgAGgAdABtAGwAIABbAF0APgAKADwAaAB0AG0AbAA+AAoAIAAg",
                    "ADwAaABlAGEAZAA+AAoAIAAgACAAIAA8AG0AZQB0AGEAIABjAGgAYQByAHMAZQB0AD0AIgB1AHQA",
                    "ZgAtADEANgAiACAALwA+AAoAIAAgACAAIAA8AHQAaQB0AGwAZQA+AFUAbgBpAGMAbwBkAGUAPAAv",
                    "AHQAaQB0AGwAZQA+AAoAIAAgADwALwBoAGUAYQBkAD4ACgAgACAAPABiAG8AZAB5AD4AVABoAGkA",
                    "cwAgAGkAcwAgAGEAbgAgAGUAeABhAG0AcABsAGUAPAAvAGIAbwBkAHkAPgAKADwALwBoAHQAbQBs",
                    "AD4A"
                ],
                expected: "<!DOCTYPE html []>\n<html>\n  <head>\n    <meta charset=\"utf-16\" />\n    <title>Unicode</title>\n  </head>\n  <body>This is an example</body>\n</html>"
            },
            utf16be: {
                b64Bytes: [
                    "/v8APAAhAEQATwBDAFQAWQBQAEUAIABoAHQAbQBsACAAWwBdAD4ACgA8AGgAdABtAGwAPgAKACAA",
                    "IAA8AGgAZQBhAGQAPgAKACAAIAAgACAAPABtAGUAdABhACAAYwBoAGEAcgBzAGUAdAA9ACIAdQB0",
                    "AGYALQAxADYAQgBFACIAIAAvAD4ACgAgACAAIAAgADwAdABpAHQAbABlAD4AVQBuAGkAYwBvAGQA",
                    "ZQAgACgAQgBpAGcALQBFAG4AZABpAGEAbgApADwALwB0AGkAdABsAGUAPgAKACAAIAA8AC8AaABl",
                    "AGEAZAA+AAoAIAAgADwAYgBvAGQAeQA+AFQAaABpAHMAIABpAHMAIABhAG4AIABlAHgAYQBtAHAA",
                    "bABlADwALwBiAG8AZAB5AD4ACgA8AC8AaAB0AG0AbAA+"
                ],
                expected: "<!DOCTYPE html []>\n<html>\n  <head>\n    <meta charset=\"utf-16BE\" />\n    <title>Unicode (Big-Endian)</title>\n  </head>\n  <body>This is an example</body>\n</html>"
            },
            utf32le: {
                b64Bytes: [
                    "//4AADwAAAAhAAAARAAAAE8AAABDAAAAVAAAAFkAAABQAAAARQAAACAAAABoAAAAdAAAAG0AAABs",
                    "AAAAIAAAAFsAAABdAAAAPgAAAAoAAAA8AAAAaAAAAHQAAABtAAAAbAAAAD4AAAAKAAAAIAAAACAA",
                    "AAA8AAAAaAAAAGUAAABhAAAAZAAAAD4AAAAKAAAAIAAAACAAAAAgAAAAIAAAADwAAABtAAAAZQAA",
                    "AHQAAABhAAAAIAAAAGMAAABoAAAAYQAAAHIAAABzAAAAZQAAAHQAAAA9AAAAIgAAAHUAAAB0AAAA",
                    "ZgAAAC0AAAAzAAAAMgAAACIAAAAgAAAALwAAAD4AAAAKAAAAIAAAACAAAAAgAAAAIAAAADwAAAB0",
                    "AAAAaQAAAHQAAABsAAAAZQAAAD4AAABVAAAAbgAAAGkAAABjAAAAbwAAAGQAAABlAAAAIAAAACgA",
                    "AABVAAAAVAAAAEYAAAAtAAAAMwAAADIAAAApAAAAPAAAAC8AAAB0AAAAaQAAAHQAAABsAAAAZQAA",
                    "AD4AAAAKAAAAIAAAACAAAAA8AAAALwAAAGgAAABlAAAAYQAAAGQAAAA+AAAACgAAACAAAAAgAAAA",
                    "PAAAAGIAAABvAAAAZAAAAHkAAAA+AAAAVAAAAGgAAABpAAAAcwAAACAAAABpAAAAcwAAACAAAABh",
                    "AAAAbgAAACAAAABlAAAAeAAAAGEAAABtAAAAcAAAAGwAAABlAAAAPAAAAC8AAABiAAAAbwAAAGQA",
                    "AAB5AAAAPgAAAAoAAAA8AAAALwAAAGgAAAB0AAAAbQAAAGwAAAA+AAAA"
                ],
                expected: "<!DOCTYPE html []>\n<html>\n  <head>\n    <meta charset=\"utf-32\" />\n    <title>Unicode (UTF-32)</title>\n  </head>\n  <body>This is an example</body>\n</html>"
            },
            utf32be: {
                b64Bytes: [
                    "AAD+/wAAADwAAAAhAAAARAAAAE8AAABDAAAAVAAAAFkAAABQAAAARQAAACAAAABoAAAAdAAAAG0A",
                    "AABsAAAAIAAAAFsAAABdAAAAPgAAAAoAAAA8AAAAaAAAAHQAAABtAAAAbAAAAD4AAAAKAAAAIAAA",
                    "ACAAAAA8AAAAaAAAAGUAAABhAAAAZAAAAD4AAAAKAAAAIAAAACAAAAAgAAAAIAAAADwAAABtAAAA",
                    "ZQAAAHQAAABhAAAAIAAAAGMAAABoAAAAYQAAAHIAAABzAAAAZQAAAHQAAAA9AAAAIgAAAHUAAAB0",
                    "AAAAZgAAAC0AAAAzAAAAMgAAAEIAAABFAAAAIgAAACAAAAAvAAAAPgAAAAoAAAAgAAAAIAAAACAA",
                    "AAAgAAAAPAAAAHQAAABpAAAAdAAAAGwAAABlAAAAPgAAAFUAAABuAAAAaQAAAGMAAABvAAAAZAAA",
                    "AGUAAAAgAAAAKAAAAFUAAABUAAAARgAAAC0AAAAzAAAAMgAAACAAAABCAAAAaQAAAGcAAAAtAAAA",
                    "RQAAAG4AAABkAAAAaQAAAGEAAABuAAAAKQAAADwAAAAvAAAAdAAAAGkAAAB0AAAAbAAAAGUAAAA+",
                    "AAAACgAAACAAAAAgAAAAPAAAAC8AAABoAAAAZQAAAGEAAABkAAAAPgAAAAoAAAAgAAAAIAAAADwA",
                    "AABiAAAAbwAAAGQAAAB5AAAAPgAAAFQAAABoAAAAaQAAAHMAAAAgAAAAaQAAAHMAAAAgAAAAYQAA",
                    "AG4AAAAgAAAAZQAAAHgAAABhAAAAbQAAAHAAAABsAAAAZQAAADwAAAAvAAAAYgAAAG8AAABkAAAA",
                    "eQAAAD4AAAAKAAAAPAAAAC8AAABoAAAAdAAAAG0AAABsAAAAPg=="
                ],
                expected: "<!DOCTYPE html []>\n<html>\n  <head>\n    <meta charset=\"utf-32BE\" />\n    <title>Unicode (UTF-32 Big-Endian)</title>\n  </head>\n  <body>This is an example</body>\n</html>"
            },
            utf8: {
                b64Bytes: [
                    "77u/PCFET0NUWVBFIGh0bWwgW10+CjxodG1sPgogIDxoZWFkPgogICAgPG1ldGEgY2hhcnNldD0i",
                    "dXRmLTgiIC8+CiAgICA8dGl0bGU+VW5pY29kZSAoVVRGLTgpPC90aXRsZT4KICA8L2hlYWQ+CiAg",
                    "PGJvZHk+VGhpcyBpcyBhbiBleGFtcGxlPC9ib2R5Pgo8L2h0bWw+"
                ],
                expected: "<!DOCTYPE html []>\n<html>\n  <head>\n    <meta charset=\"utf-8\" />\n    <title>Unicode (UTF-8)</title>\n  </head>\n  <body>This is an example</body>\n</html>"
            }
        },
        crlf: {
            utf16le: {
                b64Bytes: [
                    "//48ACEARABPAEMAVABZAFAARQAgAGgAdABtAGwAIABbAF0APgANAAoAPABoAHQAbQBsAD4ADQAK",
                    "ACAAIAA8AGgAZQBhAGQAPgANAAoAIAAgACAAIAA8AG0AZQB0AGEAIABjAGgAYQByAHMAZQB0AD0A",
                    "IgB1AHQAZgAtADEANgAiACAALwA+AA0ACgAgACAAIAAgADwAdABpAHQAbABlAD4AVQBuAGkAYwBv",
                    "AGQAZQA8AC8AdABpAHQAbABlAD4ADQAKACAAIAA8AC8AaABlAGEAZAA+AA0ACgAgACAAPABiAG8A",
                    "ZAB5AD4AVABoAGkAcwAgAGkAcwAgAGEAbgAgAGUAeABhAG0AcABsAGUAPAAvAGIAbwBkAHkAPgAN",
                    "AAoAPAAvAGgAdABtAGwAPgA="
                ],
                expected: "<!DOCTYPE html []>\r\n<html>\r\n  <head>\r\n    <meta charset=\"utf-16\" />\r\n    <title>Unicode</title>\r\n  </head>\r\n  <body>This is an example</body>\r\n</html>"
            },
            utf16be: {
                b64Bytes: [
                    "/v8APAAhAEQATwBDAFQAWQBQAEUAIABoAHQAbQBsACAAWwBdAD4ADQAKADwAaAB0AG0AbAA+AA0A",
                    "CgAgACAAPABoAGUAYQBkAD4ADQAKACAAIAAgACAAPABtAGUAdABhACAAYwBoAGEAcgBzAGUAdAA9",
                    "ACIAdQB0AGYALQAxADYAQgBFACIAIAAvAD4ADQAKACAAIAAgACAAPAB0AGkAdABsAGUAPgBVAG4A",
                    "aQBjAG8AZABlACAAKABCAGkAZwAtAEUAbgBkAGkAYQBuACkAPAAvAHQAaQB0AGwAZQA+AA0ACgAg",
                    "ACAAPAAvAGgAZQBhAGQAPgANAAoAIAAgADwAYgBvAGQAeQA+AFQAaABpAHMAIABpAHMAIABhAG4A",
                    "IABlAHgAYQBtAHAAbABlADwALwBiAG8AZAB5AD4ADQAKADwALwBoAHQAbQBsAD4="
                ],
                expected: "<!DOCTYPE html []>\r\n<html>\r\n  <head>\r\n    <meta charset=\"utf-16BE\" />\r\n    <title>Unicode (Big-Endian)</title>\r\n  </head>\r\n  <body>This is an example</body>\r\n</html>"
            },
            utf32le: {
                b64Bytes: [
                    "//4AADwAAAAhAAAARAAAAE8AAABDAAAAVAAAAFkAAABQAAAARQAAACAAAABoAAAAdAAAAG0AAABs",
                    "AAAAIAAAAFsAAABdAAAAPgAAAA0AAAAKAAAAPAAAAGgAAAB0AAAAbQAAAGwAAAA+AAAADQAAAAoA",
                    "AAAgAAAAIAAAADwAAABoAAAAZQAAAGEAAABkAAAAPgAAAA0AAAAKAAAAIAAAACAAAAAgAAAAIAAA",
                    "ADwAAABtAAAAZQAAAHQAAABhAAAAIAAAAGMAAABoAAAAYQAAAHIAAABzAAAAZQAAAHQAAAA9AAAA",
                    "IgAAAHUAAAB0AAAAZgAAAC0AAAAzAAAAMgAAACIAAAAgAAAALwAAAD4AAAANAAAACgAAACAAAAAg",
                    "AAAAIAAAACAAAAA8AAAAdAAAAGkAAAB0AAAAbAAAAGUAAAA+AAAAVQAAAG4AAABpAAAAYwAAAG8A",
                    "AABkAAAAZQAAACAAAAAoAAAAVQAAAFQAAABGAAAALQAAADMAAAAyAAAAKQAAADwAAAAvAAAAdAAA",
                    "AGkAAAB0AAAAbAAAAGUAAAA+AAAADQAAAAoAAAAgAAAAIAAAADwAAAAvAAAAaAAAAGUAAABhAAAA",
                    "ZAAAAD4AAAANAAAACgAAACAAAAAgAAAAPAAAAGIAAABvAAAAZAAAAHkAAAA+AAAAVAAAAGgAAABp",
                    "AAAAcwAAACAAAABpAAAAcwAAACAAAABhAAAAbgAAACAAAABlAAAAeAAAAGEAAABtAAAAcAAAAGwA",
                    "AABlAAAAPAAAAC8AAABiAAAAbwAAAGQAAAB5AAAAPgAAAA0AAAAKAAAAPAAAAC8AAABoAAAAdAAA",
                    "AG0AAABsAAAAPgAAAA=="
                ],
                expected: "<!DOCTYPE html []>\r\n<html>\r\n  <head>\r\n    <meta charset=\"utf-32\" />\r\n    <title>Unicode (UTF-32)</title>\r\n  </head>\r\n  <body>This is an example</body>\r\n</html>"
            },
            utf32be: {
                b64Bytes: [
                    "AAD+/wAAADwAAAAhAAAARAAAAE8AAABDAAAAVAAAAFkAAABQAAAARQAAACAAAABoAAAAdAAAAG0A",
                    "AABsAAAAIAAAAFsAAABdAAAAPgAAAA0AAAAKAAAAPAAAAGgAAAB0AAAAbQAAAGwAAAA+AAAADQAA",
                    "AAoAAAAgAAAAIAAAADwAAABoAAAAZQAAAGEAAABkAAAAPgAAAA0AAAAKAAAAIAAAACAAAAAgAAAA",
                    "IAAAADwAAABtAAAAZQAAAHQAAABhAAAAIAAAAGMAAABoAAAAYQAAAHIAAABzAAAAZQAAAHQAAAA9",
                    "AAAAIgAAAHUAAAB0AAAAZgAAAC0AAAAzAAAAMgAAAEIAAABFAAAAIgAAACAAAAAvAAAAPgAAAA0A",
                    "AAAKAAAAIAAAACAAAAAgAAAAIAAAADwAAAB0AAAAaQAAAHQAAABsAAAAZQAAAD4AAABVAAAAbgAA",
                    "AGkAAABjAAAAbwAAAGQAAABlAAAAIAAAACgAAABVAAAAVAAAAEYAAAAtAAAAMwAAADIAAAAgAAAA",
                    "QgAAAGkAAABnAAAALQAAAEUAAABuAAAAZAAAAGkAAABhAAAAbgAAACkAAAA8AAAALwAAAHQAAABp",
                    "AAAAdAAAAGwAAABlAAAAPgAAAA0AAAAKAAAAIAAAACAAAAA8AAAALwAAAGgAAABlAAAAYQAAAGQA",
                    "AAA+AAAADQAAAAoAAAAgAAAAIAAAADwAAABiAAAAbwAAAGQAAAB5AAAAPgAAAFQAAABoAAAAaQAA",
                    "AHMAAAAgAAAAaQAAAHMAAAAgAAAAYQAAAG4AAAAgAAAAZQAAAHgAAABhAAAAbQAAAHAAAABsAAAA",
                    "ZQAAADwAAAAvAAAAYgAAAG8AAABkAAAAeQAAAD4AAAANAAAACgAAADwAAAAvAAAAaAAAAHQAAABt",
                    "AAAAbAAAAD4="
                ],
                expected: "<!DOCTYPE html []>\r\n<html>\r\n  <head>\r\n    <meta charset=\"utf-32BE\" />\r\n    <title>Unicode (UTF-32 Big-Endian)</title>\r\n  </head>\r\n  <body>This is an example</body>\r\n</html>"
            },
            utf8: {
                b64Bytes: [
                    "77u/PCFET0NUWVBFIGh0bWwgW10+DQo8aHRtbD4NCiAgPGhlYWQ+DQogICAgPG1ldGEgY2hhcnNl",
                    "dD0idXRmLTgiIC8+DQogICAgPHRpdGxlPlVuaWNvZGUgKFVURi04KTwvdGl0bGU+DQogIDwvaGVh",
                    "ZD4NCiAgPGJvZHk+VGhpcyBpcyBhbiBleGFtcGxlPC9ib2R5Pg0KPC9odG1sPg=="
                ],
                expected: "<!DOCTYPE html []>\r\n<html>\r\n  <head>\r\n    <meta charset=\"utf-8\" />\r\n    <title>Unicode (UTF-8)</title>\r\n  </head>\r\n  <body>This is an example</body>\r\n</html>"
            }
        },
        cr: {
            utf16le: {
                b64Bytes: [
                    "//48ACEARABPAEMAVABZAFAARQAgAGgAdABtAGwAIABbAF0APgAKADwAaAB0AG0AbAA+AAoAIAAg",
                    "ADwAaABlAGEAZAA+AAoAIAAgACAAIAA8AG0AZQB0AGEAIABjAGgAYQByAHMAZQB0AD0AIgB1AHQA",
                    "ZgAtADEANgAiACAALwA+AAoAIAAgACAAIAA8AHQAaQB0AGwAZQA+AFUAbgBpAGMAbwBkAGUAPAAv",
                    "AHQAaQB0AGwAZQA+AAoAIAAgADwALwBoAGUAYQBkAD4ACgAgACAAPABiAG8AZAB5AD4AVABoAGkA",
                    "cwAgAGkAcwAgAGEAbgAgAGUAeABhAG0AcABsAGUAPAAvAGIAbwBkAHkAPgAKADwALwBoAHQAbQBs",
                    "AD4A"
                ],
                expected: "<!DOCTYPE html []>\n<html>\n  <head>\n    <meta charset=\"utf-16\" />\n    <title>Unicode</title>\n  </head>\n  <body>This is an example</body>\n</html>"
            },
            utf16be: {
                b64Bytes: [
                    "/v8APAAhAEQATwBDAFQAWQBQAEUAIABoAHQAbQBsACAAWwBdAD4ACgA8AGgAdABtAGwAPgAKACAA",
                    "IAA8AGgAZQBhAGQAPgAKACAAIAAgACAAPABtAGUAdABhACAAYwBoAGEAcgBzAGUAdAA9ACIAdQB0",
                    "AGYALQAxADYAQgBFACIAIAAvAD4ACgAgACAAIAAgADwAdABpAHQAbABlAD4AVQBuAGkAYwBvAGQA",
                    "ZQAgACgAQgBpAGcALQBFAG4AZABpAGEAbgApADwALwB0AGkAdABsAGUAPgAKACAAIAA8AC8AaABl",
                    "AGEAZAA+AAoAIAAgADwAYgBvAGQAeQA+AFQAaABpAHMAIABpAHMAIABhAG4AIABlAHgAYQBtAHAA",
                    "bABlADwALwBiAG8AZAB5AD4ACgA8AC8AaAB0AG0AbAA+"
                ],
                expected: "<!DOCTYPE html []>\n<html>\n  <head>\n    <meta charset=\"utf-16BE\" />\n    <title>Unicode (Big-Endian)</title>\n  </head>\n  <body>This is an example</body>\n</html>"
            },
            utf32le: {
                b64Bytes: [
                    "//4AADwAAAAhAAAARAAAAE8AAABDAAAAVAAAAFkAAABQAAAARQAAACAAAABoAAAAdAAAAG0AAABs",
                    "AAAAIAAAAFsAAABdAAAAPgAAAAoAAAA8AAAAaAAAAHQAAABtAAAAbAAAAD4AAAAKAAAAIAAAACAA",
                    "AAA8AAAAaAAAAGUAAABhAAAAZAAAAD4AAAAKAAAAIAAAACAAAAAgAAAAIAAAADwAAABtAAAAZQAA",
                    "AHQAAABhAAAAIAAAAGMAAABoAAAAYQAAAHIAAABzAAAAZQAAAHQAAAA9AAAAIgAAAHUAAAB0AAAA",
                    "ZgAAAC0AAAAzAAAAMgAAACIAAAAgAAAALwAAAD4AAAAKAAAAIAAAACAAAAAgAAAAIAAAADwAAAB0",
                    "AAAAaQAAAHQAAABsAAAAZQAAAD4AAABVAAAAbgAAAGkAAABjAAAAbwAAAGQAAABlAAAAIAAAACgA",
                    "AABVAAAAVAAAAEYAAAAtAAAAMwAAADIAAAApAAAAPAAAAC8AAAB0AAAAaQAAAHQAAABsAAAAZQAA",
                    "AD4AAAAKAAAAIAAAACAAAAA8AAAALwAAAGgAAABlAAAAYQAAAGQAAAA+AAAACgAAACAAAAAgAAAA",
                    "PAAAAGIAAABvAAAAZAAAAHkAAAA+AAAAVAAAAGgAAABpAAAAcwAAACAAAABpAAAAcwAAACAAAABh",
                    "AAAAbgAAACAAAABlAAAAeAAAAGEAAABtAAAAcAAAAGwAAABlAAAAPAAAAC8AAABiAAAAbwAAAGQA",
                    "AAB5AAAAPgAAAAoAAAA8AAAALwAAAGgAAAB0AAAAbQAAAGwAAAA+AAAA"
                ],
                expected: "<!DOCTYPE html []>\n<html>\n  <head>\n    <meta charset=\"utf-32\" />\n    <title>Unicode (UTF-32)</title>\n  </head>\n  <body>This is an example</body>\n</html>"
            },
            utf32be: {
                b64Bytes: [
                    "AAD+/wAAADwAAAAhAAAARAAAAE8AAABDAAAAVAAAAFkAAABQAAAARQAAACAAAABoAAAAdAAAAG0A",
                    "AABsAAAAIAAAAFsAAABdAAAAPgAAAAoAAAA8AAAAaAAAAHQAAABtAAAAbAAAAD4AAAAKAAAAIAAA",
                    "ACAAAAA8AAAAaAAAAGUAAABhAAAAZAAAAD4AAAAKAAAAIAAAACAAAAAgAAAAIAAAADwAAABtAAAA",
                    "ZQAAAHQAAABhAAAAIAAAAGMAAABoAAAAYQAAAHIAAABzAAAAZQAAAHQAAAA9AAAAIgAAAHUAAAB0",
                    "AAAAZgAAAC0AAAAzAAAAMgAAAEIAAABFAAAAIgAAACAAAAAvAAAAPgAAAAoAAAAgAAAAIAAAACAA",
                    "AAAgAAAAPAAAAHQAAABpAAAAdAAAAGwAAABlAAAAPgAAAFUAAABuAAAAaQAAAGMAAABvAAAAZAAA",
                    "AGUAAAAgAAAAKAAAAFUAAABUAAAARgAAAC0AAAAzAAAAMgAAACAAAABCAAAAaQAAAGcAAAAtAAAA",
                    "RQAAAG4AAABkAAAAaQAAAGEAAABuAAAAKQAAADwAAAAvAAAAdAAAAGkAAAB0AAAAbAAAAGUAAAA+",
                    "AAAACgAAACAAAAAgAAAAPAAAAC8AAABoAAAAZQAAAGEAAABkAAAAPgAAAAoAAAAgAAAAIAAAADwA",
                    "AABiAAAAbwAAAGQAAAB5AAAAPgAAAFQAAABoAAAAaQAAAHMAAAAgAAAAaQAAAHMAAAAgAAAAYQAA",
                    "AG4AAAAgAAAAZQAAAHgAAABhAAAAbQAAAHAAAABsAAAAZQAAADwAAAAvAAAAYgAAAG8AAABkAAAA",
                    "eQAAAD4AAAAKAAAAPAAAAC8AAABoAAAAdAAAAG0AAABsAAAAPg=="
                ],
                expected: "<!DOCTYPE html []>\n<html>\n  <head>\n    <meta charset=\"utf-32BE\" />\n    <title>Unicode (UTF-32 Big-Endian)</title>\n  </head>\n  <body>This is an example</body>\n</html>"
            },
            utf8: {
                b64Bytes: [
                    "77u/PCFET0NUWVBFIGh0bWwgW10+CjxodG1sPgogIDxoZWFkPgogICAgPG1ldGEgY2hhcnNldD0i",
                    "dXRmLTgiIC8+CiAgICA8dGl0bGU+VW5pY29kZSAoVVRGLTgpPC90aXRsZT4KICA8L2hlYWQ+CiAg",
                    "PGJvZHk+VGhpcyBpcyBhbiBleGFtcGxlPC9ib2R5Pgo8L2h0bWw+"
                ],
                expected: "<!DOCTYPE html []>\n<html>\n  <head>\n    <meta charset=\"utf-8\" />\n    <title>Unicode (UTF-8)</title>\n  </head>\n  <body>This is an example</body>\n</html>"
            }
        }
    },
    utf8AsHex: [
        "3c21444f43545950452068746d6c205b5d3e0a3c68746d6c3e0a20203c686561643e0a2020202",
        "03c6d65746120636861727365743d227574662d3822202f3e0a202020203c7469746c653e556e",
        "69636f646520285554462d38293c2f7469746c653e0a20203c2f686561643e0a20203c626f647",
        "93e5468697320697320616e206578616d706c653c2f626f64793e0a3c2f68746d6c3e"
    ],
    names: {
        utf8: { name: "Unicode (UTF-8)", webName: "utf-8" },
        utf7: { name: "Unicode (UTF-7)", webName: "utf-7" },
        ascii: { name: "US-ASCII", webName: "us-ascii" },
        utf16le: { name: "Unicode", webName: "utf-16" },
        utf16be: { name: "Unicode (Big-Endian)", webName: "utf-16BE" },
        utf32le: { name: "Unicode (UTF-32)", webName: "utf-32" },
        utf32be: { name: "Unicode (UTF-32 Big-Endian)", webName: "utf-32BE" },
        latin1: { name: "Western European (ISO)", webName: "iso-8859-1" },
        windows: { name: "Western European (Windows)", webName: "Windows-1252" },
        ebcdic500: { name: "IBM EBCDIC (International)", webName: "IBM500" },
        ebcdic1140: { name: "IBM EBCDIC (US-Canada-Euro)", webName: "IBM01140" },
        ebcdic37: { name: "IBM EBCDIC (US-Canada)", webName: "IBM037" },
        base64: { name: "base64" },
        hex: { name: "hex" }
    }
};
//# sourceMappingURL=index.js.map