/**
 * @module mustard.game.blockVisibility
 *
 * Set visibility mode for UI blocks depends on ownship state.
 */

angular.module('mustard.game.blockVisibility', [])

.directive('showBlock', function () {
    return {
        restrict: 'A',
        controller: function ($scope, $element, $attrs) {
            if ($scope.ownShip[$attrs.showBlock]()) {
                $element.removeClass('ng-hide');
            } else {
                $element.addClass('ng-hide');
            }
        }
    }
})
.directive('hideBlock', function () {
    return {
        restrict: 'A',
        controller: function ($scope, $element, $attrs) {
            if ($scope.ownShip[$attrs.hideBlock]()) {
                $element.addClass('ng-hide');
            } else {
                $element.removeClass('ng-hide');
            }
        }
    }
});