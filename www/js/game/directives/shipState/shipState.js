angular.module('mustard.game.shipStateDirective', [])

.constant('shipStateConfig', {
    courseRate: 5.00,
    speed: {
        min: 0,
        max: 40,
        rate: 1
    }
})

.directive('shipState', ['shipStateConfig', function (shipStateConfig) {
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
}]);