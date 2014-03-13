angular.module('mustard.game.rangeCalculatorDirective', ['mustard.game.geoMath', 'mustard.game.panToVesselDirective', 'leaflet-directive'])

    .directive('rangeCalculator', ['geoMath', function (geoMath) {
        return {
            restrict: 'EA',
            scope: {
                state: '=',
                detections: '=',
                vesselsmarker: '='
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

                var previousDetection;

                scope.isRunning = false;

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

                    function hasData() {
                        return _count;
                    }

                    function average() {
                        return _total / _count;
                    }
                };


                var setStatus = function (status) {
                    scope.status = status;
                }

                scope.$watch('isRunning', function () {
                    if (!scope.isRunning) {
                        // finished running, clear the working variables, ready for the next run
                        legOneBdot = null;
                        legTwoBdot = null;
                        legOneOSA = null;
                        legTwoOSA = null;
                        markerDropped = null;
                        rangeOrigin = null;
                    }
                });

                scope.hasTrack = function () {
                    return !!trackName;
                };

                scope.trackName = function () {
                    return trackName;
                };

                var calcBearingRate = function (lastDetection, newDetection) {
                    var timeDelta = newDetection.time - lastDetection.time;
                    var bearingDelta = newDetection.trueBearing - lastDetection.trueBearing;
                    return bearingDelta / (timeDelta / (60000));
                };

                var calcOSA = function (state, newDetection) {
                    var relBearing = newDetection.trueBearing - state.course;
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

                                    // have we just started turn?
                                    if(!rangeOrigin)
                                    {
                                        rangeOrigin = angular.copy(scope.state.location);
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

                                        var range = calcRange(legOneOSA.average(), legTwoOSA.average(), legOneBdot.average(),
                                            legTwoBdot.average());

                                        setStatus("Range:" + Math.floor(range) + "m Bearing:" + Math.floor(contact.bearing));

                                        if (!markerDropped) {

                                            console.log("Dropping marker at range:" + Math.floor(range) + " brg:" + Math.floor(contact.bearing));

                                            // ok, create the marker location
                                            var location = geoMath.rhumbDestinationPoint(rangeOrigin, geoMath.toRads(contact.bearing), range);

                                            console.log(location);

                                            markerDropped = true;
                                            scope.vesselsmarker["marker" + _.uniqueId()] = {
                                                "lat": location.lat,
                                                "lng": location.lng,
                                                "layer": "ownShip"
                                            }
                                        }

                                        scope.isRunning = false;

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
