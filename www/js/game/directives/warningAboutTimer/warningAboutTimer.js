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
            timeStep: '&',
            play: '&'
        },
        template: "<audio><source src=\"{{getAudioUrl()}}\" type=\"audio/mpeg\">" +
            "Your browser does not support the audio tag. " +
            "</audio>",
        link: function (scope, element) {
            scope.getAudioUrl = function () {
                return $sce.trustAsResourceUrl('audio/' + scope.play().track);
            };

            var clearWatchingTime = scope.$watch('time', function (millisec) {
                if (millisec / timeAccelerated.current() < parseInt(scope.play().inSecond) * scope.timeStep()) {
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
            timeStep: '&',
            warn: '&'
        },
        link: function (scope, element) {
            var clearWatchingTime = scope.$watch('time', function (millisec) {
                if (millisec / timeAccelerated.current() < parseInt(scope.warn().inSecond) * scope.timeStep()) {
                    clearWatchingTime();
                    element.addClass('play-warning');
                }
            });
        }
    }
}]);
