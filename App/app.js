/// <reference path="Scripts/typings/jquery/jquery.d.ts"/>
/// <reference path="Scripts/typings/angularjs/angular.d.ts"/>
/// <reference path="Scripts/typings/angularjs/angular-route.d.ts"/>
/// <reference path="sys.ts"/>
var app;
(function (app) {
    /**
    * The main module for this app.
    *
    * @type {ng.IModule}
    */
    app.mainModule = angular.module("mainModule", []);
    const schemeParseRe = /^(?:([^:@\\\/]+)(:(?:\/\/?)?)|(:\/\/?))/;
    /**
     *
     *
     * @param {INavigationLinkConfig[]} [pages]
     * @returns {INavigationLink[]}
     */
    function sanitizeNavigationLinks(pages) {
        if (typeof (pages) === "undefined" || pages === null)
            return [];
        if (typeof (pages) !== "object" || !Array.isArray(pages))
            return [{ href: "#", text: "(invalid configuration data)", disabled: true, links: [], cssClass: ["nav-item", "disabled"], onClick: () => { return false; } }];
        return pages.filter(sys.notNil).map((item) => {
            if (typeof (item) !== "object")
                return { href: "#", text: "(invalid configuration data)", disabled: true, links: [], cssClass: ["nav-item", "disabled"], onClick: () => { return false; } };
            if (sys.isNilOrWhiteSpace(item.href)) {
                item.href = "#";
                item.disabled = true;
            }
            if (item.disabled)
                return { href: item.href, text: item.text, disabled: true, links: sanitizeNavigationLinks(item.links), cssClass: ["nav-item", "disabled"], onClick: () => { return false; } };
            return { href: item.href, text: item.text, disabled: false, links: sanitizeNavigationLinks(item.links), cssClass: ["nav-item"], onClick: () => { return true; } };
        });
    }
    class applicationConfigurationLoaderService {
        constructor($http, $q) {
            this.$http = $http;
            this.$q = $q;
            this._response = $http.get('appConfig.json').then((httpResult) => {
                return $q((resolve, reject) => {
                    if (typeof (httpResult.data) !== "object" || httpResult.data === null || typeof (httpResult.data.links) !== "object" || httpResult.data.links == null || !Array.isArray(httpResult.data.links))
                        reject("Invalid response");
                    else
                        resolve({
                            links: sanitizeNavigationLinks(httpResult.data.links),
                            status: httpResult.status,
                            statusText: httpResult.statusText
                        });
                });
            }, (errorReason) => {
                if (typeof (errorReason) === "undefined" || errorReason === "null")
                    return new Error("Unexpected failure");
                if (typeof errorReason === "string")
                    return new Error(errorReason);
                if (errorReason instanceof Error)
                    return errorReason;
                let message = ((typeof errorReason.message === "string") ? errorReason.message :
                    ((typeof errorReason.message !== "undefined" && errorReason.message !== null) ? errorReason.message : "")).trim();
                return {
                    message: (message.length == 0) ? "Unexpected Error" : message,
                    data: errorReason,
                };
            });
        }
        then(successCallback, errorCallback) {
            return this._response.then(successCallback, errorCallback);
        }
    }
    app.mainModule.service("applicationConfigurationLoader", ["$http", "$q", applicationConfigurationLoaderService]);
    // #endregion
    /**
     * Loads application configuration from file.
     *
     * @class applicationConfigurationLoader
     * @implements {ng.IPromise<IAppConfigLoadResult>}
     */
    class applicationConfigurationLoaderOld {
        /**
         *
         *
         * @template TResult
         * @param {((promiseValue: IAppConfigLoadResult) => TResult | ng.IPromise<TResult>)} successCallback
         * @param {(reason: any) => any} [errorCallback]
         * @param {(state: any) => any} [notifyCallback]
         * @returns {ng.IPromise<TResult>}
         * @memberof applicationConfigurationLoader
         */
        then(successCallback, errorCallback, notifyCallback) {
            return this._get.then(successCallback, errorCallback, notifyCallback);
        }
        /**
         *
         *
         * @template TResult
         * @param {((reason: any) => TResult | ng.IPromise<TResult>)} onRejected
         * @returns {ng.IPromise<TResult>}
         * @memberof applicationConfigurationLoader
         */
        catch(onRejected) { return this._get.catch(onRejected); }
        /**
         *
         *
         * @param {() => any} finallyCallback
         * @returns {ng.IPromise<IAppConfigLoadResult>}
         * @memberof applicationConfigurationLoader
         */
        finally(finallyCallback) { return this._get.finally(finallyCallback); }
        /**
         *Creates an instance of applicationConfigurationLoader.
         * @param {ng.IHttpService} $http
         * @memberof applicationConfigurationLoader
         */
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
            }, (reason) => { return { requestInfo: { statusText: sys.asString(reason, "Unknown error") }, links: [] }; });
        }
    }
    /**
     *
     *
     * @param {INavigationLink[]} links
     * @param {string} pageId
     * @returns
     */
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
    /**
     *
     *
     * @class TopNavController
     * @implements {ng.IController}
     */
    class TopNavController {
        /**
         *Creates an instance of TopNavController.
         * @param {ITopNavScope} $scope
         * @memberof TopNavController
         */
        constructor($scope) {
            this.$scope = $scope;
            let controller = this;
            $scope.initializeTopNav = (pageId, loader) => { return controller.initializeTopNav(pageId, loader); };
        }
        $doCheck() { }
        /**
         *
         *
         * @param {string} pageId
         * @param {applicationConfigurationLoader} loader
         * @memberof TopNavController
         */
        initializeTopNav(pageId, loader) {
            loader.then((result) => {
                this.$scope.links = result.links;
                if (sys.isNilOrWhiteSpace(pageId))
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
    app.mainModule.directive('topNavAndHeader', ['applicationConfigurationLoader', (navLoader) => {
            return {
                restrict: "E",
                scope: {},
                controller: ["$scope", TopNavController],
                link: (scope, element, attributes, controller) => {
                    scope.headerText = attributes.headerText;
                    navLoader.then((promiseValue) => {
                        scope.initializeTopNav(attributes.pageName, navLoader);
                    });
                }
            };
        }]);
})(app || (app = {}));
//# sourceMappingURL=app.js.map