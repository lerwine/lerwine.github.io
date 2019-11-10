var app;
(function (app) {
    app.ModuleNames = {
        app: 'MyGitHubPages', regexTester: 'MyGitHubPages.regexTester', uriBuilder: 'MyGitHubPages.uriBuilder',
        colorBuilder: 'MyGitHubPages.colorBuilder'
    };
    app.ModulePaths = {
        home: '/home', git: '/git', vscode: '/vscode', npm: '/npm', regexMatch: '/regex/match', regexReplace: '/regex/replace',
        regexSplit: '/regex/split', uriBuilder: '/uri', colorBuilder: '/color'
    };
    app.ControllerNames = {
        mainContent: 'mainContentController', staticPage: 'staticPageController', regexMatch: 'regexMatchController',
        regexReplace: 'regexReplaceController', regexSplit: 'regexSplitController', uriBuilder: 'uriBuilderPageController',
        colorBuilder: 'colorBuilderPageController'
    };
    app.ServiceNames = {
        supplantablePromiseChain: 'supplantablePromiseChainService', pageLocation: 'pageLocationService',
        mainNavigationProvider: 'mainNavigationProvider', regexParser: 'regexParser'
    };
    app.EventNames = {
        setPageTitle: 'MyGitHubPages.setPageTitle', topNavChanged: 'MyGitHubPages.topNavChanged',
        regexPatternChanged2: 'MyGitHubPages.regexPatternChanged', regexFlagsChanged2: 'MyGitHubPages.regexFlagsChanged',
        startRegexPatternParse2: 'MyGitHubPages.startRegexPatternParse', endRegexPatternParse2: 'MyGitHubPages.endRegexPatternParse',
        regexPatternParseError2: 'MyGitHubPages.regexPatternParseError', regexPatternParseSuccess: 'MyGitHubPages.regexPatternParseSuccess',
        regexObjectChanged2: 'MyGitHubPages.regexObjectChanged'
    };
    app.HashPrefix = '!';
    app.NavPrefix = '#!';
    class PromiseChainSupersededError extends Error {
        constructor(message) { super(message); }
    }
    app.PromiseChainSupersededError = PromiseChainSupersededError;
    class SupplantableChainPromise {
        constructor(_promise, arg1, arg2) {
            this._promise = _promise;
            this._instanceId = Symbol();
            if (typeof arg1 === 'symbol') {
                this._taskId = arg1;
                this._chainId = Symbol();
                this._supplantableTaskService = arg2;
            }
            else {
                this._taskId = arg1._taskId;
                this._supplantableTaskService = arg1._supplantableTaskService;
                if (typeof arg2 !== 'symbol')
                    this._chainId = Symbol();
                else {
                    this._chainId = arg2;
                    if (arg2 === arg1._chainId)
                        return;
                }
            }
        }
        IsSameTask(arg0) {
            return this._taskId === ((typeof arg0 === 'symbol') ? arg0 : arg0._taskId);
        }
        isSameChain(arg0) {
            return this._chainId === ((typeof arg0 === 'symbol') ? arg0 : arg0._chainId);
        }
        then(successCallback, errorCallback, notifyCallback, thisArg) {
            const task = this;
            const hasThis = arguments.length > 3;
            if (typeof notifyCallback === 'function') {
                if (typeof errorCallback === 'function')
                    return new SupplantableChainPromise(this._promise.then(function (promiseValue) {
                        if (task._supplantableTaskService.isSuperceded(task))
                            throw new PromiseChainSupersededError();
                        if (hasThis) {
                            if (arguments.length == 0)
                                return successCallback.call(thisArg);
                            return successCallback.call(thisArg, promiseValue);
                        }
                        if (arguments.length == 0)
                            return successCallback();
                        return successCallback(promiseValue);
                    }, function (reason) {
                        if (hasThis) {
                            if (arguments.length == 0)
                                return errorCallback.call(thisArg);
                            return errorCallback.call(thisArg, reason);
                        }
                        if (arguments.length == 0)
                            return errorCallback();
                        return errorCallback(reason);
                    }, function (state) {
                        if (hasThis) {
                            if (arguments.length == 0)
                                return notifyCallback.call(thisArg);
                            return notifyCallback.call(thisArg, state);
                        }
                        if (arguments.length == 0)
                            return notifyCallback();
                        return notifyCallback(state);
                    }), this, this._chainId);
                return new SupplantableChainPromise(this._promise.then(function (promiseValue) {
                    if (task._supplantableTaskService.isSuperceded(task))
                        throw new PromiseChainSupersededError();
                    if (hasThis) {
                        if (arguments.length == 0)
                            return successCallback.call(thisArg);
                        return successCallback.call(thisArg, promiseValue);
                    }
                    if (arguments.length == 0)
                        return successCallback();
                    return successCallback(promiseValue);
                }, undefined, function (state) {
                    if (hasThis) {
                        if (arguments.length == 0)
                            return notifyCallback.call(thisArg);
                        return notifyCallback.call(thisArg, state);
                    }
                    if (arguments.length == 0)
                        return notifyCallback();
                    return notifyCallback(state);
                }), this, this._chainId);
            }
            if (typeof errorCallback === 'function')
                return new SupplantableChainPromise(this._promise.then(function (promiseValue) {
                    if (task._supplantableTaskService.isSuperceded(task))
                        throw new PromiseChainSupersededError();
                    if (hasThis) {
                        if (arguments.length == 0)
                            return successCallback.call(thisArg);
                        return successCallback.call(thisArg, promiseValue);
                    }
                    if (arguments.length == 0)
                        return successCallback();
                    return successCallback(promiseValue);
                }, function (reason) {
                    if (hasThis) {
                        if (arguments.length == 0)
                            return errorCallback.call(thisArg);
                        return errorCallback.call(thisArg, reason);
                    }
                    if (arguments.length == 0)
                        return errorCallback();
                    return errorCallback(reason);
                }), this, this._chainId);
            return new SupplantableChainPromise(this._promise.then(function (promiseValue) {
                if (task._supplantableTaskService.isSuperceded(task))
                    throw new PromiseChainSupersededError();
                if (hasThis) {
                    if (arguments.length == 0)
                        return successCallback.call(thisArg);
                    return successCallback.call(thisArg, promiseValue);
                }
                if (arguments.length == 0)
                    return successCallback();
                return successCallback(promiseValue);
            }), this, this._chainId);
        }
        thenCall(successCallback, arg1, arg2, thisArg) {
            if (arguments.length > 3)
                return this.then(successCallback, arg1, arg2, thisArg);
            if (arguments.length == 3)
                return this.then(successCallback, arg1, undefined, arg2);
            return this.then(successCallback, undefined, undefined, arg1);
        }
        catch(onRejected, thisArg) {
            const task = this;
            if (arguments.length > 1)
                return new SupplantableChainPromise(this._promise.catch(function (reason) {
                    return onRejected.call(thisArg, reason);
                }), this, this._chainId);
            return new SupplantableChainPromise(this._promise.catch(function (reason) {
                return onRejected(reason);
            }), this, this._chainId);
        }
        finally(finallyCallback, thisArg) {
            const task = this;
            if (arguments.length > 1)
                return new SupplantableChainPromise(this._promise.finally(function () {
                    return finallyCallback.call(thisArg, task._supplantableTaskService.isSuperceded(task));
                }), this, this._chainId);
            return new SupplantableChainPromise(this._promise.finally(function () {
                return finallyCallback(task._supplantableTaskService.isSuperceded(task));
            }), this, this._chainId);
        }
    }
    app.SupplantableChainPromise = SupplantableChainPromise;
    class SupplantablePromiseChainService {
        constructor($q, $interval) {
            this.$q = $q;
            this.$interval = $interval;
            this._tasks = [];
            this[Symbol.toStringTag] = app.ServiceNames.supplantablePromiseChain;
        }
        isSuperceded(promise) {
            for (let i = 0; i < this._tasks.length; i++) {
                if (this._tasks[i].IsSameTask(promise))
                    return !this._tasks[i].isSameChain(promise);
            }
            return false;
        }
        start(taskId, resolver, thisArg) {
            if (arguments.length > 2)
                return this.startDelayed(taskId, resolver, 0, thisArg);
            return this.startDelayed(taskId, resolver, 0);
        }
        startDelayed(taskId, resolver, delay, thisArg) {
            const deferred = this.$q.defer();
            const svc = this;
            const hasThis = arguments.length > 3;
            if (isNaN(delay))
                delay = 0;
            this.$interval(function () {
                const resolve = function (value) {
                    if (arguments.length == 0)
                        deferred.resolve();
                    else
                        deferred.resolve(value);
                };
                const reject = function (reason) {
                    if (arguments.length == 0)
                        deferred.reject();
                    else
                        deferred.reject(reason);
                };
                const notify = function (state) {
                    if (arguments.length == 0)
                        deferred.notify();
                    else
                        deferred.notify(state);
                };
                if (hasThis)
                    return resolver.call(thisArg, resolve, reject, notify);
                return resolver(resolve, reject, notify);
            }, delay, 1, true);
            let result;
            for (let i = 0; i < this._tasks.length; i++) {
                if (this._tasks[i].IsSameTask(taskId)) {
                    result = new SupplantableChainPromise(deferred.promise, this._tasks[i]);
                    this._tasks[i] = result;
                    return result;
                }
            }
            result = new SupplantableChainPromise(deferred.promise, taskId, this);
            this._tasks.push(result);
            return result;
        }
    }
    app.SupplantablePromiseChainService = SupplantablePromiseChainService;
    class PageLocationService {
        constructor($rootScope) {
            this._pageTitle = 'Lenny\'s GitHub Repositories';
            this._pageSubTitle = '';
            this._regexHref = app.NavPrefix + app.ModulePaths.regexMatch;
            this[Symbol.toStringTag] = app.ServiceNames.pageLocation;
            const svc = this;
            $rootScope.$on('$routeChangeSuccess', function (event, current) {
                switch (current.templateUrl) {
                    case 'home.htm':
                        svc.pageTitle('');
                        break;
                    case 'git.htm':
                        svc.pageTitle('GIT Cheat Sheet');
                        break;
                    case 'vscode.htm':
                        svc.pageTitle('VS Code Cheat Sheet');
                        break;
                    case 'npm.htm':
                        svc.pageTitle('NPM Cheat Sheet');
                        break;
                }
            });
        }
        static ConfigureRoutes($routeProvider) {
            $routeProvider.when(app.ModulePaths.home, {
                templateUrl: 'home.htm',
                controller: app.ControllerNames.staticPage
            }).when(app.ModulePaths.git, {
                templateUrl: 'git.htm',
                controller: app.ControllerNames.staticPage
            }).when(app.ModulePaths.vscode, {
                templateUrl: 'vscode.htm',
                controller: app.ControllerNames.staticPage
            }).when(app.ModulePaths.npm, {
                templateUrl: 'npm.htm',
                controller: app.ControllerNames.staticPage
            }).when(app.ModulePaths.regexMatch, {
                templateUrl: 'regexTester/match.htm',
                controller: app.ControllerNames.regexMatch
            }).when(app.ModulePaths.regexReplace, {
                templateUrl: 'regexTester/replace.htm',
                controller: app.ControllerNames.regexReplace
            }).when(app.ModulePaths.regexSplit, {
                templateUrl: 'regexTester/split.htm',
                controller: app.ControllerNames.regexSplit
            }).when(app.ModulePaths.uriBuilder, {
                templateUrl: 'uriBuilder/uriBuilder.htm',
                controller: app.ControllerNames.uriBuilder
            }).when(app.ModulePaths.colorBuilder, {
                templateUrl: 'colorBuilder/colorBuilder.htm',
                controller: app.ControllerNames.colorBuilder
            }).when('/', { redirectTo: app.ModulePaths.home });
        }
        regexHref(value) {
            if (typeof value === 'string') {
                if ((value = value.trim()).length > 0) {
                    this._regexHref = value;
                    if (typeof this._scope !== 'undefined')
                        this._scope.regexHref = this._regexHref;
                }
            }
            return this._regexHref;
        }
        pageTitle(value, subTitle) {
            if (typeof value === 'string') {
                this._pageTitle = ((value = value.trim()).length == 0) ? 'Lenny\'s GitHub Page' : value;
                this._pageSubTitle = (typeof subTitle === 'string') ? subTitle : '';
                if (typeof this._scope !== 'undefined') {
                    this._scope.pageTitle = this._pageTitle;
                    this._scope.showSubtitle = (this._scope.subTitle = this._pageSubTitle).length > 0;
                }
            }
            return this._pageTitle;
        }
        pageSubTitle(value) { return this._pageSubTitle; }
        setScope(scope) {
            if (typeof scope === 'object' && scope !== null) {
                (this._scope = scope).pageTitle = this._pageTitle;
                scope.showSubtitle = (scope.subTitle = this._pageSubTitle).trim().length > 0;
                this._scope.regexHref = this._regexHref;
            }
        }
    }
    app.PageLocationService = PageLocationService;
    class StaticPageController {
        constructor(pageLocationService, $location) {
            this[Symbol.toStringTag] = app.ControllerNames.staticPage;
            const path = $location.path();
            if (path == app.ModulePaths.git)
                pageLocationService.pageTitle('GIT Cheat Sheet');
            else if (path == app.ModulePaths.vscode)
                pageLocationService.pageTitle('VS Code Cheat Sheet');
            else if (path == app.ModulePaths.npm)
                pageLocationService.pageTitle('NPM Cheat Sheet');
            else
                pageLocationService.pageTitle('');
        }
        $doCheck() { }
    }
    app.StaticPageController = StaticPageController;
    class MainContentController {
        constructor($scope, pageLocationService) {
            this.$scope = $scope;
            this[Symbol.toStringTag] = app.ControllerNames.mainContent;
            const ctrl = this;
            $scope.regexHref = app.NavPrefix + app.ModulePaths.regexMatch;
            pageLocationService.setScope($scope);
        }
        $doCheck() { }
    }
    app.MainContentController = MainContentController;
    app.mainModule = angular.module(app.ModuleNames.app, ['ngRoute'])
        .config(['$locationProvider', '$routeProvider', function ($locationProvider, $routeProvider) {
            $locationProvider.hashPrefix(app.HashPrefix);
            PageLocationService.ConfigureRoutes($routeProvider);
        }])
        .service(app.ServiceNames.supplantablePromiseChain, ['$q', '$interval', SupplantablePromiseChainService])
        .service(app.ServiceNames.pageLocation, PageLocationService)
        .controller(app.ControllerNames.mainContent, ['$scope', app.ServiceNames.pageLocation, MainContentController]);
})(app || (app = {}));
//# sourceMappingURL=app.js.map