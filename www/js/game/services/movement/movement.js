/**
 * @module Movement
 */

angular.module('mustard.game.movement', ['mustard.game.geoMath'])

/**
 * @module Movement
 * @class Service
 * @description Physics movement simulation
 */

.service('movement', ['geoMath', function (geoMath) {

    /** calculate new height
     *
     * @param curHeight  (m)
     * @param dHeight   (m)
     * @param climbRate  (m/s)
     * @param diveRate   (m/s)
     * @param secs max time allowed (s)
     * @returns {number} height at end of step
     */
    var calcNewHeight = function (curHeight, dHeight, climbRate, diveRate, secs) {
        var heightDelta = dHeight - curHeight;
        var newHeight;

        // see if it's a trivial height change
        if (Math.abs(heightDelta) < 0.01) {
            // trivial, just jump to it
            newHeight = dHeight;
        }
        else {
            // calculate how far we get
            var changeRate;
            if (heightDelta > 0) {
                changeRate = climbRate;
            }
            else {
                changeRate = -diveRate;
            }

            var heightChangeTime = heightDelta / changeRate;

            heightChangeTime = Math.min(heightChangeTime, secs);

            newHeight = curHeight + heightChangeTime * changeRate;
        }
        return newHeight;


    };

    /** calculate new speed
     *
     * @param curSpeed  current speed (m/s)
     * @param demSpeed demanded speed (m/s)
     * @param accelerationRate  (m/s/s)
     * @param decelerationRate  (m/s/s)
     * @param timeDelta  max time allowed (s)
     * @returns {number} speed at end of time step
     */
    var calcNewSpeed = function (curSpeed, demSpeed, accelerationRate, decelerationRate, timeDelta) {
        var speedDelta = demSpeed - curSpeed;
        var newSpeed;

        // see if it's a trivial speed change
        if (Math.abs(speedDelta) < 0.01) {
            // trivial, just jump to it
            newSpeed = demSpeed;
        }
        else {
            // calculate how far we get
            var changeRate;
            if (speedDelta > 0) {
                changeRate = accelerationRate;
            }
            else {
                changeRate = -decelerationRate;
            }

            var speedChangeTime = speedDelta / changeRate;

            speedChangeTime = Math.min(speedChangeTime, timeDelta);

            newSpeed = curSpeed + speedChangeTime * changeRate;
        }
        return newSpeed;
    };

    /** calcualte new course
     *
     * @param curCourse (degs)
     * @param demCourse  (degs)
     * @param turnRadius  (m)
     * @param speed      (m/s)
     * @param timeDelta  (s)
     * @returns {number} course at end of step (degs)
     */
    var calcNewCourse = function (curCourse, demCourse, turnRadius, speed, timeDelta) {
        // put the dem course in the +ve domain
        if (demCourse < 0) {
            demCourse += Math.PI * 2;
        }

        // and calculate the delta
        var courseDelta = demCourse - curCourse;

        // put the course delta into the +/- 180 domain
        if (courseDelta > Math.PI) {
            courseDelta -= 2 * Math.PI;
        }
        if (courseDelta < -Math.PI) {
            courseDelta += 2 * Math.PI;
        }

        var newCourse;

        // see if it's a trivial course change
        if (Math.abs(courseDelta) < 0.01) {
            // trivial, just jump to it
            newCourse = demCourse;
        }
        else {
            // calculate new course
            var turnRate = speed / turnRadius;

            // are we going left or right?
            if (courseDelta < 0)
                turnRate *= -1;

            var turnTime = courseDelta / turnRate;
            turnTime = Math.min(turnTime, timeDelta);

            newCourse = curCourse + turnTime * turnRate;

            if (newCourse < 0) {
                newCourse += Math.PI * 2;
            }

            // if we're very close to the dem course, just use the dem course
            if (Math.abs(newCourse - demCourse) < 0.0001) {
                newCourse = demCourse;
            }
        }
        return newCourse;
    };

    /** calculate how far forward the vessel will go in the time specified
     *
     * @param time (s)
     * @param speed  (m/s)
     * @param course  (degs)
     * @param movement  (placeholder)
     */
    var doStraight = function (time, speed, course, movement) {
        movement.deltaLong += speed * time * Math.sin(course);
        movement.deltaLat += speed * time * Math.cos(course);
    };

    /**
     * Module API
     */
    return {
        /** handle the movement for this vessel
         *
         * @param newTime  time at the end of this step (secs)
         * @param curState the current vessel status
         * @param vPerf  the performance for this vessel
         */
        doMove: function (newTime, curState, vPerf) {

            var oldTime = curState.time;
            var timeDelta = (newTime - oldTime) / 1000.0;
            var curSpeed = curState.speed;
            var curCourseRads = geoMath.toRads(curState.course);
            var curHeight = curState.height;
            var demSpeed = curState.demSpeed;
            var demCourseRads = geoMath.toRads(curState.demCourse);
            var demHeight = curState.demHeight;

            var movement = {deltaLat: 0.0, deltaLong: 0.0, deltaHeight: 0.0};

            var maxSpeed = vPerf.maxSpeed;
            var minSpeed = vPerf.minSpeed;

            // trim the demanded speed
            demSpeed = Math.min(demSpeed, maxSpeed);
            demSpeed = Math.max(demSpeed, minSpeed);

            // sort out the new height
            curHeight = calcNewHeight(curHeight, demHeight, vPerf.climbRate, vPerf.diveRate, timeDelta);

            // now for the acceleration
            var speedDelta = demSpeed - curSpeed;
            if (speedDelta < 0.01) {
                // ok, just jump to the new course
                curSpeed = demSpeed;
            }
            else {
                // ok, calculate how long we need to change speed
                curSpeed = calcNewSpeed(curSpeed, demSpeed, vPerf.accelerationRate, vPerf.decelerationRate, timeDelta);
            }

            // what was the mean speed during the time step?
            var meanSpeed = curSpeed - (speedDelta / 2);

            // just double check that we always get +ve speed
            meanSpeed = Math.max(0, meanSpeed);

            // remember the previous course
            var oldCourseRads = curCourseRads;

            // calcualate the new course
            curCourseRads = calcNewCourse(curCourseRads, demCourseRads, vPerf.turnRadius, meanSpeed, timeDelta);

            // work out the mean course
            var newCourseDelta = curCourseRads - oldCourseRads;
            if(newCourseDelta > Math.PI)
            {
                newCourseDelta -= Math.PI * 2;
            }
            var meanCourseRads = oldCourseRads + (newCourseDelta) / 2;

            // do we know battery usage?
            if(vPerf.batteryUsage)
            {
                if(curState.batteryLevel)
                {
                    curState.batteryLevel -= timeDelta * vPerf.batteryUsage * meanSpeed;

                    // oops, just check if we are recharging
                    if(curHeight > -20)
                    {
                        // yes, charging
                        curState.batteryLevel += timeDelta * vPerf.chargeRate;
                    }

                    // trim to sensible limits. Note - we don't use zero for level, since it fails the
                    // curState.batteryLevel test above.

                    curState.batteryLevel = Math.min(100, curState.batteryLevel);
                    curState.batteryLevel = Math.max(0.01, curState.batteryLevel);

                    // just check that the battery isn't dead
                    if(curState.batteryLevel < 0.1)
                    {
                        // yes, slow to a stop!
                        curSpeed = 0;
                    }
                }
            }

            // and now move  (note: speed may be zero if the battery is empty)
            doStraight(timeDelta, curSpeed, meanCourseRads, movement);

            // update the state object
            // get range bearing form deltaLat/deltaLong
            var bearingRads = Math.atan2(movement.deltaLong, movement.deltaLat);
            var rangeM = Math.sqrt(movement.deltaLong*movement.deltaLong + movement.deltaLat*movement.deltaLat);
            curState.location = geoMath.rhumbDestinationPoint(curState.location, bearingRads, rangeM);


            curState.time = newTime;
            curState.height = curHeight;
            curState.course = geoMath.toDegs(curCourseRads);
            curState.speed = curSpeed;
            curState.demCourse = geoMath.toDegs(demCourseRads);
            curState.demSpeed = demSpeed;
            curState.demHeight = demHeight;
        }
    };
}]);