/// <reference path="Scripts/typings/jquery/jquery.d.ts"/>
/// <reference path="Scripts/typings/angularjs/angular.d.ts"/>
/// <reference path="Scripts/typings/angularjs/angular-route.d.ts"/>
var app;
(function (app) {
    app.mainModule = angular.module("mainModule");
    function sanitizeNavigationLinks(pages) {
        if (typeof (pages) === "undefined" || pages === null)
            return [];
        if (typeof (pages) !== "object" || !Array.isArray(pages))
            return [{ href: "#", text: "(invalid configuration data)", disabled: true, links: [], cssClass: ["nav-item", "disabled"], onClick: () => { return false; } }];
        return pages.filter(notNil).map((item) => {
            if (typeof (item) !== "object")
                return { href: "#", text: "(invalid configuration data)", disabled: true, links: [], cssClass: ["nav-item", "disabled"], onClick: () => { return false; } };
            if (isNilOrWhiteSpace(item.href)) {
                item.href = "#";
                item.disabled = true;
            }
            if (item.disabled)
                return { href: item.href, text: item.text, disabled: true, links: sanitizeNavigationLinks(item.links), cssClass: ["nav-item", "disabled"], onClick: () => { return false; } };
            return { href: item.href, text: item.text, disabled: false, links: sanitizeNavigationLinks(item.links), cssClass: ["nav-item"], onClick: () => { return true; } };
        });
    }
    class applicationConfigurationLoader {
        then(successCallback, errorCallback, notifyCallback) {
            return this._get.then(successCallback, errorCallback, notifyCallback);
        }
        catch(onRejected) { return this._get.catch(onRejected); }
        finally(finallyCallback) { return this._get.finally(finallyCallback); }
        constructor($http) {
            this._get = $http.get('appConfig.json').then((promiseValue) => {
                let requestInfo = {
                    status: promiseValue.status,
                    headers: promiseValue.headers,
                    config: promiseValue.config,
                    statusText: promiseValue.statusText
                };
                if (typeof (promiseValue.data) === 'undefined' || promiseValue.data == null)
                    requestInfo.error = "No data returned.";
                else if (typeof (promiseValue.data) !== 'object')
                    requestInfo.error = "Invalid data.";
                else if (typeof (promiseValue.data.links) != 'object' || promiseValue.data.links === null || !Array.isArray(promiseValue.data.links))
                    requestInfo.error = "Invalid pages configuration";
                return {
                    requestInfo: requestInfo,
                    links: sanitizeNavigationLinks(promiseValue.data.links)
                };
            }, (reason) => { return { requestInfo: { statusText: asString(reason, "Unknown error") }, links: [] }; });
        }
    }
    app.mainModule.service("applicationConfigurationLoader", applicationConfigurationLoader);
    function hasActiveNavItem(links, pageId) {
        for (let i = 0; i < this.$scope.links.length; i++) {
            if (links[i].pageId === this.$scope.currentPageId)
                return true;
        }
        for (let i = 0; i < this.$scope.links.length; i++) {
            if (hasActiveNavItem(links[i].links, pageId))
                return true;
        }
        return false;
    }
    class TopNavController {
        constructor($scope, loader) {
            this.$scope = $scope;
            let controller = this;
            $scope.initializeTopNav = (pageId, navLoader) => { return controller.initializeTopNav(pageId, navLoader); };
        }
        $doCheck() { }
        initializeTopNav(pageId, navLoader) {
            navLoader.then((result) => {
                this.$scope.links = result.links;
                if (isNilOrWhiteSpace(pageId))
                    return;
                for (let i = 0; i < this.$scope.links.length; i++) {
                    if (this.$scope.links[i].pageId === pageId) {
                        this.$scope.links[i].cssClass.push("active");
                        this.$scope.links[i].href = "#";
                        this.$scope.links[i].onClick = () => { return false; };
                        return;
                    }
                }
                for (let i = 0; i < this.$scope.links.length; i++) {
                    if (hasActiveNavItem(this.$scope.links[i].links, pageId)) {
                        this.$scope.links[i].cssClass.push("active");
                        return;
                    }
                }
            });
        }
    }
    ;
    app.mainModule.directive('topNavAndHeader', ['navigationLoader', (navLoader) => {
            return {
                restrict: "E",
                scope: {},
                controller: ["$scope", "applicationConfigurationLoader"],
                link: (scope, element, attributes) => {
                    scope.headerText = attributes.headerText;
                    navLoader.then((promiseValue) => {
                        scope.initializeTopNav(attributes.pageName, navLoader);
                    });
                }
            };
        }]);
    // #region Utility functions
    function isNil(obj) { return typeof (obj) === 'undefined' || obj === null; }
    app.isNil = isNil;
    function notNil(obj) { return typeof (obj) !== 'undefined' && obj != null; }
    app.notNil = notNil;
    function notNilOrEmpty(value) {
        return (typeof (value) == 'string' || (typeof (value) == 'object' && value != null && Array.isArray(value))) && value.length > 0;
    }
    app.notNilOrEmpty = notNilOrEmpty;
    function isNilOrEmpty(value) {
        return (typeof (value) !== 'string' && (typeof (value) != 'object' || value === null || !Array.isArray(value))) || value.length == 0;
    }
    app.isNilOrEmpty = isNilOrEmpty;
    function isNilOrWhiteSpace(value) { return typeof (value) !== 'string' || value.trim().length == 0; }
    app.isNilOrWhiteSpace = isNilOrWhiteSpace;
    function notNilOrWhiteSpace(value) { return typeof (value) == 'string' && value.trim().length > 0; }
    app.notNilOrWhiteSpace = notNilOrWhiteSpace;
    function asNotNil(value, opt, trim) {
        if (typeof (value) === "undefined" || value === null)
            return (typeof (opt) !== 'undefined') ? opt : '';
        if (typeof (value) !== 'string')
            return value;
        return ((typeof (opt) === "boolean") ? opt : trim === true) ? value.trim() : value;
    }
    app.asNotNil = asNotNil;
    ;
    ;
    ;
    function hasConvertWhenNull(h) { return (typeof (h.whenNull) !== "undefined"); }
    app.hasConvertWhenNull = hasConvertWhenNull;
    function hasConvertWhenUndefined(h) { return (typeof (h.whenUndefined) !== "undefined"); }
    app.hasConvertWhenUndefined = hasConvertWhenUndefined;
    function hasConvertWhenNil(h) { return (typeof (h.whenNil) !== "undefined"); }
    app.hasConvertWhenNil = hasConvertWhenNil;
    function convertValue(value, arg1, convertFn, whenNil, whenUndefined, convertFailed, whenConverted, whenMatched, getFinal) {
        let testFn;
        let whenNull;
        let nilSpec;
        if (typeof (arg1) === "function") {
            testFn = arg1;
            if (typeof (whenUndefined) !== null)
                whenNull = whenNil;
            else
                nilSpec = whenNil;
        }
        else {
            testFn = arg1.test;
            convertFn = arg1.convert;
            if (hasConvertWhenNil(arg1))
                nilSpec = arg1.whenNil;
            else {
                if (hasConvertWhenUndefined(arg1))
                    whenUndefined = arg1.whenUndefined;
                if (hasConvertWhenNull(arg1))
                    whenNull = arg1.whenNull;
            }
            if (typeof (arg1.convertFailed) !== "undefined")
                convertFailed = arg1.convertFailed;
            if (typeof (arg1.whenConverted) !== "undefined")
                whenConverted = arg1.whenConverted;
            if (typeof (arg1.whenMatched) !== "undefined")
                whenMatched = arg1.whenMatched;
            if (typeof (arg1.getFinal) !== "undefined")
                getFinal = arg1.getFinal;
        }
        let result = (() => {
            let convertedValue;
            if (typeof (nilSpec) !== "undefined") {
                if (typeof (value) === "undefined" || value === null) {
                    convertFn = undefined;
                    convertedValue = (typeof (nilSpec) === "function") ? nilSpec(value) : nilSpec;
                }
                else if (testFn(value))
                    return (typeof (whenMatched) === "function") ? whenMatched(value) : value;
            }
            else if (typeof (whenUndefined) !== "undefined") {
                if (typeof (value) === "undefined") {
                    convertFn = undefined;
                    convertedValue = (typeof (whenUndefined) === "function") ? whenUndefined() : whenUndefined;
                }
                else if (typeof (whenNull) !== "undefined" && value === null) {
                    convertFn = undefined;
                    convertedValue = (typeof (whenNull) === "function") ? whenNull() : whenNull;
                }
                else if (testFn(value))
                    return (typeof (whenMatched) === "function") ? whenMatched(value) : value;
            }
            else if (typeof (whenNull) !== "undefined" && (typeof (value) !== "undefined") && value === null) {
                convertFn = undefined;
                convertedValue = (typeof (whenNull) === "function") ? whenNull() : whenNull;
            }
            else if (testFn(value))
                return (typeof (whenMatched) === "function") ? whenMatched(value) : value;
            if (typeof (convertFn) !== "undefined") {
                if (typeof (convertFailed) !== "undefined")
                    try {
                        convertedValue = convertFn(value);
                    }
                    catch (e) {
                        convertedValue = (typeof (convertFailed) === "function") ? convertFailed(value, e) : convertFailed;
                    }
                else
                    convertedValue = convertFn(value);
            }
            return (typeof (whenConverted) === "function") ? whenConverted(convertedValue) : convertedValue;
        })();
        return (typeof (getFinal) === "function") ? getFinal(result) : result;
    }
    app.convertValue = convertValue;
    function isNilOrString(value) { return (typeof (value) === "string") || (typeof (value) === "undefined") || value === null; }
    app.isNilOrString = isNilOrString;
    function isUndefinedOrString(value) { return (typeof (value) === "string") || (typeof (value) === "undefined") || value === null; }
    app.isUndefinedOrString = isUndefinedOrString;
    function isNullOrString(value) { return (typeof (value) === "string") || (typeof (value) !== "undefined" && value === null); }
    app.isNullOrString = isNullOrString;
    function asStringOrNullOrUndefined(value) {
        return convertValue(value, isNilOrString, (v) => {
            if (typeof (v) === "object") {
                if (Array.isArray(v))
                    return v.map((e) => {
                        return convertValue(e, isNilOrString, (u) => {
                            if (typeof (u) === "object") {
                                if (Array.isArray(u))
                                    return u.filter(notNil).join("\n");
                                try {
                                    let p = u.valueOf();
                                    if (typeof (p) === "string")
                                        return p;
                                    p = p.toString();
                                    if (typeof (p) === "string")
                                        return p;
                                }
                                catch ( /* okay to ignore */_a) { /* okay to ignore */ }
                            }
                            else if (typeof (u) === "function")
                                try {
                                    let z = u.ValueOf();
                                    if (typeof (z) === "string")
                                        return z;
                                    z = z.toString();
                                    if (typeof (z) === "string")
                                        return z;
                                }
                                catch ( /* okay to ignore */_b) { /* okay to ignore */ }
                            try {
                                let m = u.toString();
                                if (typeof (m) === "string")
                                    return m;
                            }
                            catch ( /* okay to ignore */_c) { /* okay to ignore */ }
                        });
                    }).filter(notNil).join("\n");
                try {
                    let o = v.valueOf();
                    if (typeof (o) === "string")
                        return o;
                    o = o.toString();
                    if (typeof (o) === "string")
                        return o;
                }
                catch ( /* okay to ignore */_a) { /* okay to ignore */ }
            }
            else if (typeof (v) === "function")
                try {
                    let f = v.valueOf();
                    if (typeof (f) === "string")
                        return f;
                    f = f.toString();
                    if (typeof (f) === "string")
                        return f;
                }
                catch ( /* okay to ignore */_b) { /* okay to ignore */ }
            try {
                let s = v.toString();
                if (typeof (s) === "string")
                    return s;
            }
            catch ( /* okay to ignore */_c) { /* okay to ignore */ }
        });
    }
    app.asStringOrNullOrUndefined = asStringOrNullOrUndefined;
    function asStringOrNull(value) {
        value = asStringOrNullOrUndefined(value);
        return (typeof (value) === "undefined") ? null : value;
    }
    app.asStringOrNull = asStringOrNull;
    function asStringOrUndefined(value) {
        value = asStringOrNullOrUndefined(value);
        if (typeof (value) === "undefined" || typeof (value) === "string")
            return value;
    }
    app.asStringOrUndefined = asStringOrUndefined;
    function asString(value, defaultValue = "") {
        value = asStringOrNullOrUndefined(value);
        return (typeof (value) === "string") ? value : defaultValue;
    }
    app.asString = asString;
    function asStringAndNotEmpty(value, defaultValue) {
        value = asStringOrNullOrUndefined(value);
        return (typeof (value) != "string" || value.length) ? defaultValue : value;
    }
    app.asStringAndNotEmpty = asStringAndNotEmpty;
    function asStringAndNotWhiteSpace(value, defaultValue, trim = false) {
        value = asStringOrNullOrUndefined(value);
        if (typeof (value) == "string" && (((trim) ? (value = value.trim()) : value.trim()).length > 0))
            return value;
        return defaultValue;
    }
    app.asStringAndNotWhiteSpace = asStringAndNotWhiteSpace;
    function asUndefinedOrNotEmpty(value, trim) {
        if (typeof (value) !== 'undefined' && value !== null && value.length > 0)
            return (trim === true && typeof (value) === 'string') ? value.trim() : value;
    }
    app.asUndefinedOrNotEmpty = asUndefinedOrNotEmpty;
    function asUndefinedOrNotWhiteSpace(value, trim) {
        if (typeof (value) === 'string') {
            if (trim === true) {
                if ((value = value.trim()).length > 0)
                    return value;
            }
            else if (value.trim().length > 0)
                return value;
        }
    }
    app.asUndefinedOrNotWhiteSpace = asUndefinedOrNotWhiteSpace;
    function asNullOrNotEmpty(value, trim) {
        if (typeof (value) === 'string') {
            if (trim) {
                if ((value = value.trim()).length > 0)
                    return value;
            }
            else if (value.trim().length > 0)
                return value;
        }
        return null;
    }
    app.asNullOrNotEmpty = asNullOrNotEmpty;
    function asNullOrNotWhiteSpace(value, trim) {
        if (typeof (value) === 'string') {
            if (trim === true) {
                if ((value = value.trim()).length > 0)
                    return value;
            }
            else if (value.trim().length > 0)
                return value;
        }
        return null;
    }
    app.asNullOrNotWhiteSpace = asNullOrNotWhiteSpace;
    function isNumber(value) { return typeof (value) === 'number' && !isNaN(value); }
    app.isNumber = isNumber;
    function isFiniteNumber(value) { return typeof (value) === 'number' && !isNaN(value) && Number.isFinite(value); }
    app.isFiniteNumber = isFiniteNumber;
    function isFiniteWholeNumber(value) { return typeof (value) === 'number' && !isNaN(value) && Number.isFinite(value) && Math.round(value) === value; }
    app.isFiniteWholeNumber = isFiniteWholeNumber;
    app.floatingPointNumberRe = /^[+-]?\d+(\.\d+)?$/;
    function asNumber(value, defaultValue, allowWhiteSpace, allowExtraneousTrailingCharacters) {
        let dv;
        if (typeof (defaultValue) === "boolean") {
            allowExtraneousTrailingCharacters = allowWhiteSpace === true;
            allowWhiteSpace = defaultValue;
            dv = null;
        }
        else
            dv = (typeof (dv) === 'number') ? dv : null;
        return convertValue(value, isNumber, (v) => {
            if (typeof (v) === "boolean")
                return (v) ? 1 : 0;
            if (typeof (v) === "function" && (typeof (v) === "object" && !Array.isArray(v)))
                try {
                    let f = v.valueOf();
                    if (isNumber(f))
                        return f;
                    if (typeof (v) === "boolean")
                        return (v) ? 1 : 0;
                    if (typeof (f) == "string")
                        v = f;
                }
                catch ( /* okay to ignore */_a) { /* okay to ignore */ }
            if (typeof (v) !== "string")
                v = asString(v, "");
            if (allowWhiteSpace)
                v = v.trim();
            let n = parseFloat(v);
            if (typeof (n) === 'number' && !isNaN(n) && (allowExtraneousTrailingCharacters || app.floatingPointNumberRe.test(v)))
                return n;
            return dv;
        }, (v) => { return dv; });
    }
    app.asNumber = asNumber;
    function map(source, callbackfn, thisArg) {
        let iterator = source[Symbol.iterator]();
        let r = iterator.next();
        let result = [];
        let index = 0;
        if (typeof (thisArg) !== 'undefined')
            while (!r.done) {
                result.push(callbackfn.call(thisArg, r.value, index++, source));
                r = iterator.next();
            }
        else
            while (!r.done) {
                result.push(callbackfn(r.value, index++, source));
                r = iterator.next();
            }
        return result;
    }
    app.map = map;
    function every(source, callbackfn, thisArg) {
        let iterator = source[Symbol.iterator]();
        let r = iterator.next();
        let index = 0;
        if (typeof (thisArg) !== 'undefined')
            while (!r.done) {
                if (!callbackfn.call(thisArg, r.value, index++, source))
                    return false;
                r = iterator.next();
            }
        else
            while (!r.done) {
                if (!callbackfn(r.value, index++, source))
                    return false;
                r = iterator.next();
            }
        return true;
    }
    app.every = every;
    function some(source, callbackfn, thisArg) {
        let iterator = source[Symbol.iterator]();
        let r = iterator.next();
        let index = 0;
        if (typeof (thisArg) !== 'undefined')
            while (!r.done) {
                if (callbackfn.call(thisArg, r.value, index++, source))
                    return true;
                r = iterator.next();
            }
        else
            while (!r.done) {
                if (callbackfn(r.value, index++, source))
                    return true;
                r = iterator.next();
            }
        return true;
    }
    app.some = some;
    function forEach(source, callbackfn, thisArg) {
        let iterator = source[Symbol.iterator]();
        let r = iterator.next();
        let index = 0;
        if (typeof (thisArg) !== 'undefined')
            while (!r.done) {
                callbackfn.call(thisArg, r.value, index++, source);
                r = iterator.next();
            }
        else
            while (!r.done) {
                callbackfn(r.value, index++, source);
                r = iterator.next();
            }
    }
    app.forEach = forEach;
    function filter(source, callbackfn, thisArg) {
        let iterator = source[Symbol.iterator]();
        let r = iterator.next();
        let result = [];
        let index = 0;
        if (typeof (thisArg) !== 'undefined')
            while (!r.done) {
                if (callbackfn.call(thisArg, r.value, index++, source))
                    result.push(r.value);
                r = iterator.next();
            }
        else
            while (!r.done) {
                if (callbackfn(r.value, index++, source))
                    result.push(r.value);
                r = iterator.next();
            }
        return result;
    }
    app.filter = filter;
    function reduce(source, callbackfn, initialValue) {
        let iterator = source[Symbol.iterator]();
        let r = iterator.next();
        let result = initialValue;
        let index = 0;
        while (!r.done) {
            result = callbackfn(result, r.value, index++, source);
            r = iterator.next();
        }
        return result;
    }
    app.reduce = reduce;
    function first(source, callbackfn, thisArg) {
        let iterator = source[Symbol.iterator]();
        let r = iterator.next();
        let index = 0;
        if (typeof (thisArg) !== 'undefined')
            while (!r.done) {
                if (callbackfn.call(thisArg, r.value, index++, source))
                    return r.value;
                r = iterator.next();
            }
        else
            while (!r.done) {
                if (callbackfn(r.value, index, source))
                    return r.value;
                r = iterator.next();
            }
    }
    app.first = first;
    function indexOf(source, callbackfn, thisArg) {
        let iterator = source[Symbol.iterator]();
        let r = iterator.next();
        let index = 0;
        if (typeof (thisArg) !== 'undefined')
            while (!r.done) {
                if (callbackfn.call(thisArg, r.value, index++, source))
                    return index;
                r = iterator.next();
            }
        else
            while (!r.done) {
                if (callbackfn(r.value, index, source))
                    return index;
                r = iterator.next();
            }
    }
    app.indexOf = indexOf;
    function last(source, callbackfn, thisArg) {
        let iterator = source[Symbol.iterator]();
        let r = iterator.next();
        let result;
        let index = 0;
        if (typeof (thisArg) !== 'undefined')
            while (!r.done) {
                if (callbackfn.call(thisArg, r.value, index++, source))
                    result = r.value;
                r = iterator.next();
            }
        else
            while (!r.done) {
                if (callbackfn(r.value, index++, source))
                    result = r.value;
                r = iterator.next();
            }
        return result;
    }
    app.last = last;
    function takeFirst(source, count) {
        let iterator = source[Symbol.iterator]();
        let r = iterator.next();
        let result = [];
        let index = 0;
        while (!r.done) {
            if (count == index)
                break;
            result.push(r.value);
            count--;
            r = iterator.next();
        }
        return result;
    }
    app.takeFirst = takeFirst;
    function takeWhile(source, callbackfn, thisArg) {
        let iterator = source[Symbol.iterator]();
        let r = iterator.next();
        let result = [];
        let index = 0;
        if (typeof (thisArg) !== 'undefined')
            while (!r.done) {
                if (!callbackfn.call(thisArg, r.value, index++, source))
                    break;
                result.push(r.value);
                r = iterator.next();
            }
        else
            while (!r.done) {
                if (!callbackfn(r.value, index++, source))
                    break;
                result.push(r.value);
                r = iterator.next();
            }
        return result;
    }
    app.takeWhile = takeWhile;
    function skipFirst(source, count) {
        let iterator = source[Symbol.iterator]();
        let r = iterator.next();
        let result = [];
        let index = 0;
        while (!r.done) {
            if (index == count) {
                do {
                    result.push(r.value);
                    r = iterator.next();
                } while (!r.done);
                return result;
            }
            r = iterator.next();
            index++;
        }
        return result;
    }
    app.skipFirst = skipFirst;
    function skipWhile(source, callbackfn, thisArg) {
        let iterator = source[Symbol.iterator]();
        let r = iterator.next();
        let result = [];
        let index = 0;
        if (typeof (thisArg) !== 'undefined')
            while (!r.done) {
                if (!callbackfn.call(thisArg, r.value, index++, source)) {
                    do {
                        result.push(r.value);
                        r = iterator.next();
                    } while (!r.done);
                    return result;
                }
                r = iterator.next();
            }
        else
            while (!r.done) {
                if (!callbackfn(r.value, index++, source)) {
                    do {
                        result.push(r.value);
                        r = iterator.next();
                    } while (!r.done);
                    return result;
                }
                r = iterator.next();
            }
        return result;
    }
    app.skipWhile = skipWhile;
    function unique(source, callbackfn, thisArg) {
        if (typeof (callbackfn) !== 'function')
            callbackfn = function (x, y) { return x === y; };
        let iterator = source[Symbol.iterator]();
        let r = iterator.next();
        let result = [];
        if (!r.done) {
            result.push(r.value);
            r = iterator.next();
            let index = 0;
            if (typeof (thisArg) !== 'undefined')
                while (!r.done) {
                    if (!result.some((value) => callbackfn.call(thisArg, r.value, value)))
                        result.push(r.value);
                    r = iterator.next();
                }
            else
                while (!r.done) {
                    if (!result.some((value) => callbackfn(r.value, value)))
                        result.push(r.value);
                    r = iterator.next();
                }
        }
        return result;
    }
    app.unique = unique;
    function join(source, separator) {
        if (Array.isArray(source))
            return source.join(separator);
        let iterator = source[Symbol.iterator]();
        let r = iterator.next();
        let result = [];
        let index = 0;
        while (!r.done) {
            result.push(r.value);
            r = iterator.next();
        }
        return result.join(separator);
    }
    app.join = join;
    function isIterable(obj) { return typeof (obj) !== 'undefined' && typeof (obj[Symbol.iterator]) === 'function'; }
    ;
    function toDebugHTML(value, options) {
        let state;
        if (typeof (options) === 'undefined')
            state = { maxDepth: 16, maxItems: 1024, currentCount: 0, currentDepth: 0, cssClass: {}, result: [] };
        else
            state = {
                maxDepth: (typeof (options.maxDepth) !== 'number' || isNaN(options.maxDepth) || !Number.isFinite(options.maxDepth)) ? 16 : options.maxDepth,
                maxItems: (typeof (options.maxItems) !== 'number' || isNaN(options.maxItems) || !Number.isFinite(options.maxItems)) ? 1024 : options.maxItems,
                currentCount: 0,
                currentDepth: 0,
                cssClass: (typeof (options.cssClass) !== 'object' || options.cssClass === null) ? {} : options.cssClass,
                result: []
            };
        __toDebugHTML(value, state);
        return state.result.join("\n");
    }
    app.toDebugHTML = toDebugHTML;
    function makeOpenTag(tagName, ...className) {
        if (typeof (className) === 'object' && className !== null && (className = unique(className.filter(notNilOrWhiteSpace).map((s) => s.trim()))).length > 0)
            return "<" + tagName + " class=\"" + className.join(" ") + "\">";
        return "<" + tagName + ">";
    }
    function makeHtmlValue(content, spec, ...className) {
        let doNotEscape;
        if (typeof (spec) === 'boolean') {
            if (typeof (className) !== 'object' || className === null)
                className = [];
            doNotEscape = spec;
        }
        else
            className = (typeof (className) !== 'object' || className === null) ? [spec].concat(className) : [spec];
        if ((className = unique(className.filter(notNilOrWhiteSpace).map((s) => s.trim()))).length > 0) {
            if (doNotEscape)
                return "<span class=\"" + className.join(" ") + "\">" + content + '</span>';
            return "<span class=\"" + className.join(" ") + "\">" + escape(content) + '</span>';
        }
        return (doNotEscape) ? content : escape(content);
    }
    function __toDebugHTML(value, state) {
        if (state.currentCount < state.maxItems)
            state.currentCount++;
        if (typeof (value) === "undefined")
            state.result.push(makeHtmlValue('undefined', state.cssClass.nilValue));
        else if (typeof (value) === "object") {
            if (value === null)
                state.result.push(makeHtmlValue('null', state.cssClass.nilValue));
            else {
                let name = '';
                try {
                    let v = value[Symbol.toStringTag]();
                    if (notNilOrWhiteSpace(v))
                        name = v;
                }
                catch ( /* okay to ignore */_a) { /* okay to ignore */ }
                if (Array.isArray(value)) {
                    if (name.length == 0)
                        name = 'Array';
                    if (state.currentCount >= state.maxItems)
                        state.result.push(makeHtmlValue("<" + name + ">", state.cssClass.typeName) + makeHtmlValue("{ length: " + value.length.toString() + " }", state.cssClass.skippedValue));
                    else if (value.length == 0)
                        state.result.push(makeHtmlValue("<" + name + ">", state.cssClass.typeName) + "[]");
                    else {
                        state.result.push(makeHtmlValue("<" + name + ">", state.cssClass.typeName) + ": [");
                        state.result.push(makeOpenTag("ol", state.cssClass.list));
                        if (state.currentDepth < state.maxDepth) {
                            let arrState = { maxDepth: state.maxDepth, maxItems: state.maxItems, currentCount: state.currentCount, currentDepth: state.currentDepth + 1, cssClass: state.cssClass, result: [] };
                            let reachedMax = false;
                            value.forEach((o) => {
                                if (state.currentCount < state.maxItems) {
                                    __toDebugHTML(o, arrState);
                                    state.result.push(makeOpenTag("li", state.cssClass.item) + arrState.result.map((s) => ((s.trim()).length == 0) ? "" : "\t" + s).join("\n") + "</li>");
                                    arrState.result = [];
                                }
                                else
                                    reachedMax = true;
                            });
                            if (reachedMax)
                                state.result.push(makeOpenTag("li", state.cssClass.item, state.cssClass.skippedValue) + makeHtmlValue("Reached max output limit: { length: " + value.length.toString() + " }", state.cssClass.skippedValue) + "</li>");
                            state.currentCount = arrState.currentCount;
                        }
                        else {
                            // TODO: Iterate without recursion
                        }
                        state.result.push("</ol>");
                        state.result.push("]");
                    }
                }
                else {
                    if (isIterable(value)) {
                        if (name.length == 0)
                            name = 'Iterable';
                        state.result.push(makeHtmlValue("<" + name + ">", state.cssClass.typeName) + ": [");
                        state.result.push(makeOpenTag("ul", state.cssClass.list));
                        if (state.currentDepth < state.maxDepth) {
                            let arrState = { maxDepth: state.maxDepth, maxItems: state.maxItems, currentCount: state.currentCount, currentDepth: state.currentDepth + 1, cssClass: state.cssClass, result: [] };
                            let reachedMax = false;
                            forEach(value, (o, index) => {
                                if (state.currentCount < state.maxItems) {
                                    __toDebugHTML(o, arrState);
                                    state.result.push(makeOpenTag("li", state.cssClass.item) + arrState.result.map((s) => ((s.trim()).length == 0) ? "" : "\t" + s).join("\n") + "</li>");
                                    arrState.result = [];
                                }
                                else
                                    reachedMax = true;
                            });
                            if (reachedMax)
                                state.result.push(makeOpenTag("li", state.cssClass.item, state.cssClass.skippedValue) + makeHtmlValue("Reached max output limit { ... }", state.cssClass.skippedValue) + "</li>");
                            state.currentCount = arrState.currentCount;
                        }
                        else {
                            // TODO: Iterate without recursion
                        }
                        state.result.push("</ul>");
                        state.result.push("]");
                    }
                    else {
                        if (name.length == 0)
                            name = 'object';
                        let json = undefined;
                        let fn = value["toJSON"];
                        if (typeof (fn) === 'function')
                            try {
                                json = fn.call(value);
                            }
                            catch ( /* okay to ignore */_b) { /* okay to ignore */ }
                        if (!isNil(json)) {
                            if (typeof (json) === 'string') {
                                state.result.push(makeHtmlValue("<" + name + ">", state.cssClass.typeName) + ": " + json);
                                return;
                            }
                            if (typeof (json) !== 'object') {
                                state.result.push(makeHtmlValue("<" + name + ">", state.cssClass.typeName) + ": " + makeHtmlValue(JSON.stringify(value), state.cssClass.primitiveValue));
                                return;
                            }
                            if (Array.isArray(json)) {
                                if (state.currentDepth < state.maxDepth) {
                                    let arrState = { maxDepth: state.maxDepth, maxItems: state.maxItems, currentCount: state.currentCount, currentDepth: state.currentDepth + 1, cssClass: state.cssClass, result: [] };
                                    __toDebugHTML(json, arrState);
                                    state.result.push(makeHtmlValue("<" + name + ">", state.cssClass.typeName) + ": " + arrState.result.map((s) => ((s.trim()).length == 0) ? "" : "\t" + s).join("\n"));
                                    state.currentCount = arrState.currentCount;
                                }
                                else {
                                    // TODO: Iterate without recursion
                                }
                                return;
                            }
                            value = json;
                        }
                        let propertyNames = [];
                        try {
                            propertyNames = Object.getOwnPropertyNames(value);
                        }
                        catch ( /* okay to ignore */_c) { /* okay to ignore */ }
                        if (isNilOrEmpty(propertyNames))
                            state.result.push(makeHtmlValue("<" + name + ">", state.cssClass.typeName) + ": " + makeHtmlValue(JSON.stringify(value), state.cssClass.objectValue));
                        else {
                            state.result.push(makeHtmlValue("<" + name + ">", state.cssClass.typeName) + ": [");
                            state.result.push(makeOpenTag("dl", state.cssClass.list));
                            if (state.currentDepth < state.maxDepth) {
                                let arrState = { maxDepth: state.maxDepth, maxItems: state.maxItems, currentCount: state.currentCount, currentDepth: state.currentDepth + 1, cssClass: state.cssClass, result: [] };
                                propertyNames.forEach((n) => {
                                    state.result.push(makeOpenTag('dt', state.cssClass.item) + escape(name) + "</dt>");
                                    if (state.currentCount < state.maxItems) {
                                        try {
                                            __toDebugHTML(value[n], arrState);
                                            state.result.push(makeOpenTag("dd", state.cssClass.item) + arrState.result.map((s) => ((s.trim()).length == 0) ? "" : "\t" + s).join("\n") + "</dd>");
                                        }
                                        catch (e) {
                                            state.result.push(makeOpenTag("dd", state.cssClass.item) + makeHtmlValue(JSON.stringify(e), state.cssClass.errorMessage) + "</dd>");
                                        }
                                        arrState.result = [];
                                    }
                                    else {
                                        // TODO: Add without recursion
                                    }
                                });
                            }
                            else {
                                // TODO: Iterate without recursion
                            }
                            state.result.push("</dl>");
                            state.result.push("]");
                        }
                    }
                }
            }
        }
        else if (typeof (value) === 'string')
            state.result.push(makeHtmlValue(JSON.stringify(value), state.cssClass.stringValue));
        else
            state.result.push(makeHtmlValue(JSON.stringify(value), state.cssClass.primitiveValue));
    }
    // #endregion
})(app || (app = {}));
//# sourceMappingURL=app.js.map