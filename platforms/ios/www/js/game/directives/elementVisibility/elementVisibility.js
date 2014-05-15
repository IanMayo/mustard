/**
 * @module mustard.game.elementVisibility
 *
 * Set visibility mode for UI element depending on ownShip object state.
 */

angular.module('mustard.game.elementVisibility', [])

.directive('conditionalDisplay', ['$parse', function ($parse) {
    return {
        restrict: 'A',
        controller: function ($scope, $element, $attrs) {
            var conditionals = $parse($attrs.conditionalDisplay)();
            var displayMode = _.keys(conditionals).toString();
            var condition = conditionals[displayMode];
            var isVisible = $scope.$eval(condition);

            if ('hide' === displayMode) {
                isVisible = !isVisible;
            }

            if (isVisible) {
                $element.removeClass('ng-hide');
            } else {
                $element.addClass('ng-hide');
            }
        }
    }
}]);