"use strict";
/// <reference path="../Scripts/typings/jquery/jquery.d.ts"/>
/// <reference path="../Scripts/typings/angularjs/angular.d.ts"/>
/// <reference path="../Scripts/typings/angularjs/angular-route.d.ts"/>
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * The application namespace.
 *
 * @namespace
 */
var app;
(function (app) {
    /**
    * The main module for this app.
    *
    * @type {ng.IModule}
    */
    app.appModule = angular.module('app', []);
    /**
     *
     *
     * @param {*} value
     * @returns {ErrorResult}
     */
    function asErrorResult(value) {
        if (typeof (value) !== "undefined" && value !== null) {
            let message;
            if (typeof (value) === "string")
                return ((message = value.trim()).length == 0) ? "Unexpected error" : message;
            if (value instanceof Error)
                return value;
            if (typeof (value) === "object" && ((typeof value.message !== "undefined") && value.message !== null)) {
                if (typeof value.data !== "undefined" && value.data !== null)
                    return value;
                if ((message = ((typeof value.message === "string") ? value.message : "" + value.message).trim()).length == 0)
                    message = ("" + value).trim();
            }
            else
                message = ("" + value).trim();
            return {
                message: (message.length == 0) ? "Unexpected Error" : message,
                data: value
            };
        }
    }
    function chainCallback(currentCallback, newCallback, thisArg) {
        if (typeof (currentCallback) !== "function")
            return newCallback;
        return function (...args) {
            try {
                currentCallback.apply(thisArg, args);
            }
            finally {
                newCallback.apply(thisArg, args);
            }
        };
    }
    /**
     *
     *
     * @export
     * @class patternExpressionController
     * @implements {ng.IController}
     */
    class patternExpressionController {
        /**
         *Creates an instance of patternExpressionController.
         * @param {IPatternExpressionScope} $scope
         * @param {regexOptionsService} regexOptions
         * @param {regexParserService} regexParser
         * @memberof patternExpressionController
         */
        constructor($scope, regexOptions, regexParser) {
            this.$scope = $scope;
            this.regexOptions = regexOptions;
            this.regexParser = regexParser;
            this.$scope.text = "";
            this.$scope.ignoreWhitespace = regexOptions.ignoreWhitespace;
            this.$scope.flags = regexOptions.flags;
            this.$scope.editDialogVisible = regexOptions.editDialogVisible;
            this.$scope.showRegexOptionsEditDialog = () => { regexOptions.editDialogVisible = true; };
            regexOptions.whenEditDialogChanged((value) => { $scope.editDialogVisible = value; });
            regexOptions.whenIgnoreWhitespaceChanged((value) => { $scope.ignoreWhitespace = value; });
            regexOptions.whenPatternOptionsChanged((value) => { $scope.flags = value; });
        }
        $onChanges() {
            this.regexParser.pattern = this.$scope.text;
        }
    }
    app.patternExpressionController = patternExpressionController;
    app.appModule.controller("patternExpression", ["$scope", "regexOptions", "regexParser", patternExpressionController]);
    /**
     *
     *
     * @export
     * @class regexOptionsService
     * @implements {IRegexOptions}
     */
    class regexOptionsService {
        constructor(options, ignoreWhitespace, autoExec, editDialogVisible) {
            // #region ignoreWhitespace Property
            this._ignoreWhitespace = false;
            // #endregion
            // #region flags Property
            this._flags = "";
            // #endregion
            // #region global Property
            this._global = false;
            // #endregion
            // #region ignoreCase Property
            this._ignoreCase = false;
            // #endregion
            // #region multiline Property
            this._multiline = false;
            // #endregion
            // #region dotMatchesNewline Property
            this._dotMatchesNewline = false;
            // #endregion
            // #region unicode Property
            this._unicode = false;
            // #endregion
            // #region sticky Property
            this._sticky = false;
            // #endregion
            // #region autoExec Property
            this._autoExec = false;
            // #endregion
            // #region autoExec Property
            this._editDialogVisible = false;
        }
        /**
         *
         *
         * @type {boolean}
         * @memberof regexOptionsService
         */
        get ignoreWhitespace() { return this._ignoreWhitespace; }
        set ignoreWhitespace(value) {
            if (this._ignoreWhitespace == ((typeof (value) !== "boolean") ? (value = (value === true)) : value))
                return;
            this._ignoreWhitespace = value;
            let fn = this._whenIgnoreWhitespaceChanged;
            if (typeof (fn) !== "undefined")
                fn(value);
        }
        /**
         *
         *
         * @readonly
         * @type {string}
         * @memberof regexOptionsService
         */
        get flags() { return this._flags; }
        /**
         *
         *
         * @type {boolean}
         * @memberof regexOptionsService
         */
        get global() { return this._global; }
        set global(value) {
            if (this._global == ((typeof (value) !== "boolean") ? (value = (value === true)) : value))
                return;
            this._global = value;
            this.updateFlags();
        }
        /**
         *
         *
         * @type {boolean}
         * @memberof regexOptionsService
         */
        get ignoreCase() { return this._ignoreCase; }
        set ignoreCase(value) {
            if (this._ignoreCase == ((typeof (value) !== "boolean") ? (value = (value === true)) : value))
                return;
            this._ignoreCase = value;
            this.updateFlags();
        }
        /**
         *
         *
         * @type {boolean}
         * @memberof regexOptionsService
         */
        get multiline() { return this._multiline; }
        set multiline(value) {
            if (this._multiline == ((typeof (value) !== "boolean") ? (value = (value === true)) : value))
                return;
            this._multiline = value;
            this.updateFlags();
        }
        /**
         *
         *
         * @type {boolean}
         * @memberof regexOptionsService
         */
        get dotMatchesNewline() { return this._dotMatchesNewline; }
        set dotMatchesNewline(value) {
            if (this._dotMatchesNewline == ((typeof (value) !== "boolean") ? (value = (value === true)) : value))
                return;
            this._dotMatchesNewline = value;
            this.updateFlags();
        }
        /**
         *
         *
         * @type {boolean}
         * @memberof regexOptionsService
         */
        get unicode() { return this._unicode; }
        set unicode(value) {
            if (this._unicode == ((typeof (value) !== "boolean") ? (value = (value === true)) : value))
                return;
            this._unicode = value;
            this.updateFlags();
        }
        /**
         *
         *
         * @type {boolean}
         * @memberof regexOptionsService
         */
        get sticky() { return this._sticky; }
        set sticky(value) {
            if (this._sticky == ((typeof (value) !== "boolean") ? (value = (value === true)) : value))
                return;
            this._sticky = value;
            this.updateFlags();
            (/asdf/).ignoreCase;
        }
        /**
         *
         *
         * @type {boolean}
         * @memberof regexOptionsService
         */
        get autoExec() { return this._autoExec; }
        set autoExec(value) {
            if (this._autoExec == ((typeof (value) !== "boolean") ? (value = (value === true)) : value))
                return;
            this._autoExec = value;
            let fn = this._whenAutoExecChanged;
            if (typeof (fn) !== "undefined")
                fn(value);
        }
        /**
         *
         *
         * @type {boolean}
         * @memberof regexOptionsService
         */
        get editDialogVisible() { return this._editDialogVisible; }
        set editDialogVisible(value) {
            if (this._editDialogVisible == ((typeof (value) !== "boolean") ? (value = (value === true)) : value))
                return;
            this._editDialogVisible = value;
            let fn = this._whenEditDialogChanged;
            if (typeof (fn) !== "undefined")
                fn(value);
        }
        /**
         *
         *
         * @param {IRegexPatternOptions} target
         * @memberof regexOptionsService
         */
        updateTo(target) {
            target.dotMatchesNewline = this._dotMatchesNewline;
            target.global = this._global;
            target.ignoreCase = this._ignoreCase;
            target.multiline = this._multiline;
            target.sticky = this._sticky;
            target.unicode = this._unicode;
        }
        /**
         *
         *
         * @param {IRegexPatternOptions} target
         * @returns {boolean}
         * @memberof regexOptionsService
         */
        updateFrom(target) {
            let flags = regexOptionsService.toFlags(target);
            if (flags === this._flags)
                return false;
            this._dotMatchesNewline = target.dotMatchesNewline;
            this._global = target.global;
            this._ignoreCase = target.ignoreCase;
            this._multiline = target.multiline;
            this._sticky = target.sticky;
            this._unicode = target.unicode;
            this.updateFlags();
            return true;
        }
        /**
         *
         *
         * @static
         * @param {IRegexPatternOptions} value
         * @returns
         * @memberof regexOptionsService
         */
        static toFlags(value) {
            return [value.ignoreCase ? "i" : "", value.global ? "g" : "", value.multiline ? "m" : "", value.dotMatchesNewline ? "s" : "", value.unicode ? "u" : "", value.sticky ? "y" : ""].join("");
        }
        updateFlags() {
            let patternOptions = regexOptionsService.toFlags(this);
            let fn = this._whenPatternOptionsChanged;
            this._flags = patternOptions;
            if (typeof (fn) !== "undefined")
                fn(patternOptions);
        }
        /**
         *
         *
         * @param {{ (newValue: boolean): void }} callbackFn
         * @memberof regexOptionsService
         */
        whenEditDialogChanged(callbackFn) { this._whenEditDialogChanged = chainCallback(this._whenEditDialogChanged, callbackFn); }
        /**
         *
         *
         * @param {{ (newValue: boolean): void }} callbackFn
         * @memberof regexOptionsService
         */
        whenAutoExecChanged(callbackFn) { this._whenAutoExecChanged = chainCallback(this._whenAutoExecChanged, callbackFn); }
        /**
         *
         *
         * @param {{ (newValue: string): void }} callbackFn
         * @memberof regexOptionsService
         */
        whenPatternOptionsChanged(callbackFn) { this._whenPatternOptionsChanged = chainCallback(this._whenPatternOptionsChanged, callbackFn); }
        /**
         *
         *
         * @param {{ (newValue: boolean): void }} callbackFn
         * @memberof regexOptionsService
         */
        whenIgnoreWhitespaceChanged(callbackFn) { this._whenIgnoreWhitespaceChanged = chainCallback(this._whenIgnoreWhitespaceChanged, callbackFn); }
    }
    app.regexOptionsService = regexOptionsService;
    app.appModule.service("regexOptions", [() => { return new regexOptionsService(); }]);
    /**
     *
     *
     * @export
     * @class editRegexOptionsController
     * @implements {ng.IController}
     */
    class editRegexOptionsController {
        /**
         *Creates an instance of editRegexOptionsController.
         * @param {IEditRegexOptionsScope} $scope
         * @param {regexOptionsService} regexOptions
         * @memberof editRegexOptionsController
         */
        constructor($scope, regexOptions) {
            this.$scope = $scope;
            this.regexOptions = regexOptions;
            $scope.modalId = editRegexOptionsController.ModalID;
            $scope.global = regexOptions.global;
            $scope.ignoreCase = regexOptions.ignoreCase;
            $scope.multiline = regexOptions.multiline;
            $scope.dotMatchesNewline = regexOptions.dotMatchesNewline;
            $scope.sticky = regexOptions.sticky;
            $scope.unicode = regexOptions.unicode;
            $scope.ignoreWhitespace = regexOptions.ignoreWhitespace;
            $scope.editDialogVisible = regexOptions.editDialogVisible;
            let controller = this;
            $scope.hideRegexOptions = () => { controller.hideRegexOptions(); };
            $scope.acceptRegexOptions = () => { controller.acceptRegexOptions(); };
            $scope.cancelRegexOptions = () => { controller.cancelRegexOptions(); };
            regexOptions.whenEditDialogChanged((value) => {
                $scope.editDialogVisible = value;
                $("#" + editRegexOptionsController.ModalID).modal((value) ? "show" : "hide");
            });
        }
        /**
         *
         *
         * @memberof editRegexOptionsController
         */
        hideRegexOptions() { this.regexOptions.editDialogVisible = false; }
        /**
         *
         *
         * @memberof editRegexOptionsController
         */
        acceptRegexOptions() {
            this.regexOptions.updateFrom(this.$scope);
            this.regexOptions.ignoreWhitespace = this.$scope.ignoreWhitespace;
            this.regexOptions.editDialogVisible = false;
        }
        /**
         *
         *
         * @memberof editRegexOptionsController
         */
        cancelRegexOptions() {
            this.regexOptions.updateTo(this.$scope);
            this.$scope.ignoreWhitespace = this.regexOptions.ignoreWhitespace;
            this.regexOptions.editDialogVisible = false;
        }
        $onChanges() { }
    }
    /**
     *
     *
     * @static
     * @memberof editRegexOptionsController
     */
    editRegexOptionsController.ModalID = "regexOptionsModal";
    app.editRegexOptionsController = editRegexOptionsController;
    app.appModule.controller("editRegexOptions", ["$scope", "regexOptions", editRegexOptionsController]);
    // #endregion
    // #region regexEvaluation Service
    const parentEvaluationSourceCollection = Symbol();
    class EvaluationSourceCollectionMember {
    }
    EvaluationSourceCollectionMember.parent = Symbol();
    /**
     *
     *
     * @export
     * @class regexEvaluationState
     */
    class regexEvaluationState {
        constructor(inputText, specialCharacterValue, specialCharacterIndex) {
            this._instanceSymbol = Symbol();
        }
        update(inputText, specialCharacterValue, specialCharacterIndex) {
        }
        /**
         *
         *
         * @static
         * @param {regexEvaluationState} x
         * @param {regexEvaluationState} y
         * @returns
         * @memberof regexEvaluationState
         */
        static areSame(x, y) {
            return (typeof x === "undefined") ? (typeof y === "undefined") : ((typeof y !== "undefined") && ((x === null) ? y === null : (y !== null && x._instanceSymbol === y._instanceSymbol)));
        }
    }
    app.regexEvaluationState = regexEvaluationState;
    /**
     *
     *
     * @export
     * @class EvaluationSourceCollection
     * @implements {Map<number, regexEvaluationState>}
     */
    class EvaluationSourceCollection {
        /**
         *Creates an instance of EvaluationSourceCollection.
         * @param {{ (): void; }} [_collectionChangedCallback]
         * @memberof EvaluationSourceCollection
         */
        constructor(_collectionChangedCallback) {
            this._collectionChangedCallback = _collectionChangedCallback;
            this._instanceSymbol = Symbol();
            this._sourceEntries = [];
        }
        /**
         *
         *
         * @readonly
         * @type {number}
         * @memberof EvaluationSourceCollection
         */
        get size() { return this._sourceEntries.length; }
        raiseCollectionChanged() {
            if (typeof this._collectionChangedCallback === "function")
                this._collectionChangedCallback();
        }
        assertValidateInsertItems(items) {
            if ((typeof items === "undefined") || items === null || items.length == 0)
                return;
            if (!items.every((item, index) => {
                if ((typeof item !== "object") || item === null)
                    throw new Error("Invalid item at parameter index " + index);
                let parent = item[parentEvaluationSourceCollection];
                if (typeof parent !== "undefined") {
                    if (parent._instanceSymbol === this._instanceSymbol)
                        throw new Error("Item already exists in collection (parameter index: " + index + ")");
                    throw new Error("Item already exists in another EvaluationSourceCollection");
                }
                for (let i = 0; i < index; i++) {
                    if (regexEvaluationState.areSame(item, items[i]))
                        throw new Error("Same item exists twice in arguments to be added to collection (parameter indexes " + i + " and " + index + ".");
                }
                return true;
            }))
                throw new Error("Invalid items cannot be added.");
        }
        /**
         *
         *
         * @param {...regexEvaluationState[]} items
         * @returns {number}
         * @memberof EvaluationSourceCollection
         */
        push(...items) {
            if ((typeof items !== "object") || items === null || items.length == 0)
                return this._sourceEntries.length - 1;
            this.assertValidateInsertItems(items);
            let result = this._sourceEntries.push.apply(this._sourceEntries, items);
            items.forEach((i) => { i[parentEvaluationSourceCollection] = this; });
            this.raiseCollectionChanged();
            return result;
        }
        splice(start, deleteCount, ...items) {
            if ((typeof items !== "object") || items === null)
                items = [];
            else if (items.length > 0)
                this.assertValidateInsertItems(items);
            let result;
            if (typeof items === "undefined" || items === null || items.length === 0) {
                if ((typeof deleteCount !== "number") || isNaN(deleteCount))
                    result = this._sourceEntries.splice(start);
                else
                    result = this._sourceEntries.splice(start, deleteCount);
            }
            else
                result = this._sourceEntries.splice.apply(this._sourceEntries, ([start, ((typeof deleteCount !== "number") || isNaN(deleteCount)) ? 0 : deleteCount]).concat(items));
            result.forEach((i) => { i[parentEvaluationSourceCollection] = undefined; });
            items.forEach((i) => { i[parentEvaluationSourceCollection] = this; });
            if (result.length > 0 || items.length > 0)
                this.raiseCollectionChanged();
            return result;
        }
        /**
         *
         *
         * @param {regexEvaluationState} searchElement
         * @param {number} [fromIndex]
         * @returns {number}
         * @memberof EvaluationSourceCollection
         */
        indexOf(searchElement, fromIndex) {
            if ((typeof searchElement !== "object") || searchElement === null)
                return -1;
            let parent = searchElement[parentEvaluationSourceCollection];
            if ((typeof parent !== "undefined") && parent._instanceSymbol === this._instanceSymbol)
                for (let i = ((typeof fromIndex !== "number") || isNaN(fromIndex) || fromIndex < 0) ? 0 : fromIndex; i < this._sourceEntries.length; i++) {
                    if (regexEvaluationState.areSame(searchElement, this._sourceEntries[i]))
                        return i;
                }
            return -1;
        }
        /**
         *
         *
         * @param {...regexEvaluationState[]} items
         * @returns {number}
         * @memberof EvaluationSourceCollection
         */
        unshift(...items) {
            if ((typeof items !== "object") || items === null || items.length == 0)
                return 0;
            this.assertValidateInsertItems(items);
            let result = this._sourceEntries.unshift.apply(this._sourceEntries, items);
            items.forEach((i) => { i[parentEvaluationSourceCollection] = this; });
            this.raiseCollectionChanged();
            return result;
        }
        /**
         *
         *
         * @returns {void}
         * @memberof EvaluationSourceCollection
         */
        clear() {
            if (this._sourceEntries.length == 0)
                return;
            let arr = this._sourceEntries;
            this._sourceEntries = [];
            arr.forEach((value) => { value[parentEvaluationSourceCollection] = undefined; });
            this.raiseCollectionChanged();
        }
        /**
         *
         *
         * @param {number} key
         * @returns {boolean}
         * @memberof EvaluationSourceCollection
         */
        delete(key) {
            if (typeof (key) !== "number" || isNaN(key) || key < 0 || key >= this._sourceEntries.length)
                return false;
            let item = (key === 0) ? this._sourceEntries.shift() : ((key == this._sourceEntries.length - 1) ? this._sourceEntries.pop() : this._sourceEntries.splice(key, 1)[0]);
            item[parentEvaluationSourceCollection] = undefined;
            this.raiseCollectionChanged();
        }
        /**
         *
         *
         * @param {(value: regexEvaluationState, key: number, map: EvaluationSourceCollection) => void} callbackfn
         * @param {*} [thisArg]
         * @memberof EvaluationSourceCollection
         */
        forEach(callbackfn, thisArg) {
            if (typeof (thisArg) === "undefined")
                this._sourceEntries.forEach((value, index) => { callbackfn(value, index, this); });
            else
                this._sourceEntries.forEach((value, index) => { callbackfn.call(thisArg, value, index, this); });
        }
        /**
         *
         *
         * @template T
         * @param {(value: regexEvaluationState, key: number, map: EvaluationSourceCollection) => T} callbackfn
         * @param {*} [thisArg]
         * @returns {T[]}
         * @memberof EvaluationSourceCollection
         */
        map(callbackfn, thisArg) {
            if (typeof (thisArg) === "undefined")
                return this._sourceEntries.map((value, index) => { return callbackfn(value, index, this); });
            return this._sourceEntries.map((value, index) => { return callbackfn.call(thisArg, value, index, this); });
        }
        /**
         *
         *
         * @param {number} key
         * @returns {regexEvaluationState}
         * @memberof EvaluationSourceCollection
         */
        get(key) { return this._sourceEntries[key]; }
        /**
         *
         *
         * @param {number} key
         * @returns {boolean}
         * @memberof EvaluationSourceCollection
         */
        has(key) { return typeof (key) === "number" && !isNaN(key) && key > -1 && key < this._sourceEntries.length; }
        /**
         *
         *
         * @param {regexEvaluationState} value
         * @returns
         * @memberof EvaluationSourceCollection
         */
        contains(value) {
            if ((typeof value !== "object") || value === null)
                return false;
            let parent = value[parentEvaluationSourceCollection];
            return (typeof parent !== "undefined") && parent._instanceSymbol === this._instanceSymbol;
        }
        /**
         *
         *
         * @param {number} key
         * @param {regexEvaluationState} value
         * @returns {this}
         * @memberof EvaluationSourceCollection
         */
        set(key, value) {
            if ((typeof (value) !== "object") || value === null)
                throw new Error("Value cannot be undefined or null.");
            let parent = value[parentEvaluationSourceCollection];
            if (typeof parent !== "undefined") {
                if (parent._instanceSymbol === this._instanceSymbol) {
                    if (regexEvaluationState.areSame(this._sourceEntries[key], value))
                        return;
                    throw new Error("Item already exists in collection");
                }
                throw new Error("Item already exists in another EvaluationSourceCollection");
            }
            let oldItem = this._sourceEntries[key];
            this._sourceEntries[key] = value;
            oldItem[parentEvaluationSourceCollection] = undefined;
            value[parentEvaluationSourceCollection] = this;
            this.raiseCollectionChanged();
            return this;
        }
        [Symbol.iterator]() { return this.entries(); }
        /**
         *
         *
         * @returns {IterableIterator<[number, regexEvaluationState]>}
         * @memberof EvaluationSourceCollection
         */
        entries() { return this._sourceEntries.map((value, index) => { return [index, value]; }).values(); }
        /**
         *
         *
         * @returns {IterableIterator<number>}
         * @memberof EvaluationSourceCollection
         */
        keys() { return this._sourceEntries.map((value, index) => { return index; }).values(); }
        /**
         *
         *
         * @returns {IterableIterator<regexEvaluationState>}
         * @memberof EvaluationSourceCollection
         */
        values() { return this._sourceEntries.values(); }
    }
    app.EvaluationSourceCollection = EvaluationSourceCollection;
    /**
     *
     *
     * @export
     * @class regexEvaluationService
     */
    class regexEvaluationService {
        // #endregion
        /**
         *Creates an instance of regexEvaluationService.
         * @param {ng.IQService} $q
         * @param {regexParserService} regexParser
         * @param {regexOptionsService} regexOptions
         * @memberof regexEvaluationService
         */
        constructor($q, regexParser, regexOptions) {
            this.$q = $q;
            this.regexParser = regexParser;
            this.regexOptions = regexOptions;
            let service = this;
            regexParser.whenParsed((re) => {
                if (regexOptions.autoExec)
                    this.startEvaluation();
            });
            this._source = new EvaluationSourceCollection(() => {
                if (regexOptions.autoExec)
                    this.startEvaluation();
            });
        }
        /**
         *
         *
         * @readonly
         * @type {EvaluationSourceCollection}
         * @memberof regexEvaluationService
         */
        get source() { return this._source; }
        _whenError(errorReason) {
            let error;
            if (typeof (errorReason) === "undefined" || errorReason === "null")
                error = new Error("Unexpected failure");
            else if (typeof errorReason === "string")
                error = new Error(errorReason);
            else if (errorReason instanceof Error)
                error = errorReason;
            else {
                let message = ((typeof errorReason.message === "string") ? errorReason.message :
                    ((typeof errorReason.message !== "undefined" && errorReason.message !== null) ? errorReason.message : "")).trim();
                error = {
                    message: (message.length == 0) ? "Unexpected Error" : message,
                    data: errorReason,
                };
            }
            let whenEvaluationFailed = this._whenEvaluationFailed;
            if (typeof whenEvaluationFailed === "function")
                whenEvaluationFailed(error);
            return error;
        }
        /**
         *
         *
         * @memberof regexEvaluationService
         */
        startEvaluation() {
            this.regexParser.then((result) => {
                this._result = this.$q((resolve, reject) => {
                }).then((result) => {
                    let whenEvaluationCompleted = this._whenEvaluationCompleted;
                    if (typeof (whenEvaluationCompleted) == "function")
                        whenEvaluationCompleted(result);
                    return result;
                }, this._whenError);
            }, (reason) => {
                this._result = this.$q((resolve, reject) => {
                    reject(reason);
                }).then((result) => { return result; }, this._whenError);
            });
        }
        /**
         *
         *
         * @param {{ (result: IRegexEvaluationResult[]): void; }} successCallback
         * @memberof regexEvaluationService
         */
        whenEvaluationCompleted(successCallback) {
            this._whenEvaluationCompleted = chainCallback(this._whenEvaluationCompleted, successCallback);
        }
        /**
         *
         *
         * @param {{ (reason: ErrorResult): void; }} callback
         * @memberof regexEvaluationService
         */
        whenEvaluationFailed(callback) { this._whenEvaluationFailed = chainCallback(this._whenEvaluationFailed, callback); }
        /**
         *
         *
         * @param {{ (resresultponse: IRegexEvaluationResult[]): any; }} successCallback
         * @param {{ (reason: ErrorResult): any}} [errorCallback]
         * @returns {*}
         * @memberof regexEvaluationService
         */
        then(successCallback, errorCallback) {
            return this._result.then(successCallback, errorCallback);
        }
    }
    app.regexEvaluationService = regexEvaluationService;
    app.appModule.service("regexEvaluation", ["$q", "regexParser", "regexOptions", regexEvaluationService]);
    // #endregion
    // #region regexParser Service
    const WhitespaceRe = /[\s\r\n\p{C}]+/;
    /**
     * Asynchronously parses the regular expression pattern.
     *
     * @export
     * @class regexParserService
     */
    class regexParserService {
        // #endregion
        /**
         * Creates an instance of regexParserService.
         * @param {ng.IQService} $q Service for asynchronous execution.
         * @param {regexOptionsService} regexOptions Specifies regular expression options.
         * @memberof regexParserService
         */
        constructor($q, regexOptions) {
            this.$q = $q;
            this.regexOptions = regexOptions;
            this._flags = "";
            this._ignoreWhitespace = false;
            this._targetPattern = "";
            this._parsedPattern = "";
            this._parsedFlags = "";
            this._lastSuccessfulParse = null;
            this._pattern = "";
            let service = this;
            regexOptions.whenIgnoreWhitespaceChanged((value) => {
                if (value === this._ignoreWhitespace)
                    return;
                this._ignoreWhitespace = value;
                this._targetPattern = (value) ? this._pattern.replace(WhitespaceRe, "") : this._pattern;
                if (this.regexOptions.autoExec && this._targetPattern !== this._parsedPattern)
                    this.startParse();
            });
            regexOptions.whenPatternOptionsChanged((value) => {
                if (value === this._flags)
                    return;
                this._flags = value;
                if (this.regexOptions.autoExec && (this._parsedPattern !== this._targetPattern || this._parsedFlags !== this._flags))
                    this.startParse();
            });
            regexOptions.whenAutoExecChanged((value) => {
                if (value && (this._parsedPattern !== this._targetPattern || this._parsedFlags !== this._flags))
                    this.startParse();
            });
            this.startParse();
        }
        // #region lastSuccessfulParse Property
        /**
         * This contains the last successfully parsed regular expression.
         *
         * @readonly
         * @type {(RegExp | null)}
         * @memberof regexParserService
         */
        get lastSuccessfulParse() { return this._lastSuccessfulParse; }
        // #endregion
        /**
         * The actual string to be parsed, which has whitespace removed if ignoreWhatespace is true.
         *
         * @readonly
         * @type {string}
         * @memberof regexParserService
         */
        get targetPattern() { return this._targetPattern; }
        // #region pattern Property
        /**
         * The user-provided regular expression pattern.
         *
         * @type {string}
         * @memberof regexParserService
         */
        get pattern() { return this._pattern; }
        set pattern(value) {
            this._pattern = (typeof value === "undefined" || value === null) ? (value = "") : ((typeof value === "string") ? value : (value = "" + value));
            value = (this._ignoreWhitespace) ? this._pattern.replace(WhitespaceRe, "") : this._pattern;
            if (this._targetPattern === value)
                return;
            this._targetPattern = value;
            if (this.regexOptions.autoExec)
                this.startParse();
        }
        /**
         * Begins asynchronous parsing of the current regular expression pattern.
         *
         * @returns {IPromise<RegExp>}
         * @memberof regexParserService
         */
        startParse() {
            let result;
            this._result = result = this.$q((resolve, reject) => {
                let pattern = this._targetPattern;
                let flags = this._flags;
                this._parsedPattern = pattern;
                this._parsedFlags = flags;
                let result;
                try {
                    result = new RegExp(pattern, flags);
                }
                catch (e) {
                    reject(asErrorResult(e));
                    return;
                }
                if (typeof (result) !== "object" || result === null)
                    reject("Failed to parse regular expression");
                else
                    resolve(result);
            }).then((result) => {
                let whenParsed = this._whenParsed;
                if (typeof whenParsed === "function")
                    whenParsed(result);
                return result;
            }, (errorReason) => {
                let err = asErrorResult(errorReason);
                let whenParseFailed = this._whenParseFailed;
                if (typeof whenParseFailed === "function")
                    whenParseFailed(err);
                return err;
            });
            return result;
        }
        /**
         * This gets called after a regular expression patter has been successfully parsed.
         *
         * @param {{ (value: RegExp): void; }} callback
         * @memberof regexParserService
         */
        whenParsed(callback) { this._whenParsed = chainCallback(this._whenParsed, callback); }
        /**
         * This gets called after a failed attempt to parse a regular expression string.
         *
         * @param {{ (reason: ErrorResult): void; }} callback
         * @memberof regexParserService
         */
        whenParseFailed(callback) { this._whenParseFailed = chainCallback(this._whenParseFailed, callback); }
        then(successCallback, errorCallback) {
            return this._result.then(successCallback, errorCallback);
        }
    }
    app.regexParserService = regexParserService;
    app.appModule.service("regexParser", ["$q", "regexOptions", regexParserService]);
    // #endregion
    // #region regexTest Controller
    /**
     *
     *
     * @export
     * @enum {number}
     */
    let SpecialCharacterOptionValue;
    (function (SpecialCharacterOptionValue) {
        /**
         *
         */
        SpecialCharacterOptionValue[SpecialCharacterOptionValue["none"] = 0] = "none";
        /**
         *
         */
        SpecialCharacterOptionValue[SpecialCharacterOptionValue["append"] = 1] = "append";
        /**
         *
         */
        SpecialCharacterOptionValue[SpecialCharacterOptionValue["insert"] = 2] = "insert";
    })(SpecialCharacterOptionValue = app.SpecialCharacterOptionValue || (app.SpecialCharacterOptionValue = {}));
    /**
     *
     *
     * @export
     * @class regexTestController
     * @implements {ng.IController}
     */
    class regexTestController {
        /**
         *Creates an instance of regexTestController.
         * @param {IRegexTestScope} $scope
         * @param {regexOptionsService} regexOptions
         * @param {regexEvaluationService} regexEvaluation
         * @memberof regexTestController
         */
        constructor($scope, regexOptions, regexEvaluation) {
            this.$scope = $scope;
            this.regexOptions = regexOptions;
            this.regexEvaluation = regexEvaluation;
            this.$scope.specialCharacterIndex = 0;
            this.$scope.specialCharacterValue = 27;
            this.$scope.specialCharacterOptions = [
                { id: SpecialCharacterOptionValue.none, text: "No special character" },
                { id: SpecialCharacterOptionValue.append, text: "Append special character" },
                { id: SpecialCharacterOptionValue.insert, text: "Insert special character" }
            ];
            this.$scope.selectedSpecialCharacterOption = SpecialCharacterOptionValue.none;
            if (this.regexEvaluation.source.size === 0)
                this.regexEvaluation.source.push(new regexEvaluationState(this.$scope.inputText));
            else
                this.regexEvaluation.source.get(0).update(this.$scope.inputText);
            this.$scope.inputText = '';
            let controller = this;
            this.$scope.executeRegex = () => { controller.executeRegex(); };
        }
        /**
         *
         *
         * @memberof regexTestController
         */
        executeRegex() {
        }
        $onChanges() {
            if (!this.$scope.autoExec)
                this.regexOptions.autoExec = this.$scope.autoExec;
            if (this.$scope.selectedSpecialCharacterOption === SpecialCharacterOptionValue.none)
                this.regexEvaluation.source.get(0).update(this.$scope.inputText);
            else if (this.$scope.selectedSpecialCharacterOption == SpecialCharacterOptionValue.append)
                this.regexEvaluation.source.get(0).update(this.$scope.inputText, this.$scope.specialCharacterValue);
            else
                this.regexEvaluation.source.get(0).update(this.$scope.inputText, this.$scope.specialCharacterValue, this.$scope.specialCharacterIndex);
            if (this.$scope.autoExec)
                this.regexOptions.autoExec = this.$scope.autoExec;
        }
    }
    app.regexTestController = regexTestController;
    app.appModule.controller('regexTest', ["$scope", "regexOptions", "regexEvaluation", regexTestController]);
    /**
     * Represents the results of a regular expression evaluation.
     *
     * @export
     * @class regexResultController
     * @implements {ng.IController}
     */
    class regexResultController {
        /**
         *Creates an instance of regexResultController.
         * @param {IRegexResultScope} $scope
         * @memberof regexResultController
         */
        constructor($scope) {
            this.$scope = $scope;
        }
        $onInit() {
        }
    }
    app.regexResultController = regexResultController;
    app.appModule.controller("regexResult", ["$scope", regexResultController]);
    // #endregion
})(app || (app = {}));
//# sourceMappingURL=app.js.map