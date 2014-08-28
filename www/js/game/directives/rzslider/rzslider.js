/**
 * @module subtrack90.game.rzslider
 *
 * Memory leaks fixes in the rzslider directive from rzModule lib.
 */

angular.module('subtrack90.game.rzslider', [])

.directive('rzslider', ['$document', function ($document) {
    return {
        restrict: 'E',
        link: function (scope, elem) {
            var isolatedScope = angular.element(elem).isolateScope();

            isolatedScope.$on('$destroy', function () {
                // remove event handlers
                angular.element(window).off('resize');
                $document.off('touchmove touchend mousemove mouseup');

                // Remove handlers form the first pointer element <span class="pointer"></span>.
                // Handlers aren't removed  from the second pointer element (see rzslider directive template)
                // because slider is configured without "rz-slider-high" attribute
                angular.element(angular.element(elem).children()[1]).off('mousedown touchstart');
            });
        }
    }
}]);
