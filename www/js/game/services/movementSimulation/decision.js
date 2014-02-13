/**
 * Created by ian on 11/02/14.
 */


function doDecisions(tNow, myState, myDetections, myBehaviours) {

    var demState;

    if (myBehaviours) {
        // ok, loop through them
        var ctr = 0;

        while (ctr < myBehaviours.length && (!demState)) {
            var thisB = myBehaviours[ctr];
            ctr++;

            demState = implementThis(tNow, myState, myDetections, thisB);
        }

        // do we have something to do?
        if(demState)
        {
            if(demState.demCourse)
            {
                myState.demCourse = demState.demCourse;
            }
            if(demState.demSpeed)
            {
                myState.demSpeed = demState.demSpeed;
            }
            if(demState.demHeight)
            {
                myState.demHeight = demState.demHeight;
            }
        }
    }
    else {
        // it's probably just ownship. leave it alone
    }
}

function implementThis(tNow, myState, myDetections, thisB) {
    var res;
    switch (thisB.type) {
        case "RECTANGLE_WANDER":
            res = handleRectWander(tNow, myState, myDetections, thisB);
            break;
        case "xxx.dev.yyy.com":
            // Blah
            break;
    }

    return res;
}


function handleRectWander(tNow, myState, myDetections, thisB) {
    var res;

    // are we current changing course? maybe we're still turning
    if (myState.course == myState.demCourse) {

        var bounds = thisB.bounds;
        if (!bounds) {
            // ok, inject the bounds
            var tl = L.latLng(thisB.tl.lat, thisB.tl.lng);
            var br = L.latLng(thisB.br.lat, thisB.br.lng);
            bounds = L.latLngBounds(tl, br);
            thisB.bounds = bounds;
        }

        // are we in the patrol area?
        var myLoc = L.latLng(myState.location.lat, myState.location.lng);
        if (!(bounds.contains(myLoc))) {
            // ok, plot course to centre
            var centre = bounds.getCenter();

            // what's the angle to the center?
            var bearing = rhumbBearingFromTo(myState.location, centre);

            res = {};
            res.demCourse = bearing;

            // do we have a demanded height?
            if(thisB.height)
            {
                res.demHeight = thisB.height;
            }
        }
    }

    return res;
}