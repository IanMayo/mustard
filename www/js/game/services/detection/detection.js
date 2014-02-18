/**
 * @module Detection
 */

angular.module('mustard.game.detection', ['mustard.game.geoMath'])

/**
 * @module Detection
 * @class Service
 * @description Detection service
 */

.service('detection', 'geoMath', function (geoMath) {

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

    var getRadiatedNoiseFor= function (speed, baseLevel, state) {
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

    var insertDetections = function (detectionList, tNow, origin, osCourse, bearing, source, doAmbiguous, errorRange, SE) {
        // ok, what's the relative angle?
        var relBearing = bearing - osCourse;

        // do the port angle
        var thisError = relBearing - errorRange + 2 * Math.random() * errorRange;
        var thisValue = osCourse + thisError;
        if (thisValue < 0) {
            thisValue += 360;
        }
        thisValue = thisValue % 360;
        detectionList.push({"time": tNow, "bearing": thisValue, "source": source, "origin": {"lat": origin.lat, "lng": origin.lng, "strength": SE}});

        // ambiguous?
        if (doAmbiguous) {
            thisError = -(relBearing - errorRange + 2 * Math.random() * errorRange);
            thisValue = osCourse + thisError;
            if (thisValue < 0) {
                thisValue += 360;
            }
            thisValue = thisValue % 360;
            detectionList.push({"time": tNow, "bearing": thisValue, "source": source + "(ambig)", "origin": {"lat": origin.lat, "lng": origin.lng}});
        }
    };

    /**
     * Module API
     */
    return {
        doDetections: function (tNow, myVessel, allVessels) {
            // ok, sort out my own noise levels
            var name = myVessel.name;
            var speed = myVessel.state.speed;
            var baseLevel = myVessel.radiatedNoise.baseLevel;

            // sort out the size of the bow null
            var bowNull;
            if(speed >= 15)
            {
                bowNull = 35;
            }
            else
            {
                bowNull = 18;
            }

            const SENSOR_ERROR = 2;

            // we half ownship noise, to get required detection ranges
            var LN = getRadiatedNoiseFor(speed, baseLevel, myVessel.state) / 2;

            // ok, store it, in case we want to analyse it
            myVessel.state.osNoise = LN;

            // store the detections
            var newDetections = [];

            // first, loop through my sonars
            for (var j = 0; j < myVessel.sonars.length; j++) {

                // get the sonar
                var sonar = myVessel.sonars[j];

                // get the origin of the sonar  TODO: worm in hole, not directly behind.
                var origin = getOrigin(myVessel.state.location, sonar.offset, myVessel.state.course);

                sonar.location = origin;

                // now loop through the vessels
                for (var i = 0; i < allVessels.length; i++) {
                    var thisV = allVessels[i];

                    // is this me?
                    if (thisV == myVessel) {
                        // yes, sort out self-noise

                        // sort out the angle to ownship
                        var theSelfBrg = geoMath.rhumbBearingFromTo(origin, myVessel.state.location);

                        // does this sonar have simple self-noise?
                        if (!geoMath.hasCategory("NO_SIMPLE_SELF_NOISE", sonar.categories)) {
                            insertDetections(newDetections, tNow, origin, myVessel.state.course, theSelfBrg, "OS", false, SENSOR_ERROR);
                        }

                        // does this sonar have simple self-noise?
                        if (!geoMath.hasCategory("NO_COMPLEX_SELF_NOISE", sonar.categories)) {
                            var offsetBearing = theSelfBrg + 15;
                            insertDetections(newDetections, tNow, origin, myVessel.state.course, offsetBearing, "OS (lobe)", true, SENSOR_ERROR);

                            // hey, just check if we're "roaring" along.
                            if(speed >= 15)
                            {
                                var offsetBearing = theSelfBrg + 25;
                                insertDetections(newDetections, tNow, origin, myVessel.state.course, offsetBearing, "OS (lobe 2)", true, SENSOR_ERROR);
                            }
                        }
                    }
                    else {
                        // no, sort out proper detections

                        // sort out the angle to target
                        var theBrg = geoMath.rhumbBearingFromTo(origin, thisV.state.location);

                        var relBrg = Math.abs(theBrg - myVessel.state.course);
                        relBrg = relBrg % 360;

                        var hasBowNull = geoMath.hasCategory("HAS_BOW_NULL", sonar.categories);

                        // are we without a bow null, or would this be outside the null anyway?
                        if ((!hasBowNull) || relBrg > bowNull) {

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
                            //       myVessel.state.loss = NW;

//                console.log("" + myVessel.name +" == SE:" + SE + " range:" + Math.floor(range) + " LS:" + Math.floor(LS) + " NW:" +Math.floor( NW) + " LN:" + Math.floor(LN) + " AG:" + AG + " DT:" + DT);

                            // +ve?
                            if (SE > 0) {
                                // do 10 log SE, to make it smoother
                                SE = 10 * Math.log(SE);

                                var doAmbiguous = !geoMath.hasCategory("NO_AMBIGUOUS", sonar.categories);
                                insertDetections(newDetections, tNow, origin, myVessel.state.course, theBrg, thisV.name, doAmbiguous, SENSOR_ERROR, SE);

                                // TODO: hey, if he's snorting, why not show extra lobes
                                // TODO: no, do it if there's a really high SE.
                            }
                        }
                        else {
                            myVessel.state.SE = 0;
                        }
                    }
                }
            }

            // and store the new detections
            myVessel.newDetections = newDetections;
        }
    };
});
