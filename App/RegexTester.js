/// <reference path="Scripts/typings/jquery/jquery.d.ts"/>
/// <reference path="Scripts/typings/bootstrap/index.d.ts" />
/// <reference path="Scripts/typings/angularjs/angular.d.ts"/>
/// <reference path="sys.ts"/>
/// <reference path="app.ts"/>
var regexTester;
(function (regexTester_1) {
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
    const CSS_CLASSES_ITEM_NOT_EVALUATED = [CSS_CLASS_ALERT_SECONDARY, CSS_CLASS_SMALL];
    const CSS_CLASSES_ITEM_EVALUATION_ERROR = [CSS_CLASS_ALERT_DANGER];
    const CSS_CLASSES_ITEM_EVALUATION_WARNING = [CSS_CLASS_ALERT_WARNING];
    const CSS_CLASSES_ITEM_EVALUATION_SUCCESS = [CSS_CLASS_ALERT_SUCCESS];
    const CSS_CLASSES_ITEM_GROUP_SUCCESS = [CSS_CLASS_ROW, CSS_CLASS_NO_GUTTERS, CSS_CLASS_ALERT_SUCCESS, CSS_CLASS_NOWRAP];
    const CSS_CLASSES_ITEM_GROUP_NO_MATCH = [CSS_CLASS_ROW, CSS_CLASS_NO_GUTTERS, CSS_CLASS_ALERT_SECONDARY, CSS_CLASS_NOWRAP];
    const CSS_CLASSES_ITEM_REPLACELINE_SELECTED = [CSS_CLASS_BG_PRIMARY, CSS_CLASS_TEXT_LIGHT, CSS_CLASS_BORDER_PRIMARY, CSS_CLASS_ROW, CSS_CLASS_NO_GUTTERS, CSS_CLASS_NOWRAP];
    const CSS_CLASSES_ITEM_REPLACELINE_NOTSELECTED = [CSS_CLASS_TEXT_DARK, CSS_CLASS_BORDER_DARK, CSS_CLASS_ROW, CSS_CLASS_NO_GUTTERS, CSS_CLASS_NOWRAP];
    const CSS_CLASSES_ITEM_METRIC_SUCCESS = [CSS_CLASS_BORDER_SUCCESS, CSS_CLASS_BG_SUCCESS, CSS_CLASS_TEXT_LIGHT, CSS_CLASS_ROW, CSS_CLASS_NO_GUTTERS, CSS_CLASS_NOWRAP];
    const CSS_CLASSES_ITEM_METRIC_EQUAL = [CSS_CLASS_BORDER_DARK, CSS_CLASS_TEXT_DARK, CSS_CLASS_ROW, CSS_CLASS_NO_GUTTERS, CSS_CLASS_NOWRAP];
    const CSS_CLASSES_ITEM_METRIC_WARNING = [CSS_CLASS_BORDER_WARNING, CSS_CLASS_BG_WARNING, CSS_CLASS_TEXT_DARK, CSS_CLASS_ROW, CSS_CLASS_NO_GUTTERS, CSS_CLASS_NOWRAP];
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
    class EvaluationItem {
        constructor($scope, _regexTester) {
            this.$scope = $scope;
            this._regexTester = _regexTester;
            this._isEditingPattern = false;
            this._isEditingInput = true;
            $scope.item = this;
            this.$scope.isReplace = false;
            $scope.isEditingInput = this.isEditingInput;
            $scope.inputText = "";
            $scope.matchSuccess = false;
            $scope.matchResults = [];
            $scope.messageText = EVAL_RESULT_MSG_NOT_EVALUATED;
            $scope.messageClass = [CSS_CLASS_ALERT_SECONDARY, CSS_CLASS_SMALL];
            $scope.inputClass = [];
            $scope.originalLineInfo = [];
            $scope.replacedLineInfo = [];
            $scope.changedClass = [];
            $scope.lengthClass = [];
            $scope.lineCountClass = [];
            $scope.originalLength = $scope.replacedLength = $scope.originalLineCount = $scope.replacedLineCount = 0;
            $scope.compareClass = [];
            $scope.changeMessage = $scope.originalLine = $scope.replacementText = $scope.comparedLine = "";
            $scope.matchIndex = NaN;
            $scope.isEditingPattern = _regexTester.isEditingPattern;
            $scope.toggleImgSrc = IMG_SRC_REPLACE;
            $scope.toggleImgAlt = IMG_ALT_REPLACE;
            let current = this;
            $scope.$watchGroup(["inputText", "replacementText"], () => { current.evaluate(); });
        }
        get isEditingPattern() { return this._isEditingPattern; }
        set isEditingPattern(value) {
            if (this._isEditingPattern === (value = value === true))
                return;
            this._isEditingPattern = value;
            this.updateView();
        }
        get isEditingInput() { return this._isEditingInput; }
        set isEditingInput(value) {
            if (this._isEditingInput === (value = value === true))
                return;
            this._isEditingInput = value;
            this.updateView();
        }
        toggleSearchReplace(event) {
            this.$scope.isReplace = this.$scope.isReplace !== true;
            if (this.$scope.isReplace) {
                this.$scope.toggleImgSrc = IMG_SRC_MATCH;
                this.$scope.toggleImgAlt = IMG_ALT_MATCH;
            }
            else {
                this.$scope.toggleImgSrc = IMG_SRC_REPLACE;
                this.$scope.toggleImgAlt = IMG_ALT_REPLACE;
                this.$scope.matchSuccess = false;
            }
            this.evaluate();
            if (!sys.isNil(event)) {
                event.preventDefault();
                event.stopPropagation();
            }
        }
        updateView() {
            if (this.isEditingInput && !this.isEditingPattern) {
                this.$scope.isEditingInput = true;
                this.$scope.canRemoveRow = this.$scope.rowCount > 1;
                this.$scope.canAddRow = this.$scope.rowCount < TEXTAREA_ROW_COUNT_MAX;
            }
            else
                this.$scope.isEditingInput = this.$scope.canAddRow = this.$scope.canRemoveRow = false;
        }
        addRow(event) {
            if (this.$scope.rowCount >= TEXTAREA_ROW_COUNT_MAX)
                return;
            this.$scope.rowCount++;
            this.$scope.isMultiLine = true;
            this.updateView();
            if (!sys.isNil(event)) {
                event.preventDefault();
                event.stopPropagation();
            }
        }
        removeRow(event) {
            if (this.$scope.rowCount < 2)
                return;
            this.$scope.rowCount--;
            this.$scope.isMultiLine = this.$scope.rowCount > 1;
            this.updateView();
            if (!sys.isNil(event)) {
                event.preventDefault();
                event.stopPropagation();
            }
        }
        editCurrent(event) {
            this._regexTester.editItem(this._index);
            if (!sys.isNil(event)) {
                event.preventDefault();
                event.stopPropagation();
            }
        }
        deleteCurrent(event) {
            if (this.$scope.canDelete === true)
                this._regexTester.deleteItem(this._index);
            if (!sys.isNil(event)) {
                event.preventDefault();
                event.stopPropagation();
            }
        }
        static addItem(item, array) {
            item._index = array.length;
            array.push(item.$scope);
            if (array.length == 2)
                array[0].canDelete = true;
            else if (array.length < 2) {
                item.$scope.isMultiLine = false;
                item.$scope.rowCount = 1;
                item.$scope.canDelete = false;
                item.$scope.canAddRow = true;
                item.$scope.canRemoveRow = false;
                return;
            }
            let previousScope = array[array.length - 2];
            item.$scope.isMultiLine = previousScope.isMultiLine;
            item.$scope.rowCount = previousScope.rowCount;
            item.$scope.canAddRow = previousScope.canAddRow;
            item.$scope.canRemoveRow = previousScope.canRemoveRow;
            item.$scope.canDelete = true;
            item.updateView();
            item.evaluate();
            item.editCurrent();
        }
        static editItem(array, index) {
            if (isNaN(index) || index < 0 || index > array.length)
                return;
            let $scope = array[index];
            if ($scope.isEditingInput)
                return;
            array.forEach((s, i) => {
                if (index != i)
                    s.item.isEditingInput = false;
            });
            $scope.item.isEditingInput = true;
            $scope.item._regexTester.isEditingPattern = false;
            $scope.item.updateView();
        }
        static deleteItem(array, index) {
            if (array.length < 2 || isNaN(index) || index < 0 || index > array.length)
                return;
            let $scope;
            if (index == 0)
                $scope = array.shift();
            else if (index < array.length - 1)
                $scope = array.splice(index, 1)[0];
            else
                $scope = array.pop();
            for (let i = index; i < array.length; i++)
                array[i].item._index = i;
            $scope.$destroy();
            if (array.length == 1)
                array[0].canDelete = false;
        }
        selectOriginalLine(index) {
            if (typeof index !== "number" || isNaN(index) || index < 0 || index >= this.$scope.originalLineInfo.length)
                return;
            this.$scope.originalLine = this.$scope.originalLineInfo[index].text;
            if (this.$scope.originalLine === this.$scope.comparedLine)
                this.$scope.compareClass = CSS_CLASSES_ITEM_METRIC_EQUAL;
            else
                this.$scope.compareClass = CSS_CLASSES_ITEM_METRIC_SUCCESS;
            this.$scope.originalLineInfo.forEach((value, i) => {
                if (i === index) {
                    value.cssClass = CSS_CLASSES_ITEM_REPLACELINE_SELECTED;
                    value.isSelected = true;
                }
                else {
                    value.cssClass = CSS_CLASSES_ITEM_REPLACELINE_NOTSELECTED;
                    value.isSelected = false;
                }
            });
        }
        selectResultLine(index) {
            if (typeof index !== "number" || isNaN(index) || index < 0 || index >= this.$scope.originalLineInfo.length)
                return;
            this.$scope.comparedLine = this.$scope.replacedLineInfo[index].text;
            if (this.$scope.originalLine === this.$scope.comparedLine)
                this.$scope.compareClass = CSS_CLASSES_ITEM_METRIC_EQUAL;
            else
                this.$scope.compareClass = CSS_CLASSES_ITEM_METRIC_SUCCESS;
            this.$scope.replacedLineInfo.forEach((value, i) => {
                if (i === index) {
                    value.cssClass = CSS_CLASSES_ITEM_REPLACELINE_SELECTED;
                    value.isSelected = true;
                }
                else {
                    value.cssClass = CSS_CLASSES_ITEM_REPLACELINE_NOTSELECTED;
                    value.isSelected = false;
                }
            });
        }
        evaluate(event) {
            if (!sys.isNil(event)) {
                event.preventDefault();
                event.stopPropagation();
            }
            let re = this._regexTester.expression;
            if (sys.isNil(re)) {
                this.$scope.matchSuccess = false;
                this.$scope.messageText = EVAL_RESULT_MSG_NOT_EVALUATED;
                this.$scope.messageClass = CSS_CLASSES_ITEM_NOT_EVALUATED;
                this.$scope.matchResults = [];
                this.$scope.originalLineInfo = [];
                this.$scope.replacedLineInfo = [];
                this.$scope.changedClass = [];
                this.$scope.lengthClass = [];
                this.$scope.lineCountClass = [];
                this.$scope.originalLength = this.$scope.replacedLength = this.$scope.originalLineCount = this.$scope.replacedLineCount = 0;
                this.$scope.compareClass = [];
                this.$scope.originalLine = this.$scope.changeMessage = this.$scope.comparedLine = "";
                return;
            }
            if (this.$scope.isReplace) {
                let originalText = this.$scope.inputText;
                let replacementText = this.$scope.replacementText;
                this._regexTester.$q((resolve, reject) => {
                    if (sys.isNil(this._regexTester.expression) || re.source !== this._regexTester.expression.source || re.flags !== this._regexTester.expression.flags || originalText !== this.$scope.inputText || replacementText !== this.$scope.replacementText)
                        resolve(undefined);
                    else {
                        this._regexTester.$log.debug("Testing " + this._regexTester.expression.toString() + " against " + angular.toJson(originalText));
                        try {
                            let s = originalText.replace(re, replacementText);
                            resolve(s);
                        }
                        catch (e) {
                            reject(e);
                        }
                    }
                }).then((result) => {
                    if (sys.isNil(result) || sys.isNil(this._regexTester.expression) || re.source !== this._regexTester.expression.source || re.flags !== this._regexTester.expression.flags || originalText !== this.$scope.inputText || replacementText !== this.$scope.replacementText)
                        return;
                    if (originalText === result) {
                        this.$scope.changedClass = CSS_CLASSES_ITEM_METRIC_WARNING;
                        this.$scope.changeMessage = "No";
                        this.$scope.lengthClass = CSS_CLASSES_ITEM_METRIC_EQUAL;
                        this.$scope.lineCountClass = CSS_CLASSES_ITEM_METRIC_EQUAL;
                        this.$scope.originalLength = this.$scope.replacedLength = originalText.length;
                    }
                    else {
                        this.$scope.changedClass = CSS_CLASSES_ITEM_METRIC_SUCCESS;
                        this.$scope.changeMessage = "Yes";
                        if ((this.$scope.originalLength = originalText.length) === (this.$scope.replacedLength = result.length))
                            this.$scope.lengthClass = CSS_CLASSES_ITEM_METRIC_EQUAL;
                        else
                            this.$scope.lengthClass = CSS_CLASSES_ITEM_METRIC_SUCCESS;
                    }
                    let item = this;
                    if ((this.$scope.originalLength = originalText.length) == 0)
                        this.$scope.originalLineInfo = [{ isSelected: false, cssClass: CSS_CLASSES_ITEM_REPLACELINE_NOTSELECTED, length: 0, lineEnding: "", selectCurrent: () => { item.selectOriginalLine(0); }, text: "\"\"" }];
                    else {
                        this.$scope.originalLineInfo = [];
                        let m = LINE_WITH_ENDING_REGEX.exec(originalText);
                        while (!sys.isNil(m)) {
                            let s = angular.toJson(m[2]);
                            s = s.substr(1, s.length - 2);
                            if (sys.isNil(m[1]))
                                this.$scope.originalLineInfo.push({
                                    isSelected: false, cssClass: CSS_CLASSES_ITEM_REPLACELINE_NOTSELECTED, length: 0, lineEnding: s, selectCurrent: () => {
                                        item.selectOriginalLine(this.$scope.originalLineInfo.length);
                                        if (!sys.isNil(event)) {
                                            event.preventDefault();
                                            event.stopPropagation();
                                        }
                                    }, text: "\"\""
                                });
                            else
                                this.$scope.originalLineInfo.push({
                                    isSelected: false, cssClass: CSS_CLASSES_ITEM_REPLACELINE_NOTSELECTED, length: m[1].length, lineEnding: s, selectCurrent: () => {
                                        item.selectOriginalLine(this.$scope.originalLineInfo.length);
                                        if (!sys.isNil(event)) {
                                            event.preventDefault();
                                            event.stopPropagation();
                                        }
                                    }, text: angular.toJson(m[1])
                                });
                            originalText = originalText.substr(m[0].length);
                            m = LINE_WITH_ENDING_REGEX.exec(originalText);
                        }
                        if (originalText.length > 0)
                            this.$scope.originalLineInfo.push({
                                isSelected: false, cssClass: CSS_CLASSES_ITEM_REPLACELINE_NOTSELECTED, length: originalText.length, lineEnding: "", selectCurrent: () => {
                                    item.selectOriginalLine(this.$scope.originalLineInfo.length);
                                    if (!sys.isNil(event)) {
                                        event.preventDefault();
                                        event.stopPropagation();
                                    }
                                }, text: angular.toJson(originalText)
                            });
                    }
                    if ((this.$scope.replacedLength = result.length) == 0)
                        this.$scope.replacedLineInfo = [{
                                isSelected: true, cssClass: CSS_CLASSES_ITEM_REPLACELINE_NOTSELECTED, length: 0, lineEnding: "", selectCurrent: () => {
                                    item.selectResultLine(0);
                                    if (!sys.isNil(event)) {
                                        event.preventDefault();
                                        event.stopPropagation();
                                    }
                                }, text: "\"\""
                            }];
                    else {
                        this.$scope.replacedLineInfo = [];
                        let m = LINE_WITH_ENDING_REGEX.exec(result);
                        while (!sys.isNil(m)) {
                            let s = angular.toJson(m[2]);
                            s = s.substr(1, s.length - 2);
                            if (sys.isNil(m[1]))
                                this.$scope.replacedLineInfo.push({
                                    isSelected: false, cssClass: CSS_CLASSES_ITEM_REPLACELINE_NOTSELECTED, length: 0, lineEnding: s, selectCurrent: () => {
                                        item.selectResultLine(this.$scope.replacedLineInfo.length);
                                        if (!sys.isNil(event)) {
                                            event.preventDefault();
                                            event.stopPropagation();
                                        }
                                    }, text: "\"\""
                                });
                            else
                                this.$scope.replacedLineInfo.push({
                                    isSelected: false, cssClass: CSS_CLASSES_ITEM_REPLACELINE_NOTSELECTED, length: m[1].length, lineEnding: s, selectCurrent: () => {
                                        item.selectResultLine(this.$scope.replacedLineInfo.length);
                                        if (!sys.isNil(event)) {
                                            event.preventDefault();
                                            event.stopPropagation();
                                        }
                                    }, text: angular.toJson(m[1])
                                });
                            result = result.substr(m[0].length);
                            m = LINE_WITH_ENDING_REGEX.exec(result);
                        }
                        if (result.length > 0)
                            this.$scope.replacedLineInfo.push({
                                isSelected: false, cssClass: CSS_CLASSES_ITEM_REPLACELINE_NOTSELECTED, length: result.length, lineEnding: "", selectCurrent: () => {
                                    item.selectResultLine(this.$scope.replacedLineInfo.length);
                                    if (!sys.isNil(event)) {
                                        event.preventDefault();
                                        event.stopPropagation();
                                    }
                                }, text: angular.toJson(result)
                            });
                    }
                    ;
                    this.$scope.comparedLine = "";
                    if ((this.$scope.originalLineCount = this.$scope.originalLineInfo.length) === (this.$scope.replacedLineCount = this.$scope.replacedLineInfo.length))
                        this.$scope.lineCountClass = CSS_CLASSES_ITEM_METRIC_EQUAL;
                    else
                        this.$scope.lineCountClass = CSS_CLASSES_ITEM_METRIC_SUCCESS;
                    this.selectOriginalLine(0);
                    this.selectResultLine(0);
                }, (reason) => {
                    if (sys.isNil(this._regexTester.expression) || re.source !== this._regexTester.expression.source || re.flags !== this._regexTester.expression.flags || originalText !== this.$scope.inputText || replacementText !== this.$scope.replacementText)
                        return;
                    if (sys.isNil(this._regexTester.patternError))
                        this._regexTester.patternError = reason;
                    this.$scope.messageClass = CSS_CLASSES_ITEM_EVALUATION_ERROR;
                    this.$scope.messageText = "Unexpected error: " + reason;
                    this.$scope.originalLineInfo = [];
                    this.$scope.replacedLineInfo = [];
                    this.$scope.changedClass = [];
                    this.$scope.lengthClass = [];
                    this.$scope.lineCountClass = [];
                    this.$scope.originalLength = this.$scope.replacedLength = this.$scope.originalLineCount = this.$scope.replacedLineCount = 0;
                    this.$scope.compareClass = [];
                    this.$scope.originalLine = this.$scope.changeMessage = this.$scope.comparedLine = "";
                    this._regexTester.evaluationComplete(false, this._index);
                });
            }
            else {
                this._regexTester.$q((resolve, reject) => {
                    if (sys.isNil(this._regexTester.expression) || re.source !== this._regexTester.expression.source || re.flags !== this._regexTester.expression.flags)
                        resolve(undefined);
                    else {
                        this._regexTester.$log.debug("Testing " + this._regexTester.expression.toString() + " against " + angular.toJson(this.$scope.inputText));
                        try {
                            let m = re.exec(this.$scope.inputText);
                            resolve(m);
                        }
                        catch (e) {
                            reject(e);
                        }
                    }
                }).then((result) => {
                    if (typeof result === "undefined" || sys.isNil(this._regexTester.expression) || re.source !== this._regexTester.expression.source || re.flags !== this._regexTester.expression.flags)
                        return;
                    if (result === null) {
                        this.$scope.matchSuccess = false;
                        this.$scope.messageClass = CSS_CLASSES_ITEM_EVALUATION_WARNING;
                        this.$scope.messageText = EVAL_RESULT_MSG_MATCH_NOT_FOUND;
                        this.$scope.matchResults = [];
                        this._regexTester.evaluationComplete(false, this._index);
                    }
                    else {
                        this.$scope.matchSuccess = true;
                        this.$scope.messageClass = CSS_CLASSES_ITEM_EVALUATION_SUCCESS;
                        this.$scope.messageText = "Matched " + result.length + " groups starting at position " + result.index + ".";
                        this.$scope.matchIndex = result.index;
                        this.$scope.matchResults = result.map((value, index) => {
                            if (sys.isNil(value))
                                return {
                                    cssClass: CSS_CLASSES_ITEM_GROUP_NO_MATCH,
                                    groupText: "",
                                    successMsg: "No",
                                    index: index
                                };
                            return {
                                cssClass: CSS_CLASSES_ITEM_GROUP_SUCCESS,
                                groupText: angular.toJson(value),
                                successMsg: "Yes",
                                index: index
                            };
                        });
                        this._regexTester.evaluationComplete(true, this._index);
                    }
                }, (reason) => {
                    if (sys.isNil(this._regexTester.expression) || re.source !== this._regexTester.expression.source || re.flags !== this._regexTester.expression.flags)
                        return;
                    if (sys.isNil(this._regexTester.patternError))
                        this._regexTester.patternError = reason;
                    this.$scope.messageClass = CSS_CLASSES_ITEM_EVALUATION_ERROR;
                    this.$scope.messageText = "Unexpected error: " + reason;
                    this.$scope.matchResults = [];
                    this._regexTester.evaluationComplete(false, this._index);
                });
            }
        }
    }
    // #endregion
    // #region RegexTesterController_old
    const CONTROL_ID_MULTILINEPATTERNTEXTBOX = "multiLinePatternTextBox";
    const CONTROL_ID_SINGLELINEPATTERNTEXTBOX = "singleLinePatternTextBox";
    // (?:([^?:+\\/@?#%]+)(:(?://?|/?$)))(?:((?:[^:+\\/@?#]+|%[a-f\d]2)*)(?::((?:[^\\/@?#]+|%[a-f\d]2)*))?@(?![:/?#\\]))?(((?:[^:\\/@?#]+|%[a-f\d]2)+)(:(\d+))?)?
    class RegexTesterController_old {
        constructor($scope, $q, $log) {
            this.$scope = $scope;
            this.$q = $q;
            this.$log = $log;
            $scope.regexTester = this;
            $scope.multiLineRowCount = TEXTAREA_ROW_COUNT_DEFAULT;
            $scope.multiLinePatternTextBoxId = CONTROL_ID_MULTILINEPATTERNTEXTBOX;
            $scope.singleLinePatternTextBoxId = CONTROL_ID_SINGLELINEPATTERNTEXTBOX;
            $scope.evaluationInput = [];
            $scope.ignoreWhitespace = $scope.global = $scope.ignoreCase = $scope.multiline = $scope.sticky = $scope.unicode = $scope.dotMatchesNewline = $scope.hasErrorMessage = $scope.hasErrorName = $scope.hasErrorDetail = false;
            $scope.noMatches = true;
            $scope.singleLinePatternText = $scope.multiLinePatternText = $scope.flags = $scope.patternErrorMessage = $scope.patternErrorName = $scope.patternErrorDetail = "";
            let controller = this;
            $scope.$watchGroup(["global", "ignoreCase", "multiline", "sticky", "unicode", "dotMatchesNewline"], () => {
                controller.updateFlags();
            });
            $scope.$watch("ignoreWhitespace", () => { controller.updatePatternView(); });
            $scope.$watch("multiLinePatternText", () => {
                controller.multiLinePatternChanged();
            });
            $scope.$watch("singleLinePatternText", () => {
                controller.patternChanged();
            });
            this.addInput();
            this.editPattern();
            this.patternChanged();
        }
        get expression() { return this._expression; }
        get isEditingPattern() { return this.$scope.isEditingPattern; }
        set isEditingPattern(value) {
            if (this.$scope.isEditingPattern === value)
                return;
            this.$scope.isEditingPattern = value === true;
            this.updatePatternView();
        }
        get patternError() { return this._patternError; }
        set patternError(value) {
            value = sys.asErrorResult(value);
            if (sys.isNil(value)) {
                this._patternError = undefined;
                this.$scope.hasErrorMessage = this.$scope.hasErrorDetail = this.$scope.hasErrorName = false;
                this.$scope.patternErrorMessage = this.$scope.patternErrorDetail = this.$scope.patternErrorName = "";
            }
            else {
                this._patternError = value;
                this.$scope.hasErrorMessage = true;
                if (typeof value === "string") {
                    this.$scope.patternErrorMessage = value;
                    this.$scope.hasErrorDetail = this.$scope.hasErrorName = false;
                    this.$scope.patternErrorDetail = this.$scope.patternErrorName = "";
                }
                else {
                    if ((this.$scope.patternErrorMessage = sys.asString(value.message, "").trim()).length == 0) {
                        if ((this.$scope.patternErrorMessage = sys.asString(value.name, "").trim()).length == 0)
                            this.$scope.patternErrorMessage = "Unexpected error: " + value;
                        this.$scope.patternErrorName = "";
                    }
                    else
                        this.$scope.patternErrorName = sys.asString(value.name, "").trim();
                    this.$scope.patternErrorDetail = sys.asString(value.data, "");
                    this.$scope.hasErrorName = this.$scope.patternErrorName.length > 0;
                    this.$scope.hasErrorDetail = this.$scope.patternErrorDetail.trim().length > 0;
                }
            }
        }
        addPatternRow(event) {
            if (this.$scope.multiLineRowCount >= TEXTAREA_ROW_COUNT_MAX)
                return;
            this.$scope.multiLineRowCount++;
            this.updatePatternView();
            if (!sys.isNil(event)) {
                event.preventDefault();
                event.stopPropagation();
            }
        }
        removePatternRow(event) {
            if (this.$scope.multiLineRowCount < 3)
                return;
            this.$scope.multiLineRowCount--;
            this.updatePatternView();
            if (this.isEditingPattern && this.$scope.isShowingMultiLinePatternEdit)
                $(CONTROL_ID_MULTILINEPATTERNTEXTBOX).focus();
            if (!sys.isNil(event)) {
                event.preventDefault();
                event.stopPropagation();
            }
        }
        addInput(event) {
            EvaluationItem.addItem(new EvaluationItem(this.$scope.$new(), this), this.$scope.evaluationInput);
            if (!sys.isNil(event)) {
                event.preventDefault();
                event.stopPropagation();
            }
        }
        editPattern(event) {
            this.isEditingPattern = true;
            if (!sys.isNil(event)) {
                event.preventDefault();
                event.stopPropagation();
            }
        }
        openOptionsDialog(event) {
            $('#patternOptionsModal').modal("show");
            if (!sys.isNil(event)) {
                event.preventDefault();
                event.stopPropagation();
            }
        }
        closeOptionsDialog(event) {
            $('#patternOptionsModal').modal("hide");
            if (!sys.isNil(event)) {
                event.preventDefault();
                event.stopPropagation();
            }
        }
        updatePatternView() {
            if (this.isEditingPattern) {
                if (this.$scope.ignoreWhitespace === true) {
                    this.$scope.patternTextBoxLabelId = CONTROL_ID_MULTILINEPATTERNTEXTBOX;
                    this.$scope.canAddPatternRow = this.$scope.multiLineRowCount < TEXTAREA_ROW_COUNT_MAX;
                    this.$scope.isShowingMultiLinePatternEdit = this.$scope.canRemovePatternRow = this.$scope.multiLineRowCount > 1;
                    this.$scope.isShowingSingleLinePatternEdit = !this.$scope.isShowingMultiLinePatternEdit;
                }
                else {
                    this.$scope.patternTextBoxLabelId = CONTROL_ID_SINGLELINEPATTERNTEXTBOX;
                    this.$scope.isShowingMultiLinePatternEdit = this.$scope.canAddPatternRow = this.$scope.canRemovePatternRow = false;
                    this.$scope.isShowingSingleLinePatternEdit = true;
                }
                this.$scope.evaluationInput.forEach((item) => { item.item.isEditingPattern = true; });
            }
            else {
                this.$scope.isShowingSingleLinePatternEdit = this.$scope.isShowingMultiLinePatternEdit = this.$scope.canAddPatternRow = this.$scope.canRemovePatternRow = false;
                this.$scope.evaluationInput.forEach((item) => { item.item.isEditingPattern = false; });
            }
        }
        updateFlags() {
            let flags = (this.$scope.ignoreCase) ? "i" : "";
            if (this.$scope.global)
                flags += "g";
            if (this.$scope.multiline)
                flags += "m";
            if (this.$scope.dotMatchesNewline)
                flags += "s";
            if (this.$scope.unicode)
                flags += "u";
            if (this.$scope.sticky)
                flags += "y";
            if (flags === this.$scope.flags)
                return;
            this.$scope.flags = flags;
            this.patternChanged();
        }
        multiLinePatternChanged() {
            if (!this.$scope.ignoreWhitespace)
                return;
            let pattern = sys.asString(this.$scope.multiLinePatternText).trim().replace(WHITESPACE_REGEX, "");
            if (pattern === this.$scope.singleLinePatternText)
                return;
            this.$scope.singleLinePatternText = pattern;
            this.patternChanged();
        }
        patternChanged() {
            let patternText = this.$scope.singleLinePatternText;
            if (!this.$scope.ignoreWhitespace)
                this.$scope.multiLinePatternText = patternText;
            let flags = this.$scope.flags;
            this._expression = undefined;
            this.$q((resolve, reject) => {
                if (patternText !== this.$scope.singleLinePatternText || flags !== this.$scope.flags)
                    resolve(undefined);
                else {
                    let re;
                    try {
                        re = new RegExp(patternText, flags);
                    }
                    catch (e) {
                        reject(e);
                        return;
                    }
                    if (sys.isNil(re))
                        reject("Failed to parse regular expression.");
                    else
                        resolve(re);
                }
            }).then((result) => {
                if (patternText !== this.$scope.singleLinePatternText || flags !== this.$scope.flags)
                    return;
                this.$scope.patternDisplayText = result.toString();
                this._expression = result;
                this.$scope.patternErrorMessage = this.$scope.patternErrorName = this.$scope.patternErrorDetail = "";
                this.$scope.hasErrorMessage = this.$scope.hasErrorName = this.$scope.hasErrorDetail = false;
                this.$scope.noMatches = true;
                this.$scope.evaluationInput.forEach((value) => { value.item.evaluate(); });
            }, (reason) => {
                if (patternText === this.$scope.singleLinePatternText && flags === this.$scope.flags)
                    this.patternError = reason;
            });
        }
        evaluationComplete(success, _index) {
            if (success)
                this.$scope.noMatches = false;
        }
        deleteItem(index) { EvaluationItem.deleteItem(this.$scope.evaluationInput, index); }
        editItem(index) { EvaluationItem.editItem(this.$scope.evaluationInput, index); }
        $doCheck() { }
    }
    class TestStringItem {
        constructor($scope, $log) {
            this.$scope = $scope;
            this.$log = $log;
            this._id = Symbol();
            this._canDelete = false;
            this._isEditMode = false;
            $scope.testString = this;
            $;
        }
        static getParentArray(parentScope) {
            let testStrings = parentScope.testStrings;
            if (sys.isNil(testStrings) || !Array.isArray(testStrings))
                testStrings = [];
            else if ((testStrings = testStrings.filter((value, i) => {
                if (sys.isNil(value))
                    return false;
                let item = value.testString;
                return !sys.isNil(item) && typeof item._parentScope !== "undefined";
            })).length === parentScope.testStrings.length)
                return parentScope.testStrings;
            parentScope.testStrings = testStrings;
            return testStrings;
        }
        getIndex() {
            if (sys.isNil(this._parentScope))
                return -1;
            let testStrings = TestStringItem.getParentArray(this._parentScope);
            for (let i = 0; i < testStrings.length; i++) {
                if (testStrings[i].testString._id === this._id)
                    return i;
            }
            this._parentScope = undefined;
            this._canDelete = false;
            return -1;
        }
        removeCurrent() {
            if (!this._canDelete)
                return;
            let index = this.getIndex();
            if (index < 0)
                return;
            if (index === 0)
                this._parentScope.testStrings.shift();
            else if (index === this._parentScope.testStrings.length - 1)
                this._parentScope.testStrings.pop();
            else
                this._parentScope.testStrings.splice(index, 1);
            if (this._parentScope.testStrings.length == 1)
                this._parentScope.testStrings[0].testString._canDelete = false;
            this._canDelete = false;
            this._parentScope = undefined;
        }
        static push(parentScope, log) {
            let item = new TestStringItem(parentScope.$new(), log);
            item._parentScope = parentScope;
            let testStrings = TestStringItem.getParentArray(parentScope);
            testStrings.push(item.$scope);
            if (testStrings.length == 2)
                testStrings[0].testString._canDelete = true;
            return item;
        }
        static startExec(parentScope, regExp, $q, patternText, flags) {
            if (sys.isNil(regExp)) {
                TestStringItem.getParentArray(parentScope).forEach(($scope) => { $scope.testString.setNotEvaluated(); });
                return;
            }
            TestStringItem.getParentArray(parentScope).forEach(($scope, index) => {
                let item = $scope.testString;
                let regexTester = item._parentScope.regexTester;
                $q((resolve, reject) => {
                    if (sys.isNil(item._parentScope) || patternText !== regexTester.patternText || flags !== regexTester.flags)
                        resolve(undefined);
                    else {
                        let result;
                        try {
                            if ($scope.isReplaceMode)
                                result = $scope.inputText.replace(regExp, $scope.replacementText);
                            else
                                result = regExp.exec($scope.inputText);
                        }
                        catch (e) {
                            reject(e);
                            return;
                        }
                        if (sys.isNil(result) && $scope.isReplaceMode)
                            reject("Failed to evaluate regular expression.");
                        else
                            resolve(result);
                    }
                }).then((result) => {
                    if (typeof result === "undefined" || sys.isNil(item._parentScope) || patternText !== regexTester.patternText || flags !== regexTester.flags)
                        return;
                    // TODO: Process result
                }, (reason) => {
                    if (sys.isNil(item._parentScope) || patternText !== regexTester.patternText || flags !== regexTester.flags)
                        return;
                    reason = sys.asErrorResult((sys.isNil(reason)) ? "" : reason);
                    if (item._parentScope.pattern.isValid) {
                        item._parentScope.pattern.isValid = false;
                        if (typeof reason === "string")
                            item._parentScope.pattern = {
                                displayText: item._parentScope.pattern.displayText, errorMessage: (reason.trim().length == 0) ? "An unknown error has occurred while evaluating expression " + (index + 1) + "" : "Error evaluating expression " + (index + 1) + ": " + reason, isValid: false, errorDetail: "", hasErrorDetail: false
                            };
                        else {
                            let message = sys.asString(reason.message, "").trim();
                            let detail = "";
                            if (message.length == 0 && (message = sys.asString(reason.name, "").trim()).length == 0)
                                item._parentScope.pattern = { displayText: item._parentScope.pattern.displayText, errorMessage: "An unknown error has occurred while evaluating expression " + (index + 1) + "", isValid: false, errorDetail: angular.toJson(reason), hasErrorDetail: true };
                            else if (sys.isNil(reason.data))
                                item._parentScope.pattern = { displayText: item._parentScope.pattern.displayText, errorMessage: "Error evaluating expression " + (index + 1) + ": " + message, isValid: false, errorDetail: "", hasErrorDetail: false };
                            else
                                item._parentScope.pattern = { displayText: item._parentScope.pattern.displayText, errorMessage: "Error evaluating expression " + (index + 1) + ": " + message, isValid: false, errorDetail: angular.toJson(reason.data), hasErrorDetail: true };
                        }
                    }
                    else {
                        // TODO: Add error for current item.
                    }
                });
            });
        }
        setNotEvaluated() {
            throw new Error("Method not implemented.");
        }
    }
    // #endregion
    // #region regexTesterController
    const PATTERN_FLAG_SYMBOLS = { global: "g", ignoreCase: "i", multiline: "m", unicode: "u", sticky: "y" };
    const PATTERN_FLAG_NAMES = Object.getOwnPropertyNames(PATTERN_FLAG_SYMBOLS);
    class RegexTesterController {
        constructor($scope, $q, $log) {
            this.$scope = $scope;
            this.$q = $q;
            this.$log = $log;
            this._flags = "";
            this._patternText = "";
            this._changeLevel = 0;
            this._patternRebuildReqd = false;
            $scope.regexTester = this;
            $scope.isEditPatternMode = true;
            $scope.ignoreWhitespace = false;
            $scope.patternIsMultiLine = false;
            $scope.singleLinePatternText = $scope.multiLinePatternText = this._patternText;
            $scope.patternLineCount = TEXTAREA_ROW_COUNT_DEFAULT;
            $scope.global = false;
            $scope.ignoreCase = false;
            $scope.multiline = false;
            $scope.sticky = false;
            $scope.unicode = false;
            $scope.pattern = { displayText: "", errorMessage: "Expression not parsed", isValid: false, errorDetail: "", hasErrorDetail: false };
            TestStringItem.push($scope, $log);
            $scope.$watchGroup(PATTERN_FLAG_NAMES, () => {
                this._changeLevel++;
                try {
                    let flags = (this.$scope.ignoreCase) ? "i" : "";
                    if (this.$scope.global)
                        flags += "g";
                    if (this.$scope.multiline)
                        flags += "m";
                    if (this.$scope.unicode)
                        flags += "u";
                    if (this.$scope.sticky)
                        flags += "y";
                    if (flags !== this._flags) {
                        this.$scope.flags = this._flags = flags;
                        this._patternRebuildReqd = true;
                    }
                }
                finally {
                    this._changeLevel--;
                }
                if (this._changeLevel == 0 && this._patternRebuildReqd)
                    this.startPatternRebuild();
            });
            $scope.$watch("patternIsMultiLine", () => {
                this._changeLevel++;
                try {
                    if (this.$scope.patternIsMultiLine) {
                        if (this.$scope.multiLinePatternText !== this.$scope.singleLinePatternText)
                            this.$scope.multiLinePatternText = this.$scope.singleLinePatternText;
                    }
                    else {
                        let s = sys.asString(this.$scope.multiLinePatternText, "").replace(NEWLINE_REGEX, "");
                        if (s !== this.$scope.singleLinePatternText)
                            this.$scope.singleLinePatternText = s;
                    }
                }
                finally {
                    this._changeLevel--;
                }
                if (this._changeLevel == 0 && this._patternRebuildReqd)
                    this.startPatternRebuild();
            });
            $scope.$watch("ignoreWhitespace", () => {
                if (!this.$scope.ignoreWhitespace)
                    return;
                this._changeLevel++;
                try {
                    let s = sys.asString(this.$scope.singleLinePatternText, "").replace(WHITESPACE_REGEX, "");
                    this.$scope.patternIsMultiLine = false;
                    if (s !== this.$scope.singleLinePatternText)
                        this.$scope.singleLinePatternText = s;
                }
                finally {
                    this._changeLevel--;
                }
                if (this._changeLevel == 0 && this._patternRebuildReqd)
                    this.startPatternRebuild();
            });
            $scope.$watch("multiLinePatternText", () => {
                if (!this.$scope.patternIsMultiLine)
                    return;
                this._changeLevel++;
                try {
                    let s = sys.asString(this.$scope.multiLinePatternText, "").replace(WHITESPACE_REGEX, "");
                    if (s !== this._patternText) {
                        this._patternText = s;
                        this._patternRebuildReqd = true;
                    }
                }
                finally {
                    this._changeLevel--;
                }
                if (this._changeLevel == 0 && this._patternRebuildReqd)
                    this.startPatternRebuild();
            });
            $scope.$watch("singleLinePatternText", () => {
                if (this.$scope.patternIsMultiLine)
                    return;
                this._changeLevel++;
                try {
                    let s = (this.$scope.ignoreWhitespace) ? sys.asString(this.$scope.singleLinePatternText, "").replace(WHITESPACE_REGEX, "") : sys.asString(this.$scope.singleLinePatternText, "");
                    if (s !== this._patternText) {
                        this._patternText = s;
                        this._patternRebuildReqd = true;
                    }
                }
                finally {
                    this._changeLevel--;
                }
                if (this._changeLevel == 0 && this._patternRebuildReqd)
                    this.startPatternRebuild();
            });
        }
        get expression() { return this._expression; }
        get flags() { return this._flags; }
        get patternText() { return this._patternText; }
        editPatternText(event) {
            if (this.$scope.isEditPatternMode !== true) {
            }
        }
        incrementPatternLineCount(event) {
        }
        decrementPatternLineCount(event) {
        }
        $doCheck() { }
        startPatternRebuild() {
            let patternText = this._patternText;
            let flags = this._flags;
            this._patternRebuildReqd = false;
            let expression = this._expression;
            this.$q((resolve, reject) => {
                if (patternText !== this._patternText || flags !== this._flags)
                    resolve(undefined);
                else {
                    let re;
                    try {
                        re = new RegExp(patternText, flags);
                    }
                    catch (e) {
                        reject(e);
                        return;
                    }
                    if (sys.isNil(re))
                        reject("Failed to parse regular expression.");
                    else
                        resolve(re);
                }
            }).then((result) => {
                if (typeof result === "undefined" || patternText !== this._patternText || flags !== this._flags)
                    return;
                this._expression = result;
                this.$scope.pattern = { displayText: result.toString(), errorMessage: "", isValid: true, errorDetail: "", hasErrorDetail: false };
                TestStringItem.startExec(this.$scope, result, this.$q, patternText, flags);
            }, (reason) => {
                if (patternText !== this._patternText || flags !== this._flags)
                    return;
                let nodes = patternText.split("\\\\");
                if (nodes[nodes.length - 1].endsWith("\\"))
                    patternText += "\\";
                let displayText = "/" + patternText.split("\\/").map((v) => v.replace("/", "\\/")).join("\\/") + "/" + flags;
                reason = sys.asErrorResult((sys.isNil(reason)) ? "" : reason);
                if (typeof reason === "string")
                    this.$scope.pattern = { displayText: displayText, errorMessage: (reason.trim().length == 0) ? "An unknown error has occurred." : reason, isValid: false, errorDetail: "", hasErrorDetail: false };
                else {
                    let message = sys.asString(reason.message, "").trim();
                    let detail = "";
                    if (message.length == 0 && (message = sys.asString(reason.name, "").trim()).length == 0)
                        this.$scope.pattern = { displayText: displayText, errorMessage: "An unknown error has occurred.", isValid: false, errorDetail: angular.toJson(reason), hasErrorDetail: true };
                    else if (sys.isNil(reason.data))
                        this.$scope.pattern = { displayText: displayText, errorMessage: message, isValid: false, errorDetail: "", hasErrorDetail: false };
                    else
                        this.$scope.pattern = { displayText: displayText, errorMessage: message, isValid: false, errorDetail: angular.toJson(reason.data), hasErrorDetail: true };
                }
                if (typeof expression !== "undefined")
                    TestStringItem.startExec(this.$scope, undefined, this.$q, patternText, flags);
            });
        }
    }
    app.mainModule.controller("regexTesterController", ["$scope", "$q", "$log", RegexTesterController]);
    // #endregion
})(regexTester || (regexTester = {}));
//# sourceMappingURL=RegexTester.js.map