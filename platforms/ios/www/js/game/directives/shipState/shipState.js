angular.module('subtrack90.game.shipStateDirective', ['subtrack90.game.shipControlsDirective'])

.directive('shipState', ['KNOTS_IN_MPS', function (KNOTS_IN_MPS) {
    return {
        restrict: 'EA',
        scope: {
            course: '=',
            speed: '=',
            name: '@'
        },
        templateUrl: 'js/game/directives/shipState/shipState.tpl.html',
        link: function (scope) {

            /**
             * Return onwship in knots.
             *
             * @returns {Number} speed in knots
             */
            scope.knotsSpeed = function () {
                return scope.speed * KNOTS_IN_MPS;
            }
        }
    };
}]);
