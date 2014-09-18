/**
 * @module subtrack90.game.warningAboutTimer
 */

angular.module('subtrack90.game.warningAboutTimer', ['subtrack90.game.timeDisplayDirective'])

.directive('soundAtSecond', ['$sce', 'timeAccelerated', '$interval',
    function ($sce, timeAccelerated, $interval) {
    return {
        restrict: 'EA',
        replace: true,
        scope: {
            time: '=',
            timeStep: '@',
            second: '@',
            src: '@'
        },
        template: "<div><audio><source src=\"{{getAudioUrl()}}\" type=\"audio/mpeg\">" +
            "Your browser does not support the audio tag. " +
            "</audio><span class=\"label label-warning\" style='margin-left: 10px'>{{countdownLabel}}</span></div>",
        link: function (scope, element) {
            scope.getAudioUrl = function () {
                return $sce.trustAsResourceUrl('audio/' + scope.src);
            };

            scope.countdownLabel = 'Wait alarm sound...';

            var clearWatchingTime = scope.$watch('time', function (millisec) {
                if (millisec / timeAccelerated.current() < parseInt(scope.second) * parseInt(scope.timeStep)) {
                    clearWatchingTime();
                    element.children()[0].play();
                    countdown();
                }
            });

            var countdown = function () {
                var startValue = parseInt(scope.second);
                scope.countdownLabel = startValue;

                var interval = $interval(function () {
                    startValue = startValue - 1;
                    scope.countdownLabel = startValue;
                    if (!scope.countdownLabel) {
                        $interval.cancel(interval);
                    }
                }, 1000);
            }
        }
    }
}])

.directive('warningBackground', ['timeAccelerated', function (timeAccelerated) {
    return {
        restrict: 'EA',
        scope: {
            time: '=',
            timeStep: '@',
            second: '@'
        },
        link: function (scope, element) {
            var clearWatchingTime = scope.$watch('time', function (millisec) {
                if (millisec / timeAccelerated.current() < parseInt(scope.second) * parseInt(scope.timeStep)) {
                    clearWatchingTime();
                    element.addClass('play-warning');
                }
            });
        }
    }
}]);
