/**
 * @module mustard.game.elementVisibility
 *
 * Set visibility mode for UI element depending on ownShip object state.
 */

angular.module('mustard.game.elementVisibility', [])

.directive('showElement', ['$parse', function ($parse) {
    return {
        restrict: 'A',
        controller: function ($scope, $element, $attrs) {
            var condition = $parse($attrs.showElement)().condition;
            if ($scope.$eval(condition)) {
                $element.removeClass('ng-hide');
            } else {
                $element.addClass('ng-hide');
            }
        }
    }
}])
.directive('hideElement', ['$parse', function ($parse) {
    return {
        restrict: 'A',
        controller: function ($scope, $element, $attrs) {
            var condition = $parse($attrs.hideElement)().condition;
            if ($scope.$eval(condition)) {
                $element.addClass('ng-hide');
            } else {
                $element.removeClass('ng-hide');
            }
        }
    }
}]);