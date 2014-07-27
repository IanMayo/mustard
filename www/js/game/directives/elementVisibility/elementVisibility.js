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
            var isDisplayed = !!$scope.$eval(condition);

            if (displayMode === 'hide' || displayMode === 'lock') {
                isDisplayed = !isDisplayed;
            }

            /**
             * Show or hide the element depending on isDisplayed condition
             */
            var showElement = function () {
                isDisplayed ? $element.removeClass('ng-hide') : $element.addClass('ng-hide');
            };

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

            /**
             * It locks or unlocks the target element (it seems that it is almost always UI controls)
             * depending on isDisplayed value
             */
            var lockElement = function () {
                $scope.$evalAsync(function () {
                    isDisplayed ? removeLockOverlay() : addLockOverlay();
                });
            };

            // Choose the proper action depending on displayMode value
            // TODO: maybe it should support 2 or more actions at one time?
            switch (displayMode) {
                case 'show':
                case 'hide':
                    showElement();
                    break;

                case 'unlock':
                case 'lock':
                    lockElement();
                    break;
            }
        }
    }
}]);
