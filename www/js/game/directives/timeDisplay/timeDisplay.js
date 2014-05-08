angular.module('mustard.game.timeDisplayDirective', [])

.constant('timeDisplayConfig', {
    initialSimulationSpeed: 1, // 1x,
    initialAccelRate: 16,
    initialTimerLabel: '01:00:00'
})

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

.directive('timeDisplay', ['timeDisplayConfig', '$interval', 'steppingControls', '$timeout',
    function (timeDisplayConfig, $interval, steppingControls, $timeout) {
    return {
        restrict :'EA',
        scope: {
            timer: '=',
            timeStep: '='
        },
        templateUrl: 'js/game/directives/timeDisplay/timeDisplay.tpl.html',
        link: function (scope) {

            function uiPart(params) {
                var defaults = {
                    uiUpdateInterval: 1,
                    skipFrames: 10
                };
                var params = _.extend(defaults, params);
                var frameCounter = 0;
                var maximumSkipFrames = 0;
                var uiUpdateInterval = 0;
                var nextUpdateInterval = 0;

                function init() {
                    maximumSkipFrames = params.skipFrames;
                    uiUpdateInterval = params.uiUpdateInterval * 1000;
                    nextUpdateInterval = _.now() + params.uiUpdateInterval;
                }

                init();

                function update() {
                    if (_.now() >= nextUpdateInterval || frameCounter > maximumSkipFrames) {
                        nextUpdateInterval = _.now() + uiUpdateInterval;
                        frameCounter = 0;
                        params.emitEvent();
                    } else {
                        frameCounter += 1;
                    }
                }

                return {
                    update: update
                }
            };

            var sonarUi = uiPart({
                uiUpdateInterval: 0.5,
                skipFrames: 10,
                emitEvent: function () {scope.$emit('updateSonarUi')}
            });

            var mapUi = uiPart({
                uiUpdateInterval: 1,
                skipFrames: 5,
                emitEvent: function () {scope.$emit('updateMapUi')}
            });

            /**
             * Simulation speed trigger
             * @type {Number}
             */
            var oldSpeed = timeDisplayConfig.initialSimulationSpeed;
            
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

                sonarUi.update();
                mapUi.update();
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
                    }
                });
            };

            scope.speed = timeDisplayConfig.initialAccelRate;
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

            if (scope.steppingEnabled) {
                watchSpeedChanges();
            } else {
                changeSimulationTimer();
            }
        }
    };
}]);
