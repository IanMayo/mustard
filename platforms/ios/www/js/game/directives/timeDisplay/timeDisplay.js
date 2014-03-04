angular.module('mustard.game.timeDisplayDirective', [])

.constant('timeDisplayConfig', {
    initialSimulationSpeed: 1, // 1x
    initialTimerLabel: '01:00:00'
})

.directive('timeDisplay', ['timeDisplayConfig', function (timeDisplayConfig) {
    return {
        restrict : 'EA',
        scope: {
            timer: '=',
            speed: '='
        },
        templateUrl: 'js/game/directives/timeDisplay/timeDisplay.tpl.html',
        link: function (scope) {

            /**
             * Simulation speed trigger
             * @type {Number}
             */
            var oldSpeedState = timeDisplayConfig.initialSimulationSpeed;

            scope.timerLabel = timeDisplayConfig.initialTimerLabel;

            /**
             * Update timer label when simulation times changes
             */
            scope.$watch('timer', function (newVal) {
                if (newVal) {
                    var date = new Date(newVal);
                    scope.timerLabel = date.toLocaleTimeString();
                }
            });

            /**
             * Start/pause simulation process.
             */
            scope.simulate = function () {
                if (scope.speed) {
                    // save current speed
                    oldSpeedState = scope.speed;
                    scope.speed = 0;
                } else {
                    scope.speed = oldSpeedState;
                }
            };

            /**
             * Increase simulation process speed.
             */
            scope.faster = function () {
                scope.speed *= 2;
            };

            /**
             * Decrease simulation process speed.
             */
            scope.slower = function () {
                if (scope.speed >= 2) {
                    scope.speed /= 2;
                }
            };
        }
    };
}]);