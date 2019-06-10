/// <reference path="Scripts/typings/jquery/jquery.d.ts"/>
/// <reference path="Scripts/typings/angularjs/angular.d.ts"/>
/// <reference path="sys.ts"/>
/// <reference path="app.ts"/>
var regexTester;
(function (regexTester) {
    // #region RegexTester Controller
    class RegexTesterController {
        constructor($scope, regexParser, evaluateExpression) {
            this.$scope = $scope;
            let controller = this;
            $scope.evaluationIsDisabled = true;
            $scope.evaluateExpression = () => { controller.evaluateExpression(); };
            regexParser.whenPatternParseSucceeded((re) => { $scope.evaluationIsDisabled = false; });
            regexParser.whenPatternParseFailed((value, reason) => { $scope.isDisabled = true; });
            regexParser.then((re) => { $scope.evaluationIsDisabled = false; });
        }
        evaluateExpression() {
        }
        $doCheck() {
        }
    }
    app.mainModule.controller("regexTester", ["$scope", "regexParser", "evaluateExpression", RegexTesterController]);
    // #endregion
    // #region incrementalId Service
    class incrementalIdService {
        constructor() {
            this._id = 0;
        }
        next() {
            let result = this._id++;
            if (result < 32768)
                return result;
            this._id = 0;
            return this.next();
        }
    }
    app.mainModule.service("incrementalId", [function () { return new incrementalIdService(); }]);
    // #endregion
    // #region regexParser Service
    const whitespaceRe = /[\s\r\n\p{C}]+/g;
    class RegexParserService {
        constructor($q, regexOptions) {
            this.$q = $q;
            this.regexOptions = regexOptions;
            this._flags = "";
            this._inputRegexPattern = "";
            this._parsePending = false;
            this._pauseLevel = 0;
            let service = this;
            regexOptions.whenFlagsChanged((flags) => {
                if (service._flags === flags)
                    return;
                service._flags = flags;
                if (this._pauseLevel > 0)
                    this._parsePending = true;
                else
                    this.startParseCurrentPattern();
            });
            this._flags = regexOptions.flags;
        }
        get isPaused() { return this._pauseLevel > 0; }
        get inputRegexPattern() { return this._inputRegexPattern; }
        set inputRegexPattern(value) {
            let pattern = ((typeof value === "undefined") || value === null) ? "" : ((typeof value === "string") ? value : "" + value);
            if (this._inputRegexPattern === pattern)
                return;
            this._inputRegexPattern = pattern;
            sys.execIfFunction(this._whenInputPatternChanged, this._inputRegexPattern);
            if (this._pauseLevel > 0)
                this._parsePending = true;
            else
                this.startParseCurrentPattern();
        }
        get lastParsedPattern() { return this._parsedPattern; }
        withParsingPaused(callback, thisArg) {
            this._pauseLevel++;
            try {
                return callback();
            }
            finally {
                this._pauseLevel--;
                if (this._pauseLevel == 0 && this._parsePending) {
                    this._parsePending = false;
                    this.startParseCurrentPattern();
                }
            }
        }
        whenInputPatternChanged(callback) { this._whenInputPatternChanged = sys.chainCallback(this._whenInputPatternChanged, callback); }
        whenParsedPatternChanged(callback) { this._whenParsedPatternChanged = sys.chainCallback(this._whenParsedPatternChanged, callback); }
        whenPatternParseSucceeded(callback) { this._whenPatternParseSucceeded = sys.chainCallback(this._whenPatternParseSucceeded, callback); }
        whenPatternParseFailed(callback) { this._whenPatternParseFailed = sys.chainCallback(this._whenPatternParseFailed, callback); }
        startParseCurrentPattern() {
            let result;
            let pattern = this._inputRegexPattern;
            this._result = result = this.$q((resolve, reject) => {
                let result;
                try {
                    result = new RegExp(pattern, this._flags);
                }
                catch (e) {
                    reject(e);
                    return;
                }
                if (sys.isNil(result))
                    reject("Failed ot parse regular expression.");
                else
                    resolve(result);
            }).then((result) => {
                this._parsedPattern = result;
                try {
                    sys.execIfFunction(this._whenPatternParseSucceeded, result);
                }
                finally {
                    sys.execIfFunction(this._whenParsedPatternChanged, result);
                }
                return result;
            }, (reason) => {
                let errorReason = sys.asErrorResult(reason);
                this._parsedPattern = undefined;
                try {
                    sys.execIfFunction(this._whenPatternParseFailed, pattern, reason);
                }
                finally {
                    sys.execIfFunction(this._whenParsedPatternChanged, undefined);
                }
                return errorReason;
            });
            return result;
        }
        then(successCallback, errorCallback) {
            let result = this._result;
            if (sys.isNil(result))
                return this.startParseCurrentPattern();
            return result.then(successCallback, errorCallback);
        }
    }
    app.mainModule.service("regexParser", ["$q", "regexOptions", function ($q, regexOptions) {
            return new RegexParserService($q, regexOptions);
        }]);
    class EvaluationSourceItem {
        constructor(_parentArray) {
            this._parentArray = _parentArray;
            this._canDelete = true;
            this._isEvaluated = false;
            this._success = false;
            this._text = "";
            this._cardNumber = _parentArray.length + 1;
            _parentArray.push(this);
            if (this._cardNumber == 1)
                this._canDelete = false;
            else {
                this._canDelete = true;
                if (this._cardNumber == 2)
                    this._parentArray[0]._canDelete = true;
            }
        }
        get cardNumber() { return this._cardNumber; }
        get canDelete() { return this._canDelete; }
        get isEvaluated() { return this._isEvaluated; }
        get success() { return this._success; }
        get resultsButtonText() { return (this._isEvaluated) ? ((this._success) ? "Matched " + this._groups.length + " groups." : "No match") : "Not Evaluated"; }
        get text() { return this._text; }
        getResultClass() {
            if (this._isEvaluated)
                return [(this._success) ? "btn-success" : "btn-warning"];
            return ["btn-secondary"];
        }
        delete() {
            if (typeof this._parentArray === "undefined" || this._parentArray.length < 2)
                return false;
            if (this._cardNumber == 1)
                this._parentArray.shift();
            else if (this._cardNumber == this._parentArray.length)
                this._parentArray.pop();
            else
                this._parentArray.splice(this._cardNumber - 1, 1);
            for (let i = this._cardNumber - 1; i < this._parentArray.length; i++)
                this._parentArray[i]._cardNumber = i + 1;
            this._parentArray = undefined;
            return true;
        }
        static initialize(items, scope) {
            if (sys.isNil(scope.sourceItems) || !Array.isArray(scope.sourceItems))
                scope.sourceItems = [];
            let e = (items.length < scope.sourceItems.length) ? items.length : scope.sourceItems.length;
            let i;
            for (i = 0; i < e; i++) {
                let source = items[i];
                let target = scope.sourceItems[i];
                if ((typeof target !== "object") || target === null)
                    scope.sourceItems[i] = target = (scope.$new());
                target.canDelete = source._canDelete;
                target.controlId = "evaluationSourceTextBox" + source._cardNumber.toString();
                target.resultsButtonText = source.resultsButtonText;
                target.resultsClick = () => { return source._isEvaluated; };
                target.delete = () => { return source.delete(); };
                target.resultsHref = (source._isEvaluated) ? "#results" + source._cardNumber.toString() : "#";
                target.text = source._text;
            }
            while (scope.sourceItems.length > 3)
                scope.sourceItems.pop();
            while (e < items.length) {
                let source = new EvaluationSourceItem(items);
                let target = (scope.$new());
                scope.sourceItems.push(target);
                target.canDelete = source._canDelete;
                target.controlId = "evaluationSourceTextBox" + source._cardNumber.toString();
                target.resultsButtonText = source.resultsButtonText;
                target.resultsClick = () => { return source._isEvaluated; };
                target.delete = () => { return source.delete(); };
                target.resultsHref = (source._isEvaluated) ? "#results" + source._cardNumber.toString() : "#";
                target.text = source._text;
            }
        }
    }
    class EvaluationSourceService {
        constructor() {
            this._items = [];
        }
        initialize(scope) { EvaluationSourceItem.initialize(this._items, scope); }
    }
    app.mainModule.service("evaluationSource", [function () { return new EvaluationSourceService(); }]);
    class EvaluateExpressionService {
        constructor($q, regexParser, regexOptions) {
            this.$q = $q;
            this.regexParser = regexParser;
            this.regexOptions = regexOptions;
        }
        startEvaluateCurrent() {
            let result;
            this._result = result = this.regexParser.then((re) => {
                return this.$q((resolve) => {
                    return this.regexParser.then((re) => {
                        throw new Error("Resolver not implemented.");
                    });
                }).then((result) => { return result; }, (reason) => {
                    let errorReason = sys.asErrorResult(reason);
                    throw new Error("Reject not implemented.");
                    // this._parsedPattern = undefined;
                    // try { sys.execIfFunction<string, sys.ErrorResult>(this._whenPatternParseFailed, pattern, reason); }
                    // finally { sys.execIfFunction<RegExp | undefined>(this._whenParsedPatternChanged, undefined); }
                    // return errorReason;
                });
            });
            return result;
        }
        then(successCallback, errorCallback) {
            return this._result.then(successCallback, errorCallback);
        }
    }
    app.mainModule.service("evaluateExpression", ["$q", "regexParser", "regexOptions", function ($q, regexParser, regexOptions) {
            return new EvaluateExpressionService($q, regexParser, regexOptions);
        }]);
    // #region RegexOptions Service
    class RegexOptionsService {
        // #endregion
        constructor() {
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
        }
        get flags() { return this._flags; }
        get global() { return this._global; }
        set global(value) {
            if (this._global === ((typeof (value) == "boolean") ? value : (value = value === true)))
                return;
            this._global = value;
            this.updateFlags();
        }
        get ignoreCase() { return this._ignoreCase; }
        set ignoreCase(value) {
            if (this._ignoreCase === ((typeof (value) == "boolean") ? value : (value = value === true)))
                return;
            this._ignoreCase = value;
            this.updateFlags();
        }
        get multiline() { return this._multiline; }
        set multiline(value) {
            if (this._multiline === ((typeof (value) == "boolean") ? value : (value = value === true)))
                return;
            this._multiline = value;
            this.updateFlags();
        }
        get dotMatchesNewline() { return this._dotMatchesNewline; }
        set dotMatchesNewline(value) {
            if (this._dotMatchesNewline === ((typeof (value) == "boolean") ? value : (value = value === true)))
                return;
            this._dotMatchesNewline = value;
            this.updateFlags();
        }
        get unicode() { return this._unicode; }
        set unicode(value) {
            if (this._unicode === ((typeof (value) == "boolean") ? value : (value = value === true)))
                return;
            this._unicode = value;
            this.updateFlags();
        }
        get sticky() { return this._sticky; }
        set sticky(value) {
            if (this._sticky === ((typeof (value) == "boolean") ? value : (value = value === true)))
                return;
            this._sticky = value;
            this.updateFlags();
        }
        static toFlags(source) {
            let flags = (source.global) ? "g" : "";
            if (source.ignoreCase)
                flags += "i";
            if (source.multiline)
                flags += "m";
            if (source.dotMatchesNewline)
                flags += "s";
            if (source.unicode)
                flags += "u";
            return (source.sticky) ? flags + "y" : flags;
        }
        updateFrom(source) {
            let flags = RegexOptionsService.toFlags(source);
            if (flags === this._flags)
                return false;
            this._flags = flags;
            this._dotMatchesNewline = source.dotMatchesNewline;
            this._global = source.global;
            this._ignoreCase = source.ignoreCase;
            this._multiline = source.multiline;
            this._sticky = source.sticky;
            this._unicode = source.unicode;
            this.updateFlags();
            return true;
        }
        updateFlags() {
            let flags;
            this._flags = flags = RegexOptionsService.toFlags(this);
            sys.execIfFunction(this._whenFlagsChanged, flags);
        }
        updateTo(target) {
            target.dotMatchesNewline = this._dotMatchesNewline;
            target.global = this._global;
            target.ignoreCase = this._ignoreCase;
            target.multiline = this._multiline;
            target.sticky = this._sticky;
            target.unicode = this._unicode;
        }
        whenFlagsChanged(callback) {
            this._whenFlagsChanged = sys.chainCallback(this._whenFlagsChanged, callback);
        }
    }
    app.mainModule.service("regexOptions", [function () { return new RegexOptionsService(); }]);
    class InputSourceEditController {
        constructor($scope, evaluationSource, evaluateExpression) {
            this.$scope = $scope;
        }
        $doCheck() {
        }
    }
    app.mainModule.controller("inputSourceEdit", ["$scope", "evaluationSource", "evaluateExpression", InputSourceEditController]);
    // #endregion
    // #region RegexPattern Controller
    const editOptionsDialogId = "EditOptionsDialog";
    class RegexPatternController {
        constructor($scope, $log, regexOptions, regexParser) {
            this.$scope = $scope;
            this.$log = $log;
            this.regexOptions = regexOptions;
            this.regexParser = regexParser;
            $scope.global = regexOptions.global;
            $scope.ignoreCase = regexOptions.ignoreCase;
            $scope.multiline = regexOptions.multiline;
            $scope.dotMatchesNewline = regexOptions.dotMatchesNewline;
            $scope.unicode = regexOptions.unicode;
            $scope.sticky = regexOptions.sticky;
            $scope.flags = regexOptions.flags;
            $scope.ignoreWhitespace = false;
            $scope.regexPattern = $scope.wsRegexPattern = this._pattern = this._wsRegexPattern = regexParser.inputRegexPattern;
            $scope.editOptionsDialogId = editOptionsDialogId;
            $scope.isValid = true;
            $scope.textBoxClass = ["is-valid "];
            $scope.patternValidationMessage = "";
            let controller = this;
            $scope.showEditOptionsDialog = () => { controller.showEditOptionsDialog(); };
            $scope.closeEditOptionsDialog = () => { controller.closeEditOptionsDialog(); };
            regexOptions.whenFlagsChanged((value) => { controller.$scope.flags = value; });
            regexParser.whenPatternParseSucceeded((re) => {
                this.$scope.textBoxClass = ["is-valid "];
                this.$scope.isValid = true;
            });
            regexParser.whenPatternParseFailed((text, reason) => {
                this.$scope.textBoxClass = ["is-invalid"];
                this.$scope.isValid = false;
                $scope.patternValidationMessage = (typeof reason === "string") ? reason : (typeof reason.message === "string" && reason.message.trim().length > 0) ? reason.message : "" + reason;
            });
        }
        showEditOptionsDialog() {
            this.$scope.editOptionsDialogVisible = true;
            $("#" + this.$scope.editOptionsDialogId).modal("show");
        }
        closeEditOptionsDialog() {
            this.$scope.editOptionsDialogVisible = false;
            $("#" + this.$scope.editOptionsDialogId).modal("hide");
        }
        $doCheck() {
            this.regexParser.withParsingPaused(() => {
                let hasChanges = true;
                if (this._wsRegexPattern !== this.$scope.wsRegexPattern)
                    this.regexParser.inputRegexPattern = this.$scope.regexPattern = this._pattern = (this._wsRegexPattern = this.$scope.wsRegexPattern).replace(whitespaceRe, "");
                else if (this._pattern !== this.$scope.regexPattern)
                    this.regexParser.inputRegexPattern = this._pattern = this._wsRegexPattern = this.$scope.wsRegexPattern = this.$scope.regexPattern;
                else
                    hasChanges = false;
                this.regexOptions.updateFrom(this.$scope);
            });
        }
    }
    app.mainModule.controller("regexPattern", ["$scope", "$log", "regexOptions", "regexParser", RegexPatternController]);
    // #endregion
})(regexTester || (regexTester = {}));
//# sourceMappingURL=RegexTester.js.map