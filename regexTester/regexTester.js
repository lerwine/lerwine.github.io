var regexTester;
(function (regexTester) {
    class RegexFlags {
        constructor(flags) {
            this._global = false;
            this._ignoreCase = false;
            this._multiline = false;
            this._unicode = false;
            this._sticky = false;
            this._flags = '';
            if (typeof flags === 'object') {
                if (flags !== null) {
                    this._flags = ((this._global = flags.global) === true) ? 'g' : '';
                    if ((this._ignoreCase = flags.ignoreCase) == true)
                        this._flags += 'i';
                    if ((this._multiline = flags.multiline) == true)
                        this._flags += 'm';
                    if ((this._unicode = flags.unicode) == true)
                        this._flags += 'u';
                    if ((this._unicode = flags.sticky) == true)
                        this._flags += 'y';
                    return;
                }
            }
            else if (typeof flags === 'string' && flags.trim().length > 0) {
                const allFlags = 'gimuy';
                let arr = ['g', 'i', 'm', 'u', 'y'].map((value) => {
                    return { i: flags.indexOf(value), c: value };
                });
                this._global = arr[0].i > -1;
                this._ignoreCase = arr[1].i > -1;
                this._multiline = arr[2].i > -1;
                this._unicode = arr[3].i > -1;
                this._sticky = arr[4].i > -1;
                if ((arr = arr.filter((value) => value.i > -1)).length == 0)
                    this._flags = '';
                else if (arr.length == 1)
                    this._flags = arr[0].c;
                else
                    this._flags = arr.filter((value) => value.i > -1)
                        .sort((a, b) => a.i - b.i)
                        .reduce((previousValue, currentValue) => {
                        if (previousValue.i == currentValue.i)
                            return previousValue;
                        return { i: currentValue.i, c: previousValue.c + currentValue.c };
                    }).c;
                return;
            }
            this._global = this._ignoreCase = this._multiline = this._sticky = this._sticky = false;
            this._flags = '';
        }
        get global() { return this._global; }
        setGlobal(value) {
            if ((value = value === true) === this._global)
                return this;
            return new RegexFlags((value) ? this._flags + 'g' : this._flags.replace('g', ''));
        }
        get ignoreCase() { return this._ignoreCase; }
        setIgnoreCase(value) {
            if ((value = value === true) === this._ignoreCase)
                return this;
            return new RegexFlags((value) ? this._flags + 'i' : this._flags.replace('i', ''));
        }
        get multiline() { return this._multiline; }
        setMultiline(value) {
            if ((value = value === true) === this._multiline)
                return this;
            return new RegexFlags((value) ? this._flags + 'm' : this._flags.replace('m', ''));
        }
        get unicode() { return this._unicode; }
        setUnicode(value) {
            if ((value = value === true) === this._unicode)
                return this;
            return new RegexFlags((value) ? this._flags + 'u' : this._flags.replace('u', ''));
        }
        get sticky() { return this._sticky; }
        setSticky(value) {
            if ((value = value === true) === this._sticky)
                return this;
            return new RegexFlags((value) ? this._flags + 'y' : this._flags.replace('y', ''));
        }
        get flags() { return this._flags; }
    }
    regexTester.RegexFlags = RegexFlags;
    class RegexParserService {
        constructor($rootScope, supplantingTask) {
            this.$rootScope = $rootScope;
            this.supplantingTask = supplantingTask;
            this._flags = new RegexFlags();
            this._pattern = '(?:)';
            this._isParsing = false;
            this._hasFault = false;
            this._taskId = Symbol();
            this[Symbol.toStringTag] = app.ServiceNames.regexParser;
            const initialResults = {
                pattern: this._pattern, flags: this._flags, regex: new RegExp(this._pattern, this._flags.flags)
            };
            this._regex = initialResults.regex;
        }
        flags(value) {
            switch (typeof value) {
                case 'string':
                    this.startPatternParse(this._pattern, new RegexFlags(value));
                    break;
                case 'object':
                    this.startPatternParse(this._pattern, value);
                    break;
            }
            return this._flags;
        }
        global(value) {
            if (typeof value === 'boolean' && value !== this._flags.global)
                this.flags(this._flags.setGlobal(value));
            return this._flags.global;
        }
        ignoreCase(value) {
            if (typeof value === 'boolean' && value !== this._flags.ignoreCase)
                this.flags(this._flags.setIgnoreCase(value));
            return this._flags.ignoreCase;
        }
        multiline(value) {
            if (typeof value === 'boolean' && value !== this._flags.multiline)
                this.flags(this._flags.setMultiline(value));
            return this._flags.multiline;
        }
        sticky(value) {
            if (typeof value === 'boolean' && value !== this._flags.sticky)
                this.flags(this._flags.setSticky(value));
            return this._flags.sticky;
        }
        unicode(value) {
            if (typeof value === 'boolean' && value !== this._flags.unicode)
                this.flags(this._flags.setUnicode(value));
            return this._flags.unicode;
        }
        pattern(value) {
            if (typeof value === 'string')
                this.startPatternParse(value, this._flags);
            return this._pattern;
        }
        isParsing() { return this._isParsing; }
        hasFault() { return this._hasFault; }
        faultReason() { return this._faultReason; }
        startPatternParse(arg0, flags) {
            const parseId = Symbol();
            const previous = {
                flags: this._flags,
                pattern: this._pattern,
                regex: this._regex
            };
            let pattern;
            if (typeof arg0 === 'string') {
                this._pattern = pattern = arg0;
                this._flags = flags;
                if (arg0 === previous.pattern) {
                    if (flags.flags === previous.flags.flags)
                        return;
                    if (flags.global == previous.flags.global && flags.ignoreCase == previous.flags.ignoreCase &&
                        flags.multiline == previous.flags.multiline && flags.unicode == previous.flags.unicode &&
                        flags.sticky == previous.flags.sticky) {
                        try {
                            this.$rootScope.$broadcast(app.EventNames.regexFlagsChanged2, previous.flags, flags, this._parseId);
                        }
                        catch (_a) { }
                        return;
                    }
                    this._parseId = parseId;
                    this._isParsing = true;
                    try {
                        this.$rootScope.$broadcast(app.EventNames.regexFlagsChanged2, previous.flags, flags, parseId);
                    }
                    catch (_b) { }
                }
                else {
                    this._parseId = parseId;
                    this._isParsing = true;
                    if (flags.flags !== previous.flags.flags) {
                        try {
                            this.$rootScope.$broadcast(app.EventNames.regexFlagsChanged2, previous.flags, flags, parseId);
                        }
                        catch (_c) { }
                        if (this._parseId === parseId)
                            try {
                                this.$rootScope.$broadcast(app.EventNames.regexPatternChanged2, previous.pattern, arg0, parseId);
                            }
                            catch (_d) { }
                    }
                    else
                        try {
                            this.$rootScope.$broadcast(app.EventNames.regexPatternChanged2, previous.pattern, arg0, parseId);
                        }
                        catch (_e) { }
                }
            }
            else {
                this._pattern = pattern = (this._regex = arg0).source;
                this._flags = flags = new RegexFlags(arg0);
                if (this._hasFault) {
                    this._parseId = parseId;
                    this._isParsing = true;
                    if ((this._flags = flags).flags !== previous.flags.flags)
                        try {
                            this.$rootScope.$broadcast(app.EventNames.regexFlagsChanged2, previous.flags, flags, parseId);
                        }
                        catch (_f) { }
                    if (this._parseId === parseId && pattern !== previous.pattern)
                        try {
                            this.$rootScope.$broadcast(app.EventNames.regexPatternChanged2, previous.pattern, pattern, parseId);
                        }
                        catch (_g) { }
                }
                else if (pattern === previous.pattern) {
                    if (flags.flags === previous.flags.flags || (flags.global == previous.flags.global &&
                        flags.ignoreCase == previous.flags.ignoreCase && flags.multiline == previous.flags.multiline &&
                        flags.unicode == previous.flags.unicode && flags.sticky == previous.flags.sticky))
                        return;
                    this._parseId = parseId;
                    this._isParsing = true;
                    try {
                        this.$rootScope.$broadcast(app.EventNames.regexFlagsChanged2, previous.flags, flags, parseId);
                    }
                    catch (_h) { }
                }
                else {
                    this._parseId = parseId;
                    this._isParsing = true;
                    this._pattern = pattern;
                    if (flags.global == previous.flags.global && flags.ignoreCase == previous.flags.ignoreCase &&
                        flags.multiline == previous.flags.multiline && flags.unicode == previous.flags.unicode &&
                        flags.sticky == previous.flags.sticky)
                        this._flags = flags = previous.flags;
                    else {
                        try {
                            this.$rootScope.$broadcast(app.EventNames.regexFlagsChanged2, previous.flags, flags, parseId);
                        }
                        catch (_j) { }
                        if (this._parseId === parseId)
                            try {
                                this.$rootScope.$broadcast(app.EventNames.regexPatternChanged2, previous.pattern, pattern, parseId);
                            }
                            catch (_k) { }
                    }
                    if (this._parseId === parseId)
                        try {
                            this.$rootScope.$broadcast(app.EventNames.regexPatternChanged2, previous.pattern, pattern, parseId);
                        }
                        catch (_l) { }
                }
            }
            const svc = this;
            this.supplantingTask.start(this._taskId, function (resolve, reject) {
                try {
                    svc.$rootScope.$broadcast(app.EventNames.startRegexPatternParse2, pattern, flags, parseId);
                }
                catch (_a) { }
                if (parseId !== svc._parseId)
                    reject({
                        pattern: pattern,
                        flags: flags,
                        operationCanceled: true,
                        previous: previous,
                        reason: 'Operation canceled'
                    });
                else if (typeof arg0 === 'string') {
                    try {
                        resolve({
                            pattern: pattern,
                            flags: flags,
                            regex: new RegExp(pattern),
                            previous: previous
                        });
                    }
                    catch (e) {
                        reject({
                            pattern: pattern,
                            flags: flags,
                            previous: previous,
                            reason: e
                        });
                    }
                }
                else
                    resolve({
                        pattern: pattern,
                        flags: flags,
                        regex: arg0,
                        previous: previous
                    });
            }).then(function (result) {
                if (parseId === svc._parseId) {
                    svc._hasFault = svc._isParsing = false;
                    svc._faultReason = undefined;
                    svc._regex = result.regex;
                    if (typeof arg0 === 'string' || result.regex.source !== previous.regex.source ||
                        result.regex.global !== previous.regex.global || result.regex.ignoreCase !== previous.regex.ignoreCase ||
                        result.regex.multiline !== previous.regex.multiline || result.regex.unicode !== previous.regex.unicode ||
                        result.regex.sticky !== previous.regex.sticky)
                        try {
                            svc.$rootScope.$broadcast(app.EventNames.regexObjectChanged2, previous.regex, result.regex, parseId);
                        }
                        catch (_a) { }
                    try {
                        svc.$rootScope.$broadcast(app.EventNames.regexPatternParseSuccess, result, parseId);
                    }
                    catch (_b) { }
                    try {
                        svc.$rootScope.$broadcast(app.EventNames.endRegexPatternParse2, result, parseId);
                    }
                    catch (_c) { }
                }
                else {
                    try {
                        svc.$rootScope.$broadcast(app.EventNames.regexPatternParseSuccess, result, parseId);
                    }
                    catch (_d) { }
                    try {
                        svc.$rootScope.$broadcast(app.EventNames.endRegexPatternParse2, {
                            pattern: pattern,
                            flags: flags,
                            operationCanceled: true,
                            previous: previous,
                            reason: 'Operation canceled'
                        }, parseId);
                    }
                    catch (_e) { }
                }
            }, function (result) {
                if (parseId === svc._parseId) {
                    svc._isParsing = false;
                    if (!svc.isParseCancel(result)) {
                        svc._hasFault = true;
                        svc._faultReason = result.reason;
                        try {
                            svc.$rootScope.$broadcast(app.EventNames.regexPatternParseError2, result, parseId);
                        }
                        catch (_a) { }
                    }
                }
                try {
                    svc.$rootScope.$broadcast(app.EventNames.endRegexPatternParse2, result, parseId);
                }
                catch (_b) { }
            });
            return this._regex;
        }
        regex(value) {
            if (typeof value === 'object' && value !== null && value instanceof RegExp)
                this.startPatternParse(value);
            return this._regex;
        }
        isParseSuccess(result) {
            return typeof result.regex === 'object';
        }
        isParseCancel(result) {
            return result.operationCanceled === true;
        }
        onRegexFlagsChanged($scope, callbackFn, thisObj) {
            if (arguments.length < 3) {
                $scope.$on(app.EventNames.regexFlagsChanged2, callbackFn);
            }
            else {
                $scope.$on(app.EventNames.regexFlagsChanged2, (event, oldValue, newValue) => {
                    callbackFn.call(thisObj, event, oldValue, newValue);
                });
            }
        }
        onRegexPatternChanged($scope, callbackFn, thisObj) {
            if (arguments.length < 3)
                $scope.$on(app.EventNames.regexPatternChanged2, callbackFn);
            else
                $scope.$on(app.EventNames.regexPatternChanged2, (event, oldValue, newValue) => {
                    callbackFn.call(thisObj, event, oldValue, newValue);
                });
        }
        onStartRegexPatternParse($scope, callbackFn, thisObj) {
            if (arguments.length < 3)
                $scope.$on(app.EventNames.startRegexPatternParse2, callbackFn);
            else
                $scope.$on(app.EventNames.startRegexPatternParse2, (event, pattern, flags) => {
                    callbackFn.call(thisObj, event, pattern, flags);
                });
        }
        onRegexObjectChanged($scope, callbackFn, thisObj) {
            if (arguments.length < 3)
                $scope.$on(app.EventNames.regexObjectChanged2, callbackFn);
            else
                $scope.$on(app.EventNames.regexObjectChanged2, (event, oldValue, newValue) => {
                    callbackFn.call(thisObj, event, oldValue, newValue);
                });
        }
        onRegexPatternParseError($scope, callbackFn, thisObj) {
            if (arguments.length < 3)
                $scope.$on(app.EventNames.regexPatternParseError2, callbackFn);
            else
                $scope.$on(app.EventNames.regexPatternParseError2, (event, result) => {
                    callbackFn.call(thisObj, event, result);
                });
        }
        onRegexPatternParseSuccess($scope, callbackFn, thisObj) {
            if (arguments.length < 3)
                $scope.$on(app.EventNames.regexPatternParseSuccess, callbackFn);
            else
                $scope.$on(app.EventNames.regexPatternParseSuccess, (event, result) => {
                    callbackFn.call(thisObj, event, result);
                });
        }
        onEndRegexPatternParse($scope, callbackFn, thisObj) {
            if (arguments.length < 3)
                $scope.$on(app.EventNames.endRegexPatternParse2, callbackFn);
            else
                $scope.$on(app.EventNames.endRegexPatternParse2, (event, result, isAborted) => {
                    callbackFn.call(thisObj, event, result, isAborted);
                });
        }
    }
    regexTester.RegexParserService = RegexParserService;
    function isParseOperationSuccess(value) {
        return typeof value.regex !== 'undefined';
    }
    class RegexController {
        constructor($scope, regexParser, pageLocationService, subTitle) {
            this.$scope = $scope;
            this.regexParser = regexParser;
            pageLocationService.pageTitle('Regular Expression Evaluator', subTitle);
            regexParser.onRegexFlagsChanged($scope, this.onRegexFlagsChanged, this);
            regexParser.onStartRegexPatternParse($scope, this.onStartRegexPatternParse, this);
            regexParser.onEndRegexPatternParse($scope, this.onEndRegexPatternParse, this);
            $scope.isParsing = regexParser.isParsing();
            $scope.flags = regexParser.flags().flags;
            if (regexParser.hasFault())
                this.setError(regexParser.faultReason());
            else {
                $scope.showParseError = false;
                $scope.parseErrorMessage = '';
            }
        }
        get global() { return this.regexParser.global(); }
        set global(value) { this.regexParser.global(value); }
        get ignoreCase() { return this.regexParser.ignoreCase(); }
        set ignoreCase(value) { this.regexParser.ignoreCase(value); }
        get multiline() { return this.regexParser.multiline(); }
        set multiline(value) { this.regexParser.multiline(value); }
        get unicode() { return this.regexParser.unicode(); }
        set unicode(value) { this.regexParser.unicode(value); }
        get sticky() { return this.regexParser.sticky(); }
        set sticky(value) { this.regexParser.sticky(value); }
        get pattern() { return this.regexParser.pattern(); }
        set pattern(value) { this.regexParser.pattern(value); }
        setError(reason) {
            switch (typeof reason) {
                case 'undefined':
                    break;
                case 'object':
                    if (reason !== null) {
                        this.setError(JSON.stringify(reason));
                        return;
                    }
                    break;
                case 'string':
                    if ((this.$scope.parseErrorMessage = reason.trim()).length > 0) {
                        this.$scope.showParseError = true;
                        return;
                    }
                    break;
                default:
                    this.setError(JSON.stringify(reason));
                    return;
            }
            this.setError('Unknown parse failure.');
        }
        onRegexFlagsChanged(event, oldValue, newValue) {
            this.$scope.flags = this.regexParser.flags().flags;
        }
        onStartRegexPatternParse(event, pattern, flags) {
            this.$scope.showParseError = false;
            this.$scope.isParsing = this.regexParser.isParsing();
        }
        onEndRegexPatternParse(event, result) {
            this.$scope.isParsing = this.regexParser.isParsing();
            if (this.regexParser.hasFault()) {
                this.$scope.showParseError = true;
                this.setError(this.regexParser.faultReason());
            }
            else {
                this.$scope.showParseError = false;
                this.$scope.parseErrorMessage = '';
            }
        }
        $doCheck() { }
    }
    regexTester.RegexController = RegexController;
    class RegexMatchController extends RegexController {
        constructor($scope, regexParser, pageLocationService) {
            super($scope, regexParser, pageLocationService, 'Match');
            this[Symbol.toStringTag] = app.ControllerNames.regexMatch;
            pageLocationService.regexHref(app.NavPrefix + app.ModulePaths.regexMatch);
        }
    }
    regexTester.RegexMatchController = RegexMatchController;
    class RegexReplaceController extends RegexController {
        constructor($scope, regexParser, pageLocationService) {
            super($scope, regexParser, pageLocationService, 'Replace');
            this[Symbol.toStringTag] = app.ControllerNames.regexMatch;
            pageLocationService.regexHref(app.NavPrefix + app.ModulePaths.regexReplace);
        }
    }
    regexTester.RegexReplaceController = RegexReplaceController;
    class RegexSplitController extends RegexController {
        constructor($scope, regexParser, pageLocationService) {
            super($scope, regexParser, pageLocationService, 'Split');
            this[Symbol.toStringTag] = app.ControllerNames.regexMatch;
            pageLocationService.regexHref(app.NavPrefix + app.ModulePaths.regexSplit);
        }
    }
    regexTester.RegexSplitController = RegexSplitController;
    app.mainModule.controller(app.ControllerNames.regexMatch, ['$scope', app.ServiceNames.regexParser, app.ServiceNames.pageLocation, RegexMatchController])
        .controller(app.ControllerNames.regexReplace, ['$scope', app.ServiceNames.regexParser, app.ServiceNames.pageLocation, RegexReplaceController])
        .controller(app.ControllerNames.regexSplit, ['$scope', app.ServiceNames.regexParser, app.ServiceNames.pageLocation, RegexSplitController])
        .service(app.ServiceNames.regexParser, RegexParserService);
})(regexTester || (regexTester = {}));
//# sourceMappingURL=regexTester.js.map