/// <reference path="Scripts/typings/jquery/jquery.d.ts"/>
/// <reference path="Scripts/typings/angularjs/angular.d.ts"/>
/// <reference path="app.ts"/>
var contentRegion;
(function (contentRegion) {
    // #region <content-region></content-region>
    ;
    class ContentRegionController {
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
                showHideCallback(true);
            }
            else
                showHideCallback(this._current === name);
            return id;
        }
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
        show(name) {
            if (typeof name !== "string")
                name = "";
            if (name === this._current)
                return;
            let toHide = (this._state.length == 0 || (typeof this._current !== "string")) ? [] : this.find(this._current);
            let toShow = this.find(name);
            if (toShow.length == 0)
                return;
            toHide.forEach((item) => item.callback(false));
            this._current = name;
            toShow.forEach((item) => item.callback(true));
        }
        hide(name) {
            if (typeof name !== "string")
                name = "";
            if (name !== this._current || this._state.length == 0)
                return;
            this._current = undefined;
            this.find(name).forEach((toHide) => toHide.callback(false));
        }
        toggle(name) {
            if (typeof name !== "string")
                name = "";
            if (name === this._current)
                this.hide(name);
            else
                this.show(name);
        }
    }
    app.mainModule.directive("accordionGroup", () => ({
        restrict: "E",
        controller: ["$scope", ContentRegionController],
        transclude: true,
        template: '<ng-transclude></ng-transclude>'
    }));
    // #endregion
})(contentRegion || (contentRegion = {}));
//# sourceMappingURL=contentRegion.js.map