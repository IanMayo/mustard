angular.module('subtrack90.game.timeRemainingDirective', ['subtrack90.game.geoMath'])

.directive('timeRemaining',  ['geoMath', function (geoMath) {
    return {
        restrict: 'EA',
        scope: {
            remaining: '='
        },
        templateUrl: 'js/game/directives/timeRemaining/timeRemaining.tpl.html',
        link: function (scope) {
            scope.remainingTime = function () {
                return geoMath.formatMillis(scope.remaining);
            };
        }
    };
}]);
