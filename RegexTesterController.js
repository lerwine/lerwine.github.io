/// <reference path="Scripts/typings/jquery/jquery.d.ts"/>
/// <reference path="Scripts/typings/angularjs/angular.d.ts"/>
/// <reference path="app.ts"/>
var regexTester;
(function (regexTester) {
    // #region LocalStorageService
    class LocalRegexStorageService {
        keys() {
            let result = [];
            for (let i = 0; i < localStorage.length; i++)
                result.push(localStorage.key(i));
            return result;
        }
        length() { return localStorage.length; }
        load(key, scope) {
            try {
                let json = localStorage.getItem(key);
                if (!app.isNilOrWhiteSpace(json)) {
                    let data = (JSON.parse(json));
                    scope.inputPattern = data.pattern;
                    let i = data.inputText.length;
                    while (scope.inputItems.length < i)
                        scope.addInputItem();
                    i--;
                    while (scope.inputItems.length > i)
                        scope.inputItems[i].delete();
                    do {
                        scope.inputItems[i].inputText = data.inputText[i--];
                    } while (i > -1);
                    scope.inputItems.forEach((i) => {
                        i.evaluated = i.success = false;
                        i.cssClass = ['alert', 'alert-secondary'];
                    });
                    scope.showEvaluations = false;
                }
            }
            catch (_a) { }
            return false;
        }
        save(key, scope) {
            localStorage.setItem(key, JSON.stringify({
                pattern: scope.inputPattern,
                inputText: scope.inputItems.map((i) => i.inputText),
                isGlobal: scope.isGlobal,
                ignoreCase: scope.ignoreCase,
                multiline: scope.multiline,
                unicode: scope.unicode,
                sticky: scope.sticky,
                dotAll: scope.dotAll,
                ignoreWhitespace: scope.ignoreWhitespace
            }));
        }
        remove(key) { localStorage.removeItem(key); }
        clear() { localStorage.clear(); }
    }
    app.module.factory("LocalRegexStorageService", LocalRegexStorageService);
    class RegexTesterController {
        constructor($scope, storageSvc) {
            this.$scope = $scope;
            this.storageSvc = storageSvc;
            this._inputText = [];
            this._inputPattern = '';
            this._isGlobal = false;
            this._ignoreCase = false;
            this._multiline = false;
            this._unicode = false;
            this._sticky = false;
            this._dotAll = false;
            this._ignoreWhitespace = false;
            let controller = this;
            $scope.inputItems = [];
            this.addInputItem();
            $scope.inputPattern = this._inputPattern;
            $scope.patternParseError = '';
            $scope.ignoreCase = this._ignoreCase;
            $scope.isGlobal = this._isGlobal;
            $scope.multiline = this._multiline;
            $scope.unicode = this._unicode;
            $scope.sticky = this._sticky;
            $scope.dotAll = this._dotAll;
            $scope.showParseError = false;
            $scope.flags = '';
            $scope.index = -1;
            $scope.evaluate = () => controller.evaluate();
            $scope.addInputItem = () => controller.addInputItem();
            $scope.editInput = () => controller.editInput();
            $scope.editOptions = (value) => controller.editOptions(value);
            $scope.ignoreWhitespace = this._ignoreWhitespace;
            $scope.showOptions = $scope.showEvaluations = $scope.hideInputTextBox = false;
            $scope.savedNames = storageSvc.keys();
            $scope.currentSavedName = $scope.sessionLoadMessage = $scope.sessionSaveMessage = '';
            $scope.loadSession = (name) => controller.loadSession(name);
            $scope.deleteSession = (name) => controller.deleteSession(name);
            $scope.saveSession = () => controller.saveSession();
            $scope.setInputRowCount = (inc) => controller.setInputRowCount(inc);
            $scope.inputRowCount = 3;
            $scope.validationClass = [];
            this.evaluate();
        }
        setInputRowCount(inc) {
            if (inc) {
                if (this.$scope.inputRowCount < 25)
                    this.$scope.inputRowCount++;
            }
            else if (this.$scope.inputRowCount > 3)
                this.$scope.inputRowCount--;
        }
        loadSession(name) {
            this.$scope.sessionLoadMessage = this.$scope.sessionSaveMessage = '';
            this.storageSvc.load(name, this.$scope);
            this.$scope.currentSavedName = name;
            this.$scope.sessionLoadMessage = 'Session "' + name + '" loaded at ' + Date();
        }
        deleteSession(name) {
            this.$scope.sessionLoadMessage = this.$scope.sessionSaveMessage = '';
            this.storageSvc.remove(name);
            this.$scope.savedNames = this.storageSvc.keys();
            this.$scope.sessionLoadMessage = 'Session "' + name + '" deleted.';
        }
        saveSession() {
            this.$scope.sessionLoadMessage = this.$scope.sessionSaveMessage = '';
            if (app.isNilOrWhiteSpace(this.$scope.currentSavedName))
                alert("Saved session must have a name.");
            else {
                this.storageSvc.save((this.$scope.currentSavedName = this.$scope.currentSavedName.trim()), this.$scope);
                this.$scope.sessionSaveMessage = 'Session "' + this.$scope.currentSavedName + '" saved at ' + Date();
            }
            this.$scope.savedNames = this.storageSvc.keys();
        }
        editOptions(value) {
            this.$scope.sessionLoadMessage = this.$scope.sessionSaveMessage = '';
            this.$scope.showOptions = value;
        }
        editInput() {
            this.$scope.hideInputTextBox = false;
        }
        addInputItem() {
            let item = (this.$scope.$new());
            let array = this.$scope.inputItems;
            item.success = item.evaluated = false;
            item.inputText = '';
            item.statusMessage = "Not evaluated";
            item.cssClass = ['alert', 'alert-secondary'];
            item.itemNumber = array.length + 1;
            item.matchIndex = -1;
            item.matchGroups = [];
            item.edit = () => {
                array.forEach((i) => { i.isCurrent = false; });
                this.$scope.hideInputTextBox = false;
                item.isCurrent = true;
            };
            item.delete = () => {
                if (array.length < 1)
                    return;
                for (let i = item.itemNumber; i < array.length; i++)
                    array[i].itemNumber--;
                if (item.itemNumber === 1)
                    array.shift();
                else if (item.itemNumber == array.length)
                    array.pop();
                else
                    array.slice(item.itemNumber - 1, 1);
                if (array.length == 1)
                    array[0].canDelete = false;
            };
            if (array.length < 1)
                item.canDelete = false;
            else {
                item.canDelete = true;
                if (array.length == 1)
                    array[0].canDelete = true;
            }
            array.forEach((i) => { i.isCurrent = false; });
            item.isCurrent = true;
            array.push(item);
        }
        evaluate() {
            this.$doCheck();
            if (this.$scope.patternParseError.length > 0) {
                if (this.$scope.showParseError)
                    alert("Invalid regex pattern");
                this.$scope.showParseError = true;
                return;
            }
            this.$scope.showEvaluations = this.$scope.hideInputTextBox = true;
            this.$scope.sessionLoadMessage = this.$scope.sessionSaveMessage = '';
            this._inputText = this.$scope.inputItems.map((item) => {
                item.isCurrent = false;
                if (typeof (item.inputText) !== 'string')
                    item.inputText = '';
                try {
                    let result = this._regex.exec(item.inputText);
                    item.evaluated = true;
                    if (app.isNil(result)) {
                        item.success = false;
                        item.matchIndex = -1;
                        item.matchGroups = [];
                        item.statusMessage = "Match failed.";
                        item.cssClass = ['alert', 'alert-warning'];
                    }
                    else {
                        item.success = true;
                        item.statusMessage = "Match succeeded. Matched " + result[0].length + " characters at index " + result.index + ' .';
                        item.cssClass = ['alert', 'alert-success'];
                        item.matchIndex = result.index;
                        item.matchGroups = result.map((value, index) => {
                            if (app.isNil(value))
                                return { index: index, success: false, statusMessage: 'Not matched', value: '', cssClass: ['alert', 'alert-secondary'] };
                            return { index: index, success: true, statusMessage: 'Matched ' + value.length + ' characters', value: value, cssClass: ['alert', 'alert-success'] };
                        });
                    }
                }
                catch (e) {
                    item.success = false;
                    item.statusMessage = "Match error: " + JSON.stringify(e);
                    item.cssClass = ['alert', 'alert-danger'];
                }
                return item.inputText;
            });
        }
        $doCheck() {
            if (this.$scope.ignoreWhitespace != this._ignoreWhitespace) {
                if (this._ignoreWhitespace) {
                    this._ignoreWhitespace = false;
                    this.$scope.inputPattern = this.$scope.inputPattern.replace(RegexTesterController.whitespacRe, "");
                }
                else
                    this._ignoreWhitespace = true;
            }
            if (this._inputPattern !== this.$scope.inputPattern || this._isGlobal !== this.$scope.isGlobal || this._multiline !== this.$scope.multiline || this._ignoreCase !== this.$scope.ignoreCase || this._sticky !== this.$scope.sticky ||
                this._unicode !== this.$scope.unicode || this._dotAll !== this.$scope.dotAll) {
                this.$scope.patternParseError = '';
                this._inputPattern = this.$scope.inputPattern;
                this._isGlobal = this.$scope.isGlobal;
                this._multiline = this.$scope.multiline;
                this._ignoreCase = this.$scope.ignoreCase;
                this._sticky = this.$scope.sticky;
                this._unicode = this.$scope.unicode;
                this._dotAll = this.$scope.dotAll;
                this.$scope.showParseError = false;
                try {
                    this.$scope.flags = '';
                    if (this._ignoreCase)
                        this.$scope.flags = 'i';
                    if (this._isGlobal)
                        this.$scope.flags += 'g';
                    if (this._multiline)
                        this.$scope.flags += 'm';
                    if (this._unicode)
                        this.$scope.flags += 'u';
                    if (this._sticky)
                        this.$scope.flags += 'y';
                    if (this._dotAll)
                        this.$scope.flags += 's';
                    let pattern = this._inputPattern;
                    if (this.$scope.ignoreWhitespace)
                        pattern = pattern.replace(RegexTesterController.whitespacRe, "");
                    this.$scope.fullPattern = "/" + pattern + "/" + this.$scope.flags;
                    let regex = (this.$scope.flags.length == 0) ? new RegExp(pattern) : new RegExp(pattern, this.$scope.flags);
                    if (app.isNil(regex))
                        throw "Failed to create regular expression.";
                    this._regex = regex;
                    if (pattern.length == 0) {
                        this.$scope.patternParseError = 'Pattern is empty.';
                        this.$scope.validationClass = ['alert', 'alert-warning'];
                    }
                    else
                        this.$scope.validationClass = [];
                }
                catch (e) {
                    this.$scope.patternParseError = (typeof (e) === 'string') ? e : JSON.stringify(e);
                    this.$scope.validationClass = ['alert', 'alert-danger'];
                    this.$scope.index = -1;
                    this.$scope.matchGroups = [];
                    return;
                }
                this._inputText = [];
                this.$scope.inputItems.forEach((item) => {
                    item.evaluated = item.success = false;
                    item.statusMessage = "Not evaluated";
                    item.cssClass = ['alert', 'alert-secondary'];
                });
            }
            else {
                this.$scope.inputItems.forEach((item) => {
                    if (typeof (item.inputText) !== 'string')
                        item.inputText = '';
                    if (this._inputText.indexOf(item.inputText) < 0) {
                        item.evaluated = item.success = false;
                        item.statusMessage = "Not evaluated";
                        item.cssClass = ['alert', 'alert-secondary'];
                    }
                });
            }
        }
    }
    RegexTesterController.whitespacRe = /\s+/g;
    app.module.controller("RegexTesterController", ["$scope", "LocalRegexStorageService", RegexTesterController]);
})(regexTester || (regexTester = {}));
//# sourceMappingURL=RegexTesterController.js.map