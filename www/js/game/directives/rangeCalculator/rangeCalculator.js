angular.module('mustard.game.rangeCalculatorDirective', [])

    .directive('rangeCalculator', ['$timeout', function ($timeout) {
        return {
            restrict: 'EA',
            scope: {
                ownship: '='
            },
            templateUrl: 'js/game/directives/rangeCalculator/rangeCalculator.tpl.html',
            link: function (scope) {

            }
        }
            ;
    }])
;