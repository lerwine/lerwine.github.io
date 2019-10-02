/// <reference path="../Scripts/typings/jquery/jquery.d.ts"/>
/// <reference path="../Scripts/typings/angularjs/angular.d.ts"/>
/// <reference path="app.ts"/>
var accordionGroup;
(function (accordionGroup) {
    ;
    // #region <accordion-group:container></accordion-group:container>
    accordionGroup.PREFIX_accordionGroup = "accordionGroup";
    accordionGroup.DIRECTIVENAME_accordionGroupContainer = accordionGroup.PREFIX_accordionGroup + "Container";
    /**
     * Controller automatically given to the accordionGroup directive, which manages the visibility of child elements that have the accordionGroupContentItem directive.
     *
     * @export
     * @class AccordionGroupController
     */
    class AccordionGroupController {
        constructor() {
            this._state = [];
            this._current = undefined;
        }
        find(name) { return this._state.filter((value) => value.name === name); }
        get(id) {
            if (this._state.length > 0) {
                let result = this._state.find((value) => value.id == id);
                if (typeof result === "object" && result !== null)
                    return result;
            }
        }
        /**
         * Registers a callback function to be called when the visibility of a target element changes.
         *
         * @param {string} name - Specifies the target element, which will have an accordion-group-content-item attribute (accordionGroupContentItem directive) matching this value.
         * @param {IShowHideCallback} showHideCallback - The callback function to invoke.
         * @param {*} [state] - Optional state value that will be included when showHideCallback is invoked.
         * @returns {number} - The unique identifier assigned to the callback function just registered. This value will be provided if you wish to unregister the notification callback.
         * @memberof AccordionGroupController
         */
        add(name, showHideCallback, state) {
            if (typeof name !== "string")
                name = "";
            let id = this._state.length;
            if (this._state.length > 0) {
                while (typeof (this.get(id)) !== "undefined")
                    id--;
            }
            this._state.push({ id: id, callback: showHideCallback, name: name, state: state });
            if (this._state.length == 1) {
                this._current = name;
                showHideCallback(true, state);
            }
            else
                showHideCallback(this._current === name, state);
            return id;
        }
        /**
         * Un-registers a callback function so it will no longer be called when the visibility of the target element changes.
         *
         * @param {number} id - The unique identifer that was returned from the add method.
         * @returns {boolean} - true if the callback function was un-registered; otherwise, false if no callback is registered with the specified id.
         * @memberof AccordionGroupController
         */
        remove(id) {
            let index = this._state.findIndex((value) => value.id == id);
            let item;
            if (index == 0)
                item = this._state.shift();
            else if (index == this._state.length - 1)
                item = this._state.pop();
            else if (index > 0)
                item = this._state.splice(index, 1)[0];
            else
                return false;
            if (this._current == item.name && this._state.length > 0 && this.find(item.name).length == 0)
                this.show(this._state[0].name);
            return true;
        }
        /**
         * Shows the element whose accordion-group-content-item attribute (accordionGroupContentItem directive) matching the specified name.
         *
         * @param {string} name - The accordion-group-content-item attribute to match.
         * @memberof AccordionGroupController
         */
        show(name) {
            if (typeof name !== "string")
                name = "";
            if (name === this._current)
                return;
            let toHide = (this._state.length == 0 || (typeof this._current !== "string")) ? [] : this.find(this._current);
            let toShow = this.find(name);
            if (toShow.length == 0)
                return;
            toHide.forEach((item) => item.callback(false, item.state));
            this._current = name;
            toShow.forEach((item) => item.callback(true, item.state));
        }
        /**
         * Hides the element whose accordion-group-content-item attribute (accordionGroupContentItem directive) matching the specified name.
         *
         * @param {string} name - The accordion-group-content-item attribute to match.
         * @memberof AccordionGroupController
         */
        hide(name) {
            if (typeof name !== "string")
                name = "";
            if (name !== this._current || this._state.length == 0)
                return;
            this._current = undefined;
            this.find(name).forEach((toHide) => toHide.callback(false, toHide.state));
        }
        /**
         * Toggles the visibility of the element whose accordion-group-content-item attribute (accordionGroupContentItem directive) matching the specified name.
         *
         * @param {string} name - The accordion-group-content-item attribute to match.
         * @memberof AccordionGroupController
         */
        toggle(name) {
            if (typeof name !== "string")
                name = "";
            if (name === this._current)
                this.hide(name);
            else
                this.show(name);
        }
    }
    accordionGroup.AccordionGroupController = AccordionGroupController;
    app.mainModule.directive(accordionGroup.DIRECTIVENAME_accordionGroupContainer, () => ({
        restrict: "E",
        controller: ["$scope", AccordionGroupController],
        transclude: true,
        template: '<ng-transclude></ng-transclude>'
    }));
    // #endregion
    // #region accordion-group:content
    accordionGroup.DIRECTIVENAME_accordionGroupContent = accordionGroup.PREFIX_accordionGroup + "Content";
    app.mainModule.directive(accordionGroup.DIRECTIVENAME_accordionGroupContent, () => ({
        require: "^^" + accordionGroup.DIRECTIVENAME_accordionGroupContainer,
        restrict: "A",
        transclude: true,
        template: '<ng-transclude></ng-transclude>',
        link: (scope, element, instanceAttributes, controller) => {
            let id = controller.add(instanceAttributes.accordionGroupContentItem, (show) => {
                if (show)
                    element.show();
                else
                    element.hide();
            });
            element.on("$destory", () => controller.remove(id));
        }
    }));
    // #endregion
    // #region accordion-group:toggle-on-click
    accordionGroup.DIRECTIVENAME_accordionGroupToggleOnClick = accordionGroup.PREFIX_accordionGroup + "ToggleOnClick";
    app.mainModule.directive(accordionGroup.DIRECTIVENAME_accordionGroupToggleOnClick, () => ({
        require: "^^" + accordionGroup.DIRECTIVENAME_accordionGroupContainer,
        restrict: "A",
        transclude: true,
        template: '<ng-transclude></ng-transclude>',
        link: (scope, element, instanceAttributes, controller) => {
            element.on("click", () => controller.toggle(instanceAttributes.accordionGroupToggleOnClick));
        }
    }));
    // #endregion
    // #region <accordion-group-toggle-button item-id="" expanded-class="" collapsed-class=""></accordion-group-toggle-button>
    accordionGroup.DIRECTIVENAME_accordionGroupToggleButton = accordionGroup.PREFIX_accordionGroup + "ToggleButton";
    /**
     *
     *
     * @export
     * @class AccordionGroupToggleButtonController
     * @implements {ng.IController}
     */
    class AccordionGroupToggleButtonController {
        constructor($scope) {
            this.$scope = $scope;
            this._callbacks = [];
            this._isShown = false;
        }
        /**
         *
         *
         * @readonly
         * @type {boolean}
         * @memberof AccordionGroupToggleButtonController
         */
        get isShown() { return this._isShown; }
        get(id) {
            if (this._callbacks.length > 0) {
                let result = this._callbacks.find((value) => value.id == id);
                if (typeof result === "object" && result !== null)
                    return result;
            }
        }
        /**
         *
         *
         * @param {IAccordionGroupToggleButtonCallback} callbackFn
         * @returns {number}
         * @memberof AccordionGroupToggleButtonController
         */
        addOnShowHide(callbackFn) {
            let id = this._callbacks.length;
            if (this._callbacks.length > 0) {
                while (typeof (this.get(id)) !== "undefined")
                    id--;
            }
            this._callbacks.push({ id: id, cb: callbackFn });
            callbackFn(this._isShown);
            return id;
        }
        /**
         *
         *
         * @param {number} id
         * @returns {boolean}
         * @memberof AccordionGroupToggleButtonController
         */
        removeOnShowHide(id) {
            let index = this._callbacks.findIndex((value) => value.id == id);
            let item;
            if (index == 0)
                item = this._callbacks.shift();
            else if (index == this._callbacks.length - 1)
                item = this._callbacks.pop();
            else if (index > 0)
                item = this._callbacks.splice(index, 1)[0];
            else
                return false;
            return true;
        }
        static directiveLink(scope, element, instanceAttributes, controller) {
            let expandedClass = [];
            let collapsedClass = [];
            let s;
            if ((typeof instanceAttributes.class === "string") && (s = instanceAttributes.class.trim()).length > 0) {
                expandedClass = s.split(/\s+/);
                collapsedClass = s.split(/\s+/);
            }
            if ((typeof instanceAttributes.expandedClass === "string") && (s = instanceAttributes.expandedClass.trim()).length > 0)
                expandedClass = expandedClass.concat(s.split(/\s+/));
            if ((typeof instanceAttributes.collapsedClass === "string") && (s = instanceAttributes.collapsedClass.trim()).length > 0)
                collapsedClass = collapsedClass.concat(s.split(/\s+/));
            scope.isShown = false;
            let id = controller.add(instanceAttributes.itemId, (show) => {
                scope.accordionGroupToggleButtonController._isShown = show;
                scope.accordionGroupToggleButtonController._callbacks.forEach((item) => item.cb(show));
                scope.isShown = show;
                if (show) {
                    collapsedClass.forEach((n) => {
                        if (element.hasClass(n))
                            element.removeClass(n);
                    });
                    expandedClass.forEach((n) => {
                        if (!element.hasClass(n))
                            element.addClass(n);
                    });
                    if (typeof scope.onAccordionItemExpanded === "function")
                        scope.onAccordionItemExpanded();
                }
                else {
                    expandedClass.forEach((n) => {
                        if (element.hasClass(n))
                            element.removeClass(n);
                    });
                    collapsedClass.forEach((n) => {
                        if (!element.hasClass(n))
                            element.addClass(n);
                    });
                    if (typeof scope.onAccordionItemCollapsed === "function")
                        scope.onAccordionItemCollapsed();
                }
            });
            element.on("click", () => controller.toggle(instanceAttributes.itemId));
            element.on("$destory", () => controller.remove(id));
        }
        static getDirective() {
            return {
                restrict: "E",
                transclude: true,
                controllerAs: "accordionGroupToggleButtonController",
                controller: ["$scope", AccordionGroupToggleButtonController],
                require: "^^" + accordionGroup.DIRECTIVENAME_accordionGroupContainer,
                scope: { itemId: "@", onAccordionItemExpanded: "&?", onAccordionItemCollapsed: "&?" },
                link: AccordionGroupToggleButtonController.directiveLink,
                template: '<button onclick="return false;" ng-transclude></button>'
            };
        }
        $doCheck() { }
    }
    accordionGroup.AccordionGroupToggleButtonController = AccordionGroupToggleButtonController;
    app.mainModule.directive(accordionGroup.DIRECTIVENAME_accordionGroupToggleButton, () => AccordionGroupToggleButtonController.getDirective());
    // #endregion
    // #region <accordion-group-button-text expanded-text="" collapsed-text="" expanded-class="" collapsed-class="" />
    accordionGroup.DIRECTIVENAME_accordionGroupButtonText = accordionGroup.PREFIX_accordionGroup + "ButtonText";
    function AccordionGroupButtonTextLink(scope, element, instanceAttributes, controller) {
        let expandedClass = [];
        let collapsedClass = [];
        let s;
        if ((typeof instanceAttributes.class === "string") && (s = instanceAttributes.class.trim()).length > 0) {
            expandedClass = s.split(/\s+/);
            collapsedClass = s.split(/\s+/);
        }
        if ((typeof instanceAttributes.expandedClass === "string") && (s = instanceAttributes.expandedClass.trim()).length > 0)
            expandedClass = expandedClass.concat(s.split(/\s+/));
        if ((typeof instanceAttributes.collapsedClass === "string") && (s = instanceAttributes.collapsedClass.trim()).length > 0)
            collapsedClass = collapsedClass.concat(s.split(/\s+/));
        let id = controller.addOnShowHide((newValue) => {
            if (newValue) {
                element.text((typeof instanceAttributes.expandedText === "string") ? instanceAttributes.expandedText : "");
                collapsedClass.forEach((n) => {
                    if (element.hasClass(n))
                        element.removeClass(n);
                });
                expandedClass.forEach((n) => {
                    if (!element.hasClass(n))
                        element.addClass(n);
                });
            }
            else {
                element.text((typeof instanceAttributes.collapsedText === "string") ? instanceAttributes.collapsedText : "");
                expandedClass.forEach((n) => {
                    if (element.hasClass(n))
                        element.removeClass(n);
                });
                collapsedClass.forEach((n) => {
                    if (!element.hasClass(n))
                        element.addClass(n);
                });
            }
        });
        element.on("$destory", () => controller.removeOnShowHide(id));
    }
    app.mainModule.directive(accordionGroup.DIRECTIVENAME_accordionGroupButtonText, () => ({
        require: "^^" + accordionGroup.DIRECTIVENAME_accordionGroupToggleButton,
        restrict: "E",
        link: AccordionGroupButtonTextLink,
        template: '<span></span>'
    }));
    // #endregion
    // #region <accordion-group:when-button-expanded></accordion-group:when-button-expanded>
    accordionGroup.DIRECTIVENAME_accordionGroupWhenButtonExpanded = accordionGroup.PREFIX_accordionGroup + "WhenButtonExpanded";
    app.mainModule.directive(accordionGroup.DIRECTIVENAME_accordionGroupWhenButtonExpanded, () => ({
        require: "^^" + accordionGroup.DIRECTIVENAME_accordionGroupToggleButton,
        restrict: "E",
        transclude: true,
        template: '<ng-transclude></ng-transclude>',
        link: (scope, element, instanceAttributes, controller) => {
            let id = controller.addOnShowHide((newValue) => {
                if (newValue)
                    element.show();
                else
                    element.hide();
            });
            element.on("$destory", () => controller.removeOnShowHide(id));
        }
    }));
    // #endregion
    // #region <accordion-group:when-button-collapsed></accordion-group:when-button-collapsed>
    accordionGroup.DIRECTIVENAME_accordionGroupWhenButtonCollapsed = accordionGroup.PREFIX_accordionGroup + "WhenButtonCollapsed";
    app.mainModule.directive(accordionGroup.DIRECTIVENAME_accordionGroupWhenButtonCollapsed, () => ({
        require: "^^" + accordionGroup.DIRECTIVENAME_accordionGroupToggleButton,
        restrict: "E",
        transclude: true,
        template: '<ng-transclude></ng-transclude>',
        link: (scope, element, instanceAttributes, controller) => {
            let id = controller.addOnShowHide((newValue) => {
                if (newValue)
                    element.hide();
                else
                    element.show();
            });
            element.on("$destory", () => controller.removeOnShowHide(id));
        }
    }));
    // #endregion
    // #region <accordion-group:button-image expanded-src="" collapsed-src="" expanded-alt="" collapsed-alt="" expanded-class="" collapsed-class=""></accordion-group:button-image>
    accordionGroup.DIRECTIVENAME_accordionGroupButtonImage = accordionGroup.PREFIX_accordionGroup + "ButtonImage";
    function AccordionGroupButtonImageLink(scope, element, instanceAttributes, controller) {
        let expandedClass = [];
        let collapsedClass = [];
        let s;
        if ((typeof instanceAttributes.class === "string") && (s = instanceAttributes.class.trim()).length > 0) {
            expandedClass = s.split(/\s+/);
            collapsedClass = s.split(/\s+/);
        }
        if ((typeof instanceAttributes.expandedClass === "string") && (s = instanceAttributes.expandedClass.trim()).length > 0)
            expandedClass = expandedClass.concat(s.split(/\s+/));
        if ((typeof instanceAttributes.collapsedClass === "string") && (s = instanceAttributes.collapsedClass.trim()).length > 0)
            collapsedClass = collapsedClass.concat(s.split(/\s+/));
        function onShownCanged(newValue) {
        }
        let id = controller.addOnShowHide((newValue) => {
            if (newValue) {
                if (typeof (instanceAttributes.expandedSrc) === "string")
                    element.attr("src", instanceAttributes.expandedSrc);
                else
                    element.removeAttr("src");
                if (typeof (instanceAttributes.expandedAlt) === "string")
                    element.attr("alt", instanceAttributes.expandedAlt);
                else
                    element.removeAttr("alt");
                collapsedClass.forEach((n) => {
                    if (element.hasClass(n))
                        element.removeClass(n);
                });
                expandedClass.forEach((n) => {
                    if (!element.hasClass(n))
                        element.addClass(n);
                });
            }
            else {
                if (typeof (instanceAttributes.collapsedSrc) === "string")
                    element.attr("src", instanceAttributes.collapsedSrc);
                else
                    element.removeAttr("src");
                if (typeof (instanceAttributes.collapsedAlt) === "string")
                    element.attr("alt", instanceAttributes.collapsedAlt);
                else
                    element.removeAttr("alt");
                expandedClass.forEach((n) => {
                    if (element.hasClass(n))
                        element.removeClass(n);
                });
                collapsedClass.forEach((n) => {
                    if (!element.hasClass(n))
                        element.addClass(n);
                });
            }
        });
        element.on("$destory", () => controller.removeOnShowHide(id));
    }
    app.mainModule.directive(accordionGroup.DIRECTIVENAME_accordionGroupButtonImage, () => ({
        require: "^^" + accordionGroup.DIRECTIVENAME_accordionGroupToggleButton,
        restrict: "E",
        link: AccordionGroupButtonImageLink,
        template: '<img />'
    }));
    // #endregion
})(accordionGroup || (accordionGroup = {}));
//# sourceMappingURL=accordionGroup.js.map