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
         * @param achievement the achievement to insert, if present
         * @param gameState the game state where successful achievements are stored.
         */
        var processAchievements = function (achievement, gameState) {
            if (achievement) {
                if (!gameState.achievements) {
                    gameState.achievements = [];
                }
                gameState.achievements.push(achievement);
            }
        };

        /** insert the supplied information into the game state narratives
         *
         * @param gameState
         * @param dateTime
         * @param location
         * @param message
         */
        var insertNarrative = function (gameState, dateTime, location, message) {
            if (!gameState.narratives) {
                gameState.narratives = [];
            }
            gameState.narratives.push({ "time": dateTime, "location": location, "message": message});
        };

        /** switchboard method that calls relevant observer handler
         *
         * @param gameState
         * @param objective
         * @param vessels
         */
        var handleThis = function (gameState, objective, vessels) {
            var thisType = objective.type;

            switch (thisType) {
                case "SEQUENCE":
                    handleSequence(gameState, objective, vessels);
                    break;
                case "PROXIMITY":
                    handleProximity(gameState, objective, vessels);
                    break;
                case "DISTANCE":
                    handleDistance(gameState, objective, vessels);
                    break;
                case "GAIN_CONTACT":
                    handleGainContact(gameState, objective, vessels);
                    break;
                case "MAINTAIN_CONTACT":
                    handleMaintainContact(gameState, objective, vessels);
                    break;
                case "ELAPSED":
                    handleElapsed(gameState, objective, vessels);
                    break;
                case "DESTROY_TARGET":
                    handleDestroyTarget(gameState, objective, vessels);
                    break;
                case "OBTAIN_SOLUTION":
                    handleObtainSolution(gameState, objective, vessels);
                    break;
            }


            // if the objective type isn't an "organisational" one, set the remaining time, if present
            if (objective.type != "SEQUENCE") {
                // just do a check for time remaining
                if (objective.stopTime) {
                    // ok, how long is remaiing?
                    var remaining = objective.stopTime - gameState.simulationTime;
                    gameState.remaining = geoMath.formatMillis(remaining);
                }
                else {
                    delete gameState.remaining;
                }
            }

            // was the action successful?
            // if the objective type isn't an "organisational" one, set the remaining time, if present
            if (objective.type != "SEQUENCE") {
                if (gameState.successMessage && objective.complete) {
                    // ok, is there a success action?
                    if (objective.successAction) {
                        console.log("doing action!!" + objective.name);
                        handleAction(gameState, vessels, objective.successAction);
                    }
                }
            }

        };

        /** switchboard method that calls relevant observer handler
         *
         * @param gameState
         * @param vessels
         * @param action
         */
        var handleAction = function (gameState, vessels, action) {
            var thisType = action.type;

            switch (thisType) {
                case "ACTIVATE_SONAR":
                    // get the vessel
                    var vessel = vessels[action.subject];

                    if (!vessel) {
                        Console.log("|| handleAction - failed to find vessel:" + action.subject);
                    }

                    // find the sonar
                    var sonar = _.find(vessel.sonars, function (sonar) {
                        return sonar.name = action.sonar
                    });

                    if (!sonar) {
                        Console.log("|| handleAction - failed to find sonar:" + action.sonar);
                    }

                    // activate?
                    if (action.disabled) {
                        // nope, mark it as disabled
                        sonar.disabled = true;
                    }
                    else {
                        // enabled, delete any disabled status
                        delete sonar.disabled;
                    }

                    // de-activate
                    break;
            }

        };


        var handleSequence = function (gameState, sequence, vessels) {
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
                    handleThis(gameState, child, vessels);

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
                        else {
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


        var handleObtainSolution = function (gameState, obtain, vessels) {
          var subjectName = obtain.subject;
          if (!subjectName) {
            subjectName = "Ownship";
          }
          var subject = vessels[subjectName];

          // does it have any solutions?
          _.each(subject.solutions, function(solution){
            // has this one been handled by us?
            if(!solution.obtainHandled)
            {
              solution.obtainHandled = true;

              if(!obtain.counter)
              {
                obtain.counter = 0;
              }

              obtain.counter ++;
            }
          });

          // ok, have we reached our limit
          if(obtain.counter >= obtain.count)
          {
            // ok, done.
            obtain.complete = true;
            gameState.successMessage = obtain.success;
            gameState.state = "DO_STOP";

            // and store any achievements
            processAchievements(obtain.achievement, obtain);

          }

        };

        var handleMaintainContact = function (gameState, maintainContact, vessels) {

            var subjectName = maintainContact.subject;
            if (!subjectName) {
                subjectName = "Ownship";
            }
            var subject = vessels[subjectName];

            // ok, have we gained contact on someone other than us
            var detections = subject.newDetections;

            var inContact;

            if (detections && detections.length > 0) {

                // ok, are any from a target?
                for (var i = 0; i < detections.length; i++) {
                    var thisD = detections[i];

                    if (thisD.source != subject.name) {

                        inContact = true;

                        // is this our first one?
                        if (!maintainContact.stopTime) {
                            maintainContact.stopTime = gameState.simulationTime + (maintainContact.elapsed * 1000);

                            insertNarrative(gameState, gameState.simulationTime, subject.state.location, "Gained contact with target, now maintaining");
                        }

                        // have we held contact for long enough
                        if (gameState.simulationTime >= maintainContact.stopTime) {
                            // great - we're done.
                            maintainContact.complete = true;

                            // clear the flag
                            delete maintainContact.stopTime;

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

                // clear the flag
                delete maintainContact.stopTime;

                // and store any achievements
                processAchievements(maintainContact.achievement, gameState);

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

                // clear the flag
                delete maintainContact.stopTime;

                insertNarrative(gameState, gameState.simulationTime, subject.state.location, "Lost contact with target");
            }
        };

        var handleGainContact = function (gameState, gainContact, vessels) {

            var subjectName = gainContact.subject;
            if (!subjectName) {
                subjectName = "Ownship";
            }
            var subject = vessels[subjectName];

            if (!gainContact.stopTime) {
                gainContact.stopTime = gameState.simulationTime + gainContact.elapsed * 1000;
            }

            // ok, have we gained contact on someone other than us
            var detections = subject.newDetections;

            if (detections && detections.length > 0) {
                // ok, are any from a target?
                for (var i = 0; i < detections.length; i++) {
                    var thisD = detections[i];

                    if (thisD.source != subject.name) {

                        // do we have a target name?
                        if (!gainContact.target || (gainContact.target && (gainContact.target === thisD.source))) {
                            gainContact.complete = true;

                            // clear the flag
                            delete gainContact.stopTime;

                            // great - we're done.
                            break;
                        }
                    }
                }
            }

            if (gainContact.complete) {
                // cool,handle the success
                gameState.successMessage = gainContact.success;
                gameState.state = "DO_STOP";

                // clear the flag
                delete gainContact.stopTime;

                // and store any achievements
                processAchievements(gainContact.achievement, gameState);

                insertNarrative(gameState, gameState.simulationTime, subject.state.location, "Gained contact with target");
            }

            if (!gainContact.complete) {

                if (gameState.simulationTime > gainContact.stopTime) {
                    // ok, game failure
                    gainContact.complete = true;
                    gameState.failureMessage = gainContact.failure;
                    gameState.state = "DO_STOP";

                    // clear the flag
                    delete gainContact.stopTime;

                    insertNarrative(gameState, gameState.simulationTime, subject.state.location, "Failed to gain contact with target");
                }
            }
        };

        var handleElapsed = function (gameState, elapsed) {
            // ok. do we know when this objective started?
            // NOTE: we use "silentStopTime" to it isn't caught by the "Time Remaining" handling.
            if (!elapsed.silentStopTime) {
                // no, better store it
                elapsed.silentStopTime = (gameState.simulationTime + (elapsed.time * 1000));
            }

            // right, just check if we have failed to reach our proximity in time
            if (gameState.simulationTime >= elapsed.silentStopTime) {
                elapsed.complete = true;
                gameState.successMessage = elapsed.success;
                gameState.state = "DO_STOP";

                // and store any achievements
                processAchievements(elapsed.achievement, gameState);
            }
        };

        var handleProximity = function (gameState, proximity, vessels) {

            var subjectName = proximity.subject;
            if (!subjectName) {
                subjectName = "Ownship";
            }
            var subject = vessels[subjectName];

            // right, do we have an elapsed time limit
            if (proximity.elapsed) {
                // ok. do we know when this objective started?
                if (!proximity.stopTime) {
                    // no, better store it
                    proximity.stopTime = gameState.simulationTime + (proximity.elapsed * 1000);
                }

                // hey, is there a bonus for time?
                if (proximity.bonusAchievementTime) {
                    if (!proximity.bonusStopTime) {
                        // no, better store it
                        proximity.bonusStopTime = gameState.simulationTime + (proximity.bonusAchievementTime * 1000);
                    }
                }
            }

            var dest = null;
            // ok, are we checking proximity to a location
            if (proximity.location) {
                dest = proximity.location;
            } else if (proximity.target) {
                var tgtVessel = vessels[proximity.target];
                if (!tgtVessel) {
                    console.log("TROUBLE - Don't have the target vessel in the scenario!");
                }
                dest = tgtVessel.state.location;
            }

            // where is v1
            var current = subject.state.location;

            // what's the range?
            var range = geoMath.rhumbDistanceFromTo(dest, current);

            if (range < proximity.range) {

                var failed = false;

                // do we have anything else to check?
                if (proximity.hasOwnProperty('course')) {
                    // what is o/s course?
                    var osCourse = subject.state.course;

                    var courseError = osCourse - proximity.course;

                    // trim to acceptable values
                    courseError = courseError % 360;

                    if (courseError > proximity.courseError) {
                        failed = true;
                    }
                }

                // ok, have we failed?
                if (proximity.maxSpeed) {
                    var osSpeed = subject.state.speed;

                    if (osSpeed > proximity.maxSpeed) {
                        failed = true;
                    }
                }

                // are we ok so far?
                if (!failed) {
                    proximity.complete = true;
                    gameState.successMessage = proximity.success;
                    gameState.state = "DO_STOP";

                    // clear the flag
                    delete proximity.stopTime;

                    // and store any achievements
                    processAchievements(proximity.achievement, gameState);

                    // hey, is there a bonus time?
                    if (proximity.bonusStopTime) {
                        // note: we're relying on the
                        if (gameState.simulationTime < proximity.bonusStopTime) {
                            processAchievements(proximity.bonusAchievement, gameState);
                        }
                    }

                    insertNarrative(gameState, gameState.simulationTime, subject.state.location, "Reached proximity threshold");

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

                        // clear the flag
                        delete proximity.stopTime;

                        insertNarrative(gameState, gameState.simulationTime, subject.state.location, "Failed to pass proximity threshold in time");
                    }
                }
            }
        };

        var handleDistance = function (gameState, distance, vessels) {

            var subject = vessels[distance.subject];

            if (!subject) {
                return;
            }

            // right, do we have an elapsed time limit
            if (distance.elapsed) {
                // ok. do we know when this objective started?
                if (!distance.stopTime) {
                    // no, better store it
                    distance.stopTime = gameState.simulationTime + (distance.elapsed * 1000);
                }

                // hey, is there a bonus for time?
                if (distance.bonusAchievementTime) {
                    if (!distance.bonusStopTime) {
                        // no, better store it
                        distance.bonusStopTime = gameState.simulationTime + (distance.bonusAchievementTime * 1000);
                    }
                }
            }

            var dest = null;
            // ok, are we checking distance to a location
            if (distance.location) {
                dest = distance.location;
            } else if (distance.target) {

                // aah, is the target ownship?
                var tgtVessel = vessels[distance.target];

                if (!tgtVessel) {
                    console.log("TROUBLE - Don't have the target vessel in the scenario!");
                }
                dest = tgtVessel.state.location;
            }

            // where is v1
            var current = subject.state.location;

            // what's the range?
            var range = geoMath.rhumbDistanceFromTo(dest, current);

            if (range < distance.range) {
                // ok, the target has encroached on the distance. failed.
                distance.complete = true;
                gameState.failureMessage = distance.failure;
                gameState.state = "DO_STOP";
                insertNarrative(gameState, gameState.simulationTime, subject.state.location, "Failed to stay outside the necessary range");

            }

            // right, just check if we have failed to reach our distance in time
            if (distance.stopTime) {
                if (gameState.simulationTime > distance.stopTime) {
                    // did we succeed on this step
                    if (distance.complete) {
                        // ok, let's allow the failure to continue
                    }
                    else {
                        // ok - the user has managed to stay outside the necessary range
                        distance.complete = true;
                        gameState.successMessage = distance.success;
                        gameState.state = "DO_STOP";

                        insertNarrative(gameState, gameState.simulationTime, subject.state.location, "Managed to stay outside the necessary range");

                        // and store any achievements
                        processAchievements(distance.achievement, gameState);

                        // hey, is there a bonus time?
                        if (distance.bonusStopTime) {
                            // note: we're relying on the
                            if (gameState.simulationTime < distance.bonusStopTime) {
                                processAchievements(distance.bonusAchievement, gameState);
                            }
                        }
                    }
                }
            }
        };


        var handleDestroyTarget = function (gameState, destroy, vessels) {

            if (!destroy.complete) {
                var subject = vessels[destroy.subject];
                var target = vessels[destroy.target];

                if (!target) {
                    // ok, must be dead. Win!
                    destroy.complete = true;
                    gameState.successMessage = destroy.success;
                    gameState.state = "DO_STOP";

                    insertNarrative(gameState, gameState.simulationTime, subject.state.location, "Managed to destroy target");

                    // and store any achievements
                    processAchievements(destroy.achievement, gameState);

                    // hey, is there a bonus time?
                    if (destroy.bonusStopTime) {
                        // note: we're relying on the
                        if (gameState.simulationTime < destroy.bonusStopTime) {
                            processAchievements(destroy.bonusAchievement, gameState);
                        }
                    }
                }
            }
        };


        // also any "other" handlers that keep things tidy
        var handleExpiredWeapon = function (gameState, vessels) {

            // check for any torpedoes
            _.each(vessels, function (vessel) {
                // ok, is it a torpedo?
                if (vessel.categories.type == "TORPEDO") {
                    // got one - when is it's expiry tme
                    if (vessel.expiresAt) {
                        if (gameState.simulationTime >= vessel.expiresAt) {

                            // ok, add it to the destroyed list
                            if (!gameState.destroyed) {
                                gameState.destroyed = [];
                            }
                            gameState.destroyed.push(vessel);
                        }
                    }
                }
            });
        };

        var handleWeaponDetonation = function (gameState, vessels) {
            // check for any torpedoes
            _.each(vessels, function (vessel) {
                // ok, is it a torpedo?
                if (vessel.categories.type == "TORPEDO") {
                    // got one - when is it's expiry tme

                    var myForce = vessel.categories.force;

                    // now, loop through for opposing vessels
                    _.each(vessels, function (target) {
                        // ok, is it a torpedo?
                        if (target.categories.force != myForce) {
                            // got one - how far away are we?
                            var range = geoMath.rhumbDistanceFromTo(target.state.location, vessel.state.location);

                            // in range?
                            if (range < vessel.effectiveRadius) {
                                gameState.successMessage = "You have destroyed " + target.name;
                                gameState.state = "DO_PAUSE";

                                if (!gameState.destroyed) {
                                    gameState.destroyed = [];
                                }

                                // add a new property (flag) to use it in "leafletMap" directive
                                vessel.wasDestroyed = vessel.name;

                                gameState.destroyed.push(vessel);
                                gameState.destroyed.push(target);

                            }
                        }
                    });

                }
            });

        };


        var handleNewSolutions = function (gameState, vessels) {
            _.each(vessels, function (vessel) {
                _.each(vessel.solutions, function (solution) {
                    if (!solution.recorded) {
                        solution.recorded = true;
                        insertNarrative(gameState, solution.time, solution.location, "New Solution from " + vessel.name);
                    }
                });
            });
        };

        var handleTargetsDestroyed = function (gameState, vessels, deadVessels) {
            _.each(gameState.destroyed, function (vessel) {
                destroyVessel(vessels, vessel.name, deadVessels);
            });
            // and empty out that array
            gameState.destroyed = [];
        };

        /** handle vessel destruction
         *
         * @param vessels the list of vessels
         * @param name name of the vessel to delete
         * @param deadVessels the list of dead vessels
         */
        var destroyVessel = function (vessels, name, deadVessels) {
            // put it into our dead list
            deadVessels[name] = vessels[name];

            // and remove it from the live list
            delete vessels[name];
        };

        /** handle the request to fire a weapon
         *
         * @param action
         * @param vessel
         * @param vessels
         */
        var handleFireWeapon = function (action, vessel, vessels) {
            // right, where is it starting from?
            var location = angular.copy(vessel.state.location);

            // and what is the bearing to go down?
            var course = action.course;

            // create the weapon
            var weapon = action.template;

            // fill in the missing bits
            weapon.name = action.name;
            weapon.state.time = vessel.state.time;
            weapon.state.location = location;
            weapon.state.course = course;
            weapon.state.demCourse = course;

            // calculate the weapon dead time
            weapon.expiresAt = vessel.state.time + (weapon.duration * 1000);

            // and store it
            vessels[weapon.name] = weapon;
        };

        /** loop through the set of actions
         *
         * @param vessel
         * @param vessels
         */
        var handleActions = function (vessel, vessels) {
            var actions = vessel.state.actions;
            if (actions) {
                var toRemove = [];
                _.each(actions, function (action) {
                    switch (action.type) {
                        case "FIRE_WEAPON":
                            handleFireWeapon(action, vessel, vessels);
                            toRemove.push(action);
                            break;
                        default:
                            break;
                    }
                });

                // and ditch any completed actions
                vessel.state.actions = _.difference(actions, toRemove);
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
             * @param vessels the current vessel states (ownship and others)
             * @param deadVessels the list of dead vessels
             */
            doObjectives: function (gameState, objectives, vessels, deadVessels) {

                // handle any pending actions first
                _.each(vessels, function (vessel) {
                    handleActions(vessel, vessels);
                });

                // ok, loop through the objectives
                _.each(objectives, function (item) {
                    if (!item.complete) {
                        handleThis(gameState, item, vessels)
                    }
                });

                // also any "other" handlers that keep things tidy
                handleNewSolutions(gameState, vessels);
                handleTargetsDestroyed(gameState, vessels, deadVessels);
                handleExpiredWeapon(gameState, vessels);
                handleWeaponDetonation(gameState, vessels);


            }
        }
    }
    ])
;