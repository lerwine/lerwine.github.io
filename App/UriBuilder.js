/// <reference path="Scripts/typings/jquery/jquery.d.ts"/>
/// <reference path="Scripts/typings/angularjs/angular.d.ts"/>
/// <reference path="accordionGroup.ts"/>
/// <reference path="sys.ts"/>
/// <reference path="app.ts"/>
var uriBuilder;
(function (uriBuilder_1) {
    // #region Uri Scheme Specification
    const schemeRegex = /^([a-z_][-.\dA-_a-z~\ud800-\udbff]*)(:[\\/]{0,2})/;
    const userInfoRegex = /^([^:\\\/@]+)?(:([^:\\\/@]+)?)?@/;
    const hostAndPortRegex = /^([^:\\\/@]+)?(:(\d+))?@/;
    const separatorRegex = /[\\\/:]/;
    const nonSeparatorRegex = /[\\\/:]/;
    const pathSegmentRegex = /^(?:([^\\\/:]+)|([\\\/:])([^\\\/:]+)?)(.+)?$/;
    const uriParseRegex = /^(([^\\\/@:]*)(:[\\\/]{0,2})((?=[^\\\/@:]*(?::[^\\\/@:]*)?@)([^\\\/@:]*)(:[^\\\/@:]*)?@)?([^\\\/@:]*)(?:(?=:\d*(?:[\\\/:]|$)):(\d*))?(?=[\\\/:]|$))?(.+)?$/;
    const uriDataRegex = /^([$-.\d_a-z~\ud800-\udbff]+|%[a-f\d]{2})+/i;
    const uriPathRegex = /^([!$&-.\d;=@-\[\]_a-z~\ud800-\udbff\/\\]+|%[a-f\d]{2})+/i;
    const uriPathNameRegex = /^([!$&-.\d;=@-\[\]_a-z~\ud800-\udbff]+|%[a-f\d]{2})+/i;
    const uriAuthorityNameRegex = /^([!$&-.\d;=A-\[\]_a-z~\ud800-\udbff]+|%[a-f\d]{2})+/;
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
    /**
     * Matches scheme (group #1) and separator (group #2) at the beginning of text.
     *
     * @constant
     * @default
     * */
    uriBuilder_1.uriSchemeParseRe = /^([^:\\\/?#@]*)(:[\\/]{0,2})/;
    /**
     * Matches user name (group #2) and optional password (group #3) followed by @.
     *
     * @constant
     * @default
     * */
    uriBuilder_1.userPwParseRe = /^(([^:\\\/@]*)(?::([:\\\/@]*)))@/;
    /**
     * Matches user name (group #1) followed by @.
     *
     * @constant
     * @default
     * */
    uriBuilder_1.userNameParseRe = /^([^\\\/@]*)@/;
    /**
     * Matches host name (group #1) and optional port number (group #2).
     *
     * @constant
     * @default
     * */
    uriBuilder_1.hostPortParseRe = /^([^:\\\/@]*)(?::(\d+))?/;
    /**
     * Matches host name.
     *
     * @constant
     * @default
     * */
    uriBuilder_1.hostNameParseRe = /^[^\\\/@]+/;
    /**
     * Matches a valid URI scheme.
     *
     * @constant
     * @default
     * */
    uriBuilder_1.uriSchemeValidationRe = /^[a-zA-Z_][-.\dA-_a-z~\ud800-\udbff]*$/;
    /**
     * Indicates whether a string represents a valid URI scheme name.
     *
     * @export
     * @param {string} name
     * @returns true if the specified string is a valid URI scheme name; otherwise, false.
     */
    function isValidSchemeName(name) { return !sys.isNilOrWhiteSpace(name) && uriBuilder_1.uriSchemeValidationRe.test(name); }
    uriBuilder_1.isValidSchemeName = isValidSchemeName;
    /**
     * Specifies whether a component is supported for a given URI scheme, and whether it is required.
     *
     * @export
     * @enum {number}
     */
    let UriComponentSupportOption;
    (function (UriComponentSupportOption) {
        /**
         * The component is required for the given URI scheme.
         */
        UriComponentSupportOption[UriComponentSupportOption["required"] = 0] = "required";
        /**
         * The component is optional for the given URI scheme.
         */
        UriComponentSupportOption[UriComponentSupportOption["optional"] = 1] = "optional";
        /**
         * The component is not supported for the given URI scheme.
         */
        UriComponentSupportOption[UriComponentSupportOption["notSupported"] = 2] = "notSupported";
    })(UriComponentSupportOption = uriBuilder_1.UriComponentSupportOption || (uriBuilder_1.UriComponentSupportOption = {}));
    /**
     * Gets scheme information for URI detected in a URI string.
     *
     * @export
     * @param {string} uri - URI to parse for scheme.
     * @returns {(UriSchemeSpecification | undefined)} The detected scheme or undefined if the URI string could not be parsed as an absolute URI.
     */
    function getUriSchemeInfo(uri) {
        if ((typeof uri === "string") && uri.length > 0) {
            let m = uriBuilder_1.uriSchemeParseRe.exec(uri);
            if ((typeof m === "object") && m !== null) {
                let scheme = UriSchemeSpecification.getSchemeSpecs(m[1]);
                let s = m[2].replace("\\", "/");
                if (scheme.separator === s)
                    return scheme;
                return new UriSchemeSpecification({
                    name: scheme.name,
                    path: scheme.path, query: scheme.query, fragment: scheme.fragment, userinfo: scheme.userinfo, host: scheme.host, separator: s
                }, scheme.description);
            }
        }
    }
    uriBuilder_1.getUriSchemeInfo = getUriSchemeInfo;
    /**
     * Represents a URI scheme specification.
     *
     * @export
     * @class UriSchemeInfo
     * @implements {IUriSchemeOption}
     */
    class UriSchemeSpecification {
        /**
         * Creates an instance of UriSchemeInfo.
         *
         * @param {IAbsoluteUriComponentSpec} spec - URI component support specifications.
         * @param {string} [description] - Describes the URI scheme.
         * @memberof UriSchemeInfo
         */
        constructor(spec, description) {
            this._description = sys.asString(description);
            this._name = spec.name;
            this._separator = (sys.isNilOrWhiteSpace(spec.separator)) ? "://" : spec.separator;
            if (typeof spec.host === "number") {
                this._hostname = spec.host;
                this._port = (spec.host == UriComponentSupportOption.required) ? UriComponentSupportOption.optional : spec.host;
                this._defaultPort = NaN;
            }
            else if (typeof spec.host === "object" && spec.host !== null) {
                if (typeof spec.host.name === "number") {
                    if (spec.host.name === UriComponentSupportOption.notSupported) {
                        this._defaultPort = NaN;
                        this._hostname = this._port = spec.host.name;
                    }
                    else {
                        this._hostname = (spec.host.name === UriComponentSupportOption.required) ? UriComponentSupportOption.required : UriComponentSupportOption.optional;
                        if (typeof spec.host.port === "number") {
                            if (spec.host.port === UriComponentSupportOption.notSupported) {
                                this._defaultPort = NaN;
                                this._port = UriComponentSupportOption.notSupported;
                            }
                            else {
                                this._port = (spec.host.port === UriComponentSupportOption.required) ? UriComponentSupportOption.required : UriComponentSupportOption.optional;
                                this._defaultPort = (typeof spec.host.defaultPort === "number") ? spec.host.defaultPort : NaN;
                            }
                        }
                        else {
                            this._defaultPort = (typeof spec.host.defaultPort === "number") ? spec.host.defaultPort : NaN;
                            this._port = UriComponentSupportOption.optional;
                        }
                    }
                }
                else {
                    this._hostname = UriComponentSupportOption.optional;
                    if (typeof spec.host.port === "number") {
                        if (spec.host.port === UriComponentSupportOption.notSupported) {
                            this._defaultPort = NaN;
                            this._port = UriComponentSupportOption.notSupported;
                        }
                        else {
                            this._port = (spec.host.port === UriComponentSupportOption.required) ? UriComponentSupportOption.required : UriComponentSupportOption.optional;
                            this._defaultPort = (typeof spec.host.defaultPort === "number") ? spec.host.defaultPort : NaN;
                        }
                    }
                    else {
                        this._defaultPort = (typeof spec.host.defaultPort === "number") ? spec.host.defaultPort : NaN;
                        this._port = UriComponentSupportOption.optional;
                    }
                }
            }
            if (typeof spec.userinfo === "number") {
                this._username = (spec.userinfo === UriComponentSupportOption.required || spec.userinfo === UriComponentSupportOption.optional) ? spec.userinfo : UriComponentSupportOption.notSupported;
                this._password = (spec.userinfo == UriComponentSupportOption.notSupported) ? UriComponentSupportOption.notSupported : UriComponentSupportOption.optional;
            }
            else if (typeof spec.userinfo === "object" && spec.userinfo !== null) {
                if (typeof spec.userinfo.name === "number") {
                    if (spec.userinfo.name === UriComponentSupportOption.notSupported)
                        this._username = this._password = spec.userinfo.name;
                    else {
                        this._username = (spec.userinfo.name === UriComponentSupportOption.required) ? UriComponentSupportOption.required : UriComponentSupportOption.optional;
                        if (typeof spec.userinfo.password === "number") {
                            if (spec.userinfo.password === UriComponentSupportOption.notSupported)
                                this._password = UriComponentSupportOption.notSupported;
                            else
                                this._password = (spec.userinfo.password === UriComponentSupportOption.required) ? UriComponentSupportOption.required : UriComponentSupportOption.optional;
                        }
                        else
                            this._password = UriComponentSupportOption.optional;
                    }
                }
                else {
                    this._username = UriComponentSupportOption.optional;
                    if (typeof spec.userinfo.password === "number") {
                        if (spec.userinfo.password === UriComponentSupportOption.notSupported)
                            this._password = UriComponentSupportOption.notSupported;
                        else
                            this._password = (spec.userinfo.password === UriComponentSupportOption.required) ? UriComponentSupportOption.required : UriComponentSupportOption.optional;
                    }
                    else
                        this._password = UriComponentSupportOption.optional;
                }
            }
        }
        /**
         * Name of the current URI scheme.
         *
         * @readonly
         * @type {string}
         * @memberof UriSchemeInfo
         */
        get name() { return this._name; }
        /**
         * The default URI scheme separator.
         *
         * @readonly
         * @type {UriSchemeSeparator}
         * @memberof UriSchemeInfo
         */
        get separator() { return this._separator; }
        /**
         * The user name requirement/option for the current URI scheme.
         *
         * @readonly
         * @type {UriComponentSupportOption}
         * @memberof UriSchemeInfo
         */
        get username() { return this._username; }
        /**
         * The password requirement/option for the current URI scheme.
         *
         * @readonly
         * @type {UriComponentSupportOption}
         * @memberof UriSchemeInfo
         */
        get password() { return this._password; }
        /**
         * The host name requirement/option for the current URI scheme.
         *
         * @readonly
         * @type {UriComponentSupportOption}
         * @memberof UriSchemeInfo
         */
        get hostname() { return this._hostname; }
        /**
         * Specifies the port number requirement/option for the current URI scheme.
         *
         * @readonly
         * @type {UriComponentSupportOption}
         * @memberof UriSchemeInfo
         */
        get port() { return this._port; }
        /**
         * Specifies the default port number for the current URI scheme or {@link NaN} if there is no default port number.
         *
         * @readonly
         * @type {number}
         * @memberof UriSchemeInfo
         */
        get defaultPort() { return this._defaultPort; }
        /**
         * The path requirement/option for the current URI scheme.
         *
         * @readonly
         * @type {UriComponentSupportOption}
         * @memberof UriSchemeInfo
         */
        get path() { return this._path; }
        /**
         * The query parameter requirement/option for the current URI scheme.
         *
         * @readonly
         * @type {UriComponentSupportOption}
         * @memberof UriSchemeInfo
         */
        get query() { return this._query; }
        /**
         * The fragment requirement/option for the current URI scheme.
         *
         * @readonly
         * @type {UriComponentSupportOption}
         * @memberof UriSchemeInfo
         */
        get fragment() { return this._fragment; }
        /**
         * The description of the current URI scheme.
         *
         * @readonly
         * @type {string}
         * @memberof UriSchemeInfo
         */
        get description() { return this._description; }
        /**
         * Gets combined user name and password requirements/options for the current URI scheme.
         *
         * @readonly
         * @type {(IUriUserInfoComponentSpecNotSupported | IUriUserInfoComponentSpecNameOnly | IUriUserInfoComponentSpecSupportsPassword)}
         * @memberof UriSchemeInfo
         */
        get userinfo() {
            return (this._username == UriComponentSupportOption.notSupported || this._password == UriComponentSupportOption.optional) ? this._username :
                { name: this._username, password: this._password };
        }
        /**
         * Gets combined host and port number requirements/options for the current URI scheme.
         *
         * @readonly
         * @type {(IUriHostComponentSpecNotSupported | IUriHostComponentSpecNameOnly | IUriHostComponentSpecSupportsPort)}
         * @memberof UriSchemeInfo
         */
        get host() {
            return (isNaN(this._defaultPort)) ? ((this._hostname == UriComponentSupportOption.notSupported || this._port == UriComponentSupportOption.optional) ? this._hostname :
                { name: this._hostname, port: this._port }) :
                { name: this._hostname, port: this._port, defaultPort: this._defaultPort };
        }
        /**
         *  Display text to use in selection controls.
         *
         * @readonly
         * @type {string}
         * @memberof UriSchemeInfo
         */
        get displayText() {
            return (this._description.length == 0) ? "\"" + this._name + "\" Schema" : this._description + " (" + this._name + ")";
        }
        isEqualTo(value) {
            return !sys.isNil(value) && this._name == value._name && this._separator == value._separator && this._path == value._path && this._username == value._username && this._password == value._password &&
                this._hostname == value._hostname && this._port == value._port && this._defaultPort == value._defaultPort && this._query == value._query && this._fragment == value._fragment;
        }
        /**
         * Gets URI scheme specifications for a given uri scheme.
         *
         * @static
         * @param {string} scheme - The URI scheme name.
         * @param {UriSchemeSeparator} [separator] - The URI scheme separator.
         * @returns {UriSchemeSpecification}
         * @memberof UriSchemeInfo
         */
        static getSchemeSpecs(scheme, separator) {
            if (scheme.endsWith(':'))
                scheme = scheme.substr(0, scheme.length - 1);
            let item = UriSchemeSpecification.knownSchemes.find((value) => value.name === scheme);
            if (typeof item === "undefined")
                return new UriSchemeSpecification({ name: scheme, separator: separator });
            if (typeof separator !== "string" || separator === item.separator)
                return item;
            return new UriSchemeSpecification({ fragment: item.fragment, host: item.host, name: item.name, path: item.path, query: item.query, separator: separator, userinfo: item.userinfo });
        }
        /**
         * Gets an array of known URI scheme specifications.
         *
         * @static
         * @type {ReadonlyArray<UriSchemeSpecification>}
         * @memberof UriSchemeInfo
         */
        static get knownSchemes() { return UriSchemeSpecification._knownSchemes; }
    }
    /**
     * File Transfer protocol
     *
     * @static
     * @type {UriSchemeSpecification}
     * @memberof UriSchemeInfo
     */
    UriSchemeSpecification.uriScheme_ftp = new UriSchemeSpecification({
        name: "ftp", separator: "://", host: { name: UriComponentSupportOption.required, defaultPort: 21 }, path: UriComponentSupportOption.required,
        query: UriComponentSupportOption.notSupported, fragment: UriComponentSupportOption.notSupported
    }, "");
    /**
     * File Transfer protocol (secure)
     *
     * @static
     * @type {UriSchemeSpecification}
     * @memberof UriSchemeInfo
     */
    UriSchemeSpecification.uriScheme_ftps = new UriSchemeSpecification({
        name: "ftps", host: { name: UriComponentSupportOption.required, defaultPort: 990 },
        query: UriComponentSupportOption.notSupported, fragment: UriComponentSupportOption.notSupported
    }, "File Transfer protocol (secure)");
    /**
     * Secure File Transfer Protocol
     *
     * @static
     * @type {UriSchemeSpecification}
     * @memberof UriSchemeInfo
     */
    UriSchemeSpecification.uriScheme_sftp = new UriSchemeSpecification({
        name: "sftp", host: { name: UriComponentSupportOption.required, defaultPort: 22 },
        query: UriComponentSupportOption.notSupported, fragment: UriComponentSupportOption.notSupported
    }, "Secure File Transfer Protocol");
    /**
     * Hypertext Transfer Protocol
     *
     * @static
     * @type {UriSchemeSpecification}
     * @memberof UriSchemeInfo
     */
    UriSchemeSpecification.uriScheme_http = new UriSchemeSpecification({ name: "http", host: { name: UriComponentSupportOption.required, defaultPort: 80 } }, "Hypertext Transfer Protocol");
    /**
     * Hypertext Transfer Protocol (secure)
     *
     * @static
     * @type {UriSchemeSpecification}
     * @memberof UriSchemeInfo
     */
    UriSchemeSpecification.uriScheme_https = new UriSchemeSpecification({ name: "https", host: { name: UriComponentSupportOption.required, defaultPort: 443 } }, "Hypertext Transfer Protocol (secure)");
    /**
     * Gopher protocol
     *
     * @static
     * @type {UriSchemeSpecification}
     * @memberof UriSchemeInfo
     */
    UriSchemeSpecification.uriScheme_gopher = new UriSchemeSpecification({ name: "gopher", host: { name: UriComponentSupportOption.required, defaultPort: 70 } }, "Gopher protocol");
    /**
     * Electronic mail address
     *
     * @static
     * @type {UriSchemeSpecification}
     * @memberof UriSchemeInfo
     */
    UriSchemeSpecification.uriScheme_mailto = new UriSchemeSpecification({
        name: "mailto", separator: ":", host: { name: UriComponentSupportOption.required, port: UriComponentSupportOption.notSupported },
        userinfo: { name: UriComponentSupportOption.required, password: UriComponentSupportOption.notSupported }
    }, "Electronic mail address");
    /**
     * USENET news
     *
     * @static
     * @type {UriSchemeSpecification}
     * @memberof UriSchemeInfo
     */
    UriSchemeSpecification.uriScheme_news = new UriSchemeSpecification({ name: "news", host: UriComponentSupportOption.notSupported, separator: ":" }, "USENET news");
    /**
     * USENET news using NNTP access
     *
     * @static
     * @type {UriSchemeSpecification}
     * @memberof UriSchemeInfo
     */
    UriSchemeSpecification.uriScheme_nntp = new UriSchemeSpecification({ name: "nntp", host: { name: UriComponentSupportOption.required, defaultPort: 119 } }, "USENET news using NNTP access");
    /**
     * Reference to interactive sessions
     *
     * @static
     * @type {UriSchemeSpecification}
     * @memberof UriSchemeInfo
     */
    UriSchemeSpecification.uriScheme_telnet = new UriSchemeSpecification({
        name: "telnet", path: UriComponentSupportOption.notSupported, query: UriComponentSupportOption.notSupported, fragment: UriComponentSupportOption.notSupported,
        userinfo: UriComponentSupportOption.notSupported, host: { name: UriComponentSupportOption.required, defaultPort: 23 }
    }, "Reference to interactive sessions");
    /**
     * Wide Area Information Servers
     *
     * @static
     * @type {UriSchemeSpecification}
     * @memberof UriSchemeInfo
     */
    UriSchemeSpecification.uriScheme_wais = new UriSchemeSpecification({ name: "wais", host: { name: UriComponentSupportOption.required, defaultPort: 443 } }, "Wide Area Information Servers");
    /**
     * Host-specific file names
     *
     * @static
     * @type {UriSchemeSpecification}
     * @memberof UriSchemeInfo
     */
    UriSchemeSpecification.uriScheme_file = new UriSchemeSpecification({
        name: "file",
        query: UriComponentSupportOption.notSupported, fragment: UriComponentSupportOption.notSupported, userinfo: UriComponentSupportOption.notSupported,
        host: { name: UriComponentSupportOption.optional, port: UriComponentSupportOption.notSupported }
    }, "Host-specific file names");
    /**
     * Net Pipe
     *
     * @static
     * @type {UriSchemeSpecification}
     * @memberof UriSchemeInfo
     */
    UriSchemeSpecification.uriScheme_netPipe = new UriSchemeSpecification({ name: "net.pipe", host: { name: UriComponentSupportOption.required, port: UriComponentSupportOption.notSupported } }, "Net Pipe");
    /**
     * Net-TCP
     *
     * @static
     * @type {UriSchemeSpecification}
     * @memberof UriSchemeInfo
     */
    UriSchemeSpecification.uriScheme_netTcp = new UriSchemeSpecification({ name: "net.tcp", host: { name: UriComponentSupportOption.required, defaultPort: 808 } }, "Net-TCP");
    /**
     * Lightweight Directory Access Protocol
     *
     * @static
     * @type {UriSchemeSpecification}
     * @memberof UriSchemeInfo
     */
    UriSchemeSpecification.uriScheme_ldap = new UriSchemeSpecification({ name: "ldap", host: { name: UriComponentSupportOption.required, defaultPort: 389 } }, "Lightweight Directory Access Protocol");
    /**
     * Secure Shell
     *
     * @static
     * @type {UriSchemeSpecification}
     * @memberof UriSchemeInfo
     */
    UriSchemeSpecification.uriScheme_ssh = new UriSchemeSpecification({ name: "ssh", host: { name: UriComponentSupportOption.required, defaultPort: 22 } }, "Secure Shell");
    /**
     * GIT Respository
     *
     * @static
     * @type {UriSchemeSpecification}
     * @memberof UriSchemeInfo
     */
    UriSchemeSpecification.uriScheme_git = new UriSchemeSpecification({ name: "git", query: UriComponentSupportOption.notSupported, fragment: UriComponentSupportOption.notSupported, host: { name: UriComponentSupportOption.required, defaultPort: 9418 } }, "GIT Respository");
    /**
     * Telephone Number
     *
     * @static
     * @type {UriSchemeSpecification}
     * @memberof UriSchemeInfo
     */
    UriSchemeSpecification.uriScheme_tel = new UriSchemeSpecification({
        name: "tel", separator: ":", host: UriComponentSupportOption.required, path: UriComponentSupportOption.notSupported,
        fragment: UriComponentSupportOption.notSupported, query: UriComponentSupportOption.notSupported
    }, "Telephone Number");
    /**
     * Uniform Resource notation
     *
     * @static
     * @type {UriSchemeSpecification}
     * @memberof UriSchemeInfo
     */
    UriSchemeSpecification.uriScheme_urn = new UriSchemeSpecification({ name: "urn", host: UriComponentSupportOption.notSupported, separator: ":" }, "Uniform Resource notation");
    UriSchemeSpecification._knownSchemes = [
        UriSchemeSpecification.uriScheme_https,
        UriSchemeSpecification.uriScheme_http,
        UriSchemeSpecification.uriScheme_ssh,
        UriSchemeSpecification.uriScheme_file,
        UriSchemeSpecification.uriScheme_ldap,
        UriSchemeSpecification.uriScheme_wais,
        UriSchemeSpecification.uriScheme_git,
        UriSchemeSpecification.uriScheme_mailto,
        UriSchemeSpecification.uriScheme_netPipe,
        UriSchemeSpecification.uriScheme_netTcp,
        UriSchemeSpecification.uriScheme_sftp,
        UriSchemeSpecification.uriScheme_ftps,
        UriSchemeSpecification.uriScheme_ftp,
        UriSchemeSpecification.uriScheme_gopher,
        UriSchemeSpecification.uriScheme_news,
        UriSchemeSpecification.uriScheme_nntp,
        UriSchemeSpecification.uriScheme_telnet,
        UriSchemeSpecification.uriScheme_tel,
        UriSchemeSpecification.uriScheme_urn
    ];
    uriBuilder_1.UriSchemeSpecification = UriSchemeSpecification;
    class ComponentChangeManager {
        constructor(callback, thisArg) {
            this.callback = callback;
            this.thisArg = thisArg;
            this._changes = [];
        }
        get isChanging() { return (typeof this._last !== "undefined"); }
        raiseChange(component, value) {
            if (typeof this._last === "undefined") {
                this.callback(component, value);
                return true;
            }
            let changes = this._changes.filter((value) => value[0] === component);
            if (changes.length > 0)
                changes[0][1] = value;
            else
                this._changes.push([component, value]);
            return false;
        }
        doChange(func, thisArg) {
            let item;
            if (typeof (this._last = item = { previous: this._last }).previous === "undefined")
                this._first = this._last;
            try {
                if (arguments.length > 1)
                    func.call(thisArg);
                else
                    func();
            }
            finally {
                if (typeof item.next === "undefined") {
                    if (typeof (this._last = item.previous) === "undefined")
                        this._first = undefined;
                    else
                        item.previous.next = undefined;
                }
                else if (typeof (item.next.previous = item.previous) === "undefined")
                    this._first = item.next;
                else
                    item.previous.next = item.next;
                if (typeof this._last === "undefined" && this._changes.length > 0) {
                    let changes = this._changes;
                    this._changes = [];
                    changes.forEach((c) => this.callback.apply(this.thisArg, c));
                }
            }
        }
        getChange(func, thisArg) {
            let item;
            let result;
            if (typeof (this._last = item = { previous: this._last }).previous === "undefined")
                this._first = this._last;
            try {
                if (arguments.length > 1)
                    result = func.call(thisArg);
                else
                    result = func();
            }
            finally {
                if (typeof item.next === "undefined") {
                    if (typeof (this._last = item.previous) === "undefined")
                        this._first = undefined;
                    else
                        item.previous.next = undefined;
                }
                else if (typeof (item.next.previous = item.previous) === "undefined")
                    this._first = item.next;
                else
                    item.previous.next = item.next;
                if (typeof this._last === "undefined" && this._changes.length > 0) {
                    let changes = this._changes;
                    this._changes = [];
                    changes.forEach((c) => this.callback.apply(this.thisArg, c));
                }
            }
            return result;
        }
    }
    // #endregion
    // #region uri-builder-scheme directive
    uriBuilder_1.DIRECTIVENAME_uriBuilderScheme = "uriBuilderScheme";
    class UriBuilderSchemeController {
        // #endregion
        constructor($scope) {
            this.$scope = $scope;
            this._otherSchemeName = "";
        }
        // #region Properties
        get schemeOptions() { return UriBuilderSchemeController._schemeOptions; }
        get separatorOptions() { return UriBuilderSchemeController._separatorOptions; }
        get selectedScheme() { return this._selectedScheme; }
        set selectedScheme(value) {
            if (this._selectedScheme === (value = sys.asString(value)))
                return;
            if (value.length > 0)
                this.$scope.uriBuilder.schemeSpecs = UriSchemeSpecification.getSchemeSpecs(value);
            else if (this._otherSchemeName.length > 0)
                this.$scope.uriBuilder.schemeSpecs = UriSchemeSpecification.getSchemeSpecs(this._otherSchemeName, this._selectedSeparator);
        }
        get otherSchemeName() { return this._otherSchemeName; }
        set otherSchemeName(value) {
            if (this._otherSchemeName === (value = sys.asString(value)))
                return;
            this._otherSchemeName = value;
            if (this._selectedScheme.length == 0 && value.length > 0)
                this.$scope.uriBuilder.schemeSpecs = UriSchemeSpecification.getSchemeSpecs(value, this._selectedSeparator);
        }
        // #region Methods
        $onInit() { }
        static createDirective() {
            return {
                require: "^^" + uriBuilder_1.DIRECTIVENAME_uriBuilderOrigin,
                restrict: "E",
                controllerAs: "scheme",
                controller: ["$scope", UriBuilderSchemeController],
                transclude: true,
                template: '<ng-transclude></ng-transclude>',
                link: (scope, element, instanceAttributes, originBuilder) => {
                    scope.originBuilder = originBuilder;
                    originBuilder.onComponentChange(scope.scheme, scope.scheme.onSchemeComponentChange, UriBuilderComponentChangeArg.scheme);
                    let schemeController = scope.scheme;
                    let schemeSpecs = originBuilder.uriBuilder.schemeSpecs;
                    let selectedSpecs = UriSchemeSpecification.knownSchemes.find((value) => value.name === schemeSpecs.name && value.separator === schemeSpecs.separator);
                    if (sys.isNil(selectedSpecs)) {
                        schemeController._selectedScheme = "";
                        schemeController._selectedSeparator = schemeSpecs.separator;
                        schemeController._otherSchemeName = schemeSpecs.name;
                    }
                    else
                        schemeController._selectedScheme = schemeSpecs.name;
                    schemeController._selectedSeparator = schemeSpecs.separator;
                }
            };
        }
        onSchemeComponentChange(component, value, uriBuilder) {
            let schemeController = this.$scope.scheme;
            let schemeSpecs = this.$scope.uriBuilder.schemeSpecs;
            if (this._selectedScheme.length == 0) {
                if (schemeSpecs.name === this._otherSchemeName && schemeSpecs.separator === this._selectedSeparator)
                    return;
            }
            else if (schemeSpecs.name === this._selectedScheme && schemeSpecs.separator === this._selectedSeparator)
                return;
            let selectedSpecs = UriSchemeSpecification.knownSchemes.find((value) => value.name === schemeSpecs.name && value.separator === schemeSpecs.separator);
            if (sys.isNil(selectedSpecs)) {
                schemeController._selectedScheme = "";
                schemeController._selectedSeparator = schemeSpecs.separator;
                schemeController._otherSchemeName = schemeSpecs.name;
            }
            else
                schemeController._selectedScheme = schemeSpecs.name;
            schemeController._selectedSeparator = schemeSpecs.separator;
        }
        static detectScheme(uriString, uriBuilder) { return getUriSchemeInfo(uriString); }
    }
    UriBuilderSchemeController._schemeOptions = UriSchemeSpecification.knownSchemes.concat({ name: "", displayText: "(other)" });
    UriBuilderSchemeController._separatorOptions = ["://", ":", ":/"];
    app.mainModule.directive(uriBuilder_1.DIRECTIVENAME_uriBuilderScheme, UriBuilderSchemeController.createDirective);
    // #endregion
    // #region uri-builder-userinfo directive
    uriBuilder_1.DIRECTIVENAME_uriBuilderUserInfo = "uriBuilderUserInfo";
    class UriBuilderUserInfoController {
        // #region Properties
        // #endregion
        constructor($scope) {
            this.$scope = $scope;
        }
        // #region Methods
        $onInit() { }
        static createDirective() {
            return {
                require: "^^" + uriBuilder_1.DIRECTIVENAME_uriBuilderOrigin,
                restrict: "E",
                controllerAs: "userInfo",
                controller: ["$scope", UriBuilderUserInfoController],
                transclude: true,
                template: '<ng-transclude></ng-transclude>',
                link: (scope, element, instanceAttributes, originBuilder) => {
                    scope.originBuilder = originBuilder;
                    let userInfoController = scope.userInfo;
                    originBuilder.onComponentChange(userInfoController, userInfoController.onSchemeComponentChange, UriBuilderComponentChangeArg.scheme);
                    originBuilder.onComponentChange(userInfoController, userInfoController.onUserInfoComponentChange, UriBuilderComponentChangeArg.userinfo);
                }
            };
        }
        onSchemeComponentChange(component, value, originBuilder) {
        }
        onUserInfoComponentChange(component, value, originBuilder) {
        }
    }
    app.mainModule.directive(uriBuilder_1.DIRECTIVENAME_uriBuilderUserInfo, UriBuilderUserInfoController.createDirective);
    // #endregion
    // #region uri-builder-host directive
    uriBuilder_1.DIRECTIVENAME_uriBuilderHost = "uriBuilderHost";
    class UriBuilderHostController {
        // #endregion
        // #region Methods
        constructor($scope) {
            this.$scope = $scope;
            this._notSupported = false;
            this._hostRequired = false;
            this._name = "";
            this._previousName = "";
            this._hasName = true;
            this._portNotSupported = false;
            this._portRequired = false;
            this._portNumber = "";
            this._previousPort = "";
            this._hasPortNumber = false;
            this._defaultPort = NaN;
            this._noPortClass = [];
            this._allowsPortClass = [];
        }
        // #region Properties
        get notSupported() { return this._notSupported; }
        get portNotSupported() { return this._portNotSupported; }
        get required() { return this._hostRequired; }
        get notOptional() { return this._hostRequired || this._notSupported; }
        get portRequired() { return this._portRequired; }
        get name() { return this._name; }
        set name(value) {
            if (this._name === (value = sys.asString(value)))
                return;
            this._name = this._previousName = value;
            if (!this._hasName) {
                if (value.length == 0)
                    return;
                this._hasName = true;
            }
            if (this._hasPortNumber)
                this.$scope.originBuilder.encodedHostName = this._name + ":" + this._portNumber;
            else
                this.$scope.originBuilder.encodedHostName = this._name;
        }
        get hasName() { return this._hasName; }
        set hasName(value) {
            if (this._hasName === (value = sys.asBoolean(value)))
                return;
            this._hasName = value;
            if (value) {
                this._name = this._previousName;
                if (this._hasPortNumber)
                    this.$scope.originBuilder.encodedHostName = this._name + ":" + this._portNumber;
                else
                    this.$scope.originBuilder.encodedHostName = this._name;
            }
            else {
                this._previousName = this._name;
                this._name = "";
                this.$scope.originBuilder.encodedHostName = null;
            }
        }
        get noName() { return !this._hasName; }
        get portNumber() { return this._portNumber; }
        set portNumber(value) {
            if (this._portNumber === (value = sys.asString(value)))
                return;
            this._portNumber = this._previousPort = value;
            if (!this._hasPortNumber) {
                if (value.length == 0)
                    return;
                this._hasPortNumber = true;
            }
            if (this._hasPortNumber)
                this.$scope.originBuilder.encodedHostName = this._portNumber + ":" + this._portNumber;
            else
                this.$scope.originBuilder.encodedHostName = (this._hasName) ? this._name : null;
        }
        get hasPortNumber() { return this._hasPortNumber; }
        set hasPortNumber(value) {
            if (this._hasPortNumber === (value = sys.asBoolean(value)))
                return;
            this._hasPortNumber = value;
            if (value) {
                this._portNumber = this._previousPort;
                if (this._hasPortNumber)
                    this.$scope.originBuilder.encodedHostName = this._name + ":" + this._portNumber;
                else
                    this.$scope.originBuilder.encodedHostName = this._name;
            }
            else {
                this._previousPort = this._portNumber;
                this._portNumber = "";
                this.$scope.originBuilder.encodedHostName = (this._hasName) ? this._name : null;
            }
        }
        get noPortNumber() { return !this._hasPortNumber; }
        $onInit() { }
        static createDirective() {
            return {
                require: "^^" + uriBuilder_1.DIRECTIVENAME_uriBuilderOrigin,
                restrict: "E",
                controllerAs: "host",
                controller: ["$scope", UriBuilderHostController],
                transclude: true,
                template: '<ng-transclude></ng-transclude>',
                scope: { noPortClass: "@?", allowsPortClass: "@?" },
                link: (scope, element, attr, originBuilder) => {
                    scope.originBuilder = originBuilder;
                    scope.class = [];
                    let hostController = scope.host;
                    originBuilder.onComponentChange(hostController, hostController.onSchemeComponentChange, UriBuilderComponentChangeArg.scheme);
                    originBuilder.onComponentChange(hostController, hostController.onHostComponentChange, UriBuilderComponentChangeArg.host);
                    let s = sys.asString(scope.noPortClass).trim();
                    if (s.length > 0)
                        hostController._noPortClass = s.split('/\s+');
                    s = sys.asString(scope.allowsPortClass).trim();
                    if (s.length > 0)
                        hostController._allowsPortClass = s.split('/\s+');
                    let scheme = scope.originBuilder.uriBuilder.schemeSpecs;
                    hostController.updateScheme(scheme);
                    if (scheme.host == UriComponentSupportOption.notSupported) {
                        hostController._name = hostController._previousName = hostController._portNumber = hostController._previousPort = "";
                        return;
                    }
                    let value = originBuilder.encodedHostName;
                    if (typeof value === "string") {
                        hostController._hasName = true;
                        if (scheme.password === UriComponentSupportOption.notSupported)
                            hostController._name = hostController._previousName = value;
                        else {
                            let index = value.indexOf(":");
                            if (index < 0) {
                                hostController._name = hostController._previousName = value;
                                hostController._portNumber = hostController._previousPort = "";
                                hostController._hasPortNumber = false;
                            }
                            else {
                                hostController._name = hostController._previousName = value.substr(0, index);
                                hostController._portNumber = hostController._previousPort = value.substr(index + 1);
                                hostController._hasPortNumber = true;
                            }
                        }
                    }
                    else {
                        if (scheme.host !== UriComponentSupportOption.required) {
                            if (hostController._hasName)
                                hostController._previousName = hostController._name;
                            if (hostController._hasPortNumber)
                                hostController._previousPort = hostController._portNumber;
                            hostController._hasName = hostController._hasPortNumber = false;
                        }
                        hostController._name = "";
                    }
                }
            };
        }
        onSchemeComponentChange(component, value, originBuilder) { this.updateScheme(originBuilder.uriBuilder.schemeSpecs); }
        updateScheme(scheme) {
            if (this._hasName)
                this._previousName = this._name;
            if (this._hasPortNumber)
                this._previousPort = this._portNumber;
            if (scheme.host === UriComponentSupportOption.notSupported) {
                this._defaultPort = NaN;
                this._hasName = this._hasPortNumber = this._hostRequired = this._portRequired = false;
                this._notSupported = this._portNotSupported = true;
                this._name = this._portNumber = "";
            }
            else {
                this._notSupported = false;
                this._previousName = this._name;
                if (scheme.host == UriComponentSupportOption.required) {
                    if (!this._hasName)
                        this._name = this._previousName;
                    this._hasName = this._hostRequired = true;
                }
                else
                    this._hostRequired = false;
                if (scheme.port === UriComponentSupportOption.notSupported) {
                    this._defaultPort = NaN;
                    this._hasPortNumber = this._portRequired = false;
                    this._portNotSupported = true;
                    this._portNumber = "";
                }
                else {
                    this._portNotSupported = true;
                    this._previousPort = this._portNumber;
                    if (scheme.port == UriComponentSupportOption.required) {
                        this._portRequired = true;
                        if (!this._hasPortNumber && this._hasName)
                            this._portNumber = this._previousPort;
                        this._hasPortNumber = this._hasName;
                    }
                    else
                        this._hostRequired = false;
                }
            }
        }
        onHostComponentChange(component, value, originBuilder) {
            let scheme = this.$scope.originBuilder.uriBuilder.schemeSpecs;
            if (scheme.host == UriComponentSupportOption.notSupported)
                return;
            if (typeof value === "string") {
                this._hasName = true;
                if (scheme.password === UriComponentSupportOption.notSupported)
                    this._name = this._previousName = value;
                else {
                    let index = value.indexOf(":");
                    if (index < 0) {
                        this._name = this._previousName = value;
                        this._portNumber = this._previousPort = "";
                        this._hasPortNumber = false;
                    }
                    else {
                        this._name = this._previousName = value.substr(0, index);
                        this._portNumber = this._previousPort = value.substr(index + 1);
                        this._hasPortNumber = true;
                    }
                }
            }
            else {
                if (scheme.host !== UriComponentSupportOption.required) {
                    if (this._hasName)
                        this._previousName = this._name;
                    if (this._hasPortNumber)
                        this._previousPort = this._portNumber;
                    this._hasName = this._hasPortNumber = false;
                }
                this._name = "";
            }
        }
    }
    app.mainModule.directive(uriBuilder_1.DIRECTIVENAME_uriBuilderHost, UriBuilderHostController.createDirective);
    // #endregion noPortClass="" allowsPortClass
    // #region uri-builder-path directive
    uriBuilder_1.DIRECTIVENAME_uriBuilderPath = "uriBuilderPath";
    class UriBuilderPathController {
        // #region Properties
        // #endregion
        constructor($scope) {
            this.$scope = $scope;
        }
        // #region Methods
        $onInit() { }
        static createDirective() {
            return {
                require: "^^" + uriBuilder_1.DIRECTIVENAME_uriBuilder,
                restrict: "E",
                controllerAs: "pathBuilder",
                controller: ["$scope", UriBuilderPathController],
                transclude: true,
                template: '<ng-transclude></ng-transclude>',
                link: (scope, element, attr, controller) => {
                    scope.uriBuilder = controller;
                    controller.onIsEditingEncodedUriStringChanged((isEditingEncodedUriString, encodedUriString) => {
                        if (isEditingEncodedUriString)
                            element.hide();
                        else if (controller.isAbsoluteUri)
                            element.show();
                    });
                    controller.onIsAbsoluteUriChanged((isAbsoluteUri, isEditingEncodedUriString) => {
                        if (!isEditingEncodedUriString)
                            return;
                        if (isAbsoluteUri)
                            element.show();
                        else
                            element.hide();
                    });
                }
            };
        }
    }
    app.mainModule.directive(uriBuilder_1.DIRECTIVENAME_uriBuilderPath, UriBuilderPathController.createDirective);
    // #endregion
    // #region uri-builder-query directive
    uriBuilder_1.DIRECTIVENAME_uriBuilderQuery = "uriBuilderQuery";
    class UriBuilderQueryController {
        // #region Properties
        // #endregion
        constructor($scope) {
            this.$scope = $scope;
        }
        // #region Methods
        $onInit() { }
        static parseQuery(uriString, uriBuilder) {
            let index = uriString.indexOf("?");
            if (index >= 0) {
                uriBuilder.encodedQueryString = uriString.substr(index + 1);
                return uriString.substr(0, index);
            }
            if (uriBuilder.schemeSpecs.query === UriComponentSupportOption.required)
                uriBuilder.encodedQueryString = "";
            else
                uriBuilder.encodedQueryString = null;
            return uriString;
        }
        static createDirective() {
            return {
                require: "^^" + uriBuilder_1.DIRECTIVENAME_uriBuilder,
                restrict: "E",
                controllerAs: "queryBuilder",
                controller: ["$scope", UriBuilderQueryController],
                transclude: true,
                template: '<ng-transclude></ng-transclude>',
                link: (scope, element, instanceAttributes, controller) => {
                    scope.uriBuilder = controller;
                    controller.onIsEditingEncodedUriStringChanged((isEditingEncodedUriString, encodedUriString) => {
                        if (isEditingEncodedUriString)
                            element.hide();
                        else if (controller.isAbsoluteUri)
                            element.show();
                    });
                    controller.onIsAbsoluteUriChanged((isAbsoluteUri, isEditingEncodedUriString) => {
                        if (!isEditingEncodedUriString)
                            return;
                        if (isAbsoluteUri)
                            element.show();
                        else
                            element.hide();
                    });
                }
            };
        }
    }
    app.mainModule.directive(uriBuilder_1.DIRECTIVENAME_uriBuilderQuery, UriBuilderQueryController.createDirective);
    // #endregion
    // #region uri-builder-fragment directive
    uriBuilder_1.DIRECTIVENAME_uriBuilderFragment = "uriBuilderFragment";
    class UriBuilderFragmentController {
        // #region Properties
        // #endregion
        constructor($scope) {
            this.$scope = $scope;
        }
        // #region Methods
        $onInit() { }
        static parseFragment(uriString, uriBuilder) {
            let index = uriString.indexOf("#");
            if (index >= 0) {
                uriBuilder.encodedFragment = uriString.substr(index + 1);
                return uriString.substr(0, index);
            }
            if (uriBuilder.schemeSpecs.fragment === UriComponentSupportOption.required)
                uriBuilder.encodedFragment = "";
            else
                uriBuilder.encodedFragment = null;
            return uriString;
        }
        static createDirective() {
            return {
                require: "^^" + uriBuilder_1.DIRECTIVENAME_uriBuilder,
                restrict: "E",
                controllerAs: "fragmentBuilder",
                controller: ["$scope", UriBuilderFragmentController],
                transclude: true,
                template: '<ng-transclude></ng-transclude>',
                link: (scope, element, instanceAttributes, uriBuilder) => {
                    scope.uriBuilder = uriBuilder;
                    uriBuilder.onIsEditingEncodedUriStringChanged((isEditingEncodedUriString, encodedUriString) => {
                        if (isEditingEncodedUriString)
                            element.hide();
                        else if (uriBuilder.isAbsoluteUri)
                            element.show();
                    });
                    uriBuilder.onIsAbsoluteUriChanged((isAbsoluteUri, isEditingEncodedUriString) => {
                        if (!isEditingEncodedUriString)
                            return;
                        if (isAbsoluteUri)
                            element.show();
                        else
                            element.hide();
                    });
                }
            };
        }
    }
    app.mainModule.directive(uriBuilder_1.DIRECTIVENAME_uriBuilderFragment, UriBuilderFragmentController.createDirective);
    // #endregion
    // #region uri-builder-origin directive
    uriBuilder_1.DIRECTIVENAME_uriBuilderOrigin = "uriBuilderOrigin";
    class UriBuilderOriginController {
        // #endregion
        constructor($scope, $log) {
            this.$scope = $scope;
            this._onEncodedComponentChanged = [];
            this._encodedUserName = null;
            this._encodedPassword = null;
            this._encodedHostName = "";
            this._encodedPortNumber = null;
            this._changeManager = new ComponentChangeManager((component, value) => {
                this._onEncodedComponentChanged.filter((v) => v[0] === component)
                    .forEach((v) => v[1].call(v[2], component, value, this));
            }, this);
        }
        // #region properties
        get encodedUserName() { return this._encodedUserName; }
        set encodedUserName(value) {
            if (this._encodedUserName === (value = sys.asStringOrNull(value)))
                return;
            this._encodedUserName = value;
            this.$scope.uriBuilder.encodedUserInfo = (typeof this._encodedUserName !== "string" || this._encodedPassword !== "string") ? this._encodedUserName : this._encodedUserName + ":" + this._encodedPassword;
            this._changeManager.raiseChange(UriBuilderComponentChangeArg.username, value);
        }
        get encodedPassword() { return this._encodedPassword; }
        set encodedPassword(value) {
            if (this._encodedPassword === (value = sys.asStringOrNull(value)))
                return;
            this._encodedPassword = value;
            this.$scope.uriBuilder.encodedUserInfo = (typeof this._encodedUserName !== "string" || this._encodedPassword !== "string") ? this._encodedUserName : this._encodedUserName + ":" + this._encodedPassword;
            this._changeManager.raiseChange(UriBuilderComponentChangeArg.password, value);
        }
        get encodedHostName() { return this._encodedHostName; }
        set encodedHostName(value) {
            if (this._encodedHostName === (value = sys.asStringOrNull(value)))
                return;
            this._encodedHostName = value;
            this.$scope.uriBuilder.encodedHost = (typeof this._encodedHostName !== "string" || this._encodedPortNumber !== "string") ? this._encodedHostName : this._encodedHostName + ":" + this._encodedPortNumber;
            this._changeManager.raiseChange(UriBuilderComponentChangeArg.hostname, value);
        }
        get encodedPortNumber() { return this._encodedPortNumber; }
        set encodedPortNumber(value) {
            if (this._encodedPortNumber === (value = sys.asStringOrNull(value)))
                return;
            this._encodedPortNumber = value;
            this.$scope.uriBuilder.encodedHost = (typeof this._encodedHostName !== "string" || this._encodedPortNumber !== "string") ? this._encodedHostName : this._encodedHostName + ":" + this._encodedPortNumber;
            this._changeManager.raiseChange(UriBuilderComponentChangeArg.port, value);
        }
        get uriBuilder() { return this.$scope.uriBuilder; }
        // #region Methods
        static createDirective() {
            return {
                require: "^^" + uriBuilder_1.DIRECTIVENAME_uriBuilder,
                restrict: "E",
                controllerAs: "originBuilder",
                controller: ["$scope", "$log", UriBuilderOriginController],
                transclude: true,
                template: '<ng-transclude></ng-transclude>',
                link: (scope, element, instanceAttributes, uriBuilder) => {
                    scope.uriBuilder = uriBuilder;
                    uriBuilder.onIsEditingEncodedUriStringChanged((isEditingEncodedUriString, encodedUriString) => {
                        if (isEditingEncodedUriString)
                            element.hide();
                        else if (uriBuilder.isAbsoluteUri)
                            element.show();
                    });
                    uriBuilder.onIsAbsoluteUriChanged((isAbsoluteUri, isEditingEncodedUriString) => {
                        if (!isEditingEncodedUriString)
                            return;
                        if (isAbsoluteUri)
                            element.show();
                        else
                            element.hide();
                    });
                    let originBuilder = scope.originBuilder;
                    uriBuilder.onComponentChange(originBuilder, originBuilder.onSchemeComponentChange, UriBuilderComponentChangeArg.scheme);
                    uriBuilder.onComponentChange(originBuilder, originBuilder.onUserInfoComponentChange, UriBuilderComponentChangeArg.userinfo);
                    uriBuilder.onComponentChange(originBuilder, originBuilder.onHostComponentChange, UriBuilderComponentChangeArg.host);
                    uriBuilder.onIsEditingEncodedUriStringChanged((isEditingEncodedUriString, encodedUriString) => originBuilder.onIsEditingEncodedUriStringChanged(isEditingEncodedUriString, encodedUriString));
                    uriBuilder.onIsAbsoluteUriChanged((isAbsoluteUri, isEditingEncodedUriString) => originBuilder.onIsAbsoluteUriChanged(isAbsoluteUri, isEditingEncodedUriString));
                }
            };
        }
        $onInit() { }
        onComponentChange(thisArg, callback, ...component) {
            component.forEach((c) => {
                let arr = this._onEncodedComponentChanged.filter((v) => v[0] === c);
                if (arr.length > 0) {
                    arr[0][1] = sys.chainCallback(arr[0][1], callback);
                    arr[0][2] = thisArg;
                }
                else if (typeof callback === "function")
                    this._onEncodedComponentChanged.push([c, callback, thisArg]);
            });
        }
        static parseOrigin(uriString, uriBuilder) {
            if (uriBuilder.isRelativeUri) {
                uriBuilder.encodedUserInfo = uriBuilder.encodedHost = null;
                return uriString;
            }
            let s = uriBuilder.schemeSpecs.name + uriBuilder.schemeSpecs.separator;
            if (uriString.startsWith(s))
                uriString = uriString.substr(s.length);
            let m;
            if (uriBuilder.schemeSpecs.username == UriComponentSupportOption.notSupported)
                uriBuilder.encodedUserInfo = null;
            else if (uriBuilder.schemeSpecs.password == UriComponentSupportOption.notSupported) {
                m = uriBuilder_1.userNameParseRe.exec(uriString);
                if (sys.isNilOrEmpty(m)) {
                    if (uriBuilder.schemeSpecs.username == UriComponentSupportOption.required)
                        uriBuilder.encodedUserInfo = "";
                    else
                        uriBuilder.encodedUserInfo = null;
                }
                else {
                    uriBuilder.encodedUserInfo = m[1];
                    uriString = uriString.substr(m[0].length);
                }
            }
            else {
                m = uriBuilder_1.userPwParseRe.exec(uriString);
                if (sys.isNilOrEmpty(m)) {
                    if (uriBuilder.schemeSpecs.username == UriComponentSupportOption.required)
                        uriBuilder.encodedUserInfo = (uriBuilder.schemeSpecs.password == UriComponentSupportOption.required) ? ":" : "";
                    else
                        uriBuilder.encodedUserInfo = null;
                }
                else {
                    uriBuilder.encodedUserInfo = (sys.isNil(m[3]) && uriBuilder.schemeSpecs.password == UriComponentSupportOption.required) ? m[1] + ":" : m[1];
                    uriString = uriString.substr(m[0].length);
                }
            }
            if (uriBuilder.schemeSpecs.hostname === UriComponentSupportOption.notSupported)
                uriBuilder.encodedHost = null;
            else if (uriBuilder.schemeSpecs.port === UriComponentSupportOption.notSupported) {
                m = uriBuilder_1.hostNameParseRe.exec(uriString);
                if (sys.isNilOrEmpty(m)) {
                    if (uriBuilder.schemeSpecs.hostname === UriComponentSupportOption.required)
                        uriBuilder.encodedHost = "";
                    else
                        uriBuilder.encodedHost = null;
                }
                else {
                    uriBuilder.encodedHost = m[0];
                    return uriString.substr(m[0].length);
                }
            }
            else {
                m = uriBuilder_1.hostPortParseRe.exec(uriString);
                if (sys.isNilOrEmpty(m)) {
                    if (uriBuilder.schemeSpecs.host === UriComponentSupportOption.required)
                        uriBuilder.encodedHost = (uriBuilder.schemeSpecs.port === UriComponentSupportOption.required) ? ((isNaN(uriBuilder.schemeSpecs.defaultPort)) ? ":" : ":" + uriBuilder.schemeSpecs.defaultPort.toString()) : "";
                    else
                        uriBuilder.encodedHost = null;
                }
                else {
                    uriBuilder.encodedHost = (sys.isNil(m[2]) && uriBuilder.schemeSpecs.host === UriComponentSupportOption.required) ? m[1] + ((isNaN(uriBuilder.schemeSpecs.defaultPort)) ? ":" : ":" + uriBuilder.schemeSpecs.defaultPort.toString()) : m[0];
                    return uriString.substr(m[0].length);
                }
            }
            return uriString;
        }
        onSchemeComponentChange(component, value, uriBuilder) { this._changeManager.raiseChange(component, value); }
        onUserInfoComponentChange(component, value, uriBuilder) {
            this._changeManager.doChange(() => {
                if (sys.isNil(value))
                    this.encodedUserName = this.encodedPassword = null;
                else if (uriBuilder.schemeSpecs.password === UriComponentSupportOption.notSupported) {
                    this.encodedUserName = value;
                    this.encodedPassword = null;
                }
                else {
                    let index = value.indexOf(":");
                    if (index < 0) {
                        this.encodedUserName = value;
                        this.encodedPassword = null;
                    }
                    else {
                        this.encodedUserName = value.substr(0, index);
                        this.encodedPassword = value.substr(index + 1);
                    }
                }
            }, this);
        }
        onHostComponentChange(component, value, uriBuilder) {
            this._changeManager.doChange(() => {
                if (sys.isNil(value))
                    this.encodedHostName = this.encodedPortNumber = null;
                else if (uriBuilder.schemeSpecs.port === UriComponentSupportOption.notSupported) {
                    this.encodedHostName = value;
                    this.encodedPortNumber = null;
                }
                else {
                    let index = value.indexOf(":");
                    if (index < 0) {
                        this.encodedHostName = value;
                        this.encodedPortNumber = null;
                    }
                    else {
                        this.encodedHostName = value.substr(0, index);
                        this.encodedPortNumber = value.substr(index + 1);
                    }
                }
            }, this);
        }
        onIsEditingEncodedUriStringChanged(isEditingEncodedUriString, encodedUriString) {
        }
        onIsAbsoluteUriChanged(isAbsoluteUri, isEditingEncodedUriString) {
        }
    }
    app.mainModule.directive(uriBuilder_1.DIRECTIVENAME_uriBuilderOrigin, UriBuilderOriginController.createDirective);
    // #endregion
    // #region uri-builder element directive
    uriBuilder_1.DIRECTIVENAME_uriBuilder = "uriBuilder";
    let UriBuilderComponentChangeArg;
    (function (UriBuilderComponentChangeArg) {
        UriBuilderComponentChangeArg[UriBuilderComponentChangeArg["uriString"] = 0] = "uriString";
        UriBuilderComponentChangeArg[UriBuilderComponentChangeArg["scheme"] = 1] = "scheme";
        UriBuilderComponentChangeArg[UriBuilderComponentChangeArg["userinfo"] = 2] = "userinfo";
        UriBuilderComponentChangeArg[UriBuilderComponentChangeArg["username"] = 3] = "username";
        UriBuilderComponentChangeArg[UriBuilderComponentChangeArg["password"] = 4] = "password";
        UriBuilderComponentChangeArg[UriBuilderComponentChangeArg["host"] = 5] = "host";
        UriBuilderComponentChangeArg[UriBuilderComponentChangeArg["hostname"] = 6] = "hostname";
        UriBuilderComponentChangeArg[UriBuilderComponentChangeArg["port"] = 7] = "port";
        UriBuilderComponentChangeArg[UriBuilderComponentChangeArg["path"] = 8] = "path";
        UriBuilderComponentChangeArg[UriBuilderComponentChangeArg["query"] = 9] = "query";
        UriBuilderComponentChangeArg[UriBuilderComponentChangeArg["fragment"] = 10] = "fragment";
    })(UriBuilderComponentChangeArg || (UriBuilderComponentChangeArg = {}));
    class UriBuilderController {
        // #endregion
        constructor($scope, $log) {
            this.$scope = $scope;
            this.$log = $log;
            this._onEncodedComponentChanged = [];
            this._lastParsedUriString = "";
            this._lastParsedUriIsAbsolute = false;
            this._encodedUriString = "";
            this._encodedUserInfo = "";
            this._encodedHost = "";
            this._encodedPathString = null;
            this._encodedQueryString = null;
            this._encodedFragment = null;
            this._isEditingEncodedUriString = true;
            this._isAbsoluteUri = false;
            this._schemeSpecs = UriSchemeSpecification.uriScheme_http;
            $log.info("Creating UriBuilderController");
            this._changeManager = new ComponentChangeManager((component, value) => {
                this._onEncodedComponentChanged.filter((v) => v[0] === component)
                    .forEach((v) => v[1].call(v[2], component, value, this));
            }, this);
        }
        // #region Properties
        get encodedUriString() { return this._encodedUriString; }
        set encodedUriString(value) {
            if (this._encodedUriString === (value = sys.asString(value)))
                return;
            this._encodedUriString = value;
            this._changeManager.raiseChange(UriBuilderComponentChangeArg.uriString, value);
        }
        get encodedUserInfo() { return this._encodedUserInfo; }
        set encodedUserInfo(value) {
            if (this._encodedUserInfo === (value = sys.asStringOrNull(value)))
                return;
            this._encodedUserInfo = value;
            this._changeManager.raiseChange(UriBuilderComponentChangeArg.userinfo, value);
        }
        get encodedHost() { return this._encodedHost; }
        set encodedHost(value) {
            if (this._encodedHost === (value = sys.asStringOrNull(value)))
                return;
            this._encodedHost = value;
            this._changeManager.raiseChange(UriBuilderComponentChangeArg.host, value);
        }
        get encodedPathString() { return this._encodedPathString; }
        set encodedPathString(value) {
            if (this._encodedPathString === (value = sys.asStringOrNull(value)))
                return;
            this._encodedPathString = value;
            this._changeManager.raiseChange(UriBuilderComponentChangeArg.path, value);
        }
        get encodedQueryString() { return this._encodedQueryString; }
        set encodedQueryString(value) {
            if (this._encodedQueryString === (value = sys.asStringOrNull(value)))
                return;
            this._encodedQueryString = value;
            this._changeManager.raiseChange(UriBuilderComponentChangeArg.query, value);
        }
        get encodedFragment() { return this._encodedFragment; }
        set encodedFragment(value) {
            if (this._encodedFragment === (value = sys.asStringOrNull(value)))
                return;
            this._encodedFragment = value;
            this._changeManager.raiseChange(UriBuilderComponentChangeArg.fragment, value);
        }
        get isChanging() { return this._changeManager.isChanging; }
        get isEditingEncodedUriString() { return this._isEditingEncodedUriString; }
        set isEditingEncodedUriString(value) { this.setIsEditingEncodedUriString(sys.asBoolean(value, false)); }
        get isEditingUriComponents() { return !this._isEditingEncodedUriString; }
        set isEditingUriComponents(value) { this.setIsEditingEncodedUriString(!sys.asBoolean(value, false)); }
        get isAbsoluteUri() { return this._isAbsoluteUri; }
        set isAbsoluteUri(value) { this.setIsAbsoluteUri(sys.asBoolean(value, false)); }
        get isRelativeUri() { return !this._isAbsoluteUri; }
        set isRelativeUri(value) { this.setIsAbsoluteUri(!sys.asBoolean(value, false)); }
        get schemeSpecs() { return this._schemeSpecs; }
        set schemeSpecs(value) {
            if (sys.isNil(value) || this._schemeSpecs.isEqualTo(value))
                return;
            this._schemeSpecs = value;
            this._changeManager.raiseChange(UriBuilderComponentChangeArg.scheme, value.name + value.separator);
        }
        // #region Methods
        setIsAbsoluteUri(value) {
            if (this._isAbsoluteUri === value)
                return;
            this._isAbsoluteUri = value;
            sys.execIfFunction(this._onIsAbsoluteUriChanged, value, this._isEditingEncodedUriString);
        }
        setIsEditingEncodedUriString(value) {
            if (this._isEditingEncodedUriString === value)
                return;
            this._isEditingEncodedUriString = value;
            if (value)
                this.rebuildEncodedUri();
            else
                this.parseEncodedUriString();
            sys.execIfFunction(this._onIsEditingEncodedUriStringChanged, value, this._encodedUriString);
        }
        parseEncodedUriString() {
            this._changeManager.doChange(() => {
                let value = this._encodedUriString;
                let scheme = UriBuilderSchemeController.detectScheme(value, this);
                let index;
                if (typeof scheme === "undefined") {
                    this.isAbsoluteUri = false;
                    this.schemeSpecs = scheme = UriSchemeSpecification.uriScheme_http;
                    if (scheme.fragment != UriComponentSupportOption.notSupported)
                        value = UriBuilderFragmentController.parseFragment(value, this);
                    if (scheme.query != UriComponentSupportOption.notSupported)
                        value = UriBuilderQueryController.parseQuery(value, this);
                }
                else {
                    this.isAbsoluteUri = true;
                    this.schemeSpecs = scheme;
                    if (scheme.fragment != UriComponentSupportOption.notSupported)
                        value = UriBuilderFragmentController.parseFragment(value, this);
                    if (scheme.query != UriComponentSupportOption.notSupported)
                        value = UriBuilderQueryController.parseQuery(value, this);
                    value = UriBuilderOriginController.parseOrigin(value, this);
                }
                if (scheme.path != UriComponentSupportOption.notSupported || value.length > 0)
                    this.encodedPathString = value;
                else
                    this.encodedPathString = null;
            }, this);
        }
        rebuildEncodedUri() {
            let uriString = sys.asString(this._encodedPathString);
            if (this._isAbsoluteUri) {
                if (uriString.length > 0) {
                    let c = uriString.substr(0, 1);
                    if (c !== "/" && c !== "\\" && c !== ":")
                        uriString = "/" + uriString;
                }
                uriString = sys.asString(this._encodedHost) + uriString;
                if (typeof this._encodedUserInfo === "string")
                    uriString = this._encodedUserInfo + "@" + uriString;
                uriString = this._schemeSpecs.name + this._schemeSpecs.separator + uriString;
            }
            if (typeof this._encodedQueryString === "string")
                uriString += "?" + this._encodedQueryString;
            this.encodedUriString = (typeof this._encodedFragment === "string") ? uriString + "#" + this._encodedFragment : uriString;
        }
        onIsEditingEncodedUriStringChanged(callback) {
            this._onIsEditingEncodedUriStringChanged = sys.chainCallback(this._onIsEditingEncodedUriStringChanged, callback);
        }
        onIsAbsoluteUriChanged(callback) {
            this._onIsAbsoluteUriChanged = sys.chainCallback(this._onIsAbsoluteUriChanged, callback);
        }
        onComponentChange(thisArg, callback, ...component) {
            this.$log.debug("Component change", component);
            component.forEach((c) => {
                let arr = this._onEncodedComponentChanged.filter((v) => v[0] === c);
                if (arr.length > 0) {
                    arr[0][1] = sys.chainCallback(arr[0][1], callback);
                    arr[0][2] = thisArg;
                }
                else if (typeof callback === "function")
                    this._onEncodedComponentChanged.push([c, callback, thisArg]);
            });
        }
        showUriComponents() { this.isEditingUriComponents = true; }
        showEncodedUriString() { this.isEditingEncodedUriString = true; }
        $onInit() { }
        static createDirective() {
            return {
                restrict: "E",
                controllerAs: "uriBuilder",
                controller: ["$scope", "$log", UriBuilderController],
                transclude: true,
                template: '<ng-transclude></ng-transclude>'
            };
        }
    }
    app.mainModule.directive(uriBuilder_1.DIRECTIVENAME_uriBuilder, UriBuilderController.createDirective);
    // #endregion
})(uriBuilder || (uriBuilder = {}));
//# sourceMappingURL=UriBuilder.js.map