/**
 * @module Decision
 */

angular.module('subtrack90.game.decision', ['subtrack90.game.geoMath'])

/**
 * @module Decision
 * @class Service
 * @description Decision service
 */
.service('decision', ['geoMath', function (geoMath) {

    var implementThis = function (tNow, myState, myDetections, thisB) {
        var res = null;

        // are we complete?
        if (thisB.complete) {
            // yes, no point processing any further.
            return res;
        }

        switch (thisB.type) {
            case "RECTANGLE_WANDER":
                res = handleRectWander(tNow, myState, myDetections, thisB);
                break;
            case "SNORT":
                res = handleSnort(tNow, myState, myDetections, thisB);
                break;
            case "PATH":
                res = handlePath(tNow, myState, myDetections, thisB);
                break;
            case "EVADE":
                res = handleEvade(tNow, myState, myDetections, thisB);
                break;
            case "ATTACK":
                res = handleAttack(tNow, myState, myDetections, thisB);
                break;
        }
        return res;
    };


    var handleEvade = function (tNow, myState, myDetections, evade) {
        var res;

        // are we currently fleeing
        if (evade.stopTime) {
            // ok, have we passed that time?
            if (tNow >= evade.stopTime) {
                // ok, done fleeing
                delete evade.stopTime;
                delete evade.counterBrg;
            }
            else {
                // carry on along the counter bearing
                res = {};
                res.description = "Still evading target";
                res.demCourse = evade.counterBrg;
            }
        } else {
            // ok, do we have any detections?
            if (myDetections) {
                // ok, are any from a target?
                for (var i = 0; i < myDetections.length; i++) {
                    var thisD = myDetections[i];
                    if (!(evade.target) || (thisD.source == evade.target)) {
                        // ok, start fleeing

                        var counterBrg = thisD.bearing + 180;
                        counterBrg = counterBrg % 360;

                        evade.counterBrg = counterBrg;

                        res = {};
                        res.description = "Turning to evade target";
                        res.demCourse = counterBrg;

                        evade.stopTime = tNow + (evade.fleeTime * 1000);
                    }
                }
            }
        }
        return res;
    };

    var handleAttack = function (tNow, myState, myDetections, attack) {
        var res;

        // ok, do we have any detections?
        if (myDetections) {
            // ok, are any from a target?
            for (var i = 0; i < myDetections.length; i++) {
                var thisD = myDetections[i];
                if (!(attack.target) || (thisD.source == attack.target)) {
                    // ok, start fleeing
                    res = {};
                    res.description = "Turning to attack target";
                    res.demCourse = thisD.bearing;
                }
            }
        }
        return res;
    };


    var handlePath = function (tNow, myState, myDetections, path) {
        var res;

        /* SPECIAL PROCESSING: note that we use a 1-indexed value for the current
         entry in the array, since a zero value is also "falsy"  */

        const DISTANCE_THRESHOLD = 200;

        // ok - is this just starting?
        if (!path.current) {
            // ok, we're just starting steer a course to the first destination
            path.current = 1;
        }

        // ok, what's the current location
        var dest = path.path[path.current - 1];

        // and where are we?
        var loc = myState.location;

        // are we near enough to pass the current destination?
        if (dest && geoMath.rhumbDistanceFromTo(dest, loc) > DISTANCE_THRESHOLD) {

            // nope, plot a new bearing to it
            res = {};
            res.description = path.name + ": " + "Still heading to point " + path.current;
            res.demCourse = geoMath.rhumbBearingFromTo(loc, dest);
        }
        else {
            // is this a valid point?
            if (path.current < path.path.length) {
                // ok, move on to the next point
                path.current++;

                // where am I heading to?
                var newDest = path.path[path.current - 1];

                // nope, plot a new bearing to it
                res = {};
                res.demCourse = geoMath.rhumbBearingFromTo(loc, newDest);
                res.description = path.name + ": " + "Now heading for point " + path.current;

            }
            else {

                // ok, move on to the next point - so we don't have a valid destination
                path.current++;

                // aah, are we meant to repeat?
                if (path.repeat) {
                    // ok, head back to the first point
                    path.current = 1;
                    res = {};
                    res.description = path.name + ": " + "Restarting route";
                    var newDest2 = path.path[path.current - 1];
                    res.demCourse = geoMath.rhumbBearingFromTo(loc, newDest2);
                }
                else {
                    // ok, do we carry on forever?
                    if (path.forever) {
                        res = {};
                        res.description = path.name + ": " + "Route complete, carrying on forever";
                        res.demCourse = myState.demCourse;
                    }
                    else {
                        // ok, we're done.
                        path.complete = true;

                        // do we have a previous demanded speed?
                        if(path.oldDemSpeed)
                        {
                            res = {};
                            res.demSpeed = path.oldDemSpeed;
                        }
                    }
                }
            }
        }

        // just double check if we need to set height
        if (res) {
            // ok,  we have a demanded state. Do we have a demanded depth?
            if (path.height) {
                res.demHeight = path.height;
            }

            // does this path have a speed?
            if(path.speed)
            {
                if(!path.demSpeedAssigned) {

                    // ok, remember the old dem speed, for once we are complete
                    path.oldDemSpeed = myState.demSpeed;

                    // and set the speed for this path
                    res.demSpeed = path.speed;

                    // and remember that we've assigned it.
                    path.demSpeedAssigned = true;
                }
            }



        }

        return res;
    };

    var handleRectWander = function (tNow, myState, myDetections, thisB) {
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
                var bearing = geoMath.rhumbBearingFromTo(myState.location, centre);

                res = {};
                res.demCourse = bearing;

                // do we have a speed?
                if (thisB.speed) {
                    res.demSpeed = thisB.speed;
                }

                // do we have a demanded height?
                if (thisB.height) {
                    res.demHeight = thisB.height;
                }

                res.description = "Heading back to patrol area";
            }
        }

        return res;
    };

    var handleSnort = function (tNow, myState, myDetections, thisB) {
        var res;

        // is this battery powered?
        if (myState.batteryLevel) {

            // ok, is it enough?
            if (myState.batteryLevel < thisB.startLevel) {

                // hey, remember the previous depth, so we can return to it. Note: we also
                // use this as a flag to indicate that we're snorting
                if (!thisB.previousHeight) {
                    thisB.previousHeight = myState.height;
                }

                // ok, go to relevant depth
                res = {};
                res.demHeight = thisB.height;

                res.description = "Prepare to snort";

                // and insert snort flag
                if (!(myState.categories)) {
                    myState.categories = [];
                }
                if (!(geoMath.hasCategory("SNORT", myState.categories))) {
                    myState.categories.push("SNORT");
                }
            }
            else if (thisB.previousHeight) {

                res = {};
                res.description = "Snorting";

                // aah, we're already snorting. are we there yet?
                if (myState.batteryLevel > thisB.stopLevel) {

                    // ok, we're topped up. clear the snort
                    if (myState.categories) {
                        geoMath.removeCategory("SNORT", myState.categories);
                    }

                    if (myState.height != thisB.previousHeight) {
                        // and return to the previous depth (if necessary)
                        res.demHeight = thisB.previousHeight;
                        res.description = "Snort complete. Returning to depth";
                    }
                    else {
                        res.description = "Snort complete. Back at patrol depth";
                        // clear the height flag
                        delete thisB.previousHeight;
                    }
                }
            }
        }

        return res;
    };

    /**
     * Module API
     */
    return {
        doDecisions: function (tNow, myState, myDetections, myBehaviours) {

            var demState;

            if (myBehaviours) {
                // ok, loop through them
                var ctr = 0;

                while (ctr < myBehaviours.length && (!demState)) {
                    var thisB = myBehaviours[ctr];
                    ctr++;

                    demState = implementThis(tNow, myState, myDetections, thisB);
                }

                // clear any existing activity
                delete myState.description;

                // do we have something to do?
                if (demState) {
                    if (demState.demCourse) {
                        myState.demCourse = demState.demCourse;
                    }
                    if (demState.demSpeed) {
                        myState.demSpeed = demState.demSpeed;
                    }
                    if (demState.demHeight) {
                        myState.demHeight = demState.demHeight;
                    }
                    // a null description is valid - store it.
                    myState.description = demState.description;
                }
            }
            else {
                // it's probably just ownship. leave it alone
            }
        }
    }
}]);
