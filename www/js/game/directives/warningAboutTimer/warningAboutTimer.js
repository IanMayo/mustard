/**
 * @module subtrack90.game.warningAboutTimer
 */

angular.module('subtrack90.game.warningAboutTimer', ['subtrack90.game.timeDisplayDirective'])

.directive('soundAtSecond', ['$sce', 'timeAccelerated',
    function ($sce, timeAccelerated) {
    return {
        restrict: 'EA',
        replace: true,
        scope: {
            time: '=',
            second: '@',
            src: '@'
        },
        template: "<audio><source src=\"{{getAudioUrl()}}\" type=\"audio/mpeg\">" +
            "Your browser does not support the audio tag. " +
            "</audio>",
        link: function (scope, element) {
            scope.getAudioUrl = function () {
                return $sce.trustAsResourceUrl('audio/' + scope.src);
            };

            var clearWatchingTime = scope.$watch('time', function (millisec) {
                if (millisec / timeAccelerated.current() < parseInt(scope.second) * 1000) {
                    clearWatchingTime();
                    element[0].play();
                }
            });
        }
    }
}])

.directive('warningBackground', ['timeAccelerated', function (timeAccelerated) {
    return {
        restrict: 'EA',
        scope: {
            time: '=',
            second: '@'
        },
        link: function (scope, element) {
            var clearWatchingTime = scope.$watch('time', function (millisec) {
                if (millisec / timeAccelerated.current() < parseInt(scope.second) * 1000) {
                    clearWatchingTime();
                    element.addClass('play-warning');
                }
            });
        }
    }
}]);
