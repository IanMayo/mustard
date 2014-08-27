/**
 * @module Detection
 */

angular.module('subtrack90.game.detection', ['subtrack90.game.geoMath'])

/**
 * @module Detection
 * @class Service
 * @description Detection service
 */

.service('detection', ['geoMath', function (geoMath) {

    const ABSORPTION_COEFFICIENT = 0.000073152;
    /* db / metre */

    var getOrigin = function (location, offset, heading) {
        return geoMath.rhumbDestinationPoint(location, geoMath.toRads(heading), offset);
    };

    var lossFor = function (range) {
        var loss;
        // idiot check
        if (range <= 0) {
            loss = 0;
        }
        else {
            var absorption = ABSORPTION_COEFFICIENT * range;
            var spreading = 20 * Math.log(range) / Math.log(10);
            loss = absorption + spreading;
        }
        return loss;
    };

    var getRadiatedNoiseFor = function (speed, baseLevel, state) {
        var res = 0.0000252 * Math.pow(speed, 5) -
            0.001456 * Math.pow(speed, 4) +
            0.02165 * Math.pow(speed, 3) +
            0.06 * Math.pow(speed, 2) -
            0.66 * speed + baseLevel;

        if (state.categories) {
            if (geoMath.hasCategory("SNORT", state.categories)) {
                res += 10;
            }
        }
        return res;
    };

    /**  Insert a new detection, plus an ambiguous contact, if necessary.
     *
     * @param detectionList the target list for the new detection
     * @param tNow current time
     * @param origin sonar origin
     * @param osCourse ownship course, used for ambiguous bearings
     * @param bearing bearing to target
     * @param source name of the target
     * @param trackId unique name for this track (series of contacts - each side-lobe or
     * ambiguous bearing is a new track)
     * @param doAmbiguous whether to insert an ambiguous bearing
     * @param errorRange the error to apply to the bearing value
     * @param SE the signal excess (strenght) of this acoustic measurement
     * @param bDot the current bearing rate
     * @param tgtLocation the true location of the target
     */
    var insertDetections = function (detectionList, tNow, origin, osCourse, bearing, source, trackId, doAmbiguous,
                                     errorRange, SE, bDot, tgtLocation) {
        // ok, what's the relative angle?
        var relBearing = bearing - osCourse;

        // is it ambiguous? If so, we have to hide the true bearing
        var firstId;
        if (doAmbiguous) {
            firstId = trackId + "_a";
        }
        else {
            // no ambiguous bearing, just use the direct name
            firstId = trackId;
        }

        // do the port angle
        var thisError = relBearing - errorRange + 2 * Math.random() * errorRange;
        var thisValue = osCourse + thisError;
        if (thisValue < 0) {
            thisValue += 360;
        }
        thisValue = thisValue % 360;
        detectionList.push({"time": tNow, "bearing": thisValue, "trueBearing": bearing, "source": source,
            "trackId": firstId, "origin": {
                "lat": origin.lat, "lng": origin.lng}, "strength": SE, "bDot": bDot, "tgtLoc": tgtLocation
        });

        // ambiguous?
        if (doAmbiguous) {
            thisError = -(relBearing - errorRange + 2 * Math.random() * errorRange);
            thisValue = osCourse + thisError;
            if (thisValue < 0) {
                thisValue += 360;
            }

            thisValue = thisValue % 360;
            detectionList.push({"time": tNow, "bearing": thisValue, "trueBearing": bearing,
                "source": source, "trackId": trackId + "_b", "ambiguous": true, "origin": {
                    "lat": origin.lat, "lng": origin.lng}, "strength": SE, "bDot": bDot, "tgtLoc": tgtLocation
            });
        }
    };


    var processThisVessel = function (tNow, myVessel, allVessels) {

        // how much random error to apply to sensor cuts
        const SENSOR_ERROR = 2;
        /* degs */

        // how much turn rate leads to array unsteady
        const TURN_THRESHOLD = 0.1;
        /* degs / sec */

        // ok, sort out my own noise levels
        var speed = myVessel.state.speed;
        var baseLevel = myVessel.radiatedNoise.baseLevel;

        // we half ownship noise, to get required detection ranges
        var LN = getRadiatedNoiseFor(speed, baseLevel, myVessel.state) / 2;

        // store the detections
        var newDetections = [];

        // sort out the size of the bow null
        var bowNull;
        if (speed >= 15) {
            bowNull = 35;
        } else {
            bowNull = 18;
        }

        // ok, store it, in case we want to analyse it
        myVessel.state.osNoise = LN;

        // first, loop through my sonars
        for (var j = 0; j < myVessel.sonars.length; j++) {

            // get the sonar
            var sonar = myVessel.sonars[j];

            // is this sonar active?
            if (sonar.disabled) {
                continue;
            }

            // get the origin of the sonar  TODO: worm in hole, not directly behind.
            var origin = getOrigin(myVessel.state.location, sonar.offset, myVessel.state.course);

            sonar.location = origin;

            // is the array already unsteady?
            if (sonar.isUnsteady) {

                // ok, are we still turning?
                if (myVessel.state.turnRate > TURN_THRESHOLD) {
                    // yes = we'll have to stay unsteady then
                }
                else {
                    // ok, we've straightened up
                    // do we have a steady time?
                    if (sonar.steadyTime) {
                        // hey, have we reached it?
                        if (tNow >= sonar.steadyTime) {
                            // yes - clear the unsteady flag :-)
                            sonar.isUnsteady = false;
                        }
                    }
                    else {
                        // ok, set the steady time
                        sonar.steadyTime = tNow + 20000;
                    }
                }
            }
            else {
                // hmm, see if the array suffers from unsteady time
                if (!geoMath.hasCategory("NO_STEADY_TIME", sonar.categories)) {
                    // ok - are we turning?
                    if (myVessel.state.turnRate) {
                        if (myVessel.state.turnRate >= TURN_THRESHOLD) {
                            // ok - the array is still unsteady - mark it
                            sonar.isUnsteady = true;
                        }
                    }
                }
            }

            // oh dear, are twe unsteady?
            if (!sonar.isUnsteady) {
                _.each(allVessels, function (thisV) {
                    // is this me?
                    if (thisV == myVessel) {
                    // yes, sort out self-noise

                        // sort out the angle to ownship
                        var theSelfBrg = geoMath.rhumbBearingFromTo(origin, myVessel.state.location);

                        // does this sonar have simple self-noise?
                        if (!geoMath.hasCategory("NO_SIMPLE_SELF_NOISE", sonar.categories)) {
                            insertDetections(newDetections, tNow, origin, myVessel.state.course,
                                theSelfBrg, thisV.name, thisV.name, false, SENSOR_ERROR, LN, 0, thisV.state.location);
                        }

                        // does this sonar have complex self-noise?
                        if (!geoMath.hasCategory("NO_COMPLEX_SELF_NOISE", sonar.categories)) {
                            // hey, just check if we're "roaring" along.
                            if (speed >= 12) {
                                var offsetBearing = theSelfBrg + 15;
                                insertDetections(newDetections, tNow, origin, myVessel.state.course,
                                    offsetBearing, thisV.name, thisV.name + "_side1", true, SENSOR_ERROR,
                                    LN, 0, thisV.state.location);
                            }

                            // hey, just check if we're "roaring" along.
                            if (speed >= 15) {
                                offsetBearing = theSelfBrg + 25;
                                insertDetections(newDetections, tNow, origin, myVessel.state.course, offsetBearing,
                                    thisV.name, thisV.name + "_side2", true, SENSOR_ERROR, LN, 0, thisV.state.location);
                            }
                        }
                    } else {
                        // no, sort out proper detections

                        // sort out the angle to target
                        var theBrg = geoMath.rhumbBearingFromTo(origin, thisV.state.location);

                        var relBrg = Math.abs(theBrg - myVessel.state.course);
                        relBrg = relBrg % 360;

                        // ok, does this sonar have arcs of coverage?
                        var inCoverage = true;
                        if (sonar.coverage) {
                            if (Math.abs(relBrg) >= sonar.coverage) {
                                // ok - we're not going to get a detection here, move on to the next target
                                inCoverage = false;
                            }
                        }

                        // is there a bow null (ownship noise)?
                        var hasBowNull = !geoMath.hasCategory("NO_BOW_NULL", sonar.categories);
                        var outsideBowNull = true;
                        if (hasBowNull) {
                            outsideBowNull = relBrg > bowNull;
                        }

                        // is it worth checking the signal excess?
                        if (inCoverage && outsideBowNull) {

                            // his radiated noise:
                            var LS = getRadiatedNoiseFor(thisV.state.speed, thisV.radiatedNoise.baseLevel, thisV.state);

                            // what's the loss?
                            //  - start with the range
                            var range = geoMath.rhumbDistanceFromTo(origin, thisV.state.location);

                            // and now the loss itself
                            var NW = lossFor(range);

                            var DT = sonar.DT;
                            var AG = sonar.ArrayGain;

                            var SE = LS - NW - (LN - AG) - DT;

                            // DEBUG - put the SE in the state
                            myVessel.state.SE = SE;
                            // myVessel.state.loss = NW;

                            // console.log("" + myVessel.name +" == SE:" + SE + " range:" + Math.floor(range) +
                            // " LS:" + Math.floor(LS) + " NW:" +Math.floor( NW) + " LN:" + Math.floor(LN) +
                            // " AG:" + AG + " DT:" + DT);

                            // +ve?
                            if (SE > 0) {

                                // also calculate the bearing rate
                                // get the vessel course and speeds (in knots and radians)
                                var oSpd = myVessel.state.speed;
                                var tCrse = geoMath.toRads(thisV.state.course);
                                var tSpd = thisV.state.speed;

                                var relBrgRads = geoMath.toRads(theBrg - myVessel.state.course);
                                var ATB = geoMath.toRads(theBrg) - Math.PI - tCrse;
                                var TSA = tSpd * Math.sin(ATB);
                                var OSA = oSpd * Math.sin(relBrgRads);

                                var calcDelta = function (legOne, legTwo) {
                                    var res;
                                    if (_.num.sign(legOne) != _.num.sign(legTwo)) {
                                        res = Math.abs(legTwo) - Math.abs(legOne);
                                    }
                                    else {
                                        res = Math.abs(legOne) + Math.abs(legTwo);
                                    }
                                    // don't bother with ABS value, we wish to know if its going left or right
                                    return res;
                                };

                                var RSA = calcDelta(OSA, TSA);

                                var bDot = geoMath.toDegs((1770 / Math.PI) * RSA / range) / 4;

                                ///////////////////////////////////////////////
                                // do 10 log SE, to make it smoother
                                SE = 10 * Math.log(SE);

                                // is this an ambiguous sonar?
                                var doAmbiguous = !geoMath.hasCategory("NO_AMBIGUOUS", sonar.categories);

                                // ok, insert the core detection
                                insertDetections(newDetections, tNow, origin, myVessel.state.course, theBrg,
                                    thisV.name, thisV.name, doAmbiguous, SENSOR_ERROR, SE, bDot, thisV.state.location);

                                // show extra side lobes if he's really noisy
                                if (SE > 25) {
                                    // first the right-hand side lobe
                                    insertDetections(newDetections, tNow, origin, myVessel.state.course,
                                        theBrg + 15, thisV.name, thisV.name + "_side1", doAmbiguous,
                                        SENSOR_ERROR, SE, bDot, thisV.state.location);

                                    // and now the left-hand side lobe
                                    insertDetections(newDetections, tNow, origin, myVessel.state.course, theBrg - 15,
                                        thisV.name, thisV.name + "_side2", doAmbiguous, SENSOR_ERROR, SE, bDot,
                                        thisV.state.location);
                                }
                            }
                        } else {
                            myVessel.state.SE = 0;
                        }
                    }
                });
            }
        }
    // and store the new detections
    myVessel.newDetections = newDetections;
};

    /**
     * Module API
     */
    return {
        doDetections: function (tNow, vessels) {
            _.each(vessels, function (thisV) {
                processThisVessel(tNow, thisV, vessels);
            });
        }
    };
}]);
