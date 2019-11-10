var colorBuilder;
(function (colorBuilder) {
    class ColorBuilderPageController {
        constructor() {
            this[Symbol.toStringTag] = app.ControllerNames.colorBuilder;
        }
        controller($scope) {
        }
        $doCheck() { }
    }
    colorBuilder.ColorBuilderPageController = ColorBuilderPageController;
    app.mainModule.controller(app.ControllerNames.colorBuilder, ['$scope', ColorBuilderPageController]);
})(colorBuilder || (colorBuilder = {}));
//# sourceMappingURL=colorBuilder.js.map