/**
 * @module subtrack90.game.elementVisibility
 *
 * Set visibility mode for UI element depending on ownShip object state.
 */

angular.module('subtrack90.game.elementVisibility', [])

.directive('conditionalDisplay', ['$parse', function ($parse) {

    return {
        restrict: 'A',

        controller: function ($scope, $element, $attrs) {

            var conditionals = $parse($attrs.conditionalDisplay)();
            var displayMode = _.keys(conditionals).toString();
            var condition = conditionals[displayMode];
            var isLocked = !!$scope.$eval(condition);

            if (displayMode === 'lock') {
                isLocked = !isLocked;
            }

            /**
             * Add lock overlay block to the specific element to show user
             * that he could get in future if he'll be a good boy
             */
            var addLockOverlay = function () {
                $element.addClass('lock-target');

                $(document.createElement('div'))
                    .addClass('lock-overlay').prependTo($element);
            };

            /**
             * Remove lock overlay block from target element
             */
            var removeLockOverlay = function () {
                $element.removeClass('lock-target');

                $($element[0]).find('.lock-overlay').remove();
            };

            $scope.$evalAsync(function () {
                isLocked ? removeLockOverlay() : addLockOverlay();
            });
        }
    }
}]);
