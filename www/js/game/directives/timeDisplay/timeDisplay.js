angular.module('subtrack90.game.timeDisplayDirective', [])

.constant('timeDisplayConfig', {
    initialAccelRate: 16,
    initialTimerLabel: '01:00:00'
})

.factory('timeAccelerated', ['timeDisplayConfig', function (timeDisplayConfig) {
    var accelerating;
        
    return {
        init: function () {
            accelerating = timeDisplayConfig.initialAccelRate;
        },
        update: function (value) {
            accelerating = value;
        },
        current: function () {
            return accelerating;
        }
    }
}])

.factory('steppingControls', function () {
    var steppingEnabled = true;

    return {
        setVisibility: function (mode) {
            steppingEnabled = mode;
        },
        visibility: function () {
            return steppingEnabled;
        }
    };
})

.directive('timeDisplay', ['timeDisplayConfig', '$interval', 'steppingControls', 'timeAccelerated', 'hotkeys',
    function (timeDisplayConfig, $interval, steppingControls, timeAccelerated, hotkeys) {
    return {
        restrict :'EA',
        scope: {
            timer: '=',
            timeStep: '=',
            timerPaused: '='
        },
        templateUrl: 'js/game/directives/timeDisplay/timeDisplay.tpl.html',
        link: function (scope) {

            /**
             * Simulation speed trigger
             * @type {Number}
             */
            var oldSpeed = 0;
            
            /**
             * Simulation time trigger
             * @type {Number}
             */
            var oldTimer = 0;

            /**
             * Simulation interval trigger
             * @type {Object}
             */
            var simulationIntervalId;

            /**
             * Increase or restore simulation timer value.
             * We need restore the value if simulation process was stopped (gameState.simulationTime = 0)
             * according to scenario conditions and user wishes continue the process.
             */
            var changeSimulationTimer = function () {
                if (oldTimer) {
                    // restore simulation timer
                    scope.timer = oldTimer;
                    oldTimer = 0;
                }
                scope.timer += scope.timeStep;
            };

            /**
             * Change simulation interval
             */
            var watchSpeedChanges = function () {
                scope.$watch('speed', function (newVal) {
                    $interval.cancel(simulationIntervalId);

                    if (newVal) {
                        // do play
                        simulationIntervalId = $interval(changeSimulationTimer, 1000 / scope.speed);
                        timeAccelerated.update(scope.speed);
                    }
                });
            };

            timeAccelerated.init();

            if (scope.timerPaused) {
                // Set time display to "pause" state on start
                scope.speed = 0;
                oldSpeed = timeAccelerated.current();
            } else {
                scope.speed = timeAccelerated.current();
            }

            scope.timerLabel = timeDisplayConfig.initialTimerLabel;
            scope.steppingEnabled = steppingControls.visibility();

            /**
             * Update timer label when simulation times changes
             */
            scope.$watch('timer', function (newVal, oldVal) {
                var dateString = newVal || oldVal;
                var date;

                if (dateString) {
                    date = new Date(dateString);
                    scope.timerLabel = date.toLocaleTimeString();
                }

                if (!newVal && oldVal) {
                    // reset simulation speed
                    scope.speed = 0;
                    // and save timer value. Then we can restart process 'safely'.
                    oldTimer = oldVal;
                }
            });

            /**
             * Start/pause simulation process.
             */
            scope.simulate = function () {
                if (scope.speed) {
                    // save current speed
                    oldSpeed = scope.speed;
                    scope.speed = 0;
                } else {
                    scope.speed = oldSpeed;
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

            /**
             * Callback when scope of the directive destroys
             */
            scope.$on('$destroy', function () {
                // clear the interval object
                $interval.cancel(simulationIntervalId);
            });

            if (scope.steppingEnabled) {
                watchSpeedChanges();
            } else {
                changeSimulationTimer();
            }

            hotkeys.bindTo(scope)
                .add({
                    combo: 'space',
                    description: 'Play / Pause',
                    callback: function () {scope.simulate();}
                })
                .add({
                    combo: '-',
                    description: 'Decrease game speed',
                    callback: function () {scope.slower();}
                })
                .add({
                    combo: '=',
                    description: 'Increase game speed',
                    callback: function () {scope.faster();}
                });
        }
    };
}]);
