/**
 * @module Objectives
 */

angular.module('mustard.game.objectives', ['mustard.game.geoMath'])

/**
 * @module Objectives
 * @class Service
 * @description Game objectives
 */

.service('objectives', ['geoMath', function (geoMath) {


    /** on the presumption that the objective was successful, insert the
     * relevant achievement
     *
     * @param objective the objective that contains the achievements
     * @param gameState the game state where successful achievements are stored.
     */
    var processAchievements = function(objective, gameState)
    {
        if(objective.achievement)
        {
            if(!gameState.achievements)
            {
                gameState.achievements = [];
            }
            gameState.achievements.push(objective.achievement);
        }
    };

    /** insert the supplied information into the game state narratives
     *
     * @param gameState
     * @param dateTime
     * @param location
     * @param message
     */
    var insertNarrative = function(gameState, dateTime, location, message)
    {
        if(!gameState.narratives)
        {
            gameState.narratives = [];
        }
        gameState.narratives.push({ "dateTime" : dateTime, "location" : location, "message" : message});
    };

    /** switchboard method that calls relevant observer handler
     *
     * @param gameState
     * @param objective
     * @param vesselsState
     */
    var handleThis = function (gameState, objective, vesselsState) {
        var thisType = objective.type;

        switch (thisType) {
            case "SEQUENCE":
                handleSequence(gameState, objective, vesselsState);
                break;
            case "PROXIMITY":
                handleProximity(gameState, objective, vesselsState);
                break;
            case "GAIN_CONTACT":
                handleGainContact(gameState, objective, vesselsState);
                break;
            case "MAINTAIN_CONTACT":
                handleMaintainContact(gameState, objective, vesselsState);
                break;
            case "START_MISSION":
                handleStartMission(gameState, objective, vesselsState);
                break;
        }
    };

    var handleSequence = function (gameState, sequence, vesselsState) {
        var thisId = 0;
        var STOP_CHECKING = false;  // flag for if an object hasn't been reached yet

        // loop through all, or until we don't get a result object
        do
        {
            // get the next child
            var child = sequence.children[thisId];

            // is this one complete?
            if (!(child.complete)) {
                // ok, run it
                handleThis(gameState, child, vesselsState);

                // did it finish?
                if (child.complete) {
                    // OK. For a sequence we have to override the game state setting.
                    // this is because a STOP is actually a PAUSE if we're not at the last one yet.

                    // is this the last one?  If it's not we  will switch
                    // a stop instruction to a pause one
                    if (((thisId + 1) == sequence.children.length) || (gameState.failureMessage)) {
                        // ok, this is the last one. we can do an actual stop
                        gameState.state = "DO_STOP";
                    }
                    else{
                        gameState.state = "DO_PAUSE";
                    }
                }
                else {
                    // that one isn't ready. move on
                    STOP_CHECKING = true;
                }
            }
            else {
                // don't worry - move on the next one
            }

            // move to the next child
            thisId++;
        }
        while ((thisId < sequence.children.length) && (!STOP_CHECKING));
    };

    var handleMaintainContact = function (gameState, maintainContact, vesselsState) {

        var ownShip = vesselsState.ownShip;

        // ok, have we gained contact on someone other than us
        var detections = ownShip.newDetections;

        var inContact;

        if (detections && detections.length > 0) {

            // ok, are any from a target?
            for (var i = 0; i < detections.length; i++) {
                var thisD = detections[i];

                if (thisD.source != ownShip.name) {

                    inContact = true;

                    // is this our first one?
                    if (!maintainContact.stopTime) {
                        maintainContact.stopTime = gameState.simulationTime + (maintainContact.elapsed * 1000);

                        insertNarrative(gameState, gameState.simulationTime, ownShip.state.location, "Gained contact with target, now maintaining");
                    }

                    // have we held contact for long enough
                    if (gameState.simulationTime >= maintainContact.stopTime) {
                        // great - we're done.
                        maintainContact.complete = true;
                        break;
                    }
                }
            }
        }

        // did we just finish?
        if (maintainContact.complete) {
            // cool,handle the success
            gameState.successMessage = maintainContact.success;
            gameState.state = "DO_STOP";
            maintainContact.complete = true;

            // and store any achievements
            processAchievements(maintainContact, gameState);

        }

        if (!maintainContact.complete && ((maintainContact.stopTime && !inContact) || (gameState.simulationTime > maintainContact.stopTime))) {
            // ok, game failure
            maintainContact.complete = true;

            // how many minutes did we trail for?
            var elapsedMins = (gameState.simulationTime - (maintainContact.stopTime - (maintainContact.elapsed * 1000))) / 1000 / 60;

            // inject the elapsed time message
            var failMessage = maintainContact.failure;
            failMessage = failMessage.replace("[time]", "" + Math.floor(elapsedMins));
            gameState.failureMessage = failMessage;
            gameState.state = "DO_STOP";
            insertNarrative(gameState, gameState.simulationTime, ownShip.state.location, "Lost contact with target");
        }
    };

    var handleGainContact = function (gameState, gainContact, vesselsState) {

        var ownShip = vesselsState.ownShip;

        if (!gainContact.stopTime) {
            gainContact.stopTime = gameState.simulationTime + gainContact.elapsed * 1000;
        }

        // ok, have we gained contact on someone other than us
        var detections = ownShip.newDetections;

        if (detections && detections.length > 0) {
            // ok, are any from a target?
            for (var i = 0; i < detections.length; i++) {
                var thisD = detections[i];

                if (thisD.source != ownShip.name) {
                    gainContact.complete = true;
                    // great - we're done.
                    break;
                }
            }
        }

        if (gainContact.complete) {
            // cool,handle the success
            gameState.successMessage = gainContact.success;
            gameState.state = "DO_STOP";

            // and store any achievements
            processAchievements(gainContact, gameState);

            insertNarrative(gameState, gameState.simulationTime, ownShip.state.location, "Gained contact with target");
        }

        if (!gainContact.complete) {

            if (gameState.simulationTime > gainContact.stopTime) {
                // ok, game failure
                gainContact.complete = true;
                gameState.failureMessage = gainContact.failure;
                gameState.state = "DO_STOP";
                insertNarrative(gameState, gameState.simulationTime, ownShip.state.location, "Failed to gain contact with target");

            }
        }

    };


    var handleStartMission = function (gameState, startMission, vesselsState) {

        // and store any achievements
        processAchievements(startMission, gameState);

        startMission.complete = true;
    };

    var handleProximity = function (gameState, proximity, vesselsState) {
        var ownShip = vesselsState.ownShip;

        // right, do we have an elapsed time limit
        if (proximity.elapsed) {
            // ok. do we know when this objective started?
            if (!proximity.stopTime) {
                // no, better store it
                proximity.stopTime = gameState.simulationTime + (proximity.elapsed * 1000);
            }
        }
        // ok, where has he got to get to?
        var dest = proximity.location;

        // where is v1
        var current = ownShip.state.location;

        // what's the range?
        var range = geoMath.rhumbDistanceFromTo(dest, current);

        if (range < proximity.range) {

            var failed = false;

            // do we have anything else to check?
            if (proximity.hasOwnProperty('course')) {
                // what is o/s course?
                var osCourse = ownShip.state.course;

                var courseError = osCourse - proximity.course;

                // trim to acceptable values
                courseError = courseError % 360;

                if (courseError > proximity.courseError) {
                    failed = true;
                }
            }

            // ok, have we failed?
            if (proximity.maxSpeed) {
                var osSpeed = ownShip.state.speed;

                if (osSpeed > proximity.maxSpeed) {
                    failed = true;
                }
            }

            // are we ok so far?
            if (!failed) {
                proximity.complete = true;
                gameState.successMessage = proximity.success;
                gameState.state = "DO_STOP";

                // and store any achievements
                processAchievements(proximity, gameState);

                insertNarrative(gameState, gameState.simulationTime, ownShip.state.location, "Reached proximity threshold");
            }
        }


        // right, just check if we have failed to reach our proximity in time
        if (proximity.stopTime) {
            if (gameState.simulationTime > proximity.stopTime) {
                // did we succeed on this step
                if (proximity.complete) {
                    // ok, let's allow the success
                }
                else {
                    // ok, game failure
                    proximity.complete = true;
                    gameState.failureMessage = proximity.failure;
                    gameState.state = "DO_STOP";

                    insertNarrative(gameState, gameState.simulationTime, ownShip.state.location, "Failed to pass proximity threshold in time");
                }
            }
        }
    };

    /**
     * Module API
     */
    return {
        /**
         *
         * @param gameState the current game state
         * @param objectives the array of objectives
         * @param vesselsState the current vessel states (ownship and others)
         */
        doObjectives: function (gameState, objectives, vesselsState) {

            // ok, loop through the objectives
            _.each(objectives, function (item) {
                handleThis(gameState, item, vesselsState)
            });
        }
    }
}]);