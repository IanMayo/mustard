/**
 * @module Decision
 */

angular.module('mustard.game.decision', ['mustard.game.geoMath'])

/**
 * @module Decision
 * @class Service
 * @description Decision service
 */

.service('decision', 'geoMath', function (geoMath) {

    var implementThis = function (tNow, myState, myDetections, thisB) {
        var res;
        switch (thisB.type) {
            case "RECTANGLE_WANDER":
                res = handleRectWander(tNow, myState, myDetections, thisB);
                break;
            case "SNORT":
                res = handleSnort(tNow, myState, myDetections, thisB);
                break;
            case "xxx.dev.yyy.com":
                // Blah
                break;
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

                    if(myState.height != thisB.previousHeight)
                    {
                        // and return to the previous depth (if necessary)
                        res.demHeight = thisB.previousHeight;
                        res.description = "Snort complete. Returning to depth";
                    }
                    else
                    {
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
});
