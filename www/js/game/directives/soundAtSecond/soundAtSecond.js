/**
 * @module subtrack90.game.soundAtSecond
 */

angular.module('subtrack90.game.soundAtSecond', [])

.directive('soundAtSecond',  ['$sce', function ($sce) {
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

            var clearWatchingAlarmSound = scope.$watch('time', function (millisec) {
                if (millisec < parseInt(scope.second) * 1000) {
                    clearWatchingAlarmSound();
                    element[0].play();
                }
            });
        }
    }
}]);
