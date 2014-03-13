angular.module('mustard.game.rangeCalculatorDirective', [])

    .directive('rangeCalculator', ['$timeout', function ($timeout) {
        return {
            restrict: 'EA',
            scope: {
                state: '='
            },
            templateUrl: 'js/game/directives/rangeCalculator/rangeCalculator.tpl.html',
            link: function (scope) {

                var trackName = "Track";

                var legOneBdot;
                var legTwoBdot;

                scope.isRunning = true;

                scope.status = "Inactive";

                var setStatus = function(status)
                {
                    scope.status = status;
                }

                scope.hasTrack = function () {
                    return !!trackName;
                };

                scope.trackName = function () {
                    return trackName;
                }

                scope.$on('addDetections', function (event, dataValues) {
                    if (scope.hasTrack()) {
                        // ok, is this thing switched on?
                        if (scope.isRunning) {
                            // ok, are we in a leg?
                            console.log("running");

                            // are we currently turning
                            var turnRate = scope.state.turnRate;
                            if (Math.abs(turnRate) > 0.001) {
                                // we're in a turn - nothing to process
                                setStatus("Waiting for turn to complete");
                            }
                            else {
                                // ok, are we on second leg?
                                if (legTwoBdot) {
                                    // ok, carry on running
                                    setStatus("Averaging Leg Two");
                                }
                                else if(legOneBdot)
                                {
                                    setStatus("Averaging Leg One");
                                }
                                else
                                {
                                    setStatus("Starting Ranging Calc");
                                }
                            }
                        }
                        else
                        {
                            // we're in a turn - nothing to process
                            setStatus("Inactive");
                        }
                    }
                    else
                    {
                        setStatus("Waiting for track");
                    }
                });
                scope.$parent.$on('sonarTrackSelected', function (event, theTrackName) {
                    trackName = theTrackName;
                });

                scope.doClearTrack = function () {
                    console.log("clearing track!");
                    trackName = null;
                }
            }
        };

    }]);
