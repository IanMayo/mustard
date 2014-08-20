angular.module('subtrack90.game.shipStateDirective', [])

.directive('shipState', function () {
    return {
        restrict: 'EA',
        scope: {
            course: '=',
            speed: '='
        },
        templateUrl: 'js/game/directives/shipState/shipState.tpl.html',
        link: function (scope) {

        }
    };
});
