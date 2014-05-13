/**
 * @module mustard.game.elementVisibility
 *
 * Set visibility mode for UI element depending on ownShip object state.
 */

angular.module('mustard.game.elementVisibility', [])

.directive('showElement', function () {
    return {
        restrict: 'A',
        controller: function ($scope, $element, $attrs) {
            if ($scope.ownShip[$attrs.showElement]()) {
                $element.removeClass('ng-hide');
            } else {
                $element.addClass('ng-hide');
            }
        }
    }
})
.directive('hideElement', function () {
    return {
        restrict: 'A',
        controller: function ($scope, $element, $attrs) {
            if ($scope.ownShip[$attrs.hideElement]()) {
                $element.addClass('ng-hide');
            } else {
                $element.removeClass('ng-hide');
            }
        }
    }
});