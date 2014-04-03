angular.module('mustard.game.rangeCalculatorDirective', ['mustard.game.geoMath'])

    .constant('LEG_LENGTH', 60000)  // how long a leg must be averaged for

    .directive('rangeCalculator', ['geoMath', 'LEG_LENGTH', function (geoMath, LEG_LENGTH) {
        return {
            restrict: 'EA',
            scope: {
                state: '=',
                detections: '=',
                markerLocation: '&',
                vessel: '='
            },
            templateUrl: 'js/game/directives/rangeCalculator/rangeCalculator.tpl.html',
            link: function (scope) {

                var trackName;  // the track selected by the user

                var legOneBdot;
                var legTwoBdot;
                var legOneOSA;
                var legTwoOSA;

                var legOneEndTime;
                var legTwoEndTime;

                var turnStarted = false;

                var firstDetection;  // we need to remember the first detection in each leg, for averaging

                scope.isRunning = false;  // whether a ranging manoeuvre is active

                scope.status = "Inactive";

                /** output a message to the user
                 *
                 * @param status
                 * @param badge
                 */
                var setStatus = function (status, badge) {
                    scope.status = status;
                    scope.badge = badge;
                };


                /** listen out for the user selecting a track from the sonar
                 *
                 */
                scope.$parent.$on('sonarTrackSelected', function (event, theTrackName) {
                    trackName = theTrackName;
                });

                /** let the user "drop" the selected track
                 *
                 */
                scope.doClearTrack = function () {
                    trackName = null;
                };

                /** start doing a ranging calculation
                 *
                 */
                scope.doRun = function () {
                    // clear out
                    doReset();
                    scope.isRunning = true;
                };

                /** event cancelled - clear out
                 *
                 */
                var doReset = function () {
                    legOneBdot = null;
                    legTwoBdot = null;
                    legOneEndTime = null;
                    legTwoEndTime = null;
                    firstDetection = null;
                    legOneOSA = null;
                    legTwoOSA = null;
                    turnStarted = false;
                    scope.isRunning = false;
                };

                /** has a track been defined?
                 *
                 * @returns {boolean}
                 */
                scope.hasTrack = function () {
                    return !!trackName;
                };

                scope.trackName = function () {
                    return trackName;
                };

                var calcBearingRate = function (lastDetection, newDetection) {
                    var timeDelta = newDetection.time - lastDetection.time;
                    var bearingDelta = newDetection.bearing - lastDetection.bearing;
                    return bearingDelta / (timeDelta / (60000));
                };

                var calcOSA = function (state, newDetection) {
                    var relBearing = newDetection.bearing - state.course;
                    return (state.speed * Math.sin(geoMath.toRads(relBearing)));
                };

                var calcRange = function (legOneOSA, legTwoOSA, legOneBdot, legTwoBdot) {

                    var deltaOSA = calcDelta(legOneOSA, legTwoOSA);
                    var deltaBdot = calcDelta(legOneBdot, legTwoBdot);

                    // note: yards value is 1936, this is 1770..28 in m
                    return 1770.28 * deltaOSA / deltaBdot;
                };

                var calcDelta = function (legOne, legTwo) {
                    var res;
                    if (_.num.sign(legOne) == _.num.sign(legTwo)) {
                        res = Math.abs(legTwo) - Math.abs(legOne);
                    }
                    else {
                        res = Math.abs(legOne) + Math.abs(legTwo);
                    }
                    return Math.abs(res);
                };

                scope.$on('addDetections', function () {
                    if (scope.hasTrack()) {


                        // ok, retrieve the detection for our subject track
                        var contact = _.find(scope.detections, function (det) {
                            return det.trackId == trackName;
                        });


                        if (contact) {
                            scope.signalexcess = Math.ceil(contact.strength);
                            scope.bearingrate = Math.floor(contact.bDot);
                        }

                        // ok, is this thing switched on?
                        if (scope.isRunning) {

                            // are we currently turning
                            var turnRate = scope.state.turnRate;
                            if (Math.abs(turnRate) > 0.001) {
                                // we're in a turn - nothing to process
                                setStatus("Waiting for turn to complete", null);

                                // ok - are we in leg two?
                                if (legTwoEndTime) {
                                    // ok, stop calculating
                                    setStatus("Calculation terminated", null);
                                    scope.isRunning = false;
                                }
                                else if (legOneBdot) {
                                    // ok, this is the turn at the end of leg one.
                                    turnStarted = true;
                                }
                            }
                            else {

                                // are we holding the contact?
                                if (contact) {
                                    // ok, are we on second leg?
                                    if (turnStarted) {
                                        // ok, we've come out of the turn

                                        if (!legTwoEndTime) {
                                            legTwoEndTime = contact.time + LEG_LENGTH;
                                            firstDetection = contact;
                                        }
                                        else {

                                            if (contact.time >= legTwoEndTime) {

                                                // ok - we're done
                                                scope.isRunning = false;

                                                // ok, we're ready to calc
                                                legTwoBdot = calcBearingRate(contact, firstDetection);
                                                legTwoOSA = calcOSA(scope.state, contact);

                                                // data ready, do the calculation
                                                var range = calcRange(legOneOSA, legTwoOSA, legOneBdot,
                                                    legTwoBdot);

                                                // output the solution
                                                setStatus("Range:" + Math.floor(range) + "m Bearing:" + Math.floor(contact.bearing), null);

                                                // ok, create the marker location
                                                var rangeOrigin = angular.copy(scope.state.location);
                                                var location = geoMath.rhumbDestinationPoint(rangeOrigin, geoMath.toRads(contact.bearing), range);

                                                // insert a new marker
                                                scope.markerLocation({data:location});

                                                // and register the solution with the vessel
                                                if (!scope.vessel.solutions) {
                                                    scope.vessel.solutions = [];
                                                }
                                                scope.vessel.solutions.push({"time": contact.time, "location": location, "target": contact.target});
                                            }
                                            else {
                                                // we're still doing hte average
                                                setStatus("Averaging Leg Two", Math.floor((legTwoEndTime - contact.time) / 1000) + "secs");
                                            }

                                        }
                                    }
                                    else if (legOneEndTime) {
                                        // right - we must be processing the leg one average


                                        // have we passed the end time
                                        if (contact.time >= legOneEndTime) {
                                            legOneBdot = calcBearingRate(contact, firstDetection);
                                            legOneOSA = calcOSA(scope.state, contact);
                                            setStatus("Leg One Complete, ready to turn", null);
                                        }
                                        else {
                                            setStatus("Averaging Leg One", Math.floor((legOneEndTime - contact.time) / 1000) + "secs");
                                        }

                                    }
                                    else {
                                        firstDetection = contact;
                                        legOneEndTime = contact.time + LEG_LENGTH;

                                        setStatus("Starting Ranging Calc", null);
                                    }
                                }
                                else {
                                    setStatus("Contact lost", null);
                                    doReset();
                                }
                            }
                        }
                    }
                    else {
                        setStatus("Press [Run] to start", null);
                    }
                });
            }
        };
    }]);
