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
            var warningIsActive = false;

            scope.getAudioUrl = function () {
                return $sce.trustAsResourceUrl('audio/' + scope.play().track);
            };

            scope.$watch('time', function (millisec, oldVal) {
                if (oldVal > millisec) {
                    // play warning sound for a new time-out
                    if (false === warningIsActive &&
                        millisec / timeAccelerated.current() < parseInt(scope.play().inSecond) * scope.timeStep()) {
                        // play warning sound once for the time-out
                        element[0].play();
                        warningIsActive = true;
                    }
                } else {
                    // next time-out alarm was added
                    warningIsActive = false;
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
            var warningIsActive = false;

            scope.$watch('time', function (millisec, oldVal) {
                if (oldVal > millisec) {
                    // show warning background for a new time-out
                    if (false === warningIsActive &&
                        millisec / timeAccelerated.current() < parseInt(scope.warn().inSecond) * scope.timeStep()) {
                        // show warning only once for the time-out
                        element.addClass('play-warning');
                        warningIsActive = true;
                    }
                } else {
                    // next time-out alarm was added
                    warningIsActive = false;
                    if (element.hasClass('play-warning')) {
                        // Remove warning background what was shown for previous time-out
                        element.removeClass('play-warning');
                    }
                }
            });
        }
    }
}]);
