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
//    * @param   {Object} [location]: origin location
//* @param   {Number} [brng]: Bearing in radians from North
//* @param   {Number} [dist]: Distance in m
//    */
//function rhumbDestinationPoint(location, brng, dist) {

    var ptOrigin = rhumbDestinationPoint(location, offset, toRads(heading));
    return ptOrigin;
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

 //   console.log("processing " + myVessel.name);

    // first, loop through my sonars
    for (var j = 0; j < myVessel.sonars.length; j++) {

        // get the sonar
        var sonar = myVessel.sonars[j];

        // get the origin of the sonar
        var origin = getOrigin(myVessel.state.location, sonar.offset, myVessel.state.course);

        sonar.location = origin;

        // now loop through the vessels
        for (var i = 0; i < allVessels.length; i++) {
            var thisV = allVessels[i];

            // is this me?
            if (thisV == myVessel) {
                // yes, sort out self-noise

                // does this sonar have simple self-noise?
                if(! hasCategory("NO_SIMPLE_SELF_NOISE", sonar.categories))
                {
                    var theBrg = rhumbBearingTo(myVessel.state.location, origin);

                    var newDet = {
                        "time" : tNow,
                        "bearing": + theBrg
                    }

                    newDetections.push(newDet);
                }
                else
                {

                }

            }
            else {
                // no, sort out detections

            }
        }
    }

    // and store the new detections
    myVessel.newDetections = newDetections;

}

