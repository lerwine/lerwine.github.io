/// <reference path="Scripts/typings/jquery/jquery.d.ts"/>
/// <reference path="Scripts/typings/angularjs/angular.d.ts"/>
/// <reference path="app.ts"/>
var uriBuilder;
(function (uriBuilder) {
    let schemeRegex = /^([a-z_][-.\dA-_a-z~\ud800-\udbff]*)(:[\\/]{0,2})/;
    let userInfoRegex = /^([^:\\\/@]+)?(:([^:\\\/@]+)?)?@/;
    let hostAndPortRegex = /^([^:\\\/@]+)?(:(\d+))?@/;
    let separatorRegex = /[\\\/:]/;
    let nonSeparatorRegex = /[\\\/:]/;
    let pathSegmentRegex = /^(?:([^\\\/:]+)|([\\\/:])([^\\\/:]+)?)(.+)?$/;
    let uriParseRegex = /^(([^\\\/@:]*)(:[\\\/]{0,2})((?=[^\\\/@:]*(?::[^\\\/@:]*)?@)([^\\\/@:]*)(:[^\\\/@:]*)?@)?([^\\\/@:]*)(?:(?=:\d*(?:[\\\/:]|$)):(\d*))?(?=[\\\/:]|$))?(.+)?$/;
    let uriDataRegex = /^([$-.\d_a-z~\ud800-\udbff]+|%[a-f\d]{2})+/i;
    let uriPathRegex = /^([!$&-.\d;=@-\[\]_a-z~\ud800-\udbff\/\\]+|%[a-f\d]{2})+/i;
    let uriPathNameRegex = /^([!$&-.\d;=@-\[\]_a-z~\ud800-\udbff]+|%[a-f\d]{2})+/i;
    let uriAuthorityNameRegex = /^([!$&-.\d;=A-\[\]_a-z~\ud800-\udbff]+|%[a-f\d]{2})+/;
    let uriParseGroup;
    (function (uriParseGroup) {
        uriParseGroup[uriParseGroup["all"] = 0] = "all";
        uriParseGroup[uriParseGroup["origin"] = 1] = "origin";
        uriParseGroup[uriParseGroup["schemeName"] = 2] = "schemeName";
        uriParseGroup[uriParseGroup["schemeSeparator"] = 3] = "schemeSeparator";
        uriParseGroup[uriParseGroup["userInfo"] = 4] = "userInfo";
        uriParseGroup[uriParseGroup["username"] = 5] = "username";
        uriParseGroup[uriParseGroup["password"] = 6] = "password";
        uriParseGroup[uriParseGroup["hostname"] = 7] = "hostname";
        uriParseGroup[uriParseGroup["portnumber"] = 8] = "portnumber";
        uriParseGroup[uriParseGroup["path"] = 9] = "path";
    })(uriParseGroup || (uriParseGroup = {}));
    function parseQuery(queryString) {
        throw new Error("Not implemented");
    }
    uriBuilder.parseQuery = parseQuery;
    function parseUri(uri) {
        if (typeof uri !== "string")
            uri = "";
        let index;
        let scheme = getUriSchemeInfo(uri);
        let result = {};
        if (typeof scheme === "undefined") {
            index = uri.indexOf("#");
            if (index >= 0) {
                result.fragment = uri.substr(index + 1);
                uri = uri.substr(0, index);
            }
            index = uri.indexOf("?");
            if (index >= 0) {
                result.fragment = uri.substr(index + 1);
                uri = uri.substr(0, index);
            }
        }
        else {
            if (scheme.fragment !== UriComponentSupport.notSupported) {
                index = uri.indexOf("#");
                let result = {};
                if (index >= 0) {
                    result.fragment = uri.substr(index + 1);
                    uri = uri.substr(0, index);
                }
            }
            if (scheme.query !== UriComponentSupport.notSupported) {
                index = uri.indexOf("?");
                if (index >= 0) {
                    result.query = {};
                    result.query.queryString = uri.substr(index + 1);
                    // TODO: parse name/value pairs.
                    uri = uri.substr(0, index);
                }
            }
        }
        throw new Error("Not implemented");
    }
    uriBuilder.parseUri = parseUri;
    const uriSchemeParseRe = /^([a-zA-Z_][-.\dA-_a-z~\ud800-\udbff]*)(:[\\/]{0,2})/;
    function getUriSchemeInfo(uri) {
        if ((typeof uri === "string") && uri.length > 0) {
            let m = uriSchemeParseRe.exec(uri);
            if ((typeof m === "object") && m !== null) {
                let scheme = UriSchemeInfo.getSchemaProperties(m[1]);
                let s = m[2].replace("\\", "/");
                if (scheme.schemeSeparator === s)
                    return scheme;
                return new UriSchemeInfo(scheme.name, {
                    path: scheme.path, query: scheme.query, fragment: scheme.fragment, userInfo: scheme.userInfo, host: scheme.host, schemeSeparator: s
                }, scheme.description);
            }
        }
    }
    uriBuilder.getUriSchemeInfo = getUriSchemeInfo;
    let UriComponentSupport;
    (function (UriComponentSupport) {
        UriComponentSupport[UriComponentSupport["required"] = 0] = "required";
        UriComponentSupport[UriComponentSupport["optional"] = 1] = "optional";
        UriComponentSupport[UriComponentSupport["notSupported"] = 2] = "notSupported";
    })(UriComponentSupport = uriBuilder.UriComponentSupport || (uriBuilder.UriComponentSupport = {}));
    class UriSchemeInfo {
        constructor(name, properties, description) {
            this.name = name;
            this.description = (typeof description === "string") ? description.trim() : "";
            if (typeof (properties) === 'undefined' || properties === null) {
                this.path = UriComponentSupport.optional;
                this.query = UriComponentSupport.optional;
                this.fragment = UriComponentSupport.optional;
                this.userName = UriComponentSupport.optional;
                this.password = UriComponentSupport.optional;
                this.userInfo = { username: this.userName, password: this.password };
                this.hostName = UriComponentSupport.optional;
                this.port = UriComponentSupport.optional;
                this.defaultPort = NaN;
                this.host = { name: this.hostName, port: this.port, defaultPort: this.defaultPort };
                this.schemeSeparator = "://";
            }
            else {
                this.schemeSeparator = (typeof (properties.schemeSeparator) == 'string') ? properties.schemeSeparator : "://";
                let host = properties.host;
                if (typeof host === "number")
                    this.host = host;
                else if (typeof host !== "undefined")
                    this.host = { name: host.name, port: (typeof host.port === "number") ? host.port : UriComponentSupport.optional, defaultPort: host.defaultPort };
                else if (this.schemeSeparator == ":")
                    this.host = UriComponentSupport.notSupported;
                else
                    this.host = { name: UriComponentSupport.optional, port: UriComponentSupport.optional };
                this.path = ((typeof properties.path === "undefined") || properties.path === null) ? UriComponentSupport.optional : properties.path;
                this.query = ((typeof properties.query === "undefined") || properties.query === null) ? UriComponentSupport.optional : properties.path;
                this.fragment = ((typeof properties.fragment === "undefined") || properties.fragment === null) ? UriComponentSupport.optional : properties.fragment;
                let userInfo = properties.userInfo;
                this.userInfo = ((typeof userInfo === "undefined") || userInfo === null) ? { username: UriComponentSupport.optional, password: UriComponentSupport.optional } :
                    ((typeof userInfo === "number") ? userInfo : { username: userInfo.username, password: (typeof userInfo.password === "undefined" || userInfo.password === null) ? UriComponentSupport.optional : userInfo.password });
                this.userName = (typeof properties.userInfo === "number") ? properties.userInfo : properties.userInfo.username;
                this.password = (typeof properties.userInfo === "number") ? properties.userInfo : properties.userInfo.password;
                this.hostName = (typeof properties.host === "number") ? properties.host : properties.host.name;
                this.port = (typeof properties.host === "number") ? properties.host : properties.host.port;
                this.defaultPort = (typeof properties.host === "object" && typeof properties.host.defaultPort === "number") ? properties.host.defaultPort : NaN;
            }
        }
        get displayText() {
            return (this.description.length == 0) ? "\"" + this.name + "\" Schema" : this.description + " (" + this.name + ")";
        }
        static getSchemaProperties(name) {
            if (name.endsWith(':'))
                name = name.substr(0, name.length - 1);
            let item = UriSchemeInfo.knownSchemes.find((value) => value.name === name);
            if (typeof item !== "undefined")
                return item;
            return new UriSchemeInfo(name);
        }
    }
    /**
     * File Transfer protocol
     **/
    UriSchemeInfo.uriScheme_ftp = new UriSchemeInfo("ftp", { query: UriComponentSupport.notSupported, fragment: UriComponentSupport.notSupported, host: { name: UriComponentSupport.required, defaultPort: 21 } }, "File Transfer protocol");
    /**
     * File Transfer protocol (secure)
     **/
    UriSchemeInfo.uriScheme_ftps = new UriSchemeInfo("ftps", { query: UriComponentSupport.notSupported, fragment: UriComponentSupport.notSupported, host: { name: UriComponentSupport.required, defaultPort: 990 } }, "File Transfer protocol (secure)");
    /**
     * Secure File Transfer Protocol
     **/
    UriSchemeInfo.uriScheme_sftp = new UriSchemeInfo("sftp", { query: UriComponentSupport.notSupported, fragment: UriComponentSupport.notSupported, host: { name: UriComponentSupport.required, defaultPort: 22 } }, "Secure File Transfer Protocol");
    /**
     * Hypertext Transfer Protocol
     **/
    UriSchemeInfo.uriScheme_http = new UriSchemeInfo("http", { host: { name: UriComponentSupport.required, defaultPort: 80 } }, "Hypertext Transfer Protocol");
    /**
     * Hypertext Transfer Protocol (secure)
     **/
    UriSchemeInfo.uriScheme_https = new UriSchemeInfo("https", { host: { name: UriComponentSupport.required, defaultPort: 443 } }, "Hypertext Transfer Protocol (secure)");
    /**
     * Gopher protocol
     **/
    UriSchemeInfo.uriScheme_gopher = new UriSchemeInfo("gopher", { host: { name: UriComponentSupport.required, defaultPort: 70 } }, "Gopher protocol");
    /**
     * Electronic mail address
     **/
    UriSchemeInfo.uriScheme_mailto = new UriSchemeInfo("mailto", { schemeSeparator: ":", host: { name: UriComponentSupport.required, port: UriComponentSupport.notSupported },
        userInfo: { username: UriComponentSupport.required, password: UriComponentSupport.notSupported } }, "Electronic mail address");
    /**
     * USENET news
     **/
    UriSchemeInfo.uriScheme_news = new UriSchemeInfo("news", { host: UriComponentSupport.notSupported, schemeSeparator: ":" }, "USENET news");
    /**
     * USENET news using NNTP access
     **/
    UriSchemeInfo.uriScheme_nntp = new UriSchemeInfo("nntp", { host: { name: UriComponentSupport.required, defaultPort: 119 } }, "USENET news using NNTP access");
    /**
     * Reference to interactive sessions
     **/
    UriSchemeInfo.uriScheme_telnet = new UriSchemeInfo("telnet", { path: UriComponentSupport.notSupported, query: UriComponentSupport.notSupported, fragment: UriComponentSupport.notSupported,
        userInfo: UriComponentSupport.notSupported, host: { name: UriComponentSupport.required, defaultPort: 23 } }, "Reference to interactive sessions");
    /**
     * Wide Area Information Servers
     **/
    UriSchemeInfo.uriScheme_wais = new UriSchemeInfo("wais", { host: { name: UriComponentSupport.required, defaultPort: 443 } }, "Wide Area Information Servers");
    /**
     * Host-specific file names
     **/
    UriSchemeInfo.uriScheme_file = new UriSchemeInfo("file", {
        query: UriComponentSupport.notSupported, fragment: UriComponentSupport.notSupported, userInfo: UriComponentSupport.notSupported,
        host: { name: UriComponentSupport.optional, port: UriComponentSupport.notSupported }
    }, "Host-specific file names");
    /**
     * Net Pipe
     **/
    UriSchemeInfo.uriScheme_netPipe = new UriSchemeInfo("net.pipe", { host: { name: UriComponentSupport.required, port: UriComponentSupport.notSupported } }, "Net Pipe");
    /**
     * Net-TCP
     **/
    UriSchemeInfo.uriScheme_netTcp = new UriSchemeInfo("net.tcp", { host: { name: UriComponentSupport.required, defaultPort: 808 } }, "Net-TCP");
    /**
     * Lightweight Directory Access Protocol
     **/
    UriSchemeInfo.uriScheme_ldap = new UriSchemeInfo("ldap", { host: { name: UriComponentSupport.required, defaultPort: 389 } }, "Lightweight Directory Access Protocol");
    /**
     * Lightweight Directory Access Protocol
     **/
    UriSchemeInfo.uriScheme_ssh = new UriSchemeInfo("ssh", { host: { name: UriComponentSupport.required, defaultPort: 22 } }, "Lightweight Directory Access Protocol");
    /**
     * GIT Respository
     **/
    UriSchemeInfo.uriScheme_git = new UriSchemeInfo("git", { query: UriComponentSupport.notSupported, fragment: UriComponentSupport.notSupported, host: { name: UriComponentSupport.required, defaultPort: 9418 } }, "GIT Respository");
    /**
     * Telephone Number
     **/
    UriSchemeInfo.uriScheme_tel = new UriSchemeInfo("tel", { host: UriComponentSupport.notSupported, schemeSeparator: ":", path: UriComponentSupport.notSupported, fragment: UriComponentSupport.notSupported, query: UriComponentSupport.notSupported }, "Telephone Number");
    /**
     * Uniform Resource notation
     **/
    UriSchemeInfo.uriScheme_urn = new UriSchemeInfo("urn", { host: UriComponentSupport.notSupported, schemeSeparator: ":" }, "Uniform Resource notation");
    UriSchemeInfo.knownSchemes = [
        UriSchemeInfo.uriScheme_https,
        UriSchemeInfo.uriScheme_http,
        UriSchemeInfo.uriScheme_ssh,
        UriSchemeInfo.uriScheme_file,
        UriSchemeInfo.uriScheme_ldap,
        UriSchemeInfo.uriScheme_wais,
        UriSchemeInfo.uriScheme_git,
        UriSchemeInfo.uriScheme_mailto,
        UriSchemeInfo.uriScheme_netPipe,
        UriSchemeInfo.uriScheme_netTcp,
        UriSchemeInfo.uriScheme_sftp,
        UriSchemeInfo.uriScheme_ftps,
        UriSchemeInfo.uriScheme_ftp,
        UriSchemeInfo.uriScheme_gopher,
        UriSchemeInfo.uriScheme_news,
        UriSchemeInfo.uriScheme_nntp,
        UriSchemeInfo.uriScheme_telnet,
        UriSchemeInfo.uriScheme_tel,
        UriSchemeInfo.uriScheme_urn
    ];
    uriBuilder.UriSchemeInfo = UriSchemeInfo;
    class UriBuilderController {
        constructor($Scope) {
            this.$Scope = $Scope;
        }
        $onChanges(onChangesObj) {
        }
    }
    app.mainModule.controller("uriBuilderController", ['$scope', UriBuilderController]);
})(uriBuilder || (uriBuilder = {}));
//# sourceMappingURL=UriBuilder.js.map