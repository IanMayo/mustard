/**
 * Created by ian on 11/02/14.
 */

/**
 *
 * @param thisCat the categoiry we're looking for
 * @param theCats an array of categories
 * @returns {boolean} true/false for finding item
 */
function hasCategory(thisCat, theCats) {
    return (theCats.indexOf(thisCat) > -1);
}

function getOrigin(location, offset, heading)
{
    return rhumbDestinationPoint(location,toRads(heading), offset);
}

function doDetections(tNow, myVessel, allVessels) {
    // ok, sort out my own noise levels
    var name = myVessel.name;
    var speed = myVessel.state.speed;
    var baseLevel = myVessel.radiatedNoise.baseLevel;

    var osNoise = 0.0000252 * Math.pow(speed, 5) -
        0.001456 * Math.pow(speed, 4) +
        0.02165 * Math.pow(speed, 3) +
        0.04 * Math.pow(speed, 2) -
        0.66 * speed + baseLevel;

    // ok, store it, in case we want to analyse it
    myVessel.radiatedNoise.osNoise = osNoise;

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
                var theBrg = rhumbBearingFromTo(origin, myVessel.state.location);

                // does this sonar have simple self-noise?
                if(! hasCategory("NO_SIMPLE_SELF_NOISE", sonar.categories))
                {
                    insertDetections(newDetections, tNow, myVessel.state.course, theBrg,"OS", false, 4);
                }

                // does this sonar have simple self-noise?
                if(! hasCategory("NO_COMPLEX_SELF_NOISE", sonar.categories))
                {
                    var offsetBearing = theBrg + 15;
                    insertDetections(newDetections, tNow, myVessel.state.course, offsetBearing,"OS (lobe)", true, 4);
                }

            }
            else {
                // no, sort out proper detections

                // sort out the angle to target
                var theBrg = rhumbBearingFromTo(origin, thisV.state.location);

                var doAmbiguous = ! hasCategory("NO_AMBIGUOUS", sonar.categories);

                insertDetections(newDetections, tNow, myVessel.state.course, theBrg,"thisV.name", true, 4);
            }
        }
    }

    // and store the new detections
    myVessel.newDetections = newDetections;

}

function insertDetections(detectionList,tNow,  osCourse, bearing,source, doAmbiguous, errorRange)
{
    bearing = bearing % 360;

    // ok, what's the relative angle?
    var relBearing = bearing - osCourse;

    // do the port angle
    var thisError = relBearing -errorRange + 2 * Math.random() * errorRange;
    detectionList.push({"time":tNow, "bearing" : osCourse + thisError, "source":source});

    // ambiguous?
    if(doAmbiguous)
    {
        thisError = - (relBearing -errorRange + 2 * Math.random() * errorRange);
        detectionList.push({"time":tNow, "bearing" : osCourse + thisError, "source":source});
    }
}

