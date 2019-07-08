/// <reference path="Scripts/typings/jquery/jquery.d.ts"/>
/// <reference path="Scripts/typings/bootstrap/index.d.ts" />
/// <reference path="Scripts/typings/angularjs/angular.d.ts"/>
/// <reference path="sys.ts"/>
/// <reference path="app.ts"/>
var textEditControl;
(function (textEditControl) {
    const WHITESPACE_REGEX = /[\s\r\n\p{C}]+/g;
    const NEWLINE_REGEX = /\r\n?|\n/g;
    const TABBABLE_REGEX = /^(?=\s*\S)/g;
    const UTTABBABLE_REGEX = /^( {1,4}|\t)/g;
    const TRAILINGWS_REGEX = /\s+$/g;
    class TextEditController {
        constructor($scope, $window, $log) {
            this.$scope = $scope;
            this.$window = $window;
            this.$log = $log;
            $scope.tws = sys.asBoolean($scope.trimWs, true);
            $scope.rowCount = (typeof $scope.rows !== "number" || isNaN($scope.rows) || $scope.rows < 1) ? 6 : $scope.rows;
            $scope.$watch("rows", (newValue, oldValue) => {
                $scope.rowCount = (typeof newValue !== "number" || isNaN(newValue) || newValue < 1) ? 6 : newValue;
            });
        }
        ensureSelectedText() {
            let start = this._textArea.selectionStart;
            let end = this._textArea.selectionEnd;
            if (start == end) {
                let text = this._textArea.value;
                let c;
                while (start > 0) {
                    c = text.substr(start - 1, 0);
                    if (c === "\r" || c === "\n")
                        break;
                    start--;
                }
                while (end < text.length) {
                    c = text.substr(end, 1);
                    if (c === "\r" || c === "\n")
                        break;
                    end++;
                }
                this._textArea.selectionStart = start;
                this._textArea.selectionEnd = end;
            }
        }
        cutSelected() {
            this.ensureSelectedText();
            this.$window.document.execCommand("cut");
        }
        copySelected() {
            this.ensureSelectedText();
            this.$window.document.execCommand("copy");
        }
        pasteOverSelected() { this.$window.document.execCommand("paste"); }
        deleteSelected() {
            this.ensureSelectedText();
            this.$window.document.execCommand("delete");
        }
        indentSelected() {
            let start = this._textArea.selectionStart;
            let end = this._textArea.selectionEnd;
            let text = this._textArea.value;
            if (start == end) {
                if (text.length === 0)
                    this._textArea.value = "\t";
                else if (start === 0)
                    this._textArea.value = "\t" + text;
                else if (start === text.length)
                    this._textArea.value = text + "\t";
                else
                    this._textArea.value = text.substr(0, start) + "\t" + text.substr(start);
                this._textArea.selectionStart = this._textArea.selectionEnd = start + 1;
            }
            else {
                let c;
                while (start > 0) {
                    c = text.substr(start - 1, 0);
                    if (c === "\r" || c === "\n")
                        break;
                    start--;
                }
                while (end < text.length) {
                    c = text.substr(end, 1);
                    if (c === "\r" || c === "\n")
                        break;
                    end++;
                }
                let untabbed = text.substr(start, end - start);
                let tabbed = text.replace(TABBABLE_REGEX, "\t");
                if (untabbed !== tabbed) {
                    end += tabbed.length - untabbed.length;
                    this._textArea.value = text.substr(0, start) + tabbed + text.substr(end);
                }
                this._textArea.selectionStart = start;
                this._textArea.selectionEnd = end;
            }
        }
        unindentSelected() {
            let start = this._textArea.selectionStart;
            let end = this._textArea.selectionEnd;
            let text = this._textArea.value;
            let c;
            while (start > 0) {
                c = text.substr(start - 1, 0);
                if (c === "\r" || c === "\n")
                    break;
                start--;
            }
            while (end < text.length) {
                c = text.substr(end, 1);
                if (c === "\r" || c === "\n")
                    break;
                end++;
            }
            let tabbed = text.substr(start, end - start);
            let untabbed = text.replace(UTTABBABLE_REGEX, "");
            if (untabbed !== tabbed) {
                end += tabbed.length - untabbed.length;
                this._textArea.value = text.substr(0, start) + tabbed + text.substr(end);
            }
            this._textArea.selectionStart = start;
            this._textArea.selectionEnd = end;
        }
        removeTrailingWhitespaceFromSelected() {
            let start = this._textArea.selectionStart;
            let end = this._textArea.selectionEnd;
            let text = this._textArea.value;
            let c;
            if (start === end) {
                c = text.replace(TRAILINGWS_REGEX, "");
                if (c === text)
                    return;
                this._textArea.value = c;
                this._textArea.selectionStart = 0;
                this._textArea.selectionEnd = c.length;
            }
            else {
                while (start > 0) {
                    c = text.substr(start - 1, 0);
                    if (c === "\r" || c === "\n")
                        break;
                    start--;
                }
                while (end < text.length) {
                    c = text.substr(end, 1);
                    if (c === "\r" || c === "\n")
                        break;
                    end++;
                }
                let untrimmed = text.substr(start, end - start);
                let trimmed = text.replace(TRAILINGWS_REGEX, "");
                if (untrimmed !== trimmed) {
                    this._textArea.value = text.substr(0, start) + trimmed + text.substr(end);
                    end = start + trimmed.length;
                }
                this._textArea.selectionStart = start;
                this._textArea.selectionEnd = end;
            }
        }
        deleteWordLeft() {
            let start = this._textArea.selectionStart;
            let end = this._textArea.selectionEnd;
            let text = this._textArea.value;
            if (start < 1)
                return;
            let deleteFrom = start - 1;
            let c = text.substr(deleteFrom, 1);
            if (c === "\n") {
                if (deleteFrom > 0 && text.substr(deleteFrom - 1, 1) === "\r")
                    deleteFrom--;
            }
            else {
                while (deleteFrom > 0 && (c === " " || c === "\t")) {
                    deleteFrom--;
                    c = text.substr(deleteFrom, 1);
                }
                while (deleteFrom > 0 && c !== " " && c !== "\t" && c !== "\r" && c !== "\n") {
                    deleteFrom--;
                    c = text.substr(deleteFrom, 1);
                }
            }
            deleteFrom = start - deleteFrom;
            this._textArea.value = text.substr(0, deleteFrom) + text.substr(start);
            this._textArea.selectionStart = start - deleteFrom;
            this._textArea.selectionEnd = end - deleteFrom;
        }
        onKeyDownAcceptSpecialKeys(event) {
            switch (event.keyCode) {
                //case 8: // Ctrl+BKSP
                //    if (event.altKey || event.metaKey || event.metaKey || !event.ctrlKey)
                //        return false;
                case 9: // TAB or Alt+TAB
                    if (event.altKey || event.ctrlKey || event.metaKey)
                        return;
                    if (event.shiftKey)
                        this.unindentSelected();
                    else
                        this.indentSelected();
                    break;
                //case 88: // Ctrl+X
                //    if (event.altKey || event.metaKey || event.metaKey || !event.ctrlKey)
                //        return false;
                //    break;
                //case 67: // Ctrl+C
                //    if (event.altKey || event.metaKey || event.metaKey || !event.ctrlKey)
                //        return false;
                //    break;
                //case 86: // Ctrl+V
                //    if (event.altKey || event.metaKey || event.metaKey || !event.ctrlKey)
                //        return false;
                //case 46: // Ctrl+DEL
                //    if (event.altKey || event.metaKey || event.metaKey || !event.ctrlKey)
                //        return false;
                //case 65: // Ctrl+A
                //    if (event.altKey || event.metaKey || event.metaKey || !event.ctrlKey)
                //        return false;
                default: // Ctrl+U; Ctrl+Alt+U
                    this.$log.info(angular.toJson({
                        keyCode: event.keyCode,
                        metaKey: event.metaKey,
                        altKey: event.altKey,
                        ctrlKey: event.ctrlKey,
                        shiftKey: event.shiftKey,
                        char: event.char,
                        charCode: event.charCode,
                        type: event.type
                    }));
                    return;
            }
            event.preventDefault();
            event.stopPropagation();
            return false;
        }
        static directiveLink($scope, element, attr) {
            if (!element.hasClass("custom-control"))
                element.addClass("custom-control");
            if (!element.hasClass("form-control-plaintext"))
                element.addClass("form-control-plaintext");
            $scope.textEdit._textArea = element.children("textarea")[0];
        }
        static createDirective() {
            return {
                restrict: "E",
                transclude: false,
                templateUrl: "Template/TextEditControl.htm",
                controller: ["$scope", "$window", "$log", TextEditController],
                controllerAs: "textEdit",
                scope: {
                    textBoxId: "@?textboxId",
                    text: "=model",
                    rows: "=?rowsExpr"
                },
                link: TextEditController.directiveLink
            };
        }
        $doCheck() { }
    }
    app.mainModule.directive("textEditControl", TextEditController.createDirective);
})(textEditControl || (textEditControl = {}));
//# sourceMappingURL=TextEditControl.js.map