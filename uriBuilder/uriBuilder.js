var uriBuilder;
(function (uriBuilder) {
    class UriBuilderPageController {
        constructor() {
            this[Symbol.toStringTag] = app.ControllerNames.uriBuilder;
        }
        controller($scope) {
        }
        $doCheck() { }
    }
    uriBuilder.UriBuilderPageController = UriBuilderPageController;
    app.mainModule.controller(app.ControllerNames.uriBuilder, ['$scope', UriBuilderPageController]);
})(uriBuilder || (uriBuilder = {}));
//# sourceMappingURL=uriBuilder.js.map