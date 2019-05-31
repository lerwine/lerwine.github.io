var app = angular.module('app', []);

app.controller('RegexTest', function($scope) {
    $scope.regexOptionsAreVisible = false;
    $scope.regexPattern = $scope.$new(true);
    $scope.regexPattern.text = '\p{L}';
    $scope.regexPattern.isParsed = false;
    $scope.regexPattern.re = null;
    $scope.regexPattern.autoExec = false;
    $scope.regexPattern.optionsText = '';
    $scope.inputText = '';
    $scope.fullInputText = '';
    $scope.specialCharacter = $scope.$new(true);
    $scope.specialCharacter.value = 0;
    $scope.specialCharacter.availableOptions = [
        { id: 0, text: "None (no special character)" },
        { id: 1, text: "Prepend" },
        { id: 2, text: "Append" },
        { id: 3, text: "Insert" }
    ];
    $scope.specialCharacter.noValue = true;
    $scope.specialCharacter.selectedOption = 0;
    $scope.result = $scope.$new(true);
    $scope.result.isEvaluated = false;
    $scope.result.success = false;
    $scope.result.class = [];
    $scope.result.message = '';
    $scope.result.pattern = '';
    $scope.result.index = -1;
    $scope.result.beforeMatch = '';
    $scope.result.groups = [];
    $scope.result.afterMatch = '';
    $scope.regexOptions = $scope.$new(true);
    $scope.editOptions = $scope.$new(true);
    $scope.regexOptions.isGlobal = $scope.editOptions.isGlobal = false;
    $scope.regexOptions.caseInsensitive = $scope.editOptions.caseInsensitive = false;
    $scope.regexOptions.multiLine = $scope.editOptions.multiLine = false;
    $scope.regexOptions.newLineMatch = $scope.editOptions.newLineMatch = false;
    $scope.regexOptions.sticky = $scope.editOptions.sticky = false;
    $scope.regexOptions.unicode = $scope.editOptions.unicode = false;
    $scope.regexOptions.ignoreSpace = $scope.editOptions.ignoreSpace = false;
    $scope.updateInputText = function() {

    };
    $scope.updatePattern = function() {

    };
    $scope.executeRegex = function() {

    };
    $scope.showRegexOptions = function() {
        $('#regexOptionsModal').modal('show');
        $scope.regexOptionsAreVisible = true;
    };
    $scope.hideRegexOptions = function() {
        $('#regexOptionsModal').modal('hide');
        $scope.regexOptionsAreVisible = false;
    };
    $scope.acceptRegexOptions = function() {
        $scope.regexOptions.isGlobal = $scope.editOptions.isGlobal;
        $scope.regexOptions.caseInsensitive = $scope.editOptions.caseInsensitive;
        $scope.regexOptions.multiLine = $scope.editOptions.multiLine;
        $scope.regexOptions.newLineMatch = $scope.editOptions.newLineMatch;
        $scope.regexOptions.sticky = $scope.editOptions.sticky;
        $scope.regexOptions.unicode = $scope.editOptions.unicode;
        $scope.regexOptions.ignoreSpace = $scope.editOptions.ignoreSpace;
        $('#regexOptionsModal').modal('hide');
        $scope.regexOptionsAreVisible = false;
        $scope.updatePattern();
    };
    $scope.cancelRegexOptions = function() {
        $('#regexOptionsModal').modal('hide');
        $scope.regexOptionsAreVisible = false;
        $scope.editOptions.isGlobal = $scope.regexOptions.isGlobal;
        $scope.editOptions.caseInsensitive = $scope.regexOptions.isGlobal;
        $scope.editOptions.multiLine = $scope.regexOptions.isGlobal;
        $scope.editOptions.newLineMatch = $scope.regexOptions.isGlobal;
        $scope.editOptions.sticky = $scope.regexOptions.isGlobal;
        $scope.editOptions.unicode = $scope.regexOptions.unicode;
        $scope.editOptions.ignoreSpace = $scope.regexOptions.ignoreSpace;
    };
});
