angular.module('mustard.game.rangeCalculatorDirective', ['mustard.game.geoMath', 'mustard.game.panToVesselDirective', 'leaflet-directive'])

    .directive('rangeCalculator', ['geoMath', function (geoMath) {
        return {
            restrict: 'EA',
            scope: {
                state: '=',
                detections: '=',
                vesselsmarker: '=',
                vessel: '='
            },
            templateUrl: 'js/game/directives/rangeCalculator/rangeCalculator.tpl.html',
            link: function (scope) {

                var trackName;

                var legOneBdot;
                var legTwoBdot;
                var legOneOSA;
                var legTwoOSA;

                var markerDropped;
                var rangeOrigin;

                var legOneEndTime;
                var legTwoEndTime;
                var LEG_LENGTH = 60000;

                var turnStarted = false;

                var firstDetection;

                scope.isRunning = false;

                scope.status = "Inactive";

                var setStatus = function (status, badge) {
                    scope.status = status;
                    scope.badge = badge;
                };


                scope.doRun = function () {
                    console.log("STARTING RUNNING!");
                    // clear out
                    doReset();
                    scope.isRunning = true;
                };

                var doReset = function () {
                    legOneBdot = null;
                    legTwoBdot = null;
                    legOneEndTime = null;
                    legTwoEndTime = null;
                    firstDetection = null;
                    legOneOSA = null;
                    legTwoOSA = null;
                    markerDropped = null;
                    rangeOrigin = null;
                    turnStarted = false;
                };

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
                    console.log("osa:" + deltaOSA + " bdot:" + deltaBdot);
                    return 1936 * deltaOSA / deltaBdot;
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
                        // ok, is this thing switched on?
                        if (scope.isRunning) {

                            // are we currently turning
                            var turnRate = scope.state.turnRate;
                            if (Math.abs(turnRate) > 0.001) {
                                // we're in a turn - nothing to process
                                setStatus("Waiting for turn to complete");

                                // ok - are we in leg two?
                                if (legTwoEndTime) {
                                    // ok, stop calculating
                                    setStatus("Calculation terminated");
                                    scope.isRunning = false;
                                }
                                else if (legOneBdot) {
                                    // ok, this is the turn at the end of leg one.
                                    turnStarted = true;
                                }
                            }
                            else {

                                var contact = _.find(scope.detections, function (det) {
                                    return det.trackId == trackName;
                                });

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
                                                // ok, we're ready to calc
                                                legTwoBdot = calcBearingRate(contact, firstDetection);
                                                legTwoOSA = calcOSA(scope.state, contact);

                                                var range = calcRange(legOneOSA, legTwoOSA, legOneBdot,
                                                    legTwoBdot);

                                                setStatus("Range:" + Math.floor(range) + "m Bearing:" + Math.floor(contact.bearing));

                                                console.log("Dropping marker at range:" + Math.floor(range) + " brg:" + Math.floor(contact.bearing));

                                                // ok, create the marker location
                                                rangeOrigin = angular.copy(scope.state.location);
                                                var location = geoMath.rhumbDestinationPoint(rangeOrigin, geoMath.toRads(contact.bearing), range);

                                                console.log(location);

                                                if (!markerDropped) {
                                                    markerDropped = true;
                                                    scope.vesselsmarker["marker" + _.uniqueId()] = {
                                                        "lat": location.lat,
                                                        "lng": location.lng,
                                                        "layer": "ownShip"
                                                    };
                                                }

                                                // and register the solution with the vessel
                                                if(!scope.vessel.solutions)
                                                {
                                                    scope.vessel.solutions = [];
                                                }
                                                scope.vessel.solutions.push({"time":contact.time, "location":location, "target":contact.target});


                                                scope.isRunning = false;
                                            }
                                            else {
                                                // we're still doing hte average
                                                setStatus("Averaging Leg Two", Math.floor((legTwoEndTime - contact.time) / 1000));
                                            }

                                        }
                                    }
                                    else if (legOneEndTime) {
                                        // right - we must be processing the leg one average


                                        // have we passed the end time
                                        if (contact.time >= legOneEndTime) {
                                            legOneBdot = calcBearingRate(contact, firstDetection);
                                            legOneOSA = calcOSA(scope.state, contact);
                                            setStatus("Leg One Complete, ready to turn");
                                        }
                                        else {
                                            setStatus("Averaging Leg One", Math.floor((legOneEndTime - contact.time) / 1000));
                                        }

                                    }
                                    else {
                                        firstDetection = contact;
                                        legOneEndTime = contact.time + LEG_LENGTH;

                                        setStatus("Starting Ranging Calc");
                                    }
                                }
                                else {
                                    setStatus("Contact lost");
                                    doReset();
                                }
                            }
                        }
                    }
                    else {
                        setStatus("Press [Run] to start");
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
        }
            ;

    }])
;
