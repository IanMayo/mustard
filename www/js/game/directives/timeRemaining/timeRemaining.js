angular.module('mustard.game.timeRemainingDirective', [])

.directive('timeRemaining',  function () {
    return {
        restrict: 'EA',
        scope: {
            remaining: '='
        },
        templateUrl: 'js/game/directives/timeRemaining/timeRemaining.tpl.html',
        link: function (scope) {

        }
    };
});