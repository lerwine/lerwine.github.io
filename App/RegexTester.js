/// <reference path="../Scripts/typings/jquery/jquery.d.ts"/>
/// <reference path="../Scripts/typings/bootstrap/index.d.ts" />
/// <reference path="../Scripts/typings/angularjs/angular.d.ts"/>
/// <reference path="sys.ts"/>
/// <reference path="app.ts"/>
var regexTester;
(function (regexTester) {
    const DIRECTIVENAME_REGEXTESTER = "regexTester";
    const DIRECTIVENAME_REGEXOPTIONS = "regexOptions";
    const DIRECTIVENAME_REGEXPATTERN = "regexPattern";
    const DIRECTIVENAME_TESTDATAITEM = "testDataItem";
    const DIRECTIVENAME_ERRORMESSAGE = "errorMessage";
    const CONTROL_ID_PATTERNOPTIONSMODAL = "patternOptionsModal";
    const CONTROL_ID_MULTILINEPATTERNTEXTBOX = "multiLinePatternTextBox";
    const CONTROL_ID_SINGLELINEPATTERNTEXTBOX = "singleLinePatternTextBox";
    const CSS_CLASS_ALERT_WARNING = "alert-warning";
    const CSS_CLASS_ALERT_DANGER = "alert-danger";
    const CSS_CLASS_ALERT_SUCCESS = "alert-success";
    const CSS_CLASS_ALERT_SECONDARY = "alert-secondary";
    const CSS_CLASS_SMALL = "small";
    const CSS_CLASS_ROW = "row";
    const CSS_CLASS_NO_GUTTERS = "no-gutters";
    const CSS_CLASS_BORDER_DARK = "border-dark";
    const CSS_CLASS_TEXT_LIGHT = "text-light";
    const CSS_CLASS_BG_PRIMARY = "bg-primary";
    const CSS_CLASS_BORDER_SUCCESS = "border-success";
    const CSS_CLASS_BG_SUCCESS = "bg-success";
    const CSS_CLASS_BORDER_WARNING = "border-warning";
    const CSS_CLASS_BG_WARNING = "bg-warning";
    const CSS_CLASS_TEXT_DARK = "text-dark";
    const CSS_CLASS_BORDER_PRIMARY = "border-primary";
    const CSS_CLASS_NOWRAP = "flex-nowrap";
    const EVAL_RESULT_MSG_NOT_EVALUATED = "Not evaluated";
    const EVAL_RESULT_MSG_MATCH_NOT_FOUND = "Match not found";
    const IMG_SRC_EXPAND_DOWN = "./images/dave-gandy/thin-arrowheads-pointing-down.svg";
    const IMG_SRC_COLLAPSE_UP = "./images/dave-gandy/chevron-up.svg";
    const IMG_SRC_REPLACE = "./images/open-iconic/svg/loop.svg";
    const IMG_SRC_MATCH = "./images/open-iconic/svg/magnifying-glass.svg";
    const IMG_ALT_REPLACE = "Replace";
    const IMG_ALT_MATCH = "Match";
    const TEXTAREA_ROW_COUNT_MAX = 32;
    const TEXTAREA_ROW_COUNT_DEFAULT = 6;
    const WHITESPACE_REGEX = /[\s\r\n\p{C}]+/g;
    const NEWLINE_REGEX = /\r\n?|\n/g;
    const LINE_WITH_ENDING_REGEX = /^([^\r\n]+)?(\r\n?|\n)/g;
    const PATTERN_FLAG_SYMBOLS = { global: "g", ignoreCase: "i", multiLine: "m", unicode: "u", sticky: "y" };
    const PATTERN_FLAG_NAMES = Object.getOwnPropertyNames(PATTERN_FLAG_SYMBOLS);
    function preventDefault(event) {
        if (typeof event === "object" && event !== null) {
            if (!event.isDefaultPrevented())
                event.preventDefault();
            if (!event.isPropagationStopped())
                event.stopPropagation();
        }
        return false;
    }
    function getUniqueClassNames(attr) {
        let classNames;
        let s;
        if (typeof attr.class === "string")
            classNames = ((s = attr.class.trim()).length === 0) ? [] : s.split(WHITESPACE_REGEX);
        else {
            classNames = [];
            if (!sys.isNil(attr.class)) {
                attr.class.forEach((n) => {
                    if (typeof n === "string" && (s = n.trim()).length > 0)
                        classNames = classNames.concat(s.split(WHITESPACE_REGEX));
                });
            }
        }
        if (typeof attr.ngClass === "string") {
            if ((s = attr.ngClass.trim()).length == 0)
                return (classNames.length === 0) ? classNames : sys.unique(classNames);
            return sys.unique((classNames.length === 0) ? s.split(WHITESPACE_REGEX) : classNames.concat(s.split(WHITESPACE_REGEX)));
        }
        if (sys.isNil(attr.ngClass))
            return (classNames.length === 0) ? classNames : sys.unique(classNames);
        attr.ngClass.forEach((n) => {
            if (typeof n === "string" && (s = n.trim()).length > 0)
                classNames = classNames.concat(s.split(WHITESPACE_REGEX));
        });
        return sys.unique(classNames);
    }
    // #region test-data-item directive
    let EvaluationState;
    (function (EvaluationState) {
        EvaluationState[EvaluationState["pending"] = 0] = "pending";
        EvaluationState[EvaluationState["notEvaluated"] = 1] = "notEvaluated";
        EvaluationState[EvaluationState["evaluating"] = 2] = "evaluating";
        EvaluationState[EvaluationState["succeeded"] = 3] = "succeeded";
        EvaluationState[EvaluationState["noMatch"] = 4] = "noMatch";
        EvaluationState[EvaluationState["error"] = 5] = "error";
    })(EvaluationState || (EvaluationState = {}));
    class TestDataItemController {
        constructor($scope, $q, $log) {
            this.$scope = $scope;
            this.$q = $q;
            this.$log = $log;
            this._state = EvaluationState.notEvaluated;
            this._isReplaceMode = false;
            this._isEditMode = false;
            this._inputText = "";
            this._replacementText = "";
            $scope.matchIndex = 0;
            $scope.replacementResult = [];
            $scope.inputLines = [];
            $scope.matchResult = [];
        }
        get isEditMode() { return this._isEditMode; }
        set isEditMode(value) {
            let isChanged = ((value = value === true) !== this._isEditMode);
            this._isEditMode = value;
            if (this.$scope.isEditMode !== value)
                this.$scope.isEditMode = value;
            if (isChanged)
                this.onIsEditModeChanged();
        }
        get inputText() { return this._inputText; }
        set inputText(value) {
            if (typeof value !== "string")
                value = "";
            let isChanged = (value !== this._inputText);
            this._inputText = value;
            if (this.$scope.inputText !== value)
                this.$scope.inputText = value;
            if (isChanged)
                this.onInputTextChanged();
        }
        get replacementText() { return this._replacementText; }
        set replacementText(value) {
            if (typeof value !== "string")
                value = "";
            let isChanged = (value !== this._replacementText);
            this._replacementText = value;
            if (this.$scope.replacementText !== value)
                this.$scope.replacementText = value;
            if (isChanged)
                this.onReplacementTextChanged();
        }
        get isReplaceMode() { return this._isReplaceMode; }
        set isReplaceMode(value) {
            let isChanged = ((value = value === true) !== this._isReplaceMode);
            this._isReplaceMode = value;
            if (this.$scope.isEditMode) {
                if (this.$scope.isReplaceMode !== value)
                    this.$scope.isReplaceMode = value;
                if (this.$scope.isMatchMode !== (value === false))
                    this.$scope.isMatchMode = !value;
            }
            if (isChanged)
                this.onIsReplaceModeChanged();
        }
        get state() { return this._state; }
        set state(value) {
            if (value === this._state) {
                if (this.$scope.state !== this._state)
                    this.$scope.state = this._state;
                return;
            }
            if (value === EvaluationState.pending) {
                this._state = EvaluationState.evaluating;
                if (this.$scope.state !== this._state)
                    this.$scope.state = this._state;
                this.onStateChanged();
                this.startEvaluation();
            }
            else {
                this._state = value;
                if (this.$scope.state !== value)
                    this.$scope.state = value;
                this.onStateChanged();
            }
        }
        editCurrentItem(event) {
            preventDefault(event);
            this._parentController.editItem(this.$scope.itemIndex);
        }
        deleteCurrentItem(event) {
            preventDefault(event);
            this._parentController.deleteItem(this.$scope.itemIndex);
        }
        startEvaluation() {
            let regex = this._parentController.regex;
            if (sys.isNil(regex)) {
                this.state = EvaluationState.notEvaluated;
                if (!sys.isNil(this.$scope.evaluationError))
                    this.$scope.evaluationError = undefined;
                return;
            }
            this.state = EvaluationState.evaluating;
            let inputText = this.$scope.inputText;
            let isReplaceMode = this.isReplaceMode;
            let replacementText = this.$scope.replacementText;
            let controller = this;
            this.$q((resolve, reject) => {
                if (isReplaceMode) {
                    if (inputText !== controller.inputText || isReplaceMode !== controller.isReplaceMode || replacementText !== controller.replacementText || sys.isNil(controller._parentController.regex) || controller._parentController.regex.source !== regex.source || controller._parentController.regex.flags !== regex.flags)
                        resolve(undefined);
                    else {
                        let replaced;
                        try {
                            replaced = inputText.replace(regex, replacementText);
                        }
                        catch (err) {
                            reject(err);
                            return;
                        }
                        if (sys.isNil(replaced))
                            reject("Replacement returned null value");
                        else
                            resolve(replaced);
                    }
                }
                else if (inputText !== controller.inputText || isReplaceMode !== controller.isReplaceMode || sys.isNil(controller._parentController.regex) || controller._parentController.regex.source !== regex.source || controller._parentController.regex.flags !== regex.flags) {
                    resolve(undefined);
                    return;
                }
                else {
                    let result;
                    try {
                        result = regex.exec(inputText);
                    }
                    catch (err) {
                        reject(err);
                        return;
                    }
                    resolve(result);
                }
            }).then((promiseValue) => {
                if (inputText !== controller.inputText || isReplaceMode !== controller.isReplaceMode || (controller.isReplaceMode && replacementText !== controller.replacementText) || sys.isNil(controller._parentController.regex) || controller._parentController.regex.source !== regex.source || controller._parentController.regex.flags !== regex.flags)
                    return;
                controller.$scope.replacementResult = [];
                if (sys.isNil(promiseValue)) {
                    controller.state = EvaluationState.noMatch;
                    controller.$scope.matchIndex = inputText.length;
                    controller.$scope.matchResult = [];
                    controller.$scope.inputLines = [];
                }
                else if (typeof promiseValue === "string") {
                    controller.$scope.matchResult = [];
                    let s = promiseValue;
                    let m = LINE_WITH_ENDING_REGEX.exec(s);
                    let txt;
                    while (!sys.isNil(m)) {
                        let nl = angular.toJson(m[2]);
                        if (sys.isNil(m[1]))
                            controller.$scope.replacementResult.push({ escapedText: "", text: "", length: 0, lineEnding: nl.substr(1, nl.length - 2) });
                        else {
                            txt = angular.toJson(m[1]);
                            controller.$scope.replacementResult.push({ escapedText: txt.substr(1, txt.length - 2), text: m[1], length: m[1].length, lineEnding: nl.substr(1, nl.length - 2) });
                        }
                        if (m[0].length === s.length) {
                            s = "";
                            break;
                        }
                        s = s.substr(m[0].length);
                        m = LINE_WITH_ENDING_REGEX.exec(s);
                    }
                    if (s.length > 0 || controller.$scope.replacementResult.length == 0) {
                        txt = angular.toJson(s);
                        controller.$scope.replacementResult.push({ escapedText: txt.substr(1, txt.length - 2), text: s, length: s.length, lineEnding: "" });
                    }
                    if (promiseValue === inputText) {
                        controller.state = EvaluationState.noMatch;
                        controller.$scope.matchIndex = inputText.length;
                        controller.$scope.inputLines = controller.$scope.replacementResult.map((value) => ({ escapedText: value.escapedText, length: value.length, lineEnding: value.lineEnding, text: value.text }));
                    }
                    else {
                        controller.state = EvaluationState.succeeded;
                        s = inputText;
                        m = LINE_WITH_ENDING_REGEX.exec(s);
                        controller.$scope.inputLines = [];
                        while (!sys.isNil(m)) {
                            let nl = angular.toJson(m[2]);
                            if (sys.isNil(m[1]))
                                controller.$scope.inputLines.push({ escapedText: "", text: "", length: 0, lineEnding: nl.substr(1, nl.length - 2) });
                            else {
                                txt = angular.toJson(m[1]);
                                controller.$scope.inputLines.push({ escapedText: txt.substr(1, txt.length - 2), text: m[1], length: m[1].length, lineEnding: nl.substr(1, nl.length - 2) });
                            }
                            if (m[0].length === s.length) {
                                s = "";
                                break;
                            }
                            s = s.substr(m[0].length);
                            m = LINE_WITH_ENDING_REGEX.exec(s);
                        }
                        if (s.length > 0 || controller.$scope.inputLines.length == 0) {
                            txt = angular.toJson(s);
                            controller.$scope.inputLines.push({ escapedText: txt.substr(1, txt.length - 2), text: s, length: s.length, lineEnding: "" });
                        }
                        let matchIndex = (promiseValue.length < inputText.length) ? promiseValue.length : inputText.length;
                        for (let i = 0; i < matchIndex; i++) {
                            if (promiseValue.substr(i, 1) !== inputText.substr(i, 1)) {
                                matchIndex = i;
                                break;
                            }
                        }
                    }
                }
                else {
                    controller.state = EvaluationState.succeeded;
                    controller.$scope.matchIndex = promiseValue.index;
                    controller.$scope.inputLines = [];
                    controller.$scope.matchResult = promiseValue.map((value) => {
                        if (sys.isNil(value))
                            return { escapedText: "", isMatch: false, length: 0, text: "" };
                        let s = angular.toJson(value);
                        return { escapedText: s.substr(1, s.length - 1), isMatch: true, length: s.length, text: s };
                    });
                }
            }).catch((reason) => {
                if (inputText !== controller.inputText || isReplaceMode !== controller.isReplaceMode || (controller.isReplaceMode && replacementText !== controller.replacementText) || sys.isNil(controller._parentController.regex) || controller._parentController.regex.source !== regex.source || controller._parentController.regex.flags !== regex.flags)
                    return;
                controller.$scope.patternError = (sys.isNil(reason)) ? "An unspecifed error has occurred." : reason;
                controller.state = EvaluationState.error;
            });
        }
        onStateChanged() {
        }
        onIsEditModeChanged() {
            if (this.isEditMode) {
                this._parentController.isEditingPattern = false;
                if (this.$scope.isReplaceMode !== this._isReplaceMode)
                    this.$scope.isReplaceMode = this._isReplaceMode;
                if (this.$scope.isMatchMode !== (this._isReplaceMode === false))
                    this.$scope.isMatchMode = !this._isReplaceMode;
            }
            else {
                if (this.$scope.isReplaceMode !== false)
                    this.$scope.isReplaceMode = false;
                if (this.$scope.isMatchMode !== false)
                    this.$scope.isMatchMode = false;
            }
        }
        onIsReplaceModeChanged() {
            this.$scope.replacementResult = [];
            this.$scope.matchResult = [];
            this.startEvaluation();
        }
        onInputTextChanged() {
            this.startEvaluation();
        }
        onReplacementTextChanged() {
            this.startEvaluation();
        }
        $doCheck() { }
        static registerDirective(module) {
            module.directive(DIRECTIVENAME_TESTDATAITEM, () => ({
                controller: ["$scope", "$q", "$log", TestDataItemController],
                controllerAs: DIRECTIVENAME_TESTDATAITEM,
                link: (scope, element, attr, controller) => {
                    scope.testDataItem._parentController = controller;
                    scope.testDataItem.inputText = scope.inputText;
                    scope.testDataItem.replacementText = scope.replacementText;
                    scope.testDataItem.isReplaceMode = scope.isReplaceMode;
                    scope.testDataItem.isEditMode = scope.isEditMode;
                    scope.isMatchMode = !scope.testDataItem.isReplaceMode;
                    scope.$watch("isEditMode", () => scope.testDataItem.onIsEditModeChanged());
                    scope.$watch("state", () => scope.testDataItem.state = scope.state);
                    scope.$watch("isReplaceMode", () => {
                        if (scope.isEditMode === true)
                            scope.testDataItem.isReplaceMode = scope.isReplaceMode;
                    });
                    scope.$watch("isMatchMode", () => {
                        if (scope.isReplaceMode !== (scope.isMatchMode === false))
                            scope.isMatchMode = (scope.isMatchMode === false);
                    });
                    scope.$watch("inputText", () => scope.testDataItem.onInputTextChanged());
                    scope.$watch("replacementText", () => scope.testDataItem.onReplacementTextChanged());
                    scope.testDataItem.state = (scope.state === EvaluationState.notEvaluated) ? EvaluationState.notEvaluated : EvaluationState.pending;
                },
                require: "^^" + DIRECTIVENAME_REGEXTESTER,
                restrict: "E",
                scope: {
                    index: "=itemIndex",
                    state: "=",
                    isEditMode: "=",
                    isReplaceMode: "=",
                    inputText: "=",
                    replacementText: "=",
                    canDelete: "="
                },
                template: '<div ng-class="classNames" ng-transclude></div>',
                transclude: true
            }));
        }
    }
    TestDataItemController.registerDirective(app.mainModule);
    class ErrorMessageController {
        constructor($scope, $log) {
            this.$scope = $scope;
            this.$log = $log;
            let errorMessage = this;
            $scope.$watch("error", () => errorMessage.onErrorChanged());
        }
        onErrorChanged() {
            if (sys.isNil(this.$scope.error)) {
                this.$scope.isVisible = this.$scope.hasDetails = this.$scope.hasName = false;
                this.$scope.message = this.$scope.name = this.$scope.details = "";
            }
            else {
                if (typeof this.$scope.error === "string") {
                    this.$scope.hasDetails = this.$scope.hasName = false;
                    this.$scope.name = this.$scope.details = "";
                    this.$scope.message = this.$scope.error;
                }
                else {
                    let value;
                    value = this.$scope.error.name;
                    this.$scope.name = (typeof value === "string") ? value.trim() : "";
                    this.$scope.hasName = this.$scope.name.length > 0;
                    value = this.$scope.error.message;
                    if (typeof value === "string" && (value = value.trim()).length > 0)
                        this.$scope.message = value;
                    else if (this.$scope.name.length > 0) {
                        this.$scope.message = this.$scope.name;
                        this.$scope.hasName = false;
                        this.$scope.name = "";
                    }
                    else {
                        this.$scope.message = angular.toJson(this.$scope.error);
                        this.$scope.name = this.$scope.details = "";
                        this.$scope.hasName = this.$scope.hasDetails = false;
                        return;
                    }
                    value = this.$scope.error.data;
                    this.$scope.details = (sys.isNil(value)) ? "" : ((typeof value === "string") ? value.trim() : angular.toJson(value));
                    this.$scope.hasDetails = this.$scope.details.length > 0;
                }
                this.$scope.isVisible = true;
            }
        }
        $doCheck() { }
        static registerDirective(module) {
            module.directive(DIRECTIVENAME_ERRORMESSAGE, () => ({
                controller: ["$scope", "$log", ErrorMessageController],
                controllerAs: DIRECTIVENAME_ERRORMESSAGE,
                link: (scope, element, attr) => { scope.errorMessage.onErrorChanged(); },
                restrict: "E",
                scope: { error: "=" },
                template: '<div ng-show="isVisible"><strong ng-show="hasName">{{name}}: </strong>{{message}}<div class="small pre-scrollable" ng-show="hasDetails">{{details}}</div></div>'
            }));
        }
    }
    ErrorMessageController.registerDirective(app.mainModule);
    class RegexPatternController {
        constructor($scope, $q, $log) {
            this.$scope = $scope;
            this.$q = $q;
            this.$log = $log;
            this._isEditMode = false;
            this._isMultiLineMode = false;
            this._ignoreWhitespace = false;
            this._flags = "";
            this._patternText = "";
            this._singleLinePatternText = "";
            this._multiLinePatternText = "";
            this._isOptionsDialogVisible = false;
            $scope.regexPattern = this;
            $scope.isOptionsDialogVisible = false;
            $scope.flags = $scope.singleLinePatternText = $scope.multiLinePatternText = $scope.patternText = $scope.patternDisplayText = "";
            $scope.multiLineRowCount = TEXTAREA_ROW_COUNT_DEFAULT;
            $scope.isMultiLineMode = $scope.ignoreWhitespace = this._isMultiLineMode;
            $scope.isSingleLineMode = !this._isMultiLineMode;
            $scope.singleLinePatternTextBoxId = CONTROL_ID_SINGLELINEPATTERNTEXTBOX;
            $scope.multiLinePatternTextBoxId = CONTROL_ID_MULTILINEPATTERNTEXTBOX;
            this.onIsMultiLineModeChanged();
            this.onIgnoreWhitespaceChanged();
            let controller = this;
            $scope.$watch("ignoreWhitespace", () => { controller.ignoreWhitespace = controller.$scope.ignoreWhitespace; });
            $scope.$watch("flags", () => { controller.flags = controller.$scope.flags; });
            $scope.$watch("isMultiLineMode", () => { controller.isMultiLineMode = controller.$scope.isMultiLineMode; });
            $scope.$watch("isSingleLineMode", () => { controller.isMultiLineMode = controller.$scope.isSingleLineMode !== true; });
            $scope.$watch("isEditMode", () => { controller.isEditMode = controller.$scope.isEditMode; });
            $scope.$watch("singleLinePatternText", () => { controller.singleLinePatternText = controller.$scope.singleLinePatternText; });
            $scope.$watch("multiLinePatternText", () => { controller.multiLinePatternText = controller.$scope.multiLinePatternText; });
            this.startParseRegex(this.$scope.patternText, this.$scope.flags);
        }
        get isEditMode() { return this._isEditMode; }
        set isEditMode(value) {
            let notChanged = ((value = value === true) === this._isEditMode);
            this._isEditMode = value;
            if (this.$scope.isEditMode !== value)
                this.$scope.isEditMode = value;
            if (notChanged)
                return;
            if (value) {
                if (this.$scope.isMultiLineMode !== this._isMultiLineMode)
                    this.$scope.isMultiLineMode = this._isMultiLineMode;
                if (this.$scope.isSingleLineMode !== (this._isMultiLineMode === false))
                    this.$scope.isSingleLineMode = !this._isMultiLineMode;
            }
            else {
                if (this.$scope.isOptionsDialogVisible !== false)
                    this.$scope.isOptionsDialogVisible = false;
                if (this.$scope.isSingleLineMode !== false)
                    this.$scope.isSingleLineMode = false;
                if (this.$scope.isMultiLineMode !== false)
                    this.$scope.isMultiLineMode = false;
            }
        }
        get isMultiLineMode() { return (this.$scope.isEditMode) ? this.$scope.isMultiLineMode : this._isMultiLineMode; }
        set isMultiLineMode(value) {
            let isChanged = ((value = value === true) !== this._isMultiLineMode);
            this._isMultiLineMode = value;
            if (this.$scope.isEditMode) {
                if (this.$scope.isMultiLineMode !== value)
                    this.$scope.isMultiLineMode = value;
                if (this.$scope.isSingleLineMode !== (value === false))
                    this.$scope.isSingleLineMode = !value;
            }
            if (isChanged)
                this.onIsMultiLineModeChanged();
        }
        get ignoreWhitespace() { return this._ignoreWhitespace; }
        set ignoreWhitespace(value) {
            let isChanged = ((value = value === true) !== this._ignoreWhitespace);
            this._ignoreWhitespace = value;
            if (this.$scope.ignoreWhitespace !== value)
                this.$scope.ignoreWhitespace = value;
            if (isChanged)
                this.onIgnoreWhitespaceChanged();
        }
        get flags() { return this._flags; }
        set flags(value) {
            if (typeof value !== "string")
                value = "";
            let isChanged = (value !== this._flags);
            this._flags = value;
            if (this.$scope.flags !== value)
                this.$scope.flags = value;
            if (isChanged)
                this.startParseRegex(this.patternText, this.flags);
        }
        get patternText() { return this._patternText; }
        set patternText(value) {
            if (typeof value !== "string")
                value = "";
            let isChanged = (value !== this._patternText);
            this._patternText = value;
            if (this.$scope.patternText !== value)
                this.$scope.patternText = value;
            if (isChanged)
                this.startParseRegex(this.patternText, this.flags);
        }
        get singleLinePatternText() { return this._singleLinePatternText; }
        set singleLinePatternText(value) {
            if (typeof value !== "string")
                value = "";
            let isChanged = (value !== this._singleLinePatternText);
            this._singleLinePatternText = value;
            if (this.$scope.singleLinePatternText !== value)
                this.$scope.singleLinePatternText = value;
            if (isChanged && !this.isMultiLineMode)
                this.patternText = (this.ignoreWhitespace) ? value.replace(WHITESPACE_REGEX, "") : value;
        }
        get multiLinePatternText() { return this._multiLinePatternText; }
        set multiLinePatternText(value) {
            if (typeof value !== "string")
                value = "";
            let isChanged = (value !== this._multiLinePatternText);
            this._multiLinePatternText = value;
            if (this.$scope.multiLinePatternText !== value)
                this.$scope.multiLinePatternText = value;
            if (isChanged && this.isMultiLineMode)
                this.patternText = value.replace(WHITESPACE_REGEX, "");
        }
        startParseRegex(pattern, flags) {
            let controller = this;
            this.$q((resolve, reject) => {
                if (controller.patternText !== pattern || controller.flags !== flags) {
                    resolve(undefined);
                    return;
                }
                let regexp;
                try {
                    regexp = new RegExp(pattern, flags);
                }
                catch (err) {
                    reject(err);
                    return;
                }
                if (sys.isNil(regexp))
                    reject("Could not parse pattern");
                else
                    resolve(regexp);
            }).then((promiseValue) => {
                if (sys.isNil(promiseValue) || controller.patternText !== pattern || controller.flags !== flags)
                    return;
                if (!sys.isNil(controller.$scope.patternError))
                    controller.$scope.patternError = undefined;
                let patternDisplayText = promiseValue.toString();
                if (patternDisplayText !== controller.$scope.patternDisplayText) {
                    controller.$scope.patternDisplayText = patternDisplayText;
                    controller.$scope.regex = promiseValue;
                }
            }).catch((reason) => {
                if (controller.patternText !== pattern || controller.flags !== flags)
                    return;
                if (controller.$scope.regex !== null)
                    controller.$scope.regex = null;
                controller.$scope.patternError = (sys.isNil(reason)) ? "An unspecifed error has occurred." : reason;
                let index = pattern.indexOf("\\");
                let patternDisplayText;
                if (index < 0)
                    patternDisplayText = pattern.replace("/", "\\");
                else {
                    do {
                        if (index > 0)
                            patternDisplayText += pattern.substr(0, index).replace("/", "\\/");
                        if (index === pattern.length - 1) {
                            patternDisplayText += pattern + "\\";
                            pattern = "";
                            break;
                        }
                        patternDisplayText += pattern.substr(index, 2);
                        pattern = pattern.substr(index + 2);
                        index = pattern.indexOf("\\");
                    } while (index > -1);
                    if (pattern.length > 0)
                        patternDisplayText += pattern.replace("/", "\\/");
                }
                pattern = "/" + pattern + "/" + flags;
                if (patternDisplayText !== controller.$scope.patternDisplayText)
                    controller.$scope.patternDisplayText = patternDisplayText;
            });
        }
        openOptionsDialog(event) {
            preventDefault(event);
            if (this.$scope.isOptionsDialogVisible !== true && this.$scope.isEditMode === true)
                this.$scope.isOptionsDialogVisible = true;
        }
        editPattern(event) {
            preventDefault(event);
            this.isEditMode = true;
        }
        addPatternRow(event) {
            preventDefault(event);
            if (this.$scope.multiLineRowCount < TEXTAREA_ROW_COUNT_MAX && ++this.$scope.multiLineRowCount === 2)
                this.isMultiLineMode = true;
        }
        removePatternRow(event) {
            preventDefault(event);
            if (this.$scope.multiLineRowCount > 1 && --this.$scope.multiLineRowCount == 1)
                this.isMultiLineMode = false;
        }
        onIgnoreWhitespaceChanged() {
            if (this.ignoreWhitespace)
                return;
            if (this.isMultiLineMode)
                this.isMultiLineMode = false;
            else
                this.singleLinePatternText = this.singleLinePatternText.replace(WHITESPACE_REGEX, "");
        }
        onIsMultiLineModeChanged() {
            if (this.isMultiLineMode) {
                if (this.$scope.multiLineRowCount === 1)
                    this.$scope.multiLineRowCount = TEXTAREA_ROW_COUNT_DEFAULT;
                this.ignoreWhitespace = true;
                this.$scope.patternTextBoxLabelId = CONTROL_ID_MULTILINEPATTERNTEXTBOX;
                this.multiLinePatternText = this.singleLinePatternText;
                this.$scope.canRemovePatternRow = true;
                this.$scope.canAddPatternRow = this.$scope.multiLineRowCount < TEXTAREA_ROW_COUNT_MAX;
            }
            else {
                this.$scope.canRemovePatternRow = false;
                this.$scope.canAddPatternRow = true;
                this.$scope.patternTextBoxLabelId = CONTROL_ID_SINGLELINEPATTERNTEXTBOX;
                this.singleLinePatternText = this.multiLinePatternText.replace((this.ignoreWhitespace) ? WHITESPACE_REGEX : NEWLINE_REGEX, "");
            }
        }
        $doCheck() { }
        static registerDirective(module) {
            module.directive(DIRECTIVENAME_REGEXTESTER, () => ({
                controller: ["$scope", "$q", "$log", RegexPatternController],
                controllerAs: DIRECTIVENAME_REGEXPATTERN,
                // link: (scope: IRegexPatternScope, element: JQuery, attr: ng.IAttributes) => { },
                restrict: "E",
                scope: {
                    regex: "=",
                    isEditMode: "="
                },
                template: '<ng-transclude></ng-transclude>',
                transclude: true
            }));
        }
    }
    RegexPatternController.registerDirective(app.mainModule);
    class RegexOptionsController {
        constructor($scope, $log) {
            this.$scope = $scope;
            this.$log = $log;
            this._ignoreFlagChange = false;
            this._isDialogVisible = false;
            let regexOptions = this;
            $scope.$watch("isDialogVisible", (newValue) => { regexOptions.setDialogVisibility(newValue); });
            $scope.$watch("flags", (newValue) => { regexOptions.onFlagsChanged(newValue); });
            $scope.$watchGroup(PATTERN_FLAG_NAMES, () => {
                if (!regexOptions._ignoreFlagChange)
                    regexOptions.updateFlags();
            });
            this.onFlagsChanged($scope.flags);
            this.setDialogVisibility($scope.isDialogVisible);
        }
        $doCheck() { }
        onFlagsChanged(flags) {
            if (this._ignoreFlagChange)
                return;
            this._ignoreFlagChange = true;
            try {
                if (typeof flags !== "string" || (flags = flags.trim()).length === 0)
                    PATTERN_FLAG_NAMES.forEach((n) => { this.$scope[n] = false; });
                else
                    PATTERN_FLAG_NAMES.forEach((n) => { this.$scope[n] = flags.indexOf(PATTERN_FLAG_SYMBOLS[n]) > -1; });
                this.updateFlags();
            }
            finally {
                this._ignoreFlagChange = false;
            }
        }
        updateFlags() {
            let flags = PATTERN_FLAG_NAMES.map((n) => (this.$scope[n]) ? PATTERN_FLAG_SYMBOLS[n] : "").join("");
            if (this.$scope.flags !== flags)
                this.$scope.flags = flags;
        }
        setDialogVisibility(isVisible, event) {
            preventDefault(event);
            if ((isVisible = isVisible === true) === this._isDialogVisible)
                return;
            this._isDialogVisible = isVisible;
            if (this.$scope.isDialogVisible !== isVisible)
                this.$scope.isDialogVisible = isVisible;
            $(CONTROL_ID_PATTERNOPTIONSMODAL).modal({ show: isVisible });
        }
        static registerDirective(module) {
            module.directive(DIRECTIVENAME_REGEXOPTIONS, () => ({
                controller: ["$scope", "$log", RegexOptionsController],
                controllerAs: DIRECTIVENAME_REGEXOPTIONS,
                restrict: "E",
                scope: {
                    isDialogVisible: "=",
                    ignoreWhitespace: "=",
                    flags: "="
                },
                template: '<div class="modal fade" id="' + CONTROL_ID_PATTERNOPTIONSMODAL + '" tabindex="-1" role="dialog" aria-labelledby="patternOptionsLabel" aria-hidden="true"><div class="modal-dialog" role="document"><div class="modal-content"><div class="modal-header"><h5 class="modal-title" id="patternOptionsLabel">Pattern Options</h5><button type="button" class="close" aria-label="Close" ng-click="regexOptions.setDialogVisibility(false, $event)"><span aria-hidden="true">&times;</span></button></div><div class="modal-body" ng-transclude></div><div class="modal-footer"><button type="button" class="btn btn-secondary" ng-click="regexOptions.setDialogVisibility(false, $event)">Close</button></div></div></div></div>',
                transclude: true
            }));
        }
    }
    RegexOptionsController.registerDirective(app.mainModule);
    class RegexTesterController {
        constructor($scope, $log) {
            this.$scope = $scope;
            this.$log = $log;
            this._isEditingPattern = true;
            $scope.isEditingPattern = true;
            this.addItem();
            let controller = this;
            $scope.$watch("isEditingPattern", () => { controller.isEditingPattern = $scope.isEditingPattern; });
        }
        get regex() { return this.$scope.regex; }
        get isEditingPattern() { return this._isEditingPattern; }
        set isEditingPattern(value) {
            let isChanged = ((value = value === true) !== this._isEditingPattern);
            this._isEditingPattern = value;
            if (value !== this.$scope.isEditingPattern)
                this.$scope.isEditingPattern = value;
            if (isChanged && value)
                this.$scope.testData = this.$scope.testData.map((value) => ({ inputText: value.inputText, isEditMode: false, isReplaceMode: value.isReplaceMode, replacementText: value.replacementText, state: value.state, canDelete: value.canDelete }));
        }
        deleteItem(index) {
            if (index < 0 || index >= this.$scope.testData.length || this.$scope.testData.length < 2)
                return;
            let isEditMode = this.$scope.testData[index].isEditMode;
            this.$scope.testData = this.$scope.testData.filter((value, i) => i !== index);
            if (this.$scope.testData.length == 1)
                this.$scope.testData[0].canDelete = false;
            if (isEditMode)
                this.editItem((index < this.$scope.testData.length) ? index : index - 1);
        }
        editItem(index) {
            if (index > -1 && index < this.$scope.testData.length)
                this.$scope.testData = this.$scope.testData.map((value, i) => ({ inputText: value.inputText, isEditMode: i === index, isReplaceMode: value.isReplaceMode, replacementText: value.replacementText, state: value.state, canDelete: value.canDelete }));
        }
        addItem(event) {
            preventDefault(event);
            if (sys.isNil(this.$scope.testData) || this.$scope.testData.length == 0)
                this.$scope.testData = [{ inputText: "", isEditMode: false, isReplaceMode: false, replacementText: "", state: (sys.isNil(this.$scope.regex)) ? EvaluationState.notEvaluated : EvaluationState.pending, canDelete: false }];
            else {
                this.$scope.testData = this.$scope.testData.concat([{ inputText: "", isEditMode: false, isReplaceMode: false, replacementText: "", state: (sys.isNil(this.$scope.regex)) ? EvaluationState.notEvaluated : EvaluationState.pending, canDelete: true }]);
                if (this.$scope.testData.length == 2)
                    this.$scope.testData[0].canDelete = true;
                this.editItem(this.$scope.testData.length - 1);
            }
        }
        $doCheck() { }
    }
    app.mainModule.controller("regexTester", ["$scope", "$log", RegexTesterController]);
    // #endregion
})(regexTester || (regexTester = {}));
//# sourceMappingURL=RegexTester.js.map