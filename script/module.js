'use strict';
var bp;
(function (bp) {
    angular.module('bp', []).controller('exampleController', controller1);
    controller1.$inject = ['$scope'];
    function controller1($scope) {
        $scope.title = 'exampleController';
        $scope.firstName = 'Leonard';
        $scope.lastName = 'Erwine';
        activate();
        function activate() { }
    }
})(bp || (bp = {}));
