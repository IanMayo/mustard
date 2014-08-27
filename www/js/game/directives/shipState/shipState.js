angular.module('subtrack90.game.shipStateDirective', [])

.directive('shipState', function () {
    return {
        restrict: 'EA',
        scope: {
            course: '=',
            speed: '=',
            name: '@'
        },
        templateUrl: 'js/game/directives/shipState/shipState.tpl.html',
        link: function (scope) {

        }
    };
});
