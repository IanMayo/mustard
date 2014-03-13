angular.module('mustard.game.rangeCalculatorDirective', [])

    .directive('rangeCalculator', ['$timeout', function ($timeout) {
        return {
            restrict: 'EA',
            scope: {
                state: '=',
                detections: '='
            },
            templateUrl: 'js/game/directives/rangeCalculator/rangeCalculator.tpl.html',
            link: function (scope) {

                var trackName = "Target";

                var legOneBdot;
                var legTwoBdot;
                var legOneOSA;
                var legTwoOSA;

                var previousDetection;

                scope.isRunning = true;

                scope.status = "Inactive";


                /**
                 * Ownship vessel API helper (since the ownship name 'may' change)
                 * @returns {Object}
                 */
                var RunningAverage = function () {
                    var _average = 0;
                    var _total = 0;
                    var _count = 0;
                    this.add = add;
                    this.average = average;
                    this.hasData = hasData;

                    function add(newVal) {
                        _total += newVal;
                        _count++;
                    }

                    function hasData()
                    {
                        return _count;
                    }

                    function average() {
                        return _total / _count;
                    }
                };


                var setStatus = function (status) {
                    scope.status = status;
                }

                scope.hasTrack = function () {
                    return !!trackName;
                };

                scope.trackName = function () {
                    return trackName;
                }

                var calcBearingRate = function (lastDetection, newDetection) {
                    var timeDelta = newDetection.time - lastDetection.time;
                    var bearingDelta = newDetection.trueBearing - lastDetection.trueBearing;
                    return bearingDelta / (timeDelta / (60000));
                }

                var calcOSA = function(state, newDetection){
                    var relBearing = newDetection.trueBearing - state.course;
                    return state.speed * Math.sin(relBearing);
                }



                scope.$on('addDetections', function (event, dataValues) {
                    if (scope.hasTrack()) {
                        // ok, is this thing switched on?
                        if (scope.isRunning) {

                            // are we currently turning
                            var turnRate = scope.state.turnRate;
                            if (Math.abs(turnRate) > 0.001) {
                                // we're in a turn - nothing to process
                                setStatus("Waiting for turn to complete");

                                // ok - are we in leg two?
                                if (legTwoBdot && legTwoBdot.hasData()) {
                                    // ok, stop calculating
                                    setStatus("Terminating second leg");
                                    scope.isRunning = false;
                                }
                                else if (legOneBdot) {
                                    if (!legTwoBdot) {
                                        legTwoBdot = new RunningAverage();
                                        legTwoOSA = new RunningAverage();
                                    }
                                }
                            }
                            else {
                                // ok, are we on second leg?
                                if (legTwoBdot) {
                                    // ok, carry on running
                                    setStatus("Averaging Leg Two");

                                    // ok, get the new detection
                                    var contact = _.find(scope.detections, function (det) {
                                        return det.trackId == trackName;
                                    });

                                    if (contact) {
                                        var bearingRate = calcBearingRate(contact, previousDetection)
                                        var osa = calcOSA(scope.state, contact);

                                        legTwoBdot.add(bearingRate);
                                        legTwoOSA.add(osa);

                                        console.log("2: bdot:" + legTwoBdot.average() + "OSA:" + legTwoOSA.average());

                                        // and remember the next detection
                                        previousDetection = contact;
                                    }
                                    else {
                                        console.log("lost contact");
                                        console.log(scope.detections);
                                    }

                                }
                                else if (legOneBdot) {
                                    setStatus("Averaging Leg One");

                                    // ok, get the new detection
                                    var contact = _.find(scope.detections, function (det) {
                                        return det.trackId == trackName;
                                    });

                                    if (contact) {

                                        var bearingRate = calcBearingRate(contact, previousDetection)
                                        var osa = calcOSA(scope.state, contact);

                                        legOneBdot.add(bearingRate);
                                        legOneOSA.add(osa);

                                        console.log("1: bdot:" + legOneBdot.average() + "OSA:" + legOneOSA.average());


                                        // and remember the next detection
                                        previousDetection = contact;
                                    }
                                }
                                else {
                                    // ok - starting to run: find the first matching item
                                    var contact = _.find(scope.detections, function (det) {
                                        return det.trackId == trackName;
                                    });
                                    if (!contact) {
                                        console.log("CANNOT FIND TARGET")
                                    }
                                    else {
                                        legOneBdot = new RunningAverage();
                                        legOneOSA = new RunningAverage();
                                        previousDetection = contact;
                                        setStatus("Starting Ranging Calc");
                                    }
                                }

                            }
                        }
                        else {
                            // we're in a turn - nothing to process
                            setStatus("Inactive");
                        }
                    }
                    else {
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
