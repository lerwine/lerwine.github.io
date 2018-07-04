'use strict';

module bp {
    angular.module('bp', []).controller('exampleController', controller1);

    controller1.$inject = ['$scope'];

    function controller1($scope: { [key: string]: any }) {
        $scope.title = 'exampleController';
        
        $scope.firstName = 'Leonard';
        $scope.lastName = 'Erwine';

        activate();

        function activate() { }
    }
}


