/// <reference path="Scripts/typings/jquery/jquery.d.ts"/>
/// <reference path="Scripts/typings/angularjs/angular.d.ts"/>
/// <reference path="app.ts"/>
var colorBuilder;
(function (colorBuilder) {
    class ColorBuilderController {
        constructor($scope) {
            this.$scope = $scope;
        }
        $doCheck() {
        }
    }
    app.module.controller("ColorBuilderController", ["$scope", ColorBuilderController]);
})(colorBuilder || (colorBuilder = {}));
//# sourceMappingURL=ColorBuilderController.js.map