/// <reference path="Scripts/typings/jquery/jquery.d.ts"/>
/// <reference path="Scripts/typings/angularjs/angular.d.ts"/>
/// <reference path="app.ts"/>
var uriBuilder;
(function (uriBuilder) {
    let schemeRegex = /^([^:\\\/@]+)?:(\/\/?)?/;
    let userInfoRegex = /^([^:\\\/@]+)?(:([^:\\\/@]+)?)?@/;
    let hostAndPortRegex = /^([^:\\\/@]+)?(:(\d+))?@/;
    let separatorRegex = /[\\\/:]/;
    let uriParseRegex = /^(([^\\\/@:]*)(:[\\\/]{0,2})((?=[^\\\/@:]*(?::[^\\\/@:]*)?@)([^\\\/@:]*)(:[^\\\/@:]*)?@)?([^\\\/@:]*)(?:(?=:\d*(?:[\\\/:]|$)):(\d*))?(?=[\\\/:]|$))?(.+)?$/;
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
    class UriBuilderController {
        constructor($Scope) {
            this.$Scope = $Scope;
            this._href = '';
            this._schemeName = '';
            this._selectedSeparator = '';
            this._userName = '';
            this._password = '';
            this._hostName = '';
            this._port = '';
            this._path = [];
            this._query = [];
            this._fragment = '';
            $Scope.href = 'http://myuser:mypw@www.erwinefamily.net:8080/test/path/page.html?the=query#fragmented';
            $Scope.originEnabled = true;
            $Scope.schemeName = 'http';
            $Scope.schemeOptions = ['http://', 'https://', 'ftp://'];
            $Scope.setScheme = this.setScheme;
            $Scope.setSeparator = this.setSeparator;
            $Scope.selectedSeparator = '://';
            $Scope.enableUsername = true;
            $Scope.username = 'myuser';
            $Scope.enablePassword = true;
            $Scope.password = 'mypw';
            $Scope.host = 'www.erwinefamily.net';
            $Scope.port = '8080';
            $Scope.path = [{ separator: '/', name: 'test' }, { separator: '/', name: 'path' }, { separator: '/', name: 'page.html' }];
            $Scope.enableQuery = true;
            $Scope.query = [{ key: 'the', value: 'query', keyOnly: false }];
            $Scope.enableFragment = true;
            $Scope.fragment = 'fragmented';
        }
        setScheme(value) {
            let i = value.indexOf(':');
            this.$Scope.schemeName = value.substr(0, i);
            this.$Scope.selectedSeparator = value.substr(i);
        }
        setSeparator(value) {
            this.$Scope.selectedSeparator = value;
        }
        $onInit() {
            if (this._href !== this.$Scope.href) {
                let href = this.$Scope.href;
                let i = href.indexOf('#');
                if (i < 0) {
                    this.$Scope.enableFragment = false;
                    this.$Scope.fragment = this._fragment = '';
                }
                else {
                    this.$Scope.enableFragment = false;
                    this.$Scope.fragment = this._fragment = href.substr(i + 1);
                    this.$Scope.enableFragment = true;
                    href = href.substr(0, i);
                }
                this.$Scope.query = [];
                this._query = [];
                i = href.indexOf('?');
                if (i < 0)
                    this.$Scope.enableQuery = false;
                else {
                    this.$Scope.query = href.substr(i + 1).split('&').map(function (s) {
                        let x = s.indexOf('=');
                        if (x < 0)
                            return { key: decodeURIComponent(s), keyOnly: true, value: '' };
                        return { key: decodeURIComponent(s.substr(0, x)), keyOnly: false, value: decodeURIComponent(s.substr(x + 1)) };
                    });
                    this.$Scope.enableQuery = true;
                    href = href.substr(0, i);
                }
                let m = schemeRegex.exec(this.$Scope.href);
                if (app.isNil(m) || m.length == 0) {
                    this.$Scope.originEnabled = this.$Scope.enableUsername = this.$Scope.enablePassword = this.$Scope.enablePort = false;
                    this._schemeName = this.$Scope.schemeName = this._userName = this.$Scope.username = this._password = this.$Scope.password = this._hostName = this.$Scope.host =
                        this._port = this.$Scope.port = '';
                }
                else {
                    this.$Scope.originEnabled = true;
                    this.$Scope.schemeName = this._schemeName = (app.isNil(m[1])) ? '' : m[1];
                    this.$Scope.selectedSeparator = this._selectedSeparator = (app.isNil(m[2])) ? ':' : ':' + m[2];
                    href = href.substr(m[0].length);
                    m = userInfoRegex.exec(href);
                    if (app.isNil(m) || m.length == 0) {
                        this.$Scope.enableUsername = this.$Scope.enablePassword = false;
                        this.$Scope.username = this.$Scope.password = this._userName = this._password = '';
                    }
                    else {
                        this.$Scope.enableUsername = true;
                        this.$Scope.username = this._userName = (app.isNil(m[1])) ? '' : m[1];
                        if (app.isNil(m[2])) {
                            this.$Scope.enablePassword = false;
                            this.$Scope.password = this._password = '';
                        }
                        else {
                            this.$Scope.enablePassword = true;
                            this.$Scope.password = this._password = (app.isNil(m[3])) ? '' : m[3];
                        }
                        href = href.substr(m[0].length);
                    }
                    m = hostAndPortRegex.exec(href);
                    if (app.isNil(m) || m.length == 0) {
                        this.$Scope.enablePort = false;
                        this.$Scope.port = this._port = '';
                    }
                    else {
                        this.$Scope.host = this._hostName = (app.isNil(m[1])) ? '' : m[1];
                        if (app.isNil(m[2])) {
                            this.$Scope.enablePort = false;
                            this.$Scope.port = this._port = '';
                        }
                        else {
                            this.$Scope.enablePort = true;
                            this.$Scope.port = this._port = (app.isNil(m[3])) ? '' : m[3];
                        }
                        href = href.substr(m[0].length);
                    }
                }
                this._path = [];
                m = separatorRegex.exec(href);
                let s = '';
                if (!(app.isNil(m) || m.length == 0)) {
                    if (m.index > 0) {
                        s = href.substr(0, i);
                        this._path.push({ separator: '', name: s });
                        this.$Scope.path.push({ separator: '', name: s });
                        s = href.substr(m.index, 1);
                        href = href.substr(m.index + 1);
                    }
                    else {
                        s = href.substr(0, 1);
                        href = href.substr(1);
                    }
                    m = separatorRegex.exec(href);
                    while (!(app.isNil(m) || m.length == 0)) {
                        let n = href.substr(0, i);
                        this._path.push({ separator: s, name: n });
                        this.$Scope.path.push({ separator: s, name: n });
                        s = href.substr(m.index, 1);
                        href = href.substr(m.index + 1);
                    }
                }
                this._path.push({ separator: s, name: href });
                this.$Scope.path.push({ separator: s, name: href });
                return;
            }
        }
        $doCheck() {
            console.info("check...");
        }
    }
    ;
    class UriQueryParamItem {
        constructor(name, value) {
            this.hasChanges = false;
            if (typeof (value) === 'boolean') {
                if (typeof (name) !== 'string')
                    throw new Error("Query parameter name value pair string must be a string value");
                if (value) {
                    this._encodedPair = name;
                    this._separatorIndex = name.indexOf('=');
                    return;
                }
                else {
                    let index = name.indexOf('=');
                    if (index < 0) {
                        this._name = name;
                        this._value = undefined;
                    }
                    else {
                        this._name = name.substr(0, index);
                        this._value = name.substr(index + 1);
                    }
                }
            }
            else {
                if (typeof (name) === 'object') {
                    if (typeof (name.name) !== 'string')
                        throw new Error("Query parameter name must be a string value");
                    this._name = name.name;
                    if (typeof (name.value) === 'undefined' || value === null)
                        this._value = undefined;
                    else {
                        if (typeof (name.value) !== 'string')
                            throw new Error("If defined, query parameter value must be a string or null value.");
                        this._value = name.value;
                    }
                }
                else {
                    if (typeof (name) !== 'string')
                        throw new Error("Query parameter name must be a string value");
                    this._name = name;
                    if (typeof (value) === 'undefined' || value === null)
                        this._value = undefined;
                    else {
                        if (typeof (value) !== 'string')
                            throw new Error("If defined, query parameter value must be a string or null value.");
                        this._value = value;
                    }
                }
                this._encodedPair = undefined;
            }
        }
        get name() {
            if (typeof (this._name) !== 'string')
                this._name = decodeURIComponent((this._separatorIndex < 0) ? this._encodedPair : this._encodedPair.substr(0, this._separatorIndex));
            return this._name;
        }
        set name(s) {
            if (typeof (s) !== 'string')
                throw new Error("Query parameter name string must be a string value");
            if (s !== this._name) {
                if (typeof (this._value) === 'string' || this._separatorIndex < 0) {
                    this._encodedPair = undefined;
                    this._separatorIndex = -1;
                }
                else {
                    let e = encodeURIComponent(s);
                    this._encodedPair = e + '=' + this._encodedPair.substr(this._separatorIndex + 1);
                    this._separatorIndex = e.length;
                }
                this._name = s;
                this.hasChanges = true;
            }
        }
        get value() {
            if (typeof (this._name) !== 'string')
                this._name = decodeURIComponent((this._separatorIndex < 0) ? this._encodedPair : this._encodedPair.substr(0, this._separatorIndex));
            return this._name;
        }
        set value(s) {
            if (typeof (s) === 'undefined' || s === null) {
                if (typeof (this._value) === 'undefined')
                    return;
                if (typeof (this._name) === 'string')
                    this._encodedPair = undefined;
                else
                    this._encodedPair = this._encodedPair.substr(0, this._separatorIndex);
                this._separatorIndex = -1;
                this._value = undefined;
            }
            else {
                if (typeof (s) !== 'string')
                    throw new Error("If defined, query parameter value string must be a string value");
                if (s === this._value)
                    return;
                if (typeof (this._name) === 'string') {
                    this._encodedPair = undefined;
                    this._separatorIndex = -1;
                }
                else
                    this._encodedPair = this._encodedPair.substr(0, this._separatorIndex) + '=' + encodeURIComponent(s);
                this._value = s;
            }
            this.hasChanges = true;
        }
        get encodedPair() {
            if (typeof (this._encodedPair) !== 'string') {
                this._encodedPair = encodeURIComponent(this._name);
                if (typeof (this._value) === 'string') {
                    this._separatorIndex = this._encodedPair.length;
                    this._encodedPair = this._encodedPair + '=' + encodeURIComponent(this._value);
                }
                else
                    this._separatorIndex = -1;
            }
            return this._encodedPair;
        }
        set encodedPair(p) {
            if (typeof (p) !== 'string')
                throw new Error("Query parameter name value pair string must be a string value");
            if (p === this._encodedPair)
                return;
            this._encodedPair = p;
            this._separatorIndex = p.indexOf('=');
            this._name = this._value = undefined;
            this.hasChanges = true;
        }
        toString() { return this.encodedPair; }
        toJSON() { return JSON.stringify((typeof (this.value) === 'string') ? { name: this.name, value: this.value } : { name: this.name }); }
    }
    class UriQueryParamIterator {
        constructor(components) {
            this._index = 0;
            this._components = components;
        }
        next() {
            if (this._index < this._components.length) {
                let item = this._components[this._index++];
                return {
                    done: false,
                    value: [item.name, item.value]
                };
            }
            else
                return {
                    done: true,
                    value: null
                };
        }
        [Symbol.iterator]() { return this; }
    }
    class UriQueryNameIterator {
        constructor(components) {
            this._index = 0;
            this._components = components;
        }
        next() {
            if (this._index < this._components.length) {
                let item = this._components[this._index++];
                return {
                    done: false,
                    value: item.name
                };
            }
            else
                return {
                    done: true,
                    value: null
                };
        }
        [Symbol.iterator]() { return this; }
    }
    class UriQueryValueIterator {
        constructor(components) {
            this._index = 0;
            this._components = components;
        }
        next() {
            if (this._index < this._components.length) {
                let item = this._components[this._index++];
                return {
                    done: false,
                    value: item.value
                };
            }
            else
                return {
                    done: true,
                    value: null
                };
        }
        [Symbol.iterator]() { return this; }
    }
    class UriQueryParams {
        constructor(value) {
            this._hasChanges = false;
            if (typeof (value) == 'object') {
                if (Array.isArray(value))
                    this._items = value.map(function (i) { return new UriQueryParamItem(i); });
                else {
                    this._items = [];
                    value.forEach(function (value, key) {
                        this._items.push(new UriQueryParamItem(key, value));
                    });
                }
                this._hasQuery = this._items.length > 0;
            }
            else if (typeof (value) !== 'string' || value.length == 0) {
                this._hasQuery = false;
                this._items = [];
            }
            else {
                this._hasQuery = true;
                if (value == '?')
                    this._items = [];
                else
                    this._items = value.substr(1).split("&").map(function (s) { return new UriQueryParamItem(s, true); });
            }
        }
        get hasChanges() { return this._hasChanges || this._items.filter(function (i) { i.hasChanges; }).length > 0; }
        set hasChanges(value) {
            this._hasChanges = value;
            this._items.forEach(function (i) { i.hasChanges = value; });
        }
        get hasQuery() { return this._hasQuery; }
        get length() { return this._items.length; }
        append(name, value) {
            if (typeof (name) !== 'string')
                throw new Error("Name must be a string");
            this._items.push(new UriQueryParamItem(name, value));
            this._hasQuery = true;
        }
        delete(name) {
            if (typeof (name) !== 'string' || this._items.length == 0)
                return;
            let length = this._items.length;
            this._items = this._items.filter(function (i) { return (i.name !== name); });
            if (length == this._items.length)
                return;
            if (this._items.length == 0)
                this._hasQuery = false;
        }
        get(name) {
            if (typeof (name) === 'string') {
                let items = this._items.filter(function (i) { return (i.name === name); });
                if (items.length > 0)
                    return items[0].value;
            }
        }
        getAll(name) {
            if (typeof (name) !== 'string')
                return [];
            return this._items.filter(function (i) { return (i.name === name); }).map(function (i) { return i.value; });
        }
        has(name) {
            return (typeof (name) === 'string' && this._items.filter(function (i) { return (i.name === name); }).length > 0);
        }
        set(name, value) {
            if (typeof (name) !== 'string')
                throw new Error("Name must be a string");
            let thisObj = { foundFirst: false };
            this._items = this._items.filter(function (i) {
                if (i.name !== name)
                    return true;
                if (this.foundFirst)
                    return false;
                this.foundFirst = true;
                i.value = value;
                return true;
            }, thisObj);
            if (!thisObj.foundFirst)
                this._items.push(new UriQueryParamItem(name, value));
            this._hasQuery = true;
        }
        sort() {
            this._items.sort(function (a, b) {
                let lcA, lcB;
                if (a.name !== b.name) {
                    lcA = a.name.toLowerCase();
                    lcB = b.name.toLowerCase();
                    if (lcA === lcB)
                        return (a.name < b.name) ? -1 : 1;
                    return (lcA < lcB) ? -1 : 1;
                }
                if (a.value === b.value)
                    return 0;
                if (typeof (a.value) !== 'string')
                    return -1;
                if (typeof (b.value) !== 'string')
                    return 1;
                lcA = a.value.toLowerCase();
                lcB = b.value.toLowerCase();
                if (lcA === lcB)
                    return (a.value < b.value) ? -1 : 1;
                return (lcA < lcB) ? -1 : 1;
            });
        }
        forEach(callbackfn, thisArg) {
            let thisObj = this;
            this._items.forEach(function (i) {
                callbackfn(i.value, i.name, thisObj);
            }, thisArg);
        }
        reset(queryString) {
            if (typeof (queryString) !== 'string' || queryString.length == 0) {
                this._hasQuery = false;
                this._items = [];
            }
            else {
                this._hasQuery = true;
                if (queryString == '?')
                    this._items = [];
                else
                    this._items = queryString.substr(1).split("&").map(function (s) { return new UriQueryParamItem(s, true); });
            }
        }
        [Symbol.iterator]() { return this.entries(); }
        entries() { return new UriQueryParamIterator(this._items); }
        keys() { return new UriQueryNameIterator(this._items); }
        values() { return new UriQueryValueIterator(this._items); }
        toString() {
            if (!this._hasQuery)
                return "";
            return "?" + this._items.map(function (i) { return i.encodedPair; }).join("&");
        }
        toJSON() { return JSON.stringify(this._items.map(function (i) { return { name: i.name, value: i.value }; })); }
    }
    class UriPathSegment {
        constructor(name, isEncoded) {
            this.hasChanges = false;
            if (typeof (name) !== 'string')
                throw new Error("Name must be a string");
            if (isEncoded) {
                let indexA = name.indexOf("/");
                let indexB = name.indexOf("\\");
                if (indexA < 0 || (indexB >= 0 && indexB < indexA))
                    indexA = indexB;
                if (indexA < 0) {
                    this._encodedName = name;
                    this._leadingSeparator = "";
                }
                else {
                    if (indexA == 0) {
                        this._leadingSeparator = name.substr(0, 1);
                        name = name.substr(1);
                        indexA = name.indexOf("/");
                        indexB = name.indexOf("\\");
                        if (indexA < 0 || (indexB >= 0 && indexB < indexA))
                            indexA = indexB;
                        if (indexA < 0) {
                            this._encodedName = name;
                            return;
                        }
                    }
                    else
                        this._leadingSeparator = "";
                    this._encodedName = name.substr(0, indexA);
                    (this._nextSegment = new UriPathSegment(name.substr(indexA + 1), true))._leadingSeparator = name.substr(indexA, 1);
                    this._nextSegment._previousSegment = this;
                }
            }
            else
                this._name = name;
        }
        get name() {
            if (typeof (this._name) !== 'string')
                this._name = decodeURIComponent(this._encodedName);
            return this._name;
        }
        set name(s) {
            if (typeof (s) !== 'string')
                throw new Error("Name must be a string");
            if (s === this._name)
                return;
            this._name = s;
            this._encodedName = undefined;
            this.hasChanges = true;
        }
        get encodedName() {
            if (typeof (this._encodedName) !== 'string')
                this._encodedName = encodeURIComponent(this._name);
            return this._encodedName;
        }
        set encodedName(s) {
            if (typeof (s) !== 'string')
                throw new Error("Value must be a string");
            if (s === this._encodedName)
                return;
            this._encodedName = s;
            this._name = undefined;
            this.hasChanges = true;
        }
        get leadingSeparator() { return this._leadingSeparator; }
        set leadingSeparator(s) {
            if (typeof (s) !== 'string' || s.length == 0) {
                if (typeof (this._previousSegment) !== 'undefined')
                    throw new Error("Leading separator cannot be empty on subsequent items");
                if (this._leadingSeparator.length > 0) {
                    this._leadingSeparator = "";
                    this.hasChanges = true;
                }
            }
            else if (s !== this._leadingSeparator) {
                if (s != '/' && s != '\\')
                    throw new Error("Invalid separator");
                this._leadingSeparator = s;
                this.hasChanges = true;
            }
        }
        get trailingSeparator() {
            return (typeof (this._nextSegment) === 'undefined') ? ((this.isEmpty) ? this._leadingSeparator : "") : this._nextSegment._leadingSeparator;
        }
        get isEmpty() { return ((typeof (this._name) === 'string') ? this._name : this._encodedName).length == 0; }
        get previousSegment() { return this._previousSegment; }
        get nextSegment() { return this._nextSegment; }
        getFirstSegment() { return (typeof (this._previousSegment) === 'undefined') ? this : this._previousSegment.getFirstSegment(); }
        getLastSegment() { return (typeof (this._nextSegment) === 'undefined') ? this : this._nextSegment.getLastSegment(); }
        shift() {
            let result = this._nextSegment;
            if (typeof (this._previousSegment) === 'undefined' && typeof (result) === 'undefined')
                throw new Error("Cannot remove last item");
            if (typeof (this._previousSegment) !== 'undefined') {
                this._previousSegment.hasChanges = true;
                this._previousSegment._nextSegment = result;
            }
            else if (this._leadingSeparator.length == 0)
                result._leadingSeparator = '';
            if (typeof (this._nextSegment) !== 'undefined') {
                this._nextSegment._previousSegment = this._previousSegment;
                this._nextSegment.hasChanges = true;
            }
            this._previousSegment = this._nextSegment = undefined;
            this.hasChanges = true;
            return result;
        }
        pop() {
            let result = this._previousSegment;
            if (typeof (result) === 'undefined' && typeof (this._nextSegment) === 'undefined')
                throw new Error("Cannot remove last item");
            if (typeof (result) !== 'undefined') {
                result._nextSegment = this._nextSegment;
                result.hasChanges = true;
            }
            else if (this._leadingSeparator.length == 0)
                this._nextSegment._leadingSeparator = '';
            if (typeof (this._nextSegment) !== 'undefined') {
                this._nextSegment._previousSegment = result;
                this._nextSegment.hasChanges = true;
            }
            this._previousSegment = this._nextSegment = undefined;
            this.hasChanges = true;
            return result;
        }
        unshift(name) {
            let item = new UriPathSegment(name);
            item._leadingSeparator = this._leadingSeparator;
            if (this._leadingSeparator.length == 0)
                this._leadingSeparator = "/";
            item._previousSegment = this._previousSegment;
            item._nextSegment = this;
            if (typeof (this._previousSegment) !== 'undefined') {
                this._previousSegment._nextSegment = item;
                this._previousSegment.hasChanges = true;
            }
            this._previousSegment = item;
            item.hasChanges = this.hasChanges = true;
            return item;
        }
        push(name) {
            let item = new UriPathSegment(name);
            item._leadingSeparator = (typeof (this._nextSegment) !== 'undefined') ? this._nextSegment._leadingSeparator : ((this._leadingSeparator.length == 0) ? "/" : this._leadingSeparator);
            item._nextSegment = this._nextSegment;
            item._previousSegment = this;
            if (typeof (this._nextSegment) !== 'undefined') {
                this._nextSegment._previousSegment = item;
                this._nextSegment.hasChanges = true;
            }
            this._nextSegment = item;
            item.hasChanges = this.hasChanges = true;
            return item;
        }
    }
    class UriPathSegmentIterator {
        constructor(firstSegment) { this._current = firstSegment; }
        next() {
            if (typeof (this._current) !== 'undefined') {
                let item = this._current;
                this._current = this._current.nextSegment;
                return {
                    done: false,
                    value: item
                };
            }
            else
                return {
                    done: true,
                    value: null
                };
        }
        [Symbol.iterator]() { return this; }
    }
    class UriPathSegmentCollection {
        constructor(path) {
            this._hasChanges = false;
            if (typeof (path) !== 'string' || path.length == 0)
                this._firstItem = this._lastItem = new UriPathSegment("");
            else {
                this._firstItem = new UriPathSegment(path, true);
                this._lastItem = this._firstItem.getLastSegment();
            }
        }
        get hasChanges() {
            if (this._hasChanges)
                return true;
            let item = this._firstItem;
            do {
                if (item.hasChanges)
                    return true;
            } while (typeof (item = item.nextSegment) !== 'undefined');
            return false;
        }
        set hasChanges(value) {
            this._hasChanges = value;
            let item = this._firstItem;
            do {
                item.hasChanges = value;
            } while (typeof (item = item.nextSegment) !== 'undefined');
        }
        get length() { return this._length; }
        get pathString() { return this.toString(); }
        set pathString(value) {
            if (typeof (value) !== 'string' || value.length == 0) {
                if (this.toString().length == 0)
                    return;
                this._firstItem = this._lastItem = new UriPathSegment("");
            }
            else {
                if (this.toString() === value)
                    return;
                this._firstItem = new UriPathSegment(value, true);
                this._lastItem = this._firstItem.getLastSegment();
            }
            this._hasChanges = true;
        }
        get isRooted() { return this._firstItem.leadingSeparator.length > 0; }
        set isRooted(b) {
            if (b) {
                if (this._firstItem.leadingSeparator.length == 0) {
                    this._firstItem.leadingSeparator = '/';
                    this._hasChanges = true;
                }
            }
            else if (this._firstItem.leadingSeparator.length > 0) {
                this._firstItem.leadingSeparator = "";
                while (this._firstItem.isEmpty && this._length > 1) {
                    this._firstItem = this._firstItem.shift();
                    this._length--;
                    this._firstItem.leadingSeparator = "";
                }
                this._hasChanges = true;
            }
        }
        get hasTrailingSeparator() { return this._length > 1 && this._lastItem.isEmpty; }
        set hasTrailingSeparator(b) {
            if (b) {
                if (this._length == 1 || !this._lastItem.isEmpty) {
                    this._lastItem = this._lastItem.push("");
                    this._length++;
                    this._hasChanges = true;
                }
            }
            else if (this._length > 1) {
                while (this._length > 1 && this._lastItem.isEmpty) {
                    this._lastItem = this._lastItem.pop();
                    this._length--;
                }
                if (this._lastItem.isEmpty)
                    this._lastItem.leadingSeparator = "";
                this._hasChanges = true;
            }
            else if (this._lastItem.isEmpty && this._length == 1)
                throw new Error("Path must be rooted");
        }
        get(index) {
            if (index >= 0 && index < this._length) {
                let result;
                if (index > (this._length >> 1)) {
                    result = this._lastItem;
                    index++;
                    while (index < this._length) {
                        index++;
                        result = result.previousSegment;
                    }
                }
                else {
                    result = this._firstItem;
                    while (index > 0) {
                        result = result.nextSegment;
                        index--;
                    }
                }
                return result.name;
            }
        }
        set(index, name) {
            if (index < 0 || index >= this._length)
                throw new Error("Index out of range");
            if (typeof (name) !== 'string')
                throw new Error("value must be a string.");
            let item;
            if (index > (this._length >> 1)) {
                item = this._lastItem;
                index++;
                while (index < this._length) {
                    index++;
                    item = item.previousSegment;
                }
            }
            else {
                item = this._firstItem;
                while (index > 0) {
                    item = item.nextSegment;
                    index--;
                }
            }
            if (item.name == name)
                return;
            item.name = name;
            this._hasChanges = true;
        }
        pop() {
            let result = this._lastItem.name;
            if (this._length == 1) {
                if (this._lastItem.isEmpty) {
                    if (this._lastItem.leadingSeparator.length > 0) {
                        this._lastItem.leadingSeparator = "";
                        this._hasChanges = true;
                        return "";
                    }
                }
                else {
                    this._lastItem.name = "";
                    this._hasChanges = true;
                    return result;
                }
            }
            else {
                this._lastItem = this._lastItem.pop();
                this._length--;
                this._hasChanges = true;
                return result;
            }
        }
        push(...items) {
            let thisObj = { coll: this, result: 0 };
            items.forEach(function (s) {
                this.coll._lastItem = this.coll._lastItem.push(s);
                this.result++;
            }, thisObj);
            this._hasChanges = true;
            return thisObj.result;
        }
        shift() {
            let result = this._firstItem.name;
            if (this._length == 1) {
                if (this._firstItem.isEmpty) {
                    if (this._firstItem.leadingSeparator.length > 0) {
                        this._firstItem.leadingSeparator = "";
                        this._hasChanges = true;
                        return "";
                    }
                }
                else {
                    this._firstItem.name = "";
                    this._hasChanges = true;
                    return result;
                }
            }
            else {
                this._firstItem = this._firstItem.shift();
                this._length--;
                this._hasChanges = true;
                return result;
            }
        }
        remove(index) {
            if (index == 0)
                return this.shift();
            if (index == this._length - 1)
                return this.pop();
            if (index > 0 && index < this._length) {
                let item;
                if (index > (this._length >> 1)) {
                    item = this._lastItem;
                    index++;
                    while (index < this._length) {
                        index++;
                        item = item.previousSegment;
                    }
                }
                else {
                    item = this._firstItem;
                    while (index > 0) {
                        item = item.nextSegment;
                        index--;
                    }
                }
                item.pop();
                this._hasChanges = true;
                return item.name;
            }
        }
        unshift(...items) {
            let thisObj = { coll: this, result: 0 };
            items.forEach(function (s) {
                this.coll._firstItem = this.coll._firstItem.unshift(s);
                this.result++;
            }, thisObj);
            this._hasChanges = true;
            return thisObj.result;
        }
        indexOf(searchElement, fromIndex) {
            if (typeof (searchElement) === 'string') {
                let item = this._firstItem;
                if (typeof (fromIndex) === 'number' && !isNaN(fromIndex)) {
                    if (fromIndex < 0 || !Number.isFinite(fromIndex))
                        return -1;
                    while (fromIndex > 0) {
                        if (typeof (item = this._firstItem.nextSegment) === 'undefined')
                            return -1;
                        fromIndex--;
                    }
                }
                else
                    fromIndex = 0;
                do {
                    if (item.name == searchElement)
                        return fromIndex;
                    fromIndex++;
                } while (typeof (item = this._firstItem.nextSegment) !== 'undefined');
            }
            return -1;
        }
        lastIndexOf(searchElement, fromIndex) {
            if (typeof (searchElement) === 'string') {
                let item = this._lastItem;
                let result = this._length - 1;
                do {
                    if (item.name == searchElement)
                        return (typeof (fromIndex) !== 'number' || isNaN(fromIndex) || (fromIndex <= result && fromIndex >= 0)) ? result : -1;
                    result--;
                } while (typeof (item = item.previousSegment) !== 'undefined');
            }
            return -1;
        }
        forEach(callbackfn, thisArg) {
            let index = -1;
            let item = this._firstItem;
            do {
                index++;
                callbackfn.call(thisArg, item.name, index, this);
            } while (typeof (item = item.nextSegment) !== 'undefined');
        }
        map(callbackfn, thisArg) {
            let result = [];
            let index = -1;
            let item = this._firstItem;
            do {
                index++;
                result.push(callbackfn.call(thisArg, item.name, index, this));
            } while (typeof (item = item.nextSegment) !== 'undefined');
            return result;
        }
        toArray() {
            let result = [];
            let item = this._firstItem;
            do {
                result.push(item.name);
            } while (typeof (item = item.nextSegment) !== 'undefined');
            return result;
        }
        toJSON() { return JSON.stringify(this.toString()); }
        toString() {
            let result = [];
            let item = this._firstItem;
            do {
                result.push(item.leadingSeparator + item.encodedName);
            } while (typeof (item = item.nextSegment) !== 'undefined');
            return result.join("");
        }
        [Symbol.iterator]() { return new UriPathSegmentIterator(this._firstItem); }
    }
    UriPathSegmentCollection._splitRe = /[\\\/]/;
    class SchemaProperties {
        constructor(name, properties) {
            this.name = name;
            if (typeof (properties) === 'undefined' || properties === null) {
                this.supportsPath = true;
                this.supportsQuery = true;
                this.supportsFragment = true;
                this.supportsCredentials = true;
                this.requiresHost = false;
                this.supportsPort = true;
                this.requiresUsername = false;
                this.defaultPort = NaN;
                this.schemeSeparator = "://";
            }
            else {
                this.supportsPath = (typeof (properties.supportsPath) !== 'boolean' || properties.supportsPath === true);
                this.supportsQuery = (typeof (properties.supportsQuery) !== 'boolean' || properties.supportsQuery === true);
                this.supportsFragment = (typeof (properties.supportsFragment) !== 'boolean' || properties.supportsFragment === true);
                this.supportsCredentials = (typeof (properties.supportsCredentials) !== 'boolean' || properties.supportsCredentials === true);
                this.requiresHost = (typeof (properties.requiresHost) !== 'boolean' || properties.requiresHost === true);
                this.supportsPort = (typeof (properties.supportsPort) !== 'boolean' || properties.supportsPort === true);
                this.requiresUsername = (typeof (properties.requiresUsername) === 'boolean' && properties.requiresUsername === true);
                this.defaultPort = properties.defaultPort;
                this.schemeSeparator = (typeof (properties.schemeSeparator) == 'string') ? properties.schemeSeparator : "://";
            }
        }
        static getSchemaProperties(name) {
            if (name.endsWith(':'))
                name = name.substr(0, name.length - 1);
            switch (name) {
                case 'ftp':
                    return SchemaProperties.uriScheme_ftp;
                case 'ftps':
                    return SchemaProperties.uriScheme_ftps;
                case 'sftp':
                    return SchemaProperties.uriScheme_sftp;
                case 'http':
                    return SchemaProperties.uriScheme_http;
                case 'https':
                    return SchemaProperties.uriScheme_https;
                case 'gopher':
                    return SchemaProperties.uriScheme_gopher;
                case 'mailto':
                    return SchemaProperties.uriScheme_mailto;
                case 'news':
                    return SchemaProperties.uriScheme_news;
                case 'nntp':
                    return SchemaProperties.uriScheme_nntp;
                case 'telnet':
                    return SchemaProperties.uriScheme_telnet;
                case 'wais':
                    return SchemaProperties.uriScheme_wais;
                case 'file':
                    return SchemaProperties.uriScheme_file;
                case 'net.pipe':
                    return SchemaProperties.uriScheme_netPipe;
                case 'net.tcp':
                    return SchemaProperties.uriScheme_netTcp;
                case 'ldap':
                    return SchemaProperties.uriScheme_ldap;
                case 'ssh':
                    return SchemaProperties.uriScheme_ssh;
                case 'git':
                    return SchemaProperties.uriScheme_git;
                case 'urn':
                    return SchemaProperties.uriScheme_urn;
            }
            return new SchemaProperties(name);
        }
        ;
    }
    /**
     * File Transfer protocol
     **/
    SchemaProperties.uriScheme_ftp = new SchemaProperties("ftp", { supportsQuery: false, supportsFragment: false, defaultPort: 21 });
    /**
     * File Transfer protocol (secure)
     **/
    SchemaProperties.uriScheme_ftps = new SchemaProperties("ftps", { supportsQuery: false, supportsFragment: false, defaultPort: 990 });
    /**
     * Secure File Transfer Protocol
     **/
    SchemaProperties.uriScheme_sftp = new SchemaProperties("sftp", { supportsQuery: false, supportsFragment: false, defaultPort: 22 });
    /**
     * Hypertext Transfer Protocol
     **/
    SchemaProperties.uriScheme_http = new SchemaProperties("http", { defaultPort: 80 });
    /**
     * Hypertext Transfer Protocol (secure)
     **/
    SchemaProperties.uriScheme_https = new SchemaProperties("https", { defaultPort: 443 });
    /**
     * The Gopher protocol
     **/
    SchemaProperties.uriScheme_gopher = new SchemaProperties("gopher", { defaultPort: 70 });
    /**
     * Electronic mail address
     **/
    SchemaProperties.uriScheme_mailto = new SchemaProperties("mailto", { schemeSeparator: ":" });
    /**
     * USENET news
     **/
    SchemaProperties.uriScheme_news = new SchemaProperties("news", { supportsCredentials: false, requiresHost: false, supportsPort: false, schemeSeparator: ":" });
    /**
     * USENET news using NNTP access
     **/
    SchemaProperties.uriScheme_nntp = new SchemaProperties("nntp", { defaultPort: 119 });
    /**
     * Reference to interactive sessions
     **/
    SchemaProperties.uriScheme_telnet = new SchemaProperties("telnet", { supportsPath: false, supportsQuery: false, supportsFragment: false, supportsCredentials: false, defaultPort: 23 });
    /**
     * Wide Area Information Servers
     **/
    SchemaProperties.uriScheme_wais = new SchemaProperties("wais", { defaultPort: 443 });
    /**
     * Host-specific file names
     **/
    SchemaProperties.uriScheme_file = new SchemaProperties("file", { supportsQuery: false, supportsFragment: false, supportsCredentials: false, requiresHost: false, supportsPort: false });
    /**
     * Net Pipe
     **/
    SchemaProperties.uriScheme_netPipe = new SchemaProperties("net.pipe", { supportsPort: false });
    /**
     * Net-TCP
     **/
    SchemaProperties.uriScheme_netTcp = new SchemaProperties("net.tcp", { defaultPort: 808 });
    /**
     * Lightweight Directory Access Protocol
     **/
    SchemaProperties.uriScheme_ldap = new SchemaProperties("ldap", { defaultPort: 389 });
    /**
     * Lightweight Directory Access Protocol
     **/
    SchemaProperties.uriScheme_ssh = new SchemaProperties("ssh", { defaultPort: 22 });
    /**
     * GIT Respository
     **/
    SchemaProperties.uriScheme_git = new SchemaProperties("git", { supportsQuery: false, supportsFragment: false, defaultPort: 9418 });
    /**
     * Uniform Resource notation
     **/
    SchemaProperties.uriScheme_urn = new SchemaProperties("urn", { supportsCredentials: false, requiresHost: false, supportsPort: false, schemeSeparator: ":" });
    /**
     * Represents a URI.
     * @class
     *
     * @property {string} schemeName URI scheme name.
     * @property {string} protocol URI scheme name with the trailing ':'.
     * */
    class UrlBuilder {
        constructor() {
            this._isAbsoluteUrl = false;
            this._isDefaultPort = true;
            this._scheme = new SchemaProperties("");
            this._hasChanges = false;
        }
        get hasChanges() { return this._hasChanges || this._path.hasChanges || this._searchParams.hasChanges; }
        set hasChanges(value) { this._hasChanges = this._path.hasChanges = this._searchParams.hasChanges = value; }
        get isAbsoluteUrl() { return this._isAbsoluteUrl; }
        get isDefaultPort() { return this._isDefaultPort; }
        set isDefaultPort(isDefault) {
            if (isDefault === this._isDefaultPort)
                return;
            if (isDefault) {
                if (!isNaN(this._scheme.defaultPort)) {
                    this._portNumber = this._scheme.defaultPort;
                    this._port = undefined;
                    this._isDefaultPort = true;
                    this._hasChanges = true;
                }
            }
            else {
                this._isDefaultPort = false;
                if (!isNaN(this._portNumber))
                    this._port = this._portNumber.toString();
                this._hasChanges = true;
            }
        }
        get href() {
            throw new Error("Property not implemented.");
        }
        set href(url) {
            throw new Error("Property not implemented.");
        }
        get origin() { throw new Error("Property not implemented."); }
        set origin(value) {
            throw new Error("Property not implemented.");
        }
        get protocol() { return (this._scheme.name.length == 0) ? "" : this._scheme.name + this._scheme.schemeSeparator.substr(0, 1); }
        set protocol(value) {
            if (value === this._scheme.name)
                return;
            this._scheme = SchemaProperties.getSchemaProperties(value);
            this._isAbsoluteUrl = this._scheme.name.length > 0 || typeof (this._username) === 'string' || typeof (this._password) === 'string' || typeof (this._hostname) === 'string' || typeof (this._port) === 'string';
            this._hasChanges = true;
        }
        get schemeName() { return this._scheme.name; }
        set schemeName(value) {
            if (value === this._scheme.name)
                return;
            this._scheme = SchemaProperties.getSchemaProperties(value);
            this._isAbsoluteUrl = this._scheme.name.length > 0 || typeof (this._username) === 'string' || typeof (this._password) === 'string' || typeof (this._hostname) === 'string' || typeof (this._port) === 'string';
            this._hasChanges = true;
        }
        get schemeSeparator() { return this._scheme.schemeSeparator; }
        get username() {
            if (typeof (this._username) === 'string')
                return this._username;
            if (typeof (this._password) === 'string')
                return '';
        }
        set username(value) {
            if (this._username === value)
                return;
            this._username = value;
            this._isAbsoluteUrl = this._scheme.name.length > 0 || typeof (this._username) === 'string' || typeof (this._password) === 'string' || typeof (this._hostname) === 'string' || typeof (this._port) === 'string';
            this._hasChanges = true;
        }
        get password() { return this._password; }
        set password(value) {
            if (this._password === value)
                return;
            this._password = value;
            this._isAbsoluteUrl = this._scheme.name.length > 0 || typeof (this._username) === 'string' || typeof (this._password) === 'string' || typeof (this._hostname) === 'string' || typeof (this._port) === 'string';
            this._hasChanges = true;
        }
        get host() {
            if (typeof (this._hostname) === 'string') {
                if (typeof (this._port) === 'string')
                    return this._hostname + ':' + this._port;
                return this._hostname;
            }
            if (typeof (this._port) === 'string')
                return ':' + this._port;
            if (typeof (this._username) === 'string' || typeof (this._password) === 'string' || this._scheme.name.length > 0)
                return '';
        }
        set host(value) {
            if (typeof (value) !== 'string') {
                if (typeof (this._hostname) !== 'string')
                    return;
                this._hostname = undefined;
            }
            else {
                if (this._hostname === value)
                    return;
                let index = value.indexOf(':');
                if (index < 0) {
                    this._hostname = value;
                    this._portNumber = this._scheme.defaultPort;
                    this._isDefaultPort = !isNaN(this._portNumber);
                    this._port = undefined;
                }
                else {
                    this._hostname = value.substr(0, index);
                    this._port = value.substr(index + 1);
                    this._portNumber = parseInt(this._port);
                    this._isDefaultPort = (!isNaN(this._portNumber) && this._portNumber == this._scheme.defaultPort);
                }
            }
            this._isAbsoluteUrl = this._scheme.name.length > 0 || typeof (this._username) === 'string' || typeof (this._password) === 'string' || typeof (this._hostname) === 'string' || typeof (this._port) === 'string';
            this._hasChanges = true;
        }
        get hostname() { throw new Error("Property not implemented."); }
        set hostname(value) {
            if (typeof (value) !== 'string') {
                if (typeof (this._hostname) !== 'string')
                    return;
                this._hostname = undefined;
            }
            else {
                if (this._hostname === value)
                    return;
                this._hostname = value;
            }
            this._isAbsoluteUrl = this._scheme.name.length > 0 || typeof (this._username) === 'string' || typeof (this._password) === 'string' || typeof (this._hostname) === 'string' || typeof (this._port) === 'string';
            this._hasChanges = true;
        }
        get port() { throw new Error("Property not implemented."); }
        set port(value) {
            if (typeof (value) === 'string') {
                if (value === this._port)
                    return;
                this._portNumber = parseInt(value);
                this._isDefaultPort = (!isNaN(this._portNumber) && this._portNumber == this._scheme.defaultPort);
                this._port = value;
            }
            else {
                if (typeof (this._port) !== 'string')
                    return;
                this._portNumber = this._scheme.defaultPort;
                this._isDefaultPort = !isNaN(this._portNumber);
                this._port = undefined;
            }
            this._isAbsoluteUrl = this._scheme.name.length > 0 || typeof (this._username) === 'string' || typeof (this._password) === 'string' || typeof (this._hostname) === 'string' || typeof (this._port) === 'string';
            this._hasChanges = true;
        }
        get portNumber() { return (isNaN(this._portNumber) && typeof (this._port) !== 'string') ? this._scheme.defaultPort : this._portNumber; }
        set portNumber(value) {
            throw new Error("Not implemented.");
        }
        get pathname() { return this._path.pathString; }
        set pathname(value) { this._path.pathString = value; }
        get path() { throw new Error("Property not implemented."); }
        set path(value) {
            this._path = value;
            this._hasChanges = true;
        }
        get search() { return this._searchParams.toString(); }
        set search(value) { this._searchParams.reset(value); }
        get searchParams() { return this._searchParams; }
        set searchParams(value) {
            this._searchParams = new UriQueryParams(value);
            this._hasChanges = true;
        }
        get hash() { return (typeof (this._fragment) === 'string') ? '#' + this._fragment : ""; }
        set hash(value) {
            if (typeof (value) !== 'string' || value.length == 0) {
                if (typeof (this._fragment) !== 'string')
                    return;
                this._fragment = undefined;
            }
            else {
                if (value.startsWith("#"))
                    value = value.substr(1);
                if (value === this._fragment)
                    return;
                this._fragment = value;
            }
            this._hasChanges = true;
        }
        get fragment() { return this._fragment; ; }
        set fragment(value) {
            if (typeof (value) !== 'string') {
                if (typeof (this._fragment) !== 'string')
                    return;
                this._fragment = undefined;
            }
            else {
                if (value === this._fragment)
                    return;
                this._fragment = value;
            }
            this._hasChanges = true;
        }
        toString() { return this.href; }
        toJSON() { return JSON.stringify(this.href); }
    }
    app.module.controller("UriBuilderController", ['$scope', UriBuilderController]);
})(uriBuilder || (uriBuilder = {}));
//# sourceMappingURL=UriBuilderController.js.map