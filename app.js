/// <reference path="Scripts/typings/jquery/jquery.d.ts"/>
/// <reference path="Scripts/typings/angularjs/angular.d.ts"/>
var app;
(function (app) {
    app.module = angular.module("mainModule", []);
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
    function asNotEmptyOrUndefined(value, trim) {
        if (typeof (value) !== 'undefined' && value !== null && value.length > 0)
            return (trim === true && typeof (value) === 'string') ? value.trim() : value;
    }
    app.asNotEmptyOrUndefined = asNotEmptyOrUndefined;
    function asNotWhitespaceOrUndefined(value, trim) {
        if (typeof (value) === 'string') {
            if (trim === true) {
                if ((value = value.trim()).length > 0)
                    return value;
            }
            else if (value.trim().length > 0)
                return value;
        }
    }
    app.asNotWhitespaceOrUndefined = asNotWhitespaceOrUndefined;
    function asNotEmptyOrNull(value, trim) {
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
    app.asNotEmptyOrNull = asNotEmptyOrNull;
    function asNotWhitespaceOrNull(value, trim) {
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
    app.asNotWhitespaceOrNull = asNotWhitespaceOrNull;
    function isFiniteNumber(value) { return typeof (value) === 'number' && !isNaN(value) && Number.isFinite(value); }
    app.isFiniteNumber = isFiniteNumber;
    function isFiniteWholeNumber(value) { return typeof (value) === 'number' && !isNaN(value) && Number.isFinite(value) && Math.round(value) === value; }
    app.isFiniteWholeNumber = isFiniteWholeNumber;
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
    class TopNavController {
        constructor($scope, $location, $http) {
            this.$scope = $scope;
            this.$location = $location;
            this.$http = $http;
            $http.get("./pageNavigation.json").then((nav) => {
                let pageName = $location.path().split("/").reduce((previousValue, currentValue) => { return (currentValue.length > 0) ? currentValue : previousValue; }, "").toLowerCase();
                if (isNil(nav.data))
                    alert("Failed to load navigation from ./pageNavigation.json. Reason (" + nav.status + "): " + nav.statusText);
                else if (typeof (nav.data.items) === 'undefined')
                    alert("Failed to load navigation from ./pageNavigation.json. Reason: No items returned. Status: (" + nav.status + "): " + nav.statusText);
                else {
                    let selectedItem;
                    $scope.items = nav.data.items.map((d) => {
                        let result = this.createNavigationItem(nav.data, $scope, pageName, d);
                        if (!isNil(result.selectedItem) && isNil(selectedItem))
                            selectedItem = result.selectedItem;
                        return result.item;
                    });
                    $scope.pageTitle = ((isNil(selectedItem)) ? $scope.items[0] : selectedItem).pageTitle;
                }
            }).catch((reason) => {
                if (!isNil(reason)) {
                    if (typeof (reason) !== 'string') {
                        try {
                            alert("Failed to load navigation from ./pageNavigation.json. Reason: " + JSON.stringify(reason) + ".");
                        }
                        catch (_a) {
                            alert("Failed to load navigation from ./pageNavigation.json. Reason: " + reason + ".");
                        }
                    }
                    else if ((reason = reason.trim()).length > 0)
                        alert("Failed to load navigation from ./pageNavigation.json. Reason: " + reason);
                }
                alert("Failed to load navigation from ./pageNavigation.json. Reason: unknown.");
            });
        }
        createNavigationItem(data, $scope, pageName, definition) {
            let item = ($scope.$new());
            item.linkTitle = definition.linkTitle;
            item.pageTitle = (isNilOrWhiteSpace(definition.pageTitle)) ? item.linkTitle : definition.pageTitle;
            let selectedItem;
            if (definition.url.toLowerCase() === pageName) {
                selectedItem = item;
                item.href = "#";
                item.class = data.selectedItemClass;
                item.isCurrent = true;
                item.onClick = function () { return false; };
            }
            else {
                item.href = definition.url;
                item.class = data.otherItemClass;
                item.isCurrent = false;
                item.onClick = function () { return true; };
            }
            if (notNilOrEmpty(definition.items)) {
                item.items = definition.items.map((d) => {
                    let result = this.createNavigationItem(data, item, pageName, d);
                    if (!isNil(result.selectedItem) && isNil(result.selectedItem)) {
                        selectedItem = result.item;
                        item.class = data.currentItemClass;
                        item.isCurrent = true;
                    }
                    return result.item;
                });
            }
            return { item: item, selectedItem: selectedItem };
        }
        $doCheck() { }
    }
    app.module.controller("TopNavController", ["$scope", "$location", "$http", TopNavController]);
    // #endregion
})(app || (app = {}));
//# sourceMappingURL=app.js.map